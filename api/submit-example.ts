import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { Resend } from "resend";
import { createSubmissionHandler } from "../server/example-submission.ts";
import { isFeatureEnabled } from "../src/config/features.ts";
import { decodeContentTrack, TRACK_ID } from "../src/features/backing-tracks/content.ts";

const handler = createSubmissionHandler({
  enabled: isFeatureEnabled("backingTracks"),
  async configuration() {
    const config = JSON.parse(await readFile(join(process.cwd(), "config/backing-tracks.json"), "utf8"));
    return { recipientEmail: config?.exampleSubmission?.recipientEmail, apiKey: process.env.RESEND_API_KEY, fromEmail: process.env.RESEND_FROM_EMAIL };
  },
  async tracks() {
    // Versioned editorial JSON, included in the function bundle; no MP3 and no
    // dependency on the order of Vercel's static/function builds.
    const root = join(process.cwd(), "public/backing-tracks");
    const folders = (await readdir(root, { withFileTypes: true })).filter(entry => entry.isDirectory() && TRACK_ID.test(entry.name));
    return Promise.all(folders.map(async ({ name }) => {
      const raw = JSON.parse(await readFile(join(root, name, `Track_${name}.json`), "utf8"));
      if (raw.id !== name) throw new Error("Invalid track id");
      return decodeContentTrack(raw, false);
    }));
  },
  async send(apiKey, mail) {
    const result = await new Resend(apiKey).emails.send(mail);
    if (result.error || !result.data?.id) throw new Error("Email delivery failed");
  },
});
const endpoint = { fetch: handler };
export default endpoint;
