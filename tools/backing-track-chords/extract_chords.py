#!/usr/bin/env python3
"""Editorial-only MIDI harmony -> audio-time FretLab ChordEvents."""
import argparse
import csv
import hashlib
import json
import os
from pathlib import Path
import sys

import numpy as np

from midi_harmony import read_midi, vocabulary, note_chroma, chord_scores, smooth, segments
from alignment import audio_chroma, fit_affine, mapped_output, boundary_diagnostics, normalize
from track_files import resolve_track, load_existing, editorial_fields, midi_bpm, build_track, atomic_write_track


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False) + '\n', encoding='utf-8')


def debug_plot(path, midi_times, midi, audio_times, audio, candidate, scale, offset, coverage):
    os.environ.setdefault('MPLCONFIGDIR', str(Path(__file__).resolve().parent / '.cache' / 'matplotlib'))
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    figure, axes = plt.subplots(3, 1, figsize=(18, 10), constrained_layout=True)
    for axis, times, values, title in (
        (axes[0], scale * midi_times + offset, midi, 'MIDI chroma mapped to audio time'),
        (axes[1], audio_times, audio, 'Audio harmonic chroma (HPSS + CQT)'),
    ):
        axis.pcolormesh(times, np.arange(12), normalize(values).T, shading='nearest', cmap='magma')
        axis.set(title=title, ylabel='Pitch class', xlim=(0, audio_times[-1]))
        axis.axvline(coverage / 1000, color='cyan', linestyle='--', label='MIDI coverage end')
        for item in candidate:
            start = scale * item['midiStartMs'] / 1000 + offset
            axis.axvline(start, color='white', alpha=0.4, linewidth=0.6)
        axis.legend(loc='upper right')
    axes[2].plot(midi_times, (scale - 1) * midi_times + offset)
    axes[2].set(title=f'Affine time correction: scale={scale:.8f}, offset={offset * 1000:.1f} ms',
                xlabel='MIDI time (s)', ylabel='Audio time - MIDI time (s)')
    figure.savefig(path, dpi=140)
    plt.close(figure)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--harmony', type=Path, required=True)
    parser.add_argument('--bass', type=Path)
    parser.add_argument('--track-id')
    parser.add_argument('--tracks-root', type=Path)
    parser.add_argument('--title')
    parser.add_argument('--style')
    parser.add_argument('--key')
    parser.add_argument('--bpm', type=float)
    parser.add_argument('--audio', type=Path, help='Legacy standalone analysis mode only')
    parser.add_argument('--output', type=Path, help='Legacy standalone analysis mode only')
    parser.add_argument('--debug-dir', type=Path)
    parser.add_argument('--step', type=float, default=0.1, help='MIDI window seconds (0.025 to 0.25)')
    parser.add_argument('--change-penalty', type=float, default=0.65)
    parser.add_argument('--bass-weight', type=float, default=0.65)
    parser.add_argument('--scale-bounds', type=float, nargs=2, default=(0.95, 1.05))
    parser.add_argument('--offset-bounds', type=float, nargs=2, default=(-5, 5), metavar=('MIN', 'MAX'))
    parser.add_argument('--qualities', nargs='+', default=['major', 'minor', '7', 'm7'])
    parser.add_argument('--no-plot', action='store_true')
    args = parser.parse_args(argv)
    if (not np.isfinite([args.step, args.change_penalty, args.bass_weight]).all()
            or not 0.025 <= args.step <= 0.25 or args.change_penalty < 0 or args.bass_weight < 0):
        parser.error('Invalid window or scoring parameters')
    for bounds in (args.scale_bounds, args.offset_bounds):
        if not np.isfinite(bounds).all() or bounds[0] >= bounds[1]:
            parser.error('Bounds must be finite and increasing')
    if args.scale_bounds[0] <= 0:
        parser.error('Scale must be positive')
    files = None
    metadata = None
    original = None
    if args.track_id is not None or args.tracks_root is not None:
        if args.track_id is None or args.tracks_root is None:
            parser.error('--track-id and --tracks-root must be provided together')
        if any(value is not None for value in (args.audio, args.output, args.debug_dir)):
            parser.error('Track mode resolves audio/output/_analysis automatically; omit --audio, --output, --debug-dir')
        files = resolve_track(args.tracks_root, args.track_id)
        existing = load_existing(files.output, files.identifier)
        original = files.output.read_bytes() if existing is not None else None
        metadata = editorial_fields(existing, {key: getattr(args, key) for key in ('title', 'style', 'key', 'bpm')})
        args.audio, args.output, args.debug_dir = files.backing, files.output, files.debug
        if files.debug.resolve().parent != files.folder or files.debug.is_symlink():
            parser.error('_analysis must remain inside the track directory')
    else:
        if args.audio is None or args.output is None:
            parser.error('Provide --track-id/--tracks-root, or legacy --audio/--output')
        if any(getattr(args, field) is not None for field in ('title', 'style', 'key', 'bpm')):
            parser.error('Editorial metadata requires --track-id/--tracks-root')
    # Public output is permitted only through the strict shared-track contract.
    root = Path(__file__).resolve().parents[2]
    debug = args.debug_dir or args.output.parent
    destinations = [args.output, debug / 'debug.csv', debug / 'midi-candidate.json',
                    debug / 'timing-checks.json', debug / 'alignment-debug.png']
    sources = [p.resolve() for p in (args.harmony, args.bass, args.audio,
                                    files.example if files else None) if p is not None]
    for destination in destinations:
        resolved = destination.resolve()
        if (resolved in sources or resolved.is_relative_to(root / 'src')
                or (files is None and resolved.is_relative_to(root / 'public'))
                or (files is not None and not resolved.is_relative_to(files.folder))):
            parser.error('Output cannot overwrite inputs or escape the permitted output directory')
    if len({p.resolve() for p in destinations}) != len(destinations):
        parser.error('Output and debug filenames must be distinct')
    print('Reading MIDI...', flush=True)
    harmony, duration, repairs = read_midi(args.harmony)
    bass, bass_duration, bass_repairs = read_midi(args.bass) if args.bass else ([], None, 0)
    edges = np.r_[np.arange(0, duration, args.step), duration]
    centers = (edges[:-1] + edges[1:]) / 2
    harmonic_values = note_chroma(harmony, edges)
    bass_values = note_chroma(bass, edges)
    candidates = vocabulary(args.qualities)
    scores = chord_scores(harmonic_values, bass_values, candidates, args.bass_weight)
    path = smooth(scores, args.step, args.change_penalty)
    candidate = segments(path, scores, edges, candidates)
    print(f'MIDI: {duration:.6f} s; {repairs + bass_repairs} invalid key signature(s) neutralized; '
          f'{len(candidate)} candidate chords', flush=True)
    print('Computing audio HPSS/chroma...', flush=True)
    audio_times, audio_values, audio_duration = audio_chroma(str(args.audio))
    midi_values = harmonic_values + bass_values * 0.6
    print('Estimating affine alignment...', flush=True)
    scale, offset, similarity = fit_affine(centers, midi_values, audio_times, audio_values,
                                         args.scale_bounds, args.offset_bounds)
    output = mapped_output(candidate, duration, audio_duration, scale, offset, similarity)
    checks = boundary_diagnostics(candidate, scale, offset, audio_times, audio_values)
    warnings = []
    if similarity < 0.65:
        warnings.append('Low chroma similarity: alignment requires review.')
    if any(abs(value - bound) < (bounds[1] - bounds[0]) * 0.01
           for value, bounds in ((scale, args.scale_bounds), (offset, args.offset_bounds)) for bound in bounds):
        warnings.append('Alignment near search boundary: widen bounds and inspect aliases.')
    if output['chordCoverageEndMs'] > audio_duration * 1000:
        warnings.append('Transformed MIDI end exceeds audio duration; events clipped to audio, coverage remains transformed MIDI end.')
    if bass_duration is not None and abs(bass_duration - duration) > 0.25:
        warnings.append('Bass/harmony durations differ: coverage follows harmony MIDI only.')
    bad = [row for row in checks if row['deltaMs'] is None or abs(row['deltaMs']) > 250]
    if bad:
        confident = sum(row['confidence'] >= 0.65 for row in bad)
        warnings.append(f'{len(bad)} boundaries ({confident} with confidence >=0.65) have no nearby peak or >250 ms residual; inspect timing-checks.json.')
    output['analysis'] = dict(schemaVersion=1, method='MIDI Viterbi + audio HPSS/CQT affine',
                              windowMs=args.step * 1000, changePenalty=args.change_penalty,
                              bassWeight=args.bass_weight, qualities=args.qualities,
                              scaleBounds=list(args.scale_bounds), offsetBounds=list(args.offset_bounds),
                              invalidKeySignatures=repairs + bass_repairs, warnings=warnings,
                              inputs={p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                                      for p in (args.harmony, args.bass, args.audio) if p is not None})
    args.output.parent.mkdir(parents=True, exist_ok=True)
    debug.mkdir(parents=True, exist_ok=True)
    track = None
    if files:
        estimated = midi_bpm(args.harmony, scale) if 'bpm' not in metadata else None
        track = build_track(files.identifier, metadata, output, estimated)
    write_json(debug / 'midi-candidate.json', candidate)
    write_json(debug / 'timing-checks.json', checks)
    with (debug / 'debug.csv').open('w', newline='', encoding='utf-8') as stream:
        writer = csv.writer(stream)
        writer.writerow(['midiStart', 'midiEnd', 'audioStart', 'audioEnd', 'chord', 'confidence'])
        for item in candidate:
            mapped = mapped_output([item], duration, audio_duration, scale, offset, similarity)['chords']
            if mapped:
                event = mapped[0]
                writer.writerow([item['midiStartMs'] / 1000, item['midiEndMs'] / 1000,
                                 event['startMs'] / 1000, event['endMs'] / 1000, item['symbol'], item['confidence']])
    if not args.no_plot:
        debug_plot(debug / 'alignment-debug.png', centers, midi_values, audio_times, audio_values,
                   candidate, scale, offset, output['chordCoverageEndMs'])
    if files:
        current = files.output.read_bytes() if files.output.exists() else None
        if current != original:
            raise ValueError('Track JSON changed during analysis; refusing to overwrite editorial changes')
        atomic_write_track(files.output, track, files.identifier)
        print(f'Track: {files.identifier}\nBacking: {files.backing.name}\nExample: {files.example.name}'
              f'\nJSON: {files.output.name}\nDuration: {track["durationMs"]} ms'
              f'\nChord coverage: {track["chordCoverageEndMs"]} ms\nChords: {len(track["chordTimeline"])}'
              f'\nAlignment scale: {scale:.9f}\nOffset: {offset * 1000:.3f} ms\nMean similarity: {similarity:.6f}')
    else:
        write_json(args.output, output)
    print(f'Alignment:\nscale = {scale:.9f}\noffsetMs = {offset * 1000:.3f}\nmeanSimilarity = {similarity:.6f}')
    print(f'Audio duration = {audio_duration:.6f} s\nchordCoverageEndMs = {output["chordCoverageEndMs"]}'
          f'\nChordEvents = {len(output["chords"])}\nFirst 20 ChordEvents:')
    print(json.dumps(output['chords'][:20], indent=2))
    print('Timing checks (audio novelty proxies, require listening):')
    for row in sorted(checks, key=lambda row: -row['confidence'])[:12]:
        print(json.dumps(row))
    if bad:
        print('Boundaries requiring temporal review:')
        for row in bad:
            print(json.dumps(row))
    for warning in warnings:
        print('REVIEW: ' + warning)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, OSError) as error:
        print(f'Error: {error}', file=sys.stderr)
        sys.exit(1)
