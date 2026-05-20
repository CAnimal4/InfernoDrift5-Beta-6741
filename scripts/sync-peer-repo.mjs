import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const owner = "CAnimal4";
const repoPair = new Set(["InfernoDrift", "InfernoDrift4"]);

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function repoNameFromEnvironment() {
  const githubRepository = process.env.GITHUB_REPOSITORY;
  if (githubRepository?.includes("/")) {
    return githubRepository.split("/").pop();
  }
  return path.basename(run("git", ["rev-parse", "--show-toplevel"]).trim());
}

function getPeerRepo(repoName) {
  if (repoName === "InfernoDrift") return "InfernoDrift4";
  if (repoName === "InfernoDrift4") return "InfernoDrift";
  throw new Error(`Unsupported repository for sync: ${repoName}`);
}

function shouldSkip() {
  const subject = process.env.GITHUB_EVENT_HEAD_COMMIT_MESSAGE ?? run("git", ["log", "-1", "--pretty=%s"]).trim();
  return subject.includes("[skip peer-sync]");
}

function isBinary(buffer) {
  return buffer.includes(0);
}

function transformTextForTarget(text, targetRepo) {
  if (targetRepo === "InfernoDrift") {
    return text
      .replaceAll("https://canimal4.github.io/InfernoDrift/", "https://canimal4.github.io/InfernoDrift/")
      .replace(/https:\/\/canimal4\.github\.io\/InfernoDrift4(?![0-9A-Za-z_-])/g, "https://canimal4.github.io/InfernoDrift")
      .replaceAll("/InfernoDrift/", "/InfernoDrift/")
      .replace(/github\.com\/CAnimal4\/InfernoDrift4(?![0-9A-Za-z_-])/g, "github.com/CAnimal4/InfernoDrift")
      .replace(/CAnimal4\/InfernoDrift4(?![0-9A-Za-z_-])/g, "CAnimal4/InfernoDrift");
  }
  if (targetRepo === "InfernoDrift4") {
    return text
      .replaceAll("https://canimal4.github.io/InfernoDrift/", "https://canimal4.github.io/InfernoDrift/")
      .replace(/https:\/\/canimal4\.github\.io\/InfernoDrift(?![0-9A-Za-z_-])/g, "https://canimal4.github.io/InfernoDrift")
      .replaceAll("/InfernoDrift/", "/InfernoDrift/")
      .replace(/github\.com\/CAnimal4\/InfernoDrift(?![0-9A-Za-z_-])/g, "github.com/CAnimal4/InfernoDrift")
      .replace(/CAnimal4\/InfernoDrift(?![0-9A-Za-z_-])/g, "CAnimal4/InfernoDrift");
  }
  throw new Error(`Unsupported target repository: ${targetRepo}`);
}

function walkFiles(root) {
  const files = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "dist") continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function applyTargetTransforms(root, targetRepo) {
  for (const filePath of walkFiles(root)) {
    const buffer = fs.readFileSync(filePath);
    if (isBinary(buffer)) continue;
    const original = buffer.toString("utf8");
    const transformed = transformTextForTarget(original, targetRepo);
    if (transformed !== original) fs.writeFileSync(filePath, transformed);
  }
}

function emptyWorktree(root) {
  for (const entry of fs.readdirSync(root)) {
    if (entry === ".git") continue;
    fs.rmSync(path.join(root, entry), { recursive: true, force: true });
  }
}

function copyTrackedFiles(sourceRoot, destinationRoot) {
  const output = run("git", ["ls-files", "-z"], { cwd: sourceRoot });
  const files = output.split("\0").filter(Boolean);
  for (const relativePath of files) {
    const sourcePath = path.join(sourceRoot, relativePath);
    const destinationPath = path.join(destinationRoot, relativePath);
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

if (shouldSkip()) {
  console.log("Skipping peer sync for [skip peer-sync] commit.");
  process.exit(0);
}

const syncToken = process.env.INFERNODRIFT_SYNC_TOKEN;
if (!syncToken) {
  throw new Error("Missing INFERNODRIFT_SYNC_TOKEN secret with write access to both InfernoDrift repos.");
}

const sourceRepo = repoNameFromEnvironment();
if (!repoPair.has(sourceRepo)) throw new Error(`Unexpected source repo: ${sourceRepo}`);
const targetRepo = getPeerRepo(sourceRepo);
const sourceSha = run("git", ["rev-parse", "--short", "HEAD"]).trim();

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "infernodrift-peer-sync-"));
const targetRoot = path.join(tempRoot, targetRepo);
const remoteUrl = `https://x-access-token:${syncToken}@github.com/${owner}/${targetRepo}.git`;

try {
  run("git", ["clone", "--depth", "1", remoteUrl, targetRoot], { stdio: "inherit" });
  emptyWorktree(targetRoot);
  copyTrackedFiles(process.cwd(), targetRoot);
  applyTargetTransforms(targetRoot, targetRepo);

  run("git", ["config", "user.name", "InfernoDrift Sync"], { cwd: targetRoot });
  run("git", ["config", "user.email", "actions@github.com"], { cwd: targetRoot });
  run("git", ["add", "-A"], { cwd: targetRoot });

  const status = run("git", ["status", "--porcelain"], { cwd: targetRoot }).trim();
  if (!status) {
    console.log(`${targetRepo} already matches ${sourceRepo} after repo-specific transforms.`);
    process.exit(0);
  }

  run("git", ["commit", "-m", `Sync ${sourceRepo} ${sourceSha} into ${targetRepo} [skip peer-sync]`], {
    cwd: targetRoot,
    stdio: "inherit",
  });
  run("git", ["push", "origin", "HEAD:main"], { cwd: targetRoot, stdio: "inherit" });
  console.log(`Synced ${sourceRepo}@${sourceSha} into ${targetRepo}.`);
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
