# @cmo-so/skills

The [CMO.so](https://cmo.so) marketing skills for **Claude Code, Codex, Pi, Cursor, Gemini CLI, OpenCode, GitHub Copilot, Windsurf** and other coding agents: 124 skills for SEO, AI search, content, social, email, paid ads, CRO, analytics and growth, powered by Maggie and the CMO.so MCP server.

Install them into one project, or for your user so every project gets them.

```sh
npx @cmo-so/skills install                  # this project, for the agents set up here
npx @cmo-so/skills install -g               # your user: every project
npx @cmo-so/skills install -g -a codex,pi   # pick the agents
```

Pi users can also install it as a Pi package: `pi install npm:@cmo-so/skills`.

## Supported platforms

| Platform | Install | MCP server |
|---|---|---|
| **Claude Code** | `npx @cmo-so/skills install -a claude`, or the plugin marketplace | `install --mcp` writes `.mcp.json`, or the `cmo-so` plugin |
| **Codex** (CLI, IDE, ChatGPT desktop) | `npx @cmo-so/skills install -a codex`, or `codex plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills` | `codex mcp add cmo-so --url https://mcp.cmo.so/mcp`, or the `cmo-so` plugin |
| **Pi** | `pi install npm:@cmo-so/skills`, or `npx @cmo-so/skills install -a pi` | `npx -y @cmo-so/mcp` |
| **Cursor, Gemini CLI, OpenCode, GitHub Copilot, Windsurf, Amp, Cline, Goose, Kiro, Qwen Code, Trae, Roo Code, Kilo Code, Augment, Factory Droid, OpenHands, Antigravity** | `npx @cmo-so/skills install -a <agent>` (ids in the table below) | Remote URL `https://mcp.cmo.so/mcp` |
| **Claude.ai, Claude Desktop** | Upload a skill folder as a zip ([standalone install](#standalone-install)) | Settings → Connectors → `https://mcp.cmo.so/mcp` |
| **ChatGPT** | The tools work through the MCP server | Custom MCP server `https://mcp.cmo.so/mcp` |
| **Any other agent** | [Standalone install](#standalone-install) into the folder it reads | Remote URL or `npx -y @cmo-so/mcp` |

Tested end to end on Claude Code, Codex and Pi; the other folders follow each agent's documented skills location.

## Agents and folders

`--agent` (`-a`) takes one or more agent ids, comma-separated. `auto` (the default) installs for the agents already set up in that scope (their folders exist), else for Claude Code; `all` installs for every agent below. Agents that share a folder get one copy.

| `--agent` | Agent | Project scope | User scope (`-g`) |
|---|---|---|---|
| `claude` | Claude Code | `.claude/skills` | `~/.claude/skills` (`CLAUDE_CONFIG_DIR`) |
| `codex` | Codex | `.agents/skills` | `~/.agents/skills` |
| `pi` | Pi | `.agents/skills` | `~/.agents/skills` |
| `cursor` | Cursor | `.agents/skills` | `~/.cursor/skills` |
| `gemini` | Gemini CLI | `.agents/skills` | `~/.gemini/skills` |
| `opencode` | OpenCode | `.agents/skills` | `~/.config/opencode/skills` |
| `copilot` | GitHub Copilot | `.agents/skills` | `~/.copilot/skills` |
| `amp` | Amp | `.agents/skills` | `~/.config/agents/skills` |
| `cline` | Cline | `.agents/skills` | `~/.agents/skills` |
| `windsurf` | Windsurf | `.windsurf/skills` | `~/.codeium/windsurf/skills` |
| `goose` | Goose | `.goose/skills` | `~/.config/goose/skills` |
| `kiro` | Kiro | `.kiro/skills` | `~/.kiro/skills` |
| `qwen` | Qwen Code | `.qwen/skills` | `~/.qwen/skills` |
| `trae` | Trae | `.trae/skills` | `~/.trae/skills` |
| `roo` | Roo Code | `.roo/skills` | `~/.roo/skills` |
| `kilo` | Kilo Code | `.kilocode/skills` | `~/.kilocode/skills` |
| `augment` | Augment | `.augment/skills` | `~/.augment/skills` |
| `droid` | Factory Droid | `.factory/skills` | `~/.factory/skills` |
| `openhands` | OpenHands | `.openhands/skills` | `~/.openhands/skills` |
| `antigravity` | Antigravity | `.agent/skills` | `~/.gemini/antigravity/skills` |

`npx @cmo-so/skills agents` prints this table and marks the agents found on your machine. The install record lives in `<project>/.cmo-so/skills-install.json`, or `~/.config/cmo-so/skills-install.json` for the user scope (`CMO_SO_HOME`). Commit the project's skill folders and `.cmo-so/` to share the skills with your team.

## Pick what you need

```sh
npx @cmo-so/skills list                                   # every skill, by category
npx @cmo-so/skills install --category seo,ai-search       # categories (or plugin names like cmo-so-seo)
npx @cmo-so/skills install cmo-seo-audit cmo-x-growth     # single skills
```

The 12 core skills (connect, daily check-in, weekly report…) always come along: the other skills hand off to them.

## Connect the MCP server

The core skills run on the CMO.so MCP server, `https://mcp.cmo.so/mcp` (OAuth: sign in to CMO.so, no keys to paste).

```sh
npx @cmo-so/skills install --mcp      # also adds it to the project's .mcp.json (Claude Code)
npx @cmo-so/skills mcp -g             # prints the commands for Claude Code, Codex, Gemini CLI, Cursor and Pi
```

## Update and remove

```sh
npx @cmo-so/skills@latest update                 # this project
npx @cmo-so/skills@latest update -g              # your user
npx @cmo-so/skills remove cmo-x-growth           # or --all; -a codex removes it for one agent only
npx @cmo-so/skills doctor                        # check an install
```

`update` brings installed skills to the new version, for the agents you installed them for, and adds new skills in the categories you chose. Files you edited are kept (you'll see `kept …`); pass `--force` to replace them. `remove` also keeps folders you edited unless you pass `--force`. Every command accepts `--dry-run`.

Installed with 0.3.0 for Codex in user scope? Those skills are in `~/.codex/skills`, and updates keep going there. Codex now reads `~/.agents/skills`: run `npx @cmo-so/skills install -g -a codex` to move over.

## Standalone install

Each skill is one self-contained folder with a `SKILL.md` (the open Agent Skills format), so you can also install without this package.

All skills, without Node (macOS, Linux, WSL; change the target to the folder your agent reads):

```sh
git clone --depth 1 https://github.com/AI-Marketing-OS-LTD/cmo-so-skills.git
mkdir -p ~/.agents/skills
cp -R cmo-so-skills/plugins/*/skills/* ~/.agents/skills/
```

One skill, no clone:

```sh
mkdir -p ~/.agents/skills
curl -sL https://github.com/AI-Marketing-OS-LTD/cmo-so-skills/archive/refs/heads/main.tar.gz \
  | tar -xz --strip-components=4 -C ~/.agents/skills cmo-so-skills-main/plugins/cmo-so-seo/skills/cmo-seo-audit
```

- Windows: download the [ZIP](https://github.com/AI-Marketing-OS-LTD/cmo-so-skills/archive/refs/heads/main.zip) and copy the folders from `plugins\<plugin>\skills\` to your agent's skills folder, or run `npx @cmo-so/skills` in PowerShell.
- Claude.ai and Claude Desktop: zip one skill folder (for example `cmo-seo-audit/`) and upload it in Settings → Capabilities → Skills.
- Agents without a skills folder: paste a `SKILL.md` into the agent's custom instructions or rules.
- The open `skills` CLI: `npx skills add AI-Marketing-OS-LTD/cmo-so-skills -a <agent>`.

Copied by hand, skills are updated by copying again; installed with `npx @cmo-so/skills`, `update` keeps your edits.

## Other ways to install

- Claude Code plugins: `/plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills`, then `/plugin install cmo-so-all@cmo-so`.
- Codex plugins: `codex plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills`, then `codex plugin add cmo-so@cmo-so` (it brings the MCP server; `codex mcp login cmo-so` signs in).
- Pi packages: `pi install npm:@cmo-so/skills` or `pi install git:github.com/AI-Marketing-OS-LTD/cmo-so-skills`.

Source, skills index and changelog: [AI-Marketing-OS-LTD/cmo-so-skills](https://github.com/AI-Marketing-OS-LTD/cmo-so-skills).

## License

MIT © AI Marketing OS Ltd. Third-party notices: `THIRD_PARTY_NOTICES.md`.
