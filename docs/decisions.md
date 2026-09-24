# Decision log

Every product decision behind the prototype, with the reason. Newest section last.
Source meeting notes are in `docs/meetings/`. When a new decision is taken, append it
here with its date and source — this file is the project's memory.

Status: **Settled** = do not reopen without an explicit ask · **Open** = still to be decided.

---

## Campaign model

| # | Decision | Why | Status |
|---|---|---|---|
| C1 | **Delivery is not a separate module.** It lives inside the campaign, as the "Channel & content" step. | Users were creating a campaign and then hunting for a second object to make it actually send. One object, one flow. | Settled |
| C2 | **Push and pull channels cannot be mixed in one campaign** (`CH_KIND`). | They have different rules, different timing and different success metrics; mixing them made the rules step incoherent. | Settled |
| C3 | The campaign editor is a **stepper with all stages visible**: Info · Targeting · Offer · Channel & content · Communication rules · Schedule · Approval · Summary. | Reviewed positively in every session — the marketer sees the whole path from the first screen. | Settled |
| C4 | **Readiness is advisory, never blocking.** `campReady()` shows what is missing; the user can still move between steps and save a draft. | Campaign setup is not linear in real life; hard gates force fake data entry. | Settled |
| C5 | **Approval is its own step**, with an approver list (`APPROVERS`) and a visible approval history. | Maker/checker is a compliance requirement at operators; burying it in Summary hid it. | Settled |
| C6 | Objective, Description and multi-brand are **configurable** (`CAMP_CFG`) — switched on per installation in Parameters. | Operators differ in how much they capture up front. | Settled |
| C7 | Rule defaults (`RULE_DEFAULTS`), sender/gateway settings and the campaign-form switches live in **Parameters**, not in the campaign. | They are administration, set once, not per-campaign choices. | Settled |
| C8 | "Campaign pre-sent period" moved out of Info into **Parameters**. | It is a system-wide setting, not a campaign attribute. | Settled |
| C9 | The **new-campaign screen is centred and minimal** (max ~720 px, one column): name, objective cards, push/pull, one CTA. The stepper appears only after the campaign exists. | Toplantı 4 — the left-aligned form felt unfocused; agent-creation screens were the reference. | Settled |
| C10 | Product copy moves toward **marketing language** — "Create your campaign" rather than "New campaign"; step headings phrased as questions. Stepper labels stay short. | Toplantı 4 — the audience is marketers, not operators. | Settled |

## Templates and content

| # | Decision | Why | Status |
|---|---|---|---|
| T1 | **Template = design, content = text.** A template defines the slot structure and layout for a channel and is admin-owned; the text that fills the slots belongs to the delivery. | The earlier version mixed the two, so every copy change meant a new template. | Settled |
| T2 | Slots are defined per channel (`SLOT_DEFS`); a delivery fills them (`slotsFor`), with an A/B variant (`slotsB`, `bodyAlt`) and dynamic content (`dynOn`) as options on the same structure. | Keeps A/B and personalisation inside one object instead of duplicating deliveries. | Settled |
| T3 | Templates show **where they are used** (`tplUsedBy`) before they can be changed. | Admin-owned assets need an impact view. | Settled |

## Targeting and segments

| # | Decision | Why | Status |
|---|---|---|---|
| S1 | Segments belong to **segment groups**. | Mirrors how operators organise their audience library. | Settled |
| S2 | The segment create screen is a **workbench**: criteria on the left, live results and charts on the right (`renderSegInsight()`), not an empty result panel waiting for a run. | The split screen wasted half the viewport on first open; results now teach while you build. | Settled |
| S3 | **No text/assistant input inside the audience column.** The natural-language assistant is a dialog (`#seg-nl-modal`) launched from a button. | Two input surfaces for the same thing confused the screen; name/description were duplicated. | Settled |
| S4 | **Exclusions are channel-scoped.** | A do-not-contact rule for SMS should not silently remove the customer from an e-mail campaign. | Settled |

## Dashboard (executive / CMO)

| # | Decision | Why | Status |
|---|---|---|---|
| D1 | The top strip carries **4–5 high-level metrics only**: campaign count · conversion (and rate) · revenue · ROI · incremental. | Toplantı 4 — "seeing total clicks across all campaigns is no use to me; it is just clutter." | Settled |
| D2 | **Delivered · Opened · Clicked and other operational metrics move to the per-campaign breakdown** — columns in the campaign table, detail panel on selection. | Same reason; they are meaningful per campaign, meaningless summed. | Settled |
| D3 | **Incremental and ROI are the headline value metrics**, computed against the control group and labelled as such. | They answer "what did you actually achieve". | Settled |
| D4 | "Live now" uses **status colour and a dot/icon per row** — delivered green, in progress turquoise, queued amber, failed red. | Toplantı 4 — the panel was uniformly navy and unreadable at a glance. | Settled |
| D5 | Panels can be **hidden and re-added**, from a fixed set of templates. No free-form panel builder, no multiple boards. | Liked in review, but the product must not drift into BI. No further work planned on this. | Settled |
| D6 | Panel presets differ by role (`dbPreset()`). | A CMO and a marketer open the same view expecting different things. | Settled |

## Programs

| # | Decision | Why | Status |
|---|---|---|---|
| P1 | A **Program is a business initiative**, not a folder: it has a goal with a target metric, a contact cap, member campaigns and journeys, and a Gantt timeline. | Operators plan by initiative and need to see overlap and contact pressure across it. | Settled |
| P2 | Goal progress is computed against the goal's own metric (rate metrics as rates, absolute metrics as totals). | An early version divided a rate by a count. | Settled |

## Visual design

| # | Decision | Why | Status |
|---|---|---|---|
| V1 | The **Etya brand kit** is the palette: Primary `#242441` / `#5D5D8D`, Secondary orange `#F58220` / `#F9AA56`, Complimentary turquoise `#00B5CB` / `#37DBDF`, Greys `#DFE1DF` / `#EBECEB`. Roboto. | Doğukan's brand kit, adopted in Toplantı 4. | Settled |
| V2 | **Header and footer use Primary Light** `#5D5D8D`; the left menu is Primary Dark with a lilac active row and an orange left bar. | Decided with the kit; the white header read as unfinished. | Superseded by V7 |
| V3 | **Primary buttons are turquoise** (`#00879A`, hover `#00707E`, white text). Green buttons are gone. | Toplantı 4. The bright `#00B5CB` fails contrast with white text (2.5:1) — never use it as a button background. | Settled |
| V4 | **Orange is an accent and tint, not a text background**: bars, 3px markers, icon accents, and tinted surfaces with `#B3610F` text. | Contrast. | Settled |
| V5 | Stronger typography and visible boxes: clear section headings, card header strips, bordered panels. | Earlier versions read as flat and low-contrast. | Settled |
| V6 | Every text/background pair must pass **AA (≥ 4.5:1**, ≥ 3:1 for large semibold). | Operator procurement checks this. | Settled |

## Prototype scope and honesty

| # | Decision | Why | Status |
|---|---|---|---|
| X1 | Journey simulator controls are labelled **"⚗ Simulation · demo only"**. | They must not be mistaken for a product feature in a customer demo. | Settled |
| X2 | Guided tours + a Getting started surface, Insider-style, starting from the first campaign. | Designed, to be implemented. | Open |
| X3 | The ECM **Datamart** module is designed and scoped. | To be implemented. | Open |
| X4 | **DVH is out of scope** for now. | The product has not been seen by the team yet. | Open |

## Review round 4 — implementation (23 Sept 2026, v45)

Decisions taken while building the Toplantı 4 changes (D1–D4, C9, C10), with the review on 23 Sept 2026 as the source.

| # | Decision | Why | Status |
|---|---|---|---|
| D7 | **Revenue and ROI are demo figures, labelled as such.** Revenue = conversions × ₴186; ROI = incremental revenue ÷ sending cost (₴0.06 per message sent); the ROI tile's second line is the net contribution. Both tiles carry *BSS feed, demo*. | The prototype has no billing feed. A stated formula keeps the numbers honest and consistent with the incremental figure, and the note stops them being read as live. | Figures superseded by D13 |
| D8 | The **Marketer and Ops strips** are Customers reached · Conversions · Conversion rate · Waiting on you · Live. Delivered goes too, not only Opened and Clicked. | D1/D2 apply to every preset: a summed Delivered is the same noise as a summed Opened. Five tiles, like the Executive strip. | Settled |
| D9 | **Top campaigns becomes Campaign performance**, full width: every campaign in the period, sortable, Opened and Clicked shown as rates of delivered. A row opens the campaign's funnel, eliminations, channel split and uplift **in the same panel**; × returns to the table. | D2 moves the operational metrics here, so the table must hold them all. Opening in place keeps the reader on the dashboard; the editor is one click away. By category and Top journeys become half-width so the grid has no holes. | Settled |
| D10 | **Live now: colour only when there is something to say.** Approval is amber only above zero; failed deliveries are red above zero and green "none" at zero. Every colour comes with a word; numbers stay dark. | D4, without turning a zero into an alarm. Colour alone fails colour-blind readers. | Settled |
| C11 | **Creation-screen choices only pre-fill.** Upsell / Cross-sell → category Upsell; Retention → Retention; Winback → Win-back; Informational → type Info; Acquisition has no matching category and leaves it to Info. Push starts on SMS, pull on In-App. The name is required before Start building. | C9 asks for a focused first step, not a second form: everything stays editable in Info, and the editor, the steps and the readiness rules are untouched. `campOpen(null)` (the skip link) still opens the form directly. | Settled |
| C12 | **One heading per step** above the step's content (*Tell us about your campaign* … *Ready to launch*); `CAMP_STEPS` and the stepper labels are unchanged. Empty states say what to do next; field and button labels are not reworded. | C10, while keeping navigation short and field labels precise. | Settled |
| X5 | **Demo data names no real person.** Users come from one `DEMO_USERS` constant of fictional names; the signed-in user is Ayşe Demir in every role view. Sample customers have masked ids (`CUS-****nnnn`), `+90 5XX XXX nn nn` numbers and `@example.com` addresses, mapped consistently across datamarts so joins still work. The role picker reads just Marketer / Approver / Admin / CMO / Executive. `tests/specs/demo-data.spec.js` guards it. | The prototype is shown to customers. | Settled |

## Operation analysis and Surveys (23 Sept 2026, v46)

Two modules of the current product that the redesign had not carried over: the operational report grids and the LimeSurvey-based surveys. Source: the task brief of 23 Sept 2026.

| # | Decision | Why | Status |
|---|---|---|---|
| O1 | **One Operation analysis screen instead of five report screens.** Delivery, Elimination, Promotion, Active Promotions and Survey Result become one view in Operate (after Reports) with four tabs: Deliveries · Eliminations · Promotions · Surveys. Active Promotions is the *Active only* switch inside Promotions, not a menu item. | Five raw grids with the same filter strip made users hop between screens to answer one question about one campaign. Customers use these reports often, so the grid's power stays — the change is a layer of context above it. | Settled |
| O2 | **One scope bar above the tabs** — period (7 / 30 / 90 days, like the dashboard), a searchable campaign picker, channel, campaign status, Reset — applied to every tab and kept when switching tabs. The status filter is the *campaign* status, because it is the one status every tab shares. | The old screens had no period and no campaign filter; the question is almost always "this campaign, lately". | Settled |
| O3 | **Technical ids are hidden by default** (Communication, Delivery, Execution, Main DM, Operation, Channel, Campaign, Response and Survey ID) and reachable through the column chooser and a *Show technical IDs* switch; the side panel always shows them. | The old grids led with ids; marketers read campaign, channel, dates and counts. Support staff still need the ids, one click away. | Settled |
| O4 | **The NOT/AND/OR builder moves behind an Advanced filter button** and opens in a panel; each active condition shows as a chip with ×. NOT applies to one condition; AND / OR join left to right, as in the current product. | A permanent strip took space on every visit for a feature used on few. Chips keep active filters visible. | Settled |
| O5 | **Recipient details are masked** (`a•••@example.com`, `+90 5•• ••• 12 34`) in the grid, the panel and the CSV; only an admin can reveal them, with a switch. Nothing reproduces the current product's real addresses. | The Promotion Result screen shows real people's e-mail addresses; the prototype is shown to customers and privacy is a column property (Datamart). | Settled |
| O6 | **The elimination breakdown and the dashboard funnel read one constant** (`ELIM_REASONS`: consent / opt-out, channel cooldown, exclusion lists, type overlap, pre-sent period, with their shares). Clicking a bar filters the grid. | Two screens that disagree on why customers were removed would undo trust in both. | Settled |
| O7 | **Operation analysis rows are a dated 90-day execution history**, built once from each campaign's 90-day dashboard totals and spread over the days its period overlaps the window. The 90-day view agrees with the dashboard; 7 and 30 days are slices of the same history, so they can differ from the dashboard's per-period demo figures, which are not date-aware. | A row-level screen must never show a send before a campaign started. Where the two demo models differ, the dated one is the honest one. | Settled |
| O8 | **Results** on the campaign list (campaigns that have run) and in the editor header opens Operation analysis on Deliveries, filtered to that campaign, on the shortest period that holds its executions. | The most valuable entry: from "my campaign" to "what happened", without re-typing a filter. | Settled |
| O9 | **Saved views are in memory only** in the prototype (scope, tab, columns, filters), with a note that the product saves them per user. | `CLAUDE.md`: no browser storage. | Settled |
| O10 | **CSV export is real** — it writes the filtered, sorted rows and visible columns; **Excel is a disabled concept** with a tooltip. | CSV proves the grid is the source of the file; Excel needs the reporting service. | Settled |
| O11 | **Reports and Operation analysis say which is which** in one line at the top of each: Reports is aggregated and chart-led, Operation analysis is row-level. | The distinction must be visible to a customer clicking through, not only in a manual. | Settled |
| SV1 | **A native, narrow survey capability instead of LimeSurvey.** | Responses land in the Event DataMart and become segmentable (detractors, unhappy CSAT answers) like any other feedback; LimeSurvey kept them in a separate tool with a separate login. Most operator surveys are NPS or CSAT with one or two follow-ups. | Settled |
| SV2 | **A survey is content, not a campaign type.** It is attached per channel in *Channel & content* and on a journey Delivery step. Push channels (SMS, e-mail, push) get a personal `{{SURVEY_LINK}}`; pull channels (In-App, Web Self Care, Chatbot) render the questions inside the card. Not offered on telemarketing. | Keeps one campaign flow (C1, C3) and the template/content split (T1). A call script cannot carry a link. | Settled |
| SV3 | **Deliberately small builder**: six question types (NPS 0–10, CSAT 1–5, Rating, Single, Multiple, Free text), at most **ten questions**, **one branching rule per question** ("if the answer is X, skip to question N / the end"), reorder with ↑ ↓. No pages, no drag-and-drop, no logic canvas, no quotas or panels. | Completion drops with every question after the first few and most customers answer on a phone. Anything larger is a research platform, which ECM is not. | Settled |
| SV4 | **Scoring is optional per survey**: NPS, CSAT and rating answers count as their value; choice options carry the score the author gives them. The result description is the NPS category, else a CSAT band (satisfied / neutral / dissatisfied). | Matches the current product's Total Score and Result Description without a scoring language. | Settled |
| SV5 | **Survey results live in Operation analysis › Surveys**, not on a separate results page: response, response rate (of delivered with the survey), average score, completion, NPS with its trend, one chart per question, and the response grid with the full answer set in the side panel. | Same scope bar, same grid, same export — and the same place people already look for Survey Result today. | Settled |
| SV6 | **Surveys are authored by marketers and admins**; approvers and executives do not see the Surveys page. Approvers see results in Operation analysis. | Same split as Segments: audience and content authoring is not approver work. | Settled |

## Marketer dashboard strip (24 Sept 2026, v47)

Source: owner review of the Marketer preset on 24 Sept 2026 — "the cards on the marketer tab are not meaningful".

| # | Decision | Why | Status |
|---|---|---|---|
| D11 | **The Marketer strip is the state of the marketer's work, not portfolio totals**: Needs your action (drafts, rejected, without content, ending within 7 days) · Waiting for approval (with the oldest wait) · Going out this week (scheduled sends, the next one named) · Live · Top campaign (best conversion rate, with how many campaigns are below average). Every tile opens what it counts; Top campaign opens that campaign's detail. Colour only above zero, always with a word (D10). Supersedes D8 for the Marketer preset; the Ops and Executive strips are unchanged. | Customers reached, Conversions and Conversion rate summed over every campaign are the same noise D1/D2 removed from the executive strip, and a 2.3 % rate averaged over Info and Offer campaigns means nothing. A marketer's morning questions are "what is waiting on me, what is stuck, what goes out today, is anything underperforming". | Settled |
| D12 | **Opened and clicked stay per campaign, and stay visible.** The customer likes them; they are meaningful per campaign, meaningless summed. They live in Campaign performance (count and rate of delivered), in the campaign detail funnel, in Reports and in Operation analysis › Deliveries — not in any headline strip. For the marketer, **Campaign performance is the first panel** under the strip, above Live now. | Keeps D2 and answers the customer's ask in the same move: the table is where opened/clicked make sense, so the marketer lands on it. | Settled |

## Chrome surfaces (24 Sept 2026, v48)

Source: owner review on 24 Sept 2026, with Murat's competitor benchmark — "the full dark fill on the left menu and the top/bottom bars tires the eye and keeps pulling attention to the left; competitors no longer use solid dark chrome".

| # | Decision | Why | Status |
|---|---|---|---|
| V7 | **The menu and the bars are a translucent lilac wash, not a solid dark block.** Top bar and footer: `rgba(93,93,141,.14)` over the page; left menu: `.08`; hover `.12`; active row `.22` with the orange left bar and navy semibold text. All chrome text is dark ink (`--ink`, `--ink-2`); controls on the bars (role picker, language, ?, User manual) sit on white. Supersedes V2. The brand colours are unchanged — the same lilac at a lower alpha. | The dark menu was the heaviest element on every screen and competed with the content. A light wash keeps the brand present, lets the content lead, and is where the benchmark and the Agentic AI screens are. `--ink-3` fails on the bars (3.9:1), so captions there use `--ink-2` (6.4:1+). | Settled |

## Dashboard KPIs at operator scale (24 Sept 2026, v49)

Source: owner review on 24 Sept 2026 — "10 conversions" on the CMO view undermines the screen in a customer demo.

| # | Decision | Why | Status |
|---|---|---|---|
| D13 | **Aggregate figures are shown at operator scale; row-level demo data stays small.** Every count that reaches the dashboard strip and panels and the Reports page goes through one `scaleRows()` (`DEMO_SCALE = 1900`); the campaign list, targeting counts, journeys and Operation analysis keep the 30-customer set. A pill in the header says *Demo figures at operator scale*. Unit economics are one place too: ₴ 720 ARPU uplift per conversion, ₴ 1.10 all-in cost per message; ROI = net ÷ spend, net = incremental revenue − spend. Incremental is the uplift share measured on the campaigns with a control group (control rate = campaign rate × 0.5–0.7), applied to all conversions. Supersedes D7's figures (₴ 186 / ₴ 0.06). | The CMO view has to be credible: at a telecom operator these numbers are in the millions. Inflating the row-level data would break the click-through, so the scale is applied once, where totals are shown. At 30 days this gives ≈ 2.4M delivered, 55K converted (2.3 %), 19K incremental (35 %), ₴ 40M revenue, ₴ 2.7M spend, ROI 4.1x. | Settled |
| D14 | **Every KPI tile shows its denominator or comparison — never a bare percentage.** *Converted customers* (unit in the label, `customers` after the number): "2.3 % of delivered · 2.4M delivered". *Extra conversions from campaigns*: a two-segment bar, baseline grey and incremental turquoise, summing to the converted total, with "n would have converted anyway · n thanks to campaigns" and "35 % of all conversions · measured against the control group". *Revenue*: average per conversion and the conversion count. *ROI*: net and spend. *Campaigns*: active and ended. Tooltips on Converted and Extra conversions explain what is counted, with the control-group arithmetic computed, not typed. A zero change renders "no change" in muted text with no arrow; a change under 0.05 % shows two decimals rather than claiming no change. | A value with a bare percentage says neither what is counted nor what the share is of; the Incremental tile in particular is a comparison, so it is drawn as one. "▲ 0 %" says "it went up" and "it did not change" at once. | Settled |

## Menu scope (24 Sept 2026, v51)

Source: owner request on 24 Sept 2026, reviewing the menu (it had grown past the window height).

| # | Decision | Why | Status |
|---|---|---|---|
| X6 | **Offers and Policies are hidden from every role, not removed.** One `HIDDEN_VIEWS` set in `applyRole()` hides their menu entries; their `data-roles`, views and render functions stay, so deleting a name from the set brings the page back unchanged. The journey Offer step's *Open offer* link is hidden with it. Campaigns still choose offers in the Offer step. | The menu no longer fits the window and neither page is part of what the customer reviews now. Hiding keeps the work available for a later round without a rebuild. | Open |

## Journey list and creation (24 Sept 2026, v52)

Source: the task brief of 24 Sept 2026 — campaign and journey are meant to be equal top-level entities, but Journey Builder dropped the user onto the canvas with a dropdown.

| # | Decision | Why | Status |
|---|---|---|---|
| J1 | **Journey Builder opens on a list like Campaign.** Same components as the campaign list: search, status chips, Advanced filters (program, trigger type, delivery channel, owner, datamart, updated range), a validation indicator per row in the readiness style, Open plus a row menu (Monitor, Execution report, Copy, Pause / Resume). The menu entry always lands on the list; the canvas has *‹ Journey list*; the dropdown stays as a quick switcher; the list modal and its *List* button are gone. Program sits under the name and the owner under the update date, as on the campaign list, so the table fits 1280 px with the menu open. Pause / Resume is for approvers and admins (maker/checker), shown disabled with the reason for marketers. Customers inside, entered and converted come from the simulation, not a period. | Campaign and journey are equal top-level entities, and a journey estate has to be searchable — a dropdown does not scale to fifty journeys, and the two modules should feel like one product. | Settled |
| J2 | **Journey creation uses the same centred creation screen as campaigns** (C9): name, description, three trigger cards (event · segment entry · schedule) each revealing one follow-up field, *Start building*, a template strip. Start building creates a Draft with the entry step placed and opens its canvas. *Segment entry* becomes an entry mode of its own; a schedule is stored on the entry step. | One way to start an object across the product; the modal asked for re-entry, goal and policy fields before anything existed. Those stay on the canvas's entry step and journey panel. | Settled |
| O12 | **Operation analysis shows journey deliveries next to campaign ones.** The first column is the Source (Campaign / Journey chip + name), the scope bar has a Source filter, the picker lists both, journey rows link to the journey. Journey executions are one per Delivery step per day the journey has run, sized from its entry audience. O7's "90 days agree with the dashboard" now holds for Source = Campaigns; the dashboard does not count journey sends. | "How many messages went out yesterday" must have one answer. | Settled |

## Goal instead of type and category (24 Sept 2026, v54)

Source: owner review on 24 Sept 2026 — "we already take the campaign's purpose on the creation screen; the first four are Offer, the last is Info — no need to ask Category, Campaign Type and Sub Category again".

| # | Decision | Why | Status |
|---|---|---|---|
| C13 | **The goal is asked once and carries type, category and sub-category.** `CAMP_GOAL`: Acquisition → Offer · Onboarding › Welcome; Upsell / Cross-sell → Offer · Upsell › Data add-on; Retention → Offer · Retention › Package renewal; Winback → Offer · Win-back › Discount; Informational → Info. The Info step shows a **Goal** chip row (`#camp-goal`, `data-goal`) in place of the Campaign Type, Category and Sub Category selects; clicking another goal re-derives them, and a campaign opened with *Skip* picks its goal there. Existing campaigns show the goal derived from their type and category (`campGoal`). The fields stay in the data, so the list filters, reports and the dashboard are unchanged; Summary shows Goal instead of Category. Supersedes C11 for the objective cards. | Asking the same thing twice in two vocabularies made the marketer wonder which one counts. The goal is the marketer's word; type and category are the system's. | Settled |

