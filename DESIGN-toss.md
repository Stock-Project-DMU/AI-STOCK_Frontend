---
version: alpha
name: Toss-design-analysis
description: A dense, confident, semibold-leaning fintech UI. The base canvas is white with a soft warm-grey neutral scale; Toss Blue (`#3182f6`) is the single brand color, used more liberally than a typical "scarce accent" brand (primary buttons, links, active states, key numbers). Type runs a licensed "Toss Product Sans" (substituted here with Pretendard) at weight 500/600 by default — medium/semibold is the resting weight, not an emphasis state. Shape language favors small-to-medium rounded rectangles (6-12px) over pills; full-round (999px) is reserved for avatars, dots, and chips, not standard buttons. Depth comes from hairline borders and very tight low-opacity shadow stacks, never a soft glow.
extracted_from: "Live CSS bundles fetched from www.tossinvest.com on 2026-08-25 (_next/static/css/*.css) — colors, font stack, radius/font-size/font-weight frequency are measured, not guessed."

colors:
  primary: "#3182f6"
  primary-active: "#2272eb"
  primary-tint: "#ebf4ff"
  primary-tint-soft: "#f2f8ff"
  ink: "#1c1f25"
  body: "#4e535c"
  muted: "#8f959e"
  muted-soft: "#b8bdc5"
  hairline: "#e8ebf0"
  hairline-soft: "#f4f5f8"
  canvas: "#ffffff"
  surface-soft: "#fbfcfd"
  surface-strong: "#f4f5f8"
  on-primary: "#ffffff"
  semantic-up: "#cf202f"
  semantic-down: "#1d4ed8"

typography:
  display-number:
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Noto Sans KR', 'Apple SD Gothic Neo', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.5px
  headline:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: -0.3px
  title:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: 0
  body-md:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  body-regular:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  label:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  caption:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  number-tabular:
    fontFamily: "'Pretendard', ui-monospace, monospace"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  button:
    fontFamily: "'Pretendard', sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0

rounded:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  chip: 999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  base: 16px
  md: 20px
  lg: 24px
  xl: 32px
  section: 48px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 20px
    height: 48px
  button-secondary:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 14px 20px
    height: 48px
  chip-tag:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.body}"
    typography: "{typography.caption}"
    rounded: "{rounded.chip}"
    padding: 4px 10px
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 20px
    border: "1px solid {colors.hairline}"
  text-input:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 14px 16px
    height: 48px
  asset-row:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    padding: 12px 0
    border-bottom: "1px solid {colors.hairline}"
---

## Overview

Toss reads as a confident, dense, product-first fintech UI — the opposite instinct from an editorial marketing site. There's no "scarce accent color" restraint: Toss Blue (`{colors.primary}` — #3182f6) shows up constantly — primary buttons, active tab states, links, key emphasized numbers — because the product is a daily-use financial tool, not a brand showcase.

Type defaults to **medium/semibold** (weight 500/600), not regular 400. Measuring the live site's actual CSS: font-weight:600 appears ~42 times, 500 ~32 times, 700 ~12 times, and 400 only 3 times. Semibold is the resting state of the UI, not an emphasis exception — this is the single most distinctive difference from a "calm editorial" system like Coinbase's.

Font sizes cluster tightly at **12–16px** (14px and 13px are the two most common sizes on the page), with a handful of large sizes (48/36/26/24/20px) reserved for hero numbers and page titles. This is a dense, data-forward type scale, not a spacious editorial one.

Shape language favors **small-to-medium rounded rectangles**: 8px and 12px are the most common radii by a wide margin, with 6px/7px/10px close behind. Full-pill radius (999px/100px) shows up only 3 times each across the whole bundle — reserved for chips/tags/avatars, not the default button or card shape.

Depth is nearly flat: most "shadows" in the real CSS are actually 0.5–1px inset box-shadows standing in for hairline borders. True elevation (popovers, dropdowns) uses a tight 3-layer shadow stack at very low opacity (`0 .6px .6px -1.25px rgba(0,0,0,.12), 0 2.2px 2.2px -2.5px rgba(0,0,0,.1), 0 10px 10px -3.75px rgba(0,0,0,.0425)`) — never a single large soft glow.

**Key Characteristics:**
- Toss Blue (`{colors.primary}`) used liberally, not scarcely — it's the product's primary interactive color, appearing on most CTAs and active states.
- Semibold (600) is the default text weight for UI chrome (labels, buttons, titles); regular (400) is reserved for long-form body copy only.
- Small-to-medium radii (6–12px) by default; full-round reserved for chips, avatars, dots, toggles.
- Dense type scale: 12–16px for nearly everything; large sizes exist only for hero numbers/page titles.
- Near-flat depth: hairline borders over soft shadows; elevation shadows are tight and low-opacity, never a big glow.
- Soft warm-grey neutral scale (`{colors.surface-soft}` #fbfcfd → `{colors.ink}` #1c1f25) instead of pure black/white — text default color is a soft dark grey (#4e535c body-700), not pure black.

## Colors

### Brand
- **Toss Blue** (`{colors.primary}` — #3182f6): The one brand color, used constantly across primary buttons, links, active tab indicators, and key numbers.
- **Toss Blue Active** (`{colors.primary-active}` — #2272eb): Press/hover state, one step darker.
- **Toss Blue Tint** (`{colors.primary-tint}` — #ebf4ff) / **Tint Soft** (`{colors.primary-tint-soft}` — #f2f8ff): Light blue background fills for selected rows, info banners, badge backgrounds.

### Neutral (measured light-mode scale)
`{colors.surface-soft}` #fbfcfd → #f4f5f8 → #e8ebf0 → #d4d9e1 → #b8bdc5 → #8f959e (`{colors.muted}`) → #727780 → #4e535c (`{colors.body}`) → #333840 → #1c1f25 (`{colors.ink}`). Note text is never pure black — body copy sits on a soft dark grey.

### Surface
- **Canvas** (`{colors.canvas}` — #ffffff): Page floor.
- **Surface Soft** (`{colors.surface-soft}` — #fbfcfd): Barely-there off-white for subtle section separation.
- **Surface Strong** (`{colors.surface-strong}` — #f4f5f8): Fill for secondary buttons, inputs, chip backgrounds.
- **Hairline** (`{colors.hairline}` — #e8ebf0): Card/row dividers — does most of the "structure" work that shadows would otherwise do.

### Trading Semantics (unchanged from existing AI-STOCK convention — do not touch)
Korean securities convention: **up = red** (`{colors.semantic-up}` #cf202f), **down = blue** (`{colors.semantic-down}` #1d4ed8). Text-color only, never a background fill. This was already correctly implemented in the current codebase's Coinbase-derived tokens and carries over unchanged.

## Typography

### Font Family
Toss runs a licensed typeface, **Toss Product Sans**, with a real fallback stack of `-apple-system, BlinkMacSystemFont, "Bazier Square", "Noto Sans KR", "Segoe UI", Apple SD Gothic Neo, Roboto, "Noto Sans KR", "Helvetica Neue", Arial, sans-serif` (taken directly from the live site's CSS).

**Substitute: Pretendard.** Since Toss Product Sans is licensed and unavailable, Pretendard is the standard substitute for this exact use case — it was built specifically to give Latin+Hangul text the same weight-matched, geometric-clean feel that Toss/Apple SD Gothic Neo have, which is why most Korean fintech/consumer apps default to it when they can't license a house font. This also fixes the current app's actual bug: it ships Geist (Latin-only), so every Korean character is silently falling back to the OS default (Malgun Gothic on Windows) — Pretendard covers Hangul directly and is the reason sites like this "look clean" in the first place.

### Hierarchy (measured against the live site's actual size/weight frequency)

| Token | Size | Weight | Use |
|---|---|---|---|
| `{typography.display-number}` | 32px | 700 | Big portfolio/asset numbers, hero stat |
| `{typography.headline}` | 22px | 700 | Page/section titles |
| `{typography.title}` | 17px | 600 | Card titles, list group headers |
| `{typography.body-md}` | 15px | 500 | Primary UI text, list item primary line |
| `{typography.body-regular}` | 14px | 400 | Long-form/secondary copy (rare — most text is 500+) |
| `{typography.label}` | 13px | 600 | Field labels, tab labels |
| `{typography.caption}` | 12px | 500 | Timestamps, helper text, chip labels |
| `{typography.number-tabular}` | 14px | 600 | Prices, %, quantities — right-aligned in tables |
| `{typography.button}` | 15px | 600 | CTA / button label |

### Principles
- **600 (semibold) is the default UI weight**, not an emphasis state. Only long-form paragraph copy drops to 400.
- **No negative-letter-spacing display trick.** Unlike Coinbase, Toss doesn't rely on tight tracking for its "premium" feel — density and weight do that work instead.
- **Numbers are semibold, tabular, right-aligned** in list/table contexts — not a separate mono display treatment at a different weight.

## Shapes

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Inline tags, tiny badges |
| `{rounded.sm}` | 8px | Compact rows, small chips — most common radius on the real site |
| `{rounded.md}` | 12px | Buttons, inputs, standard cards — second most common radius |
| `{rounded.lg}` | 16px | Larger feature cards, modals |
| `{rounded.chip}` | 999px | Tags, filter chips, small pills — NOT the default button shape |
| `{rounded.full}` | 9999px | Avatars, status dots, toggle switches only |

**This is the biggest deviation from the current codebase.** The app currently uses `rounded-full` (full pill) as the default shape for primary buttons, badges, and the header CTA — that reads as Coinbase's signature, not Toss's. Buttons should move to `{rounded.md}` (12px), reserving full/pill shapes for chips, avatars, and toggles.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow | Default — most of the UI |
| Hairline | 1px `{colors.hairline}` border (or a `0 0 0 .75px` inset box-shadow standing in for one) | Card/row outlines |
| Tight elevation | `0 .6px .6px -1.25px rgba(0,0,0,.12), 0 2.2px 2.2px -2.5px rgba(0,0,0,.1), 0 10px 10px -3.75px rgba(0,0,0,.0425)` | Popovers, dropdowns, modals only |

### Don't
- Don't use a big single soft-glow shadow (e.g. the current `.auth-card`'s `0 20px 60px rgba(...)`) — that's an editorial-marketing move, not a Toss one. Replace with hairline border + at most the tight 3-layer elevation shadow above.
- Don't default buttons/cards to full-pill or 24px radius — reserve full-round for avatars/dots/toggles and use 8–12px elsewhere.
- Don't drop text weight to 400 for UI chrome (buttons, labels, nav) — reserve 400 for actual paragraph copy.
- Don't widen the type scale back to Coinbase's 16–80px editorial range for in-app screens — keep body/label text in the 12–16px band; reserve large sizes for hero numbers and page titles only.

## Do
- Use `{colors.primary}` freely on primary buttons, active states, links, and emphasized numbers — it's not a scarce accent here.
- Default interactive text weight to 600, secondary/nav text to 500.
- Default card/button radius to `{rounded.md}` (12px); use `{rounded.sm}` (8px) for tighter rows/chips.
- Keep the existing red-up/blue-down semantic convention — already correct, don't touch.
- Load Pretendard as the primary font so Korean text actually renders in a deliberate typeface instead of falling back to the OS default.

## Known Gaps
- Toss Product Sans is licensed and not measurable beyond its fallback stack; Pretendard is the documented substitute, matched for weight/Hangul quality, not a pixel-exact clone.
- Exact spacing/grid values for Toss Invest's authenticated trading screens (behind login) aren't visible from the public marketing/list pages this analysis was run against — the `spacing` tokens above are inferred from the dense 12–16px type scale, not measured pixel-for-pixel.
- This document intentionally does not touch AI-STOCK's existing page layout/composition (grid structure, component placement) — scope is visual style only (color, type, shape, depth), per explicit instruction.
