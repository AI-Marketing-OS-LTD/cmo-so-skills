// node --test: runs the CLI against temporary projects and a temporary HOME.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const BIN = join(dirname(fileURLToPath(import.meta.url)), "..", "bin", "cmo-skills.mjs");
const catalog = JSON.parse(readFileSync(join(dirname(BIN), "..", "catalog.json"), "utf8"));
const core = catalog.skills.filter((s) => s.category === "core").map((s) => s.id);

function sandbox() {
	const dir = mkdtempSync(join(tmpdir(), "cmo-skills-test-"));
	const home = join(dir, "home");
	const project = join(dir, "project");
	mkdirSync(home, { recursive: true });
	mkdirSync(project, { recursive: true });
	const env = { ...process.env, HOME: home, CLAUDE_CONFIG_DIR: "", CODEX_HOME: "", CMO_SO_HOME: "" };
	for (const k of ["CLAUDE_CONFIG_DIR", "CODEX_HOME", "CMO_SO_HOME"]) delete env[k];
	const run = (...args) => {
		const r = spawnSync(process.execPath, [BIN, ...args], { cwd: project, env, encoding: "utf8" });
		return { code: r.status, out: r.stdout + r.stderr };
	};
	return { dir, home, project, run, done: () => rmSync(dir, { recursive: true, force: true }) };
}

test("project scope installs every skill for Claude Code by default", () => {
	const t = sandbox();
	try {
		const r = t.run("install");
		assert.equal(r.code, 0, r.out);
		for (const s of catalog.skills) assert.ok(existsSync(join(t.project, ".claude", "skills", s.id, "SKILL.md")), s.id);
		assert.ok(!existsSync(join(t.project, ".agents")));
		const state = JSON.parse(readFileSync(join(t.project, ".cmo-so", "skills-install.json"), "utf8"));
		assert.equal(state.scope, "project");
		assert.equal(state.skills.length, catalog.skills.length);
		assert.equal(t.run("doctor").code, 0);
	} finally {
		t.done();
	}
});

test("user scope installs into ~/.claude and ~/.agents (Codex, Pi) and leaves the project alone", () => {
	const t = sandbox();
	try {
		const r = t.run("install", "-g", "-a", "claude,codex,pi", "--category", "seo");
		assert.equal(r.code, 0, r.out);
		for (const root of [join(t.home, ".claude", "skills"), join(t.home, ".agents", "skills")]) {
			assert.ok(existsSync(join(root, "cmo-seo-audit", "SKILL.md")));
			for (const id of core) assert.ok(existsSync(join(root, id, "SKILL.md")), `core ${id}`);
			assert.ok(!existsSync(join(root, "cmo-x-growth")));
		}
		const state = JSON.parse(readFileSync(join(t.home, ".config", "cmo-so", "skills-install.json"), "utf8"));
		assert.equal(state.targets.length, 2);
		assert.deepEqual(state.targets.find((x) => x.dir.endsWith(".agents/skills")).agents, ["codex", "pi"]);
		assert.ok(!existsSync(join(t.project, ".claude")));
		assert.equal(t.run("doctor", "--global").code, 0);
	} finally {
		t.done();
	}
});

test("agents that share .agents/skills get one copy; auto picks up agent folders", () => {
	const t = sandbox();
	try {
		let r = t.run("install", "cmo-reddit", "--agent", "codex,pi,cursor,gemini");
		assert.equal(r.code, 0, r.out);
		assert.ok(existsSync(join(t.project, ".agents", "skills", "cmo-reddit", "SKILL.md")));
		assert.equal((r.out.match(/installed .*cmo-reddit/g) || []).length, 1);
		mkdirSync(join(t.project, ".windsurf"));
		r = t.run("install", "cmo-pinterest", "--agent", "auto");
		// auto reuses the recorded targets, not newly appearing folders
		assert.ok(!existsSync(join(t.project, ".windsurf", "skills")));
		r = t.run("install", "cmo-pinterest", "-a", "windsurf");
		assert.ok(existsSync(join(t.project, ".windsurf", "skills", "cmo-pinterest", "SKILL.md")));
		assert.match(t.run("agents").out, /pi +Pi +\.agents\/skills/);
		assert.equal(t.run("install", "-a", "nope").code, 2);
	} finally {
		t.done();
	}
});

test("a 0.3.0 user record (Codex in ~/.codex/skills) keeps updating there", () => {
	const t = sandbox();
	try {
		const dir = join(t.home, ".codex", "skills", "cmo-connect");
		mkdirSync(dirname(dir), { recursive: true });
		cpSync(join(dirname(BIN), "..", "skills", "cmo-connect"), dir, { recursive: true });
		const file = join(dir, "SKILL.md");
		writeFileSync(file, "old");
		const stateDir = join(t.home, ".config", "cmo-so");
		mkdirSync(stateDir, { recursive: true });
		const sha = (s) => createHash("sha256").update(s).digest("hex");
		writeFileSync(join(stateDir, "skills-install.json"), JSON.stringify({ version: "0.3.0", scope: "user", agents: ["codex"], selection: { categories: [], skills: ["cmo-connect"] }, skills: ["cmo-connect"], files: { [file]: sha("old") } }));
		const r = t.run("update", "-g");
		assert.equal(r.code, 0, r.out);
		assert.notEqual(readFileSync(file, "utf8"), "old");
		assert.match(r.out, /Codex now reads ~\/\.agents\/skills/);
		assert.ok(!existsSync(join(t.home, ".agents")));
	} finally {
		t.done();
	}
});

test("package.json declares the skills for Pi", () => {
	const pkg = JSON.parse(readFileSync(join(dirname(BIN), "..", "package.json"), "utf8"));
	assert.deepEqual(pkg.pi.skills, ["./skills"]);
	assert.ok(pkg.keywords.includes("pi-package"));
});

test("update keeps edited files unless --force", () => {
	const t = sandbox();
	try {
		t.run("install", "cmo-seo-audit");
		const file = join(t.project, ".claude", "skills", "cmo-seo-audit", "SKILL.md");
		appendFileSync(file, "\nmy note\n");
		let r = t.run("update");
		assert.match(r.out, /kept .*cmo-seo-audit/);
		assert.match(readFileSync(file, "utf8"), /my note/);
		r = t.run("update", "--force");
		assert.doesNotMatch(readFileSync(file, "utf8"), /my note/);
	} finally {
		t.done();
	}
});

test("remove keeps edited folders, --force removes them; --mcp writes .mcp.json once", () => {
	const t = sandbox();
	try {
		t.run("install", "--category", "email", "--mcp");
		const mcp = JSON.parse(readFileSync(join(t.project, ".mcp.json"), "utf8"));
		assert.equal(mcp.mcpServers["cmo-so"].url, "https://mcp.cmo.so/mcp");
		const dir = join(t.project, ".claude", "skills", "cmo-newsletter");
		appendFileSync(join(dir, "SKILL.md"), "x");
		t.run("remove", "cmo-newsletter", "cmo-cold-email");
		assert.ok(existsSync(dir));
		assert.ok(!existsSync(join(t.project, ".claude", "skills", "cmo-cold-email")));
		t.run("remove", "--all", "--force");
		assert.ok(!existsSync(dir));
		assert.ok(!existsSync(join(t.project, ".cmo-so", "skills-install.json")));
	} finally {
		t.done();
	}
});

test("bad input exits 2", () => {
	const t = sandbox();
	try {
		assert.equal(t.run("install", "--category", "nope").code, 2);
		assert.equal(t.run("install", "--scope", "team").code, 2);
		assert.equal(t.run("update").code, 2);
	} finally {
		t.done();
	}
});
