#!/usr/bin/env node
/**
 * Kills processes using port 3000 or 3001 and removes .next/dev/lock.
 * Run: node scripts/kill-dev-server.js
 * Or via npm: npm run dev:fresh
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const isWindows = process.platform === "win32";
const lockPath = path.join(process.cwd(), ".next", "dev", "lock");
const PORTS = [3000, 3001];

function killOnWindows(port) {
  try {
    const out = execSync(`netstat -ano`, { encoding: "utf8" });
    const lines = out.split("\n");
    const pids = new Set();
    for (const line of lines) {
      if (line.includes(`:${port}`) && line.includes("LISTENING")) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) pids.add(pid);
      }
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "pipe" });
        console.log(`Killed process ${pid} (was using port ${port})`);
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // netstat or taskkill failed
  }
}

function killOnUnix(port) {
  try {
    execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null`, { stdio: "pipe" });
  } catch (e) {}
}

// Kill processes on our ports
for (const port of PORTS) {
  if (isWindows) killOnWindows(port);
  else killOnUnix(port);
}

// Wait 2s for processes to release lock
const end = Date.now() + 2000;
while (Date.now() < end) {}

try {
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log("Removed .next/dev/lock");
  }
} catch (e) {
  console.warn("Could not remove lock file:", e.message);
}
