"""Chroma-based affine alignment. Audio is evidence for time, never new chords."""
import numpy as np
from scipy.ndimage import gaussian_filter1d
from scipy.optimize import differential_evolution, minimize
from scipy.signal import find_peaks


def normalize(chroma):
    return chroma / np.maximum(np.linalg.norm(chroma, axis=1, keepdims=True), 1e-12)


def audio_chroma(path, sample_rate=22050, hop=512):
    import librosa
    samples, sr = librosa.load(path, sr=sample_rate, mono=True)
    if not len(samples) or np.max(np.abs(samples)) < 1e-8:
        raise ValueError('Audio is empty or silent')
    harmonic = librosa.effects.harmonic(samples, margin=3.0)
    chroma = librosa.feature.chroma_cqt(y=harmonic, sr=sr, hop_length=hop)
    times = librosa.frames_to_time(np.arange(chroma.shape[1]), sr=sr, hop_length=hop)
    return times, chroma.T, len(samples) / sr


def fit_affine(midi_times, midi_chroma, audio_times, audio_values,
               scale_bounds=(0.95, 1.05), offset_bounds=(-5.0, 5.0)):
    midi = normalize(midi_chroma)
    audio = normalize(audio_values)
    active = np.linalg.norm(midi_chroma, axis=1) > 1e-8
    if active.sum() < 10:
        raise ValueError('Not enough MIDI evidence for alignment')
    times, target = midi_times[active], midi[active]
    # Salient harmonic changes receive extra weight, without ignoring sustain.
    novelty = np.r_[0, np.linalg.norm(np.diff(midi, axis=0), axis=1)][active]
    weights = 1 + 2 * novelty

    def objective(parameters):
        scale, offset = parameters
        mapped = scale * times + offset
        sampled = np.column_stack([np.interp(mapped, audio_times, audio[:, pc], left=0, right=0) for pc in range(12)])
        similarity = (target * normalize(sampled)).sum(axis=1)
        # Outside audio remains zero; never improve fit by dropping endpoints.
        return -float(np.average(similarity, weights=weights))

    bounds = [scale_bounds, offset_bounds]
    # Fixed seed + single worker: deterministic, global search avoids beat aliases.
    fit = differential_evolution(objective, bounds, seed=0, popsize=24, maxiter=180,
                                 tol=1e-8, polish=False, workers=1)
    refined = minimize(objective, fit.x, method='Nelder-Mead', bounds=bounds,
                       options={'xatol': 1e-9, 'fatol': 1e-10, 'maxiter': 500})
    scale, offset = refined.x if refined.fun <= fit.fun else fit.x
    mean = -objective((scale, offset))
    return float(scale), float(offset), mean


def transform_ms(seconds, scale, offset):
    if not np.isfinite([seconds, scale, offset]).all() or scale <= 0:
        raise ValueError('Invalid affine transform')
    return int(np.floor((scale * seconds + offset) * 1000 + 0.5))


def mapped_output(candidate, duration, audio_duration, scale, offset, similarity):
    coverage = transform_ms(duration, scale, offset)
    if coverage <= 0:
        raise ValueError('MIDI coverage lies before audio')
    audio_end = int(np.floor(audio_duration * 1000))
    chords = []
    for item in candidate:
        start = max(0, transform_ms(item['midiStartMs'] / 1000, scale, offset))
        end = min(coverage, audio_end, transform_ms(min(duration, item['midiEndMs'] / 1000), scale, offset))
        if start < end:
            chords.append(dict(symbol=item['symbol'], startMs=start, endMs=end,
                               source='midi', confidence=item['confidence']))
    return dict(alignment=dict(scale=scale, offsetMs=offset * 1000,
                               meanSimilarity=similarity, midiDurationMs=round(duration * 1000),
                               audioDurationMs=round(audio_duration * 1000), audioCoverageEndMs=coverage),
                chordCoverageEndMs=coverage, chords=chords)


def boundary_diagnostics(candidate, scale, offset, audio_times, chroma, radius=0.8):
    """Independent local audio novelty peaks, not fitted boundary positions.

    Peaks are diagnostic proxies, not human-verified harmonic ground truth.
    Missing/weak peaks are reported rather than fabricated.
    """
    step = float(np.median(np.diff(audio_times)))
    values = normalize(gaussian_filter1d(chroma, 0.065 / step, axis=0))
    lag = max(1, round(0.15 / step))
    novelty = np.zeros(len(values))
    novelty[lag:-lag] = np.linalg.norm(values[2 * lag:] - values[:-2 * lag], axis=1)
    peaks, properties = find_peaks(novelty, distance=max(1, round(0.15 / step)), prominence=0.08)
    rows = []
    for before, after in zip(candidate, candidate[1:]):
        if before['midiEndMs'] != after['midiStartMs']:
            continue
        raw = after['midiStartMs'] / 1000
        mapped = scale * raw + offset
        nearby = peaks[np.abs(audio_times[peaks] - mapped) <= radius]
        nearest = min(nearby, key=lambda i: abs(audio_times[i] - mapped)) if len(nearby) else None
        detected = float(audio_times[nearest]) if nearest is not None else None
        rows.append(dict(change=f"{before['symbol']} -> {after['symbol']}",
                         confidence=min(before['confidence'], after['confidence']), midiRaw=raw,
                         mappedAudio=mapped, nearestAudioChange=detected,
                         deltaMs=None if detected is None else round((detected - mapped) * 1000),
                         novelty=None if nearest is None else round(float(novelty[nearest]), 4)))
    return rows
