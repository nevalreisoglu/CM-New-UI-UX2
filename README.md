# ECM Journey Studio — UX/UI redesign prototype

Single-file, click-through prototype of the redesigned Etiya Campaign Management (ECM) user experience.
Iterated after each UX/UI redesign meeting (16–18 Sept 2026) and the follow-up sessions.

**Open it:** download `index.html` and open it in a browser — no build, no server, no external calls (fonts are optional).
On the first visit per role a welcome card offers a guided tour. Append **`?notour`** to the URL to suppress the welcome card
and the resume prompt — useful for demos, screenshots and automated runs (automation is detected and suppressed anyway).
With GitHub Pages enabled on this repo it is served at the repo's Pages URL.

## What is in the prototype (v41)

- **Roles:** Marketer · Approver (maker/checker) · Admin · CMO/Executive — pages and actions follow the role.
- **Dashboard** with role presets, 8 headline KPIs, live counters, "needs attention", funnel & eliminations, control-group uplift.
- **Program** as a business initiative: goal, period, owner, contact cap, members (campaigns + journeys), roll-up results, Gantt timeline.
- **Campaign** in 8 steps: Info (push/pull channels, configurable fields) · Targeting (two-column segment picker) · Offer / NBO · Channel & content (template = design, content = slots; A/B and dynamic; live render) · Communication rules · Schedule · Approval · Summary; non-blocking readiness panel.
- **Journey Builder** with journey-owned delivery steps; Journey Monitor.
- **Segments** workbench: definition + query builder + live audience insight; channel-scoped exclusion lists; Segment Groups in Parameters.
- **Templates (design)** per channel — admin only; content is written inside deliveries.
- **Datamart** (admin) as a data catalogue: what data exists, how fresh it is, what each column means, how datamarts relate and who depends on them — with profiling computed from the rows and privacy masking.
- **Reports**, **Parameters** (campaign form switches, rule defaults, channels & senders), **Release & licences**.
- **Getting started** checklist per role, and **guided tours** with spotlight coachmarks — the campaign tour is interactive and ends with a real campaign waiting for approval.
- **User manual** behind a button in the top bar — embedded in the file, so it works offline.
- **Etiya brand kit** — navy and lilac primary, orange as accent, turquoise as action, Roboto throughout. Palette, token map and contrast rules in [`docs/brand.md`](docs/brand.md); `tests/brand-audit.js` checks every rendered text node against AA.
- Tooltips on every meaningful field.

Demo data only (30 customers, 18 campaigns, 3 journeys). Nothing is sent.

## Repository layout

```
index.html                        the prototype (single file)
docs/product-description.md       what it is, who uses it, why each screen is shaped that way
docs/user-manual.md               how to drive it, screen by screen (also embedded in the prototype)
docs/meetings/                    meeting notes (Turkish) that drove each iteration
tests/specs/                      Playwright regression specs
tests/screenshots/                reference screenshots of the main screens
tests/README.md                   how to run them and what they cover
docs/brand.md                     palette, token map, type scale, contrast rules
tools/embed-manual.js             copies the user manual into index.html
tests/tour.js                     standalone regression run for the guided tours
tests/dm.js                       standalone regression run for the Datamart catalogue
CHANGELOG.md
```

## Working on it

The prototype is one HTML file with inline CSS and vanilla JS. Data lives in constants near the top of the script
(`CAMPAIGNS`, `JOURNEYS`, `MLS` segments, `TEMPLATES`, `PROGRAMS`, `DATAMART_ROWS`, `EVENT_ROWS`).

After a change, run the regression suite (see `tests/README.md` for what it covers):

```bash
cd tests && npm install && npm test
```

It opens `index.html` over `file://`, so there is nothing to build or serve. `npm run shots` refreshes
`tests/screenshots/`.

The guided tours have their own end-to-end run, which drives the whole campaign tour and writes its screenshots to
`tests/shots/`:

```bash
cd tests && node tour.js
```

The Datamart module has its own run, which documents a column and checks the segment builder picks it up:

```bash
cd tests && node dm.js
```

The brand audit measures the rendered contrast of every text node on every page:

```bash
cd tests && node brand-audit.js
```

`docs/user-manual.md` is embedded in the prototype. After editing it, run `node tools/embed-manual.js`
to copy it back into `index.html` — the test suite fails if the two drift apart.
