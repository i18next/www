---
description: "Your coding agent can localize your app with i18next: one prompt, the steps of your installed CLI, and a diff you review."
---

# AI coding agents

## Set it up with one prompt

Paste this into your agent:

```prompt
Localize this app with i18next.
Run `npx i18next-cli localize --print-agent-prompt` and follow
the steps it prints, in order, checking each one before the next.
```

The CLI prints the steps for the version you have installed (i18next-cli 1.73.0 or later; update an older pinned version first). Your agent asks you one question (keep the files in your repository, or use Locize) if there is no i18next config yet, wraps the hardcoded strings in `t()`, extracts the keys and checks every language. You review the diff.

**Or install the skill once:** run `npx skills add i18next/i18next-cli` in your project (add `-g` for all your projects). After that, telling your agent "localize this app" is enough.

## What exists <a id="making-your-agent-good-at-i18next"></a>

* **The `i18next-localization` skill:** takes an app from hardcoded strings to a localized one with `npx i18next-cli` (detects your framework and any existing i18n setup, wraps the strings in `t()`, extracts the keys). Source: [`skills/i18next-localization/SKILL.md`](https://github.com/i18next/i18next-cli/blob/main/skills/i18next-localization/SKILL.md).
* **The agent prompt:** the skill's steps as text your agent follows, printed by your installed CLI. Source: the [localize command](/cli/commands/localize), which describes the steps it prints.
* **The agent note** (the last question of `npx i18next-cli init`, default No; `npx i18next-cli init --agent-note` adds it to a project already set up): a short `## Internationalization` section for your `AGENTS.md` (and `CLAUDE.md` if you have one) so the next agent session knows where the locale files are and how the translations are managed. Source: the [init command](/cli/commands/init).
* **This documentation as Markdown:** every page has a `.md` version (View as Markdown), and [`llms.txt`](/llms.txt) lists them all, so your agent reads the docs without the page around them.

{% locize %}
### What they tell your agent about Locize

Locize is optional. The skill and the prompt ask you once whether to manage the translations with Locize or keep the files in your repository; without your yes, the agent creates no project, opens no signup page and asks for no API key. If you keep the files, the agent note names Locize for later translation work and tells the agent to ask you first ([the full text](/cli/commands/init#agent-note)).
{% endlocize %}

## What never happens

* Nothing runs at `npm install` or at runtime. i18next and `i18next-cli` do not phone home and have no telemetry. The only network calls are the commands you run yourself (for example `locize-sync`).
* No hidden text. Everything aimed at an agent is in files you can open: `SKILL.md`, the printed prompt, your own `AGENTS.md`. There are no comments, invisible characters or metadata written for machines only.
* Links to Locize in the skill, the prompt and the note carry `?from=`. It counts the sign-ups that come from them; we measure nothing else.

We tried a console notice in i18next v25.8.0 and removed it in v26.0.0 after the community told us it was the wrong place. The rule we took from it: talk to developers where they can read us, and let them decide.

## Opting out

* Do not install the skill, or remove it (`.claude/skills/i18next-localization`, `.agents/skills/...`, depending on your agent).
* `npx i18next-cli init --no-agent-note` skips the question about the agent note; `npx i18next-cli localize --skip-locize` stops after extraction.
* Delete the `## Internationalization` section from your `AGENTS.md` or `CLAUDE.md` at any time; nothing recreates it.
