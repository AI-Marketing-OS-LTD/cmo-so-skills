<div align="center">
  <p>
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="assets/cmo-so-logo-light.png">
      <source media="(prefers-color-scheme: light)" srcset="assets/cmo-so-logo.png">
      <img src="assets/cmo-so-logo.png" alt="AI Marketing OS — CMO.so" width="110" height="110" />
    </picture>
  </p>
  <h1>CMO.so Skills</h1>
  <p><strong>124 marketing skills for Claude Code and other AI agents, powered by Maggie and the CMO.so MCP server.</strong></p>
  <p>
    <a href="https://cmo.so">Website</a> |
    <a href="https://ai.cmo.so">Dashboard</a> |
    <a href="https://ai.cmo.so/hot/mcp">MCP setup</a> |
    <a href="https://ai.cmo.so/hot/support">Support</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/AI%20Marketing%20OS-EF476F?style=for-the-badge" alt="AI Marketing OS">
    <img src="https://img.shields.io/badge/Skills-124-0074BA?style=for-the-badge" alt="124 skills">
    <img src="https://img.shields.io/badge/Plugins-13%20%2B%20bundle-0074BA?style=for-the-badge" alt="13 plugins plus a bundle">
    <img src="https://img.shields.io/badge/MCP-mcp.cmo.so-0074BA?style=for-the-badge" alt="MCP server">
    <img src="https://img.shields.io/badge/License-MIT-EF476F?style=for-the-badge" alt="MIT licence">
  </p>
</div>

<div align="center">
Maggie, the AI marketing assistant in <a href="https://cmo.so">CMO.so</a>, writes and publishes blog posts to your website, drafts LinkedIn posts for you to approve, and reports how your site does in Google and in AI answers. These skills bring that, plus a full marketing playbook, to the agent you already use.
<br/><br/>
<a href="#quick-start">Quick start</a> · <a href="#how-it-works">How it works</a> · <a href="#skills">Skills</a> · <a href="#the-cmoso-mcp-server">MCP server</a> · <a href="#the-cmo-cli">CLI</a> · <a href="#safety">Safety</a> · <a href="#credits">Credits</a>
</div>

---

## At a glance

<table>
  <tr>
    <td><strong>Skills</strong><br/>124, one job each</td>
    <td><strong>Plugins</strong><br/>13 categories + <code>cmo-so-all</code></td>
    <td><strong>Core</strong><br/>CMO.so MCP server (OAuth)</td>
    <td><strong>Index</strong><br/><a href="skills.json"><code>skills.json</code></a></td>
  </tr>
</table>

---

## What's new in 0.4.0

- **Every popular coding agent.** Codex plugins (`codex plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills`), Pi packages (`pi install npm:@cmo-so/skills`), and `npx @cmo-so/skills install -a <agent>` for Cursor, Gemini CLI, OpenCode, GitHub Copilot, Windsurf and 13 more, in project or user scope.
- Codex skills now go to `~/.agents/skills`, the folder Codex reads.

## What's new in 0.3.0

Ten new skills, and 72 existing skills improved with rules, checklists and platform details from a review of 196 open-source marketing, SEO, social media and analytics projects:

- **Social channels:** `cmo-open-social` (Threads, Bluesky, Mastodon), `cmo-reddit`, `cmo-pinterest`, `cmo-china-social` (Xiaohongshu, WeChat, Douyin, Weibo).
- **Social operations:** `cmo-social-listening`, `cmo-social-crisis`, `cmo-employee-advocacy`.
- **Trust and delivery:** `cmo-email-deliverability`, `cmo-brand-protection`, `cmo-agent-readiness` (make your site usable by AI agents).

---

## Quick start

Pick your agent. Every route installs the same 124 skills; the core ones run on the [CMO.so MCP server](#the-cmoso-mcp-server).

| Agent | Install |
|---|---|
| **Claude Code** | `/plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills` then `/plugin install cmo-so-all@cmo-so` |
| **Codex** | `codex plugin marketplace add AI-Marketing-OS-LTD/cmo-so-skills` then `codex plugin add cmo-so@cmo-so` (and any category, e.g. `cmo-so-seo@cmo-so`) |
| **Pi** | `pi install npm:@cmo-so/skills` (or `pi install git:github.com/AI-Marketing-OS-LTD/cmo-so-skills`) |
| **Cursor, Gemini CLI, OpenCode, GitHub Copilot, Windsurf, Amp, Cline, Goose, Kiro, Qwen Code, Trae, Roo, Kilo, Augment, Droid, OpenHands, Antigravity** | `npx @cmo-so/skills install -a cursor` (any agent id; comma-separated for several) |
| **Any agent, any scope** | `npx @cmo-so/skills install` (this project) or `npx @cmo-so/skills install -g` (your user) |

[`@cmo-so/skills`](https://www.npmjs.com/package/@cmo-so/skills) installs into the folder each agent reads, for one project or for your user:

```sh
npx @cmo-so/skills install                       # this project, for the agents set up here (.claude/skills, .agents/skills, …)
npx @cmo-so/skills install -g -a codex,pi        # every project: ~/.agents/skills (Codex, Pi)
npx @cmo-so/skills install -a claude --category seo,social --mcp   # some categories, plus the MCP server in .mcp.json
npx @cmo-so/skills agents                        # every supported agent and its folders
npx @cmo-so/skills@latest update -g              # update later; your edits are kept
```

See [`packages/skills`](packages/skills/README.md) for update, remove and the other options. The skills also work with the open `skills` CLI: `npx skills add AI-Marketing-OS-LTD/cmo-so-skills -a <agent>`.

**Connect the MCP server** (the core skills need it; sign in with your CMO.so account, no keys):

| Agent | Connect |
|---|---|
| Claude Code | The plugin brings it: `/mcp` → **cmo-so** → **Authenticate**. Otherwise `claude mcp add --transport http cmo-so https://mcp.cmo.so/mcp` |
| Codex | The `cmo-so` plugin brings it: `codex mcp login cmo-so`. Otherwise `codex mcp add cmo-so --url https://mcp.cmo.so/mcp` |
| Gemini CLI | `gemini mcp add --transport http cmo-so https://mcp.cmo.so/mcp` |
| Cursor, VS Code, Windsurf | Add a remote MCP server with the URL `https://mcp.cmo.so/mcp` |
| Pi and agents that start a command | `npx -y @cmo-so/mcp` (stdio), after `npx @cmo-so/cli login` |

Or just ask your agent: *"Connect to CMO.so"*.

Try asking:

- *"What needs me today on my website?"*
- *"How did my site do this week?"*
- *"Which pages get impressions but no clicks?"*
- *"Do AI answers mention my site?"*
- *"Write three LinkedIn posts from my latest article and queue them."*

## How it works

Every skill is a `SKILL.md` your agent loads when the task matches. Skills come in three tiers:

| Tier | What it means |
|---|---|
| **core** | Runs on the CMO.so MCP server: Maggie's blog autopilot, LinkedIn queue, Search Console, AI visibility and business profile. Needs a CMO.so account. |
| **connected** | Uses CMO.so data and actions when the server is connected, for example your business profile or queueing a blog idea. Works without it too. |
| **standalone** | A marketing method that works with any agent, such as ad audits, pricing or PR. CMO.so is optional. |

Each category is its own plugin, and every plugin installs `cmo-so` (the core skills and the MCP connection) with it. Install everything with `cmo-so-all`, or only what you need, for example `/plugin install cmo-so-seo@cmo-so`.

## Skills

<!-- skills:start -->

**124 skills in 13 plugins**, plus the `cmo-so-all` bundle. Generated from the catalog: please open an issue rather than editing a `SKILL.md`.

### CMO.so core (MCP) · `cmo-so`

| Skill | What it does |
|---|---|
| [`cmo-connect`](plugins/cmo-so/skills/cmo-connect/SKILL.md) | Connect an AI agent to CMO.so through the MCP server (OAuth, or CLI/API key without a browser) and pick the website to work on. |
| [`cmo-daily`](plugins/cmo-so/skills/cmo-daily/SKILL.md) | What needs the user today (LinkedIn drafts, failures, setup steps, quota) and clearing it one approved action at a time. |
| [`cmo-weekly-report`](plugins/cmo-so/skills/cmo-weekly-report/SKILL.md) | Weekly report from CMO.so data: posts, Search Console, AI visibility, best and worst content, and two or three next steps. |
| [`cmo-blog-planner`](plugins/cmo-so/skills/cmo-blog-planner/SKILL.md) | Plan the blog in CMO.so: ideas from links, sentences, AI generation or the sitemap, and the ordered writing plan Maggie follows. |
| [`cmo-linkedin`](plugins/cmo-so/skills/cmo-linkedin/SKILL.md) | Run the LinkedIn queue in CMO.so: review and approve drafts, turn articles into posts, plan days, campaigns, pause and resume. |
| [`cmo-seo-opportunities`](plugins/cmo-so/skills/cmo-seo-opportunities/SKILL.md) | Quick SEO wins from Search Console and content performance: low-CTR queries, positions 4-15, no-traffic articles, then Maggie rewrites. |
| [`cmo-ai-visibility`](plugins/cmo-so/skills/cmo-ai-visibility/SKILL.md) | Monitor how the website shows up in AI answers: score, watched prompts, cited pages, live checks and keywords to watch. |
| [`cmo-brand-profile`](plugins/cmo-so/skills/cmo-brand-profile/SKILL.md) | Complete the business profile every other skill reads: offer, products, audiences, competitors, CTAs, testimonials and brand voice. |
| [`cmo-website-setup`](plugins/cmo-so/skills/cmo-website-setup/SKILL.md) | Get a website ready in CMO.so: verify ownership by email or DNS, detect the platform, and hand off the publishing connection to a computer. |
| [`cmo-autopilot`](plugins/cmo-so/skills/cmo-autopilot/SKILL.md) | Tune how Maggie publishes: posts per day, pause and resume, rewrite policy for old posts, and the content guard that blocks off-brand text. |
| [`cmo-draft-review`](plugins/cmo-so/skills/cmo-draft-review/SKILL.md) | Review Maggie's blog drafts before they go out: read, edit, ask for a rewrite, delete, or publish one now. |
| [`cmo-team-access`](plugins/cmo-so/skills/cmo-team-access/SKILL.md) | Manage who can do what on a website and the account itself: team permissions, connected apps, API keys and notifications. |

### Strategy & research · `cmo-so-strategy`

| Skill | What it does |
|---|---|
| [`cmo-customer-research`](plugins/cmo-so-strategy/skills/cmo-customer-research/SKILL.md) | Build the ideal customer profile and personas from interviews, reviews and data: pains, triggers, objections and their words. |
| [`cmo-positioning`](plugins/cmo-so-strategy/skills/cmo-positioning/SKILL.md) | Sharpen positioning, value proposition and messaging hierarchy, and keep brand guidelines consistent across channels. |
| [`cmo-competitor-research`](plugins/cmo-so-strategy/skills/cmo-competitor-research/SKILL.md) | Profile competitors from their sites and search footprint: positioning, offers, content themes, keywords, links and gaps to exploit. |
| [`cmo-marketing-plan`](plugins/cmo-so-strategy/skills/cmo-marketing-plan/SKILL.md) | A practical marketing plan: goals, audience, channels, budget, 90-day roadmap and the CMO.so autopilot as the engine for content. |
| [`cmo-marketing-audit`](plugins/cmo-so-strategy/skills/cmo-marketing-audit/SKILL.md) | Score a website's marketing end to end (message, SEO, AI visibility, conversion, social, email) and rank the fixes. |
| [`cmo-marketing-ideas`](plugins/cmo-so-strategy/skills/cmo-marketing-ideas/SKILL.md) | Generate and rank marketing ideas that fit the business, budget and stage, with the first step for each. |
| [`cmo-marketing-psychology`](plugins/cmo-so-strategy/skills/cmo-marketing-psychology/SKILL.md) | Apply behavioural principles (social proof, anchoring, loss aversion, defaults) to pages, offers and emails, ethically. |
| [`cmo-offer-design`](plugins/cmo-so-strategy/skills/cmo-offer-design/SKILL.md) | Design an irresistible offer: value framing, bonuses, guarantees, urgency that is real, and how to present it. |
| [`cmo-pricing-strategy`](plugins/cmo-so-strategy/skills/cmo-pricing-strategy/SKILL.md) | Choose pricing model, tiers, value metric and the pricing page, and plan price changes. |
| [`cmo-expert-panel`](plugins/cmo-so-strategy/skills/cmo-expert-panel/SKILL.md) | Score and improve any copy, plan or campaign with a simulated panel of expert reviewers until it clears a quality bar. |
| [`cmo-brand-naming`](plugins/cmo-so-strategy/skills/cmo-brand-naming/SKILL.md) | Find and vet names for a business, product or feature: meaning, pronunciation across markets, domain and trademark checks. |
| [`cmo-market-sizing`](plugins/cmo-so-strategy/skills/cmo-market-sizing/SKILL.md) | Estimate TAM, SAM and SOM bottom-up and top-down, with stated assumptions, to size goals and budgets. |
| [`cmo-brand-protection`](plugins/cmo-so-strategy/skills/cmo-brand-protection/SKILL.md) | Respond to fake websites, phishing pages and impersonation of the brand: collect evidence, report in parallel, warn customers and win back branded search. |

### SEO · `cmo-so-seo`

| Skill | What it does |
|---|---|
| [`cmo-seo-audit`](plugins/cmo-so-seo/skills/cmo-seo-audit/SKILL.md) | Full SEO audit of a site: technical health, on-page, content, links and search data, delivered as a short prioritised fix list. |
| [`cmo-technical-seo`](plugins/cmo-so-seo/skills/cmo-technical-seo/SKILL.md) | Crawlability, indexing, Core Web Vitals, rendering, redirects and IndexNow: find and fix what stops pages being found. |
| [`cmo-page-seo`](plugins/cmo-so-seo/skills/cmo-page-seo/SKILL.md) | Optimise one page for its query: title, meta, headings, intent match, internal links, images and alt text. |
| [`cmo-keyword-research`](plugins/cmo-so-seo/skills/cmo-keyword-research/SKILL.md) | Find keywords worth targeting from Search Console, competitors and SERPs, judged by intent, difficulty and fit, then add them as ideas. |
| [`cmo-keyword-clustering`](plugins/cmo-so-seo/skills/cmo-keyword-clustering/SKILL.md) | Group keywords by search intent and SERP overlap into topic clusters, mapped to existing or new pages. |
| [`cmo-content-brief`](plugins/cmo-so-seo/skills/cmo-content-brief/SKILL.md) | A competitive brief for one article: intent, outline, sections, entities, questions, internal links and the CTA. |
| [`cmo-content-refresh`](plugins/cmo-so-seo/skills/cmo-content-refresh/SKILL.md) | Revive decaying or no-traffic posts: diagnose why, rewrite with Maggie, and track the result. |
| [`cmo-site-architecture`](plugins/cmo-so-seo/skills/cmo-site-architecture/SKILL.md) | Plan page hierarchy, URLs, navigation, sitemaps and internal linking so authority flows to the pages that matter. |
| [`cmo-schema-markup`](plugins/cmo-so-seo/skills/cmo-schema-markup/SKILL.md) | Add, fix and validate JSON-LD structured data for rich results and for AI answers. |
| [`cmo-programmatic-seo`](plugins/cmo-so-seo/skills/cmo-programmatic-seo/SKILL.md) | Build many useful pages from a template and data (locations, integrations, comparisons) without thin or duplicate content. |
| [`cmo-competitor-pages`](plugins/cmo-so-seo/skills/cmo-competitor-pages/SKILL.md) | Fair, useful "X vs Y" and "alternatives to X" pages that rank and help buyers decide. |
| [`cmo-local-seo`](plugins/cmo-so-seo/skills/cmo-local-seo/SKILL.md) | Win local search: Google Business Profile, NAP consistency, reviews, local pages, citations and map rankings. |
| [`cmo-international-seo`](plugins/cmo-so-seo/skills/cmo-international-seo/SKILL.md) | Serve the right language and country: hreflang, URL strategy, and localised (not just translated) content. |
| [`cmo-ecommerce-seo`](plugins/cmo-so-seo/skills/cmo-ecommerce-seo/SKILL.md) | Product and category pages, product schema, Shopping visibility and faceted navigation for online stores. |
| [`cmo-link-building`](plugins/cmo-so-seo/skills/cmo-link-building/SKILL.md) | Analyse the backlink profile and earn new links: prospect lists, outreach drafts, digital PR angles and directory placements. |
| [`cmo-seo-monitoring`](plugins/cmo-so-seo/skills/cmo-seo-monitoring/SKILL.md) | Baseline the SEO-critical parts of key pages and catch regressions (titles, canonicals, noindex, schema) before traffic drops. |
| [`cmo-search-intent`](plugins/cmo-so-seo/skills/cmo-search-intent/SKILL.md) | Read what the SERP rewards for a query and reshape the page type and content to match the intent. |
| [`cmo-seo-plan`](plugins/cmo-so-seo/skills/cmo-seo-plan/SKILL.md) | An SEO strategy for a new or existing site: priorities, topic map, technical baseline and a quarter-by-quarter roadmap. |

### AI search (GEO / AEO) · `cmo-so-ai-search`

| Skill | What it does |
|---|---|
| [`cmo-ai-visibility-audit`](plugins/cmo-so-ai-search/skills/cmo-ai-visibility-audit/SKILL.md) | A one-off report on how the brand shows up in AI answers for its market and the few changes most likely to get it cited. |
| [`cmo-ai-prompt-research`](plugins/cmo-so-ai-search/skills/cmo-ai-prompt-research/SKILL.md) | Find the questions people ask AI assistants about the market, how they are answered, and which sites get cited. |
| [`cmo-ai-citation-gaps`](plugins/cmo-so-ai-search/skills/cmo-ai-citation-gaps/SKILL.md) | Find the pages AI assistants cite in the category and which of those sources the brand can get into or out-do. |
| [`cmo-ai-brand-monitoring`](plugins/cmo-so-ai-search/skills/cmo-ai-brand-monitoring/SKILL.md) | Track what AI assistants say about the brand over time and catch wrong, outdated or damaging claims. |
| [`cmo-aeo-content`](plugins/cmo-so-ai-search/skills/cmo-aeo-content/SKILL.md) | Restructure pages so AI assistants can quote them: direct answers, facts, sources, E-E-A-T signals and schema. |
| [`cmo-agent-readiness`](plugins/cmo-so-ai-search/skills/cmo-agent-readiness/SKILL.md) | Make a site usable by AI agents that browse, fill in forms and buy for people: accessibility tree, layout stability, access policy, discovery files and safe agent tools, fixed in priority order. |

### Content & copy · `cmo-so-content`

| Skill | What it does |
|---|---|
| [`cmo-content-strategy`](plugins/cmo-so-content/skills/cmo-content-strategy/SKILL.md) | Decide what to publish and why: pillars, topics by funnel stage, formats, cadence and how CMO.so's autopilot executes it. |
| [`cmo-blog-writing`](plugins/cmo-so-content/skills/cmo-blog-writing/SKILL.md) | Write or direct one blog post from brief to publish-ready, in the brand voice, then hand it to Maggie's queue. |
| [`cmo-copywriting`](plugins/cmo-so-content/skills/cmo-copywriting/SKILL.md) | Write page copy that converts: homepage, landing, pricing, feature and about pages, built on the brand profile. |
| [`cmo-copy-editing`](plugins/cmo-so-content/skills/cmo-copy-editing/SKILL.md) | Edit existing copy for clarity, specificity, proof and flow with a structured review pass. |
| [`cmo-humanize`](plugins/cmo-so-content/skills/cmo-humanize/SKILL.md) | Remove AI writing tells so text reads like a person wrote it, without losing facts. |
| [`cmo-content-repurposing`](plugins/cmo-so-content/skills/cmo-content-repurposing/SKILL.md) | Turn one article, podcast or video into LinkedIn posts, threads, emails, ad hooks and short videos. |
| [`cmo-lead-magnets`](plugins/cmo-so-content/skills/cmo-lead-magnets/SKILL.md) | Plan and build a lead magnet people actually want, and the capture and follow-up around it. |
| [`cmo-thought-leadership`](plugins/cmo-so-content/skills/cmo-thought-leadership/SKILL.md) | Turn a founder's experience and notes into a point of view and a steady stream of long-form posts. |

### Social & community · `cmo-so-social`

| Skill | What it does |
|---|---|
| [`cmo-social-strategy`](plugins/cmo-so-social/skills/cmo-social-strategy/SKILL.md) | Pick platforms, pillars, cadence and formats, and run a content calendar with CMO.so's LinkedIn queue as the engine. |
| [`cmo-linkedin-posts`](plugins/cmo-so-social/skills/cmo-linkedin-posts/SKILL.md) | Write and lint LinkedIn posts (story, how-to, opinion, carousel, poll) with strong hooks, then queue them in CMO.so. |
| [`cmo-linkedin-profile`](plugins/cmo-so-social/skills/cmo-linkedin-profile/SKILL.md) | Audit and rewrite a LinkedIn profile or company page: headline, About, experience, Featured and banner. |
| [`cmo-linkedin-engagement`](plugins/cmo-so-social/skills/cmo-linkedin-engagement/SKILL.md) | Grow reach through comments, replies and connection notes with a daily routine that does not feel spammy. |
| [`cmo-linkedin-strategy`](plugins/cmo-so-social/skills/cmo-linkedin-strategy/SKILL.md) | Positioning, content pillars and a test plan for LinkedIn, judged by what the numbers actually say. |
| [`cmo-x-growth`](plugins/cmo-so-social/skills/cmo-x-growth/SKILL.md) | Build an audience on X: positioning, posts and threads, reply strategy and what to measure. |
| [`cmo-social-analytics`](plugins/cmo-so-social/skills/cmo-social-analytics/SKILL.md) | Measure social performance honestly: engagement, reach, clicks and pipeline, with benchmarks and next tests. |
| [`cmo-community`](plugins/cmo-so-social/skills/cmo-community/SKILL.md) | Start or grow a community (Discord, Slack, forum, Reddit) that drives product growth and loyalty. |
| [`cmo-influencer`](plugins/cmo-so-social/skills/cmo-influencer/SKILL.md) | Find, vet and brief creators, structure deals and measure what each partnership returns. |
| [`cmo-youtube`](plugins/cmo-so-social/skills/cmo-youtube/SKILL.md) | Plan a YouTube channel: topics from outlier analysis, titles and thumbnails, scripts and what to measure. |
| [`cmo-short-form-video`](plugins/cmo-so-social/skills/cmo-short-form-video/SKILL.md) | Ideas, hooks, scripts and an edit plan for Reels, TikTok and Shorts from what the business already knows. |
| [`cmo-organic-social`](plugins/cmo-so-social/skills/cmo-organic-social/SKILL.md) | Grow organically on Instagram, TikTok and Facebook: profile, formats, posting rhythm, hooks and what to measure. |
| [`cmo-china-social`](plugins/cmo-so-social/skills/cmo-china-social/SKILL.md) | Choose and run mainland-Chinese platforms (Xiaohongshu, WeChat, Douyin, Weibo, Zhihu, Bilibili): native notes, articles and video packs, compliance checks and a draft-only hand-off. |
| [`cmo-employee-advocacy`](plugins/cmo-so-social/skills/cmo-employee-advocacy/SKILL.md) | Run a voluntary programme where employees and founders share the company's news in their own words: opt-in, share kits with varied angles, disclosure, staggered timing and honest tracking. |
| [`cmo-open-social`](plugins/cmo-so-social/skills/cmo-open-social/SKILL.md) | Build a presence on Threads, Bluesky and Mastodon: fit check, profile and server setup, native posts within each network's limits, discovery, reply routine and honest measurement. |
| [`cmo-pinterest`](plugins/cmo-so-social/skills/cmo-pinterest/SKILL.md) | Turn articles and product pages into keyword-led Pins, boards and a steady fresh-Pin schedule that brings search traffic from Pinterest. |
| [`cmo-reddit`](plugins/cmo-so-social/skills/cmo-reddit/SKILL.md) | Earn an honest, disclosed presence in the subreddits where buyers ask questions: map each community's rules, contribute first, draft launch posts and replies, and correct outdated threads AI answers rely on. |
| [`cmo-social-crisis`](plugins/cmo-so-social/skills/cmo-social-crisis/SKILL.md) | Prepare for and run the response when something goes wrong in public: triage and severity, pausing scheduled posts, holding statements, fair moderation, approvals and the stand-down. |
| [`cmo-social-listening`](plugins/cmo-so-social/skills/cmo-social-listening/SKILL.md) | Watch public conversations for the brand, competitors, buyer questions and rising topics, surface only the few worth a reply or a post, and turn themes into content ideas. |

### Email & lifecycle · `cmo-so-email`

| Skill | What it does |
|---|---|
| [`cmo-email-sequences`](plugins/cmo-so-email/skills/cmo-email-sequences/SKILL.md) | Welcome, nurture, launch and re-engagement sequences with subject lines and copy in the brand voice. |
| [`cmo-cold-email`](plugins/cmo-so-email/skills/cmo-cold-email/SKILL.md) | B2B cold outbound that gets replies: targeting, first lines, follow-ups, deliverability and multichannel cadences. |
| [`cmo-sms-whatsapp`](plugins/cmo-so-email/skills/cmo-sms-whatsapp/SKILL.md) | Compliant SMS and WhatsApp flows: welcome, abandoned cart, post-purchase and win-back. |
| [`cmo-churn-prevention`](plugins/cmo-so-email/skills/cmo-churn-prevention/SKILL.md) | Keep customers: health signals, cancel flows, save offers, failed-payment recovery and win-back. |
| [`cmo-newsletter`](plugins/cmo-so-email/skills/cmo-newsletter/SKILL.md) | A newsletter people open: positioning, format, sections, cadence and growth, fed by the posts Maggie publishes. |
| [`cmo-email-deliverability`](plugins/cmo-so-email/skills/cmo-email-deliverability/SKILL.md) | Check that opted-in marketing email reaches the inbox: authentication, unsubscribe headers, bounces and suppression, sender reputation and list hygiene, with fixes in order. |

### Paid ads · `cmo-so-paid-ads`

| Skill | What it does |
|---|---|
| [`cmo-ads-strategy`](plugins/cmo-so-paid-ads/skills/cmo-ads-strategy/SKILL.md) | Plan paid media: objectives, unit economics, channel choice, campaign architecture, audiences and the test plan. |
| [`cmo-ads-audit`](plugins/cmo-so-paid-ads/skills/cmo-ads-audit/SKILL.md) | Audit any ad account against a platform checklist: tracking, structure, targeting, creative, bidding and wasted spend. |
| [`cmo-google-ads`](plugins/cmo-so-paid-ads/skills/cmo-google-ads/SKILL.md) | Run Google Ads well: Search, Performance Max and Shopping structure, search terms, negatives, Quality Score and extensions. |
| [`cmo-meta-ads`](plugins/cmo-so-paid-ads/skills/cmo-meta-ads/SKILL.md) | Meta ads that scale: Pixel and Conversions API, account structure, audiences, creative testing and frequency. |
| [`cmo-linkedin-ads`](plugins/cmo-so-paid-ads/skills/cmo-linkedin-ads/SKILL.md) | B2B LinkedIn ads: Insight Tag, audiences and ABM, lead gen forms, creative and budgets that do not burn out. |
| [`cmo-ad-creative`](plugins/cmo-so-paid-ads/skills/cmo-ad-creative/SKILL.md) | Write, test and refresh ad creative: angles, hooks, headlines, visuals and fatigue detection, from the brand profile. |
| [`cmo-ads-budget`](plugins/cmo-so-paid-ads/skills/cmo-ads-budget/SKILL.md) | Allocate budget across channels, pick bid strategies, pace spend and forecast CPA and ROAS from real data. |
| [`cmo-wasted-spend`](plugins/cmo-so-paid-ads/skills/cmo-wasted-spend/SKILL.md) | Find money spent on search terms, placements, audiences and ads that never convert, and the exact fixes. |
| [`cmo-ads-monitoring`](plugins/cmo-so-paid-ads/skills/cmo-ads-monitoring/SKILL.md) | Daily checks and root-cause diagnosis: anomalies, CPA spikes, pacing, and splits by day, hour, device and location. |
| [`cmo-ads-competitor-research`](plugins/cmo-so-paid-ads/skills/cmo-ads-competitor-research/SKILL.md) | Study competitors' ads in public ad libraries: angles, offers, formats and landing pages, and the gaps to own. |
| [`cmo-ads-launch`](plugins/cmo-so-paid-ads/skills/cmo-ads-launch/SKILL.md) | Set up a campaign correctly the first time: naming, tracking, structure, guardrails and a launch checklist. |

### Conversion (CRO) · `cmo-so-cro`

| Skill | What it does |
|---|---|
| [`cmo-page-cro`](plugins/cmo-so-cro/skills/cmo-page-cro/SKILL.md) | Increase conversions on any marketing page: clarity, proof, friction, CTA and offer, with a prioritised test list. |
| [`cmo-landing-page-audit`](plugins/cmo-so-cro/skills/cmo-landing-page-audit/SKILL.md) | Score a landing page against the ads and emails that send traffic: message match, speed, mobile, trust and form friction. |
| [`cmo-form-cro`](plugins/cmo-so-cro/skills/cmo-form-cro/SKILL.md) | Lead, contact and demo forms that people finish: fields, order, copy, validation and follow-up. |
| [`cmo-signup-flow`](plugins/cmo-so-cro/skills/cmo-signup-flow/SKILL.md) | Fewer drop-offs from signup to first value: steps, social login, copy and trial setup. |
| [`cmo-onboarding-activation`](plugins/cmo-so-cro/skills/cmo-onboarding-activation/SKILL.md) | Get new users to the moment of value fast: first-run, checklists, empty states and onboarding emails. |
| [`cmo-popups`](plugins/cmo-so-cro/skills/cmo-popups/SKILL.md) | Popups, slide-ins and banners that convert without annoying people: trigger, offer, copy and frequency. |
| [`cmo-paywalls`](plugins/cmo-so-cro/skills/cmo-paywalls/SKILL.md) | In-app paywalls, upgrade screens and feature gates that convert at the right moment. |
| [`cmo-ab-testing`](plugins/cmo-so-cro/skills/cmo-ab-testing/SKILL.md) | Design tests that can be trusted: hypothesis, sample size, duration, guardrails, and reading results correctly. |
| [`cmo-landing-page-builder`](plugins/cmo-so-cro/skills/cmo-landing-page-builder/SKILL.md) | Build a fast, on-brand landing page or small marketing site from the brand profile, ready to host on your own site. |
| [`cmo-checkout-cro`](plugins/cmo-so-cro/skills/cmo-checkout-cro/SKILL.md) | Fewer abandoned carts and checkouts: friction audit, trust, payment and delivery options, and recovery emails and texts. |

### Analytics & reporting · `cmo-so-analytics`

| Skill | What it does |
|---|---|
| [`cmo-tracking-setup`](plugins/cmo-so-analytics/skills/cmo-tracking-setup/SKILL.md) | Measurement that works: GA4 and Tag Manager events, conversions, UTM conventions and server-side tracking. |
| [`cmo-attribution`](plugins/cmo-so-analytics/skills/cmo-attribution/SKILL.md) | Work out which marketing drives revenue: models compared side by side, conversion paths and platform disagreements. |
| [`cmo-campaign-analytics`](plugins/cmo-so-analytics/skills/cmo-campaign-analytics/SKILL.md) | Analyse campaign and funnel performance, ROI and benchmarks, and decide what to scale or stop. |
| [`cmo-client-report`](plugins/cmo-so-analytics/skills/cmo-client-report/SKILL.md) | A polished report for a client or the board (Markdown, HTML or PDF) with a plain-English narrative on top. |
| [`cmo-closed-loop-measurement`](plugins/cmo-so-analytics/skills/cmo-closed-loop-measurement/SKILL.md) | Judge every marketing change by what it did in the data: baseline, change log, follow-up read and keep or revert. |

### Growth & go-to-market · `cmo-so-growth`

| Skill | What it does |
|---|---|
| [`cmo-product-launch`](plugins/cmo-so-growth/skills/cmo-product-launch/SKILL.md) | Plan and run a launch or feature announcement: phases, channels, assets, Product Hunt and follow-through. |
| [`cmo-referral-program`](plugins/cmo-so-growth/skills/cmo-referral-program/SKILL.md) | Design and run a referral or affiliate program: incentive, mechanics, promotion and fraud checks. |
| [`cmo-co-marketing`](plugins/cmo-so-growth/skills/cmo-co-marketing/SKILL.md) | Find partners with the same audience and run joint content, webinars, bundles and integrations. |
| [`cmo-free-tools`](plugins/cmo-so-growth/skills/cmo-free-tools/SKILL.md) | Plan a free tool (calculator, checker, generator) that earns links, rankings and leads. |
| [`cmo-directory-submissions`](plugins/cmo-so-growth/skills/cmo-directory-submissions/SKILL.md) | Get listed in the right startup, SaaS, AI and review directories for links and discovery, without spam. |
| [`cmo-public-relations`](plugins/cmo-so-growth/skills/cmo-public-relations/SKILL.md) | Earn coverage: angles, press releases, journalist targeting, pitches and follow-ups. |
| [`cmo-events-webinars`](plugins/cmo-so-growth/skills/cmo-events-webinars/SKILL.md) | Plan, promote and convert webinars and events, from topic to follow-up sequence. |
| [`cmo-app-store-optimization`](plugins/cmo-so-growth/skills/cmo-app-store-optimization/SKILL.md) | App Store and Google Play listings that rank and convert: keywords, metadata, screenshots and ratings. |
| [`cmo-marketing-automation`](plugins/cmo-so-growth/skills/cmo-marketing-automation/SKILL.md) | Set up recurring loops an agent runs on a schedule (weekly report, LinkedIn week, content refresh) on top of CMO.so. |

### Sales & revenue · `cmo-so-sales`

| Skill | What it does |
|---|---|
| [`cmo-prospecting`](plugins/cmo-so-sales/skills/cmo-prospecting/SKILL.md) | Find and qualify prospects and build a dossier for each before reaching out. |
| [`cmo-sales-enablement`](plugins/cmo-so-sales/skills/cmo-sales-enablement/SKILL.md) | Decks, one-pagers, objection handling, battlecards and demo scripts that match the marketing message. |
| [`cmo-revops`](plugins/cmo-so-sales/skills/cmo-revops/SKILL.md) | Lead lifecycle, scoring, routing and pipeline health so marketing and sales hand off cleanly. |
| [`cmo-proposals`](plugins/cmo-so-sales/skills/cmo-proposals/SKILL.md) | Client proposals and SOWs for marketing work: scope, deliverables, timeline, pricing and terms. |

### Images & video · `cmo-so-creative`

| Skill | What it does |
|---|---|
| [`cmo-image-generation`](plugins/cmo-so-creative/skills/cmo-image-generation/SKILL.md) | Create on-brand images: blog heroes, social graphics, OG images, ad visuals and product shots. |
| [`cmo-video-production`](plugins/cmo-so-creative/skills/cmo-video-production/SKILL.md) | Plan and produce marketing videos with AI tools: script, footage, edit plan, captions and versions per platform. |
| [`cmo-video-repurposing`](plugins/cmo-so-creative/skills/cmo-video-repurposing/SKILL.md) | Mine long videos, webinars and podcasts for clips, quotes and posts, with timestamps. |

<!-- skills:end -->

## The CMO.so MCP server

Every skill above runs on one MCP server: **`https://mcp.cmo.so/mcp`** (Streamable HTTP, OAuth 2.1).

- **125 tools** cover your websites, results (Search Console, AI visibility, content performance, SEO audit), blog ideas, plan and drafts, the LinkedIn queue and campaigns, business profile and brand voice, autopilot settings and team access.
- **Sign in with your CMO.so account.** There are no keys to paste. The agent gets exactly your team permissions on each website, and a read-only key only sees read tools.
- **Two-step changes.** A tool that changes something first returns a preview and a `confirmation`. It runs only when called again with `confirm: true`, and it runs exactly the call that was previewed.
- **Cards in ChatGPT.** Results, blog posts and the LinkedIn queue (with Approve) render as cards.

| Client | How to connect |
|---|---|
| Claude Code | This plugin (`/mcp` → **cmo-so** → Authenticate), or `claude mcp add --transport http cmo-so https://mcp.cmo.so/mcp` |
| Claude.ai / Claude Desktop | Settings → Connectors → Add custom connector → `https://mcp.cmo.so/mcp` |
| ChatGPT | Plugins → Add → Add custom MCP server → `https://mcp.cmo.so/mcp`, OAuth (developer mode, until the listing is live) |
| Cursor, VS Code, Windsurf | Add a remote HTTP server with the same URL, or run it locally (below) |

Local (stdio), for clients that start a command:

```json
{
  "mcpServers": {
    "cmo-so": { "command": "npx", "args": ["-y", "@cmo-so/mcp"] }
  }
}
```

Sign in once with `npx @cmo-so/cli login`, or set `CMO_API_KEY` to an API key from your account settings. Package: [`@cmo-so/mcp`](https://www.npmjs.com/package/@cmo-so/mcp).

## The cmo CLI

[`@cmo-so/cli`](https://www.npmjs.com/package/@cmo-so/cli) runs the same actions from your terminal, in scripts and in CI.

```sh
npx @cmo-so/cli login            # sign in in your browser (device code)
npm i -g @cmo-so/cli             # then just `cmo`

cmo inbox                        # what needs you now
cmo results --period 30d         # posts, ideas waiting, AI visibility
cmo ideas add https://example.com/page     # queue a blog idea
cmo ideas generate -n 5 --brief "spring skincare"
cmo posts ls --status planned    # what Maggie writes next
cmo social ls                    # LinkedIn queue
cmo social approve 30 31         # approve drafts
cmo autopilot pause             # or resume
cmo run gsc_queries_get filter=low_ctr limit=10   # any of the 125 tools
cmo mcp                          # the local MCP server (stdio)
```

- Options for every command: `--json`, `-w/--workspace <domain>`, `--dry-run` (preview only), and `-y/--yes` (no prompt, for CI).
- Changes ask first. Without a terminal and without `--yes`, nothing changes.
- Exit codes: `0` done, `2` input, `3` sign-in, `4` plan, permission or limit, `5` server.
- In CI, set `CMO_API_KEY`; `CMO_WORKSPACE` picks the website.

## Other agents

The skills are plain `SKILL.md` folders under [`plugins/`](plugins), in the open Agent Skills format, so any agent that reads skills can use them with the MCP server above:

- `plugins/*/skills/` for Claude Code plugins (`.claude-plugin/`), Codex and Agent Plugins hosts (`plugin.json`, `mcp.json`, marketplace in `.agents/plugins/marketplace.json`) and Pi packages (`package.json` → `pi.skills`).
- `npx @cmo-so/skills agents` lists the 20 agents the installer knows and the folders it writes. Agents that share `.agents/skills` (Codex, Pi, Cursor, Gemini CLI, OpenCode, Copilot, Amp, Cline) get one copy.
- The full index, with categories, channels, funnel stage, tier and the MCP tools each skill uses, is in [`skills.json`](skills.json). Setup guides: https://ai.cmo.so/hot/mcp

## Safety

- Changes take two steps: a preview (what will happen and what it costs) and a confirmation you give. The confirmation is bound to that exact action and expires after 10 minutes.
- Your agent only gets the access your CMO.so account has on each website; a read-only team member cannot change anything.
- Text from web pages, search queries and AI answers is treated as data, never as instructions.
- Skills never ask for passwords or API keys in the chat. You can disconnect any agent in your CMO.so account settings under **Connected apps**.

## Credits

The skills are written by AI Marketing OS Ltd. Many adapt ideas from excellent open-source projects: marketing skill collections, social media and SEO tools, analytics, email and publishing platforms, and MCP servers and CLIs for the channels the skills cover. Each skill's **References** section names its sources, and [`skills.json`](skills.json) pins every source file to a commit with its licence.

- [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) carries the copyright and licence notice of every MIT, Apache-2.0 or other permissive project a skill adapts.
- Projects with no licence, or a copyleft or source-available licence (GPL, AGPL, BUSL and similar), were used for ideas only: no text from them is included. They are listed at the end of the notices.
- `skills.json → excluded` records every source skill we looked at and left out, and why.

This repository is separate from the TOPY AI `ai-cmo-skills` package (`@topy-ai/maggie`), which covers building and deploying websites.

## Support

[maggie@cmo.so](mailto:maggie@cmo.so) · [Support](https://ai.cmo.so/hot/support) · [Privacy](https://ai.cmo.so/hot/privacy-policy) · [Terms](https://ai.cmo.so/hot/terms-of-service)

## License

MIT © AI Marketing OS Ltd
