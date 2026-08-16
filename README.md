# Handoff: Harouna Saho Portfolio Site

## Overview
A minimal, restrained portfolio for Harouna Saho, a Yale painter/designer. It presents his art (concept paintings for one continuing fictional world) and product design work through a monospace/registration-mark "technical document" visual language, plus a few playful custom interactions (a doodle canvas, a chase-the-signature easter egg, a custom cursor).

## About the Design Files
The bundled file (`Harouna Saho Portfolio.dc.html`) is a **design reference** built in a proprietary prototyping format (custom `{{ }}` template bindings, `sc-if`/`sc-for` control flow, a `support.js` runtime). **It is not production code and should not be copied as-is.** Treat it as a fully-specified visual/interaction spec. The task is to recreate this design in whatever stack you set up in Cursor — plain React + CSS is a natural fit given the component/state structure already present (single-page app with client-side "pages" and view state, no routing library needed, though React Router or a simple hash-router would also work given the `#anchor` links used for pages).

## Fidelity
**High-fidelity.** Every color, font, spacing value, and animation timing below is final. Recreate pixel-for-pixel using the values given; only image/photo placeholders (grey diagonal-hatch squares) are unresolved and marked as such.

## Global Design Tokens

**Colors**
- White: `#ffffff` (primary background)
- Ink/black: `#111111` (primary text)
- Klein blue: `#002FA7` (accent — links, headings, Studio background, hover states)
- Mustard yellow: `#f0e15a` (Info/Studio page background, Studio accent text)
- Copper: `#c9720c` (technical/monospace labels only — section tags, metadata, catalog numbers)
- Borders/dividers: `#111111` (1px solid, structural) and `#dddddd` (1px, table rows)

**Typography**
- UI/headings: Arial, Helvetica, sans-serif, bold, tight tracking (`letter-spacing: -0.02em` to `-0.035em`), uppercase for headings
- Technical/metadata: 'JetBrains Mono', monospace — used for section tags ("SEC · 00 / HOME"), table headers, catalog numbers, footer, nav breadcrumbs. Always copper (`#c9720c`) unless on a colored background (white/yellow on blue backgrounds)
- Signature accent: 'Caveat', cursive, 30px — used only for the "roon" signature link
- No serif/Bodoni anywhere except one legacy artifact: the work-detail page's closing line uses 'Bodoni Moda' at 18px — flag this to the user as inconsistent with the "no Bodoni" rule and confirm whether it should switch to body sans-serif.
- Fonts loaded via Google Fonts: JetBrains Mono (400/500/700), Caveat (600). Bodoni Moda is loaded but should be dropped except for that one line above.

**Motion**
- Page transitions: 550ms, `cubic-bezier(.65,0,.35,1)`, directional per page (slide-in-from-left for Design, slide-in-from-right for Art, slide-in-from-top for Info, rise-up for Studio overlay). Home/Roon/Work/Room views use a simple 280ms fade.
- Two hairline rules (top of footer, bottom of header) drift continuously via slow (9–12s) ease-in-out keyframe translations — toggleable via a prop.

**Structural motifs**
- 4 corner "+" registration marks (copper, monospace, fixed position, toggleable via a prop) — a print/technical-document affectation.
- 1px solid black borders on cards/tables instead of shadows or rounded corners. No border-radius anywhere.
- Square (1:1) image crops throughout, currently diagonal-hatch placeholder blocks with a monospace label ("SQUARE CROP", etc.) — real art/photography assets need to replace these.

## Custom Cursor
A global custom cursor replaces the native pointer everywhere (`cursor: none` on the root container and forced via `!important` on `a, button, input, select, textarea, [role="button"]`, since browsers force their own pointer cursor on those tags regardless of inherited CSS).
- Renders as a small monospace label in a white box with black 1px border, tracking the real cursor position via a `document`-level `mousemove` listener (not scoped to one element — it must work identically on every page).
- Label text is `"cursor"` by default, switches to `"click"` when hovering any interactive element (checked via `event.target.closest("a, button, [role='button'], input, select, textarea, tr[data-clickable]")`) **or** while the mouse button is held down anywhere on the page.
- Table rows that are clickable (the Archive table) but aren't `<a>`/`<button>` need an explicit marker (e.g. `data-clickable`) so the label-switch logic can catch them.

## Screens / Views

### 1. Home (`page: "home"`)
**Purpose:** Landing page, entry to Art/Design/Info, contains the doodle easter egg and a scroll-reveal "Selected Work" teaser.

**Header** (shared across all pages): flex row, space-between, padding `34px 44px 22px`, white background, animated 1px black hairline at the bottom.
- Left: wordmark "HAROUNA SAHO" (21px bold, tight tracking, black → Klein blue on hover) + "roon" signature (Caveat cursive 30px, Klein blue, rotated -8deg) — see Roon Chase Mechanic below.
- Right: nav — **ART, DESIGN, INFO** (in that order), 13px bold, black → Klein blue on hover, small bottom-border indicator space reserved (2px transparent, filled on state, not currently used for "current page" indication — consider adding).

**Hero section:** padding `90px 44px 60px`, min-height `calc(100vh - 240px)`.
- Monospace tag "SEC · 00 / HOME" (11px, copper, wide tracking)
- H1 40px bold uppercase: "Harouna Saho" (black) / "Artist and Designer" (Klein blue), on two lines
- Body copy 15px: "Art to learn more about myself. Design to learn more about the world."
- Secondary nav (ART / DESIGN / INFO again), centered, 44px gaps, positioned ~260px below the intro copy
- Down-arrow scroll cue (copper, 18px monospace "↓") pinned bottom-center, links to `#selected-work`

**Doodle canvas (overlaying the hero, full-bleed SVG):**
- An SVG layer captures freehand mouse strokes drawn directly on the hero area (mousedown/mousemove/mouseup draws a `<path>`; pencil = 3px black stroke with an SVG turbulence/displacement filter for a hand-drawn texture; eraser = 18px white stroke, no filter, doesn't get the draw-on animation)
- Toolbar (top-right of hero): PENCIL / ERASER toggle buttons (active tool = black bg/white text, inactive = white bg/black text/border), TRASH button (clears all strokes, copper text), label "HELP ME DECORATE" (10px copper, centered, max-width 260px), and an ANIMATE button (black bg, white text; label becomes "PLAYING…" while active)
- **Animate behavior:** on click, replays every non-eraser stroke as a "drawing on" animation (SVG `stroke-dasharray`/`dashoffset`, speed 900px/sec, strokes sequenced one after another based on path length) — eraser strokes render instantly, are excluded from timing math. After the full sequence finishes, all strokes are rasterized to a single PNG (via an offscreen canvas, redrawing each stroke path with a few jittered passes to fake the pencil texture) and replaced by a floating image that bounces around inside the hero area like a screensaver (simple velocity + bounds reflection via `requestAnimationFrame`), positioned/sized to the drawing's bounding box.

**Selected Work section** (`id="selected-work"`): full-bleed Klein blue block, fades/slides in via `IntersectionObserver` (opacity 0→1, translateY 36px→0, 900ms). Heading "Selected Work" (34px bold uppercase, white). 2-column grid of square tiles (currently 4: two art pieces, one design project, one more art piece — mixed intentionally), each tile = hatched square placeholder + monospace catalog tag (yellow) + bold title (white). Footer link "SEE FULL ARCHIVE →" (copper monospace) to Art page.

### 2. Design (`page: "design"`)
**Index view:** slide-in-from-left, max-width 940px.
- Breadcrumb "← HOME", tag "SEC · 01 / DESIGN", H1 50px "Product design.", intro copy: "A smaller, growing shelf, not organized as an archive."
- Two cards side by side (flex-wrap, min 340px): 1px black border, Klein-blue border on hover, no fill.
  - **Sidonia AI** — locked/NDA card: date "SUMMER 2026", a 🔒 LOCKED badge next to the date, title, role "HEAD OF DESIGN AND GROWTH", one-line lede, "OPEN →" cta (Klein blue)
  - **Ring, concept** — unlocked card: date range "2024 - 2025", title "Ring, concept", role "WEARABLE AI · SELF-INITIATED", lede, "OPEN →" cta

**Project detail view** (`view: "project"`): same slide-in-left transition. Breadcrumb "← DESIGN", section tag, H1 50px title, lede paragraph (max 560px).
- **If locked** (Sidonia): single boxed panel (1px border) with a 🔒 "PROPRIETARY - UNDER NDA" label (copper) + explanation copy + a 3-row metadata table (ROLE / DATES / SURFACE) — no imagery, no archive/gallery view for locked projects.
- **If unlocked** (Ring): two-column layout — left column: two stacked square image-placeholder slots ("PRODUCT SHOT"/"STATE DIAGRAM" or "INDUSTRIAL RENDER"/"GESTURE SHEET" depending on project); right column: 4-row metadata table (ROLE / DATES / SURFACE / STATUS, status in copper) followed by 2 short process notes as body paragraphs.
- No archive/gallery browsing exists on the Design page — it's just these 2 cards + their detail pages, deliberately not styled as a catalog.

### 3. Art / Archive (`page: "art"`, `view: "index"`)
Slide-in-from-right. Breadcrumb "← HOME". Header row: left = tag "SEC · 02 / ART" + H1 50px "Archive" (Klein blue); right = entry count + medium list, right-aligned monospace copper ("012 ENTRIES / OIL · ACRYLIC · WOODCARVING").
- One-line collection description, then an "ARTIST STATEMENT" labeled block (10px copper label + 15px body paragraph, max-width 560px) — this is the artist statement, intentionally living on the Art page (not Info).
- **Catalog table**, full width, monospace headers (CAT / TITLE / MEDIUM / YR / EXHIBITION), 1px black top/bottom rule on the header row, 1px `#dddddd` row dividers, light-grey row hover. Columns: catalog number (copper mono), title (19px bold Klein blue — the visual anchor of each row), medium (13px), year (12px mono), and exhibition label — pieces belonging to a named show show that show's name; standalone pieces show **"One-off"**.
- **Branching logic:** clicking a row with an exhibition takes you to a **Room view** (grouped show page); clicking a one-off row goes straight to the **Work view** (single piece).

**Room view** (`view: "room"`): quick-fade transition. Breadcrumb "← ARCHIVE". Header: show title (44px Klein blue) + show venue/date and work count, right-aligned copper mono. 3-column grid of square-crop tiles (catalog tag + bold title under each), click-through to Work view.

**Work view** (`view: "work"`): quick-fade. Breadcrumb returns to wherever you came from ("← ARCHIVE" or "← [Show Name]" — tracked via a `from` state). Two-column: large square image placeholder (left) + metadata (right): category tag, 38px title (Klein blue), a 4-row table (MEDIUM / YEAR / DIMENSIONS in copper / EXHIBITION), and a closing descriptive line (currently set in Bodoni Moda serif — flag for review per the "no serif" rule).

### 4. Info (`page: "about"`)
Slide-in-from-top, full mustard-yellow (`#f0e15a`) background, min-height `calc(100vh - 200px)`.
- Breadcrumb "← HOME", sub-nav "INFO / STUDIO" (INFO underlined black when active), tag "SEC · 03 / INFO"
- H1 48px: "A painter building one world, scene by scene."
- Two-paragraph bio (15px, dark grey `#1a1a1a`, max-width 560px) — Yale senior, from The Gambia via Norman, Oklahoma; frames the work as one continuous world built scene by scene.
- "VIEW CV" button (outlined, black → Klein blue border/text on hover, "PDF" tag in copper) — **currently a placeholder anchor (`#cv`); needs the real CV file/PDF link.**
- Contact block: labeled "CONTACT", 3-row table — EMAIL (`mailto:harouna.saho@yale.edu`, Klein blue), INSTAGRAM (`@roon.paints`, placeholder URL), STATUS ("COMMISSIONS OPEN", copper).

### 4b. Studio (`page: "about"`, `view: "studio"`)
An overlay that rises up (550ms `riseUp` keyframe, `transform: scaleY` isn't used — it's a full-panel slide from the bottom) covering the Info page in Klein blue. Breadcrumb "← ABOUT", sub-nav (STUDIO underlined white when active), tag "SEC · 03.1 / STUDIO - LIVE", H1 42px "In progress", caption "STUDIO PICS · TRAVEL NOTES - NEWEST FIRST".

**Horizontal timeline** (core mechanic): a horizontally-scrolling row, newest entries first (left), each date-stamped entry sits on a shared horizontal rule with a small yellow tick mark, and below it 1–2 "card" entries (white/96%-opacity cards, drop shadow, on the blue background) with: a monospace kicker (UPD · [type] or NOTE · [type]), 19px bold title, square photo placeholder, short caption, and copper monospace technical caption (dimensions/materials/frame count). Trailing hint text: "SCROLL → EARLIER ENTRIES TO THE RIGHT" (copper mono). Entries mix studio-progress updates and travel notes (Gambia, Oklahoma) — dates currently hardcoded sample data from 06.18.26–08.11.26.

### 5. Roon caught page (`page: "roon"`)
Reached by successfully clicking the fleeing "roon" signature. Tag "SEC · 00 / ROON - CAUGHT", H1 50px "You caught it.", copy "Wow, you're dedicated." (**placeholder — Harouna to decide final content**), a DODGES stat table, a "SNEAK PEEK - WHAT I'M WORKING ON →" button linking to Studio (outlined Klein blue, fills solid on hover), and a "← INFO" link back.

### Page transition "curtain" (unused currently but present in state)
A full-viewport near-black (`#0a0a0a`) overlay that can animate down (`curtainDown`, top-anchored scaleY 0→1) or up (`curtainUp`, bottom-anchored scaleY 1→0), 550ms same easing, `z-index: 80`. Currently wired into state but the code path that triggers it (`s.curtain`) isn't actively set anywhere in the current build — likely a planned but unused transition style; ask Harouna whether it should be attached to specific navigations.

## Interactions & Behavior

### Roon chase mechanic (signature easter egg)
- The "roon" signature sits inline in the header. `onMouseEnter` triggers `roonFlee`.
- **First hover:** it "escapes" — jumps to a random position inside the homepage container's bounds (not the full viewport — this was a recent fix; it must never render outside the visible home page content area, `24px` margin inset) and switches to `position: fixed` so it can move freely.
- **Subsequent hovers:** a difficulty curve makes it harder over time (recently reversed from "gets easier"):
  - Random full-teleport chance: `min(0.75, 0.40 + dodges * 0.02)` — starts at 40%, climbs toward 75% as the player dodges more.
  - Otherwise it does a directional "flee jump" away from the cursor: jump distance `min(140, 70 + dodges * 3)` px (grows over time, capped at 140px), plus ±20px random jitter, always clamped within the homepage container bounds.
  - Position transitions animate over 300ms (`cubic-bezier(.65,0,.35,1)`) for left/top/rotation.
- Clicking it successfully (`onClick`) navigates to the Roon-caught page and preserves the `roonDodges` counter (shown there, zero-padded to 3 digits). Dodge count resets only when navigating back to Home from the caught page.

### Doodle → floating image sequence
1. Draw freehand strokes (pencil/eraser).
2. Click ANIMATE → strokes redraw themselves stroke-by-stroke (draw-on effect), eraser marks appear instantly without the draw-on animation and don't factor into total animation duration.
3. On completion, all strokes are flattened into one raster image and set loose as a bouncing floating element inside the hero bounds (screensaver-style physics, reflects off edges).
4. TRASH clears strokes and cancels any floating animation immediately.

### Custom cursor (see above) — applies on every page, not just Home.

## State Management (for reference — translate to your framework's idioms)
Top-level state: `page` ("home" | "design" | "art" | "about" | "roon"), `view` (per-page sub-view: "index" | "project" | "room" | "work" | "studio"), `room` (current show name), `workCat` (current piece id), `from` (where the work view was entered from, for correct back-link), `roon` (chase position/rotation), `roonDodges` (counter), plus the doodle canvas state (`strokes`, `drawing`, `curPoints`, `tool`, `animating`) and cursor state (`cursorX/Y`, `cursorVisible`, `cursorClickable`, `cursorDown`).

Data is currently inline sample data (hardcoded arrays/objects) — `WORKS` (12 catalog entries), `SHOWS` (2 exhibitions), `PROJECTS` (2 design case studies). Recreate as static data files/JSON, or wire to a CMS if the client wants to update content without a redeploy — worth asking.

## Assets
No real imagery yet — every image slot is a diagonal-hatch placeholder rectangle with a monospace label. Fonts are Google Fonts (JetBrains Mono, Caveat; Bodoni Moda should be removed except possibly one line, see note above). No icons/SVG illustration — the only bespoke SVG is the freehand-drawing filter (turbulence + displacement map) used for the pencil texture.

## Outstanding / needs client input before final build
- Real art photography and design project imagery (square crops) to replace all placeholders.
- Real CV file (PDF) to link from "VIEW CV".
- Final copy for the Roon-caught / Sneak Peek page (currently placeholder).
- Email/download attachment flow: spec'd as `mailto:` + file download only for now — no backend mail service.
- Confirm the stray Bodoni Moda usage on the Work detail page and the unused curtain-transition state — both look like leftovers from earlier iterations.

## Files
- `Harouna Saho Portfolio.dc.html` — the full design reference (single file, ~920 lines, inline styles + a JS state/logic block at the bottom). This is the source of truth for every exact value referenced above.
