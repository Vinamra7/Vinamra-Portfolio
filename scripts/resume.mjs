import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const defaultSource = join(homedir(), "OneDrive", "Super Preparation", "resume", "VinamraResume.pdf");
const files = ["public/Vinamra-Mishra-Resume.pdf", "lib/resume.json"];

function git(args, directory) {
  return execFileSync("git", args, { cwd: directory, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

export async function syncResume({ source = process.env.RESUME_SOURCE || defaultSource, directory = root } = {}) {
  const pdf = await readFile(source);
  if (!pdf.subarray(0, 5).equals(Buffer.from("%PDF-")) || !pdf.subarray(-2048).includes(Buffer.from("%%EOF"))) {
    throw new Error("The resume source is not a complete PDF. Finish exporting it, then retry.");
  }
  const version = createHash("sha256").update(pdf).digest("hex").slice(0, 16);
  const metadata = { path: "/Vinamra-Mishra-Resume.pdf", version };
  for (const file of files) await mkdir(dirname(join(directory, file)), { recursive: true });
  await writeFile(join(directory, files[0]), pdf);
  await writeFile(join(directory, files[1]), JSON.stringify(metadata, null, 2) + "\n");
  return metadata;
}

export async function publishResume(options = {}) {
  const directory = options.directory || root;
  if (git(["branch", "--show-current"], directory) !== "main") {
    throw new Error("Switch to main before publishing the resume.");
  }
  const metadata = await syncResume(options);
  if (git(["status", "--porcelain", "--", ...files], directory)) {
    git(["add", "--", ...files], directory);
    git(["commit", "--only", "-m", "Update public resume", "--", ...files], directory);
  }
  git(["push", "origin", "main"], directory);
  return metadata;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const command = process.argv[2] || "sync";
    if (!["sync", "publish"].includes(command)) throw new Error("Use sync or publish.");
    const metadata = await (command === "publish" ? publishResume() : syncResume());
    console.log(`Resume ${command === "publish" ? "pushed; Vercel will deploy it" : "synced locally"}. Version: ${metadata.version}`);
  } catch (error) {
    console.error(error.message);
    if (error.stderr) console.error(String(error.stderr).trim());
    process.exitCode = 1;
  }
}
