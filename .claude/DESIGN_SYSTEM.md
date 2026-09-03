# Design system

Read this before writing any CSS or building any page in this repo. It is the
build-on-it contract; `docs/IDENTITY.md` is the brand rationale behind it (but
see **Divergences** at the bottom — the two are out of step in four places).

- **Tokens** — `src/index.css`
- **Primitives** — `src/styles/system.css`
- **Reference implementation** — `src/pages/Landing.tsx` + `src/pages/Landing.css`

## Non-negotiables

1. **Never write a hex or `rgba()` in a component.** Use a token. If the shade
   you need doesn't exist, add it to all three theme blocks in `src/index.css`
   (see *Surfaces*). Two deliberate exceptions exist, each commented in place:
   a black legibility scrim over a photograph, and a black `box-shadow` on a
   dark band — the maroon-tinted `--shadow-*` tokens vanish there. Both must
   *not* shift with the theme, which is exactly why they aren't tokens.
2. **Never add a second animation library.** `motion` is it.
3. **Never pin `font-family: 'Tajawal'`.** Use `--sans` / `--display` /
   `--display-ar`; the stack order does the script routing.
4. **Never hijack wheel/scroll events.** Pin with sticky positioning.
5. **Use logical properties** (`inset-inline-start`, `padding-block`,
   `margin-inline`, `text-align: start`). The app is RTL-only.
6. **Every animation checks `useReducedMotion()`.**

## Where the shared CSS lives

`src/pages/Home.css` is misleadingly named: it holds the **shared page layer**
— `.tld-section`, `.tld-grid`, `.tld-card`, `.tld-pill-tag`, `.tld-hero` — and
is imported by most pages, not just Home. Change something there and it lands
everywhere. `system.css` is the newer layer; the two are complementary, and
`Home.css` has not been renamed to avoid churning every import.

## The page model

A page is a vertical stack of **bands**. Each band owns a full-bleed surface
edge to edge. Content inside stays on a shared 1180px rail via `.tld-section`.
Nothing else sets page-level width.

```html
<div class="tld-band tld-band--invert">   <!-- surface, full bleed -->
  <section class="tld-section">           <!-- 1180px rail + block padding -->
    …
  </section>
</div>
```

Bands butt directly against each other. Add `margin-block` to a band only when
you deliberately want the page surface showing as a seam.

## Surfaces

Pick by role, not by colour. All are themed, so **a page built from these needs
no dark-mode CSS of its own.**

| Token | Role |
|---|---|
| `--surface-page` | The page behind everything |
| `--surface-band` | A full-bleed stripe, one step off the page |
| `--surface-tint` | A frame or panel sitting on a band |
| `--surface-raised` | A panel inside a frame |
| `--surface-card` | A card — the topmost surface |
| `--surface-invert` | Dark maroon band with light type |
| `--surface-hero` | Near-black maroon, for grain-backed heroes |

Two non-colour tokens carry the same rule: `--rail` (the shared content width
every band aligns to) and `--on-disabled` (disabled control text — a single
value, because it sits on the maroon ramp, which is *not* themed).

Ink pairs: `--ink` / `--ink-muted` / `--ink-faint` on light surfaces;
`--on-invert` / `--on-invert-muted` on inverted; `--on-primary` /
`--on-primary-muted` on maroon.

**Adding a token means three edits** in `src/index.css`: `:root`,
`:root[data-theme='dark']`, and the `prefers-color-scheme: dark` block. An
explicit theme choice stamps `data-theme`; the default "system" setting stamps
nothing. Miss the third and system-dark users get the light value.

## Primitives (`src/styles/system.css`)

**`.tld-band`** — full-bleed section, containing block for texture layers,
handles layering for you. Modifiers: `--page`, `--tint`, `--invert`, `--hero`.

> `--invert` recolours `h2`/`h3`/`p` for the dark surface. Anything inside it
> carrying its own light surface **must restore its own ink** — see the mentor
> card rules in `Landing.css`, which would otherwise be white on white.

**`.tld-frame` / `.tld-frame__panel`** — inset rounded rectangle on a band, and
a panel inside it. `.tld-frame` sets equal padding on all four sides on
purpose: `.tld-section` supplies an asymmetric block/inline pair, which reads
as a bug inside a visible frame.

**`.tld-display`** — oversized section title. Exposes `--title-size` so sibling
art scales with it (`Mascot.css` derives the cursor size from it).

**`.tld-heading--center`** — centres a `.tld-section__heading` and drops the
brand accent bar. That bar is a leading-edge anchor and reads as debris beside
centred text.

## Type

| Token | Stack | Use |
|---|---|---|
| `--sans` | Manrope → Tajawal | Body |
| `--display` | Manrope → Tajawal | Headings |
| `--display-ar` | Manrope → AlYamama → Reem Kufi → Tajawal | Display-size Arabic |

**Order is load-bearing.** Manrope has no Arabic coverage, so Arabic falls
through to the next face while Latin stays in Manrope — one stack, correct face
per script, no `:lang()` rules.

Arabic at display size wants `line-height: ~1.3` and `letter-spacing: normal`.
The global heading metrics are Latin-tuned and crowd descenders.

## Motion

- **Scroll-scrubbed** (position follows scroll): `useScroll` + `useTransform`.
- **Scroll-pinned** ("the page stops"): tall track + `position: sticky` child.
- **Entrance**: `whileInView` with `viewport={{ once: true }}`.

Auto-advancing UI additionally pauses on hover/focus and stops permanently once
the user interacts — WCAG 2.2.2.

## RTL

`<html dir="rtl">`. In a grid or flex row the **first DOM child lands on the
right**. Two places logical properties don't reach, so comment them where used:
`transform-origin` (no logical keyword) and arrow-key handlers, where
`ArrowRight` steps *backward* through a list.

## Gotchas

Each cost real debugging time. Check these first when something looks wrong.

1. **`> *` clobbers absolute children.** A band's `> *` rule sets
   `position: relative` on every child, dragging an absolutely-positioned
   texture layer back into flow. `.tld-band` exempts `.bg-noise`; any new
   absolute child needs the same.
2. **Source order: component CSS loads before page CSS.** So an
   equally-specific page rule wins. To beat `.tld-marketing .tld-section` from
   a component file you need a third class
   (`.tld-marketing .tld-section.tld-ptabs`).
3. **`:hover` outranks a `--modifier` class.** `.x:hover` is two classes'
   worth, `.x--active` is one. Scope with `:not(.x--active):hover` or the
   active state's text colour gets repainted.
4. **The spacing scale stops at `--space-8`.** There is no `--space-9`. An
   undefined custom property invalidates the whole declaration and CSS drops it
   silently — the build will not catch it.
5. **`font-synthesis: none` is global.** Asking for an unloaded weight renders
   the nearest loaded one. Check the Google Fonts `<link>` in `index.html` (or
   the `@font-face` blocks) before writing a weight.
6. **A missing `@font-face` file falls through to the next *family*,** not to
   another weight of the same family. Never declare a weight whose file isn't
   present.
7. **`position: sticky` vs ancestor overflow.** `.tld-marketing` sets
   `overflow-x: clip`, which does *not* create a scroll container, so sticky
   still resolves against the viewport. `overflow: hidden` would break it.
8. **Contrast on maroon.** `--on-primary-muted` (`#e9cfd5`) against `--primary`
   is ~4.4:1 — already marginal at body size. On any lighter maroon, use full
   `--on-primary`.
9. **A MotionValue derived from two inputs won't recompute** when only the
   non-scroll one changes. `useTransform` re-runs on scroll only. See
   `Mascot.tsx`, where a measured width arriving after mount needs an explicit
   `.set()`.
10. **A class-plus-element selector beats a bare class,** whatever the source
    order. `.tld-band--invert p` and `.tld-site-head p` are both (0,1,1), so a
    single-class rule on a `<p>` inside them loses — the page head's eyebrow
    silently rendered at the lead's size and colour for exactly this reason.
    Style a `<p>` inside such a block as `.parent p.my-class`.
11. **Grain belongs on maroon surfaces only.** `BackgroundNoise` paints grey
    noise; over `--surface-band` or any light surface it reads as dirt, not as
    film. The landing's light `.tld-why-bg` carries none on purpose.

## Component inventory

| Component | Notes |
|---|---|
| `Button` | `--primary` / `--secondary` / `--ghost` / `--on-primary`. The first three assume a light surface. |
| `BackgroundNoise` | Grain + optional spotlight. Props: `baseColor`, `spotlight`, `animated`, `patternAlpha`, `anchor`. Pass `baseColor="transparent"` to texture a surface the band already paints. |
| `Mascot` | Scroll-pinned cursor sweep. Owns its `<h2>` because the sweep is measured against the rendered title width. |
| `GalleryCards` | Auto-swapping photo deck with a drag-scrub bar. |
| `ProgramTabs` | Tabbed browser over live course data. The reference tab implementation — roving tabindex, `role="tablist"`, RTL-aware arrows. |
| `MentorStrip` / `Marquee` | Infinite scrollers sharing `useInfiniteMarquee`. |
| `SitePageHead` | Opening band of every inner site page — grain hero surface, eyebrow pill, `--display-ar` h1. Pass `art` for the landing-hero two-column split (omit it on the legal pages); `children` renders under the lead. Edits here land on all five inner pages. |
| `Footer` | Multi-column, shared by all 9 pages. Edits here are sitewide. |
| `ProgramGrid` | **Unused.** Superseded by `ProgramTabs`. |

## Divergences from `docs/IDENTITY.md`

The code has moved on in four places. All deliberate, none ratified — do not
treat either document as authoritative on these until they're reconciled.

1. **The pastel gradient backdrop is removed.** `--surface-page` is a flat
   `#fafafa`. The asset is still in `public/assets/`.
2. **AlYamama** is self-hosted and first in `--display-ar`. Only the Regular
   weight is installed — see `public/assets/fonts/README.md`.
3. **Reem Kufi** sits in `--display-ar` behind AlYamama and is still fetched
   from Google Fonts.
4. **The swords pattern is gone from the footer,** replaced by grain.

## Verify

```
npm run build   # tsc -b, then Vite. Does NOT catch invalid CSS values.
npm run lint    # oxlint
```

Neither validates custom properties or contrast. Check those by eye.
