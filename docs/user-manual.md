# ECM Journey Studio — user manual

How to drive the prototype, screen by screen. It is a click-through model of the
redesigned Etiya Campaign Management front end: **nothing is sent and nothing is
saved between reloads.**

> Open `index.html` in a browser. No build, no server, no sign-in.

---

## Getting around

**The top bar** carries the menu burger, the product name, **User manual**,
the **?** help button, the **Role view** picker and your name. The menu and the
top and bottom bars are a light lilac wash, so the page content leads.

**The left menu** is grouped: Home · Plan & build · Audience & content · Operate
· Administration. The burger collapses it to an icon rail; the labels move into
tooltips, so nothing becomes unidentifiable.

**The breadcrumb** under the top bar reads *group › page › what you have open*.

**Role view** decides what you see. Switch it to check a screen as someone else:

| Role | Sees |
| --- | --- |
| Marketer | Dashboard, Getting started, Program, Campaign, Journey Builder, Segments, Surveys, Reports, Operation analysis, Journey Monitor |
| Approver | Dashboard, Getting started, Program, Campaign, Journey Builder, Reports, Operation analysis, Journey Monitor — no Segments or Surveys — plus the approve / activate and pause / resume actions |
| Admin | Everything the marketer sees, plus Decision API, Datamart, Templates (design), Parameters and Release & licences |
| CMO / Executive | Dashboard, Getting started, Program, Reports, Journey Monitor |

*Offers* and *Policies* are hidden from every role for now; campaigns still
pick offers in their Offer step.

If you switch to a role that may not see the open page, you are moved to the
first page it can.

**Tooltips.** A small **i** beside a label explains the field. Hover it.

**? (help).** Top right: guided tours, Getting started, this manual, and the
first-visit tips switch. See **Getting started and guided tours** below.

**User manual.** The button at the top right opens this manual. It is embedded
in the prototype, so it works offline and travels with the file — close it with
**Close**, **Esc**, or a click outside.

---

## Getting started and guided tours

The first time you open the prototype in a role, a card offers a short guided
tour. Take it or dismiss it — everything it covers is also on the **Getting
started** page, at your own pace.

### The ? button

Top right, beside the role picker. It opens:

- **Guided tours** — every tour for your role with its status (not started, part
  way through, or done ✓). Click one to start it, or to pick it up where you
  stopped.
- **Getting started** — the checklist page.
- **User manual** — this document.
- **Show tips on first visit** — turn the welcome card off for good.

### Getting started

Under **Home** in the left menu. A checklist for your role with a progress bar:
what to do, in what order, with **Show me** to run the matching tour and **Go to
page** to just go there.

Items tick themselves off when you do the real thing, not when you watch the
tour. Saving a segment ticks "Create a segment"; submitting a campaign ticks
"Submit a campaign for approval". Journey and Program items are marked *coming
soon* — those tours are not built yet.

### What a tour looks like

The page dims, one control stays lit with an orange outline, and a dark card
beside it explains that control. The card shows which step you are on, a
progress bar, **Back**, **Skip tour**, and the main button.

The tours are **interactive**: on a step that asks you to do something, the tour
moves on by itself **once you actually do it**. Type the name and it advances;
pick a channel and it advances. You do not press Next on those steps.

On those steps the main button reads **Do it for me** and performs the step for
you with sample data, so you can watch rather than type. Using only *Do it for
me* and *Next*, the campaign tour runs end to end and leaves a real campaign
waiting for approval.

Next to the hint there is also **Show me where**, which flashes a ring around
the control the step is talking about — useful when the highlight is somewhere
you are not looking.

The lit control stays fully usable — you can click it and type in it; the rest
of the page is simply out of the way.

**Keyboard:** `→` or `Enter` for Next when it is allowed, `←` for Back, `Esc` to
leave the tour (it asks first).

### The tours

| Tour | Role | What it covers |
| --- | --- | --- |
| Create your first campaign | Marketer | Seventeen steps: name, goal, type, channels, targeting, offer, content, rules, schedule, and submitting for approval. Ends with a real campaign in the approver's queue. |
| Create a segment | Marketer | The workbench: name, group, DataMart, filters, the live audience insight, exclusion lists, save. |
| Review and approve a campaign | Approver | From "Needs attention" to the approval step and the decision. |
| Read the dashboard | Everyone | Period, headline KPIs, Live now, Needs attention, funnel and eliminations, control-group uplift. |
| Admin setup | Admin | The five Parameters screens. |

### Turning it off

- **Show tips on first visit** in the **?** menu stops the welcome card.
- **Don't show again** on the welcome card does the same.
- Adding **`?notour`** to the URL suppresses the welcome card and the resume
  prompt for that visit — useful when demoing or taking screenshots.

A tour is written for one role. If you change the role picker while a tour is
running, it stops and says so; restart it from **? › Guided tours**.

Because the prototype keeps nothing across a reload, a tour resumed after
refreshing the page starts again from **New campaign** — the draft it was
building is gone.

---

## Dashboard

The page the prototype opens on. Pick the **period** first (last 7, 30 or 90
days); every number and every "vs prev." delta reads through it.

**The headline strip** shows business outcomes only. As an executive you see
five tiles:

| Tile | Big number | Line under it |
| --- | --- | --- |
| Campaigns | campaigns that ran in the period | how many are active and how many ended |
| Converted customers | customers who took the action the campaign asked for | "2.3% of delivered · 2.4M delivered" — the share and what it is a share of |
| Revenue | revenue, in ₴ | the average per conversion and the conversion count |
| ROI | e.g. `4.1x` | net and spend |
| Extra conversions from campaigns | conversions the control group says would not have happened | a bar split into "would have converted anyway" (grey) and "thanks to campaigns" (turquoise) — together they are the converted total — then the share of all conversions |

Hover the **i** on Converted customers and Extra conversions for what is
counted and the control-group arithmetic. Each tile has a small sparkline of
the period, day by day, and the change against the previous period; when
nothing changed it says *no change*, with no arrow. Revenue and ROI say **BSS
feed, demo**: in the prototype they are calculated from the conversions, not
read from billing.

**Demo figures at operator scale** (the pill next to *as of*): the totals on
the dashboard and on Reports are multiplied to a telecom operator's scale so
the screen reads as it would in production. The lists, targeting counts,
journeys and Operation analysis show the small 30-customer demo set as it is —
so a campaign that reaches 12 customers in Targeting shows tens of thousands
delivered here. That is the scale, not a bug.

As a **marketer** the strip is about your work, not totals:

| Tile | Big number | Line under it |
| --- | --- | --- |
| Needs your action | campaigns waiting on you | how many are drafts, rejected, without content, or ending within 7 days |
| Waiting for approval | campaigns in the approver's queue | how long the oldest has waited |
| Going out this week | scheduled sends in the next 7 days | the next one, by name and time |
| Live | active campaigns and journeys | how many end within 7 days |
| Top campaign | the campaign with the best conversion rate | how many campaigns are below average |

Click any tile to open the list behind it; **Top campaign** opens that
campaign's detail in Campaign performance.

The **admin** strip (the Ops preset) shows Customers reached, Conversions,
Conversion rate, **Waiting on you** and **Live**. **Approvers** and **CMO /
Executive** get the executive strip above.

Delivered, opened and clicked are not in the strip — summed over every campaign
they say nothing. They are per campaign, in **Campaign performance**, which for
a marketer is the first panel under the strip.

**Campaign performance** lists every campaign in the period: status, targeted,
delivered, opened, clicked, conversions, conversion rate and revenue. Click a
column header to sort. **Click a campaign** to see its detail in the same
panel — its funnel, what the communication rules removed, its channels, and its
control-group uplift if it has a control group. **×** takes you back to the
table; **Open campaign ›** opens it in the editor.

**Live now** shows what is running this minute. Each counter has a coloured
bar, dot and icon, and a word saying what the colour means: *running* and
*live* (turquoise), *delivered* (green), *scheduled* (grey), *pending* (amber —
campaigns waiting for approval), *failed* (red) or *none* (green, when nothing
failed). Click a counter to open what it counts.

Also on the page: **Needs attention** (click a row to open it), deliveries and
conversions per day, funnel and eliminations, by channel, by category, top
journeys and, for executives, control-group uplift.

Hide a panel with the × in its header; hidden panels reappear as buttons at
the bottom. The preset follows the role: Marketer for marketers, Ops for
admins, Executive for approvers and executives.

---

## Program

A program is the business initiative campaigns and journeys belong to.

1. **Program** in the menu → the list.
2. **+ New program**, or click a row.
3. **Overview** — goal progress, period, owner, rolled-up results of the members.
4. **Timeline** — a Gantt of the members over the program period, with today
   marked.
5. **Members** — **Add members** opens a picker of campaigns and journeys; tick
   and add.
6. **Settings** — goal, contact cap (how often this program may touch one
   customer), and the summary report.

---

## Building a campaign

**Campaign** in the menu opens the **Campaign List**: a search box, **Type**
chips (All · Offer · Info), **Status** chips (All · Active · Draft · Pending
approval · Expired) and **Advanced filters** for category, campaign brand (when
the admin has turned it on), datamart, delivery status, created by and the
start and end dates. Each row shows the campaign's readiness as a small bar.

Row actions: **Open** (or **Continue** on a draft), **Copy** — clones the
settings into a new draft — and **Results** for a campaign that has run, which
opens Operation analysis filtered to it. **+ New campaign** starts a new one.

### Create your campaign

**+ New campaign** opens a short creation screen before the editor:

1. **Campaign name** — the cursor is already there. Required.
2. **What is it for?** — pick one objective card: Acquisition, Upsell /
   Cross-sell, Retention, Winback or Informational. Optional; it files the
   campaign under the matching category, and Informational makes it an Info
   campaign.
3. **How will it reach people?** — **We send it** (push: SMS, e-mail, push,
   telemarketing) or **The customer sees it when they come** (pull: in-app,
   self-care, chatbot). You pick the exact channels in the Info step.
4. **Start building** — creates the draft and opens the editor on **Info**,
   with the steps across the top.

Below that, **Start from a template** opens a copy of one of your three most
recent campaigns, and **Skip — go straight to the form** opens an empty editor.
Everything chosen here can be changed in Info.

In the editor, **‹ Campaign list** goes back, and **Results** (once the
campaign has run) opens Operation analysis on its deliveries.

### The eight steps

`Info · Targeting · Offer · Channel & content · Communication rules · Schedule ·
Approval · Summary`

**You do not have to go in order.** Click any step in the stepper. The
**readiness panel** on the right lists the seven parts of a complete campaign,
ticks what is done, and jumps to any item you click. It never stops you saving —
parts get done by different people on different days.

A step that does not apply stays visible but greyed: an Info campaign shows the
**Offer** step marked `–`, because it has nothing to offer.

Each step opens with a heading that says what it is for — *Tell us about your
campaign*, *Who will you reach?*, *What will you offer?*, *How will you reach
them?*, *Set the ground rules*, *When will it go out?*, *Send it for approval*,
*Ready to launch*.

#### 1 · Info

Name (required — Next will refuse without it), Campaign Type (Offer or Info),
category and sub-category, start and end, control group, and program.

**Channels** are in two groups:

- **Push — we send to the customer.** SMS, MMS, e-mail, mobile/web push,
  telemarketing. One schedule for all of them.
- **Pull — shown when the customer comes.** In-app card, self-care banner,
  chatbot. Nothing is sent; **Priority** decides which campaign wins the slot.

A campaign uses one group or the other. Click a channel chip to toggle it.

*Objective*, *Description* and *Campaign Brand* appear only if an admin has
turned them on in Parameters.

#### 2 · Targeting

Available segments on the left, your target on the right. Search by name, ID or
group, or pick a group, then **Include** or **Exclude** a segment. The audience
count updates as you go. Exclusion lists are channel-scoped — excluding by SMS
does not exclude by e-mail.

**+ New segment…** here takes you to Segments; save it and come back, and it is
in the list.

#### 3 · Offer / NBO

Name the offers, or set the strategy to **NBO** and let Next Best Offer decide.
Optionally attach a promo code. Skipped for Info campaigns.

#### 4 · Channel & content

One card per channel you picked. For each:

1. Choose a **template** (the design, with named slots).
2. Fill the **slots** — subject, headline, body, CTA. The preview beside them
   renders as you type: a phone for SMS and push, a mail frame for e-mail.
3. The placeholder chips (`{{FIRST_NAME}}` and the like) insert a
   personalisation token where you last typed; in the preview they resolve to
   a sample customer.
4. **Copy content from campaign…** pulls wording from another campaign.
5. **Attach survey** adds a survey to the message (not on telemarketing) — see
   *Surveys* below.
6. **Send test** sends the content to the test users (a toast in the
   prototype).

Under **Variants**, **A/B test** and **Dynamic by column** are independent
switches — you can use either, both, or neither. A/B adds a second set of
slots and the share each variant gets.

#### 5 · Communication rules

The rules come from Parameters and apply to every campaign: control group,
channel cooldown, campaign-type overlap and the pre-sent period. Tick
**Override elimination rules for this campaign** to change them here. Per rule,
**Use it** removes the customer from this campaign's sends, and **Log it**
records the send so later campaigns respect it. Consent and global exclusion
lists always apply.

#### 6 · Schedule

- **Trigger** — **Run now** or **Schedule**.
- **Recurrence** — Once, Daily, Weekly, Every 2 weeks or Monthly, with an end
  date or a number of sends, the time of day and, for weekly, the days.
- **Send time optimization** — let each customer receive it at the hour they
  usually engage.

All push channels of a campaign share one schedule.

#### 7 · Approval

As a marketer, pick the **approver** and **Submit for approval**; the campaign
goes to *Pending approval*. As an **approver**, the same step shows a
**Decision comment**, **Reject — back to Draft**, and **Approve & activate** at
the bottom. The history underneath shows who did what, when. The person who
builds a campaign is not the one who activates it.

#### 8 · Summary

The whole campaign on one page. **Save**, **Save & close**, or go back to any
step.

---

## Segments

**Segments** in the menu → the list → **+ New segment**, or click a row.
**‹ Segments** goes back.

The editor is a workbench:

**Left — definition.** Name, description, group, and the source: a datamart
query, an uploaded file, or SQL. In the query builder each filter is
*column · operator · value*; **+ Add filter** for more, combine them with
**AND** or **OR**, **Clear filters** to start again. The column picker is
grouped by attribute group and shows each column's label; a column the admin
marked as a category offers a value list.

**Right — audience insight.** Counts and charts that update as you change
filters: distribution by the columns you filtered, reachability per channel.

**✦ Assistant** opens a dialog. Describe the audience in a sentence —
*"prepaid customers in Kyiv or Odesa whose package expires in 2 days"* — and
**Build filters** turns it into filters in the query builder, which you then
review and edit. Close it with **Close** or **Esc**.

**Preview rows** pulls the matching customer rows. Counts update without it;
rows need it, because pulling rows on every keystroke would be slow.

**Use as an exclusion list** turns the segment into an exclusion list and asks
for the channels it applies to. **Save**, **Save & new** (save and start
another), **Save & close** or **Cancel**. Segment **groups** are set up in
Parameters.

---

## Surveys

**Surveys** in the menu (Audience & content). Short feedback surveys — NPS,
CSAT and a few questions — that go out as content inside a campaign or journey
message. There is no survey campaign: you attach a survey to a channel.

### Create a survey

1. **+ New survey**.
2. On the left, give it a **Name** (required), a description, a **Status**
   (*Draft* sends nothing; *Active* goes out with the message it is attached to;
   *Closed* stops recording answers), the dates it is valid, and the
   **thank-you message**.
3. **Languages** — English is always on. Add a second language and every
   question gets a translation field.
4. **Scoring** — on by default. NPS, CSAT and rating answers count as their
   value; for choice questions you give each option a score.
5. In the middle, **+ Add question** and pick a type: **NPS (0–10)**, **CSAT
   (1–5)**, **Rating**, **Single choice**, **Multiple choice** or **Free text**.
   Write the question, tick **Required** if it is, and add options where the
   type needs them.
6. Optionally, one **branching rule** per question: *If the answer is …, skip to
   question N* (or *the end*). Free-text questions cannot branch.
7. Reorder with **↑ ↓**, remove with **×**. Ten questions is the limit — split a
   longer survey into two.
8. On the right, the **Preview** shows the survey as the customer sees it:
   **Mobile** in the phone frame or **Web Self Care** as a card, in each
   language. Branching rules show as a small note under their question.
9. **Save**, or **Save & close** to go back to the list.

### Attach it to a campaign or a journey

- **Campaign** → step **Channel & content** → on the channel card, **Attach
  survey** and pick it.
  - **SMS, e-mail, push**: a `{{SURVEY_LINK}}` chip appears with the other
    placeholders. Click in the text where the link should go, then click the
    chip. The preview prints a personal link; the card reminds you if the link
    is not in the text yet.
  - **In-App, Web Self Care, Chatbot**: nothing to insert — the questions
    render inside the card, under your content.
- **Journey** → click a **Delivery** step → **Attach survey**. The same rule:
  a link placeholder for sending channels, in the card for self care and chat.

### Read the results

**Results** on a survey row (or in the editor) opens **Operation analysis ›
Surveys** on that survey. See *Operation analysis* below.

---

## Journeys

### Find a journey

**Journey Builder** in the menu opens the **Journey List** — it works like the
campaign list:

1. **Search** by name or journey ID, or narrow with the **status** chips.
2. **Advanced filters** adds program, trigger type, a channel used in a
   delivery step, owner, datamart and an updated date range.
3. Read the row: status, **validation** (hover the bar for what is unresolved),
   the trigger, steps and version, customers inside, entered, converted and the
   conversion rate — counted by the simulation in the prototype.
4. **Open** (or click the row) goes to the canvas. **More** holds **Monitor**,
   **Execution report**, **Copy** and — for approvers and admins — **Pause** or
   **Resume**.

### Create a journey

1. **+ New journey** opens *Create your journey*.
2. Type the **name** (required) and, if you like, a description.
3. Pick **what starts it**: *When something happens* (choose the event), *When
   someone enters a segment* (choose the segment) or *On a schedule* (choose the
   segment and when it runs).
4. **Start building** creates a Draft and opens the canvas with the entry step
   already placed. Or pick a journey under **Start from a template** to begin
   from a copy.

### Journey Builder

The canvas. **‹ Journey list** at the top left goes back to the list; the
**Journey** dropdown next to it switches to another journey without leaving the
canvas; **+ New journey** starts another; **Execution report** opens the
journey's execution log in a dialog.

- **The palette** on the left holds the step types — entry, delivery, timer,
  wait, condition, offer, NBO, parallel, external call, exit. Drag one onto the
  canvas, or click it. The burger at the top of the palette collapses it to
  icons.
- **Connect steps** by dragging from a step's orange out-port to the next step.
- **Click a step** to open its panel on the right and configure it — for a
  delivery step, that is where its channel, template, content and survey live.
  The panel also has **Disable step** and **Delete step**.
- **The toolbar** has help, zoom out / in, fit to view, undo, redo,
  **Validate**, delete step, and the direction (horizontal or top to bottom).
  The right panel collapses with its own toggle.
- **Delete** a step with the × on it or the Delete key; remove a link by
  clicking its label.
- The right panel's **Journey Builder Info** holds the journey's name and
  description, the selected step's details, and **Back** (to the list),
  **Pause / Resume** and **Activate**. Entry, re-entry and goal settings are on
  the entry step.

### Journey Monitor

Per-customer state for the selected journey: status, version and activation of
every journey; participants and how they were admitted, who is active,
deliveries and failures, goal reached, and events rejected by re-entry or
concurrency rules. Below that, a funnel by step and a point-in-time participant
list (**Show state as of**), with **Download CSV** (a toast in the prototype),
and the execution log with **Clear**.

### The simulation strip — demo only

Both screens carry a dashed purple strip badged **⚗ Simulation · demo only**.
It is **not part of the product**. The prototype has no real clock and sends
nothing; these controls move a simulated clock so you can watch customers move:

- **Send event** (builder) — inject a business event for a chosen customer.
  Immediate steps run at once.
- **Advance 1 day** / **Advance 5 days** — timers expire, mock delivery outcomes
  are generated, customers move on.
- **Reset** — back to day 0, participants reloaded from the entry segment.

The prototype runs three simulated days at load, so the monitor opens on
**Day 3** with something to show. In the product, the monitor updates on its own.

---

## Datamarts (admin)

**Administration › Datamart.** A catalogue of the data the platform can segment
on: what exists, how fresh it is, what each column means, how datamarts relate
and who depends on them. Admin only.

### Find a datamart

The list shows every datamart with its type, key column, size, last load and a
health pill — **✓ fresh**, **stale** or **✕ failed**. Search by name,
description or column name; narrow with the type and health chips.

Each row says what uses it ("3 segments · 2 campaigns · 1 journey") — click that
to jump to the Used by block. **Open** goes to the detail, **Preview data** goes
straight to the Data tab, and **⋯** holds Load data, Duplicate, Export data
dictionary and Delete. Delete is greyed with the reason when something depends
on the datamart.

### Document the columns

**Columns** is the tab that matters. One row per attribute, grouped by area and
collapsible, showing the label, type, roles, privacy, fill rate, distinct count
and how many segments filter on it. Turn on **Show technical names** to swap the
label and the database name.

Click a row to open the drawer on the right and document that column:

- **Identity** — the technical name (fixed), the EN and TR labels, a description
  and the attribute group. The label is what marketers see in the segment
  builder, so it is worth writing properly.
- **Type & mapping** — the data type, and the predefined column it maps to
  (`PHONE_NUMBER`, `E_MAIL`, `PUSH_TOKEN`) so channels know where to find the
  address.
- **Roles** — key, reference, output, sortable, nullable.
- **Privacy** — privacy level, sensitivity and the GDPR masking rule, with a
  live example of the masked value underneath.
- **Profile** — fill rate, distinct count, top values and min/max, all computed
  from the rows in front of you.
- **Used by** — the segments that filter on it, and a warning if the column is a
  personalisation placeholder in content.

**Save column**. If segments filter on the column and you changed its type or
its key role, it asks first and lists them.

Select several rows with the checkboxes to **bulk edit** group, privacy or
masking, or to mark them as categories.

### Mark a category

A text column with few distinct values gets a **Suggest: make this a category**
chip. One click accepts it, or tick *Use as category* in the drawer and press
**Fill from data** to collect the allowed values.

It matters because of what happens in Segments: a category column's filter stops
being a free-text box and becomes a **value list with the `in` operator**, so
nobody has to remember whether the region is written "Kyiv" or "KYIV".

### Define a relationship

**Relationships › + Add relationship.** Pick the target datamart, the column on
each side and the kind (many-to-one and so on). Both columns must have the same
type — it says so if they do not.

This is the only way a segment can join a second datamart. In the segment
builder, **Join a second DataMart** offers only related datamarts and shows the
real join columns.

### Check freshness

**Load & refresh** (a concept in the prototype) shows the source, the schedule
and the load history — rows added, changed and failed, duration, and notes such
as a newly detected column. **Run now** simulates a load.

For query-based sources the page states the guard rails: the view is opened
read-only, the preview is capped at 100k rows and a statement is cancelled after
30 seconds.

**Delete all records** is at the bottom, in red. It empties the datamart and
keeps the column definitions, it asks you to type the datamart name, and it is
blocked entirely on the default main datamart.

### See the data

**Data** previews the first 50 rows with a search and a column filter, and a
profile card for whichever column you pick on the left.

Values are **masked per column privacy**. As an admin you see them unmasked and
the page says so; flip **View as marketer** to see exactly what a marketer
would. **Export sample (CSV)** always writes the masked values.

---

## Reports

**Reports** in the menu (Operate) is the aggregated, chart-led view of results;
the line at the top says so and **Operation analysis ›** takes you to the
row-level one.

- Pick the **period** with the chips; the figures read through it.
- The tiles show delivered, opened, clicked and converted, active campaigns
  and campaigns waiting for approval, followed by the charts and the
  **Campaigns** table (sent, delivered, open, click, conversions) with **Open**
  per row.
- Totals are at operator scale, like the dashboard — the *Demo figures at
  operator scale* pill says so.
- **+ Add panel**, **Ask the agent** and **Export** are concepts and disabled.

---

## Operation analysis

**Operation analysis** in the menu (Operate), or **Results** on a campaign.
Where Reports shows totals and charts, this page shows the rows behind them:
each delivery execution, each eliminated customer, each promotion code and each
survey response, with the ids support teams ask for. It replaces the old
Delivery, Elimination, Promotion, Active Promotions and Survey Result screens.

### Read an operational report

1. **Set the scope** on the bar at the top: the **period** (last 7, 30 or 90
   days), the **source** (all, campaigns or journeys), a **campaign or
   journey** (click *All campaigns and journeys* and type to search), a
   **channel** and a **campaign status**. The scope applies to every tab and
   stays when you switch tabs. **Reset** clears it.
2. **Pick a tab**:
   - **Deliveries** — one row per execution: targeted, delivered, eliminated,
     control group and the delivery status. Campaign and journey deliveries
     are both here; the **Source** column says which, and the **Source**
     filter on the scope bar shows just one kind.
   - **Eliminations** — who was removed before a send and by which rule. The
     bars above the grid split the total by rule, with the same rules and
     shares as the dashboard's funnel. **Click a bar** to see only that rule.
   - **Promotions** — every promotion code, its unique promo code, recipient,
     result, sent date, *Active until* and status. **Active only** shows the
     codes still valid and not yet redeemed.
   - **Surveys** — pick the survey at the top; see *Survey results* below.
3. **Read the strip** of totals under the tabs — it follows the scope.
4. **Click a row** to open the side panel with every field, the technical ids
   included, and **Open campaign ›**, **Open delivery** (the campaign's Channel
   & content step) and **Open customer** (a concept). On a journey row the
   links are **Open journey ›** and **Open delivery** (the Delivery step on the
   canvas). **Esc** or **×** closes it.

From a campaign, **Results** (on the campaign list, or at the top of the
editor) opens this page on Deliveries, already filtered to that campaign.

### Shape the grid

- **Columns** — tick to show or hide, **↑ ↓** to reorder, **Default columns**
  to undo.
- **Show technical IDs** — adds Communication, Delivery, Execution and Main DM
  ID (and the others per tab). They are hidden by default.
- **Sort** — click a column header; again to reverse, a third time to clear.
- **Resize** — drag the right edge of a header.
- **Advanced filter** — opens the condition builder: *column · operator ·
  value*, **NOT** on a single condition, **AND / OR** to join them. **Apply**
  turns each condition into a chip above the grid; × on a chip removes it.
- **Saved views** — **Save view**, give it a name, and pick it from **Saved
  views** later. It keeps the scope, the tab, the columns and the filters. The
  prototype keeps them until you reload; the product saves them for you.

Recipient e-mail and phone are masked (`a•••@example.com`,
`+90 5•• ••• 12 34`). An admin can turn on **Show recipient details** in
Promotions.

### Export it

**Export CSV** downloads what the grid shows: the rows that match the scope and
filters, in their current order, with the visible columns. Masked values stay
masked. **Export Excel** is a concept and disabled.

### Survey results

In the **Surveys** tab: responses, response rate (of the messages delivered
with the survey), average score, completion rate and — for a survey with an NPS
question — the NPS. The **Net Promoter Score** panel shows promoters, passives
and detractors as one bar and the NPS over the period. Under it, one chart per
question, and the latest written answers for free-text questions. The grid
lists every response; click one to see all its answers, including the ones a
branching rule skipped.

---

## Administration (admin role)

- **Templates (design)** — the designs, per channel, with their named slots,
  and where each template is used. Wording is *not* here; it is written inside
  each delivery.
- **Parameters** — one page, top to bottom:
  - **Segment Groups** — the groups segments are filed under; **+ New group**,
    rename, and delete when a group is empty.
  - **Campaign form** — turn Objective, Description and Campaign Brand
    (multi-brand) on or off for this customer. Hidden fields keep their default
    value. Campaign Status and Budget are gone for good.
  - **Communication rule defaults** — the **campaign pre-sent period** (moved
    here from the campaign form), the campaign-type overlap and the channel
    cooldowns every campaign starts with.
  - **Channels & senders** — per channel the sender profile, gateway, maximum
    volume per day and receiver column.
- **Datamart** — the data catalogue. See **Datamarts (admin)** above.
- **Release & licences** — version, environment and licence information, and
  the role and permission presets.
- **Decision API** (under Operate) — the endpoints channels call, each with a
  sample request and response for a chosen customer and channel.

---

## Things worth knowing

- **Nothing is saved.** Reloading starts over from the sample data.
- **Nothing is sent.** Test sends raise a toast instead. Operation analysis
  exports a real CSV — of demo rows.
- The sample data is 30 customers, 18 campaigns and 3 journeys. Two of the
  campaigns are in the approval loop: **2004** is waiting for approval and
  **2613** was sent back by the approver, so the dashboard and the approver
  tour have something to show. Every name, number and address is made up.
- **Esc** closes any dialog: the manual, the execution report, the segment
  assistant and the Operation analysis side panel.
- *Offers* and *Policies* are hidden from the menu for every role for now. The
  screens are still in the prototype and can be brought back without rework.
- The prototype opens on the **Dashboard**.
- Guided tours never block the page, and `?notour` in the URL turns off anything
  that would start on its own.
