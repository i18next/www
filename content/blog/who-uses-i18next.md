---
title: "Who uses i18next: at least 1,188 of the 100,000 most linked websites"
description: "We searched the scripts of the 100,000 most linked websites for i18next's code. At least 1,188 run it in their own code, from X, NBA and DeepL to Lufthansa, Strava and UEFA: the data, the method and its limits."
date: 2026-07-06
updated: 2026-11-18
tags: Data, Open source
image: /img/blog/who-uses-i18next.svg
imageAlt: Sites that run i18next per 10,000 of the ranking, from 217 in the first 10,000 to 82 in the last
---

i18next has been maintained since 2011, and npm counted 35.6 million downloads of it in the week of 2026-11-10 to
2026-11-16. Downloads count installs, CI and agents included, not who runs it. So we measured that.

We searched the scripts that the home pages of the **100,000 most linked websites** load for i18next's own code.
**At least 1,188 of them run i18next in their own code.**

<!-- usage:stats -->

"At least" matters: this is a lower bound (method below). The real number is higher.

## What changed since July

We first published this count in July 2026. For this update (November 2026) we made it stricter. In July, a site
counted when the word "i18next" showed up in its pages, when it set the i18next cookie, or when it loaded translations
from a `/locales/` path. The word also catches look-alikes: vue-i18n code (`vueI18nExtend` contains the letters),
cookie names, a function that happens to be called `i18next`. Now the word and the load path no longer count: a site
counts when its own scripts carry i18next's code (the core, react-i18next, the language detector or next-i18next's
page data) or when it sets the i18next cookie. i18next inside an embedded widget, such as a blog platform's member portal or a donation form, does not
count either: that is the vendor's choice, not the site's.

| | July 2026 | November 2026 |
|---|---|---|
| Sites counted by July's rule (the word, the cookie or a load path) | 1,534 | 1,645 |
| Sites running i18next in their own code, one per site | not counted | **1,188** |
| Domains that did not respond or blocked us | 9,126 | 8,418 |

A plain scan misses sites that block automated requests or build their pages with JavaScript, so we also opened sites
in a real browser: every company named in this post, one by one, and about 4,100 sites the scan could not settle in a
headless browser. That added 211 sites the scan had missed, among them X, NBA, the IMF, Lufthansa, DeepL, Snowflake,
UEFA and Mercedes-Benz.

Five names from July's list are gone. For GitLab, MSN and TradingView, July's match was one of those look-alikes. For
Apple App Store and Microsoft Power BI we cannot confirm i18next code: the App Store blocked our browser, and Power BI
needs a sign-in.

## Densest at the top of the ranking

The share of sites that run i18next is highest among the most linked sites and goes down further down the ranking:

<!-- usage:charts -->

Most of what we found is react-i18next and next-i18next (886 sites together). 239 of these sites render i18next on
the server with next-i18next, which a check of what runs in the browser alone would miss.

## Sixty of them

Sixty of the sites that run i18next, each checked in a browser except Cartier (see the method):

<!-- usage:brands -->

## How we measured this, and where it is fuzzy

- **The list:** the top 100,000 domains of the Majestic Million, downloaded on 2026-11-17.
- **What counts as a hit:** i18next's own code in the scripts a site's home page loads (for UEFA, whose i18next code
  loads only on other pages, the browser check of such a page): the i18next core,
  react-i18next, the language detector, next-i18next's page data, or the `i18next` language-detector cookie. The word
  "i18next" alone does not count, and neither does i18next inside an embedded vendor widget (a blog platform's member
  portal, a donation or contact form, a consent banner).
- **One site, one count.** Domains that redirect to the same site (hotjar.com to contentsquare.com, twitter.com to
  x.com) count once; the list below shows them under both names.
- **Checked in a browser.** We opened every company named in this post in a browser and looked for i18next's code in
  the scripts it loaded. Cartier's site would not open in our browser, so there the scan's find stands. A headless
  browser also opened about 4,100 sites the plain scan could not settle: those where it saw only the word or a load
  path, and those up to rank 20,000 that blocked it or timed out. Because that retry stopped at rank 20,000, it lifts
  the first two bands of the ranking chart more than the others.
- **A lower bound.** About 8% of the top 100,000 blocked automated requests or did not respond, and beyond rank 20,000
  we did not retry them in a browser. Apps that load i18next only after sign-in or on deeper pages are invisible from
  the home page, and so are sites that build their translations in at build time. Those are undercounted, not counted.
- **Automated**, so it can include the occasional false positive. The data is from November 2026. See something wrong
  about your site? Tell us in the [i18next discussions](https://github.com/i18next/i18next/discussions) and we correct
  it.

## The full list

Every site we found, by rank (your browser's find in page searches it):

<!-- usage:table -->
