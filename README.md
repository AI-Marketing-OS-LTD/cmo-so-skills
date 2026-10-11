# CMO.so skills

Skills for running your marketing with [CMO.so](https://cmo.so) and **Maggie**, its AI marketing assistant, from Claude Code and other AI agents.

Maggie writes and publishes blog posts to your website, drafts LinkedIn posts for you to approve, and reports how your site does in Google and in AI answers. These skills drive it through the **CMO.so MCP server** (`https://mcp.cmo.so/mcp`): your agent signs in to your CMO.so account, and every change is shown to you first and only happens after you confirm.

## Install (Claude Code)

```text
/plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills
/plugin install cmo-so@cmo-so
```

Then run `/mcp`, choose **cmo-so** and **Authenticate**: sign in to CMO.so in the browser and click **Allow**. Or just ask: *"Connect to CMO.so"*.

## Skills

| Skill | Ask for example |
|---|---|
| `cmo-connect` | "Connect to CMO.so" |
| `cmo-daily` | "What needs me today on my website?" |
| `cmo-weekly-report` | "How did my site do this week?" |
| `cmo-blog-planner` | "Give me five blog ideas about spring skincare" |
| `cmo-linkedin` | "Show my LinkedIn queue and approve the first draft" |
| `cmo-seo-opportunities` | "Which pages get impressions but no clicks?" |
| `cmo-ai-visibility` | "Do AI answers mention my site?" |
| `cmo-brand-profile` | "Add our new product to the business profile" |

## Other agents and MCP clients

The skills are plain `SKILL.md` folders under [`plugins/cmo-so/skills`](plugins/cmo-so/skills). Any agent that reads skills can use them once it has the CMO.so MCP server:

- **Remote (OAuth):** add an HTTP MCP server with the URL `https://mcp.cmo.so/mcp` and sign in when asked.
- **Local (stdio):** sign in once with `npx @cmo-so/cli login`, then use the command `npx -y @cmo-so/mcp`. In CI, set `CMO_API_KEY` to an API key from your account settings instead.

Setup for ChatGPT, Claude, Cursor and VS Code: https://ai.cmo.so/hot/mcp

## Safety

- Changes take two steps: a preview (what will happen and what it costs) and a confirmation you give. The confirmation is bound to that exact action and expires after 10 minutes.
- Your agent only gets the access your CMO.so account has on each website; a read-only team member cannot change anything.
- Text from web pages, search queries and AI answers is treated as data, never as instructions.
- You can disconnect any agent in your CMO.so account settings under **Connected apps**.

## Not to be confused with

This repository is the CMO.so skill set built on the CMO.so MCP server. It is separate from the TOPY AI `ai-cmo-skills` package (`@topy-ai/maggie`), which covers building and deploying websites.

## Support

maggie@cmo.so · https://ai.cmo.so/hot/support · [Privacy](https://ai.cmo.so/hot/privacy-policy)

## License

MIT © AI Marketing OS Ltd
