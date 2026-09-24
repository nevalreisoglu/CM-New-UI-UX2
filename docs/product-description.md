# ECM Journey Studio — product description

What the redesigned Etiya Campaign Management (ECM) front end is, who uses it,
and why each screen is shaped the way it is. This describes the **prototype** in
`index.html`; anything not yet built is called out as such.

---

## 1. The problem the redesign set out to fix

ECM had grown one field at a time. The result:

- **One flat form per object.** A campaign was a single long page with every
  field on it, whether or not the campaign used it. Budget and Campaign Status
  had been dead for years and were still there.
- **No sense of progress.** Nothing told a marketer what was still missing, so
  campaigns were saved half-finished and discovered later by the approver.
- **Everyone saw everything.** A CMO opening ECM landed in the same screen as an
  administrator configuring channels.
- **Segments were a query tool, not an audience tool.** You wrote filters and
  got a row count, with no feel for who was in the segment.
- **Template and content were the same object**, so changing wording meant
  touching a design, and designs multiplied.

The redesign keeps the ECM data model and reorganises the surface: who sees
what, in what order, with what feedback.

---

## 2. Who uses it

| Role | What they do | What they see |
| --- | --- | --- |
| **Marketer** | Builds campaigns, journeys, segments, surveys and content. | Dashboard, Program, Campaign, Journey Builder, Segments, Surveys, Reports, Operation analysis, Journey Monitor. |
| **Approver** (checker) | Reviews and activates what marketers submit. | The same plan/operate pages (Operation analysis included), plus the approval actions. No audience, survey or content authoring. |
| **Admin** | Configures the platform: channels, senders, rule defaults, form fields, templates, licences. | Everything, including Datamart, Parameters and Release & licences. |
| **CMO / Executive** | Watches outcomes. | Dashboard, Program and Reports only. Never the build pages. |

The role is a picker in the top bar (in the product it comes from the signed-in
user). Changing it hides menu entries and, if the open page is no longer
allowed, moves to the first page that is. Maker/checker is a real separation:
the person who builds is not the person who activates.

---

## 3. The object model

- **Program** — a business initiative with a goal, a period, an owner and a
  contact cap. Campaigns and journeys are its *members*; results roll up.
  A program is the answer to "what are we trying to achieve this quarter".
- **Campaign** — one offer or message to one audience over one period, through
  push channels (we send) or pull channels (shown when the customer comes).
- **Journey** — a flow of steps a customer moves through over time, with its own
  delivery steps, timers, conditions and goals.
- **Segment** — a saved audience definition, built from filters over a datamart,
  a file, or SQL. Channel-scoped exclusion lists sit beside it.
- **Offer / NBO** — what is being given. A campaign either names offers or hands
  the decision to Next Best Offer.
- **Template** (design) and **content** (text) — deliberately separate, see §5.

---

## 4. The campaign in eight steps

`Info · Targeting · Offer · Channel & content · Communication rules · Schedule ·
Approval · Summary`

Two rules shape the whole flow:

**A new campaign starts on a creation screen, not in the editor.** **+ New
campaign** opens *Create your campaign*: one centred column with the name, a
row of objective cards (Acquisition, Upsell / Cross-sell, Retention, Winback,
Informational) and the push-or-pull choice as two cards (*We send it* / *The
customer sees it when they come*). **Start building** creates the draft and
opens the editor on Info with the stepper. The choices only pre-fill: Upsell,
Retention and Winback set the category, Informational makes it an Info
campaign, Acquisition leaves the category to Info; push starts on SMS, pull on
In-App, and the exact channels are picked in Info. Underneath, *Start from a
template* offers a copy of one of the three most recent campaigns, and *Skip —
go straight to the form* opens an empty editor for people who know what they
want. Each step of the editor then opens with a heading in the marketer's voice
(*Tell us about your campaign*, *Who will you reach?* … *Ready to launch*); the
stepper labels stay short.

**Steps are not a wizard you must finish in order.** You can jump to any step.
The **readiness panel** on the right lists the seven things that make a campaign
complete, ticks what is done, and links to whatever is not. It never blocks
saving. Parts of a campaign are done by different people on different days, and
the UI now says so out loud: *"nothing here blocks saving"*.

**Steps that do not apply are visibly inert, not missing.** An Info campaign has
no offer, so the Offer step stays in the stepper, greyed and marked `–`, and the
readiness panel shows it as *"Offer (Info campaign — skipped)"*. A step that
vanishes makes people wonder what they lost.

Step by step:

1. **Info** — name, type (Offer / Info), category, period, control group,
   program, and **channels**. Channels are grouped into **push** (SMS, MMS,
   e-mail, mobile/web push, telemarketing — we send) and **pull** (in-app card,
   self-care banner, chatbot — shown when the customer comes). A campaign uses
   one kind or the other, never both; a follow-up on the other kind is a second
   campaign or a journey step. Priority applies to pull and telemarketing only,
   because only there do campaigns compete for a slot.
   Objective, Description and Campaign Brand are **configurable fields** — an
   admin turns them on per customer in Parameters, so single-brand operators
   never see a brand picker.
2. **Targeting** — two columns: available segments on the left, the target on
   the right, with a live count. Exclusions are channel-scoped.
3. **Offer / NBO** — name offers, or hand the choice to Next Best Offer.
   Optional promo code. Skipped for Info campaigns.
4. **Channel & content** — one content block per channel, written into the
   slots of a chosen template, with a live render (phone frame for SMS/push,
   mail frame for e-mail). A/B and dynamic content are two independent
   switches. Content can be copied from another campaign.
5. **Communication rules** — contact policies, frequency caps, quiet hours.
6. **Schedule** — when it runs. The pre-sent period lives in Parameters now, not
   here.
7. **Approval** — its own step, with a timeline of who did what. The approver
   activates; the marketer cannot.
8. **Summary** — everything on one page for the final read.

---

## 5. Template is design, content is text

The decision that removed the most duplication.

- A **template** is a design: a layout with named slots, per channel. Templates
  are **administration**, not campaign work, so they live under Administration
  and only an admin edits them.
- **Content** is what goes in the slots, and it is written **inside a delivery**
  — in the campaign step or the journey step that sends it, with the render
  updating as you type.

So changing wording never touches a design, and one design serves many
campaigns. Content can be copied from another campaign when a message is nearly
the same.

---

## 6. Segments as a workbench

The segment editor is two columns:

- **Left — definition.** Name, description, group, source (datamart query,
  uploaded file, or SQL), and the query builder: column · operator · value,
  combined with AND or OR.
- **Right — audience.** Live insight that updates as filters change: headline
  counts, distribution charts, reachability by channel. Result rows are pulled
  on demand with **Search**, not on every keystroke.

The **natural-language assistant** ("prepaid customers in Kyiv whose package
expires in 2 days") sits in a dialog, not in the form. It proposes filters into
the query builder; you see and edit every one. It is a starting point, never a
black box — a long list such as regions becomes a single `in` filter you can
read.

---

## 7. Journeys

The **Journey Builder** is a canvas of typed steps — entry, delivery, timer,
wait, condition, offer, NBO, parallel, external call, exit — colour-coded by
type, connected by edges you draw from a step's out port. Delivery steps are
owned by the journey, with their content written in the step.

The **Journey Monitor** shows per-customer state: participants, who is active,
deliveries, goal reached, events rejected by re-entry or concurrency rules, a
funnel by step, and a point-in-time participant list.

Both carry a **simulation strip** (see §9).

---

## 8. Dashboard, Program and Reports

- **Dashboard** — the page the prototype opens on. Presets per role, and
  panels can be hidden and re-added from a fixed set; there is no panel builder.
  - **Headline strip — business outcome only.** The Executive preset shows five
    tiles, and every one carries its denominator or comparison on the second
    line, never a bare percentage: **Campaigns** run in the period (active ·
    ended); **Converted customers** — the unit in the label, "2.3 % of
    delivered · 2.4M delivered" underneath, a tooltip saying what counts as a
    conversion; **Revenue** with the average per conversion; **ROI** with net
    and spend; and **Extra conversions from campaigns** — a two-segment bar,
    baseline grey and incremental turquoise, that sums to the converted total,
    with "n would have converted anyway · n thanks to campaigns", the share of
    all conversions, and a tooltip that walks through the control-group
    arithmetic. Each tile has a sparkline of the period's daily series and a
    delta against the previous period; a zero change says "no change" with no
    arrow. Revenue and ROI are marked *BSS feed, demo*: in the prototype they
    are derived from the conversions (₴ 720 ARPU uplift per conversion, ₴ 1.10
    per message sent; ROI = net ÷ spend).
  - **Operator scale.** Aggregate figures on the dashboard and on Reports are
    multiplied once (`DEMO_SCALE`) so the CMO view reads as it would in
    production — millions delivered, tens of thousands converted — and a pill
    says *Demo figures at operator scale*. The row-level screens (campaign
    list, targeting, journeys, Operation analysis) keep the 30-customer demo
    set, because they are about individual records. The **Marketer preset** shows
    the state of the marketer's work instead: **Needs your action** (drafts,
    rejected, without content, ending within 7 days), **Waiting for approval**
    (with the oldest wait), **Going out this week** (scheduled sends, the next
    one named), **Live**, and **Top campaign** (the best conversion rate, with
    how many campaigns sit below average). Every tile opens what it counts. The
    Ops preset shows Customers reached, Conversions, Conversion rate, Waiting on
    you and Live. No preset puts Delivered, Opened or Clicked totals in the
    strip: summed across campaigns they are noise — per campaign they are in
    Campaign performance, which is the marketer's first panel.
  - **Campaign performance** — every campaign in the period with Status,
    Targeted, Delivered, Opened, Clicked (rates of delivered), Conversions,
    Conversion rate and Revenue, sortable by any column. Clicking a campaign
    opens its detail in the same panel: its funnel from Targeted to Converted,
    what the communication rules removed, its split by channel, and its
    control-group uplift when it has a control group. × returns to the table;
    **Open campaign ›** goes to the editor.
  - **Live now** — six counters, each with a status colour on a left bar, a dot
    and an icon, and a word saying what the colour means: running and live
    (turquoise), delivered today (green), next scheduled send (grey), waiting for
    approval (amber above zero), failed deliveries (red above zero, green
    "none" at zero). The numbers stay dark. Click a counter to open what it
    counts.
  - **Needs attention**, delivered and conversions per day, funnel and
    eliminations, by channel, by category, top journeys and control-group uplift
    (Executive).
- **Program** — list, overview, a Gantt timeline of members, a members picker,
  and settings: goal, contact cap, summary report.
- **Reports** — campaign and journey results, with CSV export (disabled in the
  prototype).

---

## 8b. Onboarding: Getting started and guided tours

ECM is a product people are dropped into, usually with a deadline. The
onboarding layer answers two questions — *what should I do first?* and *what is
this control?* — without turning either into an obstacle.

**The design principle: first-run guidance is shown once, can be restarted, and
never blocks.** A welcome card appears once per role. Everything else is opt-in
from the **?** button or the Getting started page. No tour prevents using the
page underneath it: the spotlight leaves the target fully live, and Skip and
Escape are on every step.

**Getting started** is a checklist per role — the marketer's runs from the
dashboard through a first campaign; the approver's is about the queue; the
admin's is the five Parameters screens; the executive's is reading results.
Items tick themselves off **from real application state wherever that can be
observed** — a segment that was actually saved, a campaign that actually reached
*Pending approval* — rather than from having sat through a tour. Watching a tour
is not the same as having done the thing, and the checklist should not pretend
otherwise. Journey and Program are listed but not yet built.

**Guided tours** dim the page, cut a hole around one element and put a short
explanation beside it, with a step counter and a progress bar. Two things make
them more than a slideshow:

- They are **interactive**. A step that asks you to name the campaign waits
  until you have typed a name; a step that asks you to pick a channel waits
  until a channel is picked. The tour follows the user, not a script. On those
  steps the primary button is **Do it for me** and performs the step, so the
  same tour runs as a hands-off demo end to end. A secondary **Show me where**
  flashes the control instead. The primary button is never a no-op: a button
  whose only effect is a subtle highlight reads as broken.
- They follow the **real editor**. The campaign tour moves through the actual
  eight steps and honours their rules — on an Info campaign the Offer step is
  skipped, exactly as the editor skips it.

Five tours ship: *Create your first campaign* (the important one — seventeen
steps ending with a real campaign submitted for approval), *Create a segment*,
*Review and approve a campaign*, *Read the dashboard*, and *Admin setup*.

Progress is remembered per role, so a tour abandoned halfway offers to resume.
A tour is written for one role; changing role stops it rather than walking
someone through screens they cannot see.

---

## 8c. Datamart (Administration)

**The principle: a datamart is a documented, profiled, access-controlled data
product, and segments consume it.** Not a list of tables with settings on them.

The screen that existed before answered "what columns are there". The questions
people actually arrived with were different: *what data do we even have? is it
current? what does this column mean? can I join it to something? if I change it,
what breaks?* The module is built around those five.

**What data exists.** A list of every datamart with its type — Customer (one row
per subscriber), Event (one row per thing that happened), Lookup (reference data
joined for its attributes) — its key column, its size, and what uses it, written
as "3 segments · 2 campaigns · 1 journey" rather than a number with no referent.

**Is it current.** Every datamart carries a health state derived from its last
load: fresh, stale, or failed. A stale datamart quietly makes every segment built
on it wrong, so the state is on the list row, on the detail header, and — for the
admin — in the dashboard's "Needs attention" queue.

**What a column means.** The Columns tab is the heart of it. Each attribute has a
readable label in EN and TR, a description, an attribute group, roles (key,
reference, output), privacy and masking, and a **profile computed from the actual
rows**: fill rate, distinct count, top values, min/max/mean. Nothing is
hard-coded; the profile is what the data says. A column with few distinct values
is offered as a **category**, which is what turns a free-text filter in Segments
into a value list with an `in` operator.

**Can I join it.** Relationships are declared here, validated so both sides have
the same type, and they are the *only* way a segment may join a second datamart.
Before, the join was hard-wired; now the segment builder reads the relationship
and shows the real columns.

**What breaks if I change it.** Usage is computed, never stored: which segments
filter on a column, which campaigns and journeys reach it through those segments,
and whether the column is a personalisation placeholder in content. Deleting a
datamart that something depends on is disabled with the reason. Changing a
column's type or key role while segments filter on it asks first and lists them.

Privacy is a first-class column property rather than a policy document. Personal
columns declare a masking rule, and the Data tab shows the values as a marketer
would see them at the flip of a toggle — the admin sees them unmasked, and the
screen says which of the two it is showing.

Loading is deliberately a **concept** in the prototype and labelled as one: the
source, the schedule, a simulated run and a load history with schema-change
notes. The guard rails it states for query-based sources — read-only view, a
100k-row preview cap and a 30 s statement timeout — are the ones the SQL
discussion in meeting 2 asked for.

---

## 8d. Operation analysis (Operate)

**The principle: one row-level screen with context above the grid, instead of
five raw grids.** The current product has five report screens — Delivery
Result, Elimination Result, Promotion Result, Active Promotions and Survey
Result — each a grid with a permanent NOT/AND/OR strip and nothing else: no
period, no campaign filter, no totals, no way back to the campaign, and the
technical ids first. Customers use them often, so the grid keeps its power; the
redesign adds what it lacked.

- **One scope bar** — period (last 7, 30 or 90 days), a searchable campaign
  picker, channel and campaign status, with Reset — filters every tab and stays
  put when you switch tabs.
- **Four tabs.** *Deliveries* is one row per execution: campaign, status,
  channel, delivery type, execution date, targeted, delivered, eliminated,
  control group, delivery status. *Eliminations* shows who was removed and by
  which rule, with a breakdown by rule above the grid that uses the same reasons
  and shares as the dashboard funnel — the two screens agree, and a bar filters
  the grid. *Promotions* lists every promotion code with its promo code,
  recipient, result, sent date, validity and status; **Active only** replaces
  the separate Active Promotions screen. *Surveys* is the results view of §8e.
- **A summary strip per tab** — targeted, delivered, eliminated, control group
  and failed (red above zero); eliminated, the most-triggered rule, campaigns
  affected and share of targeted; codes issued, sent, redeemed, redemption rate
  and codes expiring within 7 days.
- **The grid** — column chooser (show, hide, reorder), sort on any header,
  resizable columns, a sticky header, 50-row pages. Technical ids are hidden
  until *Show technical IDs* or the chooser asks for them. The NOT/AND/OR
  builder opens from **Advanced filter** and each condition becomes a chip.
  **Export CSV** writes the filtered rows and visible columns; Excel is a
  concept. **Saved views** keep the scope, tab, columns and filters (in memory
  in the prototype; per user in the product).
- **A side panel** per row with every field, ids included, and **Open
  campaign ›**, **Open delivery** (the campaign's Channel & content step) and
  **Open customer** (a concept link).
- **Privacy.** Recipient e-mail and phone are masked in the grid, the panel and
  the export; an admin can reveal them with a switch.
- **Entry from a campaign.** **Results** on the campaign list and in the editor
  header opens Operation analysis on Deliveries, filtered to that campaign.
- **Reports vs Operation analysis.** Each page says it in one line: Reports is
  the aggregated, chart-led view; Operation analysis is the row-level,
  operational one.

The rows are a dated 90-day history built from each campaign's 90-day
dashboard totals, so the 90-day view agrees with the dashboard; shorter periods
are slices of that history.

---

## 8e. Surveys (Audience & content)

**The principle: a narrow, native feedback capability, not a survey research
platform.** Surveys ran through LimeSurvey; answers stayed in another tool.
Natively, responses land in the Event DataMart and become segmentable — the
detractors of last month are an audience like any other.

- **A survey is content, not a campaign type.** There is no survey campaign
  flow. In a campaign's *Channel & content* step every channel card (except
  telemarketing) has **Attach survey**; the journey Delivery step has the same
  control. SMS, e-mail and push get a personal `{{SURVEY_LINK}}` placeholder;
  In-App, Web Self Care and Chatbot render the questions inside the card.
- **The list** shows status (Draft / Active / Closed), question count,
  channels, responses, last response and the campaigns that use each survey.
- **The editor** is a workbench like Segments: definition on the left (name,
  description, status, validity, thank-you message, languages, scoring),
  questions in the middle, the survey as the customer sees it on the right — in
  the phone frame, or as a Web Self Care card, in each language.
- **Six question types**: NPS (0–10), CSAT (1–5), Rating (stars), Single choice,
  Multiple choice, Free text. Each has its text, a required switch, options
  where the type needs them (with a score when scoring is on), and **one
  branching rule**: *if the answer is X, skip to question N or to the end*.
  Reorder with ↑ ↓, remove with ×. **At most ten questions** — the screen says
  why: completion drops with every question and most customers answer on a
  phone.
- **Deliberately out of scope**: pages or sections, drag-and-drop, a logic
  canvas, quotas, panels.
- **Results** are the Surveys tab of Operation analysis: a survey picker;
  responses, response rate (of the deliveries that carried the survey), average
  score, completion rate and NPS; an NPS panel with promoters, passives and
  detractors as a stacked bar and the trend over the period; one chart per
  question, with the latest free-text answers under masked customer ids; and
  the response grid, whose side panel shows the full answer set, including the
  questions a branching rule skipped.

---

## 9. What is prototype scaffolding, not product

The prototype has **no back end, no clock and no sends**. Nothing leaves the
browser. Two things exist only to make it demonstrable, and since v41 they are
fenced off visually — a dashed purple strip with a `⚗ Simulation · demo only`
badge, in both the Journey Builder and the Journey Monitor:

- **Advance 1 day / Advance 5 days / Reset** — move a simulated clock so you can
  watch customers progress. In the product the monitor updates on its own.
- **Send event** — inject a business event for a chosen customer.

Buttons inside the strip are deliberately not styled as primary actions. The
prototype runs three simulated days at load so the monitor is not empty.

Also demo-only: 30 customers, 18 campaigns (one waiting for approval, one
sent back by the approver), 3 journeys of fixed sample data;
test sends raise a toast instead of doing anything. Operation analysis exports
a real CSV of its demo rows; Excel export and Open customer are concepts. The data names
no real person: users come from one fictional list (the signed-in user is Ayşe
Demir in every role view), and sample customers have masked ids
(`CUS-****7919`), `+90 5XX XXX nn nn` numbers and `@example.com` addresses.

---

## 10. Visual language

One theme, Etiya commercial palette: navy primary, dark-orange accent, two
greys. The menu and the bars are a light lilac wash with dark text, not a solid
dark block, so the content leads and the brand stays present. Bordered cards with tinted section headers, an 8-point spacing grid,
36px inputs, tabular numerals for anything countable. Orange is reserved for
the primary action and the current step — it is never decoration.

Every field that needs explaining carries a tooltip. Row actions are labelled
buttons, not bare icons; the only icon-only control is the menu burger, and
collapsing the menu moves each label into a tooltip.

---

## 11. Known gaps in the prototype

- **Offers and Policies are hidden from every role** (not removed): their pages
  are still in `index.html`, but no menu entry leads to them. Campaigns still
  pick offers in the Offer step.
- Reports is a layout with sample numbers, not a reporting engine.
- Operation analysis and survey results read generated demo rows; saved views
  and new surveys last until the page reloads, and a newly attached survey
  has no responses.
- Nothing is persisted: a reload starts over. A guided tour resumed after a
  reload therefore always picks up from *New campaign* — the draft it was
  building no longer exists.
