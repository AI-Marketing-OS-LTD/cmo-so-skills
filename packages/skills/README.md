# @cmo-so/skills

The [CMO.so](https://cmo.so) marketing skills for **Claude Code, Codex, Pi, Cursor, Gemini CLI, OpenCode, GitHub Copilot, Windsurf** and other coding agents: 124 skills for SEO, AI search, content, social, email, paid ads, CRO, analytics and growth, powered by Maggie and the CMO.so MCP server.

Install them into one project, or for your user so every project gets them.

```sh
npx @cmo-so/skills install                  # this project, for the agents set up here
npx @cmo-so/skills install -g               # your user: every project
npx @cmo-so/skills install -g -a codex,pi   # pick the agents
```

Pi users can also install it as a Pi package: `pi install npm:@cmo-so/skills`.

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

## Other ways to install

- Claude Code plugins: `/plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills`, then `/plugin install cmo-so-all@cmo-so`.
- Codex plugins: `codex plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills`, then `codex plugin add cmo-so@cmo-so` (it brings the MCP server; `codex mcp login cmo-so` signs in).
- Pi: `pi install npm:@cmo-so/skills` or `pi install git:github.com/AI-Marketing-OS-LTD/cmo-so-skills`.
- The open `skills` CLI: `npx skills add AI-Marketing-OS-LTD/cmo-so-skills -a <agent>`.

## License

MIT © AI Marketing OS Ltd. Third-party notices: `THIRD_PARTY_NOTICES.md`.
