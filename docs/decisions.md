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
| V2 | **Header and footer use Primary Light** `#5D5D8D`; the left menu is Primary Dark with a lilac active row and an orange left bar. | Decided with the kit; the white header read as unfinished. | Settled |
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
| D7 | **Revenue and ROI are demo figures, labelled as such.** Revenue = conversions × ₴186; ROI = incremental revenue ÷ sending cost (₴0.06 per message sent); the ROI tile's second line is the net contribution. Both tiles carry *BSS feed, demo*. | The prototype has no billing feed. A stated formula keeps the numbers honest and consistent with the incremental figure, and the note stops them being read as live. | Settled |
| D8 | The **Marketer and Ops strips** are Customers reached · Conversions · Conversion rate · Waiting on you · Live. Delivered goes too, not only Opened and Clicked. | D1/D2 apply to every preset: a summed Delivered is the same noise as a summed Opened. Five tiles, like the Executive strip. | Settled |
| D9 | **Top campaigns becomes Campaign performance**, full width: every campaign in the period, sortable, Opened and Clicked shown as rates of delivered. A row opens the campaign's funnel, eliminations, channel split and uplift **in the same panel**; × returns to the table. | D2 moves the operational metrics here, so the table must hold them all. Opening in place keeps the reader on the dashboard; the editor is one click away. By category and Top journeys become half-width so the grid has no holes. | Settled |
| D10 | **Live now: colour only when there is something to say.** Approval is amber only above zero; failed deliveries are red above zero and green "none" at zero. Every colour comes with a word; numbers stay dark. | D4, without turning a zero into an alarm. Colour alone fails colour-blind readers. | Settled |
| C11 | **Creation-screen choices only pre-fill.** Upsell / Cross-sell → category Upsell; Retention → Retention; Winback → Win-back; Informational → type Info; Acquisition has no matching category and leaves it to Info. Push starts on SMS, pull on In-App. The name is required before Start building. | C9 asks for a focused first step, not a second form: everything stays editable in Info, and the editor, the steps and the readiness rules are untouched. `campOpen(null)` (the skip link) still opens the form directly. | Settled |
| C12 | **One heading per step** above the step's content (*Tell us about your campaign* … *Ready to launch*); `CAMP_STEPS` and the stepper labels are unchanged. Empty states say what to do next; field and button labels are not reworded. | C10, while keeping navigation short and field labels precise. | Settled |
| X5 | **Demo data names no real person.** Users come from one `DEMO_USERS` constant of fictional names; the signed-in user is Ayşe Demir in every role view. Sample customers have masked ids (`CUS-****nnnn`), `+90 5XX XXX nn nn` numbers and `@example.com` addresses, mapped consistently across datamarts so joins still work. The role picker reads just Marketer / Approver / Admin / CMO / Executive. `tests/specs/demo-data.spec.js` guards it. | The prototype is shown to customers. | Settled |
