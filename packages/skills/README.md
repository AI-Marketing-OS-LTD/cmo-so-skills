# @cmo-so/skills

The [CMO.so](https://cmo.so) marketing skills for **Claude Code** and **Codex**: 124 skills for SEO, AI search, content, social, email, paid ads, CRO, analytics and growth, powered by Maggie and the CMO.so MCP server.

Install them into one project, or for your user so every project gets them.

```sh
npx @cmo-so/skills install                    # all skills, this project (.claude/skills)
npx @cmo-so/skills install --scope user       # all skills, every project (~/.claude/skills)
```

## Scopes

| Scope | Claude Code | Codex | Install record |
|---|---|---|---|
| `project` (default) | `<project>/.claude/skills` | `<project>/.agents/skills` | `<project>/.cmo-so/skills-install.json` |
| `user` (`--global`) | `~/.claude/skills` (`CLAUDE_CONFIG_DIR`) | `~/.codex/skills` (`CODEX_HOME`) | `~/.config/cmo-so/skills-install.json` (`CMO_SO_HOME`) |

`--agent auto` (the default) installs for the agents already set up in that scope, or for Claude Code if neither is. Use `--agent claude`, `codex` or `all` to choose. Commit the project's `.claude/skills` (and `.cmo-so/`) to share the skills with your team.

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
npx @cmo-so/skills install --mcp      # also adds it to the project's .mcp.json
npx @cmo-so/skills mcp --scope user   # prints the commands for Claude Code and Codex
```

Then in Claude Code: `/mcp` → **cmo-so** → **Authenticate**.

## Update and remove

```sh
npx @cmo-so/skills@latest update                 # this project
npx @cmo-so/skills@latest update --scope user    # your user
npx @cmo-so/skills remove cmo-x-growth           # or --all
npx @cmo-so/skills doctor                        # check an install
```

`update` brings installed skills to the new version and adds new skills in the categories you chose. Files you edited are kept (you'll see `kept …`); pass `--force` to replace them. `remove` also keeps folders you edited unless you pass `--force`. Every command accepts `--dry-run`.

## Other ways to install

- Claude Code plugins: `/plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills`, then `/plugin install cmo-so-all@cmo-so`.
- Any agent that reads `SKILL.md` folders: copy them from [the repository](https://github.com/AI-Marketing-OS-LTD/cmo-so-skills/tree/main/plugins).

## License

MIT © AI Marketing OS Ltd. Third-party notices: `THIRD_PARTY_NOTICES.md`.
