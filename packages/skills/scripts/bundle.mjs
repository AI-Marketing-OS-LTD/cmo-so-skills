// Copies the generated skills from ../../plugins into this package before `npm pack` / `npm publish`.
// plugins/<plugin>/skills/<id>/SKILL.md -> skills/<id>/SKILL.md, plus a slim catalog.json.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(pkgRoot, "..", "..");
const pkg = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));
const index = JSON.parse(readFileSync(join(repoRoot, "skills.json"), "utf8"));

if (index.version !== pkg.version) {
	throw new Error(`package.json version ${pkg.version} != skills.json version ${index.version}; run package.py or bump both`);
}

const out = join(pkgRoot, "skills");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const ids = new Set();
for (const plugin of readdirSync(join(repoRoot, "plugins"))) {
	const skillsDir = join(repoRoot, "plugins", plugin, "skills");
	if (!existsSync(skillsDir)) continue;
	for (const id of readdirSync(skillsDir)) {
		if (!existsSync(join(skillsDir, id, "SKILL.md"))) continue;
		if (ids.has(id)) throw new Error(`duplicate skill ${id}`);
		ids.add(id);
		cpSync(join(skillsDir, id), join(out, id), { recursive: true });
	}
}

const skills = index.skills.map((s) => ({
	id: s.id,
	name: s.name,
	category: s.category,
	category_name: s.category_name,
	plugin: s.plugin,
	tier: s.tier,
	channels: s.channels,
	summary: s.summary,
}));
const missing = skills.filter((s) => !ids.has(s.id)).map((s) => s.id);
const extra = [...ids].filter((id) => !skills.some((s) => s.id === id));
if (missing.length || extra.length) throw new Error(`skills.json and plugins differ: missing ${missing} extra ${extra}`);

writeFileSync(
	join(pkgRoot, "catalog.json"),
	`${JSON.stringify({ version: index.version, updated: index.updated, mcp_server: index.install.mcp_server, categories: index.categories, skills }, null, "\t")}\n`,
);
for (const file of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) cpSync(join(repoRoot, file), join(pkgRoot, file));
console.log(`bundled ${ids.size} skills (v${pkg.version})`);
