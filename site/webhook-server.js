// Local stand-in for what a real deploy-hook would do: Strapi calls this on
// every publish/update/unpublish, and it rebuilds the static site. On a real
// host this becomes "Strapi webhook -> host's deploy-hook URL" instead —
// same idea, this just runs the build locally rather than on a host's CI.
//
// Debounces rapid-fire events (Strapi can fire several for one save) so a
// single content edit triggers one rebuild, not a pile of overlapping ones.

const http = require("http");
const { execFile } = require("child_process");
const path = require("path");

// A bad/failed build must never take the listener itself down.
process.on("uncaughtException", (err) => {
  console.error(`[${new Date().toISOString()}] Uncaught error (listener stays up): ${err.message}`);
});

const PORT = process.env.WEBHOOK_PORT || 3001;
const DEBOUNCE_MS = 1500;

let debounceTimer = null;
let building = false;
let rebuildQueued = false;

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function runBuild() {
  if (building) {
    rebuildQueued = true;
    return;
  }
  building = true;
  log("Rebuild started...");
  const eleventyBin = path.join(__dirname, "node_modules", "@11ty", "eleventy", "cmd.cjs");
  try {
    execFile(process.execPath, [eleventyBin], { cwd: __dirname }, (err, stdout, stderr) => {
      building = false;
      if (err) {
        log(`Rebuild FAILED: ${err.message}`);
        if (stderr) log(stderr);
      } else {
        log("Rebuild complete.");
      }
      if (rebuildQueued) {
        rebuildQueued = false;
        runBuild();
      }
    });
  } catch (err) {
    building = false;
    log(`Rebuild FAILED to start: ${err.message}`);
  }
}

function scheduleRebuild() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runBuild, DEBOUNCE_MS);
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/rebuild") {
    res.writeHead(404).end();
    return;
  }
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    let event = "unknown";
    try {
      event = JSON.parse(body).event || event;
    } catch {
      // ignore malformed payloads, still trigger a rebuild
    }
    log(`Webhook received: ${event}`);
    scheduleRebuild();
    res.writeHead(202, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "rebuild scheduled" }));
  });
});

server.listen(PORT, () => {
  log(`Webhook listener on http://localhost:${PORT}/rebuild (site: ${path.resolve(__dirname)})`);
});
