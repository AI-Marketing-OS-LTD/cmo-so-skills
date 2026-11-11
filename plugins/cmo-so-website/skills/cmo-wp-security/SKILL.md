---
name: cmo-wp-security
description: "Check a connected WordPress site's security through the CMO.so MCP — vulnerable, outdated or abandoned plugins and themes, WordPress and PHP versions, risky settings, Administrators and old application passwords, WP-Cron jobs, and what visitors can see from outside — then fix what the tools can, with a yes for each. Use when the user says things like \"is my WordPress site safe\"; \"security check my site\"; \"are my plugins up to date\"; \"any vulnerable plugins\"; \"check the cron jobs on my site\"; \"who has admin access to my site\". Needs the CMO.so MCP server."
license: MIT
metadata:
  category: "website"
  tier: "core"
  funnel_stage: "retention"
  channels: "wordpress"
  version: "0.28.8"
  docs: "https://cmo.so/skills/cmo-wp-security"
---
# WordPress security check

A security check of the owner's own WordPress site, run from their AI assistant through the CMO.so MCP. It reads
what WordPress itself reports and what any visitor can see, matches plugins, themes and WordPress against known
vulnerabilities (WPVulnerability), and fixes what can be fixed from WordPress — one approved change at a time.

## When to use
- The owner asks whether the site is safe, wants a regular check, or a plugin made the news.
- After installing plugins, before a launch, or monthly.
- Not for sites the person doesn't own or manage, and not for server work (firewall, SSH, nginx, the host's
  crontab, malware clean-up): those are the host's; say so and give the steps.

## Before you start
- `wp_site_status`: an Administrator login and Maggie Core. Below 0.14 the check still covers plugins, themes and
  the outside view; `wp_theme_update` brings the rest (versions, settings, users, WP-Cron, updates).
- Read the site's guides (DESIGN.md, AGENTS.md, MEMORY.md in `site_guides`): plugins or settings the owner wants
  left alone are listed there.

## Workflow
1. **Scan.** `wp_security_scan`. It returns `summary`, `findings` (sorted p0 first), the non-core `cron` jobs and
   `degraded` (sources that didn't answer: say those checks are incomplete; never call something safe from a
   degraded run).
2. **Explain.** For each finding, in this order: what we found, why it matters, what to do, how urgent. Words:
   p0 **today**, p1 **this week**, p2 **this month**, p3 when convenient, p4 for information. One action each.
   A vulnerability "without login" (unauthenticated) is the urgent kind; say so plainly.
3. **Fix what the tools can**, each after a yes:
   - vulnerable or outdated plugin → `wp_plugin_update` (no copy of the old version is kept: for a shop or page
     builder, suggest a backup first; if the homepage breaks after, deactivate with `wp_plugin_set`);
   - no fixed version, closed on WordPress.org, or unused → `wp_plugin_set` inactive, then `deleted`;
   - a scheduled job nothing runs (left by a removed plugin) → `wp_cron_unschedule`;
   - Maggie Core itself → `wp_theme_update`.
4. **Hand over what only the host can do** as short steps: WordPress core and PHP updates, wp-config.php
   (DISALLOW_FILE_EDIT, WP_DEBUG, file permissions), blocking XML-RPC or ?author= at the server, security
   headers at the server or CDN, a real server cron for WP-Cron, deleting public .env/.git/backup files.
5. **Check again.** `wp_security_scan` after the fixes; report what changed (p0 and p1 left, if any).
6. **Remember** what the owner decided (`wp_site_memory_add`): e.g. "keep XML-RPC on: the WordPress app uses it",
   so the next check doesn't nag about it.

## Output
- A short report: counts by priority, then the p0–p2 findings with their one action, what was fixed, what the
  host must do, and when to check again.

## Quality bar
- Every finding names the plugin, setting or file, why it matters and one action.
- Nothing was changed without a yes; every change was checked (homepage still opens).
- Public exposures (.env, .git, config backups) are treated as p0: rotate every key or password they held.

## Guardrails
- Only sites the person owns or manages and has connected; the outside checks are a visitor's GET requests,
  never attacks, password guessing or load.
- Never print or ask for passwords, keys or file contents; for a leaked secret say where and to rotate it first.
- No PHP, no deleting users, no changing wp-config.php through these tools.
- Findings come from the tools; never invent a CVE, a version or a fix.

## Related skills
- `cmo-wp-vibe-coding` — running the site from a coding agent.
- `cmo-wp-seo-technical` — the technical SEO check (same findings format).

## References
Ideas adapted from (see `catalog.json` for pinned commits and licences):
- CMO.so internal skill (private) — maggie-security
