# CM New UI/UX — project memory

Read this before touching anything. It carries the decisions and constraints from the
UX/UI redesign sessions so you do not have to rediscover (or accidentally undo) them.

Related reading, load when relevant:
- @docs/decisions.md — every product decision, with the reason behind it
- @docs/product-description.md — what the prototype is, module by module
- @docs/user-manual.md — the click-through walkthrough
- @docs/meetings/ — the source meeting notes (Turkish)
- @CHANGELOG.md — version history

## What this is

A **click-through prototype** of Etya's Campaign Management (ECM) product — a single
self-contained `index.html` (HTML + CSS + vanilla JS, ~380 KB). It exists to align the
team and the customer on the new UX before development starts. The code is a reference
for the development team, not the product itself.

Owner: Neval Reisoğlu (Senior PM, ECM). Reviewer: Fahri Kerçek. Audience after sign-off:
Olgay Bey, then the customer.

## Hard constraints

- **One file.** Everything lives in `index.html`. No build step, no bundler, no framework.
- **No external requests** except the Google Fonts stylesheet. It must render correctly
  from a `file://` URL, offline, weeks from now.
- **No browser storage** (`localStorage` and friends). State lives in JS variables.
- **Do not rename ids, classes or `data-*` hooks.** The Playwright scripts in `tests/`
  select on them. If a rename is genuinely necessary, update the scripts in the same commit.
- **The brand is "Etya", never "Etiya".** Check before committing.
- **Demo data carries no real person, customer or employee names.** Fictional names,
  masked ids (`CUS-****4821`), `@example.com`, `+90 5XX …`.
- **This is not a BI product.** Dashboard panels come from a fixed set of templates.
  Do not build a chart designer, a query builder for panels, or multiple boards.

## Architecture in one page

- **Views** are switched by `data-view` on the left nav: `dashboard`, `programs`,
  `campaigns`, `journeys`, `monitor`, `segmentation`, `surveys`, `offers`, `content`, `reports`,
  `opsan` (Operation analysis), `policies`, `parameters`, `api`, `about`. Each has a `render<View>()` function.
- **Roles** — `marketer`, `approver`, `admin`, `cmo` — are applied by `applyRole()`
  reading `data-roles` attributes. Every new screen or control must declare its roles.
- **Campaign editor** is a stepper:
  `CAMP_STEPS = ['Info','Targeting','Offer','Channel & content','Communication rules','Schedule','Approval','Summary']`,
  filtered per campaign by `campStepsFor()`. Readiness is computed by `campReady()` and is
  **advisory** — it never blocks navigation between steps. The stepper's colours come from
  `campReady()` (`campStepperHtml`, refreshed in place by `campStepSync`). Campaign types are
  `Offer` and `Information` (never "Info" — that is the step); the goal is a header chip
  (`#camp-goalchip`), not a form field.
  Readiness is "ready to submit" (six items, five for Information); approval is a state
  (`campApproval`), not an item. Rules and Schedule need an explicit choice (`rulesMode`,
  `sched.trigger`), never a default. There is no readiness side panel.
- **Templates vs content**: `SLOT_DEFS` / `TEMPLATES` define the *design* (admin-owned,
  slot structure per channel). `CONTENT_ITEMS` and the per-delivery slot values are the
  *text*. `tplFor` / `slotsFor` / `planPreviewHtml` bind them.
- **Segments** live inside segment groups; the create screen is a workbench
  (`#segsplit`) with live result charts (`renderSegInsight()`). The natural-language
  assistant is a modal (`#seg-nl-modal`), never an input embedded in the audience column.
- **Exclusions are channel-scoped** (`exclApplies`, `excludedCids`).
- **Operation analysis** (`renderOpsan`) is the row-level view: one scope bar, four tabs, one
  grid (`OPS_COLS`, `opsGridHtml`). Its rows come from `opsData()`, a seeded 90-day history.
  Elimination reasons are `ELIM_REASONS`, shared with the dashboard funnel.
- **Surveys** (`SURVEYS`) are content: attached per channel as `plan.survey` or on a journey
  Delivery step (`cfg.survey`); results are the Surveys tab of Operation analysis.
- **Journey Builder** opens on a list (`jMode`: `list` · `create` · `canvas`, `renderJourneysView()`);
  `jOpen(id)` is the only way onto the canvas.
- **Programs** are business initiatives with a goal, a contact cap, member campaigns and
  journeys, and a Gantt timeline (`.gantt`).
- Design tokens are CSS custom properties in `:root`. Some names are historical
  (`--green` is the primary, not a green) — change values, keep names.

## Working method

1. Make the change in `index.html`.
2. Run the regression scripts and **look at the screenshots** — they catch what the
   console does not (invisible text, collapsed columns, overflowing tiles):
   ```
   cd tests && npm install && npx playwright install chromium && npm run check
   ```
   Also run `camp2.js`, `seg4.js`, `dash.js`, `prg.js`, `eml.js`, `ops.js`, `srv.js`, `jlist.js`. An empty error list is
   the pass condition. Check 1280 px and 1440 px, menu open and collapsed.
3. Commit in logical steps with a clear message; add a `CHANGELOG.md` entry per version.
4. If a decision was made along the way, append it to `docs/decisions.md`.

## Do not

- Do not restructure the flow, rename steps, or add/remove fields without an explicit ask —
  the current flow is the outcome of four review rounds.
- Do not "tidy" the layout while doing a colour or copy task.
- Do not add dependencies, a router, or a component framework.
- Do not put operational detail on the executive dashboard's top strip (see decisions).
- Do not reintroduce a separate Delivery module — delivery lives inside the campaign.
