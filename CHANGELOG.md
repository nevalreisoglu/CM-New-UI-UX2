# Changelog

Version numbers follow the published artifact versions.

## v47 — 24 Sept 2026
**Marketer dashboard strip** (decisions D11, D12). The Marketer preset's headline tiles are the state of the marketer's work instead of portfolio totals: **Needs your action** (drafts, rejected, without content, ending within 7 days), **Waiting for approval** (oldest wait), **Going out this week** (scheduled sends, next one named), **Live**, **Top campaign** (best conversion rate; flags campaigns below average). Every tile opens what it counts. Campaign performance — where opened and clicked live, per campaign — is now the marketer's first panel. Ops and Executive strips are unchanged. `tests/specs/dashboard.spec.js` guards the three presets.

## v46 — 23 Sept 2026
**Operation analysis and Surveys.** Two modules of the current product brought into the redesign, one commit each.
- **Operation analysis** (Operate, after Reports): one screen instead of the five report grids (Delivery, Elimination, Promotion, Active Promotions, Survey Result). A scope bar — period, searchable campaign picker, channel, campaign status, Reset — filters all four tabs and survives tab switching; each tab has a summary strip on the dashboard's tile markup.
  - **Deliveries**: one row per execution; technical ids hidden until *Show technical IDs* or the column chooser. **Eliminations**: a breakdown by rule that shares `ELIM_REASONS` with the dashboard funnel; a bar filters the grid. **Promotions**: *Active only* replaces the Active Promotions screen; recipient details masked unless an admin reveals them.
  - One grid for every tab: column chooser with reorder, sort, resizable columns, sticky header, the NOT/AND/OR builder behind *Advanced filter* with a chip per condition, CSV export of what is on screen, Excel as a disabled concept, in-memory saved views, 50-row pages, a side panel with every field and links to the campaign, and an empty state per tab.
  - **Results** on the campaign list and the editor header opens it pre-filtered to that campaign. Reports and Operation analysis each say which is the aggregated and which the row-level view.
- **Surveys** (Audience & content, after Segments): a narrow native module instead of LimeSurvey. List, and a workbench editor with definition, up to ten questions of six types (NPS, CSAT, Rating, Single, Multiple, Free text), per-option scores, one branching rule per question, a second language, and a customer preview on mobile or Web Self Care.
  - **Attach survey** on every campaign channel card and on the journey Delivery step: `{{SURVEY_LINK}}` for SMS, e-mail and push; rendered in the card for In-App, Web Self Care and Chatbot.
  - **Results** in Operation analysis › Surveys: responses, response rate, average score, completion, an NPS panel with the split and the trend, one chart per question, the latest free-text answers, and the response grid with the full answer set.
- Demo data: a seeded 90-day execution history from the campaigns' 90-day totals; eliminated customers over the dashboard's reasons; promotion codes on five Offer campaigns; an NPS after the renewal offer and a three-question CSAT after service messages, with 287 generated responses; nothing names a real person.
- Tests: `tests/ops.js` and `tests/srv.js` walk the two modules; navigation and screenshot specs cover them; the brand audit adds both views and seven deep states, skips text scrolled out of a scrolling container and measures text on gradient surfaces (8,053 text nodes, all AA).

## v45 — 23 Sept 2026
**Review round 4 (Toplantı 4).** Six changes, one commit each.
- **Dashboard headline strip — business outcome only.** Executive: Campaigns (active · ended), Conversions (rate), Revenue, ROI (net contribution) and Incremental (vs control group, share of total), each with a sparkline of the period and the vs-previous delta. Revenue and ROI are demo figures derived from the conversions and say *BSS feed, demo*. Marketer and Ops come down to five tiles; no preset shows Delivered, Opened or Clicked totals.
- **Campaign performance** replaces Top campaigns: every campaign in the period with Status, Targeted, Delivered, Opened, Clicked, Conversions, Conv. rate and Revenue, sortable. A row opens that campaign's funnel, eliminations, channel split and control-group uplift inside the panel; × returns to the table.
- **Live now** reads at a glance: a status bar, dot and icon per counter, with a word for what the colour means. Numbers stay dark; amber and red appear only above zero.
- **Create your campaign**: + New campaign opens a centred creation screen (name, objective cards, push or pull, Start building, a template strip of the three most recent campaigns, and a skip link). The stepper appears once the draft exists. The first-campaign tour gains a step for it (17 steps).
- **Marketing-toned copy**: a heading per editor step (*Tell us about your campaign* … *Ready to launch*) and warmer empty states. Stepper labels, field labels and `CAMP_STEPS` are unchanged.
- **Demo data without real names**: one `DEMO_USERS` constant of fictional users; sample customers with masked ids, `+90 5XX` numbers and `@example.com` addresses.
- Tests: three creation-screen specs, a step-heading spec and `demo-data.spec.js`; the brand audit now also measures the creation screen, the empty campaign list and the dashboard's campaign detail (8,958 text nodes, all AA).

## Unreleased — 22 Sept 2026
- **User manual in the prototype**: a button in the top right opens `docs/user-manual.md`, rendered in a dialog with a contents list. The markdown is embedded in `index.html`, so a downloaded single file carries its manual with no server and no network. `tools/embed-manual.js` re-embeds it after an edit and the test suite fails if the two drift apart.
- `docs/`: product description, user manual, and the meeting notes (Turkish) behind each iteration.
- `tests/`: Playwright regression suite (56 specs) over `index.html` plus reference screenshots of the main screens.

### Fixed
- The prototype opens on the **Dashboard** instead of the Journey Builder, matching how the Dashboard is described everywhere else. The journey canvas is now fitted the first time the builder is opened rather than at boot, because `fitView` measures the SVG and it is 0x0 while the view is hidden; later visits keep the pan and zoom the user left behind.
- **Escape** now closes the segment assistant dialog, like every other dialog in the prototype.

## v44 — 23 Sept 2026
**Etiya brand kit applied.** A visual re-skin through the CSS custom properties: no layout, wording, flow or behaviour changed.
- **Colour**: primary navy `#242441` and lilac `#5D5D8D`, secondary orange `#F58220`, complimentary turquoise, and the kit's grey family. The top bar and footer are lilac, the left menu is navy with a lilac active row and an orange left bar. **Orange is accent, turquoise is action** — orange never carries white text, turquoise backgrounds only in the darkened CTA shades.
- **Type**: Roboto 400/500/700 replaces Open Sans, on the kit's scale (body 14/20, card titles 22/28 medium, section headings 16/24 medium, labels 12–14 medium, 700 only for numbers that must dominate).
- Journey step tints, chart series, the Gantt, e-mail and phone previews, code blocks and the simulation strip were all re-toned into the palette; no old palette value survives anywhere in the file.
- **Three kit values were darkened** because they do not reach AA as text backgrounds: the CTA `#00879A` → `#00818F` (4.26 → 4.63:1), the orange ink `#B3610F` → `#9E560D` (4.04 → 4.94:1), and status ok `#2E7D32` → `#2A7230`.
- `tests/brand-audit.js` measures the rendered contrast of every text node across every page at two widths with the menu open and collapsed: 8047 nodes, all AA.
- See `docs/brand.md` for the palette, the token map and the type scale.

## v43 — 22 Sept 2026
**Datamart catalogue.** Administration › Datamart was a disabled placeholder; it is now a data catalogue rather than a table-settings screen.
- **List** of every datamart with type, key column, size, last load and a health pill (fresh / stale / failed), what uses it, and its relationships in plain words. Labelled actions; Delete is disabled with the reason when something depends on it.
- **Overview** — KPIs, the editable description, "used by" links into the real segments, campaigns and journeys, and a small relationship diagram.
- **Columns** — the core screen. One row per attribute, grouped and collapsible, with label, type, roles, privacy, fill rate, distinct count and usage. A side drawer documents one column: labels EN/TR, group, type, predefined mapping, roles, category + allowed values, privacy and masking with a live example, a profile computed from the rows, and who filters on it. Bulk edit for group, privacy, masking and category.
- **Data** — preview with a column profile, search and filter. Masking follows each column's privacy, with a "View as marketer" toggle; the admin otherwise sees values unmasked.
- **Relationships** — defined here and validated on type; segments can only join through them.
- **Load & refresh** (concept) — source, schedule, simulated run, load history with schema-change notes, and a danger zone that needs the datamart name typed and is blocked on the default main.
- **Segments read the catalogue**: the filter column picker is grouped by attribute group, shows the label with the technical name, marks personal columns and keeps a "recently used" group, so it stays usable at 500 columns. A column marked as a category switches its filter to `in` with a value list.
- **Dashboard**: the admin preset lists stale or failed datamarts under "Needs attention", linking to their Load & refresh tab.
- Profiles (fill %, distinct, top values, min/max/mean) are computed from the demo rows, not hard-coded. `DM_COLS` / `EVENT_DM_COLS` / `colsOf()` are now derived from the catalogue.

## v42 — 22 Sept 2026
**Guided tours + Getting started.** An onboarding layer over the existing screens; nothing about the product itself changed.
- **Getting started** page under Home, per role, with a progress bar. Items tick themselves off from real app state — a segment you actually saved, a campaign that actually reached *Pending approval* — not merely from having watched a tour. Journey and Program items are listed as "coming soon".
- **Guided tours**: a dimmed page, a spotlight on the element, and a dark card with the explanation, a step counter and a progress bar. Tours are interactive — they move on when you do the step, not when you press Next. On a waiting step the primary button is **Do it for me** and performs the step, so the whole tour can be demoed end to end; **Show me where** flashes the control instead.
- Five tours: *Create your first campaign* (16 steps, marketer), *Create a segment*, *Review and approve a campaign* (approver), *Read the dashboard*, *Admin setup*.
- **?** button in the top bar: tour list with status and restart, Getting started, the user manual, and a "Show tips on first visit" switch.
- First visit per role shows a welcome card; a tour left halfway offers to resume. Progress is kept in `localStorage` under `ecm-tours-v1`, with an in-memory fallback when storage is unavailable.
- `?notour` in the URL suppresses everything that starts on its own; so does `navigator.webdriver`, which keeps the test suite clean.

## v41 — 22 Sept 2026
- Brand name corrected to ETIYA everywhere (logo, footer, campaign labels, role names).
- Journey Builder and Journey Monitor: simulation controls moved into a marked "Simulation · demo only" strip so demo clock/event controls are not mistaken for product features.

## v40 — 21 Sept 2026
- Program module: list, Overview, Timeline (Gantt), Members picker, Settings (goal, contact cap, summary report).
- Dashboard: Opened / Clicked headline KPIs (8-tile strip).

## v38–39 — 21 Sept 2026
- Dashboard (Home) with role presets, live counters, needs-attention list, trend, funnel & eliminations, channel/category breakdowns, top campaigns/journeys, control-group uplift.

## v37 — 21 Sept 2026
- Visual pass: stronger type scale, two greys, bordered cards with tinted section headers, 36px inputs, table headers, 8-pt spacing.

## v35–36 — 21 Sept 2026
- Segment editor rebuilt as a workbench (definition left, audience right) with live Audience insight charts; assistant moved to a dialog; result rows on demand.

## v33–34 — 21 Sept 2026
- Template = design / content = text: Templates module moved to Administration; slots per channel; content written per delivery with live render; copy content from campaign.
- Segment result panel opens only after Search (superseded by v35).

## v31–32 — 21 Sept 2026 (meeting 3)
- Info: configurable Objective/Description/Brand, push/pull channel groups + MMS, priority for pull/TM only, pre-sent period moved to Parameters.
- Targeting redesign; A/B and Dynamic as independent switches; Approval as its own step; Reports page; status colours; tooltips everywhere.

## v29–30 — 18 Sept 2026 (meeting 2)
- Segments two-screen; groups in Parameters; campaign flow flattened (Channel & content · Rules · Schedule as steps); Offer skipped for Info; promo code; execution log removed; Copy-target and event-triggered removed from campaign.

## v20s — 16–17 Sept 2026 (meeting 1)
- Role views, collapsible menu and panels, breadcrumb, labelled actions, readiness layer, Etiya palette, exclusion redesign, NL filter assistant.
