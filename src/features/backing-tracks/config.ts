// Build-time toggle, not authentication. Disabled unless explicitly enabled.
export const BACKING_TRACK_ADMIN_ENABLED = process.env.NEXT_PUBLIC_BACKING_TRACK_ADMIN_ENABLED === "true";
export const BACKING_TRACKS_PAGE_SIZE = 12;
