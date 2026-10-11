import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
const root = resolve("out");
const port = Number(process.env.PORT ?? 3000);
const reportOnlyHeaders = {};
// Optional local backend, identical handler to Vercel. Never sends unless its
// server configuration is explicitly supplied (placeholder fails closed).
const submission = process.argv.includes("--with-api") ? (await import("../api/submit-example.ts")).default : null;
if (process.argv.includes("--csp")) {
  const config = JSON.parse(await readFile("vercel.json", "utf8"));
  const header = config.headers
    .find((route) => route.source === "/(.*)")?.headers
    .find((item) => item.key.toLowerCase() === "content-security-policy-report-only");
  if (!header) throw new Error("Header CSP Report-Only global introuvable dans vercel.json.");
  reportOnlyHeaders[header.key] = header.value;
}
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
};
createServer(async (request, response) => {
  if (submission && request.url?.split("?")[0] === "/api/submit-example") {
    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(request.headers)) if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      const method = request.method ?? "GET";
      const result = await submission.fetch(new Request(`http://${request.headers.host}${request.url}`, {
        method, headers, ...(!["GET", "HEAD"].includes(method) ? { body: request, duplex: "half" } : {}),
      }));
      response.writeHead(result.status, Object.fromEntries(result.headers));
      response.end(Buffer.from(await result.arrayBuffer()));
    } catch { response.writeHead(500, { "Content-Type": "application/json" }); response.end('{"code":"SEND_FAILED"}'); }
    return;
  }
  if (!["GET", "HEAD"].includes(request.method ?? "")) {
    response.writeHead(405);
    response.end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url ?? "/", "http://localhost").pathname,
    );
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403);
      response.end();
      return;
    }
    let status = 200;
    try {
      const info = await stat(file);
      if (info.isDirectory()) file = resolve(file, "index.html");
    } catch {
      file = resolve(root, "404.html");
      status = 404;
    }
    const body = await readFile(file);
    // Media elements request byte ranges for seeking without fetching the whole file.
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (status === 200 && range && request.method === "GET") {
      const start = Number(range[1]), end = Math.min(range[2] ? Number(range[2]) : body.length - 1, body.length - 1);
      if (start > end || start >= body.length) { response.writeHead(416, { "Content-Range": `bytes */${body.length}` }); response.end(); return; }
      response.writeHead(206, { ...reportOnlyHeaders, "Content-Type": types[extname(file)] ?? "application/octet-stream", "Accept-Ranges": "bytes", "Content-Range": `bytes ${start}-${end}/${body.length}`, "Content-Length": end - start + 1 });
      response.end(body.subarray(start, end + 1)); return;
    }
    response.writeHead(status, {
      ...reportOnlyHeaders,
      "Content-Type": types[extname(file)] ?? "application/octet-stream",
      "Content-Length": body.length,
      "Accept-Ranges": "bytes",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`FretLab statique : http://127.0.0.1:${port}`),
);
