#!/usr/bin/env node
// Install, update and remove the CMO.so marketing skills for Claude Code, Codex, Pi, Cursor,
// Gemini CLI and other coding agents, in one project (default) or for the current user.
// No dependencies.
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PKG = JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf8"));
const SKILLS_ROOT = join(PKG_ROOT, "skills");
const MCP_URL = "https://mcp.cmo.so/mcp";
const ID = /^cmo-[a-z0-9-]+$/;

class UsageError extends Error {}

// ---------- agents ----------
// Where each agent reads skills. project: relative to the project; user: under the home folder.
// `detect` lists folders whose presence means the agent is set up (user scope: under home).
// Several agents share .agents/skills (the cross-agent folder); a shared folder is written once.
const HOME = () => homedir();
const AGENTS = {
	claude: { name: "Claude Code", project: ".claude/skills", user: () => join(process.env.CLAUDE_CONFIG_DIR || join(HOME(), ".claude"), "skills"), detect: [".claude"] },
	codex: { name: "Codex", project: ".agents/skills", user: () => join(HOME(), ".agents", "skills"), detect: [".codex"] },
	pi: { name: "Pi", project: ".agents/skills", user: () => join(HOME(), ".agents", "skills"), detect: [".pi"] },
	cursor: { name: "Cursor", project: ".agents/skills", user: () => join(HOME(), ".cursor", "skills"), detect: [".cursor"] },
	gemini: { name: "Gemini CLI", project: ".agents/skills", user: () => join(HOME(), ".gemini", "skills"), detect: [".gemini"] },
	opencode: { name: "OpenCode", project: ".agents/skills", user: () => join(HOME(), ".config", "opencode", "skills"), detect: [".config/opencode", ".opencode"] },
	copilot: { name: "GitHub Copilot", project: ".agents/skills", user: () => join(HOME(), ".copilot", "skills"), detect: [".copilot"] },
	amp: { name: "Amp", project: ".agents/skills", user: () => join(HOME(), ".config", "agents", "skills"), detect: [".config/amp"] },
	cline: { name: "Cline", project: ".agents/skills", user: () => join(HOME(), ".agents", "skills"), detect: [".cline"] },
	windsurf: { name: "Windsurf", project: ".windsurf/skills", user: () => join(HOME(), ".codeium", "windsurf", "skills"), detect: [".codeium/windsurf", ".windsurf"] },
	goose: { name: "Goose", project: ".goose/skills", user: () => join(HOME(), ".config", "goose", "skills"), detect: [".config/goose", ".goose"] },
	kiro: { name: "Kiro", project: ".kiro/skills", user: () => join(HOME(), ".kiro", "skills"), detect: [".kiro"] },
	qwen: { name: "Qwen Code", project: ".qwen/skills", user: () => join(HOME(), ".qwen", "skills"), detect: [".qwen"] },
	trae: { name: "Trae", project: ".trae/skills", user: () => join(HOME(), ".trae", "skills"), detect: [".trae"] },
	roo: { name: "Roo Code", project: ".roo/skills", user: () => join(HOME(), ".roo", "skills"), detect: [".roo"] },
	kilo: { name: "Kilo Code", project: ".kilocode/skills", user: () => join(HOME(), ".kilocode", "skills"), detect: [".kilocode"] },
	augment: { name: "Augment", project: ".augment/skills", user: () => join(HOME(), ".augment", "skills"), detect: [".augment"] },
	droid: { name: "Factory Droid", project: ".factory/skills", user: () => join(HOME(), ".factory", "skills"), detect: [".factory"] },
	openhands: { name: "OpenHands", project: ".openhands/skills", user: () => join(HOME(), ".openhands", "skills"), detect: [".openhands"] },
	antigravity: { name: "Antigravity", project: ".agent/skills", user: () => join(HOME(), ".gemini", "antigravity", "skills"), detect: [".gemini/antigravity"] },
};
const ALIASES = { "claude-code": "claude", "gemini-cli": "gemini", "github-copilot": "copilot", "kilocode": "kilo", "factory": "droid", "roo-code": "roo", "qwen-code": "qwen" };

function agentDir(agent, scope, root) {
	return scope === "user" ? resolve(AGENTS[agent].user()) : join(root, AGENTS[agent].project);
}

function detected(scope, root) {
	const base = scope === "user" ? HOME() : root;
	return Object.keys(AGENTS).filter((a) => AGENTS[a].detect.some((d) => existsSync(join(base, d))));
}

function parseAgents(value) {
	return list(value).map((a) => {
		const id = ALIASES[a.toLowerCase()] || a.toLowerCase();
		if (!["auto", "all"].includes(id) && !AGENTS[id]) throw new UsageError(`unknown agent ${a} (see \`cmo-skills agents\`)`);
		return id;
	});
}

// Returns [{ dir, agents: [...] }], one entry per distinct folder.
function targetsFor(opts, scope, root, previous) {
	let agents = parseAgents(opts["--agent"] || "auto");
	if (agents.includes("all")) agents = Object.keys(AGENTS);
	else if (agents.includes("auto")) {
		if (previous?.targets?.length) return previous.targets;
		agents = detected(scope, root);
		// A project with no agent folders yet: use the agents set up for this user, else Claude Code.
		if (!agents.length && scope === "project") agents = detected("user", root);
		if (!agents.length) agents = ["claude"];
	}
	const byDir = new Map();
	for (const a of agents) {
		const dir = agentDir(a, scope, root);
		if (!byDir.has(dir)) byDir.set(dir, []);
		byDir.get(dir).push(a);
	}
	return [...byDir].map(([dir, as]) => ({ dir, agents: as }));
}

// 0.3.0 records listed agent names only; Codex then lived in ~/.codex/skills (CODEX_HOME).
function legacyTargets(state, scope, root) {
	if (state.targets) return state.targets;
	return (state.agents || []).map((a) => ({
		dir: a === "codex" && scope === "user" ? join(process.env.CODEX_HOME || join(HOME(), ".codex"), "skills") : agentDir(a, scope, root),
		agents: [a],
	}));
}

function mergeTargets(a = [], b = []) {
	const byDir = new Map();
	for (const t of [...a, ...b]) byDir.set(t.dir, [...new Set([...(byDir.get(t.dir) || []), ...t.agents])]);
	return [...byDir].map(([dir, agents]) => ({ dir, agents }));
}

// ---------- arguments ----------

function parse(argv) {
	const flags = new Set(["--global", "-g", "--force", "--dry-run", "--mcp", "--installed", "--json", "--all", "--help", "-h", "--version", "-v"]);
	const valued = new Set(["--scope", "--project", "--agent", "-a", "--category", "--skills"]);
	const opts = { _: [] };
	const add = (k, v) => {
		if (k === "-a") k = "--agent";
		opts[k] = k === "--agent" && opts[k] ? `${opts[k]},${v}` : v;
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a.startsWith("--") && a.includes("=") && valued.has(a.split("=")[0])) {
			const [k, ...v] = a.split("=");
			add(k, v.join("="));
		} else if (valued.has(a)) {
			if (argv[i + 1] === undefined) throw new UsageError(`${a} needs a value`);
			add(a, argv[++i]);
		} else if (flags.has(a)) opts[a === "-g" ? "--global" : a] = true;
		else if (a.startsWith("-")) throw new UsageError(`unknown option ${a}`);
		else opts._.push(a);
	}
	return opts;
}

function list(value) {
	return (value || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function scopeOf(opts) {
	if (opts["--global"] && opts["--scope"] && opts["--scope"] !== "user") throw new UsageError("--global means --scope user");
	const scope = opts["--global"] ? "user" : opts["--scope"] || "project";
	if (!["project", "user"].includes(scope)) throw new UsageError(`unknown scope ${scope} (use project or user)`);
	if (scope === "user" && opts["--project"]) throw new UsageError("--project only applies to --scope project");
	return scope;
}

function projectRoot(opts) {
	return resolve(opts["--project"] || process.cwd());
}

function stateFile(scope, root) {
	return scope === "user"
		? join(resolve(process.env.CMO_SO_HOME || join(HOME(), ".config", "cmo-so")), "skills-install.json")
		: join(root, ".cmo-so", "skills-install.json");
}

// ---------- catalog and selection ----------

function loadCatalog() {
	const path = join(PKG_ROOT, "catalog.json");
	if (!existsSync(path) || !existsSync(SKILLS_ROOT)) {
		throw new UsageError("the bundled skills are missing; build the package with `npm pack` (it runs scripts/bundle.mjs)");
	}
	const catalog = JSON.parse(readFileSync(path, "utf8"));
	for (const s of catalog.skills) if (!ID.test(s.id)) throw new Error(`bad skill id in catalog: ${s.id}`);
	return catalog;
}

function resolveSelection(catalog, selection) {
	const byCategory = new Map();
	for (const s of catalog.skills) {
		for (const key of [s.category, s.plugin]) {
			if (!byCategory.has(key)) byCategory.set(key, []);
			byCategory.get(key).push(s.id);
		}
	}
	const ids = new Set();
	if (selection.all) for (const s of catalog.skills) ids.add(s.id);
	for (const c of selection.categories || []) {
		if (!byCategory.has(c)) throw new UsageError(`unknown category ${c} (see \`cmo-skills list\`)`);
		for (const id of byCategory.get(c)) ids.add(id);
	}
	for (const id of selection.skills || []) {
		if (!catalog.skills.some((s) => s.id === id)) throw new UsageError(`unknown skill ${id} (see \`cmo-skills list\`)`);
		ids.add(id);
	}
	// The core skills (connect, daily, …) are what every other skill hands off to.
	if (ids.size && selection.withCore !== false) for (const id of byCategory.get("core") || []) ids.add(id);
	return [...ids].sort();
}

function selectionFrom(opts) {
	const skills = [...opts._, ...list(opts["--skills"])];
	const categories = list(opts["--category"]);
	if (!skills.length && !categories.length) return { all: true };
	return { categories, skills };
}

function mergeSelection(a = {}, b = {}) {
	if (a.all || b.all) return { all: true };
	return {
		categories: [...new Set([...(a.categories || []), ...(b.categories || [])])].sort(),
		skills: [...new Set([...(a.skills || []), ...(b.skills || [])])].sort(),
	};
}

// ---------- files ----------

const sha = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

function filesUnder(dir, base = dir) {
	if (!existsSync(dir)) return [];
	const out = [];
	for (const e of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) out.push(...filesUnder(p, base));
		else if (e.isFile()) out.push(relative(base, p));
	}
	return out.sort();
}

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch {
		return null;
	}
}

// Sync one skill folder. A file is replaced only if it is new, identical, or unchanged since we
// installed it (its hash matches the record); local edits are kept unless --force.
function syncSkill(id, target, managed, opts, log, stats) {
	const source = join(SKILLS_ROOT, id);
	const dry = opts["--dry-run"];
	const fresh = !existsSync(target);
	if (fresh) {
		if (!dry) {
			mkdirSync(dirname(target), { recursive: true });
			const staging = `${target}.cmo-skills-${process.pid}`;
			rmSync(staging, { recursive: true, force: true });
			cpSync(source, staging, { recursive: true });
			renameSync(staging, target);
		}
		log(`installed ${target}`);
		stats.installed++;
	}
	const newManaged = {};
	for (const rel of filesUnder(source)) {
		const src = join(source, rel);
		const dst = join(target, rel);
		const want = sha(src);
		if (fresh) {
			newManaged[dst] = want;
			continue;
		}
		const have = existsSync(dst) ? sha(dst) : null;
		if (have === want) {
			newManaged[dst] = want;
			stats.unchanged++;
		} else if (have === null || managed[dst] === have || opts["--force"]) {
			if (!dry) {
				mkdirSync(dirname(dst), { recursive: true });
				writeFileSync(dst, readFileSync(src));
			}
			log(`${have === null ? "added" : "updated"} ${dst}`);
			newManaged[dst] = want;
			stats.updated++;
		} else {
			log(`kept ${dst} (edited locally; --force replaces it)`);
			newManaged[dst] = managed[dst];
			stats.kept++;
		}
	}
	// Files we installed earlier that the package no longer ships.
	if (!fresh) {
		for (const rel of filesUnder(target)) {
			const dst = join(target, rel);
			if (newManaged[dst] !== undefined || managed[dst] === undefined) continue;
			if (managed[dst] === sha(dst) || opts["--force"]) {
				if (!dry) rmSync(dst);
				log(`deleted ${dst} (no longer in the package)`);
			}
		}
	}
	return newManaged;
}

function removeSkill(target, managed, opts, log) {
	if (!existsSync(target)) return true;
	const edited = filesUnder(target).filter((rel) => {
		const p = join(target, rel);
		return managed[p] === undefined || managed[p] !== sha(p);
	});
	if (edited.length && !opts["--force"]) {
		log(`kept ${target} (${edited.length} file(s) edited or added locally; --force removes it)`);
		return false;
	}
	if (!opts["--dry-run"]) rmSync(target, { recursive: true, force: true });
	log(`removed ${target}`);
	return true;
}

// ---------- MCP ----------

function mcpProject(root, opts, log) {
	const path = join(root, ".mcp.json");
	let config = {};
	if (existsSync(path)) {
		config = readJson(path);
		if (!config) {
			log(`skipped ${path} (not valid JSON); add the server by hand: ${MCP_URL}`);
			return;
		}
	}
	config.mcpServers ||= {};
	if (config.mcpServers["cmo-so"]) {
		log(`unchanged ${path} (cmo-so server already set)`);
		return;
	}
	config.mcpServers["cmo-so"] = { type: "http", url: MCP_URL };
	if (!opts["--dry-run"]) writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
	log(`added the cmo-so MCP server to ${path} (Claude Code asks you to approve it, then /mcp → cmo-so → Authenticate)`);
}

function mcpHelp(scope) {
	const user = scope === "user";
	return [
		`Connect the CMO.so MCP server (${MCP_URL}; the core skills need it, sign in with your CMO.so account):`,
		`  Claude Code  claude mcp add --scope ${user ? "user" : "project"} --transport http cmo-so ${MCP_URL}`,
		`  Codex        codex mcp add cmo-so --url ${MCP_URL}   (or [mcp_servers.cmo-so] url = "${MCP_URL}" in ~/.codex/config.toml)`,
		`  Gemini CLI   gemini mcp add --transport http ${user ? "--scope user " : ""}cmo-so ${MCP_URL}`,
		`  Cursor       Settings → MCP → Add → URL ${MCP_URL}`,
		"  Pi and agents that start a command: npx -y @cmo-so/mcp (stdio), after `npx @cmo-so/cli login`",
	].join("\n");
}

// ---------- commands ----------

function install(opts, { update = false } = {}) {
	const catalog = loadCatalog();
	const scope = scopeOf(opts);
	const root = projectRoot(opts);
	const state = stateFile(scope, root);
	const previous = readJson(state);
	if (update && !previous) throw new UsageError(`nothing installed in ${scope === "user" ? "user scope" : root}; run \`cmo-skills install\` first`);
	const previousTargets = previous ? legacyTargets(previous, scope, root) : [];
	const targets = targetsFor(opts, scope, root, previous ? { targets: previousTargets } : null);
	const selection = update ? previous.selection : mergeSelection(previous?.selection, selectionFrom(opts));
	const named = [...opts._, ...list(opts["--skills"])];
	const ids = resolveSelection(catalog, update && named.length ? { skills: named, withCore: false } : selection);
	const managed = previous?.files || {};
	const stats = { installed: 0, updated: 0, unchanged: 0, kept: 0, removed: 0 };
	const log = (line) => console.log(opts["--dry-run"] ? `[dry run] ${line}` : line);
	const files = { ...managed };

	for (const { dir } of targets) {
		for (const id of ids) Object.assign(files, syncSkill(id, join(dir, id), managed, opts, log, stats));
		// Skills that were installed before but are no longer in the package.
		for (const id of previous?.skills || []) {
			if (catalog.skills.some((s) => s.id === id)) continue;
			const target = join(dir, id);
			if (removeSkill(target, managed, opts, log)) {
				stats.removed++;
				for (const k of Object.keys(files)) if (k.startsWith(target + sep)) delete files[k];
			}
		}
	}

	const known = (id) => catalog.skills.some((s) => s.id === id);
	const installed = [...new Set([...(previous?.skills || []), ...ids])].filter(known).sort();
	const allTargets = mergeTargets(previousTargets, targets);
	if (opts["--mcp"] && scope === "project") mcpProject(root, opts, log);
	if (!opts["--dry-run"]) {
		mkdirSync(dirname(state), { recursive: true });
		const record = { package: PKG.name, version: PKG.version, scope, ...(scope === "project" ? { project: root } : {}), targets: allTargets, selection, skills: installed, files, [update ? "updated_at" : "installed_at"]: new Date().toISOString() };
		writeFileSync(state, `${JSON.stringify(record, null, 2)}\n`);
	}
	console.log(`\n${update ? "Updated" : "Installed"} ${ids.length} CMO.so skills v${PKG.version} (${scope} scope):`);
	for (const t of targets) console.log(`  ${t.dir}  (${t.agents.map((a) => AGENTS[a]?.name || a).join(", ")})`);
	console.log(`${stats.installed} new, ${stats.updated} files updated, ${stats.unchanged} unchanged, ${stats.kept} kept${stats.removed ? `, ${stats.removed} retired skills removed` : ""}.`);
	if (stats.kept) console.log("Files you edited were kept. Rerun with --force to replace them.");
	const legacyCodex = previousTargets.find((t) => t.dir.endsWith(join(".codex", "skills")));
	if (legacyCodex) console.log(`Note: Codex now reads ~/.agents/skills. Move to it with \`cmo-skills install --scope user --agent codex\`, then delete ${legacyCodex.dir}/cmo-*.`);
	if (!update && !(opts["--mcp"] && scope === "project")) console.log(`\n${mcpHelp(scope)}`);
	if (!update) console.log(`\nRestart your agent (or start a new session) to load the skills. Try: "Connect to CMO.so" or "What needs me today on my website?"`);
}

function remove(opts) {
	const scope = scopeOf(opts);
	const root = projectRoot(opts);
	const state = stateFile(scope, root);
	const previous = readJson(state);
	if (!previous) throw new UsageError(`nothing installed in ${scope === "user" ? "user scope" : root}`);
	const ids = opts["--all"] ? previous.skills : [...opts._, ...list(opts["--skills"])];
	if (!ids.length) throw new UsageError("name the skills to remove, or pass --all");
	const recorded = legacyTargets(previous, scope, root);
	const targets = opts["--agent"] ? targetsFor(opts, scope, root, null) : recorded;
	const log = (line) => console.log(opts["--dry-run"] ? `[dry run] ${line}` : line);
	const files = { ...previous.files };
	const left = new Set(previous.skills);
	for (const id of ids) {
		if (!ID.test(id)) throw new UsageError(`bad skill id ${id}`);
		let gone = true;
		for (const { dir } of targets) {
			const target = join(dir, id);
			if (removeSkill(target, previous.files, opts, log)) {
				for (const k of Object.keys(files)) if (k.startsWith(target + sep)) delete files[k];
			} else gone = false;
		}
		// Removing from some agents only: the skill stays installed for the others.
		if (gone && targets.length === recorded.length) left.delete(id);
	}
	if (opts["--dry-run"]) return;
	if (!left.size) {
		rmSync(state, { force: true });
		console.log("All CMO.so skills removed.");
		return;
	}
	writeFileSync(state, `${JSON.stringify({ ...previous, targets: recorded, selection: { categories: [], skills: [...left].sort() }, skills: [...left].sort(), files, updated_at: new Date().toISOString() }, null, 2)}\n`);
	console.log(`${left.size} CMO.so skills still installed.`);
}

function listCmd(opts) {
	const catalog = loadCatalog();
	let installed = null;
	if (opts["--installed"]) installed = new Set(readJson(stateFile(scopeOf(opts), projectRoot(opts)))?.skills || []);
	const category = opts["--category"];
	const rows = catalog.skills.filter((s) => (!category || s.category === category || s.plugin === category) && (!installed || installed.has(s.id)));
	if (opts["--json"]) {
		console.log(JSON.stringify(rows, null, 2));
		return;
	}
	for (const c of catalog.categories) {
		const inCat = rows.filter((s) => s.category === c.id);
		if (!inCat.length) continue;
		console.log(`\n${c.name} (--category ${c.id})`);
		for (const s of inCat) console.log(`  ${s.id.padEnd(30)} ${s.summary}`);
	}
	console.log(`\n${rows.length} skills. Install: npx @cmo-so/skills install [--category seo,social] [--agent codex,pi] [--scope user]`);
}

function agentsCmd(opts) {
	const root = projectRoot(opts);
	const found = { project: new Set(detected("project", root)), user: new Set(detected("user", root)) };
	if (opts["--json"]) {
		console.log(JSON.stringify(Object.entries(AGENTS).map(([id, a]) => ({ id, name: a.name, project: a.project, user: resolve(a.user()), detected: found.user.has(id) || found.project.has(id) })), null, 2));
		return;
	}
	console.log(`${"--agent".padEnd(12)} ${"Agent".padEnd(15)} ${"Project folder".padEnd(18)} User folder`);
	for (const [id, a] of Object.entries(AGENTS)) {
		const mark = found.project.has(id) || found.user.has(id) ? " *" : "";
		console.log(`${id.padEnd(12)} ${a.name.padEnd(15)} ${a.project.padEnd(18)} ${a.user().replace(HOME(), "~")}${mark}`);
	}
	console.log("\n* set up on this machine or in this project. --agent auto (the default) installs for those, else Claude Code.");
	console.log("Combine agents with commas: --agent codex,pi,claude. Agents that share a folder get one copy.");
}

function doctor(opts) {
	const catalog = loadCatalog();
	const scope = scopeOf(opts);
	const root = projectRoot(opts);
	const state = readJson(stateFile(scope, root));
	let problems = 0;
	const report = (ok, line) => {
		console.log(`${ok ? "PASS" : "FAIL"} ${line}`);
		if (!ok) problems++;
	};
	console.log(`@cmo-so/skills ${PKG.version}, ${catalog.skills.length} skills in the package`);
	if (!state) {
		console.log(`INFO nothing installed in ${scope} scope${scope === "project" ? ` (${root})` : ""}`);
		return;
	}
	report(true, `record ${stateFile(scope, root)} (installed v${state.version})`);
	if (state.version !== PKG.version) console.log(`INFO installed v${state.version}, package v${PKG.version}: run \`npx @cmo-so/skills@latest update${scope === "user" ? " --scope user" : ""}\``);
	for (const { dir, agents } of legacyTargets(state, scope, root)) {
		const missing = state.skills.filter((id) => !existsSync(join(dir, id, "SKILL.md")));
		report(!missing.length, `${agents.map((a) => AGENTS[a]?.name || a).join(", ")}: ${state.skills.length - missing.length}/${state.skills.length} skills in ${dir}${missing.length ? ` (missing: ${missing.join(", ")})` : ""}`);
		const edited = Object.entries(state.files).filter(([p, h]) => p.startsWith(dir + sep) && existsSync(p) && sha(p) !== h).length;
		if (edited) console.log(`INFO ${edited} file(s) in ${dir} edited locally (kept on update)`);
	}
	if (scope === "project") {
		const mcp = readJson(join(root, ".mcp.json"));
		console.log(`INFO MCP server in .mcp.json: ${mcp?.mcpServers?.["cmo-so"] ? "yes" : "no (cmo-skills mcp, or --mcp on install)"}`);
	}
	if (problems) process.exitCode = 1;
}

function mcp(opts) {
	const scope = scopeOf(opts);
	if (scope === "project") mcpProject(projectRoot(opts), opts, (l) => console.log(opts["--dry-run"] ? `[dry run] ${l}` : l));
	console.log(mcpHelp(scope));
}

function help() {
	console.log(`@cmo-so/skills ${PKG.version}: the CMO.so marketing skills for Claude Code, Codex, Pi, Cursor,
Gemini CLI and other coding agents

Usage: npx @cmo-so/skills <command> [options]

Commands
  install [SKILL ...]   Install skills (all by default; the core skills always come along)
  update                Update installed skills to this version; adds new skills in the categories you chose
  remove SKILL ... | --all   Remove skills (keeps folders you edited unless --force)
  list                  Show the skills by category
  agents                Show the supported agents and their skill folders
  doctor                Check an install
  mcp                   Connect the CMO.so MCP server (writes .mcp.json in project scope)

Options
  --scope project|user  project (default): skill folders inside the project, e.g. .claude/skills, .agents/skills
                        user: folders in your home, e.g. ~/.claude/skills, ~/.agents/skills, for every project
  -g, --global          Same as --scope user
  --project PATH        Project folder (default: current folder)
  -a, --agent LIST      auto (default), all, or agents: claude, codex, pi, cursor, gemini, opencode, copilot,
                        windsurf, amp, cline, goose, kiro, qwen, trae, roo, kilo, augment, droid, openhands, antigravity
  --category LIST       Categories or plugins, e.g. seo,social or cmo-so-seo
  --skills LIST         Skill ids, e.g. cmo-seo-audit,cmo-x-growth
  --mcp                 Also add the CMO.so MCP server to the project's .mcp.json (Claude Code)
  --force               Replace or remove files you edited
  --dry-run             Show what would change, change nothing
  --installed, --json   For list and agents

Examples
  npx @cmo-so/skills install                          # this project, for the agents set up here
  npx @cmo-so/skills install -g -a codex,pi           # every project, Codex and Pi (~/.agents/skills)
  npx @cmo-so/skills install -a claude,codex --category seo,ai-search --mcp
  npx @cmo-so/skills@latest update -g

Also: Claude Code plugins (/plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills),
Codex plugins (codex plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills),
Pi packages (pi install npm:@cmo-so/skills).`);
}

function main(argv) {
	const [command, ...rest] = argv;
	const opts = parse(rest);
	if (!command || ["help", "--help", "-h"].includes(command) || opts["--help"] || opts["-h"]) return help();
	if (["--version", "-v", "version"].includes(command)) return console.log(PKG.version);
	switch (command) {
		case "install":
		case "add":
			return install(opts);
		case "update":
		case "upgrade":
			return install(opts, { update: true });
		case "remove":
		case "uninstall":
			return remove(opts);
		case "list":
		case "ls":
			return listCmd(opts);
		case "agents":
			return agentsCmd(opts);
		case "doctor":
			return doctor(opts);
		case "mcp":
			return mcp(opts);
		default:
			throw new UsageError(`unknown command ${command}; see \`cmo-skills help\``);
	}
}

try {
	main(process.argv.slice(2));
} catch (error) {
	console.error(`cmo-skills: ${error.message}`);
	process.exitCode = error instanceof UsageError ? 2 : 1;
}
