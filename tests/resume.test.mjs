import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { publishResume, syncResume } from "../scripts/resume.mjs";

function git(directory, ...args) {
  return execFileSync("git", args, { cwd: directory, encoding: "utf8", stdio: "pipe" }).trim();
}

async function fixture(context) {
  const base = await mkdtemp(join(tmpdir(), "inscope-resume-test-"));
  context.after(() => rm(base, { recursive: true, force: true }));
  const directory = join(base, "site");
  const source = join(base, "source.pdf");
  await mkdir(directory);
  await writeFile(source, "%PDF-1.4\nfirst resume\n%%EOF\n");
  return { base, source, directory };
}

test("sync updates the PDF/version and rejects incomplete exports before overwriting", async (context) => {
  const options = await fixture(context);
  const first = await syncResume(options);
  const destination = join(options.directory, "public/Vinamra-Mishra-Resume.pdf");
  assert.deepEqual(await readFile(destination), await readFile(options.source));
  assert.deepEqual(await syncResume(options), first);
  await writeFile(options.source, "%PDF-1.4\nupdated resume\n%%EOF\n");
  const second = await syncResume(options);
  assert.notEqual(second.version, first.version);
  assert.equal(second.path, first.path);
  assert.deepEqual(JSON.parse(await readFile(join(options.directory, "lib/resume.json"), "utf8")), second);
  const valid = await readFile(destination);
  await writeFile(options.source, "%PDF-1.4\nexport still in progress");
  await assert.rejects(syncResume(options), /not a complete PDF/);
  assert.deepEqual(await readFile(destination), valid);
});

test("publish commits only resume files, pushes them and keeps unrelated staging intact", async (context) => {
  const options = await fixture(context);
  const { directory, base, source } = options;
  const remote = join(base, "origin.git");
  git(base, "init", "--bare", "--quiet", remote);
  git(directory, "init", "--initial-branch=main", "--quiet");
  git(directory, "config", "user.email", "resume-test@example.invalid");
  git(directory, "config", "user.name", "Resume test");
  git(directory, "remote", "add", "origin", remote);
  await syncResume(options);
  git(directory, "add", ".");
  git(directory, "commit", "--quiet", "-m", "Initial resume");
  git(directory, "push", "--quiet", "origin", "main");
  await writeFile(join(directory, "unrelated.txt"), "Unfinished work");
  git(directory, "add", "unrelated.txt");
  await writeFile(source, "%PDF-1.4\npublished resume\n%%EOF\n");
  await publishResume(options);
  assert.deepEqual(git(directory, "diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD").split("\n"), [
    "lib/resume.json", "public/Vinamra-Mishra-Resume.pdf",
  ]);
  assert.equal(git(directory, "diff", "--cached", "--name-only"), "unrelated.txt");
  assert.equal(git(directory, "rev-parse", "HEAD"), git(base, "--git-dir", remote, "rev-parse", "refs/heads/main"));
  const head = git(directory, "rev-parse", "HEAD");
  await publishResume(options);
  assert.equal(git(directory, "rev-parse", "HEAD"), head);
  git(directory, "switch", "--quiet", "-c", "unfinished");
  await assert.rejects(publishResume(options), /Switch to main/);
});
