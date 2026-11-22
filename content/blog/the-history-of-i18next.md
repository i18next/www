---
title: "The history of i18next, from 2011 to version 27"
description: "i18next began in December 2011 as a translation library for single-page apps. The decisions taken since still shape how it works today: one core for every environment, plugins for everything around it, and code for version 1 that still runs with a layer."
date: 2026-11-22
tags: History, Open source
image: /img/blog/the-history-of-i18next.svg
imageAlt: npm downloads per week of i18next and react-i18next from 2015 to November 2026, rising to about 35 and 26 million a week
---

The first commit to i18next is from 2011-12-16 and is called "initial version". Almost fifteen years and 27 major
versions later, this is how it got from there to version 27.

## How it began, in 2011

Jan Mühlemann wrote i18next as an internationalization library for single-page applications in the browser. It
reached 1.0 ten days after the first commit, on 2011-12-26. On npm, the name i18next belonged to its companion for
Node.js from 2012-01-03 on: i18next-node, a middleware for Express. The browser library came to npm only in 2014, as
i18next-client. By its last release, version 1 ran in the browser, in Node.js and in Rhino, with variables, nesting,
context, plurals and a jQuery function.

<figure>
<img src="/img/blog/the-history-of-i18next-v1-site.jpg" alt="The i18next website of version 1: download buttons for v1.11.2, npm install commands, a list of features and of extensions from the community" width="1152" height="840">
<figcaption>The website of version 1 as it still stands at
<a href="https://i18next.github.io/i18next/">i18next.github.io/i18next</a>, last updated for version 1.11.2 on
2015-12-07. The note at the top came later.</figcaption>
</figure>

## Version 2, rebuilt around plugins, 2015 <a id="v2"></a>

On 2015-12-12 we released version 2, a rewrite and the first i18next on npm built from the browser library's
repository: one library for the browser and for Node.js. Loading translations, detecting the language, caching and
post-processing come from plugins, and the core stays the same in every environment. The language detector for the
browser had come out six weeks before, on 2015-10-28. react-i18next came out the same day as version 2.

## Code for version 1 still runs, with a layer

Up to version 23 the core still had an option for the old API, `compatibilityAPI: 'v1'`; version 24 removed it. What
remains is a compatibility layer in i18next's repository, not in the npm package:
[`test/compatibility`](https://github.com/i18next/i18next/tree/master/test/compatibility). It turns version 1's options
and calls into today's (`v1/v1.js`, 151 lines, and `v1/v1.i18nInstance.js`, 111 lines) and reads the old plural format
that the core no longer reads itself (`v4/v4Compatibility.js` with its helpers, 488 lines).

The tests of version 1.11.1 run against every release through this layer, together with i18next-http-backend,
i18next-localstorage-cache, the browser language detector and the sprintf post-processor. On i18next 27.2.3, 302 of
the compatibility tests pass and 7 are skipped, because the layer does not cover them: synchronous loading, the global
`i18n` variable, indefinite articles and one nested value. An app still written for version 1 copies the layer into its
own code.

## The milestones

After version 2 came 25 more major versions. A major version of i18next is any release that can break existing code,
sometimes for a single option.

| Date | Milestone |
|---|---|
| 2011-12-16 | The first commit, a library for the browser |
| 2012-01-03 | i18next on npm, then the Node.js module (i18next-node) |
| 2014-08-25 | The browser library on npm, as i18next-client |
| 2015-10-28 | i18next-browser-languagedetector |
| 2015-12-12 | Version 2: one i18next for the browser and Node.js, built around plugins; the first react-i18next |
| 2018-11-25 | next-i18next, started by Isaac Hinman |
| 2020-04-14 | i18next-http-backend |
| 2024-11-22 | Version 24: the old JSON formats and `compatibilityAPI` removed, the `Intl` API required |
| 2025-09-25 | i18next-cli: extract the keys, check translations in CI, write the types |
| 2026-03-23 | next-i18next 16, with the App Router |
| 2026-11-07 | i18next 27 and react-i18next 18 |

## The downloads

<figure>
<img src="/img/blog/the-history-of-i18next.svg" alt="npm downloads per week of i18next and react-i18next from 2015 to November 2026, rising to about 35 and 26 million a week" width="1200" height="630">
<figcaption>npm downloads per week, Monday to Sunday, from 2015 to the week 2026-11-09 to 2026-11-15
(<a href="https://github.com/npm/registry/blob/main/docs/download-counts.md">npm downloads API</a>, read 2026-11-22).
Weeks with a day npm has no data for are left out. Downloads count installs, CI and agents included, not
users.</figcaption>
</figure>

Until 2015-12-12 the line of i18next counts i18next-node, the Node.js module that held the name on npm; from version 2
on, the one library. How many websites run it: [Who uses i18next](/blog/who-uses-i18next).

## Who maintains it

Jan and Adriano maintain i18next together. [Locize](https://www.locize.com/i18next) is our translation management
service, and its customers fund the work on i18next.
