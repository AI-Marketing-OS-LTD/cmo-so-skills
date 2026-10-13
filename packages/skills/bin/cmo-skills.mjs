#!/usr/bin/env node
// Install, update and remove the CMO.so marketing skills for Claude Code and Codex,
// in one project (default) or for the current user. No dependencies.
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
const AGENTS = ["claude", "codex"];

function loadCatalog() {
	const path = join(PKG_ROOT, "catalog.json");
	if (!existsSync(path) || !existsSync(SKILLS_ROOT)) {
		throw new UsageError("the bundled skills are missing; build the package with `npm pack` (it runs scripts/bundle.mjs)");
	}
	const catalog = JSON.parse(readFileSync(path, "utf8"));
	for (const s of catalog.skills) if (!ID.test(s.id)) throw new Error(`bad skill id in catalog: ${s.id}`);
	return catalog;
}

class UsageError extends Error {}

// ---------- arguments ----------

function parse(argv) {
	const flags = new Set(["--global", "--force", "--dry-run", "--mcp", "--installed", "--json", "--all", "--help", "-h", "--version", "-v"]);
	const valued = new Set(["--scope", "--project", "--agent", "--category", "--skills"]);
	const opts = { _: [] };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a.includes("=") && a.startsWith("--") && valued.has(a.split("=")[0])) {
			const [k, ...v] = a.split("=");
			opts[k] = v.join("=");
		} else if (valued.has(a)) {
			if (argv[i + 1] === undefined) throw new UsageError(`${a} needs a value`);
			opts[a] = argv[++i];
		} else if (flags.has(a)) opts[a] = true;
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

function userAgentHome(agent) {
	if (agent === "claude") return resolve(process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude"));
	return resolve(process.env.CODEX_HOME || join(homedir(), ".codex"));
}

function stateFile(scope, root) {
	return scope === "user"
		? join(resolve(process.env.CMO_SO_HOME || join(homedir(), ".config", "cmo-so")), "skills-install.json")
		: join(root, ".cmo-so", "skills-install.json");
}

// Where each agent reads skills from.
//   project: Claude Code <project>/.claude/skills, Codex <project>/.agents/skills
//   user:    Claude Code ~/.claude/skills (CLAUDE_CONFIG_DIR), Codex ~/.codex/skills (CODEX_HOME)
function skillDir(agent, scope, root) {
	if (scope === "user") return join(userAgentHome(agent), "skills");
	return join(root, agent === "claude" ? ".claude" : ".agents", "skills");
}

function agentsFor(opts, scope, root, previous) {
	const requested = opts["--agent"] || "auto";
	if (!["auto", "all", ...AGENTS].includes(requested)) throw new UsageError(`unknown agent ${requested} (use auto, claude, codex or all)`);
	if (requested === "all") return [...AGENTS];
	if (requested !== "auto") return [requested];
	if (previous?.agents?.length) return previous.agents;
	const found = AGENTS.filter((a) => existsSync(scope === "user" ? userAgentHome(a) : join(root, a === "claude" ? ".claude" : ".agents")));
	return found.length ? found : ["claude"];
}

// ---------- selection ----------

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

function readState(path) {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch {
		return null;
	}
}

// Sync one skill folder. A file is replaced only if it is new, identical, or unchanged since we
// installed it (its hash matches the manifest); local edits are kept unless --force.
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
		const key = join(target, rel);
		const want = sha(src);
		if (fresh) {
			newManaged[key] = want;
			continue;
		}
		const have = existsSync(dst) ? sha(dst) : null;
		if (have === want) {
			newManaged[key] = want;
			stats.unchanged++;
		} else if (have === null || managed[key] === have || opts["--force"]) {
			if (!dry) {
				mkdirSync(dirname(dst), { recursive: true });
				writeFileSync(dst, readFileSync(src));
			}
			log(`${have === null ? "added" : "updated"} ${dst}`);
			newManaged[key] = want;
			stats.updated++;
		} else {
			log(`kept ${dst} (edited locally; --force replaces it)`);
			newManaged[key] = managed[key];
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
		try {
			config = JSON.parse(readFileSync(path, "utf8"));
		} catch {
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
	const claudeScope = scope === "user" ? "user" : "project";
	return [
		"Connect the CMO.so MCP server (the core skills need it):",
		`  Claude Code: claude mcp add --scope ${claudeScope} --transport http cmo-so ${MCP_URL}`,
		"               then /mcp → cmo-so → Authenticate (sign in to CMO.so in the browser)",
		`  Codex:       add to ${scope === "user" ? "~/.codex/config.toml" : ".codex/config.toml"}:`,
		"               [mcp_servers.cmo-so]",
		`               url = "${MCP_URL}"`,
		"  Others:      npx -y @cmo-so/mcp (stdio), after `npx @cmo-so/cli login`",
	].join("\n");
}

// ---------- commands ----------

function install(opts, { update = false } = {}) {
	const catalog = loadCatalog();
	const scope = scopeOf(opts);
	const root = projectRoot(opts);
	const state = stateFile(scope, root);
	const previous = readState(state);
	if (update && !previous) throw new UsageError(`nothing installed in ${scope === "user" ? "user scope" : root}; run \`cmo-skills install\` first`);
	const agents = agentsFor(opts, scope, root, previous);
	const asked = update ? {} : selectionFrom(opts);
	const selection = update ? previous.selection : mergeSelection(previous?.selection, asked);
	const ids = resolveSelection(catalog, update && (opts._.length || opts["--skills"]) ? { skills: [...opts._, ...list(opts["--skills"])], withCore: false } : selection);
	const managed = previous?.files || {};
	const stats = { installed: 0, updated: 0, unchanged: 0, kept: 0, removed: 0 };
	const log = (line) => console.log(opts["--dry-run"] ? `[dry run] ${line}` : line);
	const files = { ...managed };

	for (const agent of agents) {
		const dir = skillDir(agent, scope, root);
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

	const installed = [...new Set([...(update ? previous.skills : previous?.skills || []), ...ids])].filter((id) => catalog.skills.some((s) => s.id === id)).sort();
	const allAgents = [...new Set([...(previous?.agents || []), ...agents])];
	if (opts["--mcp"] && scope === "project") mcpProject(root, opts, log);
	if (!opts["--dry-run"]) {
		mkdirSync(dirname(state), { recursive: true });
		writeFileSync(state, `${JSON.stringify({ package: PKG.name, version: PKG.version, scope, ...(scope === "project" ? { project: root } : {}), agents: allAgents, selection, skills: installed, files, [update ? "updated_at" : "installed_at"]: new Date().toISOString() }, null, 2)}\n`);
	}
	const where = agents.map((a) => skillDir(a, scope, root)).join(", ");
	console.log(`\n${update ? "Updated" : "Installed"} ${ids.length} CMO.so skills v${PKG.version} (${scope} scope) in ${where}: ${stats.installed} new, ${stats.updated} files updated, ${stats.unchanged} unchanged, ${stats.kept} kept${stats.removed ? `, ${stats.removed} retired skills removed` : ""}.`);
	if (stats.kept) console.log("Files you edited were kept. Rerun with --force to replace them.");
	if (!update && !(opts["--mcp"] && scope === "project")) console.log(`\n${mcpHelp(scope)}`);
	if (!update) console.log(`\nRestart your agent (or start a new session) to load the skills. Try: "Connect to CMO.so" or "What needs me today on my website?"`);
}

function remove(opts) {
	const scope = scopeOf(opts);
	const root = projectRoot(opts);
	const state = stateFile(scope, root);
	const previous = readState(state);
	if (!previous) throw new UsageError(`nothing installed in ${scope === "user" ? "user scope" : root}`);
	const ids = opts["--all"] ? previous.skills : [...opts._, ...list(opts["--skills"])];
	if (!ids.length) throw new UsageError("name the skills to remove, or pass --all");
	const agents = opts["--agent"] && opts["--agent"] !== "auto" ? agentsFor(opts, scope, root, null) : previous.agents;
	const log = (line) => console.log(opts["--dry-run"] ? `[dry run] ${line}` : line);
	const files = { ...previous.files };
	const left = new Set(previous.skills);
	for (const id of ids) {
		if (!ID.test(id)) throw new UsageError(`bad skill id ${id}`);
		let gone = true;
		for (const agent of agents) {
			const target = join(skillDir(agent, scope, root), id);
			if (removeSkill(target, previous.files, opts, log)) {
				for (const k of Object.keys(files)) if (k.startsWith(target + sep)) delete files[k];
			} else gone = false;
		}
		if (gone) left.delete(id);
	}
	if (opts["--dry-run"]) return;
	if (!left.size) {
		rmSync(state, { force: true });
		console.log("All CMO.so skills removed.");
		return;
	}
	const selection = { categories: [], skills: [...left].sort() };
	writeFileSync(state, `${JSON.stringify({ ...previous, selection, skills: [...left].sort(), files, updated_at: new Date().toISOString() }, null, 2)}\n`);
	console.log(`${left.size} CMO.so skills still installed.`);
}

function listCmd(opts) {
	const catalog = loadCatalog();
	let installed = null;
	if (opts["--installed"]) {
		const scope = scopeOf(opts);
		installed = new Set(readState(stateFile(scope, projectRoot(opts)))?.skills || []);
	}
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
	console.log(`\n${rows.length} skills. Install: npx @cmo-so/skills install [--category seo,social] [--scope user]`);
}

function doctor(opts) {
	const catalog = loadCatalog();
	const scope = scopeOf(opts);
	const root = projectRoot(opts);
	const state = readState(stateFile(scope, root));
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
	report(true, `manifest ${stateFile(scope, root)} (installed v${state.version})`);
	if (state.version !== PKG.version) console.log(`INFO installed v${state.version}, package v${PKG.version}: run \`cmo-skills update${scope === "user" ? " --scope user" : ""}\``);
	for (const agent of state.agents) {
		const dir = skillDir(agent, scope, root);
		const missing = state.skills.filter((id) => !existsSync(join(dir, id, "SKILL.md")));
		report(!missing.length, `${agent}: ${state.skills.length - missing.length}/${state.skills.length} skills in ${dir}${missing.length ? ` (missing: ${missing.join(", ")})` : ""}`);
		const edited = Object.entries(state.files).filter(([p, h]) => p.startsWith(dir + sep) && existsSync(p) && sha(p) !== h).length;
		if (edited) console.log(`INFO ${agent}: ${edited} file(s) edited locally (kept on update)`);
	}
	if (scope === "project") {
		const mcp = readState(join(root, ".mcp.json"));
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
	console.log(`@cmo-so/skills ${PKG.version}: the CMO.so marketing skills for Claude Code and Codex

Usage: npx @cmo-so/skills <command> [options]

Commands
  install [SKILL ...]   Install skills (all by default; the core skills always come along)
  update                Update installed skills to this version; adds new skills in the categories you chose
  remove SKILL ... | --all   Remove skills (keeps folders you edited unless --force)
  list                  Show the skills by category
  doctor                Check an install
  mcp                   Connect the CMO.so MCP server (writes .mcp.json in project scope)

Options
  --scope project|user  project (default): <project>/.claude/skills and <project>/.agents/skills
                        user: ~/.claude/skills and ~/.codex/skills, for every project
  --global              Same as --scope user
  --project PATH        Project folder (default: current folder)
  --agent auto|claude|codex|all   Which agent to install for (auto: the ones set up, else Claude Code)
  --category LIST       Comma-separated categories or plugins, e.g. seo,social or cmo-so-seo
  --skills LIST         Comma-separated skill ids, e.g. cmo-seo-audit,cmo-x-growth
  --mcp                 Also add the CMO.so MCP server to the project's .mcp.json
  --force               Replace or remove files you edited
  --dry-run             Show what would change, change nothing
  --installed, --json   For list

Examples
  npx @cmo-so/skills install                         # all skills, this project
  npx @cmo-so/skills install --scope user            # all skills, every project
  npx @cmo-so/skills install --category seo,ai-search --mcp
  npx @cmo-so/skills install cmo-seo-audit cmo-x-growth --agent codex
  npx @cmo-so/skills@latest update --scope user

Prefer Claude Code plugins? /plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills`);
}

function main(argv) {
	const [command, ...rest] = argv;
	const opts = parse(rest);
	if (!command || command === "help" || command === "--help" || command === "-h" || opts["--help"] || opts["-h"]) return help();
	if (command === "--version" || command === "-v" || command === "version") return console.log(PKG.version);
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
