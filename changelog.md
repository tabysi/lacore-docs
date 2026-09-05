# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.
Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [3.5.5] – 2026-09-05 — Seven foundations

> One release, seven building sites. Each of these ships as a **foundation**: a real, working first
> layer with its data model settled, so what lands next builds on it instead of replacing it. Every
> section says what is there today and what is not yet.

### Added

#### Investigation: scene traces, a lab, warrants

![From scene to record — traces, lab, warrants, case](/img/changelog/investigation-flow.svg)

Every shot fired now leaves a **shell casing** where the shooter stood, and a death leaves a **blood
trace**. Officers on duty see them as markers at the scene and collect them with **E**; each one
becomes a tagged piece of evidence (`SC260905-4F2A`). A trace knows who left it, but only the
**lab** says so: `/evidence analyze <tag>` returns a match after a configurable delay and logs it on
that person's record through the existing evidence locker, so an MDT query shows it like any
hand-logged item.

**Warrants** get a request-and-approve flow: `/warrant request <search|arrest> <name> | <reason>`
from any unit, `/warrant list · approve · deny` for supervisors, who are notified of every request.
An approved arrest warrant sets the person's warrant flag — the one every terminal already shows.

**Case files** accept scene evidence: `/evidence attach <tag> <case#>` lists it in the case with tag,
kind, lab result and who collected it. New events for integrations: `lacore:api:evidenceCollected`,
`lacore:api:warrantDecided`. Config: `configs/cfg-investigation-sh.lua`; master switch
`Features.investigation`. Docs: [Investigation](/features/investigation).

*Not yet:* an Evidence tab and a supervisor Warrants queue inside the MDTs; fingerprints lifted from
vehicles; bundling CCTV / ALPR hits into a case from the terminal.

#### Citizen Hub — the civilian overhaul starts with a panel

![The Citizen Hub panel](/img/changelog/citizen-hub.svg)

The civilian side had four radial entries that each did one thing and showed nothing. The **Citizen
Hub** (radial → Services → Citizen Hub, or `/citizen`) is one panel with four tabs: **Overview** (the
character as the ID card reads it, licences colour-coded), **Vehicles** (every registration with
insurance state), **Activities** (completion counts, a waypoint button per route) and
**Organisation** (rank, members, open the panel). It only reads; every button goes through the same
client paths the radial uses, so it can never do more than the wheel.

*Not yet:* the visual redesign of the radial itself, org territories, character photo persistence.

#### Gameplay layer: balance and a first-join loop

`configs/cfg-gameplay-sh.lua` is the new home for game design. **Balance**: four damage multipliers
(dealt with weapons / melee / vehicles, taken from weapons), applied to every player equally and
re-applied every few seconds so nothing resets them — and all four are **live dashboard settings**.
**Session loop**: a short onboarding sequence, once per player — one set on the first spawn as a
civilian, one the first time duty is granted — telling a newcomer where the radial, the duty menu,
the MDT, scene evidence and warrants are. `/onboarding civ|leo` replays a set. Docs:
[Gameplay & Balance](/features/gameplay).

*Not yet:* respawn hold, weapon-class balance tables, a proper objectives system.

#### Community page — the portal becomes a roleplay website

![The community page — push, portal, page](/img/changelog/community-page.svg)

Every licensed server gets a **public page on the LACORE portal**, `/community/<id>`: community
name, online state and player count, a **Join the Discord** button, one card per department with
its on-duty count, and the live roster (callsign, name, department, status) refreshing every 30 s.
An officer signed in with Discord sees **My unit**. The server pushes the roster every two minutes
and on every duty change over the same write-only relay the telemetry uses; the console prints the
URL once. Discord ids stay server-side and are never published. Nothing is stored. Master switch
`Features.community`. Docs: [Community page](/customer-portal/community).

**Second layer, same day:** the page is now **yours to write** — Dashboard → Community gives every
key an editor for tagline, accent colour, about text, rules, Discord and website, plus a blurb,
requirements and a **Recruiting** switch per department. Each department has its **own page**
(`/community/<id>/<DEPT>`) with its on-duty units. Switch **applications** on and recruiting
departments get an **Apply** form (Discord name, in-game name, your questions, free text — no
account needed, rate-limited, honeypot); applications land in the dashboard inbox with
accept / decline / note. Stored in the configs collection under `community:<keyId>`, so nothing
new to import.

**Applications reach Discord.** Two switches under Notifications: a **DM from the LACORE bot** to the
account owner (default on) and a **webhook** into a channel of the community's own Discord — both
carry department, names, answers, free text and a link to the inbox. **Many departments** no longer
mean a wall: above seven the tab row becomes a picker, cards sort recruiting-first then by units on
duty, and the rest folds behind *Show all*; the dashboard list is an accordion with filter and a
recruiting-only switch.

**Deep tier for notifications.** Invite the LACORE bot into the community's own Discord, paste the
server id, and the dashboard offers its roles and channels: a channel the bot posts every
application into, roles to ping there, roles whose members get a DM — as page defaults and
**per department** (a department either inherits or sets its own). Three new bot control
endpoints (`guild-info`, `notify-roles`, `notify-channel`); only picked roles may ever be pinged.

*Not yet:* roster history, an access gate for the roster.

#### Config overhaul, first layer

- **`/lacoreconfig wizard`** — walks through the eight settings every owner should have seen once
  (language, branding, departments, feature switches, balance, dashboard consent, licence key,
  restore) with the **current value** and the file each lives in. Changes nothing.
- **More remote settings** — the dashboard allowlist gains the gameplay multipliers, onboarding,
  the investigation lab time and collect distance (all live), and the three new feature switches.
- **CONFIG-INDEX** lists the two new files and points to the wizard.

*Not yet:* merging the 60 files into fewer themed ones — that would break `.defaults/` restore and
the escrow split, and needs its own release.

#### Web Dispatcher: published

The hosted browser dispatcher — CAD state pushed every two seconds, actions riding back, Discord
sign-in, the RP-WEB desktop at `/server/<id>` — is complete and documented, and is announced with
this release. Nothing changed in the code. Docs: [Web Dispatcher](/features/webdispatch).

### Changed

- **License keys page rebuilt around "which key runs where".** Every key card now lists the
  servers running on it (online, IP, version, players) with the web-dispatcher link per server and
  the community-page URL per key, each with a copy button and a LIVE / NOT PUSHED YET state. A
  three-step strip explains the linking, and servers reporting without a key are listed as
  unlicensed. The Servers page names the key each server runs on and links its community page.

  ![The License keys page — every key with the servers and URLs under it](/img/changelog/licensing-hub.svg)

- **The three `add_ace resource.lacore …` grants are documented now.** LACORE creates its own ACE
  groups at start-up, which FiveM only allows if the resource holds `command.add_ace` /
  `add_principal` / `remove_principal`. They were in `server.cfg.example` but nowhere explained, so
  a missing grant read as twenty-one cryptic `Access denied for command add_ace.` lines — with the
  staff groups silently left empty behind them. The example file now says why the block is there,
  and the docs cover it in [Permissions & ACE](/configuration/permissions), the installation guide,
  the convar reference and troubleshooting.

  ![How LACORE creates its ACE groups, with and without the three grants](/img/configuration/ace-bootstrap.svg)

- **Escape closes the Pennsylvania CAD and the Agency MDT.** Inside a text field the first Escape
  only drops the focus, the second closes — so a half-typed comment is never lost to the key.
- **Every visible string** of the new features is in the locale files (`lang/*.lua`, `lang/*.json`).

⚠️ **Config change:** two new files — `configs/cfg-investigation-sh.lua`,
`configs/cfg-gameplay-sh.lua` — and three new switches in `configs/cfg-features-sh.lua`
(`investigation`, `gameplay`, `community`, all default **on**). Nothing existing changed its meaning.

> **Not tested in-game.** Everything in this release passed the Lua syntax check, the NUI build and
> the portal build; the Citizen Hub and the PennCAD were verified in the NUI preview. The world-side
> paths (traces, collecting, the lab, warrants, the roster push) have not run on a live server yet.

## [3.5.4] – 2026-09-05 — The whole call, not one row of it

### Added

#### Pennsylvania CAD: a Call Detail view

The CAD Viewer had exactly one table row per incident, and that row clips. The caller's words, the
notes, who is attached and everything in the comment log were never on screen at all — a request
from a Pennsylvania CAD community: *"can the call view be enlarged, so the whole info is visible?"*

![Pennsylvania CAD Call Detail sub-tab](/img/changelog/penn-call-detail.svg)

**Double-click an incident** in Current Incidents, or open the new **Call Detail** sub-tab under
My Call Info, and the selected call fills the pane at reading size:

- Call number, type, state, priority and elapsed time in the header.
- Location, DArea, agency, caller, **assigned units with their status**, the **reported text**
  in full and the dispatcher's notes.
- The **complete incident log**, numbered, with time and callsign — long comments wrap instead of
  being cut off, system lines read grey.
- A comment field at the bottom, so you can write into the log from the same screen. It goes
  through the same path as F10 / the command bar.

The pane is live: a comment another unit posts lands in the log without reopening the call. Back to
the tables with the **Back** button or the **CAD Viewer** sub-tab. `Full Screen` still works on top
of it if the window itself is too small.

## [3.5.3] – 2026-08-31 — Unit lists that survive a full patrol

### Added

#### Auto-Config can now apply what it suggests

The setup review has been telling you which settings would suit your server better since 3.5.0, and
then leaving you to make every one of them by hand. It can do them now.

![Which settings layer wins](/img/features/autoconfig-layers.svg)

```
/lacore autoconfig           # look — changes nothing, exactly as before
/lacore autoconfig apply     # apply every suggestion
/lacore autoconfig revert    # put them all back
```

Applied values go to **`data/autoconfig.json`** — never into the files in `configs/`, because
rewriting a config file at runtime is fragile and leaves no clean way back. That gives settings
three layers with a fixed order: `configs/*.lua` < `data/autoconfig.json` < dashboard. **Anything
you set in the dashboard beats what Auto-Config applied**, and the order is enforced by load order
alone, so no rule can disagree with itself.

Reverting restores what was really there before — including values you had edited by hand — not the
shipped defaults. Every apply snapshots the values it is about to replace, and repeated applies keep
the original snapshot rather than recording their own work as the thing to go back to.

Nothing about the safety rails changed: only allowlisted, correctly typed, non-sensitive keys can be
touched, and applying still requires Staff / Dev like every other `/lacore` command.

> ⚠️ **New config file:** `configs/cfg-autoconfig-sh.lua`. Existing servers need no change — the
> defaults keep the current behaviour, where nothing is applied unless you ask. `applyOnFirstStart`
> is the opt-in that applies once on a server that has never applied before; it cannot fire on a
> server already in service.

The setup report carries the applied settings along with the suggestions now, so support never
reads a change you made weeks ago as an outstanding one — an applied setting drops out of the
suggestion list by itself, which from the outside looks exactly like never having had one. The
[telemetry page](/features/telemetry) lists the field, as it does every other one: what leaves your
server is documented, and this addition is no exception.

#### The setup review now notices what is missing, not just what is doubled

Every check in the review asked the same shape of question: is something running **twice**? Two
dispatch systems, two phones, two HUDs. Nothing ever asked whether something LACORE depends on was
**absent** — even though the two resources in question have sat in the detection catalogue since
3.5.0, filed under a comment reading *"absence is the interesting case"*. The entries were there.
The question was never asked.

- **`oxmysql` not running** — data lives only in the JSON mirror on disk. It works, so nothing looks
  wrong, but nothing is durable either.
- **`screenshot-basic` not running** — evidence photos, the phone camera and the anticheat's
  screenshot upload are inert. No error, just nothing.

Both surface weeks later as "records keep disappearing" or "the camera does nothing". They are
named checks by resource name rather than by catalogue category, so adding another resource to that
category later cannot silently switch them off.

### Changed

#### Prompt dialogs take more than one line now

Every prompt in the CAD — the details on a backup request, a resolve reason, anything that asks you
to type something — shared one single-line input capped at 120 characters. A sentence fit. A short
scene description did not, and there was no way to put two facts on two lines.

![Request details before and after](/img/features/prompt-dialog-multiline.svg)

It is a proper text box now: four lines tall, drag the corner for more, 500 characters, and the
dialog itself is wider to match. **Enter** inserts a line break, **Ctrl+Enter** confirms — Escape
still cancels. Confirm dialogs without an input field are unchanged, Enter confirms them as before.

#### The legacy phone draws at the top of the script layer

The scaleform phone and its apps (texts, contacts, Bleeter, the radio app) drew at script draw
order 4. They are at **7**, the highest the game accepts, so nothing another script draws can land
on top of them.

> This orders *script draws* against each other. A NUI/HTML overlay from another resource — a radio
> panel, a HUD — is composited above every scaleform by the client and cannot be reordered from
> here. If your radio still covers the phone, it has to hide itself, or the phone has to move.

#### Every player decides where their phone sits

The phone was nailed to the bottom-right corner, which is also where a lot of servers put a radio,
a HUD or a speedometer — and whatever that other resource draws sits on top, because a NUI overlay
is composited above every scaleform and no draw order can change that. So the phone moves instead.

![The 25 spots a phone can take](/img/features/phone-position.svg)

**`/profile` → Settings → In-Game Phone & Computer** has two new entries, **Phone Horizontal
Position** (Right · Centre right · Centre · Centre left · Left) and **Phone Vertical Position**
(Bottom · A little higher · Higher · Much higher · Top). 25 spots between them.

It is a **player setting, not a server one**: it lives on that player's own client in the same
`LACORE:SETTINGS` store as their PLD colour and their map style, so two officers on the same server
can put their phone in two different places. Nothing in `configs/` changed.

Both phones follow it — the scaleform phone and the NUI phone, the retro brick included — and a
change applies to a phone that is already on screen, not only to the next one you open. A raised
phone is capped so it cannot run off the top edge on a short screen.

#### The dev launcher lists every interface, not the ones somebody needed

The Vite dev launcher (`npm run dev`, the DEV button) knew about 18 of the NUI's interfaces. The
other 26 could only be reached by hand-writing a `window.postMessage` with the right payload, which
meant in practice they were not looked at.

![What the dev launcher now covers](/img/features/dev-launcher.svg)

It lists **44** now — everything `App.svelte` can render. New: the phone (modern and the retro
brick, plus its placement spots), Spawn Select, the Session window, Mobile ID, the In-Car CAD and
MDT dashboards, ALPR, the Air Unit camera, the Turf HUD, the civilian ID card, the AOP ballot, the
911 call session, notifications, Corrections, the Impound lot, the CCTV manager, the vehicle and
prop spawners, the phone booth, Organisations, the bug report form, the zone editor and both MDT
record forms. Many carry variants — ALPR with a warrant hit, the Air Unit camera in thermal and
night vision, Mobile ID with no match.

Each opener sends the **same message the Lua side sends**, so a payload that drifts shows up as a
broken preview instead of a mock that quietly disagrees with the resource. Writing them found one
already drifted: the mock 911 transcript used field names the component does not read.

`Close all UIs` now really closes all of them — the zone editor, the civilian form and the ID card
are opened by a store flag rather than a message, and were surviving it.

> Dev-only. This is behind `import.meta.env.DEV` and is not in a built resource.

#### The settings screen stops being a wall of text

Feedback from the team, and it was right: the settings are all there and none of
them are easy to find. Four vertical strips — the profile's own nav, the category
rail, the settings list and the account column — were splitting a 1240px window,
which left the list about **300px** of text column. Descriptions wrapped to five
lines, the control sat wherever the text happened to end, and every row looked
exactly like the one above it.

![Settings rows before and after](/img/features/settings-readability.svg)

Nothing was removed and no setting moved. What changed is the room and the rhythm:

- **The profile window is 1440px wide** instead of 1240 (still `96vw`, so smaller
  screens are unaffected). The account column is capped at 340px instead of taking
  a fixed share, and the whole difference goes into the settings list — **460px** of
  text column instead of 300.
- **Every setting is a card**, with real space between the cards. Twenty-six
  settings behind a hairline rule read as one block; the eye needs somewhere to
  stop.
- **One control column.** Switches and dropdowns line up on the same edge on every
  row, instead of stepping in and out with the length of the label. When the
  window gets genuinely narrow the control wraps onto its own line rather than
  crushing the text into one word per line.
- Names are a size bigger, descriptions have more line height, the category header
  carries its count, and the "changes save as you make them" note moved out of the
  search row — where it was wrapping to three lines — down under the list.

#### Picking a character in the tab strip activates it

Also from the team. The character tabs along the top of the profile only changed
which character you were **looking at**; making one the active character was a
second click on another screen, and nobody expected that — a strip of character
tabs reads as a character switcher.

It switches now. The dot on each tab marks the **active** character, not the open
tab, so the change is visible where it happened. Framework-managed setups are left
alone: there the framework owns the active character, and LACORE follows it.

Activating only moves which record is active — name, licences, vehicles. It does
not respawn anything.

#### The rest of the weapon-drop system is gone

The half that destroyed weapons was disabled earlier in this release. The other
half — about 140 lines of it — was still sitting in `client/weapons-cl.lua`:
`weaponDrop:syncWeaponDrop` and `weaponDrop:removeWeaponDrop` spawning and
deleting props, a five-minute despawn timer, and a pickup loop that gave the
weapon back and reported it with `weaponDrop:pickupWeapon`.

None of those three events has ever had a server handler anywhere in this
repository, so none of that code could run. It is deleted, along with the
now-orphaned rate limit for `weaponDrop:dropWeapon` in the anticheat parameters.

**Dropping a weapon on purpose is untouched.** `/drop` never used this system —
it calls the game's own `SetPedDropsInventoryWeapon` and announces it over
`weaponDropped`, which does have a server handler.

If a death-drop is wanted as a real feature, it needs a server that owns the
drops. The client half alone is what caused the original bug.

### Fixed

#### Half of your configuration was never in the config backup

`/lacoreconfig backup` exists so a reinstall cannot eat your settings. It carries a static list of
the files it snapshots — FiveM's Lua sandbox cannot list a directory, so a resource only knows the
files it is told about — and **that list had drifted to 29 of 59**.

Everything below was outside the backup, silently, while the command reported success:

`cfg-hud` · `cfg-mdt` · `cfg-regions` · `cfg-supervisor` · `cfg-permissions` · `cfg-vehicles` ·
`cfg-spawns` · `cfg-licenses` · `cfg-alpr` · `cfg-airunit` · `cfg-k9` · `cfg-impound` ·
`cfg-corrections` · `cfg-cases` · `cfg-items` · `cfg-report` · `cfg-replay` · `cfg-personnel` ·
`cfg-fingerprint` · `cfg-penn` · `cfg-retro` · `cfg-library` · `cfg-globalban` · `cfg-identitylink` ·
`cfg-deathsync` · `cfg-cuffs` · `cfg-remoteconfig` · `cfg-vehiclescreen` · `cfg-mdt-labels` ·
`cfg-autoconfig`

All 59 are covered now. Because a hand-kept list rots again the moment someone adds a config, the
build checks it: `build/check-configlist.mjs` compares the list against the folder and fails
`escrow.ps1` on any drift — done where a directory can actually be read.

`backup` also reported success unconditionally. It now refuses and says why when the storage layer
is unavailable or not one file could be read, and names the count against the total, so a partial
backup no longer reads like a complete one.

<Callout type="warning">
  **Re-run `/lacoreconfig backup` once after updating.** An existing backup was taken with the old
  list and is missing those thirty files.
</Callout>

#### Dispatch radio arrives now — "Start of Watch" reached nobody

Going on duty announced you over dispatch. Going off duty did too. `/xmit` transmitted. All of it
was sent by the server and **no client ever listened** — `dispatchText` had four senders and not a
single handler, anywhere, ever. `client/core-cl.lua` even declared a `dispatchTextQueue` that
nothing filled or read.

It arrives now, as a notification with the callsign as its title, which is how a radio line reads:
who is speaking, then what they said. It goes through the normal notification system, so whichever
style you picked in `cfg-notify` applies here too.

Two things changed on the way out:

- **It goes to on-duty units, not to everyone.** It used to be broadcast to every client, which put
  a department's radio traffic in front of every civilian on the server — and, until now, in front
  of nobody at all.
- **"Start of Watch" was hardcoded English** while its counterpart went through `T("end_of_watch")`.
  It has a locale entry now, like everything else.

`/xmit` itself had two faults, both fixed. `jobA == "Law Enforcement" or jobA == "Fire/EMS" and
#args > 0` binds as `a or (b and c)`, so law enforcement skipped the argument check entirely and
could transmit an empty line. And `AMR` — the in-game EMS job string — was missing from the check
outright, so medics could not use the radio at all.

#### /onduty could die with "table expected, got nil"

Reported from a live server: running `/onduty` threw
`bad argument #1 to 'for iterator' (table expected, got nil)` and did nothing.

The command's first act is to look your character up in the online-player list, and that lookup was
the one reader of the list that never guarded it — `playerlist-cl`, `phonebooth-cl` and `mdt-nui-cl`
all write `onlinePlayers or {}`, so somebody had met this before and hardened their own call sites
only.

The cause sits one step further back. `syncPlayerList` is an **unnamespaced** event name, so
anything running on the server can fire it, and the handler assigned the payload to the global
before looking at it. A single nil payload therefore left the list nil for good — every later
lookup threw, and only a rejoin fixed it.

The handler now ignores a payload it cannot use and keeps the last good list, and the four
remaining unguarded readers were brought in line with the three that already were.

#### Dying destroyed the weapon you were holding

A thread watched for your death, told the server to drop your weapon into the world, and then
removed it from your hands. There has never been a server handler for that event — not in any
version of this resource — so only the second half ever happened. The weapon was taken away, no
pickup appeared, and nothing was logged. Nothing else in LACORE strips weapons on death, so this
was the whole of it.

The destructive half is gone. The receiving half — the pickup loop and the two sync events — stays
in place and dormant: it only ever acts on drops the server announces, and the server announces
none. Implementing that side is what would turn this into a working feature; until then, not
deleting a player's weapon is the correct behaviour.

#### Two notifications showed their own key instead of a sentence

A pre-release sweep across every locale key used in the code turned up two that were never
declared. Neither fails loudly: `T()` returns `[key]` for something it doesn't know, and the NUI's
`t()` does the same — so the fallback written next to one of them could never fire, because a
string in brackets is still a string.

- **`staff_marked`** — when a staff member marks a location on your map, the notification read
  `[staff_marked]`. Missing from all three Lua locales.
- **`fp_not_restrained`** — trying to take prints from someone who isn't cuffed showed
  `[fp_not_restrained]` in the Mobile ID panel. The Lua locales had it; the three NUI locale files
  did not, and that is the path the panel uses.

Everything else came back clean: all 304 Lua files parse, every path in `fxmanifest.lua` resolves,
the two files that load twice do so deliberately and say so, and the Lua and NUI locale sets are
identical across English, German and Russian.

#### UR and US went blank when two units shared a callsign

On the LASD MDC, `UR` (unit roster) and `US` (unit status) worked fine in a two-officer test and
stopped working during a patrol with eleven officers on duty. It was never about the number of
units — it was about two of them carrying the **same callsign**.

![Unit lists and duplicate callsigns](/img/changelog/unit-list-duplicate-callsign.svg)

Both lists identified each row by callsign alone. An officer who never set one registers as `UNIT`,
so the moment a second officer did the same, two rows claimed the same identity and the list refused
to render — the command looked dead while the rest of the terminal kept working. Rows are now
identified by callsign **and** position, so duplicates are simply two separate rows.

The same pattern sat in every other unit list, and all of them are fixed: Dispatch (unit table and
the assign dropdowns), the LAPD MDT unit list, the Agency MDT unit and incident-unit lists, the EMS
CAD, Penn CAD, and the in-car CAD.

Worth saying why the LASD MDC was the one that broke: everywhere else the unit list passes through
`mergedUnits()`, which folds partners sharing a callsign into one row before anything renders, so
duplicates never reached the list. The MDC reads its own unit feed directly and had no such step.

**And partners sharing a callsign is the normal case, not the fault.** Two officers riding one unit
answer to one designator — that is why the shared MDTs merge them and offer the crew behind an
expander. The MDC now does the same where it belongs:

- `US` (unit status) is a **unit** view, so partners are one line carrying the crew count —
  `1-ADAM-12 (2)`. Where a crew is split across statuses the line follows whoever is on an incident,
  because a unit listed against a call must not read as available.
- `UR` (unit roster) is a **personnel** list and deliberately keeps one line per officer, so a
  supervisor can still see who is actually out there.

#### Going on duty failed silently for players without Discord

Three log lines built a Discord handle straight into a string without checking that the player had
one. No linked Discord account meant no handle, and the concatenation aborted the handler.

![Going on duty without Discord](/img/changelog/duty-change-abort.svg)

The abort happened **before** the duty change itself. Job, department, callsign and status were
never written, the personnel file recorded nothing, and the API event never fired — while the
client, which applies the job the moment `/onduty` is typed, kept showing the player as on duty.
The same line sits in the end-of-watch path, where the abort also skipped removing the player from
the unit list, leaving a unit on the board that nobody was driving.

This only ever surfaced on servers with Discord authentication **off** — with it on, the connect
gate turns those players away long before they reach a duty command. All three sites now fall back
to `no Discord linked`.

#### A wanted person could clear their own warrant

The `/char` form sent the whole profile back to the server, warrant included, and the server took it
at face value — then mirrored it into the character record, which is the exact field an officer
writes through `char:OfficerSetWarrant`. An officer put a warrant out; the wanted player opened
their own profile, hit save, and it was gone. The same field travelled through `/profile` character
edits and through saved character presets.

![Who owns what on a file](/img/changelog/record-ownership.svg)

The warrant is now off the client's write path entirely. `/char`, `/profile` and presets keep the
existing server value instead of overwriting it, so setting and clearing a warrant is an officer
action and nothing else. Licence slots stay self-declared — nothing in LACORE suspends one, so
there is no enforcement state there to protect.

#### Police entries could be deleted from the file they were written on

File entries an officer added were stored on the subject's own character, and the three handlers
that manage entries — save, archive, delete — never asked who wrote them. Anyone could delete an
officer's note from their own record, or hide it in the archive. Sending back an existing entry's
id even let the client rewrite one in place, and the officer marking came off in the process.

Officer entries are now sealed: the server refuses to edit, archive or delete them, and in the
profile UI they carry a **Police record** badge where the action buttons used to be.

#### CAD access outlived the shift it was granted for

Opening the LASD MDC registered you as a unit, and that registration was the permission: every
command afterwards — self-assign, handle, back, call notes, status, and the person and plate
lookups — only asked whether the registration existed, never whether you were still on duty. The
entry was cleared on disconnect and nowhere else, so going off duty changed nothing. You kept full
CAD access, person lookups included, and stayed on the roster as an active unit for the rest of the
session.

Two changes close it. The unit lookup now re-asks the duty gate on every command and drops a stale
registration on the spot, and a duty change takes the unit off the roster immediately instead of
leaving a ghost behind until the player leaves. The EMS CAD was built on the same pattern and got
the same treatment.

#### Callsigns are shaped before they reach the roster

`ondutyServer` validated the job and the agency carefully and then took the callsign exactly as the
client sent it — no length limit, no character filter. It travels a long way from there: every MDT
roster, the dispatch text, the radio name.

Callsigns are now uppercased, reduced to letters, digits, hyphens and single spaces, and capped at
16 characters. The client applies the identical shaping before sending, so the HUD never shows a
callsign the roster doesn't have.

Duplicates are deliberately still allowed: partners riding one unit share a callsign, and the MDTs
fold them back into a single row with both names under it.

#### CAD data no longer goes to everyone on the server

Two payloads in the two-second dispatch sync still went to every connected player: the unit list,
and the call blips — the latter carrying **coordinates for every open incident**. The clients
already filtered both for display (blips are drawn for on-duty units only, unit data needs an open
CAD), so nothing looked wrong. But filtering at the client is a display rule, not a boundary: the
data was on the wire, and anything reading the wire had the whole board, live, every two seconds.
The call list itself had already been moved off the broadcast for exactly this reason — these two
were left behind. The bulletin board was broadcasting to everyone too.

All of them now go to on-duty units only, through the same audience the call list uses.

#### Reading the CAD needs a badge now

Writing to the CAD has always been gated. Reading it was not, and five handlers answered whoever
asked: the full call and unit sync, the incident history (200 closed incidents with their notes and
comments), the BOLO list, the bulletin board, and the dispatcher's unit list. The contrast was
sharpest on the board, where posting checked that you were on duty and reading checked nothing.

All five now ask the same question the write side does — are you on duty, in any job — through a
new `PlayerIsUnit` helper next to the existing `PlayerIsAuthorized`. Officers, medics, dispatch and
staff are unaffected; nothing else gets an answer.

#### Four small ones from the same audit

- **A removal inside a loop skipped the next entry.** Two `table.remove` calls sat in a running
  `ipairs`, where the following element slides onto the index the iterator has already passed. The
  player cleanup now stops after its one match; the unban walks backwards, so a duplicate ban id
  can no longer survive by being stepped over.
- **`json.decode` was handed a `nil` on a fresh client.** The settings load guarded the *result*
  with `or {}`, but the decode errors on a nil *argument*, which is what a client has before the
  key has ever been written. It gets `"{}"` now.
- **Placed props could be deleted from anywhere.** Removing a prop by network id checked that the
  prop was one LACORE had placed — sensibly, so arbitrary world entities are safe — but never
  checked where the caller was standing. Walking the id space cleared the map from a chair. It now
  uses the same five-metre reach as removing the nearest prop, which is all the Third-Eye that
  fires it ever needs.
- **A turf kill did not require anyone to die.** The handler verified the zone, both parties'
  positions, the orgs, and a per-victim cooldown — everything except the death. Two allies in a
  zone could trade a report every 20 seconds. The victim's ped is now confirmed dead server-side,
  with a short grace period so health replication lagging behind the report doesn't cost an honest
  capture.

#### AMR never announced its start of watch

The end-of-watch branch listed four jobs, the start-of-watch branch three: `AMR` — the in-game job
string for Fire/EMS — was missing from the second one. Medic units got no "Start of Watch" dispatch
line and no on-duty entry in the webhook log, but a clean off-duty entry when they logged out, which
made the log read as if they had never gone on duty at all.

## [3.5.2] – 2026-08-30 — Reports that ask the right questions

### Added

#### Five real report forms — and a way to write your own

Every report type used to be the same form: pick a type, write a narrative. A Use of Force report
and a tow sheet asked exactly the same question, which is to say neither of them asked anything.

![Reports that ask the right questions](/img/changelog/report-forms.svg)

Five types now carry **their own fields**:

| Report | Asks about |
| --- | --- |
| **Incident** | classification, when it occurred, who reported it, witnesses, property, cleared by arrest |
| **Use of Force** | the subject's action *before* the force used, rounds fired, injuries, medical aid, supervisor, body-cam |
| **Traffic Collision** | severity, vehicles, direction, weather/road, primary collision factor, towed, EMS |
| **DUI** | suspected substance, BAC, refusal, field sobriety tests, driving observed, vehicle, towed |
| **CHP-180** | plate, VIN, make/model, authority for removal, removed from, stored at, tow company, odometer, **condition before the tow**, contents, hold |

Arrest, Field Interview and Supplemental stay plain narrative reports, exactly as before.

**The forms are declared, not coded.** A type's fields live in `configs/cfg-evidence-sh.lua`, and
the form in the LAPD MDT, the LASD CAD, the PCMS and the Agency MDT is *rendered from that table*.
Add a field to the config and it appears in all of them, with no code change — which is also why
this is five forms rather than five forms times six terminals.

**The schema is a contract, not a suggestion.** The same table the form is drawn from is what the
server validates against: a key the schema does not declare is dropped, a select accepts only its
own options, numbers are clamped to their range, text is capped, and a missing required field
rejects the report and **names itself** back to the officer. The greyed-out submit button is a
courtesy; the schema is the rule.

**The answers are written into the record, not just stored beside it.** The filled-in fields are
rendered as a readable block at the top of the report body, so the person's record card, the case
file and the Discord webhook all show them without knowing anything about schemas. A report whose
answers only live in a field nobody renders is a report nobody reads. The structured copy is kept
alongside, for anything that wants the answers as data.

Required fields are named while you fill the form — "Still required: Plate, Make / model" — rather
than leaving you to guess why Submit is grey.

> ⚠️ **Config change:** `configs/cfg-evidence-sh.lua` — `Evidence.reportTypes` entries may now carry
> a `fields` table, and two new types ship (`dui`, `chp180`). An existing config keeps working
> untouched: a type without `fields` is a plain narrative report, exactly as before.

Not tested in-game. Lua syntax-checked, `cd web && npm run build` green, the form driven in the
browser preview (fields appear per type, required fields named, submit gated, switching type clears
the answers rather than carrying a BAC reading into a tow sheet), and the validation exercised
offline against the real shipped schema: an undeclared key is dropped, an invalid select refused by
name, required fields named one at a time, numbers clamped both ways, an unticked box stored as
absent rather than as "false", a plain type storing nothing, and the rendered block checked
line by line — including a multi-line answer indented under its label.


## [3.5.1] – 2026-08-30 — The car reads the street

### Added

#### ALPR — the plate reader

A patrol car now reads the plates around it. Two cameras, **FRONT** and **REAR**, each showing the
last plate it saw, and a banner when one of them is wanted.

![ALPR — the car reads the street](/img/changelog/alpr.svg)

```
/alpr        arm / disarm the reader
/alpr clear  release a held hit and keep reading
```

**Three things count as a hit**, each switchable in `configs/cfg-alpr-sh.lua`: the plate is
**reported stolen**, there is an **active plate BOLO**, or the **registered owner has a warrant**.
The BOLO match uses the same matcher a `10-28` uses, so the reader and a manual plate query can
never disagree about the same car.

**A clean plate tells you nothing.** No owner, no address, no record — the reply for a plate that
is not wanted contains the plate and nothing else. An ALPR is not a way to run every car on the
street through the DMV, and the wire will not carry that even if someone asks it to.

**The client decides nothing.** It says "I can see plate XYZ123"; whether that is a hit, and what
the hit says, is worked out on the server. The **job is re-checked there on every plate**, so a
modified client cannot read plates for a job it does not hold, and cannot invent a hit to justify a
stop. Requests are rate-limited per player, because a scan loop is a request loop.

**Hits are logged, misses are not.** A hit goes to the admin log (`/bblog`) with the plate, the
camera, the reason and the unit. A clean read does not — logging those would build a movement log
of everyone who ever drove past a patrol car, which is a different thing than police work.

**Idle, it costs a timer tick.** Disarmed, out of a vehicle, or not LEO: the loop sleeps for a full
second and enumerates nothing. Going off duty stands an armed reader down rather than leaving it
armed and silent.

The reader is remote-configurable (range, cone, sweep interval, hold-on-hit, tone) and appears in
the dashboard's config editor under **Modules → ALPR**.

> ⚠️ **Config change:** new file `configs/cfg-alpr-sh.lua`, and `configs/cfg-features-sh.lua` gained
> the `alpr` key. Existing configs keep working — a missing feature key counts as on, and the reader
> does nothing until an officer types `/alpr`.

Not tested in-game. Lua syntax-checked, `cd web && npm run build` green, the readout driven in the
browser preview (clean, hit, dangerous hit, disarm, re-arm), and the server logic exercised offline:
each hit kind fires, a registered owner **without** a warrant is not a hit, plate normalisation,
a civilian and an unknown source get nothing at all, a miss carries no owner, the rate limiter drops
a burst, and a clean read is not logged.


## [3.5.0] – 2026-08-30 — The terminals grow up, and the server explains itself

### Changed

#### LASD MDC — full redesign with real dispatch procedure

![LASD MDC layout](/img/changelog/lasd-mdc-layout.svg)

The LASD PCMS terminal has been rebuilt from the ground up after the new LASD-MDC design
(Figma) — and it no longer just looks different, it now *works* like the real thing.

**The screen.** Teal status keys across the top (the active status glows orange, an open
menu turns its key white), yellow section headers, and a black message window in the
middle. On the left: **DISPATCH INDEX**, a compact **DISPATCH DETAIL** card, **MESSAGE
INDEX**, and an **ACTIVE BOLO** bar. On the right: the colored function keys (VEH, WANT,
DMV, INQUIRIES, CALL & LOG, OTHER, SEND). Below the message window sits the blue command
bar, the unit's callsign, the **CLEARANCE FORM / BACK / HANDLE** keys and the MSG-UNREAD
counter (green at zero, red when something is waiting).

**Two indexes, two origins.** Incidents now carry their origin: **(D)** for calls created
by dispatch (911/311) — they live in the DISPATCH INDEX — and **(U)** for calls created
by a unit, which appear in the MESSAGE INDEX. No more mixing.

**HANDLE and BACK.** The first unit to press HANDLE becomes the incident's *primary* —
and only the first: the server rejects every later attempt. BACK stays locked until a
primary exists; from then on every further responding unit attaches with it. A unit that
creates an incident is automatically its primary.

**Clearing an incident.** Any attached unit *except* the primary can simply go 10-98.
The primary must open the **CLEARANCE FORM** first and dispose the call properly (GOA,
ARR, ADV, …) — exactly like the LAPD MDT's dispo mask.

**ACK.** Does one thing and one thing only: it clears the unread-message counter.

**The blue bar.** In the NEW MESSAGE state it takes **commands** — `BOLOS` (active BOLO
table with ADD ENTRY), `UR` (unit roster) and `US` (unit status board). With an incident
selected it takes **call notes** that land in the incident's activity log (and in the
shared audit log for bridged calls).

**Pop-up menus.** STATUS TEXT opens the status menu (10-97, 10-98, CODE 6, STATION,
UNAVAIL); OBS opens the observation menu, which creates a CODE 6 / TRAFFIC / PED STOP
incident at your position or requests Fire/EMS or the coroner.

**The classic PCMS is still there.** The old amber/teal terminal was not thrown away — it is kept
as a **skin**. Under **OTHER FUNCTIONS → TERMINAL SKIN** every deputy picks **MDC** (the new
design, default) or **CLASSIC PCMS**, and the choice is remembered per player. Both skins are the
same terminal underneath: the same incidents, the same units, the same queries and the same
server rules — only the screen differs, so a department can run both side by side.

Not tested in-game yet — Lua syntax-checked, NUI verified in the browser preview against
mocked data (all button-gating states, both indexes, commands, pop-ups, unread counter, and
switching between both skins in either direction).

### Added

#### The weapon crosshair is a config option now

LACORE has always hidden GTA's weapon reticle — sniper scopes excepted — and there was no way to
get it back short of editing `client/world-cl.lua`. `configs/cfg-hud-sh.lua` now has a
**`crosshair`** switch:

```lua
HudCfg = {
    crosshair = false,   -- default: reticle hidden, exactly as before
    -- crosshair = true, -- reticle visible for every weapon
}
```

![Weapon crosshair on and off](/img/changelog/hud-crosshair-toggle.svg)

Sniper scopes keep their reticle either way. The option is deliberately **not** governed by
`HudCfg.enabled`: the master switch only turns off what LACORE draws, it never changes what GTA
draws — a server running its own HUD still gets to decide about the crosshair separately. The
setting is read live, so the remote config (`hud.crosshair`) can flip it without a restart.

While in there, the loop that does the hiding idles at 4 Hz whenever the player is unarmed or the
crosshair is switched on, instead of running every single frame.

> ⚠️ **Config change:** `configs/cfg-hud-sh.lua` gained the `crosshair` key. Existing config files
> keep working untouched — a missing key counts as `false`, which is the previous behaviour.

Not tested in-game yet — Lua syntax-checked only.

#### LACORE looks around before it complains

A new module, `modules/autoconfig/detect-sv.lua`, works out what is actually running on your
server: which framework, which resources are up, and which of them do the same job as a LACORE
feature. It is the groundwork for the self-configuring setup report — and on its own it already
answers the question that starts most support tickets.

![Environment detection — one answer, two consumers](/img/changelog/detect-environment.svg)

Ten seconds after start, once late-starting resources have settled, the console says one line:

```
[lacore:detect] Framework: esx · 42 resources started (31 third-party)
```

And if something overlaps, a second one — naming it:

```
[lacore:detect] 3 resource(s) overlap a LACORE feature: ps-dispatch (dispatch system),
                lb-phone (phone resource), qb-hud (HUD resource)
```

That is a statement, not an accusation. Running your own dispatch next to LACORE's is a perfectly
normal setup; the line only tells you the overlap exists, so that "why do I get two 911 calls" is
a two-second answer instead of an evening.

Matching survives renaming, because everybody renames: `ps-dispatch`, `cd_dispatch` and
`core_dispatch` are all recognised. Short words are matched on whole name parts rather than
anywhere in the string, so `esx_arcade` is not reported as a CAD system and `decades_clothing` is
not reported at all.

**The framework is not detected twice.** `modules/bridge` already works that out — export-based,
and it corrects itself when the framework starts *after* LACORE. The new module reads that answer
instead of forming its own, because two detections would disagree exactly on the servers where it
matters.

**And what it cannot do is written down.** FiveM's Lua runtime is sandboxed: a resource sees
resource names, states and manifest versions. There is no walk through the FxServer folder tree —
not left out, simply not offered by the platform. That limit is in the module's own header, so the
next person to ask for it finds the answer where they are looking.

Not tested in-game yet. Lua syntax-checked, and the matching rules verified against a mocked
resource list (renamed resources recognised, look-alike names rejected, stopped and built-in
resources ignored).

#### The setup report

Support for LACORE has always started the same way: *what does your server actually look like?*
Three messages back and forth before the real question can even be asked. A new module,
`modules/security/merz-sv.lua`, answers it up front — the framework, the started third-party
resources with their versions, and which of them overlap a LACORE feature.

![The setup report — sent when it changes, not on a clock](/img/changelog/setup-report-flow.svg)

**It is sent when it changes, not on a clock.** A setup barely moves: the same framework and the
same resources, week after week. So the report is fingerprinted and only sent when the fingerprint
actually moves, plus one forced refresh every 24 hours so a record cannot quietly go stale. On a
stable server that is about one report a day, and it rides the existing telemetry cadence — the
resource does not gain a second clock.

**It cannot grow.** The report is written onto the server's own row in the dashboard, not into a
collection of its own. One server, one row, one current answer — a server that reshuffles its
resources every hour still occupies exactly as much space as one that never changes.

**What it does not send** is the part worth reading. No player identifiers, names, chat, positions
or actions. No database contents. No file contents — not a config, not a script, not one line of
either. No convars (those belong to the existing registration, which has an explicit allow-list).
And not the player count: telemetry already reports that every heartbeat, and one number should
have one sender.

A resource listing is names, states and the `version` field of a manifest — the same information a
player's own console shows them when they connect. Nothing in this module opens a file, and it
could not if it tried: FiveM's Lua runtime is sandboxed, which is a fact about the platform rather
than a promise about our restraint.

**Caps say so.** The listing stops at 400 resources. If yours runs more, the count of what was left
out travels with the report and the console says it out loud:

```
[lacore:setup] Setup report sent — 37 resource(s) over the 400-entry cap were not listed.
```

Every field of both reports — this one and the server registration that came before it — is now
listed in full on its own documentation page, **Telemetry & Setup Report**. A collector you cannot
audit is a collector you should not trust, so the page lists the fields rather than describing them.

> ⚠️ **Dashboard change:** the `lacore_servers` collection gained two fields, `setupJson` and
> `setupAt`. Re-import `landing/pocketbase/pocketbase-servers-collection.json` before the reports
> can be stored — until then the ingest route accepts them and PocketBase drops the two fields.

Not tested against the live service. Lua syntax-checked, the JavaScript side syntax-checked and the
web app built; the send behaviour verified offline against stubbed natives (posts once at start,
stays silent while nothing changes, posts again when a resource appears, and the payload carries no
identifiers and no player count).

#### The setup review — LACORE tells you what it would change

Knowing what is running is only half of it. `modules/autoconfig/` now turns that into a short list
of settings that would probably suit your server better, with a reason on every line. Run
`/lacore autoconfig` any time; it also prints itself once at start, but only when it actually has
something to say.

![The setup review — it tells you, it does not do it](/img/changelog/autoconfig-review.svg)

```
[lacore:autoconfig] Setup review — framework: esx
Nothing below has been changed. These are suggestions.

Settings that may suit this server better (2):
  features.cad.dispatch = false
     ps-dispatch already runs a dispatch console — two of them means every call arrives twice.
  features.phone = false
     lb-phone is running — LACORE's own phone would be a second one on the same key.

Worth knowing — no setting fixes these (1):
  Second anticheat detected: FiveGuard
     Two anticheats can punish the same player twice for one event. Decide which one owns bans.
```

**It changes nothing.** Not a config file, not a remote value, not one of its own suggestions. A
resource that silently reconfigures somebody's server is the fastest way to lose them, so applying
a line stays a human decision — you change it in `configs/` and restart, or set it in the dashboard.

**Every line says why, and names the resource that caused it.** A suggestion that only says
*recommended* is one nobody acts on, because acting on it would mean trusting it blindly. Naming
`ps-dispatch` lets you check it in five seconds and disagree in ten.

**A suggestion you are already following is not a suggestion.** The current value of every setting
is read before the list is built, so a well-configured server gets a short list or none at all —
not a wall of things it is already doing.

**What it is allowed to suggest is bounded, by construction.** Every key must exist in the
remote-config allowlist — the same typed list the dashboard's config editor is bound by — must
match that key's declared type, and must not be one of the sensitive ones (upload URLs, Discord
role ids). A rule cannot invent a setting or reach past the allowlist, because those are dropped by
the gate rather than left to the rules being careful.

**And that gate is what makes the AI hook safe to leave open.** `LacoreAutoConfigAdvisor` is an
undefined function today — a documented seam for the local model that is meant to sit there later.
Whatever it returns goes through exactly the same gate as a hand-written rule, and it never wins
against one. An advisor can therefore be wrong, but it cannot be dangerous: the worst it can do is
propose an allowlisted, correctly-typed, non-sensitive setting that you then decline.

The suggestions ride along on the setup report, so support can start from what your server actually
looks like instead of asking. The reasons stay in your console — those are for a person reading
them, not for a database row.

Not tested in-game. Lua syntax-checked and the rules exercised offline against a mocked environment:
each rule fires on the right resource, a setting already in use is dropped, and the gate refuses an
unknown key, a sensitive key, a wrongly-typed value and an advisor trying to overwrite a rule — with
a deliberately broken advisor confirmed not to take the report down with it.

#### An officer can finally see their own numbers

**My Activity** — a new view in the LAPD MDT's rail and on the Agency MDT's function bar. Arrests,
citations, warnings, calls closed, reports, evidence, and every charge you have filed broken down
into Infraction, Misdemeanor and Felony.

![My Activity — your own numbers, in your own terminal](/img/changelog/officer-stats.svg)

It needs no permission, because it is about you: the server works out whose file to send from the
connection asking, so the view cannot be pointed at anybody else. Reading *someone else's* file is
still the Supervisor Panel's job — and discipline entries stay there, where they belong.

**Warnings are a thing now.** Cite / Charge has a third button next to Citation and Arrest:
**Warning** documents the stop and the charges without imposing anything — no fine, no jail, no
booking. Until now, letting somebody off left either nothing behind or a free-text note that no
statistic could count, which made a lenient officer look like an inactive one.

**Charges carry their class.** Twenty parking tickets and twenty armed robberies used to be the same
"twenty charges". The Infraction / Misdemeanor / Felony split fixes that — and a charge keeps the
class it had **when it was issued**, because rewriting your penal code should change what happens
next, not re-judge what already happened. Records written before this update are read from today's
penal code instead, and a code that no longer exists there is counted as **Unclassified** rather
than dropped: dropping it would make an old file look cleaner than it was.

**Calls closed** counts the dispatch incidents you resolved, from the call audit — and counts
**distinct incidents**, so resolving the same call twice is one call closed, not two.

All of it keeps the existing design: the numbers are **counted by a scan** of what you actually
authored, never a running total. A total drifts the first time a record is deleted or a save is
lost; a scan can always be re-run. And the line under the figures still says **"counted from
&lt;date&gt;"** — activity from before your personnel file existed carries no author to attribute,
so it is not guessed at.

The Supervisor Panel's Activity tab gained the same figures. A supervisor showing fewer numbers than
the person they supervise would be an odd file to hold.

Not tested in-game. Lua syntax-checked, `cd web && npm run build` green, and the counting logic
exercised offline: the class breakdown, warnings, unattributable records, a call resolved twice
counting once, a second scan producing the same answer, and an officer with no activity getting
zeros rather than blanks. The view itself was driven in the browser preview against mocked data in
both terminals — populated, empty ("no personnel file yet"), and the class bar's proportions.

#### Six more agencies get their own terminal

The Agency MDT — the terminal every LEO department except LAPD and LASD opens — went from seven
colour skins to **thirteen**. New: **DOJ / BOI**, **State Parks**, **Fish & Wildlife**,
**Marshals**, **Cal Fire** and **Coroner**.

![Agency MDT — thirteen skins, one terminal](/img/changelog/agency-skins.svg)

A skin is a **palette and nothing else**: same markup, same data, same server rules, ten CSS
variables. Two departments can run different skins of the same terminal side by side, and the choice
is remembered per player.

The rule that keeps thirteen skins apart is that **no two share an accent colour** — the accent
fills the active function key, so it is what the eye actually lands on. That is why the three
green-ish agencies do not all end up green: DOJ takes gold on dark green, State Parks olive on tan,
Fish & Wildlife deep-water teal. Cal Fire is ember orange rather than a second red, and Marshals
bronze rather than a second gold.

**Two contrast failures fixed on the way through.** Every skin's text on a filled accent key was
measured, not eyeballed: Ranger Green was running white text on its bright green at **3.49:1** and
the new Coroner skin came out at 4.11:1 — both under the 4.5:1 threshold. Both now carry an explicit
`--a-on-accent`, and all thirteen clear it (4.65:1 to 16.83:1).

Skin names are locale strings now, including the seven that already existed — they were hardcoded
English in the component.

Not tested in-game. `cd web && npm run build` green; all thirteen skins driven in the browser
preview, the six new ones screenshotted, and the contrast ratio of every skin's active function key
computed against the rendered page rather than the stylesheet.

#### A whole city in one line

Moving LACORE off Los Angeles used to mean editing two hundred lines of zone mapping by hand — and
there was no way at all to change what a street is called. Both are now a **preset**:

```lua
-- configs/cfg-regions-sh.lua
preset = "new-york",
```

![A whole city in one line](/img/changelog/region-presets.svg)

That swaps the regions, the GTA-zone → region map **and** the street names in one go. Shipped:
`los-angeles` (the map LACORE already had, plus a starter set of LA street names), `san-andreas`
(vanilla — every zone keeps Rockstar's own name) and `new-york` (the five boroughs, all 88 zones
mapped). They are plain JSON in `data/regionpresets/`, in cleartext: copy one, edit it, and it is
your city.

**Leaving the preset empty changes nothing at all.** No file is read and the config is used exactly
as before — this is opt-in, and switching back is deleting one line.

**Street renaming is new, and it is a display layer.** LACORE asked the game for a street name in
**29 places across 12 files**, each one directly. They now all go through a single
`LacoreStreetName()`, so a preset reaches the HUD, dispatch calls, the MDT, the air unit and the
phone at once. What it does *not* touch: the GTA street hashes, the pause-map labels, or anything in
the world. A street LACORE calls "Broadway" is still Vespucci Blvd to the game — and a street you
did not list keeps its name.

**A broken preset cannot break dispatch.** A file that is missing, misnamed or not valid JSON is
skipped with a console message and your own config is used. Malformed sections inside an otherwise
good preset are skipped individually.

**One real bug fell out of the migration.** In `client/vehicle-cl.lua`, the Liberty City branch
looked up the cross street by passing *coordinates* to the hash-key native, which cannot work — so
every Liberty City address came back with an empty cross street. Both halves now come from one
`GetStreetNameAtCoord` call, the same as everywhere else.

> ⚠️ **Config change:** `configs/cfg-regions-sh.lua` gained the `preset` key. Existing config files
> keep working untouched — a missing key means no preset, which is the previous behaviour.
>
> **Also note:** a server that has already run keeps `data/map_config.json` and
> `data/zone_regions.json`, and **those win over the preset**. That is the usual reason a preset
> looks like it did nothing. Delete both, or edit live in the dispatch console's Zone Editor.

Not tested in-game. Lua syntax-checked across all 14 touched files, and the loader exercised
offline against the real shipped preset files: no preset leaves the config untouched, each of the
three presets applies its regions, zones and renames, an unlisted street keeps its name, an unknown
hash still returns an empty string, and both a missing preset and a preset name containing a path
are refused without disturbing the local config.


## [3.4.9.9] – 2026-08-22 — Everything that can be an item is an item

### Added

#### LACORE features as inventory items

A phone you carry. An MDT tablet that belongs to your department, not to every department. An ID
card in your pocket, a breathalyser in the trunk, a lead for the dog. LACORE features can now be
**inventory items** — with **ox_inventory**, **qb-inventory** (QBCore / QBox) or **ESX**.

It works in both directions. Use the item in your inventory and the feature opens — the phone comes
up, the MDT boots, the ID card is shown. And a feature can be told it *needs* its item: without the
tablet in your pocket, `/mdt` does nothing. Which item that is depends on who you are — the `mdt`
entry carries a per-department list, so an LAPD unit needs `mdt_lapd` and a deputy needs
`mdt_lasd`, out of one config and one command.

Ownership is decided on the **server**, never on the client, so a modified client cannot talk its
way into a terminal it has no tablet for. Closing is never gated: an already-open phone, MDT or
camera tool always toggles shut, so nobody is ever stuck in a UI because they dropped something.

Shipped feature keys: `phone`, `mdt` (per department), `idcard`, `fingerprint`, `breathalyser`,
`drugtest`, `fieldcamera`, `k9`. The ID card also gained the `/myid` command it never had — until
now it only existed in the civilian radial, which an item cannot press.

LACORE does not create items; it only asks your inventory about them. For ox_inventory, the server
console prints a ready-made `data/items.lua` snippet built from exactly your config:

```
lacoreitems
```

On a server with **no** inventory at all nothing changes — every feature stays on its command, and
gates always pass rather than locking people out of a UI they have no way to unlock.

Other resources get the same layer through the [Developer API](https://tabysi.github.io/lacore-docs/developer-api):
`GetInventory()`, `HasFeatureItem(src, key)`, `GetFeatureItem(src, key)`, `UseFeature(src, key)` and
`GetFeatureItems()` on the server, `UseFeature(key)` on the client.

⚠️ **New config file:** `configs/cfg-items-sh.lua` — the item names, which command each one runs, and
whether it is required. **Nothing is required by default**, so dropping this update onto a running
server changes no behaviour until you switch a feature's `require` on. The layer as a whole is gated
by `Features.items` in `configs/cfg-features-sh.lua`.

#### The permission system is configurable again

Every LACORE right — ban, kick, the owner commands, the anticheat whitelist, personnel writes —
runs through one helper, `HasPermission`. What that helper says used to be decided by a block at
the top of `modules/security/permissions-sv.lua` under a heading that called itself configurable.
That module is obfuscated in the escrow build, so on a real install it was the one thing you could
not configure. It lives in a config file now, in plain text, like everything else.

**`/lacoreperms`** is the new starting point: run it and it prints every permission LACORE knows,
whether you hold it, which group ships with it, and the `add_ace` line to grant it. The keys only
ever existed scattered across fourteen modules, so until now an ungranted permission and a bug
looked exactly the same from the outside.

The Discord → ACE bridge got the same treatment. `roleGroups` decides which Discord flag becomes
which ACE group, `groups` decides what each group holds, and `bypass` decides whether a flag skips
the ACE check at all. That last one is worth a look: with `bypass.staff` on — which is how it has
always behaved, and still ships — the Staff role passes *every* check, the owner commands and the
config restore included. Set it to `false` and Staff is held to the rights its group actually has.

Also fixed along the way:

- **A lost role now takes its rights with it.** Revoking someone's Staff role in Discord only
  reached ACE when they disconnected, so the rights outlived the role for the rest of the session.
  The bridge re-checks every player instead of only the ungranted ones.
- **Recycled server slots no longer inherit.** Principals were tracked by server id alone. Those ids
  are reused after a disconnect, so the next player on that slot could pick up their predecessor's
  entry — or leave it behind uncleaned. Each entry now remembers whose identifier it was.
- **`lacore.`-prefixed keys are no longer prefixed twice.** `lacore.ac.bypass` was being looked up as
  `lacore.lacore.ac.bypass` and only ever matched through the bare-name fallback.
- **`HasPermission(src)` with no key returns false.** It used to return `true` for anyone with a
  Staff flag, which would have turned a forgotten argument into a silent "may do anything".
- **`group.lacore_mod` is reachable.** It was given rights but nothing ever put a player in it.
- **Bare ACE names can be switched off.** LACORE accepts `admin` as well as `lacore.admin`, which is
  how it has always worked and stays on by default — but a generic word can collide with another
  resource that uses the same one. `acceptBareAce = false` once your `server.cfg` uses the prefixed
  names.

Nothing here takes a right away from a server that updates without touching the new file: the old
ACE names, the bare names and the Staff bypass all still answer the way they did.

⚠️ **New config file:** `configs/cfg-permissions-sv.lua` — the Discord→ACE bridge, the groups and
their rights, and the blanket bypass. Ships with exactly the behaviour that was hard-coded before,
so dropping this update onto a running server changes nothing until you edit it.

### Fixed

- **The HUD location line named the wrong district for anyone who never opened a terminal.** The
  zone → region overrides drawn in the dispatch console's Zone Editor were only requested when a
  terminal or the dispatch console opened. Every other player kept an empty override table, so the
  location readout printed the configured default region — "Los Angeles" — no matter which district
  they were standing in, and only started telling the truth on a client that had run
  `/dispatch open` at least once. The overrides and the drawn polygons are now pulled once on join,
  for every player, and pushed again once the server has finished loading them so a resource restart
  cannot leave clients holding an empty map.

- **Changing the classic spawn point in the config actually moves the spawn now.** The
  auto-spawn and the map-picker fallback in `client/events-cl.lua` had the power-plant
  coordinates hardcoded, so editing `SpawnCfg.fallback` in `configs/cfg-spawns-sh.lua`
  changed nothing — players kept spawning at the power plant whenever the spawn selector
  was disabled, timed out or declined to open. Both paths now read `SpawnCfg.fallback`
  (and apply its heading); the hardcoded point remains only as a last resort for a
  broken or removed config.

- **New calls turn the duty-status plate into an amber UNREAD badge.** An unread incoming call
  used to draw a wide black "Unread MDT Calls" bar; it now takes over the bottom-right status
  plate itself — same bordered style, amber, reading UNREAD until a terminal is opened. Two call
  types never raised the cue at all and now do: backup requests (sent as "Requesting LEO", which
  the old job-name comparison could never match) and Shot Spotter activations for LEO units.
  Panic Button and Crime Broadcast keep their own alert banners.

- **The phone no longer hides behind other resources' UI.** NUI frames of different resources
  stack by resource start order, so a radio or radar HUD started after LACORE painted over the
  phone. While the phone is open, LACORE now lifts its frame above the others (`SET_NUI_ZINDEX`)
  and drops it back on close — so it never parks on top of another script's focused menu. On
  clients older than late 2024 the native doesn't exist and behaviour is unchanged.

- **The backup/EMS/Tow details prompt now lives inside the terminal — and ESC actually cancels.**
  Requesting backup, Fire/EMS, a coroner, a tow truck or a crime broadcast used to open the game's
  native on-screen keyboard for the optional details. That keyboard always draws UNDER the NUI, so
  half of it hid behind the MDT window — and cancelling it with ESC still created the incident,
  just with empty details. The prompt is now the terminal's own dialog, on top of everything:
  type and press ENTER (or Send) to raise the call, press ESC (or Cancel) and nothing is sent.
  Works the same in every terminal skin; the in-car dashboard screen, which has no keyboard,
  keeps sending immediately without a prompt.

- **The bar playerlist could silently hide players off the right screen edge — and now reads
  left-to-right.** The bar style pages 27 players at a time, but its cards flowed column-first with
  a fixed minimum width — on narrower displays the ninth column no longer fit next to the server
  panel and was pushed past the screen edge, so a full page showed only 24 of its 27 players (with
  28 online: 24 on page one, three invisible, one on page two). The cards now flow row-first and
  wrap: ids read left to right (1‥8, then 9‥16 on the next line) the way a scoreboard is scanned,
  and a page that doesn't fit gets another row instead of an invisible column — every player on the
  page is always on screen.

- **Per-server config editing in the dashboard actually works now.** The scope picker's server
  pills were never clickable — for anyone. The per-server override layer identified a server by
  its Cfx `sv_licenseKey`, but FiveM redacts that convar from scripts, so every server reported
  an empty key and the dashboard marked every one of them as "has not reported its identity yet".
  "All servers" was the only editable scope any account ever had. A server's identity is now its
  **dashboard license key** — which every server already sends and the backend already verifies —
  so each server becomes individually editable on its next heartbeat, with no resource update
  needed. Since the key is the identity, give each server its own key rather than sharing one.

- **The dashboard config editor protects unsaved work.** The save bar counts unsaved changes,
  and the Save button names the scope it writes to (`SAVE → ALL SERVERS` / `SAVE → <server>`)
  and is disabled while there is nothing to save — so it is always clear whether there is
  anything to save and *where* it would land. Switching the server pill, navigating away or
  closing the tab with unsaved edits now asks first instead of silently discarding them. Saves
  are also concurrency-checked: with team access, two people editing the same scope used to
  last-writer-win silently — the later save is now refused with "someone else saved this config
  in the meantime" and a one-click reload of their version. Revision history entries additionally
  record who overwrote them.

- **The Data lists editor got the same protections.** Unsaved rows now show as "● unsaved
  changes", the save button names its target (`SAVE → <server>`) and is disabled while nothing
  changed, and switching the server pill, opening another list, navigating away or closing the
  tab with unsaved edits asks first. Saving carries the stamp the rows were loaded on, so a
  teammate's save in between is refused with a one-click reload of their rows instead of being
  silently overwritten — RESET included.

- **Support ticket drafts survive.** The ticket message is the longest thing anyone types into
  the dashboard, and a stray click used to throw it away. It is now kept as a local draft while
  you type: come back later — including after closing the tab — and the form restores it with a
  "draft restored" note and a discard link. Opening the ticket clears the draft. Stored only in
  your own browser.

- **The admin server status wall no longer hangs on "Loading…".** The wall keyed its tiles on
  the Cfx server key, falling back to the IP — but real rows carry an empty server key (FiveM
  redacts it) and one customer's boxes can share an IP, so two tiles collided on the same key
  and the whole wall died mid-render, stuck on "Loading…" forever. Tiles are now keyed on the
  server row's own id, which is unique by construction.

## [3.4.9.8] – 2026-08-21 — A framework that starts late is still a framework

### Fixed

#### LACORE before ESX in the load order broke half the server

The framework bridge decided once, at resource start, whether an ESX/QBCore/QBox
server was underneath it — by asking whether `es_extended` (or `qbx_core`, or `qb-core`) had
already started. Put `ensure lacore` above the framework in `server.cfg` and the answer was no, and
it stayed no for the rest of the server's uptime.

The consequences did not look like a load-order problem, which is what made this expensive. A core
that believes it is standalone runs its entity-spam guard, so vehicles and props the framework
spawned server-side were deleted a moment after appearing. It arms the `esx:*` / `qb-*` honeypots,
which exist to catch injected scripts on a standalone server and which ban on sight — so ordinary
framework events became bans. It takes character spawning away from the framework, so players got
LACORE's spawn selector and LACORE's coordinates. And it enforces the member-only vehicle
restriction, cutting the engine on job cars. Four unrelated-looking faults, no error in the console,
one cause.

The detection is now corrected when the framework turns up late: a framework resource starting
re-runs it, and everything reading the result does so at call time, so the entity guard, the spawn
handover and the vehicle restriction all fall into line the moment it fires. The console says what
happened and names the fix:

```
[bridge] es_extended started after LACORE — framework re-detected: esx
[bridge] Put `ensure es_extended` BEFORE lacore in server.cfg so this is right from the start.
```

The honeypots are the exception, because FiveM cannot unregister an event handler once it exists.
Those now re-check whether the event belongs to a running framework at the moment they fire rather
than only when they were armed, so ones armed during the brief no-framework window go quiet instead
of banning for the rest of the uptime.

The client half made the same one-shot guess a second after starting and now corrects it the same
way.

The load order is still worth getting right — `ensure lacore` belongs after the framework — but
getting it wrong is no longer a broken server.

## [3.4.9.7] – 2026-08-21 — Two servers, two rows in the portal

### Fixed

#### The portal showed one server when the account had two

An account with two licensed servers could end up seeing only one of them under **My servers** — and
which one it was changed by itself, because the two were taking turns overwriting the same row.

Every server reports itself to the web service on start and on every heartbeat, and that report is
an upsert: find this server's row, refresh it, or create it. What identified a row was the Cfx
server key (`sv_licenseKey`) and, when that was not readable, the public IP. Neither is unique to a
server. A Cfx key is issued per machine, so two servers on the same box legitimately share one — and
sharing the box, they share the public IP as well. Both reports matched the same row, so the second
server never got one of its own, and each heartbeat replaced the other server's hostname, player
count and version with its own.

The LACORE license key is now part of that identity. It is the one value that genuinely differs
between two servers of the same account, because it is generated per server in the dashboard. A
server that had already registered before its key was set adopts its existing row rather than
leaving an orphan behind, so nothing has to be cleaned up by hand: after the update each server
claims or creates its own row on its next heartbeat, and both appear in the portal.

This is a web-service fix. The resource itself is unchanged — servers already send everything the
fix needs, so there is nothing to install and no config to touch. Two servers sharing a single
license key still share a row, as they should: one key is one server.

## [3.4.9.6] – 2026-08-20 — The 90s CAD ships on its own

### Added

#### The 9100-T as a standalone product

The 9100-T Mobile Data Terminal — the 1990s CRT terminal with the photo-real chassis, the clickable
keys and the keyboard clack — can now be shipped as a resource of its own. `node Products/build-90s.mjs`
assembles `Products/lacore-90s-cad` (and a zip) out of the core without touching the core.

What ships is one terminal and the CAD backend behind it: active calls, unit status, self-assign,
dispositions, person and vehicle lookups, charges, citations, warrants and BOLOs. Everything else
stays out — the LAPD PremierOne MDT, the LASD PCMS, the Agency MDT, the EMS/Fire CAD, the
Pennsylvania CAD, the dispatch console and every non-CAD module.

Unlike the MDT product, this one **rebuilds the NUI** instead of copying it. The core bundles every
terminal into a single JavaScript file, so copying `nui/dist` would have shipped all of them; the
build generates its own entry point that mounts the 9100-T alone. The other terminals are therefore
not in the shipped bundle either — 350 kB instead of 1.2 MB.

So that nothing else can open inside the product, `/mdt` there always opens the 9100-T regardless of
department, and `/dispatch` reports that there is no console. Both commands are re-registered in a
product-only file rather than edited out of the core: `modules/mdt/mdt-nui-cl.lua` stays byte for byte
identical to the core, and survives every core update.

## [3.4.9.5] – 2026-08-19 — The phone and `/hangup` agree with each other

### Fixed

#### `/hangup` left the phone stuck on the call screen

Two ways to end an emergency call, and only one of them told the phone. Hanging up with `/hangup`
sends the server a hang-up — which the server does not acknowledge back to the caller, because the
chat-based caller flow never needed it. The call really did end, the dispatcher really did see the
caller drop off, but the phone kept showing *Calling…* with the timer running for a call that no
longer existed. The only way out was to place another call.

It also failed the other way round: hanging up **on the phone** left the caller flow believing a call
was still active, so the next `/911` was refused with "you are already in a call".

Both sides now share one local hang-up signal, so whichever way you end the call, the other side
clears with it — the screen closes, and the next `/911` goes through.

#### Dialling 911 said everything twice

A call placed on the keypad was announced twice at once: the phone's own call screen, and the chat
notifications the `/911` flow has always shown ("you are in the queue", "connected to Operator X").
The same information, in two places, for one call.

The caller notifications now stay quiet for the two moments the phone already puts on screen. The
connect tone still plays, and everything the phone has **no** way to show is still said — being put
on hold, being requeued, the call ending, and the incident number when no dispatcher was online.
Calls placed with `/911` in chat are unchanged.

## [3.4.9.4] – 2026-08-19 — A config restore can no longer break your configs

### Fixed

#### `/lacoreconfig restore` wrote unreadable files over every config

Reported from a live server: after `/lacoreconfig restore` the resource came back with

```
Error parsing script @lacore/configs/config.lua: syntax error near '<>'
```

— once for **every** config file, followed by an empty penal code, no agencies and a database that
looked unreachable. Nothing was wrong with the backup; the restore had written binary into the files.

The restore is a three-way merge: your backed-up config, the pristine default it was edited from,
and the *current* default from `configs/.defaults/`. That last one is the problem. `escrow_ignore`
listed `configs/*.lua`, and that pattern does not reach into a subfolder — so on an escrowed build
the `.defaults` copies were encrypted, and reading one back handed the merge a block of cipher text
instead of Lua. The merge dutifully compared your config against noise, found every line in conflict,
kept "the newer default" as designed — and that default was the cipher text. It went straight to
disk, all 29 files, with the restore reporting success.

Three things changed, each of which alone would have prevented it:

- **`configs/.defaults/*.lua` is now escrow-ignored**, so the baselines stay readable and the merge
  works on an escrowed build the way it always did on a local one.
- **A baseline that isn't readable text is treated as missing.** Instead of merging against it, the
  restore falls back to writing your backed-up file whole — the outcome you wanted anyway.
- **Nothing is written that does not compile.** Every merged result goes through Lua's own parser
  first. A file that fails is left exactly as it is on disk and named in the output, so a bad merge
  can affect one file and never the whole server.

#### `/lacoreconfig undo` — the rollback that existed but had no command

`restore` has always snapshotted your on-disk configs first, precisely so a bad restore could be
reversed. There was no way to *use* that snapshot. There is now:

```
/lacoreconfig undo
```

It writes the files back exactly as they were before the last restore, and the restore itself now
points at it when it finishes. If you are sitting on configs a restore already damaged, this is the
way back — run it, then restart the resource.

#### Backups were all stamped "vadamant"

The version recorded with a backup was read with a pattern that matched `fx_version 'adamant'` before
it ever reached the real `version` line, so `status` and the restore message showed `vadamant` for
every backup no matter when it was taken — and you could not tell an old backup from a new one. The
lookup is anchored to the start of a line now.

## [3.4.9.3] – 2026-08-19 — 911 works from the keypad

### Fixed

#### Dialling 911 or 311 on the phone said "call failed"

Reported in support: *"the retro phone isn't allowing calls to go through, ie 911, 311 or anything —
it just keeps saying an error on the phone."*

Dialling a number on the phone asks the server which player owns it. Nobody owns 911, so the answer
was "no such number" and the phone played its failure tone — every time, for everyone. The modern
phone hid the problem behind its **Report** app, which posts a written 911/311 report through a
different path. The retro brick has no apps: the keypad is the only way it can reach anyone, so on
the retro phone emergency services were simply unreachable. The services directory even listed 311
as a number you could call.

Emergency numbers now go to the CAD call centre instead of being looked up as a player phone —
exactly what `/911` does, but with the voice call the queue was built for:

- Dial **911** or **311** → the call enters the dispatcher queue, and the phone shows *Calling…*,
  then the operator's name once a dispatcher answers, with the call timer running.
- **Hanging up** leaves the queue. Before, a phone call that could not connect left nothing to hang
  up; now the caller disappears from the dispatcher's screen when they end the call, as they should.
- No dispatcher online → the call still becomes an incident automatically, as it always did, and the
  phone stops ringing instead of waiting forever.
- Call centre switched off (or the CAD gated out entirely) → the phone says so straight away rather
  than dialling into nothing.

Which numbers count is configurable — `PhoneCfg.emergencyNumbers` in `configs/cfg-phone-sh.lua` maps
a dialled number to a call type, so a community that dials 112 or 999 can add it, and removing an
entry makes that number an ordinary call again. Numbers are matched on digits, so "9-1-1" works too.

A dispatcher looking at a call placed this way sees no typed message — the caller is on the line
instead. That placeholder was also the last hardcoded German string on this path (`(keine Details)`)
and is now a proper locale entry.

> ⚠️ **Config change:** `configs/cfg-phone-sh.lua` gained `PhoneCfg.emergencyNumbers`. If you keep
> your own copy, the shipped default (911 + 311) applies when the table is missing — copy it in only
> if you want different numbers.

## [3.4.9.2] – 2026-08-19 — Every department picks its own CAD

### Added

#### `cad` — which terminal a department gets is now a setting, not a guess

Until now `/mdt` worked out which terminal to open by reading the department name. A `short`
containing "lapd" got the LACORE Mobile Client, one containing "lasd", "sheriff" or "bcso" got the
LASD CAD/PCMS, anything else in Law Enforcement got the Agency MDT, and Fire/EMS/Coroner got the EMS
CAD. That works as long as your departments happen to be named the way the guess expects. A
"Vespucci Metro Police" that should run the Agency terminal, a sheriff's office that should get the
LAPD client instead of PCMS, or a department that should have no terminal at all — none of that was
possible without renaming the department, and a `short` is referenced everywhere (callsigns, MDT
routing, the DutyAccess gate), so renaming it is not a small thing.

Each entry in `configs/cfg-agencies-sh.lua` now takes an optional `cad` field:

```lua
{
    type  = "Law Enforcement",
    short = "SMPD",
    cad   = "agency",          -- ← this department opens the Agency MDT
    long  = "Santa Monica Police Department",
    ...
}
```

| `cad` | Terminal |
| --- | --- |
| `"lapd"` | LACORE Mobile Client (LAPD PremierOne look) |
| `"lasd"` | LASD CAD/PCMS terminal |
| `"agency"` | Agency MDT (CHP style) — the all-round LEO terminal |
| `"ems"` | EMS/Fire CAD |
| `"90s"` | 9100-T retro terminal |
| `"penn"` | Pennsylvania CAD (add-on) |
| `"none"` | no terminal for this department |

The explicit choice always wins over the name guessing, and it wins over the job as well — a
department outside Law Enforcement can be given a terminal, and one inside it can be denied one. A
department set to `"penn"` on a server where the add-on is not unlocked falls back to the Agency MDT
rather than being left without a terminal, and `"none"` closes whatever CAD is open and says why.
Leaving the field out keeps exactly the old behaviour, so existing configs route as before.

All shipped departments now spell their terminal out, so the mapping is readable in the config
instead of implied by the name. A few aliases are accepted for convenience (`"pcms"`, `"chp"`,
`"fire"`, `"retro"`, `"off"`, …); an unknown value prints a console warning and falls back to the
automatic routing.

> ⚠️ **Config change:** `configs/cfg-agencies-sh.lua` gained the `cad` field on every Law
> Enforcement, Fire/EMS and Coroner entry. If you keep your own copy of that file, nothing breaks —
> the field is optional and its absence means "route automatically as before". Copy the new field in
> when you want to steer a department's terminal by hand.

### Fixed

#### The dashboard's "server now" column showed a server you no longer run

Reported in support (Website / LSPDFR): *"my Panel is showing my old server's configuration even
though my server files are different."*

The config editor shows what your server actually runs next to what the form holds — the "server
now" values, the drift diff, and the **Use server values** button. Servers report those values under
their own Cfx key, so an account with three boxes gets one report each. The **All servers** scope,
though, read the report off the *account* row — and only servers that send no Cfx key at all (older
builds) ever write there. So the account row kept whatever landed on it once, and nothing ever
refreshed it. Move to a new box and the panel still showed the old one's settings, with no hint that
it was doing so.

**All servers** now shows the **most recent** report of the account — the same rule the list editor
already used — and names the server it came from, so a value on that scope is never silently one
particular box's. Removing a server from the servers page also drops the snapshot it reported; the
override config you wrote for it stays, because that is yours and comes back with the machine.

## [3.4.9.1] – 2026-08-16 — The Discord shop sells work, not just licences

### Added

#### Services and custom work are things you can actually order

The Discord shop could only sell a licence: a flat row of buttons, every entry with a fixed price
paid straight away. That covers a script and nothing else. Setting up someone's FiveM server,
configuring a resource, writing a script to order — none of it has a price before you have read what
the job actually is, so none of it could go in the shop at all. It went through DMs instead, with no
invoice, no order record and no paper trail.

The shop now holds three kinds of entry, each with its own section and its own dropdown on the panel:

| Category | What it holds | How it is priced |
| --- | --- | --- |
| 📦 Products | LACORE, LACORE MDT, LACORE ROBLOX, 90s CAD | fixed, paid straight away |
| 🛠️ Services | Server setup, config & installation, optimisation | quoted per job |
| ✏️ Custom work | Scripts built from scratch, or existing ones improved | quoted per job |

Dropdowns rather than buttons, because a message holds 25 buttons in total and 25 options **per**
menu — the same panel now has room for 25 entries in each category instead of 25 in the whole shop.
The panel budgets its own text against Discord's 6000-character limit: what no longer fits into a
section is still in that section's dropdown, and the panel says how many were left out rather than
failing to post.

#### A quote step in front of the invoice

A fixed-price entry runs as before — order, invoice, paid, delivered. A quoted one gets one step in
front of that:

1. The buyer's form asks for a **brief** (required) and their **budget & deadline** (optional)
   instead of a free-text note, because that is what a price is made of.
2. The ticket opens with the brief and **no price anywhere on it**, and staff are pinged.
3. Staff press **💶 Set the price** and fill in the amount, what is included, and a delivery time.
4. The buyer accepts the offer by picking a payment method — nothing is binding before that, and
   *Decline* closes the request without ever mentioning money that was never charged.

From there it is the same invoice → paid → delivered chain, with the same gapless invoice numbers and
the same PDF. What was agreed travels with it: the scope from the quote form is printed on the
invoice embed **and** on the PDF, wrapped and capped, because that is the description the buyer's
bookkeeping has to match. The price can be re-set as long as the buyer has not paid, so haggling
does not mean starting the order again.

#### One entry, several editions

An entry can carry up to five **versions** the buyer picks from before the form, and the picked
version's price becomes the order price. 90s CAD ships as the first one: *Encrypted* at 30€ and
*Open source* at 60€, one row in the shop instead of two near-identical ones.

#### New in the catalogue

**LACORE ROBLOX** at 50€ and **90s CAD** at 30€ / 60€ join the products. The services start at
**25€** (server setup), **15€** (config & installation) and **30€** (performance & optimisation) —
a starting price that says what the job is worth, with the real one quoted once the brief is in.
Custom scripts and script improvement are **price on request**: any starting price there is either
too low or scares off the job it was meant to attract.

### Changed

#### `/shop` grew a pricing mode and versions

- `/shop pricing <entry> <fixed|from|quote> [price]` — a final price, a `from …` starting price, or
  **price on request**. Both `from` and `quote` route the order through the quote step.
- `/shop variant add|remove` — the versions a buyer picks from.
- `/shop seed [preview]` — pull in the built-in entries the shop is missing. The catalogue is written
  to `data/state.json` the first time anything is edited, and from that moment the shipped defaults
  are dead to that shop: everything new in this release would have had to be typed in by hand. This
  adds them in one go and **never touches an entry that already exists**, so a price edited months
  ago survives an update — a shop that resets an edited price is worse than one missing an entry.
- `/shop add` and `/shop edit` take a **category**, and `/shop list` groups by it.
- A fixed price of 0 is refused with the reason (it renders as *free*), and changing a price that is
  never shown — on a quoted entry, or one whose versions carry their own — now says so instead of
  looking like it took effect.

Panels posted before this keep working: their old buy buttons still route to the order flow.

#### The dashboard shop page shows what the entry really costs

*Discord shop* in the dashboard listed every entry as a plain price, which reads as **0€** for
anything quoted. It now shows the category, `On request` / `from …` / the version prices, and offers
the category and pricing mode when adding or editing. The "shop is full" check is per category rather
than for the shop as a whole, so one full category no longer locks the button for the other two.
Versions stay read-only there — they are `/shop variant` in Discord.

> ℹ️ This release is the **Discord bot and the dashboard** (the bot lives in its own repo). No
> resource code, no config files and no locales changed — an existing server needs no update, only
> the bot needs a command redeploy and a restart, and the shop panel needs posting again to pick up
> the new layout.

## [3.4.9] – 2026-08-16 — QBox servers get their names and jobs through

### Added

#### QBCore and QBox characters are imported like ESX ones

Framework characters were an ESX-only feature: on QB and QBox the bridge took the name and the job,
but everything else — date of birth, gender, phone, registered vehicles, licences — had to be typed
into LACORE a second time, and the CAD person query found nobody who was not currently online.

QB and QBox now have the same import ESX has. Identity is read from the loaded player
(`PlayerData.charinfo`), not from the database: QB keeps the character in memory and writes it back
on save, so the player object is the fresher source and a fork that renamed a column still imports.
`citizenid` keys the LACORE character, which makes multicharacter work without any extra handling —
one LACORE character per QB character, re-synced on switch and on every job change.

| Pulled from QB / QBox | Source |
| --- | --- |
| Name, date of birth, gender, phone, job | `charinfo` of the loaded player |
| Registered vehicles (plates in the CAD query) | `player_vehicles` for that `citizenid` |
| MDT licences | `metadata.licences` |

The MDT person and plate queries fall back to `players` / `player_vehicles` as well, so an offline
character or a car bought in the framework's shop is found. QB has no height on the character, so
that one field stays empty. `oxmysql` is only needed for the vehicle half — the identity import runs
without it.

> ⚠️ **Config changed:** `configs/cfg-licenses-sh.lua` gained `Licenses.qb`, the map from QB's
> `metadata.licences` keys onto the six MDT licence slots. It ships covering stock QB
> (`driver`, `business`, `weapon`); add your own licence names there if you use custom ones.
> `configs/cfg-bridge-sh.lua` is unchanged apart from its comments — `Bridge.useFrameworkCharacters`
> now applies to QB/QBox too, at its existing default of `true`.

### Fixed

#### RP-WEB stayed "offline" on a server that was plainly running

`https://lacore.netica.dev/server/<id>` showed the desktop but never any data, on a server with both
`lacore_license_key` and `lacore_webdispatch` set and pushing every two seconds.

The push arrives with the account's license key and a `serverKey` — the Cfx `sv_licenseKey` — which
the portal translates into the dashboard row id, because that id is what `/server/<id>` addresses and
the secret key must never appear in a URL. When that translation found nothing, the snapshot was
filed under a shared `default` slot instead. No `/server/<id>` address points at that slot, so the
desktop could never find the snapshot no matter how long it waited — and every side of the chain
reported success: the game logged a good push, the portal answered `200`, the page said "offline".

Four changes, because the failure was as much about being undiagnosable as about being wrong:

- **The server is told its own id, so nothing has to be derived.** `/ingest/server` — the telemetry
  beat that creates and refreshes the dashboard row — now answers with that row's id, the very id
  `/server/<id>` is built from. The core keeps it and sends it back on every web-dispatch push, so
  the portal knows which server it is hearing from by construction. This is the path that works
  without any Cfx key at all.
- **Two fallbacks behind it.** If the id has not arrived yet (the first ~15 seconds after start, or
  telemetry switched off), the Cfx `sv_licenseKey` is used as before, and failing that the address
  the push arrives from — the same key telemetry upserts the row by when a server has no Cfx key to
  give. Deriving identity from an IP is a guess and is now the last resort rather than the plan.
- **The game server says when it is unmatched.** The reply carries whether the snapshot could be
  filed against a real dashboard entry, and `webdispatch` prints once on the server console when it
  could not — stating plainly that `lacore_license_key` is *not* the problem, and reporting the state
  of both identifiers it has. It prints again when the match recovers.
- **The page says which kind of offline it is.** "Never received a snapshot at this address" and "the
  server went quiet" looked identical. The banner now separates them and, when another server on the
  account is pushing right now, names it.

> ⚠️ Nothing to configure. The `sv_licenseKey` hint above is the *recommended* fix — with it, the
> match is exact even if several of your servers share one public IP.

#### The player list covered the LAPD MDT and looked like a locked terminal

With the MDT open, pressing **I** painted the player-list board over it. The board is a fullscreen,
near-opaque overlay and the LAPD window had no stacking order of its own, so the terminal simply
disappeared — while it was still open, still holding the NUI focus and still holding the mouse
cursor. From the officer's side that reads as an MDT that will not let go. The Agency MDT and the
LASD terminal were unaffected: both already draw above the board.

The board and a terminal no longer share the screen. **I** is refused while any CAD window is open
and says why, and a board that is already up closes by itself the moment a terminal opens. Nothing
else about the board changed — it still takes no NUI focus and still pages on the arrow keys.

#### CHP MDT: the close button, the status menu and the whole action rail were off screen

On the Agency (CHP) MDT the buttons on the right-hand side did nothing, because they were not on
the screen at all. All terminals share one saved window position, and the Agency window is about
twice as wide as the LAPD one that usually saved it. Dragging clamps only far enough to keep a title
bar grabbable, so a position inherited from the narrow window left several hundred pixels of the
wide one — the ✕, the gear, the status dropdown and the entire right action rail (SELF ASSIGN,
BACKUP, EMS, TOW, BOARD, HISTORY, CODE 6) — hanging past the edge of the screen, out of reach of any
click. The gear being off screen too meant there was no way to fix it from inside the terminal.

Every terminal now pulls an inherited position back into view when it opens and when the game window
resizes, and the rescue is stricter than the drag clamp: a window that FITS on screen is placed fully
on screen instead of merely leaving a grabbable corner. Deliberately dragging a window half out of
view still works — that rule is unchanged.

The Pennsylvania CAD already did this; the Agency MDT, the LAPD Mobile Client and the 9100-T did not.
The same pass closed the other half of the loop: the LAPD window stopped only at the top and left
edge while being dragged and the 9100-T chassis did not stop at all, so both could be pushed off the
screen and **saved** there — and that saved position is the one every other terminal inherits. All
four now clamp on all four edges. The in-car dashboard screen is left alone: there the terminal is
stretched over the whole texture, so "is it on screen" is not a question that applies to it.

#### The QBox bridge never reached the framework at all

On a QBox server (`qbx_core`) the bridge detected the framework correctly and then went silent:
no character names, no job → agency mapping, so `/onduty` still demanded a Discord duty role and
the MDT opened for nobody. ESX and plain QBCore were unaffected.

The bridge asked QBox for a core object (`exports.qbx_core:GetCoreObject`). QBox does not have one —
it dropped the QBCore core-object pattern and answers only under its QB compatibility layer or
through its own exports. The call therefore failed on every lookup, `Bridge.GetName` and
`Bridge.GetJob` returned `nil`, and LACORE behaved as if the player had no job.

Player lookups now go through QBox's native `exports.qbx_core:GetPlayer(source)` first and fall
back to the QB bridge layer's core object, so both a pure QBox install and one running the QB
compatibility layer resolve. QBox's `QBCore:Server:OnPlayerLoaded` event (QBCore fires
`PlayerLoaded` and passes the player, QBox fires `OnPlayerLoaded` with none) is handled as well, so
the job arrives on join instead of up to five seconds later. Job grades are read as a number
whether the fork stores `job.grade.level` or a bare `job.grade`.

> ⚠️ Nothing to configure — this needs no config change. On a QBox server the framework must still
> be `ensure`d **before** LACORE (see `configs/cfg-bridge-sh.lua`); the server console prints
> `[bridge] Framework detected: qbox` when it worked.

## [3.4.8] – 2026-08-15 — Anticheat logs reach the database again

### Fixed

#### `lacore_logs` batch insert failed with a SQL syntax error

With the anticheat active, oxmysql threw on every log flush:
`You have an error in your SQL syntax … near '?)'`. Nothing from BigBrother made it into
`lacore_logs`, so the dashboard and the log view stayed empty exactly when they mattered.

The batch INSERT builds one placeholder group per row and one flat parameter list. Rows without
coordinates or without a `zone` leave a `nil` in that list. A hole in the middle still survives the
transfer as NULL, but a `nil` at the *end* — and `zone` is the last column and is unset for
practically every row — simply shortens the list: Lua has no trailing `nil`, so the statement asked
for 48 parameters and received 47. MySQL then choked on the last, unfilled `?`.

Nil values are no longer passed as parameters at all. They are written into the statement as a
literal `NULL`, which keeps the parameter list gapless and the columns correctly aligned.

### Added

#### Log rows now carry the locality again

The `zone` column of `lacore_logs` was never filled — it existed, but every row wrote NULL.
`GetNameOfZone` is a client native, so the server cannot resolve a coordinate into a locality on
its own. Each client now reports its own locality whenever it changes (a 3-second check, one event
per zone change), the server caches it per player and stamps it onto the log rows whose coordinates
come from that player. Rows written for an explicit coordinate elsewhere in the world keep an empty
zone rather than a wrong one.

## [3.4.7] – 2026-08-15 — Bullets that actually land

### Fixed

#### Headshots did not kill — the anticheat was cancelling them

The one that was actually reported: a headshot ragdolled the victim and left them alive, with every
weapon, anywhere on the map. Body shots were unaffected. Stopping LACORE made it disappear.

`weaponDamageEvent` flags a hit as a damage modifier above `WeaponDamage.maxDamage` and cancels it.
That ceiling was `250`, chosen from the weapon's *listed* damage ("a sniper headshot lands around
200") — but the engine reports the **amplified** value for a headshot, which is far higher. So every
legitimate headshot tripped the check, the damage event was cancelled server-side, and the victim
survived with only the hit reaction. The ceiling now sits clear of any single legitimate hit; a real
damage modifier is not a subtle thing and is still caught.

#### Observe mode was not observing

Worse, and the reason nobody could see what was happening: `CancelEvent()` ran regardless of
`Anticheat.Mode`. Observe mode promises "everything detects, nothing punishes" and is the default —
but the blocking half fired anyway. A false positive in the mode meant for *watching* silently
deleted the game action: no kick, no ban, no message, the shot just did nothing.

Blocking is enforcement, so it now waits for `Mode = "enforce"`. Detection, logging, trust scoring
and the dashboard are unchanged in observe mode. This covers all three blocking checks — weapon
damage, blocked explosion types and server-side blacklisted weapons.

If you run `Mode = "observe"` (the default), the anticheat can no longer alter gameplay at all —
which is what it always said it did.

#### Players stuck unkillable after joining through the session menu

Shots landed but barely hurt: a hit player took almost no damage from any weapon, and a headshot
only ragdolled them instead of killing them. The impulse of the shot still applied — the damage did
not.

Cause: the spawn lobby deliberately turns player-vs-player damage off
(`NetworkSetFriendlyFireOption(false)` + `SetCanAttackFriendly(ped, false, false)`) while a player
still sits in session 0, and turned it back on **only** inside the spawn loop's own exit path in
`client/vehicle-cl.lua`. Joining the session any other way — the session menu's "roleplay" or
"personal" button in `client/sessionui-cl.lua` — set `player.session` directly, so the loop ended
without ever lifting the block. That client then spent the whole session unable to take (or deal)
bullet damage.

Two further holes are closed with it:

- `SetCanAttackFriendly` is stored **on the ped**, so every respawn and every model change dropped
  it. It is now re-asserted whenever the ped handle changes, from the session the player is
  actually in.
- Both natives now move together through one helper, `SetFriendlyFire(on)` in `client/util-cl.lua`,
  so a future exit path cannot flip one and forget the other.

No config change; nothing to do beyond restarting the resource.

#### "Down" meant "slightly wounded"

The third-eye grief gate `IsDowned()` counted anyone below `150` HP as unconscious. Players start at
`200`, so a fully conscious, walking player at half health could be **carried, revived and zipped
into a body bag**. The magic number is gone — `IsPedFatallyInjured` already asks the same question
against the ped's real death threshold instead of an invented one.

`ems:Revive` gained a matching check on the patient's own client. Reviving someone who is not down
was a full heal on any player of the medic's choosing; healing the merely wounded is what the
separate medic option is for.

#### Third-eye actions could be fired across the map

`target:Carry`, `ems:Revive` and `target:DeadBag` accepted any server ID. The eye options only show
up within 2–3 m, but nothing stopped a modified client from sending the event for a player on the
other side of the map. The server now checks the distance itself (5 m, with headroom over the
largest option) and refuses the player's own ID. Servers running without OneSync keep working — the
check skips itself rather than blocking everything, since server-side entity natives need OneSync.

#### `CEventNetworkEntityDamage` was misspelled

`client/vehicle-cl.lua` listened for `CEventNetworkEntityDamange`, so the only damage-event listener
in the resource never fired. Its body is devmode-only debug output, so nothing behaved differently —
but it was dead code pretending to be a hook.

### Customer portal

Nur die Weboberfläche auf `lacore.netica.dev` — keine Änderung an der Resource.

#### Teammitglieder kommen jetzt tatsächlich rein

Wer auf `/dashboard/team/` hinzugefügt wurde, bekam beim Login trotzdem „That Discord account has no
LACORE customer or staff role" — der Login prüfte nur Discord-Rollen und nie die Team-Tabelle. Ein
externer Server-Entwickler hat aber weder gekauft noch eine Rolle. **Das Hinzufügen ist ab sofort
selbst die Berechtigung:** hat der Login keine Rolle, wird geprüft, ob die Discord-ID auf irgendeiner
Kundenliste steht — wenn ja, Login als `developer`. Zugriff bleibt komplett scope-gesteuert.

#### Account-Switcher in der Sidebar

Der Kontext-Wechsler saß in der Kopfzeile und tauchte erst ab zwei Konten auf. Er sitzt jetzt in der
**Sidebar** über der Navigation, die er umschaltet, mit den erteilten Scopes darunter. Ein Entwickler
ohne eigenes Konto landet beim Login direkt im ersten Kundenkonto, statt in einem leeren Kontext, in
dem jede Anfrage mit 403 endete.

#### Activity log — wer hat was geändert

Neue Seite `/dashboard/logs/`: jede Änderung am Konto mit Zeitpunkt, Person und Detail. Config-Saves
zeigen die einzelnen Einstellungen als vorher/nachher-Diff. Erfasst werden Config, Config-Listen,
Lizenzschlüssel, Server, Team, Playerbase und Share-Keys. **Nur der Kontoinhaber sieht die Liste** —
Teammitglieder nie. ⚠️ Neue PocketBase-Collection `lacore_audit` nötig
(`landing/pocketbase/pocketbase-audit-collection.json`), plus das neue Feld `ownerName` in
`lacore_team`.

#### Community Resources — neue Sammelstelle unter `/resources/`

Die öffentlichen Referenzseiten lagen verstreut: die Keybind-Referenz auf einer eigenen Top-Level-URL,
die Script-Map versteckt am Fuß der Kunden-Team-Seite — dort findet sie niemand, der sie sucht, und
sie sagt nichts über dein Konto aus. Beides hängt jetzt unter **`lacore.netica.dev/resources/`**:

- `/resources/keybinds/` — Command- & Keybind-Referenz (unverändert, nur umgezogen)
- `/resources/script-map/` — die Script-Map als eigene Seite
- `/keybinds/` leitet weiter, damit die Links in Docs und Discord weiter funktionieren

Der Menüpunkt „Commands" auf der Startseite heißt jetzt „Resources" und zeigt auf die Übersicht.

Dazu neu: **`/resources/config/`** — die Config-Referenz. 178 Einstellungen, die sich über das
Dashboard setzen lassen, mit Typ, erlaubtem Wertebereich, Beispielwert und der Angabe, ob sie **live**
greifen oder erst beim nächsten Serverneustart. Filterbar nach Tab und durchsuchbar über Key, Name und
Beschreibung. Die Seite wird zur Build-Zeit aus `landing/lib/configschema.mjs` erzeugt — derselben
Allowlist, gegen die Editor und Resource validieren —, kann also nicht von dem abweichen, was LACORE
tatsächlich akzeptiert.

Der **Sensitive-Tab bleibt auf der öffentlichen Seite ausgespart**: Anticheat-Schwellwerte,
Upload-Ziele und die Discord-Rollen für Staff-Zugriff. Wer die Schwellwerte samt tunbarem Band
veröffentlicht, sagt Cheatern genau, worunter sie bleiben müssen. Die 77 Einstellungen werden beim
Build entfernt und landen gar nicht erst im Bundle; die Seite benennt die ausgesparten Gruppen, damit
die Lücke sichtbar ist statt stillschweigend. **Im Dashboard-Editor ändert sich nichts** — der liest
das vollständige Schema über die API.

#### `k9.name` und `k9.maxDistance` waren doppelt deklariert

Beim Bau der Config-Referenz aufgefallen: beide Keys standen zweimal in der Allowlist — einmal im
K9-Block, einmal weiter unten nach dem Retro-Block. `BY_KEY` löst das still auf (der letzte gewinnt),
also galt die spätere, knappere Variante ohne Hilfetext und mit `min = 0` statt `5`. Im **Config-Editor**
brach das die K9-Gruppe: doppelte Keys in einer keyed-Liste sind ein harter Svelte-Fehler, die Gruppe
und alles davor wurde nicht gerendert.

Die Duplikate sind raus — in `configschema.mjs` **und** in der spiegelnden Lua-Allowlist
`modules/remoteconfig/remoteconfig-sh.lua`, wo derselbe Wert dadurch zweimal angewandt wurde. Behalten
wurde die ausführliche Definition mit Hilfetext; `min` bleibt bei `0`, damit gespeicherte Werte unter 5
weiter gültig sind. Die Referenzseite dedupliziert zusätzlich beim Build und warnt, falls so etwas
wieder passiert.

## [3.4.6] – 2026-08-15 — A custom prison is actually custom

### Fixed

#### Custom jail coordinates are honoured everywhere

`Corrections.jailCoords` / `releaseCoords` promised "set these to run a custom prison" — but only
the timer-expiry path read them. The initial teleport into jail (`jailPlayer`), the release
(`unjailPlayer`) and the coroner hold reused **hardcoded** Bolingbroke coordinates, so a custom
prison teleported inmates into the default jail anyway. All of these now read the config, with the
old literals only as fallback for a missing file.

The keep-in-prison loop had the same blind spot the other way round: it checked the game's `JAIL`
zone, so an inmate held at a custom prison **outside** that zone was snapped back to the exact jail
coordinate every second — pinned to one spot instead of roaming the grounds. The check now also
counts "within `Corrections.jailRadius` of `jailCoords`" (new setting, default 150 m) as inside.
Inside the default Bolingbroke zone nothing changes.

#### The impound lot is an LEO panel, not a public lookup

`/impounds` opened for everyone: the client command had no job check and the server answered the
list request unconditionally ("public lookup"). The lot lists **officer names and impound
reasons**, so it is not public data — the command now carries the same LEO gate as `/impound`, and
the server refuses the list to non-LEO regardless of what the client asks (release was already
gated).

⚠️ **Config change:** `configs/cfg-corrections-sh.lua` gains `jailRadius` (default `150.0`) — only
relevant for custom prisons outside the game's JAIL zone; existing installs notice no difference.

## [3.4.5] – 2026-08-15 — Three dependencies, honestly

### Changed

#### The dependency story now matches the code

An audit of every external `exports[...]` call answered the question "what does LACORE actually
need?" — and the docs were wrong in both directions.

**`NativeUILua_Reloaded` is finally gone from the docs.** 3.2.0 replaced it with LACORE's own menu
system and said so in the changelog — but `START-HERE.md`, `DOCS.md`, `README.md` and
`server.cfg.example` all still listed it as a required install. Customers have been installing a
resource that nothing uses. Removed everywhere; `/lacore doctor` never checked it, so nothing else
changes.

**Two undocumented hard dependencies became optional.** `blip_info` (map-blip info cards) was
called unguarded ten times while building blips — without the resource, every player's session
threw script errors on spawn. `bob74_ipl` (North Yankton / Cayo Perico map geometry) was called
unguarded on AOP switch. Both are now detected via `GetResourceState` and degrade cleanly: blips
appear without info cards, the AOP switches without the island/snow map (with a console hint).

What remains — and is now documented as such in `fxmanifest.lua`, the docs and
`server.cfg.example`:

* **Hard (3):** `pma-voice` (radio, 911/311 voice, phone), `spawnmanager` (spawning, ships with
  FiveM), `oxmysql` (script include at startup).
* **Optional, auto-detected:** `blip_info`, `bob74_ipl`, `ox_target`, `screenshot-basic`,
  DPEmotes/RPEmotes, ESX/QBCore/QBox, `ox_lib`/`okokNotify`/`mythic_notify`, `lacore-maps`.

`server.cfg.example` gained a commented optional-resources block, and the requirements table in
`START-HERE.md` now separates required from optional.

## [3.4.4] – 2026-08-15 — config.lua on a diet

### Changed

#### The main config is settings again, not a thousand lines of data

`config.lua` was 1118 lines, and about 1000 of them were data tables: the full agency roster
(~750 lines alone), bus stops and routes, GTA text overrides, phone icons, the indestructible-prop
list, the AOP pool. A customer who only wanted to switch the language scrolled past all of it.

The settings part (~100 lines) stays exactly where it was. The data moved into topic files, each
loaded only on the side that reads it:

| Table | New home |
| --- | --- |
| `agencies` | `configs/cfg-agencies-sh.lua` (client + server) |
| `BusStops`, `BusRoutes` | `configs/cfg-busroutes-cl.lua` (client only) |
| `textEntries` | `configs/cfg-gametext-cl.lua` (client only) |
| `customIcon` | `configs/cfg-phoneicons-cl.lua` (client only) |
| `indestructibleProps` | `configs/cfg-props-cl.lua` (joined the prop spawner config) |
| `initialAOPs` | `configs/cfg-server-sv.lua` (server only) |

All entries were split off 1:1 by line range and verified by count — 54 agencies, 48 bus stops,
39 icons, 16 text entries. A comment block at the end of `config.lua` points to every new home.

**Backward compatible by design:** `config.lua` still loads first, and every moved table is
defined as `X = X or { … }`. If you kept an old, edited `config.lua` that still contains one of
these tables, **your table wins** and the new file's defaults simply don't apply. You can migrate
your edits into the new files whenever convenient — no rush, nothing breaks.

### Removed

`RegisterPrices` and `SpeedLimits` are gone: nothing in the code ever read either of them — they
were documentation-only ballast. If you edited them, the edits never had an effect.

⚠️ **Config change:** `configs/config.lua` shrank to its settings; six data tables moved to the
files above (old edited copies keep working, see the compatibility note). `cfg-props-cl.lua` and
`cfg-server-sv.lua` each gained a section at the end.

## [3.4.3] – 2026-08-15 — Data is not configuration

### Changed

#### The emoji table moved out of configs/ — and off your players' clients

`cfg-emojis-sh.lua` was the biggest file in `configs/` (50 KB, ~1800 entries) and the least
config-like: a pure data list nobody tunes. It was also loaded as a shared script on the client
**and** the server, although the only thing that ever reads it is `emojify()` in the server's OOC
chat path.

Both fixed at once: the table now lives in **`json/emojis.json`** (plain JSON, escrow-free, still
freely editable) and is loaded **server-only**. Clients no longer carry ~1800 emoji strings they
never use, and the configs folder is down to files you actually configure. All 1838 entries were
converted 1:1 — chat shortcodes behave exactly as before.

⚠️ **Config change:** `configs/cfg-emojis-sh.lua` no longer exists. If you added your own
shortcodes there, move them into `json/emojis.json` — same `"shortcode": "emoji"` pairs, just JSON
syntax. A leftover copy of the old file in `configs/` still loads but is simply ignored.

## [3.4.2] – 2026-08-15 — Fifty-two config files, one map

### Added

#### The configs folder now explains itself

`configs/` has grown to 52 editable files — one per feature, which keeps each file small, but
finding *which* file holds a setting meant opening them one by one. The folder now ships its own
map: **`configs/CONFIG-INDEX.md`** — one line per file, grouped by topic (start here → MDT/CAD →
LEO tools → civilian → presentation → integrations → security), each line naming the Lua table the
file defines (`PenalCode`, `HudCfg`, …) so you know what to search for in your editor.

The page also explains the `-sh` / `-cl` / `-sv` naming, points at the `.defaults/` +
`/lacoreconfig restore` safety net, and tells standalone-product owners (lacore-mdt) that a listed
file missing from their download is a feature their product simply doesn't include — not an error.

It is deliberately **not** called `README.md`: that name is stripped from customer builds, so the
index would never have arrived. `CONFIG-INDEX.md` ships in the core and in every product, as plain
text. No code was changed — this release is documentation only.

## [3.4.1] – 2026-08-15 — The Discord role is the permission

### Added

#### A supervisor role in Discord now opens the panel

The ACE path from 3.4.0 assumes you have somewhere to put a principal. If your departments are run
out of Discord and you have no role→ACE bridge, that still meant maintaining a second list by hand.

So the roles can now **be** the permission. Name your supervisor roles in `DiscordAuth.roles` with
their role IDs, list the names in the supervisor config, and you are done:

```lua
roles = { "LAPDSupervisor", "BCSOSupervisor", "SAHPSupervisor" },
```

Give someone the role in Discord and they have the panel; take it away and they don't. Nothing goes
into `server.cfg`, nothing needs a restart. `rolesByDept` limits a role to units of one department.

The check is the same one the BigBrother panel uses, so it needs your Discord bot token
(`lacore_discord_token`) and guild id. Without them it simply never matches, and the ACE, grade and
allowlist paths are unaffected. Roles are cached for `DiscordAuth.cacheSeconds` (5 minutes), so a
role change reaches a connected player within that window.

⚠️ **Config change:** `configs/cfg-supervisor-sh.lua` gains `roles` and `rolesByDept`, both empty by
default — an existing install notices no difference.

## [3.4.0] – 2026-08-14 — A supervisor group, not a list of names

### Added

#### The supervisor panel takes an ACE permission

Until now the panel had two doors: a framework job grade, or an allowlist of license identifiers and
callsigns. Neither survives a real department. Collecting the license of every supervisor across three
departments and keeping `server.cfg` in sync by hand is a job nobody wants, and the callsign entry was
worse than inconvenient — a callsign is just text a player types, so anyone willing to put on a
supervisor's callsign got the panel with it.

So there is a third door, and it is the one to use: an **ACE object**. Allow it on a group once, and
every member of that group has the panel.

```cfg
add_ace group.lapd_supervisor lacore.supervisor allow
add_principal identifier.discord:123456789012345678 group.lapd_supervisor
```

Any identifier works as the principal (`discord:`, `license:`, `fivem:`, `steam:`). If you run a
Discord→ACE bridge, point your supervisor roles at those groups and the membership keeps itself in
sync — a role change is the whole workflow. ACE objects are hierarchical, so a group allowed plain
`lacore` gets it too, which is why `group.lacore_dev` already had it.

Departments that want to be gated separately get their own object via `aceByDept`
(`["LSPD"] = "lacore.supervisor.lspd"`), checked before the general one. `leoOnly` still applies: an
ACE holder must be an on-duty LEO unit. And `/myperms` now ends with `supervisor=true|false`, so
"did my ACE land?" is one command instead of a guess.

The grade path and the allowlist are untouched — a server that adds nothing behaves exactly as before.

⚠️ **Config change:** `configs/cfg-supervisor-sh.lua` gains `ace` (default `"lacore.supervisor"`) and
`aceByDept`. The default grants nobody anything until you allow the object somewhere, so an existing
install notices no difference.

## [3.3.4] – 2026-08-14 — Cuffs, not a tie

### Fixed

#### A cuffed suspect put on a tie

Cuffing swapped the suspect's accessory slot to a fixed drawable — `82` for male peds, `64` for
female ones. Those are vanilla GTA numbers, and on a server with an EUP pack installed they point at
something else entirely: most people got a **tie** instead of handcuffs.

The numbers now live in the new `configs/cfg-cuffs-cl.lua` and are yours to set — component slot,
drawable and texture per freemode model, plus `CuffConfig.eup = false` if you would rather keep the
cuff animation and leave the suspect's outfit alone.

Two smaller things came along: releasing a suspect restores the **texture** they wore as well (it was
being reset to `0`, so a shirt could come back in the wrong colour), and the outfit is only restored
if the cuffs actually changed it.

⚠️ **Config change:** new file `configs/cfg-cuffs-cl.lua`. Existing installs need nothing — a missing
file means no swap at all; drop the file in and set the drawables to your EUP pack's cuffs.

#### Regions are a config file now

Which regions exist, their colour on the dispatch map, which GTA zone belongs to which one, the
fallback region, the map style and the map calibration all live in the new
`configs/cfg-regions-sh.lua`. Before, the same map was spread across the client code
(`CityZones`), the server defaults (`mdt-mapconfig-sv.lua`) and the NUI (`zones.js`), and none of the
three was a config — which is why editing a config never changed a region. The default region also
stopped being a literal: fifteen places that read `or "Los Angeles"` now ask `DefaultRegion()`, so
renaming your fallback region is one line instead of a search-and-replace.

`/citydebug` still shows the zone code live in game — that code is the key you put in `Regions.zones`.

⚠️ **Config change:** new file `configs/cfg-regions-sh.lua`. It ships with exactly the regions the
resource used before, so an install that changes nothing behaves as it did.

#### The "San Tierra" region is gone from the defaults

The region is out of every shipped default: the zone map (now `configs/cfg-regions-sh.lua`), the
district list, the dispatch console's fallback list and `configs/cfg-areas-cl.lua`. The north-east
desert (Sandy Shores, Grapeseed, Mt. Gordo …) falls to the default region; its zone codes sit ready
as a commented-out block in the new regions config, so giving the desert a region of its own is
uncommenting five lines. The shipped `STPD` department is now the **Sandy Shores Police Department**
(its `short` code is unchanged, so nobody's department assignment breaks).

Note for existing servers: the district list and the per-zone overrides are **stored**, in
`data/map_config.json` and `data/zone_regions.json`. A server that already ran keeps whatever is in
those files — rename or remove the region in the dispatch console's **Zone Editor** (it broadcasts to
every client immediately), or stop the server and delete both files to fall back to the new defaults.

⚠️ **Config change:** `configs/cfg-areas-cl.lua` — the shipped Sandy Shores area now says
`region = "Los Angeles"`. Your own edits to that file are untouched.

## [3.3.3] – 2026-08-13 — Nobody is dead on somebody else's screen

### Fixed

#### A body that would not get up again

Death Sync exists to stop a dead player from standing around on everyone else's screen. It could do
the opposite: a player was **alive and walking on his own screen while everyone else saw his corpse**
lying where he died — the ticket that started this.

Two things caused it, and both are gone:

- **A watcher believed the network over its own game.** It corrected any ped it had been *told* was
  dead, without ever asking its own client whether that ped is dead. Now that question is asked
  first, on every pass: a ped your game reports as alive is dropped from the list and never touched
  again, whatever the network says.
- **One ragdoll lasted a minute.** The pose was pushed for 60 seconds at a time, so a single missed
  "he is alive again" packet left the body face-down for that whole minute. The push is now ~1.5
  seconds and simply repeated while the body is still dead, so the worst case is that long instead.

Also: the "not dead any more" message is sent **three times** on respawn rather than once (one packet
was all it took to strand a body), a death goes stale after **2.5s** instead of 6, and a ped **inside
a vehicle** is left alone — moving it dragged the car around.

#### Running your own death script

The new `configs/cfg-deathsync-sh.lua` is the answer to "it fights with my death/EMS script": pose
correction (`forceRagdoll`) and position correction (`correctPosition`) can be switched off
separately, and `Deathsync.enabled = false` turns the whole thing off in one line. Rates, radius,
drift threshold and the ragdoll length are configurable too.

⚠️ **Config change:** new file `configs/cfg-deathsync-sh.lua`. Existing installs need nothing — a
missing file means the defaults, which are what the module did before.

### Changed

#### The replay recorder ships off

`Replay.enabled` now defaults to **false** in `configs/cfg-replay-sh.lua`. The Director's Cut is a
content-creation tool that hands every player a recorder and stores the clips on **your** disk, so it
is a decision an owner makes rather than one made for him. One line turns it back on; nothing else
about it changed.

⚠️ **Config change:** `configs/cfg-replay-sh.lua` — `Replay.enabled` default flipped to `false`. If
your server uses the replay system, set it back to `true` after updating.

#### A unit on the bar player list has a name again

On the bar-style player list (`HudCfg.playerlistStyle = "bar"`) an on-duty player showed a callsign
and nothing else you could look up — and the phone dials by **character name**, so there was no way
to get from "2-SAM-4" on the board to that person in your contacts. Unit cards now carry the
character name on a third line, when it adds something the two lines above do not. The other two
board styles already showed it.

## [3.3.2c] – 2026-08-13 — An empty server still answers

### Fixed

- **A server with nobody on it went silent, and the web dispatcher read that as offline.** The push
  loop only ran while players were connected — a saving inherited from the self-hosted bridge, and
  three bugs at once for the hosted portal: a running server showed as **offline**, a queued action
  waited for somebody to join, and — worst — an **access question could never be answered**, so a
  dispatcher granted by Discord role sat in "checking your access" forever on a quiet server.

  An empty server now pushes every **6 seconds** (still every 2 with players on it). Six because the
  page calls a snapshot stale at ten; an empty snapshot is a few bytes.

  Found on the first real run against a live server, which is exactly the class of thing that only
  shows up there: every part worked, and the part that decides *when* to speak did not.

## [3.3.2b] – 2026-08-13 — Web dispatch per Discord role

### Added

#### Web dispatch is granted per server, by Discord role

Access used to be per **account**: anyone who could reach your servers in the dashboard could
dispatch on all of them, and there was no way to hand a seat to a dispatcher who is not on your
dashboard. Now there is.

- **A role list per server**, in `configs/cfg-server-sv.lua`: `WebDispatchAccess.dispatch` may act,
  `WebDispatchAccess.view` may only watch. Role NAMES from `DiscordAuth.roles`, so a role ID is
  written once and reused by the in-game checks.
- **Both lists empty by default** — nobody but you and your dashboard team. Granting web dispatch
  stays a decision somebody makes on purpose.
- **The check runs on YOUR server, with your own bot token.** The portal asks "may this Discord id
  dispatch?" and gets back yes, read-only or no; the token, the guild and the roles never leave the
  machine. The question and the verdict ride along with the CAD snapshot that was already flowing —
  no new connection, nothing new to configure.
- **Refusals fail closed.** Roles that cannot be read — not in the guild, Discord unreachable, no
  token — are a no, never a yes.
- **Read-only is a rule, not a hidden button.** The acting controls disappear for a viewer *and* the
  server refuses the action if one is sent anyway.
- **"Checking your access" is its own screen**, because the answer takes one push to arrive and
  refusing somebody for those two seconds would read as a permanent no.

⚠️ **Config change:** `configs/cfg-server-sv.lua` gains `WebDispatchAccess`. Existing configs keep
working unchanged — a missing block means the same thing as the default: nobody but the owner.

## [3.3.2a] – 2026-08-13 — The web dispatcher is a page you just open

### Added

#### The web dispatcher became a page you just open

The browser dispatcher used to mean hosting a Node bridge on your own VPS, wiring Discord OAuth and
pointing a domain at it. Now it is two lines in `server.cfg` and a button in the dashboard.

- **A hosted portal at `/server/<id>`.** Your server pushes its CAD state — calls, units, the 911/311
  queue — to LACORE every two seconds over the same licence-key channel the dashboard already uses,
  and reads the dispatcher's actions straight out of the reply. Nothing listens on your server, no
  second machine, no certificate. **Off by default:** the shift's call data leaves your server only
  once you set `setr lacore_webdispatch "true"`.
- **A desktop, not a dashboard page.** Dispatch, Map, Units and Radio are windows you drag, snap,
  maximise and minimise, with a taskbar and a start menu — one dispatcher can watch the map on one
  half and the call list on the other. Under 1280px it collapses to one program at a time.
- **The real map.** The Map window draws the game's own atlas tiles on the same calibration the
  in-game dispatch console uses, so a unit sits on the same street on both screens. It opens on
  where the shift actually is — the median of the units and calls, not the middle of the island —
  and fills the pane instead of letterboxing it.
- **The windows are looking at the same shift.** Clicking a marker on the map selects that call in
  Dispatch; the right-click menu in Units writes into the radio box; picking a callsign in Units is
  what ASSIGN acts on.
- **Actions are real.** Status changes (ER / CODE SIX / CLEAR), assigning a unit, creating a call and
  closing one with a disposition all run through the same functions the in-game MDT uses, and land in
  Big Brother with the dispatcher's Discord identity, marked as source `web`.
- **It never pretends to be live.** Five honest states, decided by the age of the last snapshot and
  what your account may do: **live**, **stale** (>10s — the windows dim and actions are held),
  **offline** (>60s — you are looking at the last state that arrived), **read only** (the acting
  controls are absent, not greyed out) and **no access**.
- **One button to get there.** Dashboard → Servers → **DISPATCH** opens the portal for that server.
  The id in the URL is the server's own id, so two servers on one account never mix.
- **Your own bridge still works.** `lacore_bridge_url` / `lacore_bridge_token` are untouched, inbound
  endpoint included, and both paths may run at the same time.

### Known limits

- Access is per **account**, not per server: anyone who can reach your servers in the dashboard can
  dispatch on all of them. Granting web dispatch to individual Discord roles is not built yet.
- The Radio window is local to your browser — the in-game dispatch chat is a separate channel and is
  not carried in the snapshot yet.

## [3.3.2] – 2026-08-11 — Pennsylvania CAD, a replay studio & an anticheat you can review

The biggest release LACORE has had. A **sixth terminal** (the Pennsylvania CAD), a **replay and
Director's Cut** suite for building trailers, the **in-car dashboard screen** grown into a terminal
you can actually read and click — with one per seat — and the **LAPD Mobile Client redrawn** as the
in-car terminal it always played.

Underneath that, the parts of LACORE that were showing their age got rebuilt: the **NativeUI menu
library is gone**, and with it the per-frame menu pump — settings, jobs, session and the vehicle
spawner are proper windows now. Agencies can be **gated per department** by Discord role or ACE,
txAdmin's bans finally **land in LACORE's list**, and the **anticheat** got the one thing it was
missing: a place to look at the result. It ships **on** for the first time, in a new **observe mode**
where it detects and scores but never punishes.

### Highlights

- **Pennsylvania CAD** — a sixth terminal in the style of a nineties county CAD. A re-skin, not a
  second dispatch system: same units, same calls, same server. A paid add-on, unlocked by licence key.
- **Replay & Director's Cut** — record what happens around you, rebuild the scene out of ghosts and
  cut it with a real camera: four modes, keyframes, a shot list, letterbox, grain, grades and depth
  of field. Made for trailers, deliberately not an admin tool.
- **The in-car CAD screen became usable** — legible at last (the terminal is zoomed into its texture
  rather than shrunk into it), it no longer glows like a lamp, `/cad` leans the camera in and hands
  you the mouse, `/cad adjust` aims it per vehicle model, and **every seat gets its own terminal**
  with a shared pointer between partners.
- **The LAPD Mobile Client, redrawn** — green phosphor on navy, the ribbon down to exactly its nine
  buttons, records glowing in the rail. Same wiring underneath; only the visuals changed.
- **An anticheat you can review** — a dashboard page with repeat offenders and false-positive marking,
  an **observe mode** (and therefore ON by default), a trust score that survives a reconnect, a
  challenged heartbeat, three new server-side detections, and every flag carrying what the player was
  doing in the ninety seconds before it.
- **The menu library is gone** — settings, the job/duty picker, the session menu, the vehicle spawner,
  the AOP ballot, the phone booth and the prop spawner are NUI windows now. `/jobmenu` opens a job
  menu for the first time, and the settings moved onto your profile's Settings tab, with a search box
  across every category.
- **Agencies can be gated** — `DutyAccess` asks for a Discord role or an ACE per department, and since
  the agency is what `/mdt` routes on, refusing the agency refuses the terminal.
- **txAdmin bans land in LACORE's list** — found automatically at every boot and mirrored live from
  then on, so the two lists stop disagreeing by an order of magnitude.
- **The player list is a duty board** — units on the left grouped by department, with availability per
  agency; civilians on the right. Three styles, and **players pick their own** in their settings.
- **`/lacorereport`** — a bug report from in game, straight to the LACORE dashboard (and onto your own
  dashboard as well, if you are licensed).
- **The config editor covers all 40 config files**, up from 18, with five starting templates.
- **Fingerprints work at all now** — enrol a suspect at booking, lift a latent off a vehicle with
  `/liftprint`, and a match is filed as evidence rather than printed in chat.

### Added

#### Pennsylvania CAD (new terminal)

- **A sixth terminal, in the style of an old county CAD.** Where the LAPD Mobile Client is a modern
  screen, this one is the terminal that has been bolted into a cruiser since the nineties: a left rail
  of F-key buttons, two stacked tables — **Current Units** over **Current Incidents** — a command line
  along the bottom and a `WAITING FOR RESPONSE` strip that lights up while the server is answering.
  Every button is a real F-key, and the button matching your current status greys out so you can see
  what you are without reading anything.

  It is a **re-skin, not a second dispatch system**. The units and incidents on it are the same ones
  the LAPD client, the dispatch console and every other terminal see; a call raised here shows up
  everywhere, and a call cleared here is cleared for everyone. Nothing is duplicated and nothing is
  hidden from the rest of the server.

  What it does that the other terminals don't:
  - **Elapsed time, not a clock.** Both tables show how long — `00h 17m` since a unit last changed
    status, `01h 08m` since a call came in. That is the number that tells a supervisor a unit has
    been sitting on the same status for an hour.
  - **Units on a call read warm.** Assigned units are orange in the list, so who is committed and
    who is free is a glance, not a comparison.
  - **Edit Columns.** Each table's columns can be switched off individually, per user.
  - **Create a Call** from the terminal itself, from a grid of call types the server owner writes.
  - **A hold-to-fire panic button**, pinned to the bottom of the rail. Holding it is deliberate — a
    stray click must never broadcast a panic — and it fires straight through without the on-screen
    keyboard the other backup buttons open.

  Open it with `/mdt` or `/penncad`. A department opts in by its **name**: any dept containing
  `pennsylvania`, `penn cad` or `mobilecom` gets this terminal instead of the LAPD one.

  > **This terminal is a paid add-on**, listed in the dashboard as its own product ("Pennsylvania
  > CAD"), so it is unlocked per licence key rather than by a switch in your config. Nothing to
  > install: it ships in the resource and turns itself on once your key carries the entitlement.
  > Until then a department tagged for it keeps whatever terminal it had — the tag is simply
  > ignored, so tagging a dept early is harmless.

  > ⚠️ **Config change — new file `configs/cfg-penn-sh.lua`.** It holds the department tags that
  > route a player here, the Create-a-Call type grid, the disposition codes, the plate-button label
  > and an optional cosmetic prefix for call numbers. It ships with sensible defaults and the
  > terminal works untouched; edit it only to opt your own departments in or to change the call-type
  > list.

  > **Two columns from the reference terminal are deliberately absent: Site/District and Latitude.**
  > LACORE has no station, beat or district concept to fill the first, and no latitude at all — call
  > coordinates are GTA world units, not degrees. Printing a world coordinate under a "Latitude"
  > header would be a number a player could write down and act on, and it would be wrong. A column
  > that is blank on every server forever is not a column, it is a header.

#### Replay & Director's Cut (new)

- **`/replay` records what happens around you and plays it back.** A player starts a take, and every
  player in range — plus whatever vehicle they are sitting in — is sampled ten times a second into a
  clip. `/replay stop` ends the take, `save` keeps it, `list` shows what you have, `play` rebuilds the
  scene out of ghost entities and watches it through a scripted camera. This is the raw material for
  trailers and highlight videos, and it is deliberately not an admin tool: playback is local to
  whoever started it, nobody else on the server sees it, and nothing in it is real.

  Clips are stored in a purpose-built binary format (`.lcr`) rather than JSON. One sample is 26 bytes,
  so a 3-minute take with 20 people in shot is about 900 KB of frame data and parses with
  `string.unpack` instead of a megabyte of decimal digits. Positions are interpolated on playback
  (Catmull-Rom — at 10 Hz a car covers ~3 m between samples, and interpolating that in straight lines
  makes a smooth drive read as a series of corners), rotation takes the short way round the ±180° seam,
  and a ped riding in a vehicle is put back in its seat rather than positioned on its own.

  On disk and on the wire the payload is base64-armoured, which costs a third more space (~1.2 MB for
  that same take). That is not decoration: a `.lcr` payload is **60% NUL bytes**, because floats and
  small integers are full of zeros, and the round trip through `SaveResourceFile` / `LoadResourceFile`
  and the event channel treats the buffer as a C string and stops at the first one. That NUL is byte 6
  — the high half of the version field — so an 11 KB clip came back as exactly 5 bytes: `LCR1` plus
  one. Base64 contains no NUL bytes and survives every one of those paths. A clip that is 33% larger
  beats a clip that is 99.96% missing.

  The index also records each clip's stored length, and a read that returns a different one now says so
  by name — that class of bug first showed up as a decode failure three steps away from its cause.

  > ⚠️ **New config file (`configs/cfg-replay-sh.lua`) and a new `Features.replay` toggle
  > (`configs/cfg-features-sh.lua`, ships ON).** Clips live on **your** server's disk, so this file is
  > mostly about what that is allowed to cost you: `maxDurationSec` bounds one take, and
  > `maxClipsPerPlayer` / `maxTotalBytesPerPlayer` bound one player (defaults: 20 clips, 20 MB — about
  > twenty 3-minute takes each). Both are enforced server-side, and a save past either is refused
  > rather than quietly pruning something. `saveCooldownSec` is what stops a modified client from
  > turning saves into disk hammering.
  >
  > Clips land in the resource's `data/` folder when it exists, and in the resource root when it does
  > not — because a resource cannot create a directory, and plenty of deployments do not carry an
  > empty one. Which of the two applies is decided by writing a probe file and reading it back, since
  > a write that silently goes nowhere is otherwise indistinguishable from one that worked. If it
  > falls back to the root, one line in the console says so.

  Known limits, stated plainly rather than discovered later:
  - **There is no video file at the end.** FiveM cannot encode video. This sets up the *shot* — the
    scene, the framing, the timing — and you capture it with OBS or ShadowPlay like any other
    gameplay.
  - **Only the poses in `Replay.animCandidates` are recognised.** FiveM has no native that asks a ped
    which animation it is playing, only one that checks a dict+clip you already name. Everything else
    replays as walk / run / idle chosen from how fast the ghost is actually moving.
  - **Ambient NPCs and traffic are not recorded yet** — only players and their vehicles. The format
    already has room for them.
  - **Ghost vehicles' wheels do not turn**, because they are positioned by hand rather than driven.

- **A Director's Cut window (`/replay`).** The clip library, the recording HUD, the playback overlay
  and the cutting-room editor, in two looks — LACORE blue, or a warm monospace "Cinema" grade for
  people who spend their evening in it. Which screen is up decides who gets the mouse: the library
  and the editor are windows and own the cursor, while the recording and playback HUDs deliberately
  do not take focus at all — someone mid-take is still playing, and someone watching a playback needs
  BACKSPACE to reach the game rather than a browser that swallowed the keyboard.

  Working from the window: start, stop, save and discard a take, browse the library with its live
  storage quota, play a clip, delete one, and open a clip in the cutting room. **Letterbox bars, film
  grain and vignette are real too** — drawn straight over the game, which is something a browser
  overlay is genuinely better at than Lua.

- **The cutting room, built to the design's own measurements.** 56px header, 300px scene panel, 360px
  inspector, 262px timeline, 110px track gutter, and a ruler with four stacked lanes: a time scale,
  SHOTS, KEYS and DATA. Scene rows carry an ON/OFF visibility toggle, the model name, a kind tag and
  either a `CAM` badge (this is what the camera is filming) or a `SET` button. The viewport draws the
  framing over the game: letterbox bars, a dashed safe-area guide, live readouts in three corners, and
  a scanline pass.

  Two places depart from the mock, both deliberately. The prototype fills its viewport with a "GHOST
  SCENE — PLACEHOLDER" card because it has no game behind it; here the game *is* behind it, so that
  rectangle is left transparent and everything drawn over it is kept exactly as specified. And the
  DATA lane, which the mock fills with a decorative waveform, shows real samples per second — where
  the bars dip, entities were out of recording range, which is the only reason to have that lane at
  all. (The ruler's marks also line up with the lanes, which in the mock they did not.)

- **The camera engine.** Opening a clip for editing no longer reads out a list of names: it builds
  the scene, parks it on frame one and puts a real camera in it, so the middle of the window is the
  shot rather than a picture of one.

  - **Four modes.** *Follow* sits behind the subject, *orbit* circles it, *fixed* stays put and keeps
    looking at it, and *free* is flown by hand — mouse to aim, WASD to move, E/Q for height, shift to
    hurry, alt to creep. Flying borrows the mouse from the browser, so the panels stay on screen but
    go click-through until you stop; ESC or BACKSPACE gives the cursor back.
  - **Keyframes that record the shot, not a number.** Adding a key captures where the camera actually
    is — position, aim and focal length — and a clip with two such keys flies the path between them
    instead of tracking anything. Keys without a pose still ease the field of view. Curves: linear,
    ease-in, ease-out, ease-in-out.
  - **A shot list that edits.** A shot owns a stretch of the clip and dictates the mode (and its
    subject) while the playhead is inside it. Shots **cut** at their boundaries rather than gliding
    between them, because that is what a shot boundary means; movement within a shot is what
    keyframes are for.

    Adding one at the playhead *is* a cut: the new shot runs to whatever starts next, and a shot
    already covering that moment is trimmed to end there. Each row can be renamed, have its in or out
    point pulled to the playhead, or be told to adopt whatever the camera is set to now — frame it
    first, then say "this shot looks like that". The list is kept sorted and non-overlapping, and an
    edit that would leave a sliver behind is refused with a reason rather than quietly producing a
    third-of-a-second shot or deleting a neighbour as a side effect.

    The viewport's mode readout reports what is actually in effect — the covering shot's mode, not the
    inspector's — because those two legitimately disagree while you are setting up the next shot.
  - **A transport that actually drives the scene.** The playhead is now a real one: scrub the ruler
    and the ghosts move with it, 0.25×–2× re-times them, pause parks them. Field of view, roll,
    distance, height and subject all reach the camera as you drag them. Hiding an entity in the scene
    list removes it from the shot.
  - Roll works, which sounds trivial and is not: the obvious way to aim a camera at something
    (`PointCamAtCoord`) rewrites the rotation every frame and silently discards the roll, so the
    look-at is computed by hand and applied where a dutch angle survives.

- **The look of a shot.** Letterbox (2.39:1, 1.85:1, off), film grain, vignette, five colour grades
  and depth of field, all live, and all landing in whatever you capture with because they are applied
  to the picture rather than to a preview of it.

  The grades are split across the two halves of this feature by what each half can honestly do, and
  the split is visible in the config:

  - A **tint** is a coloured sheet the UI draws over the game. It works on every build, needs no game
    assets, and can warm or cool a shot — but it can never *remove* colour. You cannot desaturate by
    adding paint. *Warm*, *Cold* and part of *Vintage* are this, and they are guaranteed to work.
  - A **timecycle modifier** is the game's own post-processing, and the only way to desaturate, crush
    contrast or fog a scene. The catch is that it is addressed by asset name, so a name the build does
    not have does nothing at all — silently. *Noir* needs one.

  So each grade's mechanism lives in `Replay.grades` and can be retuned per server, and the Look tab
  labels the two kinds differently: a grade that leans on a game filter says so, and tells you where
  to pick another if it looks unchanged. That beats five buttons where one quietly does nothing.

  **Depth of field** is real camera work (`SetCamUseShallowDofMode` and friends): the focus distance
  sets an in-focus band whose width is configurable, and the high-quality pass is re-requested every
  frame because it is a per-frame request, not a setting. **Clean mode** now suppresses everything of
  ours — the HUD, the flight banner, the busy strip, the viewport labels — so a capture has only the
  bars and the grade in it.

  > ⚠️ **Config additions (`configs/cfg-replay-sh.lua`): `Replay.grades` and the `Replay.dof*`
  > band.** The comments name the timecycle modifiers that ship with the game and are already used
  > elsewhere in LACORE, so they are safe to point at: `cinema`, and the `phone_cam` … `phone_cam13`
  > family the phone's own camera filters use. Which of those looks like what varies between builds —
  > if *Noir* does not come out monochrome on your server, try another number.
  >
  > A grade is cleared when the replay ends. That is deliberate and worth stating: a timecycle left
  > applied would tint the player's entire game afterwards with nothing on screen to explain why.

- **Debug logging for when a clip will not behave.** `Replay.debug` in `configs/cfg-replay-sh.lua`, or
  `/replay debug` to flip it without a restart — the client half immediately, the server half if you
  have admin permission, because verbose console output is not something a player should be able to
  inflict on an owner.

  It logs the things that fail *quietly*, which is the only kind worth logging: the path a clip
  resolved to and whether the write landed, chunk-by-chunk transfer with the byte counts on both ends
  (a short arrival names itself, since binary crossing an event channel is this feature's least certain
  moving part), quota and cooldown verdicts with the actual numbers, encode and decode results, models
  that would not load into a ghost, the timecycle name a grade resolved to — a name the build does not
  have is accepted without complaint and simply does nothing, so seeing it is the difference between
  "wrong name" and "subtle grade" — and every NUI focus change, because a focus taken and not given
  back is the worst thing this feature can do to a player. Per-frame state is deliberately left out;
  at 10 Hz a sampler would bury everything else.

#### In-car CAD screen
- **The Mobile Client on the dashboard is legible now.** It is the same terminal it always was — same
  layout, same ribbon, same look — but it was being drawn far too small to read, and the reason is worth
  stating because it is not the one everybody reaches for. It was never a shortage of resolution. It was
  three scalings stacked:
  1. the terminal is drawn at real pixel sizes for a **monitor** — 9px labels, 12px values;
  2. the browser renders it into a **texture** (864 x 1450 by default);
  3. that texture is then shown on the screen mesh, which while you are leaned in occupies roughly
     509 x 854 pixels of a 1080p monitor — so a 9px label arrives as about **5**, before the mipmap and
     the frame's temporal antialiasing get to it.

  Raising `width`/`height` does not help: it only makes step 3 worse. What helps is laying the terminal
  out at the size it was *designed* for and spending the surplus texture pixels on scale. So the screen
  now renders the Mobile Client **zoomed**: `#mdt-container` lays out at ~592 x 994 instead of
  864 x 1450 — its own window is 28vw x 92vh, about 538 x 994 on a 1080p monitor — and every glyph is
  drawn 1.46x larger into the same texture. That 9px label now lands at **7.7** monitor pixels, and the
  12px values at **10.3**, which is what they look like in the window.
  - **The zoom is worked out from the screen, not hardcoded.** Whichever axis runs out first, so the
    terminal is never laid out *smaller* than its own window in either direction — and never below 1, so
    a wide, short dash panel is left exactly as it was rather than being zoomed out into confetti.
  - **It is a zoom, not a transform.** Zoom is a layout property, so the browser's own hit testing
    accounts for it and the mouse coordinates `/cad` sends (in texture pixels) still land on what they
    look like they land on. A transform would have needed the same factor applied by hand on the Lua
    side, in a second place, forever.
  - `VehicleScreen.zoom` overrides it — `1` is the old raw behaviour, `2` is twice the size and half the
    rows on screen. ⚠️ Zoom trades content for legibility: the higher it goes, the fewer call rows fit.
- **The screen no longer glows like a lamp — and the reason was never the UI.** A vehicle can only offer a
  render target on a material the engine already knows, and those are **instrument clusters**: the one the
  shipped model uses is `script_rt_dials_feroci`, GTA's own name for the Feroci dial cluster. Dial
  clusters are built *self-illuminated* so they glow at night, so whatever is drawn there is treated as a
  light source — multiplied by the material's emissive factor and then run through bloom. The terminal's
  own background is `rgb(21,34,50)`, luminance **32 of 255**, all but black, and it still came out as a
  lit blue panel. Nothing in a resource can reach that emissive factor or the bloom; both live in the
  model. What can be changed is the input, and since the game *multiplies*, halving what is drawn roughly
  halves the glow. `VehicleScreen.brightness` does exactly that, and ships at **0.6**.
  - It is a black sheet at `1 - brightness`, not `filter: brightness()`, because the two are the same
    arithmetic — `c × b` against `c × (1 − a)` — while the sheet is one composited quad instead of a
    per-pixel filter pass over the whole document every frame, and it does not turn the page into a
    containing block for the terminal's own fixed positioning. It takes **no pointer events**, so clicks
    land exactly as before.
  - It sits above everything the terminal can draw, modals included — otherwise a dialog would have been
    the one thing on the screen still glowing.
  > ⚠️ **Config change (`configs/cfg-vehiclescreen-sh.lua`) — new `VehicleScreen.brightness`, shipping
  > `0.6`.** An existing config file has no such line and stays undimmed, so add it if you are keeping
  > yours. Set `1.0` to switch it off — worth doing if your model's screen is *not* emissive, where this
  > would only look dark.
- **Every button on the screen would have POSTed at the wrong resource.** Callbacks are addressed to the
  resource by name, and the name comes from `GetParentResourceName()` — which is injected into NUI
  *frames*. The dashboard is a DUI, a separate browser handed a texture, and it cannot count on that. The
  fallback was the literal string `lacore`, which is only right on servers running the standalone
  product; on the core it meant every click on the dashboard quietly went nowhere. The resource name now
  travels in the DUI's URL, so it is right on both.
- **A stripped dashboard terminal, for owners who want one.** `VehicleScreen.view = "incar"` swaps the
  Mobile Client for a much smaller screen: active incident, the call list, who else is out, and a status
  dock along the bottom that is on every tab. Everything on it is sized for a texture rather than a
  monitor and no control is smaller than a fingertip. Attach and detach, GPS, Code 6 / On Scene, request
  backup. Anything needing typed text — a name query, a comment — is deliberately **absent** rather than
  present and dead, because a DUI has no keyboard channel.
  - **Attached units on a call were always empty there.** It read `call.attachedUnits`, a field that
    exists only in the dev mock — the server puts the incident number on the *unit*, not a unit list on
    the call. Derived from the units list now, so it shows what it always claimed to.
  > **The default is unchanged: `"mdt"`.** `"compact"` is accepted as the old spelling of `"incar"`.
- **The Mobile Client on the dashboard screen of your patrol vehicle.** Live, while you drive, rendered
  into the model's own screen — the same terminal the MDT key opens, not a cut-down copy of it. Display
  only: it takes no focus, no controls and no keys, so nothing about driving changes.
  > ⚠️ **New config file (`configs/cfg-vehiclescreen-sh.lua`).** Ships enabled with one entry, for the
  > 2020 Interceptor Utility. Every other vehicle needs its own entry, because this depends on the
  > **model**: a screen has to be a surface the game can be told to draw on, and that is decided when
  > the model is built — a script cannot add one. `/lacore screen target` and `/lacore screen dui` tell
  > you which of the two routes your vehicle supports; run them once per model before adding it.
  - **Two routes, per model.** A named render target where the model declares one — that draws on your
    vehicle only. Otherwise the screen's texture is replaced, which works anywhere but swaps it for
    every vehicle of that model *on your own screen* (other players still see their own). The render
    target wins wherever a model offers one.
  - **It follows the terminal you have open.** Which tab, which incident, light or dark: all of that is
    decided inside the UI by clicking, never travels through the game, and so was invisible to the
    screen — it sat on Home while the driver worked in Calls. The open window now reports its view and
    the screen follows it. One direction only; the screen never argues back.
  - `VehicleScreen.width`/`height` should match the **shape** of the screen in the model, not just a
    size — the image is stretched onto whatever the modder built, so a square texture on a portrait
    tablet arrives squashed. It is also the cost of the feature: this is a real browser rendering
    continuously.
  - The screen exists only while you are sitting in a vehicle that has one, and it is released on
    leaving, on switching vehicle and on resource stop. A browser nobody is looking at is a leak.
- **`/cad` leans the camera in and hands you the mouse.** The terminal stops being something you read
  past and becomes something you use: the camera moves to the screen, the cursor maps onto it, and
  clicks land in the CAD. Run it again or press Escape to lean back out. Bindable to a key under
  *LACORE: Focus the in-car screen*; rename or disable the command with `VehicleScreen.focusCommand`.
  - The move starts from wherever you are already looking and eases in and out. A scripted camera that
    simply switches on jumps, however good its destination is, and a linear interpolation arrives with
    a jolt because it is still at full speed when it stops.
  - Looking, shooting and leaving the vehicle are held while the mouse belongs to the terminal —
    otherwise aiming at a button would swing the camera and clicking would fire the weapon. A held
    click is released if the pointer leaves the screen, so the UI is never left thinking a button is
    still down.
  - `VehicleScreen.cursorRect` says where the terminal ends up on your monitor once the camera has
    settled, and that is what the pointer is mapped through. If clicks land next to where you pointed,
    that is the setting to nudge — not the camera.
  > **No typing.** There is no keyboard channel into a browser rendered this way, so anything that
  > needs text — a name query — still wants the real terminal. The MDT key is unchanged.
- **The screen was the wrong shape.** `VehicleScreen.width`/`height` shipped at 768 x 1024 — a ratio of
  0.75. But the Interceptor's tablet lands on a 16:9 monitor at 0.265 of the width by 0.791 of the height,
  which is a ratio of **0.596**: the browser was rendering a fifth too wide and being squeezed onto the
  quad, so every glyph arrived horizontally compressed. Compressed text reads as soft text, which is why
  this hid behind "the screen is a bit blurry" for so long. The default is now **864 x 1450** — measured
  off `cursorRect` rather than estimated, and incidentally 60% more pixels.
  > ⚠️ **Config change (`configs/cfg-vehiclescreen-sh.lua`) — `VehicleScreen.width`/`height`
  > re-defaulted.** The new 864 x 1450 only reaches you if you take the new config file — an existing one
  > keeps its own numbers, so change them by hand if you are keeping it, and redo the ratio against your
  > own `cursorRect` if you have re-measured it with `/cad adjust`.
- **The passenger gets a terminal too — and you can see each other's pointer.** A two-officer unit is
  the case the dashboard screen is best at: one drives, the other works the CAD. Until now only the
  driver had a screen at all.

  Each occupant gets their **own** terminal, signed in as themselves — the passenger runs a plate as
  the passenger, and their callsign, status and active incident stay theirs. On top of that, everyone
  in the vehicle now sees where the others are pointing: a named, coloured arrow that follows their
  mouse across the screen and shows when their button is down.
  > **Pointers are shared; clicks are not, and not by omission.** Every terminal is signed in as its
  > own unit, so replaying the passenger's click onto the driver's screen would have the *driver*
  > self-assign to whatever the passenger tapped. You see where your partner is pointing — you each
  > still act as yourselves.

  The relay takes nothing on trust: the vehicle is read from the sender's own ped rather than from
  the message, the name on the arrow is the server's rather than the client's, coordinates are
  range-checked and the whole thing is rate-limited, so a modified client cannot put its cursor in a
  car it is not in or turn one into a broadcast channel.
  > ⚠️ **Config change (`configs/cfg-vehiclescreen-sh.lua`) — `passengers` now ships `true`,** with a
  > new `sharedCursor` next to it. A terminal is a full browser and this is one per occupied seat
  > rather than one per car, so a squad that rides four-up is now four browsers in one vehicle. Set
  > `passengers = false` for the old driver-only behaviour; `sharedCursor = false` keeps the extra
  > terminals but drops the arrows.
- **`/cad adjust` — aim the dashboard terminal without leaving the car.** Whether the in-car screen
  is usable comes down to two blocks of numbers per vehicle model: where the camera goes
  (`cam.pos` / `cam.look` / `fov`) and which part of your monitor the screen lands on
  (`cursorRect`, which is what the mouse is mapped through — get it wrong and your clicks land next
  to where you pointed, which reads as "the screen doesn't work"). Both shipped as one model's
  measurements and a comment saying to nudge them, which meant edit, restart, look, edit again.

  Now: the mouse aims the real camera, the arrow keys slide it through the cabin, the wheel raises
  it (Shift for field of view). Then click the top-left corner of the screen and the bottom-right —
  the frame is drawn live over your view. The finished config lines are printed to the F8 console,
  ready to paste. Nothing is written to your config from in game, on purpose.

#### Anticheat
- **An Anticheat page in your dashboard.** Every flag as a filterable table: what tripped, what the
  system did about it, the player's running trust score, and which server it came from. Above it, a
  **repeat-offenders** panel — because one player with six flags is a case, while six players with one
  flag each means a threshold wants tuning. Whitelisted hits are shown too, greyed out and labelled:
  an admin who keeps tripping the aimbot heuristic is the clearest tuning signal there is.
  > ⚠️ **Config change (`configs/cfg-anticheat-sh.lua`) — new `Anticheat.Report` block.** It ships
  > **disabled**, and deliberately: a flag is an accusation about a named player, so turning this on
  > sends the detection, the action taken and that player's identifiers out of your server to your
  > dashboard account. It never *moves* anything — your own database and Discord webhook keep
  > receiving everything exactly as before, this is strictly an additional copy. Needs an active
  > licence key, which is what attributes flags to your account.
  >
  > Reporting is batched (one upload per interval, so a flag storm is one request), bounded (the
  > queue drops its oldest entries rather than growing without limit if the uplink is down) and
  > fire-and-forget — it can never slow down or block a punishment.
- **Flags carry the trust score.** `AC.trustOf(src)` exposes the running total, so a reviewer can tell
  a single blip from a player who has been at it all evening without reading the whole log.

- **An observe mode — and the anticheat is now ON by default because of it.** Everything detects, logs
  and scores; nothing is kicked or banned, and every log line says what it *would* have done. This
  existed as a gap, not a feature request: the anticheat had exactly two states, off or live, so
  tuning it meant going live and risking a wrong ban on your own players. Almost nobody did, and an
  anticheat that is off protects nobody however good it is. Run observe for a week, watch what your
  own admins and your busiest firefights trip, then set `Mode = "enforce"`.
  > ⚠️ **Config change (`configs/cfg-anticheat-sh.lua`) — `Enabled` now ships `true`, with the new
  > `Mode = "observe"`.** On update your server starts *detecting* where it did not before, so
  > expect anticheat lines in your Discord admin log. Nobody is kicked or banned until you switch to
  > enforce. To go back to silence, set `Enabled = false` — one line, exactly as before.
- **The trust score survives a reconnect.** It was kept per session and wiped on disconnect, which
  quietly defeated the escalation design it exists for: the config promises that "only a persistent
  offender racks up points", but a player who stopped at 7 and rejoined came back at 0 — reconnecting
  was a full reset, and the one mechanic meant to catch repeat offenders was the easiest to sidestep.
  Scores are now kept per identifier and decay across the gap exactly as they do during clean play,
  so someone who earned a few points and stayed away a day still returns clean on their own. Entries
  that decay to nothing are pruned, so the store does not grow for every player ever seen.
- **A resource guard.** Stopping LACORE takes the whole anticheat down with it. That is also a
  perfectly ordinary thing for an owner to do, so this logs and never punishes — but if the resource
  goes down at 3am with forty players connected and nobody scheduled it, there is now a line saying so.
- **Observe and whitelist states are visible in the dashboard.** A flag that was decided but not
  carried out shows the action it *would* have taken next to an `observed` tag, with the row muted and
  the detail sheet reading "Action decided" rather than "Action taken". Showing `BAN` for a player who
  was never banned would have been worse than showing nothing.

- **The heartbeat is now proof rather than a formality.** It carried no payload: kill the anticheat
  thread, start your own loop firing the same bare event, and the server saw a healthy client forever —
  so the one check meant to catch a disabled client was the easiest thing on the list to defeat. Each
  beat now answers a fresh challenge, and a wrong or missing answer is its own detection. Reusing the
  digest the anti-dump handshake already had, so this adds a check rather than a mechanism.
  > The ceiling is honest and unchanged: someone who has already dumped the client can reimplement the
  > digest. What stands in their way is the salt being *yours*, which is why the server nags while it
  > is still the shipped default.
- **Evidence arrives with the story around it.** A screenshot on its own rarely proves anything. Each
  one now carries position, health and armour, whether the player was in a vehicle, the trust score,
  and the last five flags with how long ago each fired — gathered when the picture comes back, so it
  describes that moment rather than the moment it was requested.
- **You can tell the anticheat it was wrong.** Any flag in the dashboard can be marked a false positive,
  and the page turns those marks into the number that matters: the share of each detection you have
  called wrong. One mislabelled row is noise; `SPEED_HACK` sitting at 40% is a threshold to raise — and
  there was no way to say that before. Marking is reversible and only ever affects your own account's rows.
- **Three new server-authoritative detections.** All of them run on the server, so a patched-out client
  anticheat does not hide them, and all three default to feeding the trust score rather than acting —
  a new detection is exactly where a false positive is most likely, and observe mode means you will see
  them before they can do anything anyway.
  - **On-foot speed, measured server-side.** There was a hole here: the only speed check was the
    client's, and the server sweep's teleport check needs 700 m in one sample. Anything between a brisk
    jog and that threshold — up to about 140 m/s — crossed the map unremarked once the client check was
    gone. The sweep now derives speed from position samples it was already taking, so it needs no new
    data, and requires two consecutive implausible samples so a player who drives briefly inside one
    interval cannot be flagged for it.
  - **Explosions attributed to someone who is nowhere near them.** Catches both blaming another player
    and scripts detonating at map coordinates. The distance is set far beyond any real throw or launcher
    flight, so ordinary combat cannot reach it.
  - **Blacklisted vehicles caught while being driven, not only when spawned.** The existing check fires
    on entity creation, which misses a vehicle that predates the resource start or arrived by a route
    that raised no event. The sweep simply asks whether you are sitting in one.
- **The platform hardening is now checked, not just recommended.** The config has suggested four
  server.cfg convars for a long time and only ever verified one of them. At boot the server now names
  which of `sv_scriptHookAllowed`, `sv_pureLevel`, `sv_enforceGameBuild` and `sv_filterRequestControl`
  are unset — these work below anything a resource can do, and they are worth more than most detections.
- **Every flag now says what the player was doing just before it.** A detection code tells you what
  tripped, never what led there — and that is usually the whole question. `GOD_HEALTH · hp=300` reads
  like a cheat until you see the same player was revived twice forty seconds earlier, at which point
  it reads like a bug in a revive script. Each flag's Discord log now carries a short buffer of what
  came before it:

  ```
  **Leading up to it**
  -42s · duty · on duty as Fire/EMS / AMR
  -38s · spawn · respawned / revived (immunity window granted)
  -21s · vehicle · entered a vehicle (model 1171614426)
  -12s · health · health 100 → 300
  - 3s · flag · GOD_HEALTH → log (server hp=300)
  ```

  It records respawns and revives, duty changes, getting in and out of vehicles, weapon switches,
  health jumps and earlier flags — including the ones that only logged, so a second detection arrives
  with the first already in its story. The sampler writes **changes only**: a player standing still
  produces an empty buffer rather than two hundred identical lines. `/lacore accontext <serverId>`
  reads it for anyone online without waiting for them to trip something.

  The buffer is bounded twice — 40 lines and 90 seconds by default, whichever runs out first — lives
  in memory, and is dropped the moment the player disconnects.

  > ⚠️ **Config change (`configs/cfg-anticheat-sh.lua`) — new `Anticheat.Context` block.** It ships
  > **on**, which is a deliberate exception to how new anticheat features arrive here: this one sends
  > nothing anywhere. It attaches text to a Discord log you were already receiving, and it is
  > explicitly **not** added to the dashboard report — that payload is documented line by line in the
  > same config, and widening it silently would be the wrong way to add a feature. Set
  > `Context.enabled = false` to switch it off.
  >
  > The sampler half needs OneSync (server-side entity natives); without it the event-driven half
  > still works and the module says so once at startup.

#### Duty & permissions

- **One department, one role, one portal — agencies can now be gated by Discord role or ACE.** LACORE
  already asked for a Discord role before letting anyone go on duty as *Law Enforcement*; what it
  never asked was *which agency*. So an officer with only the CHP role could still go on duty as LAPD
  and get the LAPD terminal. `DutyAccess` in `configs/cfg-server-sv.lua` closes that: each agency
  short code (`LAPD`, `LASD`, `CHP`, …) names what it requires. Because the agency is what `/mdt`
  routes on, refusing the agency refuses the portal — there is no second gate to keep in sync, and no
  way to reach a terminal you were not allowed to be a member of.

  Either kind of permission works, and an agency may name both — holding **either one** is enough, so
  you can move a department from one to the other without a flag day:

  ```lua
  agencies = {
      LAPD = { role = "LAPD" },                          -- Discord role, nothing else to set up
      LASD = { ace  = "lacore.duty.lasd" },              -- ACE object
      CHP  = { role = "CHP", ace = "lacore.duty.chp" },  -- either one
      NPS  = { role = { "NPS", "1285460493619953720" } },-- role key from DiscordAuth.roles, or a raw id
  }
  ```

  `role` is a key from `DiscordAuth.roles` — the same table the duty whitelist already uses — or a raw
  Discord role id, so a department role does not have to be registered first. `ace` suits a
  vMenu-style server that already maps Discord roles to ACE groups: keep the `group.lapd` principals
  you have and grant them the LACORE ace once in your `server.cfg`, `add_ace group.lapd
  lacore.duty.lapd allow`. (ACE tests ace *objects*, not groups — that line is what connects the two.)

  The check runs **server-side** in the duty event, so a client cannot talk its way past it, and it is
  deliberately not waived by the ESX/QBCore bridge — on a server that gates agencies, the gate is the
  last word. Agencies you do not list stay open unless you set `fallback = "deny"`, which flips it to
  a strict allowlist. Staff and dev bypass by default (`bypassStaff`), and civilian `/job` names are
  never touched, so a strict allowlist cannot lock a mechanic out of their own job. A role-only agency
  on a server whose Discord auth is off or idle cannot be answered either way, so it falls back to
  your `fallback` and says so in the console once — rather than silently refusing everyone for a
  reason no one can see.

  Two smaller things came with it, because the feature is unusable without them. `/dutyaccess` prints
  the caller's agency access as a `+`/`-` list with what each one wants, which is the difference
  between "my add_ace line has a typo" and "the gate is broken". And a refused duty request now
  actually *un-does* itself on the client: `/onduty` applies the job and hands out the agency's
  loadout the instant it is typed, long before the server has had its say, so until now a denied unit
  kept the weapons and a UI that believed it was on duty. The client is put back to civilian and the
  loadout that agency handed out is taken back — only those weapons, not everything the player is
  carrying. That also repairs the older `DutyRoles` refusal, which had the same hole.

  > ⚠️ **Config change (`configs/cfg-server-sv.lua`) — new `DutyAccess` block.** It ships **disabled**
  > (`enabled = false`), so nothing changes until you turn it on. Existing configs are not rewritten:
  > if your file predates this update it simply has no `DutyAccess` table, which reads the same as
  > disabled.

#### Session & duty

- **`/jobmenu` finally opens a job menu.** It never did: `jobMenu` existed, but the entire body of its
  builder was commented out, so the command quietly opened the *session* menu instead and the "Jobs"
  page stayed empty. There is a real duty picker now — every agency from `configs/config.lua` as a
  card with its short code, full name and branch, a search box, a callsign field, and one button. No
  more remembering that the Highway Patrol answers to `CHP` and typing `/onduty CHP 8-ADAM-21` blind.

- **It shows you which agencies you may actually take.** Agencies the `DutyAccess` gate would refuse
  are greyed out and marked, instead of letting you pick one and be told no a second later. The list
  comes from the **server** on open, because that gate lives in a server-only config the client cannot
  read — and it is a preview, not the decision: `ondutyServer` re-checks every request, so a client
  that lies to itself gains nothing.

- **The session half is a window too.** Roleplay and personal session as two cards with the current one
  marked, and the personal-session settings — map, time of day, AI population — inline instead of
  three levels down a submenu. Time is now an hour you pick (00:00–23:00); the old list was indexed
  from 1, so "1:00" was entry one and midnight sat at the bottom labelled "0:00".

  Going on duty from the window calls the same `GoOnDuty` the `/onduty` command does — the membership
  gate, the loadout and the server round-trip are one code path, not two that can drift.

#### Settings

- **The settings moved into your profile.** They were a NativeUI list: one category per submenu, one
  setting per row, arrow keys to move, left/right to change a value, and no way to see what you had
  set without walking through all seven submenus. They are now a panel on the **Settings tab of
  `/profile`** — categories down the left, toggles as switches, short option lists as segmented
  buttons, longer ones as dropdowns, and a **search box that spans every category**, because "where
  was the blip toggle again" is the question the old menu answered worst. Each hit shows which
  category it came from. There is a reset-to-defaults with a confirmation step, and changes save the
  moment you make them — the old menu did too, but never said so.

  **`/settings` and the settings keybind now open the profile there**, rather than a window of their
  own. A player has exactly one place for their own things — playtime, characters, vehicles, records,
  the emote radial — and settings were the one part of that list which opened somewhere else. That
  tab previously held nothing but a read-only licence table; the licences stay, with the settings
  above them. On an already-open profile `/settings` **switches to that tab** instead of closing the
  window, because typing it while looking at your characters means "take me to settings".

  Nothing moved underneath it. `settingsTemplate` in `client/core-cl.lua` is still the single place a
  setting is declared, values still live behind `GetUserSettings`/`SetUserSettings` in the
  `LACORE:SETTINGS` KVP in exactly the same shape, and `onChange` events still fire on every write. So
  every reader in the resource is untouched, your saved settings carry over, and **adding a setting is
  still one line in the template** — it now appears in the profile with no UI work at all. The
  template and the current values travel with every profile payload, so the tab has its data however
  the profile was opened.

  Two things the old menu could not do at all: the labels are translatable (a `lang/<code>.json` key
  derived from the setting's name, falling back to the template's English), and a reset fires each
  `onChange` **once, after** everything is written — the old path would have run `RefreshBlips` six
  times against half-applied state.

  This also removes the settings menu from NativeUI, which is the first step of retiring that library:
  `CreateSettings` is gone from `client/menus-cl.lua`, and `client/settingsui-cl.lua` replaces it —
  now as the data half only, handing the profile the template and validating what it writes back.

#### Vehicle spawner

- **`/vehicle` is a searchable window instead of a submenu maze.** The old menu had two trees — "by
  class" and "by manufacturer" — so finding a car meant knowing which branch it sat under, scrolling a
  NativeUI list of every model the game ships, and having no way to search at all. It is one filtered
  list now: type a name **or a model code**, narrow by class and manufacturer *together* (the two
  trees could never be combined), and each card shows the display name, the make, the class and the
  spawn code — the last of which is half the reason to open a spawner in the first place. The eight
  cars you spawned most recently sit at the top, kept locally.

- **It can be restricted now — and by default it still isn't.** `/vehicle` has always been open to
  everyone: any player could put any vehicle in the game in front of themselves, with no check
  anywhere in the command or the spawn path. `VehicleSpawner.permission` in
  `configs/cfg-server-sv.lua` closes that when you want it closed. The client asks the **server**
  before the window opens, because a client-side gate answers to the client; the window only builds
  its catalogue once the server agrees, and the spawn callback refuses any model that is not in that
  catalogue, so a player who never got the window has nothing to spawn from. Denials are logged to
  your admin webhook.

  ```lua
  VehicleSpawner = { permission = "vehiclespawner" }   -- then in server.cfg:
  -- add_ace group.admin lacore.vehiclespawner allow
  ```

  It goes through the same `HasPermission` helper as everything else, so `command.<perm>`,
  `lacore.<perm>` and a bare `<perm>` all satisfy it, and devmode plus Staff/Dev pass regardless.

  > ⚠️ **Config change (`configs/cfg-server-sv.lua`) — new `VehicleSpawner` block.** It ships **empty**
  > (`permission = ""`), which means *everyone*, exactly as before. Turning this on silently would
  > break servers that hand the spawner to their players on purpose.
  >
  > This gates the LACORE spawner, not the ability to create vehicles: a client that is already
  > cheating never needed the menu. That remains the anticheat's entity sweep.

- **It no longer costs every player a slower join.** The catalogue was built during startup: walk every
  vehicle model in the game, three game-text lookups each, then create a NativeUI submenu and item per
  entry — paid on every join by everyone, including the players who never type `/vehicle`. It is built
  on first open now and cached for the session.

#### The menu library is gone

- **Every menu in the resource is a NUI window now, and `client/nativelacoreui.lua` has been deleted
  with them.** The last three followed the settings, vehicle, session and duty windows:

  - **The AOP ballot** shows its own countdown next to the options. The old menu put the remaining
    time in a text entry elsewhere on screen, so you could never see "what am I voting on" and "how
    long do I have" at the same time. The vote itself is unchanged — one `SendAOPVote` per ticked area.
  - **The phone booth** is a searchable directory grouped into services, departments on duty and
    players, instead of one flat page that grew with the player count.
  - **The prop spawner** filters by category *and* name in one list. Props are looked for by what
    they are — "cone", "bollard" — not by remembering whose category they landed in. Its devmode
    crosshair loop no longer runs at 0ms for the whole session; it idles at 500ms unless the spawner
    is actually open.

    > ⚠️ **It answers to `/propspawner` now, not `/prop`.** `modules/civilian/civilian-cl.lua`
    > registers `/prop` as well and loads later, so FiveM had been keeping *its* registration — the
    > scenery spawner was unreachable, and `/prop` opened the civilian prop radial instead. Renaming
    > it is what makes the module usable at all; the radial keeps `/prop`.

  With the last menu gone, so is the **per-frame menu pump**: `_menuPool:ProcessMenus()` ran on every
  single frame for every player, all session, to service menus that were almost never open.

- **A dead command was removed.** `modules/character-cl.lua` registered `/character`, but
  `modules/mdt/mdt-civilian-cl.lua` registers the same command and loads later, so the older menu had
  been unreachable — FiveM keeps the last registration. Nothing else in the resource referenced any of
  its functions. The command still works; it opens the civilian sheet it has been opening all along.

#### Player list
- **The "I" board is a duty board now.** It used to be one flat, alphabetically indifferent list of
  24 players per page, which made the question people actually open it for — *who is on duty and what
  are they doing* — a paging exercise. The board is now split: **units on the left, grouped by
  department**, each with callsign, roleplay and account name, status and ping; **civilians on the
  right** as a dense two-column roster. Units are never paged, because an answer to "who is on duty"
  that is split across pages is not an answer. The arrow keys page the civilian roster instead.
  - The header carries the **area of play**, your community name (from `cfg-branding-sh.lua`, so it
    is your name and not ours), players online, units on duty, units available, and the local time.
  - **Every department says how many of its units are available**, next to the on-duty total: `LAPD ·
    4 on duty · 2 available`. "Six units are on" and "six units can take your call" are different
    answers, and the board was only giving the first one — so a dispatcher had to read every status
    badge in a column to work out the second. Available means `CLEAR` and nothing else, the same rule
    the server counts LEO and Fire availability by, so the two can never disagree. A department with
    nobody clear turns its number red rather than hiding it — zero available is the state most worth
    seeing.
  - A **status strip** shows the server alert, whether 911 dispatch is staffed, and who is allowed to
    connect — the three things that were previously buried in a side column.
  - Each unit row's left edge carries its **status colour**, the same palette the MDT status buttons
    use, so a screen full of red or green reads at a glance without anyone reading a word.
  - Departments are coloured from their **name**, so LSPD is the same blue on every client and does
    not change colour when another department goes off duty. The colours are now shared with the
    radio log, which had its own copy — so a department finally looks the same in both places, and
    an agency the list did not know by name gets a colour of its own instead of the same grey as
    everyone else.
- **Two styles, your choice.** The duty board is a lot of screen, and not every server wants it — a
  mostly-civilian community does not open the list to find out who is on shift. `HudCfg.playerlistStyle`
  picks between them:
  - `"duty"` (default) — the full board described above.
  - `"minimal"` — one compact centred card: server ID, account name, character name, ping, and
    department plus callsign for anyone on duty. No grouping, no server panel, no split. Its header
    still carries on-duty **and** available counts for the whole roster, because that number is worth
    one line even when the layout isn't.

  Both read the same data, honour the same key and the same arrow-key paging; only the drawing differs.
  The minimal card pages the whole roster as one list rather than splitting it, so the two send
  different payloads and each ships exactly the rows it draws — nobody pays for the board they did not
  pick. A value that is neither is reported once in the console and falls back to the duty board,
  because a typo should not look like a setting that does nothing.
  > ⚠️ **Config change (`configs/cfg-hud-sh.lua`) — new `HudCfg.playerlistStyle`.** It ships `"duty"`,
  > so an untouched config keeps the new board. Set it to `"minimal"` for the compact card.
- **Every row now says server ID, account name and character name — all three, everywhere.** Each
  board had two of the three and a different two: a unit on the duty board showed both names but no
  ID, a civilian showed the ID and the account name but never the character behind it, and on the
  minimal card anyone on duty lost their character name to the department-and-callsign block. So the
  one thing an admin opens the board for — *which ID is that, and who is playing them* — was never on
  a single row. It is now.
  - **Units on the duty board carry their server ID** in front of the callsign. A unit is addressed
    by callsign in character; every admin command takes the ID, and it was the one number the board
    would not give you.
  - **Civilians carry their character name** next to their account name. The two share the row evenly,
    so a long Steam name cannot push the roleplay name off it, and the roster stays two dense columns
    — no extra line per player, no fewer players per page.
  - **The minimal card shows the character name on every row**, on duty or not, and got wider to fit
    it. The department and callsign next to a unit say which callsign is talking, not who is playing
    it.
  - Someone still in the spawn or freeroam session shows the **session** where the character name
    goes, exactly as before — they have not picked one yet, and that is not an error.
- **Nothing about either board takes focus.** Both are pure overlays that never swallow a keypress
  or a click, exactly as before.
- **Players pick their own player list.** The three layouts were a server-wide setting, which is the
  wrong place for a preference about how much of *your* screen a board covers. **Settings ▸ Player
  Location Display ▸ Player List Style** now offers *Server default*, *Duty board*, *Minimal card* and
  *Bar*. It ships on *Server default*, so nothing changes for anyone who does not touch it, and
  `HudCfg.playerlistStyle` keeps doing exactly what it did — it is now the default rather than the
  verdict. Adding it was one line in `settingsTemplate`, which is what the settings panel was rebuilt
  for.

  Option names in the settings panel are translatable now as well (`setopt_<slug>`), because
  "Server default" is a sentence rather than a proper noun like "Millennium" or "Satellite".

- **A third layout: `"bar"`.** The duty board and the minimal card are both panels in the middle of
  the screen — fine for a glance, in the way if you keep the list open. The bar is the other shape:
  two surfaces along the top edge, a few rows deep. On the left the roster as a card grid — server
  ID, account name, and either the character name or the unit's department and callsign in its
  status colour — laid out column-first so each column reads top to bottom, with the player's role
  as a coloured underline. On the right a server panel: area of play and how long it has stood, the
  access state, whether a 911 dispatcher is on, and LEO and Fire/EMS strength. Every value comes
  from the payload the other two boards already read. `duty` and `minimal` are untouched and `duty`
  is still the default.

  ```lua
  HudCfg.playerlistStyle = "bar"   -- "duty" (default) · "minimal" · "bar"
  ```

  > ⚠️ **Config note (`configs/cfg-hud-sh.lua`)** — no new key, `playerlistStyle` simply accepts a
  > third value. Nothing changes unless you set it.

- **Fixed while adding it: the duty board rendered on top of any style it did not recognise.** Its
  visibility check read "not minimal" rather than "is duty" — correct while there were exactly two
  styles, and wrong the moment there were three: the bar and the full board drew at the same time.
  Both boards, and the NUI message handler, now name the style they mean, and anything unknown falls
  back to the duty board on both sides.

#### Bug reports
- **`/lacorereport` — a bug report straight to the LACORE dashboard.** Reports go over the same relay
  channel telemetry already uses, not into your own database: this is how a bug in the resource itself
  reaches the people who fix it, rather than sitting in a Discord channel nobody at LACORE reads. A
  small form opens with a category and a message; the player's account name, character name if they
  have one, department, callsign and position travel with it automatically, so "the MDT drops my status"
  is traceable to an actual unit instead of an anonymous line of text.
  - **Stored regardless of licensing.** An anticheat flag is only useful with an account to review it
    against, so that feed drops anything unlicensed. A bug report about the product is useful to us
    either way — if anything, an unlicensed dev server is exactly where a rough edge is likeliest to
    show up first. So every report reaches the LACORE team; a server with an active
    `lacore_license_key` additionally gets its own rows on its own dashboard, under **Bug Reports** —
    see which of your players is reporting something, without leaving your own admin panel.
  - **Rate-limited server-side, not just in the form.** `Report.cooldownSec` (120s by default) is
    enforced by a table the server keeps per source id; the client mirrors it for the countdown label,
    but a modified client cannot skip the wait because that copy is never what gets checked.
  - **Your own copy stays optional.** Set `Webhooks.BugReport` (`configs/cfg-server-sv.lua`) to also log
    every report to your own Discord — the same "additional, never a replacement" rule every webhook in
    that file already follows.
  > ⚠️ **New config file (`configs/cfg-report-sh.lua`)** — command name, cooldown, max length and the
  > category list. Also gated by the new `Features.bugreport` (`configs/cfg-features-sh.lua`), for
  > owners who prefer one place to switch features off; either setting disables the command entirely.

#### Bans & playerbase
- **txAdmin bans and warns now land in LACORE's ban list too.** The two systems each kept their own
  database and had never heard of each other: `/ban` and `/warn` from the core write
  `data/banlist.json`, txAdmin writes its own `playersDB.json`. On a team that works in the txAdmin
  panel — which is most teams — that left the LACORE list nearly empty. It showed up as a number that
  made no sense (`6 bans · 0 warns` next to 94 and 51 in txAdmin), but the real cost was quieter:
  `/lacore bans upload` would have reported a cheerful "✓ Shared" after uploading six records while
  ninety stayed home. Two halves close it:
  - **A sync that finds txAdmin's database by itself.** On every start LACORE looks for
    `playersDB.json` beside the server and carries over what it finds. Nothing to copy, nothing to
    configure, nothing to redo after the server moves. It runs at each boot rather than once because
    that also covers bans issued in the panel while the server was **down**: those fire no event, so
    the live bridge alone would never see them. Repeating is free — records keep txAdmin's own action
    id — and bans an admin already lifted or that have run out are skipped rather than resurrected.
    The console stays quiet unless something actually came across.
    > **Where it looks.** A configured data path first, then txAdmin's own; then the artifacts folder,
    > which is where txAdmin puts `txData` by default and which LACORE derives from the running
    > `monitor` resource; and finally the folders above its own, plus the ones **beside** them. That
    > last part matters on the common Linux split where the artifacts and the resources live in
    > separate trees — `/home/FXServer/server` next to `/home/FXServer/server-data` — because walking
    > straight up from a resource in the second one never passes a `txData` at all.
    >
    > There is no official channel for any of this: txAdmin's history routes want an authenticated
    > admin session, and its resource-facing token does not cover the database. So the file is read
    > directly, and since it lives outside the resource, both ways a server script can reach outside
    > are tried in turn. Some FXServer builds allow neither. When it comes up empty the command says
    > how many paths it tried and **lists the folders it searched** — a layout nobody guessed looks
    > exactly like a build that refuses the read, and the list is what tells the two apart. Usually one
    > line in it is your own path, off by a folder.
  - **`/lacore bans import`** — the same thing on demand, with the full account: which file it found,
    how many actions it holds, and what was skipped and why.
  - **A live bridge** — every future txAdmin ban and warn is mirrored as it happens, so the two lists
    do not drift apart again. Mirroring is local bookkeeping: nothing leaves your server. Sharing
    stays the deliberate `/lacore bans upload`.
  > ⚠️ **Config change (`configs/cfg-integrations-sh.lua`) — new `Integrations.txAdminBans` and
  > `Integrations.txAdminDataPath`.** The first ships `"auto"`: the bridge is active when txAdmin is
  > running. Set it to `false` to keep the lists separate. The import is a manual command and runs
  > regardless. The second ships empty and should stay that way — it is the escape hatch for a layout
  > the search does not recognise, and `/lacore bans import` tells you when that is the case. Give it
  > the `txData` folder (the one holding `<profile>/data/`), e.g. `/home/FXServer/server/txData`;
  > `setr lacore_txdata_path "…"` in `server.cfg` does the same and takes precedence.
  >
  > A detail worth knowing if you inspect the file: imported records keep LACORE's own numeric `id`
  > and carry txAdmin's id in a separate `txId` field. `BanPlayer()` derives the next id by adding one
  > to the last entry's — a txAdmin id (`ABCD-1234`) sitting in that field would have made the next
  > `/ban` fail on the arithmetic.

#### Fingerprints

- **The scanner never identified anybody.** `fingerprint-sv.lua` resolved the suspect's identifier
  through a *global* `LicenseOf` — and there is no such global: every module that has one declares it
  `local`. The call evaluated to nil, the profile lookup found nothing, and the device answered "no
  match" for every scan since the feature shipped. It now uses a shared helper and actually reads the
  records store, which is what everything below depends on.

- **Prints are something you take.** A print match should mean "we have this person's prints", not
  "this person exists in the database". Officers can now enrol a restrained suspect straight from the
  device — the result screen says whether prints are on file and offers to take them if they are not.
  The register persists to `data/fp_prints.json`.

- **Latent prints, and a reason to have taken them.** `/liftprint [incident]` lifts a print off the
  nearest vehicle. The lift is **anonymous**: the server knows who left it and will not say. Run it
  from the device's new **Prints** tab and it comes back with a name only if that person has been
  printed — otherwise "not in the register", and it stays open until they are. Book the suspect, take
  their prints, run the print again: now it matches. That loop is the entire point of taking prints at
  booking, and it is what the module was missing.

  Who left a print is not guessed. The client reports the plate when a player gets into a vehicle, so
  a latent resolves to "these people sat in this car recently" — capped per vehicle, aged out (a print
  from three hours ago is not evidence), and the officer's own touch is excluded, so you cannot lift
  your own print off the cruiser you just parked.

- **A match becomes evidence, not a chat line.** It is filed on the identified person's record through
  the same path the MDT's evidence button uses (`LogEvidenceRecord`, refactored out of the net event in
  `characters-sv.lua` the way `CreateBoloRecord` was), so it lands in the file with a tag, a location,
  the incident number and a chain of custody.

  > ⚠️ **Config change (`configs/cfg-fingerprint-sh.lua`) — new `Register` and `Latents` blocks.**
  > `Register.required` ships **false**: a scan still identifies from the records profile as before and
  > only *reports* whether prints are on file. Turning it on retroactively would make the scanner
  > useless on a server whose population has never been printed — that call is yours, not ours.

#### Config Editor

- **The editor now covers every config file that has options — 40 of them, up from 18.** It walked you
  through branding, the world and the CAD and then stopped, which meant the half of LACORE added since
  it was written had no coverage at all: records and evidence, fingerprints, the supervisor panel,
  spawn selection, vehicles and the in-car screen, the civilian radial and turf, replay, radio
  speech-to-text, the retro phone, the audit log, bug reports, and integrations with housing, txAdmin
  and third-party dispatch. Twelve new steps, 96 new options, each with the same inline explanation of
  what it actually does.

- **Three defaults in it were wrong, and two options no longer existed.** Verified by generating every
  line the editor can produce and running it against the real config files: `SyncGameTime` ships
  `false` not `true`, the eyefind URL had moved, and the anti-cheat has been **on** by default since
  it gained observe mode — the editor still showed all three the old way, which is worse than showing
  nothing. The two dead ones were anti-cheat thresholds that moved into
  `modules/anticheat/anticheat-params-sh.lua`; the editor would have written lines that do nothing.
  Thresholds stay out on purpose now: that file is obfuscated by the escrow build precisely so the
  resource does not ship a printed guide to evading its own detections.

- **Five starting points.** The editor opened on a blank slate and asked 199 questions, which is the
  right depth and the wrong first step. It now offers a template for the shapes of server LACORE
  actually gets installed on — law-enforcement roleplay, an ESX/QBCore server, a vMenu/ACE-driven one,
  a small community with no setup, and a large server where performance comes first. Each sets a
  handful of answers and leaves the rest alone, so it is a head start rather than a different product;
  picking a second one resets to defaults first, so two templates never stack.

  The two settings added this release — the agency gate and the vehicle-spawner permission — are in
  the editor too, which is what lets the vMenu template configure them in one click.

- **Tri-state options generate real Lua.** Settings like `Integrations.txAdminBans` accept `"auto"`,
  `true` or `false` — a string *and* two booleans. The editor quoted all three, so choosing "always"
  wrote `= "true"`, which the config compares with `== true` and never matches: it silently behaved
  like "auto". Those options now emit `true` and `false` unquoted.

#### LAPD MDT
- **Your status follows the call you are on.** The unit-status grid is gone from the Home screen.
  Status is now set by the things you were already doing: Enroute and Station from the toolbar,
  Code 6 and Traffic Stop when they create an incident, and **CLEAR** from the status dropdown to
  hand the call back. Every status is still available directly from the status
  badge in the command bar — that stays as the deliberate way to reach BUSY and UNAVAILABLE, which
  belong to no incident at all.
- **Code 6 while you are already on a call no longer opens a second one.** It set out a fresh
  incident and moved the unit onto it, quietly abandoning the call being worked — the board then
  showed an officer attached to something nobody had dispatched. Now it just puts you Code 6 on the
  call you are on. A traffic stop during another call still creates its own incident, because that
  genuinely is a separate event and dispatch needs it as one.
- **Detach was previously not something a unit could do.** The only route was going CLEAR, which is
  what detaches server-side but says so nowhere on screen; otherwise it took a dispatcher running
  `/ddetach`. CLEAR in the status dropdown is now the documented detach — it sends exactly that
  status, so the rule it depends on cannot drift.
- **Fire/EMS units were missing their own statuses.** The MDT tested for the job label `Fire/EMS`,
  but the job a medic actually carries in-game is `AMR` — so ON SCENE never appeared in the status
  list for a real medic, and the Fire/EMS request button never rendered for them. The Lua side had
  gated on all four spellings all along; this side had drifted from it.
- **Four buttons that did nothing are gone.** *Edit* called a command registered nowhere in the
  resource and now opens the incident's Comments, the one part of a call a unit can genuinely edit.
  *Primary Unit*, *Import to Incident* and *Options* were bound to nothing and have been removed
  rather than left greyed out. *Locate on Mobile Map* was live but unguarded: with no incident
  selected it sent a null the server drops, so it looked ready and did nothing — it is now disabled
  until there is something to locate.

#### Remote config

- **The data-list editor is no longer blank.** It only ever showed rows you had typed into it, so
  changing one fine in the penal code meant first retyping all twenty charges — and until you did,
  the page looked like your server had no penal code at all. Your servers now report their own
  tables up (the penal code, the phone directory, the blacklisted and member-only vehicle lists),
  the same way they already report their settings, and the editor opens on those. Every list says
  where its rows came from: **from your config** (read off your server's own files), **from all
  servers** (inherited), or **your rows** (saved here). Saving an empty list gives it back rather
  than storing an empty table, so there is a way out of an override as well as into one.
  > The report is a snapshot taken at load, *before* any dashboard list is applied — otherwise a
  > server would report your own override back to you and the "what my server actually has"
  > baseline would quietly become a copy of the dashboard.
- **Servers can now be configured one at a time.** Config was one set of values per account, applied
  to every server you own — fine with one server, useless with three, because a second server could
  not have its own penal code without changing the first one too. There is now a picker on the
  Settings and Data lists pages: **All servers** is the default everything inherits, and each server
  can override individual settings and whole lists on top of it. A setting you do not override keeps
  following the default and says so (**INHERITED**), so there is no need to copy shared values into
  every server just to keep them in step.
  > Nothing changes for a single-server account: the picker only appears once there is a second
  > server, the account-wide values keep working exactly as they did, and an override layer that
  > nobody creates is simply never consulted.
  >
  > A server has to have started once with a license key before it can be given its own config —
  > until it reports its identity there is nothing stable to file an override under, and filing it
  > under an IP address would hand the config to whoever gets that address next. Those servers are
  > shown in the picker but cannot be picked, with the reason on hover.

### Removed

#### Loading screen

- **The loading screen built during this release was cut before it shipped.** LACORE claims no
  `loadscreen` at all: almost every server already has one — picked deliberately or inherited from a
  template — and taking that slot would have stopped theirs from running. Dropping it removes a
  collision rather than a feature.
  > Only relevant if you ran a development build: delete `configs/cfg-loadingscreen-sh.lua` if your
  > install still has it. A leftover `Features.loadingscreen` entry is simply ignored.

#### Dead code

- **`modules/character-cl.lua`** — an old character creator whose `/character` registration had long
  been overridden by `modules/mdt/mdt-civilian-cl.lua`. Unreachable, and nothing referenced its
  functions.
- **`client/nativelacoreui.lua`** — the menu library, now that no menu is left to build (see above).

### Fixed

#### Saved data (server)

- **Every local JSON store silently wrote nothing on servers without a `data/` folder.** Found while
  testing the replay recorder: a clip refused to save, and the reason turned out to reach much further
  than replays. A resource cannot create a directory — no native does it, and `SaveResourceFile` will
  not create missing path components — so on a deployment whose upload does not carry `data/`, every
  write into it failed. Silently: the native returns false, and nothing was checking.

  That is worse than it first sounds, because `DBSaveStore` writes the file **and** the database on
  every save, not the file only as a fallback. So the local mirror — the copy the server reads when
  MySQL is unreachable — had never been written at all on those servers. The safety net was missing
  precisely where it was needed. Affected the ban list, incidents, call logs, anticheat trust scores,
  case files, CCTV cameras, civilian activities, organisations, turf, corrections, the config backup
  and the remote-config cache.

  Now the folder is not assumed, it is tested: `DBDataPath()` in `modules/db/db-sv.lua` writes a probe
  once and reads it back — a write that goes nowhere can only be told apart from one that worked by
  the read that follows — and falls back to the resource root when `data/` is unusable, saying so once
  in the console. Servers that already have a working `data/` keep using it, so nothing moves. Every
  writer now routes through it, and a failed write prints a line instead of being swallowed.

#### Anticheat

- **The hardening check contradicted itself about `sv_scriptHookAllowed`.** With `sv_scriptHookAllowed 0`
  in server.cfg, `/lacore doctor` reported it hardened and then, a few lines further down, the anticheat
  announced that ScriptHookV trainers were allowed — on the same server, in the same boot log. FXServer
  reports switches like this one back as `false` rather than `0`, and the three places that read it had
  each picked one spelling: the doctor normalised both, the boot audit compared against `"0"` and so
  called `false` unsafe, and the older German-language check compared against `"false"` — the same bug
  mirrored, which would have stayed quiet on a server that really did allow trainers by writing a literal
  `1`. All three now go through one shared reader (`LacoreBoolIsOn` / `LacoreConvarIsOn` in
  `shared/shared.lua`), which treats `0`, `false`, `off`, `no` and unset as off and anything else as on.
  A warning about trainers is only worth printing if it is right, and two checks disagreeing taught
  owners to ignore both.
- **The boot log no longer audits your server.cfg twice.** Two anticheat files were separately warning
  about the same convars at start-up — one of them in German, left over from before the audit was
  rewritten to cover all four. The duplicate is gone; the hardening audit now lives only in
  `anticheat-guard-sv.lua`, which is the one that names every unset convar and points at the config
  block explaining them. Nothing is checked less than before — the removed copy looked at three
  convars, the one that stayed looks at four.
- **`lacore_devmode 1` did not turn devmode on.** The same spelling problem, one convar over, and this
  one had teeth: devmode is read in six places and every one of them tested for the literal string
  `"true"`, so an owner who wrote `setr lacore_devmode 1` on a development server got no webhook
  bypass, no permission grants — and an anticheat that was still live and still able to ban them off
  their own test box. All six now use the shared reader, so `1`, `true`, `yes` and `on` mean the same
  thing.
  > ⚠️ **Config change (`configs/cfg-server-sv.lua`).** The line that resolves devmode lives in your
  > config, so an existing copy keeps the old `== "true"` behaviour until you take the new one. If you
  > only ever wrote `lacore_devmode "true"`, nothing changes for you and there is nothing to do.

#### Area of Play

- **An AOP vote that nobody answered took the HUD down with it.** When a vote closed with zero votes
  the server picked `winningAOPs[1]` — nothing — and broadcast that as the new AOP. Clients set
  `currentAOP = nil`, and the next `string.find` against it threw
  `bad argument #1 to 'find' (string expected, got nil)`. That check lives in the thread that also
  resolves the street address and feeds the player location display, so the error stopped all of it
  until the player reconnected.

  Three changes, so it cannot happen from either end:
  - An unanswered vote **keeps the AOP it had** and says so once in the console, instead of clearing it.
  - `updateAOP` ignores a blank AOP whatever sends it — the event is reachable by any resource.
  - The AOP-covers-this-address check is nil-safe, and matches **plainly**: an AOP name containing a
    dash or a bracket used to be read as a Lua pattern, which could throw or match the wrong place.

#### CAD & MDT

- **The Pennsylvania CAD could not be moved, and could open half off screen.** It had no drag handle
  at all — it read its position from the MDT settings that the *other* terminals write, and there was
  no way to change it from inside the window. Those settings are shared, and the terminals are not the
  same size: a position that suits the Agency MDT can leave this one, which is far larger, hanging off
  the edge with nothing left to grab. It now has a title bar you can drag (with full-screen and close
  buttons on it), and two guards behind that:

  - **Dragging is clamped on all four edges**, not just top and left as it was. A window can no longer
    be pushed off the right or bottom and *saved* there — which is how the unreachable position got
    written in the first place, from whichever terminal was dragged last.
  - **A saved position is pulled back into view** when a terminal opens and when the game window is
    resized, so at least 200px of it and its title bar are always reachable. That also fixes the case
    where the position came from a different resolution.

- **Looking someone up in the Agency (CHP) terminal returned a page you could barely read.** The
  person record — name, physical description, licences, priors, every field value — is one component
  shared by all the terminals, and it was written for the dark ones: its colours were hardcoded white
  and pale blue. The Agency terminal deliberately prints results on a light "printout" sheet, so the
  record arrived as white text on near-white paper. The same component picked up nothing at all from
  the record styling in the shared stylesheet, which is scoped to the LAPD container and never reached
  the Agency window, so the criminal-history entries lost their card backgrounds too. Its colours now
  go through variables whose fallbacks are the original dark values — so the LAPD and LASD terminals
  are pixel-for-pixel unchanged — and the two light hosts hand it a light palette instead. The
  Pennsylvania CAD had the same defect on its results pane and is fixed by the same change.

- **Clicking the in-car screen threw a script error instead of clicking.** The DUI handle and the
  size the cursor has to be scaled into came back from one call returning three values, read as
  `X and X() or nil` — which collapses a call to its *first* result, so the width and height were
  silently nil and the first mouse move crashed on the arithmetic. It only ever fired once the
  pointer actually reached the terminal, so anyone whose `cursorRect` was still at the shipped
  default never got far enough to see it: the screen simply looked unresponsive, and fixing the
  alignment is what surfaced it.
- **The in-car CAD screen was left behind the moment you drove off.** The focus camera was placed at
  *world* coordinates and computed once, so the car pulled away from underneath it and the terminal
  slid out of frame at the first touch of the throttle — the one situation the screen exists for.
  Both cameras are now attached to the vehicle, with their rotation rebuilt from the vehicle's own
  every frame, so the view rides along through corners, hills and handbrake turns. The terminal
  camera also takes the car's roll, which makes a banked corner feel like one instead of like the
  world tilting.
- **The Agency MDT's BOARD tab has never worked.** It renders a full bulletin board and asks the
  server for it the moment you open the tab — but the reply was only ever forwarded to the LAPD
  client, so it was dropped on arrival. The tab has been empty for every non-LAPD agency since it
  shipped. Same root cause, same fix, for three more panels: **dispatch chat** and **call history**
  never reached the LASD, EMS or Supervisor terminals either, and a **dispatcher assigning a unit**
  never updated anything except the LAPD client.
  > These were each gated on "is the LAPD MDT open?" instead of "is *any* terminal open?". They now
  > all go through the one shared check, so a panel added to any terminal gets its data by default
  > rather than by remembering to extend a list.

- **A call raised from a non-LAPD terminal is no longer filed under LAPD.** Unit-created incidents
  (traffic stop, Code 6, self-created) hardcoded `LAPD` into the Agency column regardless of who
  made them. They now carry the creating unit's own department.

#### Paid add-ons

- **A purchased add-on's interface can now actually unlock.** Entitlements were applied on the
  server only, and client-side scripts read the shipped config where every add-on flag is `false` —
  so an add-on whose value is a *screen* could never open for anyone, no matter what the account
  owned. The server now hands each client the list of add-ons it unlocked, and the client applies it
  the same fail-closed way: no answer, an empty answer or a corrupt one leaves everything off. The
  server still decides; a client can only ever receive the list.
  > For add-on authors: the answer arrives a moment **after** the resource starts, so the usual
  > load-time `if not Feature(...) then return end` at the top of a client file does not work for an
  > add-on — it runs before the answer. Gate at the point of use (the command, the open function),
  > which is also the only place a refusal can tell the player why.

#### Dashboard

- **Your dashboard no longer tells you you're up to date when you aren't.** The version badge on the
  overview read `UP TO DATE` unconditionally — it was a label, not a check, so it said the same thing
  for a server two releases behind as for one on the newest build (and said it while the page was
  still loading). It now compares the current release against the version your linked servers
  actually report on their heartbeat: green when they are all current, amber `UPDATE AVAILABLE` with
  the version you're on when any of them is behind, and — when no server has reported a version yet —
  a neutral `LATEST RELEASE`, which states what the number is without claiming anything about your
  install.

#### Phone

- **The retro brick phone could not reach anybody — dialled numbers failed, saved contacts failed, and
  new contacts could not even be typed in correctly.** Three reports, one root cause: every LACORE
  number carries a dash (`555-0123` — the server generates them that way), but a 90s keypad has no dash
  key. A number dialled as `5550123` was compared against `555-0123` character by character, never
  matched, and the call failed; a contact saved on the brick phone stored the dash-less spelling, so
  calling *it* failed the same way. The server now keeps a digits-only index next to the exact one and
  canonicalises every number the phone sends in — `5550123` reaches `555-0123`, and a dash-less contact
  is corrected to the real spelling as it is saved. Directory numbers such as `311` pass through
  untouched. The keypad also gained the missing key: `*` types the dash (the key carries a small `-`
  label). This covers the modern phone's dial pad too, which had no dash key either.
- **Players who had not opened their phone this session were unreachable.** The number → player lookup
  was only filled in when someone touched their own phone, so a player connected for an hour who never
  pressed F1 could not receive calls or SMS — the caller just heard the call fail, even with the number
  spelled perfectly. The lookup now falls back to searching online players by license, and the incoming
  call opens the callee's phone as it always did.
- **A failed call on the brick phone showed nothing at all.** The modern phone flashes a "call failed"
  notice; the retro LCD returned silently to wherever it was, which reads as "calls just don't go
  through". It now shows a `✕ Call failed` screen with the dialled number for a couple of seconds, plus
  a low error tone.

### Changed

#### The staff panel — the admin menu and Big Brother in one window
- **`/admin` opens one console instead of two windows.** They were always two halves of one job: the
  admin menu wrote exactly the lines the log showed, and the way from "this player looks wrong" to
  "what has he been doing" ran through closing one window and typing another command. Built to the
  "Staff Panel" design: a rail with three views — **1 Players · 2 Log · 3 Self** — and one selected
  player in the aside that all three share. `/bblog` opens the same window on its log view.
- **Access tiers, so the panel shows what you may do.** Lead Dev (the dev flag or devmode), Admin (the
  staff flag or ACE `ban`) and Moderator (ACE `kick`), derived from what LACORE already has rather
  than a new permission system. A moderator sees Jail and Ban greyed out with the reason on the badge
  instead of finding out by clicking.
  > The tier is **advisory**: every action re-checks on its own server handler, because a client can
  > send any event it likes. Ban and jail now carry that check too, on top of the permission.
- **The player list is worth opening on its own.** Search by name, character, id or department, filter
  by on-duty / civilian / flagged, and read the callsign, the ping and the anticheat **trust score**
  per row. The old list had four columns and no search at all, which is fine at eight players and
  useless at eighty.
- **The log pages properly.** `bb:Query` answers with a total next to the rows, so "page 4 of 7" is a
  real statement instead of "the last 250 lines". The live feed only prepends while you are on page
  one — a stream that moves rows out from under a reader is not a feature.
- **Kick, jail and ban need a reason and a confirmation.** The reason is not decoration: it is what the
  log line and the Discord embed carry. Jail goes through the corrections module rather than a second
  sentencing path, so a sentence from the panel looks exactly like one handed down in game.
- **One gate instead of two.** The admin menu checked the staff flag and ACE; Big Brother checked
  Discord role names — so a moderator could hold one and not the other. Whoever may open the panel may
  read the log in it; the role list stays as the second route for servers that grant log access
  without the panel.
- **No database is a state, not an empty table.** Without oxmysql the log says so, names what is gone
  (search, paging, dossiers) and what still works (actions, the buffer, Discord), and offers the lines
  still in memory.
- Two smaller things came with it: **Mark on map** puts the target on the admin's waypoint, read from
  the target's own ped server-side, and **Overhead ids** draws server ids above nearby players — a self
  tool, so it is client-side and never logged.
  > **Removed with it:** `AdminMenu.svelte` and `BigBrother.svelte`. Two things the old log panel had
  > are deliberately not carried over: the **map view** (the dispatch console already draws that map)
  > and **teleport to a log coordinate**.

#### The player menu, rebuilt from the design
- **`/profile` is a different screen.** Built to the "Player Menu Final" draft: a sharp-edged
  1240×820 panel, character tabs across the top, a rail of eight sections down the left with a count
  on each, and one dense grid per section instead of cards floating on a dark sheet. Two border
  weights carry the whole layout — 2px where the structure changes, a hairline between rows — and
  every label that is not a sentence is set in mono. Nothing underneath moved: the same store fields,
  the same actions, the same NUI callbacks.
- **The character tabs switch what you are looking at.** Vehicles, records, relationships, licences
  and the overview stats all follow the tab, so you can read a character you are not currently
  playing — which the old menu could not do at all.
  > **Reading is not writing.** Every write in this area is server-side scoped to the *active*
  > character (`characters-sv.lua` resolves through `GetActiveChar`), so the panel offers the new
  > entry, edit and delete controls only while you are looking at the active one, and says
  > **"Activate to edit"** where it does not. Showing the buttons and having them write to a
  > different character would have been the worst of the three options.
- **Achievements got their own section**, with the secrets grid under them; the overview keeps a
  two-column preview and an **ALL →** link. Progress reads as a percentage per row, and a done row
  says so instead of showing a full bar.
- **Recent activity is real or absent.** The design shows a feed; LACORE keeps no activity log, so
  the panel builds one from the things that actually carry a timestamp — achievement and secret
  unlocks, record entries, vehicle registrations — newest six. An account with nothing dated gets
  the empty state rather than invented rows.
- **Creating a character is a modal now**, as drawn. It keeps the fields the design's mock does not
  show — physical description, warrant, notes — because dropping them would have removed working
  features to match a picture.
  > **The design's fonts ship with the resource.** Archivo and IBM Plex Mono are bundled as woff2
  > (156 KB across eight subset files) rather than fetched from Google: a FiveM client has no
  > guaranteed internet, a blocked request would swap the metric mid-session, and a remote font is a
  > third party watching every player who opens a menu. Archivo is the variable cut, so one file
  > covers the six weights the design uses. Both are OFL 1.1, which is what makes shipping them legal.
  >
  > Google publishes no Cyrillic cut of Archivo, so on a Russian client Cyrillic text falls back per
  > glyph to the UI stack while the numerals, codes and callsigns stay in Archivo. IBM Plex Mono
  > carries its Cyrillic, because the small mono labels are translated.

#### LAPD MDT — the Mobile Client, redrawn as the terminal it plays
- **A complete visual redesign of the LACORE Mobile Client**, taken 1:1 from the new design draft:
  green-phosphor type on navy, hard white frame lines around the incident panel and every data well,
  a gradient ribbon with the icon artwork in its three original frame sizes, and a black Courier
  narrative window — the look of the in-car terminal the MDT has always pretended to be. Same
  markup, same wiring: every action, event and store field behaves exactly as before.
- **The status strip is one row of cells now** — Incident, callsign, Unread, Night, Veh., your
  status dropdown, and a solid green **GPS Online** block at the end. The clock and the department
  tag are gone from the strip; the design does not carry them and the game shows the time anyway.
- **Requests moved into the bottom bar.** The REQUEST button strip is gone; **Options ▾** on the
  bottom bar opens the same five requests (LEO Backup, Fire/EMS, Coroner, Tow, Crime Broadcast) as
  a pop-up menu, which is where the real terminal keeps them.
- **The bottom bar carries the full cell row**: paging arrows, Edit, Create Report, Clear Incident,
  Close View, **Primary Unit** (assigns you to the selected incident — the same server-side
  self-assign the Calls tab offers), **Import to Incident** (on the real bar, nothing behind it here
  yet — greyed out rather than pretending), Locate on Map, Options.
- **The rail glows where the records are.** Sections holding records (Previous, Unit Details,
  Comments …) light up amber with their count, exactly as drawn — so the officer sees there are 50
  previous calls without opening the tab. The emoji icons became the design's stroke glyphs.
- **The ribbon is exactly the terminal's nine buttons.** BOLO and Cite/Charge are records, not
  ribbon tools, so their extra F10/F11 buttons are gone from the toolbar: both live in the rail now
  with the other record sections — an active BOLO lights its row amber with the count, which is a
  louder signal than the old badge was — and F10/F11 on the keyboard still jump straight to them.
- **Auto Scroll is a real switch now.** The button in the field mask toggles whether new comment
  lines keep the narrative pinned to the bottom; before it was a printed label.
- **Unit Details shows the terminal's five columns** (Unit, St, Location, Inc, Code); History and
  Previous are plain row tables, and clicking a history row opens that incident. The separate
  Detach button on the location bar is gone — setting **CLEAR** in the status dropdown is, and
  always was, the detach.
- **The skin toggle keeps working.** The terminal design is the new default look; ◫ in the title
  bar still switches to the LACORE ONE skin (stored under a new key, so every install actually sees
  the redesign once before choosing). The MDT's separate white mode is retired — the terminal has
  one look, and ONE brings its own light mode.
  > Verified in the NUI preview against the design values (colours, spacing, layout measured 1:1);
  > not yet tested in-game — the Lua side is untouched, so only the visuals need eyes on a server.

#### Anticheat
- **The detection parameters no longer ship as a printed guide to evading them.** `configs/` is
  `escrow_ignore`, so `cfg-anticheat-sh.lua` reached every customer as plain text — including the
  exact speed to stay under, the damage ceiling, the trust thresholds, and the full list of honeypot
  event names to avoid. The detection *logic* was obfuscated; the numbers that actually matter for
  evasion were not. They have moved into `modules/anticheat/`, split by who needs them:
  - **`anticheat-params-sh.lua`** — only what the client evaluates itself (god-mode strikes, speed,
    jump, teleport, the weapon and vehicle blacklists, heartbeat timings). Obfuscated by the build.
  - **`anticheat-params-sv.lua`** — everything else: honeypots, event rate limits, explosion rules,
    damage ceiling, trust scoring, the server sweep and combat thresholds. This is a *server* script,
    so it never reaches a client at all. That matters most for the honeypots: an event name cannot be
    hashed away — registering a handler needs the literal string — so keeping the list off client
    machines is the only place it is genuinely out of reach.
  - **Per-server jitter.** Server-evaluated thresholds now sit at a value inside a band rather than on
    a shared constant, so a number measured on one server does not transfer to the next. The seed is
    the server's own Cfx licence key, not the clock: a clock seed is guessable *and* re-rolls every
    restart, which would make the same player flag on Monday and not on Tuesday. Bands are chosen so
    the tight end still clears legitimate play; parameters without that headroom (the god-health and
    armour ceilings are exactly the legal maximum) are deliberately left alone.
  > ⚠️ **Config change (`configs/cfg-anticheat-sh.lua`) — thresholds and lists removed.** What you
  > still control is unchanged: `Enabled`, and `enabled` / `action` per detection, plus the whitelist
  > permission, evidence and reporting blocks. If you had customised a threshold, **your value still
  > wins** — the defaults only fill what your config leaves unset. If you had not, you lose nothing:
  > verified value-for-value against the previous file, 145 effective settings, identical.
- **`cfg-anticheat-sh.lua` is English throughout.** `configs/` ships as plain text, so the German
  comment blocks still sitting in the middle of the file — the client-side detection notes, the
  anti-dump section, the honeypot and rate-limit explanations, and the whole recommended-server.cfg
  block at the end — were being read by owners who do not speak German. Translated, with no settings
  touched: same keys, same values, same order. The server.cfg block also still claimed the anticheat
  checks `sv_scriptHookAllowed` at boot, which stopped being the whole truth when the audit grew to
  cover all four convars.
- **`AntiDump.challengeSalt` warns when it is still the shipped default.** The salt has to be a shared
  constant — client and server both compute the digest and the two must match — so it cannot be
  generated per server, which means the shipped default is a value every LACORE owner knows. It now
  says so once at boot instead of quietly protecting nothing.

#### Bans & playerbase
- **`/lacore bans list` says which list it is counting.** It printed "Local playerbase: 6 bans", which
  reads like *every ban on this server* — and on a txAdmin server it is off by an order of magnitude.
  It now names the source, and either reports how many entries came from txAdmin or points at
  `/lacore bans import` when none have.

#### Documentation
- **The Command Reference now lists every command and every keybind.** It was written by hand and had
  drifted: roughly a third of the resource's commands were missing — `/supervisor`, `/penncad`,
  `/cad`, `/spawnpoint`, the renameable `/settings`, the RP chat commands' feature groups, and the
  whole developer/debug set. Keybinds were mentioned in passing per module rather than listed, so
  there was no single place to answer "what is bound to what". Rebuilt from the source: all 32
  keybinds (11 with a default key, 21 unbound) in one table, every command grouped by role, and ACE-
  restricted commands marked as such rather than lumped in with the ones that check your job.
- **The conflicts are written down instead of discovered.** `X` is bound twice (hand-on-holster and
  release/uncuff), `/run` fires both the MDT query and the RP action, `/settings` is claimed by most
  HUD resources, and a few names are registered by more than one LACORE file so load order decides
  the winner. None of them break a stock install, which is exactly why they used to cost an evening
  when something behaved oddly — each now says which toggle or rebind resolves it.
- **A searchable version of it on the website** at `lacore.netica.dev/keybinds`. The same data, but
  the keybinds are drawn on an actual keyboard you click — which answers "is `X` free?" in a glance
  where a table needs reading end to end — and the 154 commands filter live by text, by category, and
  by whether they are ACE-gated, job-checked or a dev tool. Every row carries the file and line it
  was read from, so nothing here has to be taken on trust. Linked from the main nav as **Commands**.

> **Two new PocketBase collections to import**, both in `landing/pocketbase/`:
> - `pocketbase-acflags-collection.json` (`lacore_ac_flags`) — the anticheat feed behind the new
>   dashboard page. Storage is capped per account: these are operational signals with a short useful
>   life, not an archive, and one noisy server must not fill the database on everyone else's behalf.
> - `pocketbase-reports-collection.json` (`lacore_reports`) — what `/lacorereport` writes into.

## [3.3.1] – Dashboards grow up: admin, customer & partner tooling

This release is mostly about the three dashboards. On the **admin** side there are new Products,
Player-database and Customer-database pages, an attention bar that surfaces what actually needs doing, and
a server lookup that finally shows everything the heartbeat already reported. The **partner** dashboard
turns its referral data into a full toolkit — KPIs, a payout ledger, program analytics with a leaderboard,
achievements and a monthly goal. The **customer** dashboard gains KPIs and a complete player roster.

Around them: the Discord + portal **support tickets** got a big overhaul — eight categories, smarter
handling and gapless, embed-aware documentation — a **paid add-on** system unlocks features per licence
key, and a batch of new **config toggles** hand server owners control over run announcements, the
unregistered-plate stolen flow, the built-in emote binds and the 90s phone theme. Vehicles also start
insured by default now, with a matching developer API.

### Added

#### Admin dashboard
- **Products, Player database and Customer database pages.** Three new staff pages. **Products** shows
  sales, buyers and revenue per Tebex package (from attributed orders) plus the add-on catalogue with how
  many accounts hold each. **Player database** lists everyone the network has seen, **deduped by shared
  identifier** — the Discord ↔ identifier log (`lacore_identities`, written on every connect) merged with
  the Enhanced Playerbase history (`lacore_players`) into one row per person (someone under several linked
  identifiers, or in both sources, collapses into a single player). Server-side **search/lookup** (name,
  Discord ID or any identifier), **source filter** (Discord-linked / identity / playerbase / ghosts),
  **pagination**, and a per-player **detail modal** with every identifier and name seen, each copyable. From
  the modal, staff can also **ban or warn a player via the Playerbase** and lift a ban — issued under the
  acting staff account as the community (advisory unless a server enforce-subscribes; not a network-wide
  `/gban`), reusing the same find-or-create-player + ingest path as a server-console upload. **Customer
  database** is a joined per-account view — license keys, lifetime spend, orders and add-ons, keyed by
  Discord account. The **server lookup** now surfaces everything the heartbeat reports (licensed / verified
  owner, project name and description, tags, game build, OneSync, locale, gametype, map, uptime, first
  seen) — these were stored but dropped by the API, so the detail modal previously showed "—".
- **An attention bar that tells you what needs doing.** The overview showed four backward-looking totals
  and five lists — nothing said "act on this now". The genuine to-dos now sit across the top as four triage
  tiles, each green when nothing is pending: **open tickets** waiting on a reply, **servers** offline or
  missing a heartbeat, **closed-but-unrated** tickets, and active **server blocks**. Every tile is clickable
  and jumps to (and briefly flashes) the relevant table or page. Open-ticket counts are computed
  server-side, since the on-page list is capped at fifteen.
- **The staff area became a section of its own.** Nine staff pages were competing for space in the customer
  header row, so they moved into a **sidebar** ("// STAFF AREA") that shows a live count next to the
  sections that have work waiting — open tickets, active bans — and ends in a **BUILD** block with the
  current LACORE version, the bot version and whether the bridge is answering. A **⌘K command palette** in
  the header searches every registered server, network ban, archived ticket and known identity, plus the
  staff pages themselves; its index is fetched once, on first open, and only for staff. Which chrome you
  get is now decided by the URL rather than by the page's section key — a staff member on the *customer*
  player page used to be flipped into admin chrome, because both pages call themselves "players".
- **A rebuilt overview.** After the triage tiles: **players in game / servers online / ticket satisfaction**,
  a **14-day opened-vs-closed ticket chart** drawn from the tickets' own timestamps, and a **server status
  wall** — one tile per registered server with its load bar and one of four states. *Online* and *offline*
  come from the API; *stale* is a server that is still counted as online but has missed its hourly
  heartbeat by 90 minutes, and *blocked* is one whose IP carries an active licence block. Underneath, the
  **enforcement queue** (active network bans, newest first) and a **staff activity** feed. There is no audit
  collection, so that feed is not a new log: it merges the records that already exist — bans issued, blocks
  placed, tickets closed, servers registered — and sorts them by their own timestamps.
  > The KPI tiles carry a supporting figure ("across 6 online servers · 596 slots") rather than a
  > week-over-week trend. Nothing stores the history a trend line would need, and an invented one would
  > look exactly like a real one.
- **Bans and blocks moved to their own page** (`/admin/bans/`). Both enforcement forms plus the ban and
  licence-block tables used to live on the overview, which made the landing page of the staff area mostly
  input fields. The overview now only *reads* the queue and links across; "Block this server" in the server
  lookup hands the target over and opens the form pre-filled.
- **A "NETWORK LIVE" chip for the staff header.** A licence state means nothing to someone looking at the
  whole network, so in the staff area the chip reports the fleet instead — `NETWORK LIVE · 6/9`, or
  `NO SERVERS ONLINE`. It counts servers exactly the way the overview's status wall does (a heartbeat
  inside 90 minutes, no active licence block on the IP), so the header and the page below it can never
  disagree about the word "online".

### Fixed

#### In-game
- **`/unhospital` did nothing.** The server had always answered an early discharge by firing
  `unhospitalPlayer` at the client — and nothing in the resource ever listened for it. The patient
  stayed confined until the timer ran out on its own, so the command looked like it was ignored. It
  now releases exactly the way the timer does when it reaches zero (step outside the hospital,
  cuffs re-applied if they were cuffed on the way in).
- **The 9100-T's EMER button never created an incident.** It sent the contact type `Panic`, but the
  server's special-contact whitelist only accepts `Panic Button` — the on-screen prompt appeared,
  the details were typed, and the call fell straight through. It sends the accepted string now, the
  same one `/p` has always used.
- **`/unhospital <id>` and `/unjail <id>` needed a second word to do anything.** Both are documented
  as taking an optional reason (or none at all) but demanded two arguments and failed silently when
  given one. They take the documented form now and say what they expect when the syntax is wrong.
- **The civilian radial could not stop an emote.** The client callback and the NUI action both
  existed and were wired to the emote bridge; nothing ever offered them, so an emote could only be
  cancelled from the emote resource's own command. There is a **Stop Emote** entry under Services
  now. The service labels also stopped being hardcoded English — they go through the locales like
  everything else.
- **Devmode granted only half its permissions.** `HasPermission()` answers `true` for everyone under
  `lacore_devmode`, but commands registered as *restricted* (`/ban`, `/kick`, `/tempban`, `/unban`,
  `/dc`, …) are checked by FiveM against ACE *before* any Lua runs — and devmode deliberately skipped
  handing out an ACE principal. So the exact commands a developer wants while testing were the ones
  that stayed denied. Devmode now grants the dev group, which is the same reach `HasPermission`
  already had.

#### Customer portal
- **The public ban-appeal page returned a JSON 404.** The route guard matched the whole `/appeal/`
  prefix and handed it to the submit handler, which serves nothing but `POST /appeal/submit` — so a
  banned player following the link got `{"error":"not found"}` instead of the form. The guard is
  narrowed to the submit endpoint; the page itself falls through to the static site.

#### Documentation
- **The holster keys were wrong.** `/hh` was documented as "tap attack to cancel"; the code checks
  *sprint*, and attack does nothing. Corrected in the keybind reference.

#### Admin dashboard
- **The page-head controls had no styling at all.** The Refresh button and the "synced" chip rendered with
  no border, square corners and the wrong typeface. The whole colour and radius token set was declared on
  `.dash`, but the shell's page head sits outside that wrapper — and an unresolvable `var()` invalidates
  the entire declaration, so `border: 1px solid var(--border)` became no border rather than a wrong one.
  The tokens now live on `:root` alongside the type scale, which also inoculates anything else rendered
  outside a `.dash` wrapper. (No effect on the marketing page: its palette is the separate `--color-*` set.)
- **The staff sidebar stopped mid-page** and the BUILD block floated directly under the nav instead of
  sitting at the foot of the column — the sticky aside was shrink-wrapping to its contents.
- **The whole panel was rendering in the wrong typeface.** `.dash` never set a family, so everything
  inherited Archivo from the site's base stylesheet while the design specifies Space Grotesk.
- **Stat-tile labels were the one micro-label that never got the uppercase mono treatment**, so every KPI
  caption in the portal read in sentence case while the table headers and panel headings around it did not.
  Identifiers inside a label (the bot's commit hash) opt out and keep their case.
- **Confirmations pushed the page down.** The admin toast reused the in-flow notice banner, so showing one
  shifted everything below it and popped it back four seconds later. It is a floating toast now.
- **The staff area rebuilt itself on every click.** Each `/admin` page rendered its own copy of the shell
  and fetched its own session, so moving between sections tore the chrome down and put it back: for about
  150ms the sidebar disappeared, the header fell back to the **customer** navigation, and the live chip,
  the section counters and the BUILD block went blank — on top of four chrome requests per navigation
  (`/api/me`, `/api/accounts`, `/api/admin/stats`, `/api/admin/bot/status`). The customer dashboard solved
  this with a shared layout a while ago; the staff area now has the same one, so the chrome mounts once
  and stays. Measured after: zero DOM changes to the shell across three section changes, and the only
  request left is the page's own data. Three places also did a **full document load** where a client-side
  navigation was meant — the command palette, the triage tiles and "Block this server".
  Which chrome you get is now decided by the route itself, so even the first paint of a cold load is the
  staff shell rather than the customer one.
- **Design-fidelity pass over the admin area.** Audited region by region against the source design and
  closed what was off: the ticket chart is one stacked column per day over a track (it was two half-width
  bars, and used green for closed where the design uses a single accent hue), server tiles state-colour
  their load bar, border tint and dot glow instead of painting every bar indigo, triage tiles take a pale
  tone across tag, number and label rather than a saturated number, tables get the design's two-weight row
  rules and tighter cell padding, form fields align with the button beside them, panel headings no longer
  sit 14px off-centre from the control sharing their row, and the palette's kind column is bare coloured
  text rather than a filled pill. The STAFF chip beside the wordmark and the modal entrance animations are
  back.
- **The type scale is now the design's own.** The scale introduced earlier in this release was floored at
  11.5px for readability; the source design runs smaller — 13.5px body and table text, 11px micro-labels
  and pills, 10.5px legends and captions, 10px count badges, with 34px / 28px / 26px for the three sizes
  of number. Those are the sizes now, floor removed, so the panel is denser and matches the mockup.
- **The ticket modal was the last component on the old palette.** It still used the previous blue-black
  surfaces and the Chakra Petch face, so opening a ticket looked like leaving the product. It is on the
  shared tokens now — and since it is shared, the customer support page gets the same correction.
- **Per-page wording on the staff sign-in wall.** Centralising the staff check into the admin layout had
  flattened every message to one generic line; the wording is per-page again ("The ticket archive is staff
  only.") while the check itself still lives in exactly one place.

#### Customer dashboard
- **More KPIs.** The overview adds **Servers** (online / total), **Players now** (across your servers) and
  **License keys** (active) alongside the existing tiles.
- **A full player roster.** `/dashboard/players` now leads with **All players** — every player the Enhanced
  Playerbase has seen on your community (recorded on connect, not just the banned ones), with names,
  identifier counts and first/last seen; players from partner communities you subscribe to are tagged. The
  existing bans & warns records move behind a toggle.

#### Partner dashboard
- **More of what it already knows.** The referral page had earnings, a six-month chart and recent orders; it
  now leads with a six-tile KPI strip — lifetime commission, this month, **month-over-month growth**,
  **average commission per order**, referred sales and revenue — and adds two panels built from the same
  attributed orders: **product performance** (revenue and order count per package, as ranked bars) and
  **customers** (new vs. returning, average spend, and top spenders). Buyer identifiers in the top-spenders
  list are **masked** — a Discord id shows only its last four digits, an email only its first two characters
  and domain; the plain values never leave the server.
- **A payout ledger — bookkeeping, not money movement.** Partners now see a **Payouts** panel: **available**
  (lifetime commission minus what's already been paid and what's pending), **paid out**, **pending**, and a
  history table they can **export as CSV**. Staff record payouts under *Settings → Partner payouts*, where a
  balance table shows what each partner is owed before a transfer. Recording a payout only **logs** that a
  transfer happened — nothing here sends money; the actual transfer stays manual (PayPal, bank, …).
  Tebex-paid partners settle in their own Tebex wallet, so for them the panel points to Tebex rather than
  showing a LACORE balance. Backed by a new `lacore_payouts` PocketBase collection; if it isn't imported yet
  the ledger simply shows empty.
- **Program analytics and a leaderboard for staff.** *Settings → Partner program* now opens with the whole
  program at a glance: **referred revenue** and total sales across all partners, **commission** earned,
  **LACORE owed** (unpaid balance for LACORE-paid partners only), partner count, a six-month revenue trend,
  and a **leaderboard** ranking partners by referred revenue (sales, revenue, commission per partner). It's
  computed in the same pass that builds the payout balances, so it costs no extra work.
- **Achievements.** The referral page gained an **Achievements** strip — tiered milestones built only from
  the partner's *own* numbers (referred sales, commission earned, link clicks, unique customers, renewals),
  each showing the level reached and progress to the next tier. No other partner's figures are ever exposed
  here; the cross-partner leaderboard stays staff-only.
- **A monthly goal.** Partners can set a personal monthly commission target on the referral page and watch
  this month's earnings fill the bar toward it — with a "goal reached" flourish at 100%. Stored on their own
  partner record (a new `goal` field on `lacore_partners`); self-service, no admin step. Paired with an
  optional Discord DM (bot side) the moment a sale is attributed to their code.
- **A QR code for the referral link.** A QR code button on the referral page renders the partner's link as a
  scannable code (generated client-side, no external service) with a one-click SVG download — for streams,
  overlays, print and business cards.

#### Support tickets
- **More categories, better handling, image uploads.** The Discord ticket panel and the customer portal now
  offer **8 categories** (Support, Bug report, Installation & setup, Purchase & license, Feature request,
  Report a player, Partnership, Other) instead of 4. Discord ticket channels are now named
  **`[type]-[username]-[id]`** (e.g. `bug-max-0001`); each ticket opens with category-tailored *"what to
  include"* guidance and a default priority (bug reports & player reports open at **high**), and staff get
  one-click **🔀 Priority** (re-triage) and **➕ Add user** (searchable member dropdown) header buttons.
  **`/ticket rename`** can now change a ticket's **category** — the channel prefix, the AI setting, and the
  **Discord category the channel is moved into** all update to match (e.g. renaming a Support ticket to
  Partnership pulls it into the partner category). The AI doc-assistant is **off** for Purchase, Report and
  Partnership tickets (human-handled). Each ticket type can also **route to its own Discord category
  channel**, configurable from the dashboard *Bot configuration* table (or `/config`); unset types fall back
  to the default tickets category. Openers can finally **attach screenshots** — the ticket channel now grants
  *Attach Files* / *Embed Links* (this was the missing permission). *(Discord bot lives in its own repo; the
  portal category list here is kept in sync.)*
- **Gapless documentation — embeds and every message.** Ticket transcripts silently dropped every embed as
  "(embed/attachment)" — and since staff dashboard replies, web-portal replies and the AI assistant *all*
  post as embeds, the entire support side of each conversation was missing from the history. Now every
  message is rendered in full (embeds, attachment names), read past Discord's 100-message cap, and the
  conversation view tags each line by source (opener / staff / AI / portal). A new `lacore_ticket_messages`
  collection records each message the instant it is posted, so the documentation is immediate and complete
  even for long or long-since-closed tickets. Degrades safely: until the collection is imported, the bot
  falls back to a full paginated read of the channel.

#### Paid add-ons
- **Add-on entitlements — unlock features per account from the dashboard.** A customer buys an add-on (e.g.
  an extra CAD), and staff tick it on for their account under *Settings → Add-on entitlements*. The unlock is
  **backend-decided per license key** and delivered through the existing `/ingest/config` channel: the
  account's server receives its entitled add-on list and turns the matching `Feature('…')` flags on.
  **Fail-closed** — an add-on the account isn't entitled to is forced off at load even if someone edited
  `cfg-features-sh.lua`, so a licensed server can't switch a paid feature on locally. Add your own add-ons by
  adding a row to the registry (`modules/entitlements/entitlements-sh.lua` + `landing/lib/addons.mjs`) and
  gating the module with `Feature('<id>')`. Takes effect on the customer's next restart; new
  `lacore_entitlements` PocketBase collection; ships with one example add-on, `extracad`.

  > ⚠️ **Config note (`configs/cfg-features-sh.lua`):** a new **Add-ons** block at the end of `Features`,
  > holding paid-add-on flags (default **false**). These are entitlement-gated — the dashboard/backend
  > decides them; the local value is only the fail-closed default.

#### CAD & MDT
- **A Supervisor terminal — records, not just a dashboard.** `/supervisor` opens a rank-gated terminal for
  shift supervisors and watch commanders, built to read like a real public-safety records system rather
  than a game UI: a module launcher, **several records open at once as tabs**, dense sortable grids,
  labelled field sheets, a function-key bar and a status line. Four modules ship:
  **Watch** (live unit roster with rank and location, a live map of every unit and incident, assign /
  set-status controls and a division broadcast with the attention tone), **Warrants & BOLO** (active
  BOLOs with one-click cancel and everyone currently carrying a warrant), **Personnel** and **Cases**
  (below). Who counts as a supervisor is **server-decided**: the unit's **job grade** on a framework
  server (per-department minimum), or a **config allowlist** of license identifiers / callsigns for
  standalone servers. Gating is enforced server-side for the terminal *and* its actions — the client only
  asks — and it reuses the existing dispatch backend, so a supervisor no longer has to be registered as a
  dispatcher to direct their shift. Every command action is written to the admin audit.

  > ⚠️ **New config file (`configs/cfg-supervisor-sh.lua`):** who may open the terminal — `minGrade` /
  > `minGradeByDept` for framework servers, an `allow` list (license identifier or exact callsign) for
  > standalone ones, plus `command` and `leoOnly`. Ships closed to everyone but grade ≥ 3 / listed units.
  > On a **standalone** server every grade is 0, so the `allow` list is the only way in — leave it empty
  > and nobody can open it.

- **Personnel files.** The Personnel module is an officer's service record: identity and assignment, a
  **shift log** with time on duty broken down per department, **callsign and rank history**, training and
  **certifications**, **discipline and commendations**, and activity counters (arrests, citations, reports,
  evidence). LACORE carried no rank at all before this, so on-duty units now also carry a job grade, and
  the roster shows it.

  Reading a file needs the supervisor rank. **Writing one is a deliberately higher bar** — promotions,
  certifications and discipline are career records — and needs either the `lacore.personnel.write` ACE
  permission or a job grade at/above `writeMinGrade`. Both are decided on the server and re-checked on
  every write. Reads are audited too, and a file containing discipline entries is logged as such.

  Activity counters are computed by a **scan** over who authored each record, not incremented on write, so
  they can always be recomputed and never drift — every LEO write path now stores a stable author identity
  alongside the display name it stored before. **Honest by construction:** nothing from before this update
  can be attributed (there was no rank, no duty history and no author on old records), so files start when
  they were first seen and the Activity tab states the date its counters begin from rather than implying
  they cover the server's whole history.

  > ⚠️ **New config file (`configs/cfg-personnel-sh.lua`):** the write bar (`writePermission`,
  > `writeMinGrade`) plus the vocabulary — entry types, statuses and the certifications your departments
  > issue. Rename or extend them freely; the terminal reads them from here.

- **Case files — the extended report layer.** A case ties an incident, the people and vehicles involved,
  the reports already on their records and a multi-section **narrative** (synopsis / investigation /
  statements / conclusion) into one numbered file, with its own audit trail and a `draft → submitted`
  status. Cases get a real number — `LAPD-26-000142` — from their own counter, deliberately **not** the
  incident number, which rolls over and is reused.

  A case is a **container, not a copy**: reports keep living on the person's record exactly as before and
  the case points at them, so nothing had to be migrated and the MDT person query is untouched. Filing a
  report the normal way with a case number links it both ways, which finally makes "show me every report
  on this case" answerable. Attaching an incident that doesn't exist is refused rather than left dangling,
  and an approved case is locked — corrections become a supplement.

  > ⚠️ **New config file (`configs/cfg-cases-sh.lua`):** the case-number agency prefix, case types,
  > narrative sections, person/vehicle roles and dispositions.

- **Case review — an officer submits, a supervisor signs off.** Submitted cases land in a **review queue**
  (oldest first, with a badge showing how many are waiting) where a supervisor approves or rejects them.
  **A rejection requires a reason** — enforced on the server, not just greyed out in the UI — because an
  officer who has to fix a report needs to know what to fix. The submitting officer is notified of the
  outcome wherever they are, and both decisions land in the case's own audit trail and the admin audit.
  Approving **locks** the case: corrections open a **supplement** that carries the parent's number, so a
  signed-off file is never quietly rewritten.

- **A master name & plate index.** Search a person or a plate and see everywhere it turns up: their own
  record (warrants, arrests, citations, reports, evidence), their registered vehicles, and every case they
  appear on — as a suspect, victim, witness or as the officer of record. Clicking a result opens that case
  as its own tab, so following a thread through the records is one click rather than a new search.

- **Developer API v1.2.0 — personnel and cases.** `GetPersonnelFile` / `GetDutyLog` read a service record,
  and `GetCase` / `GetCases` / `CreateCase` work with case files. Personnel access is deliberately
  **read-only**: promotions and discipline sit behind a higher in-game permission bar and an export cannot
  prove who is asking. A case opened through the API is owned by the **calling resource**, not a fabricated
  unit, and starts as a draft that goes through the same supervisor review as any other. Documented in
  `modules/api/README.md` (whose version line had drifted and is now correct again).

- **Officers can add & clear warrants from any CAD — plus a BOLO board on the 9100-T.** A warrant used to be
  something only the person could set on their *own* profile; now any **on-duty unit** can flag or clear a
  warrant on a queried person straight from the record, in **all four terminals** (LAPD PremierOne, LASD
  PCMS, Agency MDT and the 9100-T retro CAD). It's **server-authoritative and on-duty-gated** — the client
  only asks; the server sets it, mirrors it onto the person's record and writes it to the **BigBrother
  audit** — and fires `lacore:api:warrantChanged` for integrations. The **9100-T retro terminal** also gains
  a **BOLO board**: list active BOLOs, create one (person / vehicle / plate, with a 10-32 danger flag) and
  cancel them — the other terminals already had this; the retro CAD was BOLO-blind until now.
- **Officers can add & clear warrants from any CAD — plus a BOLO board on the 9100-T.** A warrant used to be
  something only the person could set on their *own* profile; now any **on-duty unit** can flag or clear a
  warrant on a queried person straight from the record, in **all four terminals** (LAPD PremierOne, LASD
  PCMS, Agency MDT and the 9100-T retro CAD). It's **server-authoritative and on-duty-gated** — the client
  only asks; the server sets it, mirrors it onto the person's record and writes it to the **BigBrother
  audit** — and fires `lacore:api:warrantChanged` for integrations. The **9100-T retro terminal** also gains
  a **BOLO board**: list active BOLOs, create one (person / vehicle / plate, with a 10-32 danger flag) and
  cancel them — the other terminals already had this; the retro CAD was BOLO-blind until now.

#### Vehicles & insurance
- **Vehicles start insured by default.** Insurance is the flag officers see when they run a plate, and the
  owner can flip it from their profile. Until now a freshly-registered vehicle started **uninsured** and
  stayed that way until the owner opted in, so running plates showed uninsured across the board. New
  registrations are now insured out of the box. A new switch, **`Vehicles.insuredByDefault`** in
  `cfg-vehicles-sh.lua` (also tunable from the dashboard), turns it back to opt-in.

  Only the **first** registration is affected: a vehicle an owner has deliberately un-insured stays
  un-insured, and re-registering never overrides their choice. (That distinction was also a latent bug — the
  old `existingVeh.insured or false` would have re-insured an un-insured car under the new default; it is now
  handled explicitly.)

  > ⚠️ **Config note (`configs/cfg-vehicles-sh.lua`):** one new key, `insuredByDefault`, defaulting to
  > **true**. On update, vehicles registered from now on start insured; existing records are untouched. Set
  > it to `false` to keep the old opt-in behaviour.
- **Insurance developer API** (API v1.1.0). `exports['lacore']:GetInsurance(plate)` returns `true` / `false`
  / `nil` (unknown plate), and `SetInsurance(plate, insured)` writes it — so a mechanic job, an insurance
  shop or a payment webhook can drive insurance without touching the core. A new event
  `lacore:api:insuranceChanged (plate, insured, by)` fires on every change. Docs in `modules/api/README.md`.
- **The unregistered-plate → stolen flow is now a config toggle.** When an officer runs a plate that isn't on
  file, LACORE asks the driver to `/vreg` and, if they don't in time, flags the **plate** as stolen. A new
  `Vehicles.vreg` block turns the whole flow on/off (`enabled`) and tunes the window (`seconds`, previously
  hard-coded to 15). Also editable from the dashboard. Clarified across the docs that **LACORE never deletes
  the vehicle** here — it only writes a stolen flag on the plate; a car that vanishes the instant it spawns is
  a *different* resource (a vehicle whitelist, an anticheat, a garage script), which this toggle will not
  affect.

  > ⚠️ **Config note (`configs/cfg-vehicles-sh.lua`):** one new block, `Vehicles.vreg = { enabled = true,
  > seconds = 15 }`, defaulting to the previous behaviour. Set `enabled = false` to remove the `/vreg` prompt
  > and the stolen flag entirely.

#### Server-owner controls
- **Toggle the "ran a plate / person" chat broadcast.** Running someone or a plate in the MDT/CAD posts a
  `<callsign> ran "<query>"` line in chat to on-duty units (LAPD, LASD and Agency). A new
  **`MdtConfig.announceRuns`** option lets servers that find this spammy — or want run history kept private —
  turn it off; the default stays **on** (unchanged behaviour). ⚠️ **Config change:** new
  `MdtConfig.announceRuns` key in `configs/cfg-mdt-sh.lua` (set it to `false` to disable).
- **The built-in hands-up / holster binds can be switched off.** LACORE registers hands up (`/hu`, **U**) and
  hand-on-holster (`/hh`, **X**). Set **`Features.rpemotes = false`** and neither command is registered and
  both keys are left free — for anyone running a dedicated emote / roleplay script that owns U and X. Same
  pattern as the seatbelt toggle; cuffing forces hands up on its own and is not affected. Also toggleable
  from the dashboard (Features).
- **One config for the 90s theme.** The retro phone's settings used to be scattered across `cfg-phone-sh.lua`,
  and the year and handset name were hardcoded in the UI. The new `configs/cfg-retro-sh.lua` gathers it in one
  place: turn the retro phone on, set the **year** it shows, the **phone model name**, the **in-hand prop**
  and the **carrier**. All cosmetic — the year never touches the in-game clock. Also tunable from the
  dashboard (Retro / 90s tab).

  Backward compatible: a server still setting `PhoneCfg.retro = true` keeps working, and an old config with no
  retro block falls back to the shipped `NT-3100` / brand name.

### Fixed
- **The Supervisor terminal opened but stayed empty.** It was gated for opening and then left out of the
  data-forward gates, so it never received unit, call or chat syncs — the long-standing failure mode in
  that file. It is now part of those gates (and of the keyboard + control handling, so typing in it works),
  it closes the other CADs when it opens instead of two terminals fighting over input focus, and it pulls
  the radio log and map calibration on open so the broadcast view and map are populated from the first
  frame. Its config also promised that every action is written to the admin audit — that was not true for
  the reused dispatch actions, and now is.
- **Admin "open tickets" count was inflated.** The overview counted PocketBase ticket rows with no `closedAt`,
  which included synced rows for channels that were deleted without a proper close (e.g. it read 22 when only
  9 were open). It now uses the bot's **live** count (open tickets whose channel still exists), falling back
  to the old heuristic only if the bot is unreachable.
- **Customer dashboard version was stuck at 3.2.1.** The version came from the `LACORE_VERSION` env pin, which
  short-circuited the changelog-derived lookup (exactly the drift the design was meant to avoid). The
  changelog is now the source of truth; `LACORE_VERSION` is only an emergency fallback for the first read
  before the changelog is reachable — so the version self-heals to the latest without touching the server.
- **The retro 9100-T CAD now shows a stolen flag on an unregistered plate.** Running a plate that was flagged
  stolen but never registered showed **"NO RECORD"** on the retro terminal (the LAPD and Agency CADs showed it
  correctly). The retro CAD only read the stolen flag from inside the code path that needs a matching record,
  so an empty result dropped it. It now raises the caution and prints **`<plate> — STOLEN VEHICLE`** even with
  no record on file, matching the other CADs.
- **Docs reconciled with the actual configs.** A careful audit of the documentation against every
  `configs/*.lua` fixed a batch of stale or wrong reference entries (notify modes, the phone eyefind URL,
  evidence types, air-unit/impound/global-ban wording, member-vehicle gating, the penal-code mockup, and
  more), and documented recently-added configs that were missing (retro phone, `Features.rpemotes`, the Turf
  capture keys, the remote-config consent gate, Rich Presence, identity link). A few stale config
  **comments** were also corrected to match the code — the STT engine is Vosk (not browser SpeechRecognition),
  the K9 command list includes `sit`/`lay`/`bark`, and Rich Presence isn't convar-driven. Comment/doc only —
  no behaviour changed.

## [3.3.0] – Model library, config editor & a rebuilt player list

The config editor grows up. A setting can be a slider, a colour, a keybind, a spawn name or a map
position instead of a text box, and 29 more settings became tunable from the dashboard — each one
curated from the real config files rather than exposed wholesale.

Around it sits a model library: your server inventories what it actually has (`/modelscan`),
photographs it (`/modelcapture`), draws it to scale, and `/preview` lets you look at any model in 3D
in the game that owns it — which is also the only honest way to answer "is this add-on installed?".

In the resource itself, the player list behind **I** stopped being native rectangles and became a
real interface, charges can now be issued straight from the LAPD and Agency terminals, and the
German and Russian MDT stopped being half English.

### Added
- **New remote-config field types.** `range` (slider + exact value), `color` (swatch + hex),
  `keybind`, `vehicleModel` / `pedModel` / `weapon` (searchable spawn-name picker) and `coords`
  (X/Y/Z + heading, with a paste box that reads `vector3(…)`, `vec3(…)`, `{x = …}` or plain numbers).
  Validated by shape on **both** sides — `landing/lib/configschema.mjs` and the resource's
  `modules/remoteconfig/remoteconfig-sh.lua` — so an unknown or malformed value is still ignored by
  each side independently.
- **Model pickers accept add-on models.** The catalogue (`landing/lib/gamedata.mjs`) is a suggestion
  list, never a whitelist: any well-formed spawn name is accepted and flagged as "custom", because
  every server runs models that appear in no public list.
- **Seven more settings are now tunable from the dashboard:** K9 model + heel distance, impound reach,
  the phone's open key, the member-badge colour, and the jail cell / release positions.
- **Phase C2 — 22 more settings**, curated one by one from the config files: air unit on/off, the whole
  CCTV camera feel (prop, look speed, zoom limits, scan time, field grouping), jail sentence clamps and
  persistence, the phone's modern/retro switch and in-hand props, and a new **Integrations** tab
  (dispatch forwarding + target script, property addresses, framework identity fallback).
- **Two more field types the real configs needed:** `tristate` (`auto` / on / off — LACORE's own
  three-way integration switch, where the boolean has to *stay* a boolean or every `== false` check on
  the resource side silently fails) and `propModel`.

- **`/preview <model>` — look at any model in 3D, in the game that owns it.** Vehicles, peds, props and
  weapons, orbit camera, mouse or A/D to turn, scroll to zoom. Every model picker in the dashboard has a
  **VIEW IN GAME** button that copies the matching command.
  It also answers "does this model actually exist on my server?" — an add-on that isn't installed says so
  instead of silently spawning nothing.

  > A 3D viewer in the browser is not possible and won't be built: GTA's models are Rockstar's property,
  > so nobody may ship, host or convert them. The game already has every model — including the add-ons
  > that appear in no online list — so the preview happens where the models actually live.

  Fair by design: your ped stays put, stays visible and still takes damage; any damage closes the
  preview. The previewed entity is **local only** — no other player sees it, and it can't be entered or
  driven. Staff tool (`Features.admin`).

- **`/modelscan` — the model library's foundation.** An admin runs it once and the game inventories
  what this server actually has: every vehicle (add-ons included, because `GetAllVehicleModels` sees
  them and no external catalogue does), plus the peds and props the config references. Each model is
  measured — length, width, height, seat count, class, the game's own display label — and the result
  goes to the dashboard.

  Measurements and names only: no assets, nothing about players. The client does the measuring because
  only the running game knows what loaded, but the server re-validates every row before it leaves, and
  the ingest endpoint validates it again — an ingest route must not trust its caller even with a valid
  licence key.

- **Model library in the dashboard** (`/dashboard/library/`, linked from Manage LACORE). Browse every
  vehicle, ped, prop and weapon by spawn name or model name, filter vehicles by class, sort by size or
  seats, and tick **On my servers only** to hide anything your scan didn't find.

  Two sources, labelled so you can tell them apart: what `/modelscan` reported, and our curated
  suggestion list so the page is useful before you ever scan. A model the scan found but the catalogue
  doesn't know is tagged **ADD-ON**; one only the catalogue knows is dimmed and tagged **NOT FOUND**.
  That difference is the point — it is the only place that tells you what your server actually has.

  No pictures, and that is deliberate: GTA's models and screenshots are Rockstar's, so LACORE may not
  ship, host or hotlink them. Every entry instead carries **VIEW IN GAME**, which copies the `/preview`
  command for the real model in the engine that owns it.

- **`/modelcapture` — pictures for the library, taken on your server.** Each model is spawned in the
  preview scene, framed so it fills the shot whatever its size, photographed via `screenshot-basic` and
  uploaded. The URLs come back and attach to the matching model in the library.

  **LACORE hosts the pictures for you** — there is nothing to set up. Your server asks for a
  short-lived upload session with its licence key and the screenshots go to LACORE's image host. Prefer
  your own storage? Set `Library.uploadUrl` in the new `configs/cfg-library-sh.lua` and yours wins
  (a Discord webhook, or any uploader answering with JSON containing a URL).

  > ⚠️ **New config file (`configs/cfg-library-sh.lua`).** All defaults work as shipped. The upload
  > target is deliberately **not** remotely editable — where your data goes must never be something the
  > dashboard can change, the same rule that keeps `PhoneCfg.cameraUpload` out of the allowlist.

  The image host takes the narrow view of its job: a capture authenticates over the existing relay and
  gets back an **expiring token**, so the licence key never travels in an upload URL. Uploads must be a
  real PNG or JPEG — checked by magic bytes, not by the type the client claims, so an executable or a
  script-bearing SVG named `.png` is refused. Filenames come from the content hash, so nothing a client
  sends becomes a path, and the account is a one-way hash so no Discord id appears in a public URL.
  Per-account quotas on files and bytes.

  A run is capped by `Library.maxPerRun` (default 150) and resumes with an offset, so a full sweep of a
  few thousand vehicles is several deliberate runs rather than one endless one. Do it on an empty
  server: you stand still for the duration, and — as with `/preview` — any damage cancels it. Everything
  already shot is kept.

  Image URLs are the least trustworthy input in the feature: they come from an outside host, through a
  game client, and end up as an `<img src>`. The resource only accepts URLs whose host matches your
  configured endpoint, and the ingest endpoint re-checks the shape (http(s) only, no `data:`, no
  `javascript:`, no protocol-relative, no embedded credentials).

- **Scale drawings in the library — real 3D, in the browser.** Hit **📐 SIZE** on any scanned model and
  a rotatable shape appears at its measured size, with a 1.8 m figure beside it for scale and a
  **compare with** picker to put two models side by side. Drag to turn it.

  > It is a scale drawing, **not the model**. GTA's models may not be shipped, hosted or converted — no
  > web viewer can legitimately render one, whether or not the site charges for access. So the
  > proportions are real (measured on your server) and the shape is one of our own low-poly stand-ins,
  > picked from the vehicle class and refined by the measurements: a 6.5 m long, 2.6 m tall "Emergency"
  > vehicle is drawn as a van, not a saloon, whatever the class says.

  It answers "how big is this and will it fit", which no photo does. For what a model looks like there
  is the captured photo and `/preview` in game. Rendered as plain SVG — no 3D library, no WebGL, no
  dependency added.

- **`/streambudget` — what your add-on vehicles cost every player.** FiveM servers rarely die of
  scripts; they die of streaming. Every add-on vehicle's geometry and textures are pushed to *every*
  connecting client, and one careless 4K-texture car can outweigh fifty stock ones — which nobody can
  see from inside the game.

  The scan walks your started resources, keeps the ones declaring vehicle metadata, reads the model
  names out of their `vehicles.meta` and measures the matching stream files. The library then shows the
  total per client and a table sorted by weight, flagging **HEAVY**, **TEXTURES** (textures dominate —
  usually oversized source art) and **NO LOD** (no `_hi` variant, so the game has no cheaper version to
  draw at distance).

  It reads file **sizes** — never contents. A byte count is taken and the file is dropped, the same
  line the rest of the library holds. Stock vehicles aren't counted: they ship with the game and you
  couldn't change their cost anyway. The judgement (what counts as heavy) is made on the dashboard, not
  in the resource, so it stays consistent across builds.

- **Seatbelt and speed limiter can be switched off** (`Features.seatbelt`, `Features.speedlimiter`).
  Both also appear in the dashboard under Features.

  > ⚠️ **Config change (`configs/cfg-features-sh.lua`):** two new keys, both default **ON**, so an
  > untouched config behaves exactly as before. If you keep your own copy of that file, add them (or
  > restore from the shipped defaults) to see them.

  Requested by a customer running JG's HUD, which brings its own seatbelt: two of them means two icons
  and two sets of rules. `Features.seatbelt = false` removes the whole mechanic — the `/seatbelt`
  command is never registered (so it is free for the other script), the **K** bind is not taken, the
  warning icon is gone and you are no longer thrown through the windscreen. `HudCfg.vehicle` was not
  enough: it only hides the display while the mechanic keeps running underneath.

  The limiter is a separate toggle on purpose, so a HUD that owns cruise control but not the seatbelt
  can take just that one.

- **Charge picker in the LAPD MDT and the Agency MDT.** Until now charges could only be issued from a
  person's record card after a query, or from the LASD terminal. Both MDTs now have their own tab —
  **Charges** in the LAPD toolbar, **CITE / CHARGE** in the Agency function bar (LEO only) — that lists
  the shared penal code (`S.penalCode`) with a search box, citation/arrest switch, running fine and jail
  totals, and a notes line.

  The target is an exact character name, exactly as the server matches it; if you queried someone just
  before, one click fills their name in. Each MDT is skinned in its own look — the LAPD picker in the
  PremierOne grey/white grid (white mode included), the Agency one native on its `--a-*` theme variables
  so all seven colour presets follow. No Lua change: the picker sends the same `issueCharges` payload
  the record card already sent, so the server still computes fines and jail time from the config.

- **The playerlist ("I") is a real UI now.** It was drawn with native rectangles and text: a 6×4 grid of
  24 tiles showing an ID, a name and a nick, with a thin coloured line for the player's role. It is now a
  proper NUI board (`web/src/components/Playerlist.svelte`), and it finally shows what the server has been
  sending all along — every player's **department and callsign**, their **duty status** in the same colours
  the MDT uses, their **role as a readable badge** instead of a coloured line, and their **ping**.

  Ping is read on the server, not on the client: with OneSync a client only sees players in its own scope,
  so a client-side reading would be blank for everyone across the map.

  The server column (AOP, server status, dispatcher, unit counts, clock) moved over with it and is grouped
  into panels instead of two blocks of loose text. Behaviour is unchanged on purpose: **I** still toggles,
  the arrow keys still page, and the board takes **no** NUI focus — the mouse stays in the game, so it can
  never trap your cursor. It closes itself if the resource stops or if it ever errors.

### Changed
- **The charge picker lives in one place now.** Five terminals can issue charges — the LAPD MDT, the
  Agency MDT, the LASD PCMS, the 9100-T and the person record card — and each carried its own copy of the
  same search filter, the same picked-code map, the same fine/jail totals and the same submit payload.
  The logic moved into `web/src/lib/charges.svelte.js`; every skin keeps its own markup and now shares
  the state. Net 69 lines lighter, and a fix to the picker no longer has to be made five times.

- **The bot panel says whether the bot is actually current.** It showed the version the bot *reports*,
  with no way to tell that from the version that *should* be running — and "↻ Restart bot" does not
  help, because it reloads whatever is on disk rather than pulling. The status card now carries the
  commit the bot process was started from, and compares its LACORE version against the changelog (the
  single source of truth the portal already uses). Matching: nothing to see. Behind: an amber tile and
  one line explaining that it self-syncs within a changelog interval, and what it means if it does not.
  An unreachable changelog raises no warning at all rather than a false one.

- **Support can be answered from the dashboard.** The admin ticket archive could open a ticket but not
  actually read or answer one: it reused the customer viewer, which calls endpoints that filter on
  "tickets you opened yourself" — so every ticket someone else opened came back as *not found*. Support
  therefore always meant switching to Discord. Staff now get their own pair of endpoints without that
  filter, and the existing viewer takes an `admin` flag to use them.

  A staff answer is posted as **support** (own colour and author line, so the opener can tell it apart)
  and marks the ticket as *staff replied* rather than *the opener wrote* — the wrong flag there would
  have left the SLA sweeper pinging staff about a ticket that had just been answered. Unlike the
  customer reply, it is audit-logged: an answer sent from outside Discord should still be traceable.

- **The settings that used to be off-limits are now editable too — behind a switch only you can flip.**
  Upload targets, webhook URLs and anti-cheat thresholds were refused outright, because a compromise of
  the website could otherwise redirect every customer's data or disarm their protection. Refusing them
  forever was the easy answer, not the right one.

  They are now in the editor, and the consent lives on the server: the new `configs/cfg-remoteconfig-sh.lua`
  has a master switch plus one flag per category (`destinations`, `anticheat`, `roles`), all **off by
  default**. The website cannot change that file — it needs access to your disk — so an attacker who owns
  the site still cannot reach a server that has not opted in. Turning the master switch on is not enough
  on its own; each category is its own decision.

  Destinations get a second belt even once unlocked: a URL must be **https** and its host must appear in
  your own `RemoteConfig.allowedHosts` (empty means any https host, never plain http). And a destination
  may only ever be typed as a URL, never as free text — the test suite asserts that, so a future field
  cannot quietly slip past both gates.

  **The editor shows which of them your server actually accepts.** Every server reports its consent along
  with its running values, so a sensitive field carries a green *unlocked* or a red *locked* badge, and a
  locked one spells out the two lines to add on the server. A server that has not reported yet says so
  instead of pretending everything is closed. Better a visible lock than an edit that saves and is then
  quietly ignored.

- **The rest of the configs followed: 248 keys in the editor now** (from 121). The anti-cheat is fully
  represented — every detector's on/off, action and threshold — along with the Discord role IDs, the K9,
  evidence and fingerprint modules, and the anti-cheat evidence upload. Sensitive ones sit behind the
  consent gate: 58 anti-cheat, 15 role IDs, 4 destinations.

  Three things stayed out for reasons worth writing down. `AntiDump.challengeSalt` is a **secret**, and a
  secret never travels. The **licence table and column names** are SQL identifiers, not settings. And the
  consent gate itself is not in the allowlist — a gate that can unlock itself is not a gate. All three are
  now guarded by tests rather than by memory.

  What is left unexposed is list data, not settings: the emoji map, the department definitions, prop
  categories. Those are rows, and rows have their own editor.

- **32 more settings are tunable from the dashboard** — the heli-cam feel (zoom limits and speed, pan
  speed, lock-on time, street-name overlay, spotlight range/brightness/radius) with its three keybinds,
  the whole turf-war balance, the framework-bridge switches, plate formatting, the radio-log limits, and
  the Big Brother buffer plus its nine category switches. 121 → 153 keys, added on both sides in
  lock-step, which the test suite asserts in both directions and by type.

  Deliberately still out, and this is the line rather than an oversight: **where data goes** (upload
  targets, webhook URLs), **anything carrying code**, **anti-cheat thresholds and actions** — a
  compromised dashboard must not be able to disarm every customer's protection — and **the Discord role
  IDs** that decide who counts as staff. What is left over is mostly not settings at all but list rows
  (departments, props, penal code, spawns), which the Data lists editor already covers.

- **The dashboard's main nav points at Config instead of License.** The config editor is what a customer
  comes back to; the licence key is a one-off on setup day. The key page keeps its own route and the nav
  item stays lit while you are on it.
- **The landing page has a way to buy.** It had 22 links and not one went to the store: both primary
  buttons pointed at the documentation, so a visitor who had read all fourteen sections and was
  convinced ended up in the docs. The shop is now the primary call to action in the header, the hero and
  the closing section, with the docs kept as the secondary button next to it, plus a STORE link in the
  footer.
- **The seatbelt and limiter toggles are documented.** They shipped in this release and are the answer
  to "I already run JG's HUD", but the Feature Toggles page never mentioned them — including the part
  that matters, that `HudCfg.vehicle` only hides the display while the mechanic keeps running.

### Fixed
- **The landing page advertised 3.2.5.** The hero badge and the "what's new" card read their version
  from a hand-written block in `marketing.js` — under a comment saying *keep in sync with changelog.md*.
  It had drifted two releases behind on the page customers see first. A Vite plugin now reads the real
  `CHANGELOG.md` at build time and inlines only the newest entry, so a release has to land in one file
  and nowhere else. An unreadable or version-less changelog falls back to a literal rather than breaking
  the build.
- **Small print on the landing page failed WCAG AA.** The muted token sat at 2.7–3.2:1 against the
  panels across 54 places, the 9px section labels used the brand blue at 3.5:1, and the legal disclaimer
  was the worst on the page at 2.44:1. The muted token now clears 4.75:1 on the lightest panel, the
  labels moved to the existing lighter brand token (5.6:1) and the disclaimer joined the muted token.
  74 failing elements → 0. Purely decorative "+" list markers were left alone.
- **The customer portal scrolled sideways on a phone — for staff.** The dashboard header could not shrink
  below 547px while the CUSTOMER/ADMIN switch was in it, so every one of the 21 pages scrolled sideways on
  a phone for anyone with staff access. Customers were never affected. The switch now drops to icons on
  narrow screens (keeping `title`/`aria-label`), and the wordmark steps aside below 640px.

  This also revived a breakpoint that had never worked: the rule hiding the "DOCS" label since 1180px
  targeted a `<span>` that did not exist in the markup, so the label had always stayed at full width.
- **Muted text in the portal failed WCAG AA.** Two greys — one of them a hardcoded duplicate of the
  `--dim-2` token, the other a third grey that was never a token at all — sat at 3.48:1 and 4.29:1 against
  the panels, under the 4.5:1 floor for small text. Both are now a single value at 4.73:1 or better across
  every panel shade, across 38 places. The small accent caption moved to the existing lighter `--accent-2`
  (6.27:1) so the brand accent itself is untouched where it fills buttons and borders.
- **The German and Russian MDT was half English.** The LAPD MDT hardcoded its field mask, its action bar
  and its empty states in English although the translations were already sitting in `lang/de.json` and
  `lang/ru.json` — the component simply never asked for them. Wired up, plus nine field labels that had
  no key at all. The dispatch console's disposition list (Advised / Arrest / Gone on Arrival / …) had the
  same problem and is translated now too.
- **…and the rest of the LAPD MDT followed:** table headers, the unit filters and sort box, the comment
  and chat entry, the status-times panel and every empty state. 31 more keys, so the terminal no longer
  has a single hardcoded string in it.
- **The Agency MDT was entirely English in German and Russian.** This one was the opposite problem: the
  component asked for translations correctly, but the whole `mdt_*` block in `de.json` and `ru.json` still
  held the English text verbatim — 63 keys covering every header, button, column and empty state it has.
  Translated. The nine that stayed identical (`Code`, `STATUS`, `BACKUP`, `ZOOM`, …) are the same word in
  German by design.
- **Comment fix in `configs/cfg-hud-sh.lua`.** `playerlist` was described as "shown while holding the
  player-list key" — the key toggles the board, it is not held. Comment only: no default changed and
  nothing to do if you keep your own copy of the file.
- **The radio log showed `[radio_log]` instead of its text.** All four of its strings were written as
  `t('radio_log') || 'Radio Log'` — but `t()` never returns a falsy value: a missing key comes back as
  `[key]`, so the fallback could never run and the panel rendered the raw key names. The four keys now
  exist in all three locales and the dead fallbacks are gone. Worth remembering project-wide: `t()` is
  not nullable, so `t(…) || 'default'` is always dead code.
- **The legacy phone's Bleeter app no longer costs a frame slot while closed.** Its render thread starts
  with the resource and used to run at frame rate for the entire session, even for players who never open
  the app — only to re-check one flag. It now idles at ~7 checks a second and goes back to full frame rate
  the moment the app is on screen.
- **The legacy phone's Notes and Radio apps now close with the phone.** Both ran a frame-rate loop whose
  only exit was the BACK key. That normally lines up with closing the phone (same key), but any teardown
  that skipped it would leave the loop polling — still switching radio stations and paging notes on a
  phone that is no longer on screen. Both now leave as soon as the phone is gone.

- **The Chat and AOP settings were unreachable.** Both groups existed in the schema but belonged to no
  tab, so the seven `/me`-style and AOP toggles only appeared if you happened to search for them.
- An untouched dropdown rendered blank instead of showing its default option.

### Notes
- No config file changed — these are additional *remotely tunable* keys. A server that never touches
  them in the dashboard keeps running exactly on its own `configs/*.lua`.
- Not tested in-game: the allowlist is covered by a Lua test (apply + reject + read-back), the portal
  side by a Node test, but the actual pull-and-apply on a live server still needs a real run.
- Two settings were reviewed and **deliberately left out**: `PhoneCfg.cameraUpload` and
  `PhoneCfg.eyefindUrl`. Both name a destination for data, and where a customer's uploads go must
  never be something the portal can change. The schema generator now refuses them by policy.
- Tests live in `tests/` — `node tests/configschema.test.mjs` and `lua54 tests/remoteconfig.test.lua`.
  They also assert the two allowlists hold identical keys *and* types, which is the invariant the
  whole design rests on.

## [3.2.6] – Dispatch bridge, whitelabel & opt-out toggles

Builds on the 3.2.5 integration bridge: LACORE's automatic calls now forward into the popular
third-party **dispatch** scripts out of the box, through a pluggable adapter registry (no core edits to
add more).

> [!WARNING]
> **Config change (`configs/cfg-integrations-sh.lua`):** the dispatch config was generalised. Pick your
> dispatch with the new `Integrations.dispatch` (`"auto"` by default) and set the per-type mapping in the
> neutral `Integrations.dispatchCalls`. The old `Integrations.tk_dispatch` / `Integrations.tkDispatch`
> keys still work as a fallback, but if you customised `tkDispatch.calls`, move your job mappings into
> `dispatchCalls`.

Three things LACORE used to own unconditionally can now be handed to your own scripts. Every toggle is
**fail-open** — leave the configs alone and nothing changes.

> [!WARNING]
> **Config change (`configs/cfg-features-sh.lua`, `configs/cfg-hud-sh.lua`):** two new feature groups
> (`Features.chat`, `Features.aop`) and two new HUD keys (`HudCfg.mdtstatus`, `HudCfg.mdtalerts`).
> All default to ON, so an untouched config behaves exactly as before. If you keep your own copies of
> these files, add the new keys (or restore from the shipped defaults) to see them in the dashboard.

### Added
**Dispatch bridge — works with your dispatch out of the box**

- **Forward LACORE calls into any supported dispatch script.** A pluggable adapter registry
  (`modules/bridge/integrations-sv.lua`) subscribes to `lacore:api:callCreated` and routes each call to
  the active dispatch. Supported: **tk_dispatch**, **ps-dispatch**, **cd_dispatch**, **core_dispatch**,
  **rcore_dispatch**, **linden_outlawalert** — each built against its real export/event API. Select with
  `Integrations.dispatch = "auto"` (uses the first one running) or force a specific one.
- **One neutral call map for all of them.** `Integrations.dispatchCalls` maps each LACORE call type to a
  neutral `{ code, priority, jobs, blip, flash }`; every adapter translates it to its own fields (10-code,
  recipient jobs, blip sprite/colour, priority/flash), so you configure it once regardless of which
  dispatch you run.
- **ps-dispatch** uses a tiny client relay (its `CustomAlert` is a client export); the others fire their
  server event/export directly. All gated + pcall-wrapped — a no-op when no dispatch is running.

**Notifications — first-class adapters**

- **Route LACORE notices to ox_lib / okokNotify / mythic_notify with one setting.** `NotifyCfg.mode`
  now accepts `"ox_lib"`, `"okok"` and `"mythic"` directly (built-in, resource-gated, falling back to the
  LACORE toast if that resource isn't running) — no more writing a `customHandler` for the common ones.

**Bridge event & export surface — rounded out**

- **New events:** `lacore:api:incidentAttached` (a unit self-assigned), `lacore:api:evidenceLogged`,
  `lacore:api:recordAdded`.
- **New exports:** `AttachUnit(src, incidentNumber)` (attach a unit to a call, ENROUTE + Assigned) and
  `GetCallByUnit(src)` (the call a unit is on).

**Enhanced Playerbase — shared bans &amp; warns (Beta)**

- **Share your bans and warns across LACORE servers.** New owner commands `/lacore bans list` and
  `/lacore bans upload` push your local bans + warns (from `data/banlist.json`) to the LACORE API, keyed to
  your community by the license key. Server-side they're hashed, deduped and attached to a shared player
  history — a **ghost identifier** is created for a player you haven't met yet, and claimed when they turn
  up. Requires the online playerbase collections + a license key.
- **Cross-community sharing (share keys).** Under **Community → Players → Bans/Warns Database** in the
  dashboard you can generate a share key and hand it to a partner community; whoever holds it can **read**
  your bans &amp; warns, tagged with your name. Paste a partner's key to pull their records into your list.
  Sharing is directional and revocable. By default it is **advisory only** — shared records never auto-ban.
- **Opt-in enforcement + ghost claim on connect.** A server can set `setr lacore_playerbase_enforce true`
  to actually reject a connecting player who carries an active ban in its playerbase (its own bans + any
  partner database shared under the **Enforce** scope — plain read grants stay advisory). Enforcement needs
  **both** sides: the owner flips their key to Enforce, and the consuming server enables the convar. On
  connect a matching **ghost identifier** is also claimed (real identifiers attached, ghost flag dropped).
  Fail-safe: no key / relay down / any API error never blocks a connect.

- **Hand the RP chat commands to your own chat resource.** `Features.chat` gates LACORE's built-in RP
  commands, split so you only give up what collides: `chat.rp` (`/me` `/do` `/gme` `/gdo`),
  `chat.actions` (`/run` `/grun` `/search` `/gsearch` `/give`), `chat.leoreq` and `chat.report`. With a
  group off LACORE neither registers the command nor advertises it as a chat suggestion, so a server
  running **cc-chat / cc-rpchat** no longer gets every line posted twice by two handlers.
  (For the plain OOC chat line this pairs with `ExternalChat` in `cfg-server-sv.lua`.)
- **Hand the AOP to your own script.** `Features.aop` switches off the whole Area-of-Play system —
  `/aop`, `/aopvote`, the vote menu and countdown, the AOP line on the PLD, the scoreboard entry and
  the entered/left toasts. A finer `Features.aop.commands` frees **only** the two commands while
  LACORE keeps drawing the AOP, so your script can own the commands and still feed the display.
- **Turn off the MDT status badge.** `HudCfg.mdtstatus` hides the colored duty-status plate drawn
  bottom-right for Law Enforcement and Fire/EMS. It was previously impossible to disable and drew even
  while the MDT was closed. The panic-button / crime-broadcast / unread-call flashes sit behind a
  **separate** `HudCfg.mdtalerts` on purpose, so hiding the status plate never hides a panic alert.

All six new keys are also exposed in the dashboard's online config (**Server config**).

**Spawn selector — pick where you start on the map**

- **New `configs/cfg-spawns-sh.lua` + `Features.spawnselect`.** Instead of one fixed spawn point, the
  player gets the city map with a pin per location. **Law enforcement and Fire/EMS start in front of
  their own station**, and civilian points can be marked `aopOnly = true` so they are only offered
  while inside the current Area of Play — no more driving or teleporting across the map to reach the
  roleplay. Shows on first join and after a respawn (both switchable).
- **Server-authoritative by design.** The client only ever sends a point **ID**; the server re-checks
  the player's job and the AOP before it returns any coordinates, and the offered list carries no
  z/heading at all. A modified client gains nothing — a point it may not use resolves to the fallback.
- **Cannot strand a player.** Selector off, no points the player may use, no choice made within
  `timeout`, or a rejected pick — every path ends at the configured `fallback`, and the player is held
  frozen until the world has loaded around them so they cannot fall through the map.
- **`/spawnpoint <id> <label>` captures a point where you stand.** Spawn coordinates have to sit on the
  actual ground and face something sensible, which cannot be read off a map — stand there, look the
  right way, and the command prints a ready-to-paste config line using the **ground** Z beneath you and
  your current heading. The shipped list is deliberately short and only contains positions the resource
  already uses elsewhere: station and hospital entrances differ on every map and MLO, so guessed
  coordinates would drop players into walls.
- Reuses the existing `lacore-maps` tiles and the shared projection (`lib/mapproj.js`), so pins land
  exactly where the dispatch and Big Brother maps put the same coordinates — one calibration, not three.

**Whitelabel — rename anything the MDT / CAD shows**

- **New `configs/cfg-mdt-labels-sh.lua`.** Put a key in `MdtLabels` and that text replaces the
  translated one everywhere it appears — window title, section headers, buttons, empty states,
  input placeholders. A community can rebrand the generic MDT (`Mobile Digital Terminal` →
  `Pacific Valley MDT`, `CALLS` → `JOBS`, …) without touching locale files or the encrypted core.
  Leave a key out and the normal translation for the player's language is used, so an empty table
  behaves exactly as before.
- The override lives inside the NUI's `t()` helper, so it applies to **every** translated string in
  the UI, not just a fixed list — and it re-renders live, no reload.
- The generic MDT's remaining hardcoded English was moved onto locale keys as part of this
  (63 new keys in `lang/en.json` / `de.json` / `ru.json`), which is what makes it overridable at all.
  ⚠ An `MdtLabels` entry applies to **all** languages — it is a label, not a translation. On a
  multi-language server, translate in `lang/*.json` and use this file only for names that stay the
  same everywhere.

**Customer portal**

- **Server developers can be given dashboard access.** A new Discord role bucket (**Server developer
  roles**, set under Admin → Settings) lets a customer's external developer sign in. The role grants
  **login only** — a developer's own account carries no licence, no keys and no downloads. They reach a
  customer's data the normal way: that customer adds them under **Team** with scopes. A user who is
  both a customer and a developer keeps their customer role. Takes effect on the developer's next login.
- **Ban appeals (Entbannungsantrag).** A player banned on your server can appeal at **`/appeal`** using
  the Ban ID from their kick message — no account needed, since a banned player is not a LACORE
  customer and cannot sign in. The appeal is routed to the community that issued the ban and shows up
  under **Players → Ban appeals**, where staff can **Approve & lift** (a soft lift, history preserved)
  or **Deny** with a note. Gated by the existing `players` team scope.
  The public endpoint is rate-limited and answers **identically whether or not the Ban ID exists**, so
  it can't be used to probe which bans exist; each ban allows one open appeal at a time.

### Fixed
- **Phone / 911 calls now push to on-duty CADs instantly.** A call made through the phone path
  (`relaySpecialContact` — 911 / 311 / Panic / …) broadcast its alert but never called
  `SyncCallsToUnits()`, so the new call only showed up when an officer *re-opened* their CAD. It now
  syncs to every on-duty terminal immediately.
- **Connecting can no longer get stuck on "Checking permissions…".** The optional Discord connect card
  (`RichPresence.connectCard`) is now presented inside a `pcall` with a guaranteed `deferrals.done()`
  fallback, so a card that fails to render can never leave a player hanging on the deferral.
- **Diagnostics false positives** (`/lacore doctor`): `sv_scriptHookAllowed = false` is no longer flagged
  (`false` and `0` both mean disabled), and the standalone `lacore-mdt` product no longer warns about its
  resource name.
- **Spawn selector: the map no longer covers the "Spawn here" panel and the location list.** Leaflet's own
  marker/popup panes (z-index 600+) were painting over both overlays. The map layer now sits in its own
  stacking context so those panes stay trapped inside it, and the two panels render above it. The picker
  also always uses the **satellite** map now instead of the flat atlas tiles — it reads as a real place
  you're about to spawn into, not a menu graphic.
- **Phone: no more black blocks poking past the rounded top corners.** The titanium bezel was drawn with
  large-spread `box-shadow` rings, which FiveM's CEF renders with *square* corners on a rounded element
  (a normal browser rounds them, so it only ever showed up in game — worst at the top, where the soft drop
  shadow doesn't mask it). The bezel is now a rounded background on the phone's frame instead of spread
  shadows, so every corner stays cleanly rounded. The screen, notch and app grid are unchanged.
- **Phone: the Search (Spotlight) sheet no longer spills over the frame, and its scrollbar is tidy.** The
  overlay was positioned against the phone body instead of the screen, so it bled ~5px past the rounded
  glass onto the bezel and showed a raw browser scrollbar. It now fills the screen exactly, is clipped to
  the rounded corners, and uses a slim translucent scrollbar.
- **Fire/EMS CAD: comments on 911/PD-bridged incidents now show up.** When an EMS unit added a comment to a
  shared 911/PD incident it was saved server-side but never sent back to the EMS terminal — the bridged
  call entry omitted its `comments`, so the message tab stayed empty. The bridge now carries the incident's
  comments, so EMS-authored notes appear in the thread. (Comments on EMS-native incidents already worked.)
- **Fire/EMS CAD: 911 calls now reach the terminal.** The EMS call list only surfaced explicit *Requesting
  Fire/EMS* / *Requesting Coroner* requests (or calls an EMS unit was already attached to), so a plain 911
  call never appeared. Generic `911 Emergency` calls are now shown too (tagged **PD**, since they aren't
  necessarily EMS requests); dedicated Fire/EMS and Coroner requests still show first with the **EMS REQ**
  flag.
- **Fire/EMS CAD: the "Unread MDT Calls" HUD alert now clears when you open the terminal.** The new-call
  popup/sound cue (drawn for Fire/EMS while there's an unread call) was only reset by the LAPD/Agency/LASD
  terminals — opening the EMS CAD didn't clear it, so it stuck on screen even after the unit had looked at
  the incidents. Opening the EMS CAD now clears it like the other terminals do.
- **You can add contacts on the retro phone again.** The brick phone could only *view*
  contacts — there was no way to create one, so the address book stayed whatever the
  server handed you. **Contacts → Add contact** now runs a proper two-step entry: the
  name via multi-tap T9, then the number on the keypad, saved through the same
  `phoneSaveContact` backend the modern phone uses. Softkeys read *Next* / *Save*, and
  *Del* backspaces (or steps back to the name).
- **The engine keybind (`G`) no longer throws a script error on foot.** `/engine` compared
  `vehicle.hp` before it was ever set, so pressing the key outside a vehicle spammed
  `attempt to compare number with nil`. The command now bails out when there's no tracked
  vehicle, and only refuses to start a wrecked engine when the health is actually known.
  The engine-warning-light check got the same nil guard.
- **Fire/EMS running as the "AMR" job now gets the same dispatch cues as "Fire/EMS".** Three checks only
  matched the literal `Fire/EMS` job string, so servers whose medics use the `AMR` job were silently left
  out of: the new-call alert sound (incl. the *Requesting Fire/EMS* cue), the on-screen "Unread MDT Calls"
  alert, and the incident blips on the minimap. All three now recognise `AMR` alongside `Fire/EMS`.
- **The dashboard config no longer forces itself onto your server.** Saving on **Server config** used to
  send **every** setting on the page, not just the ones you touched — and unset booleans were seeded to
  `false`. One Save could therefore write `features.* = false` for all 63 toggles and switch off most of
  the resource on the next pull. The page is now an explicit **override layer**: a setting is only sent
  once you edit it (shown as **DASHBOARD**); everything else stays **LOCAL FILE** and your server's own
  `configs/*.lua` keeps deciding it. Untouched fields also seed from what the server *reports* as
  running instead of `false`. **RELEASE ALL TO LOCAL** hands every setting back in one click — the fix
  for an account that already stored values it never meant to manage.

- **Map markers sit where they belong again.** The tile projection used a single scale factor for both
  axes. The pyramid is not isotropic to world units, so one shared factor cannot fit both — the error
  grew with distance from the centre: roughly 56&nbsp;px off downtown, 142&nbsp;px at Paleto Bay and up to
  205&nbsp;px at the map corners, on an 8192&nbsp;px map. Recalibrated with separate X and Y scales, taken
  from [gta-v-map-leaflet](https://github.com/RiceaRaul/gta-v-map-leaflet) (MIT), which drives the same
  tile pyramid. Affects the dispatch map, Big Brother and the spawn picker at once — they all read the
  one projection.

- **An unreachable database no longer hangs the server (players stuck on "Checking bans…").** When MySQL
  is down, oxmysql's promise rejects inside Node — that is the `AggregateError [ECONNREFUSED]` in the
  console — and its `.await` **never returns**. Every `DBLoadStore()` caller then waited forever. That
  includes the `playerConnecting` ban check, so an unreachable database left joining players stuck on
  the deferral, and console commands that read a store simply produced no output at all. Database calls
  now run behind a **5-second deadline**: the first timeout logs a clear message naming the cause, marks
  the database unavailable and falls back to the local `data/*.json` mirror — and stops issuing queries,
  so the next call is instant instead of waiting again. The code always claimed "DB unreachable → local
  file only"; only the *disabled* case actually did that.

- **Dragging a suspect into a vehicle no longer uncuffs them or leaves the officer stuck.** Cuffing and
  dragging were pure **toggles** on both the client and the server — every event just flipped whatever
  state that side happened to hold. One stray, duplicated or out-of-order event (which is what the
  put-in-vehicle / take-out-of-vehicle sequence produced) desynced the two sides permanently: the
  suspect detached and un-cuffed while the officer stayed locked in "dragging", and only a relog cleared
  it. The server now owns the drag, decides the RESULTING state and tells both sides what it **is**
  rather than "flip it" — including releasing a previous target when an officer switches, and clearing
  the drag when either player disconnects. `getCuffed` / `getDragged` take an explicit state (a missing
  one still behaves like the old toggle, so nothing else breaks).

- **The retro phone now holds a retro prop.** The in-hand prop stayed a modern handset, which looked
  wrong next to a 90s brick screen. When `PhoneCfg.retro` is on it uses `PhoneCfg.retroPropModel`
  (default a chunky handheld — base GTA has no true brick phone) with its own `retroHold` offset. Point
  it at a custom brick-phone model if you stream one.
- **Retro brick-phone skin for retro-themed servers.** A 90s NT-3100-style phone — green LCD, keypad,
  T9 texting, softkeys and a signal/battery bar — over the **same** phone backend: real contacts,
  threads, call log and call state, real calls and SMS. Turn it on with `PhoneCfg.retro = true` in
  `cfg-phone-sh.lua`; everything else about the phone is unchanged. (Includes a Serpent mini-game,
  because of course it does.)
- **Priors at a glance on a person query.** Running an 11-27 in the Agency MDT (and the LAPD MDT — both
  use the same record card) now shows a **priors strip** above the criminal history: arrests, citations,
  reports and flags, plus total fines and jail months. The strip turns red when the person has a prior
  arrest, and reads "No record" when they're clean. Computed from the records already returned by the
  query — no extra lookup.
- **Priors on the retro CAD person query too.** The retro terminal read out name, warrant and licences
  but never a person's history. A person run now ends with a `PRIORS n ARR / n CIT / n REP` line (or
  `NO PRIORS`), in the CRT style, from the same records — so all three CADs surface priors.
- **The `/settings` command can be renamed.** Another HUD (jgscripts and the like) commonly owns
  `/settings` too, and two resources can't share a command — ours was silently shadowing theirs. Set
  `HudCfg.settingsCommand` in `cfg-hud-sh.lua` to a different name (or `false` for none). The settings
  menu is also key-bindable now — **FiveM → Settings → Key Bindings → "LACORE: Open settings menu"** —
  so it stays reachable whatever you name it.
- **Phone ringtone no longer sticks after a call ends.** The ring played on sound id `-1` (engine-chosen,
  so unreferenceable), which meant a looping ringtone asset kept playing once the call ended — stopping
  the loop only stopped the *next* ring, not the one already sounding. It now plays on a tracked sound id
  and is stopped explicitly on answer / decline / end.
- **Broken or duplicated penal-code entries are now reported instead of silently breaking the CAD.** The
  charge picker and the server-side fine calc both key everything on `code`, so a duplicated `code`
  (easy to do when bulk-adding charges of one class) hid an earlier charge and mis-toggled in the picker,
  and a malformed `cfg-charges-sh.lua` made the picker come up empty with no hint. A start-up check now
  logs duplicate codes, malformed entries and the loaded count — so "charges won't show" is one console
  line to read.
- **The whole HUD could vanish at once, permanently, with nothing in the server console.**
  `GetUserSettings()` returned **nil** for a setting that wasn't present yet — and `userSettings`
  starts empty, filled only during init. `drawPld()` used that result directly as a table index, so
  `pldSettingsNew[nil]` → `ipairs(nil)` → a runtime error. Because the PLD, player list, nameplates and
  vehicle HUD all render inside **one** `CreateThread`, that single error killed the thread for good:
  every one of those elements disappeared together and never came back until the resource restarted.
  It looked silent because a *client* error only reaches the player's F8 log, never the server console.
  `GetUserSettings(name, default)` now takes a default, the PLD resolves an unknown or out-of-range
  theme/colour to the first valid one, and each renderer is wrapped so a failure is **reported once**
  and disables only that element — the rest of the HUD keeps running.

- **`/aop` with no argument no longer wipes the AOP.** It used to set the Area of Play to an empty
  string and persist that to KVP *and* the FiveM server browser; it is now ignored.

### Changed
- ⚠️ **Config default:** the phone now ships with the **retro brick-phone skin off** (`PhoneCfg.retro = false`)
  — the modern app phone is the default, and the 90s brick skin is opt-in for retro-themed servers. Set
  `PhoneCfg.retro = true` in `configs/cfg-phone-sh.lua` to bring the brick phone back.

## [3.2.5] – Security & fairness hardening pass

Server-authoritative hardening, multiplayer-fairness fixes and small performance fixes across the
civilian (RP), CCTV, impound, K9, Air Unit, corrections (jail), fingerprint and address (NADS)
systems. No gameplay change for legitimate players.

> [!WARNING]
> **Config change (`configs/cfg-server-sv.lua`):** new `AccessControl.membership` key. It defaults to
> `"auto"` when absent, so nothing breaks if you don't touch your config — but add
> `membership = "auto"` to your `AccessControl` block to keep it aligned with the shipped default.

> [!WARNING]
> **Config change (`configs/cfg-weapons-cl.lua`) — holster section rewritten.** The holster config is now a
> single, simplified `HolsterConfig` (vx-holster style): one `weapons` whitelist, an `animation` toggle, an
> `eup` toggle and position-paired `on` / `off` EUP component lists. The old per-ped `HolsterConfig.Peds` /
> `.Weapons` maps and the standalone `holsterWeapons` list were **removed**, and the `HolsterAnim` table (the
> `/hh` reaching animation, bound to X) was added. **If you keep a customised `cfg-weapons-cl.lua`, replace its
> holster section with the new shipped one and set the `on` / `off` drawable numbers to your EUP pack** —
> otherwise the holster (and `/hh`) will error.

> [!WARNING]
> **Config change (`configs/cfg-server-sv.lua`):** new `ExternalChat` key. It defaults to `false`
> (LACORE's OOC chat behaves exactly as before), so nothing changes if you don't touch it. Set it `true`
> only when you run a third-party chat resource (cc-chat / cc-rpchat) to stop double messages.

> [!WARNING]
> **Config change (`configs/cfg-server-sv.lua`):** new `EntityLockdown` key. It defaults to `"strict"`
> (exactly the previous behaviour), so nothing changes if you don't touch it. Set it `"inactive"` to bring
> ambient NPC traffic / peds back (at the cost of the client entity-spawn protection).

> [!WARNING]
> **Config change (`configs/cfg-integrations-sh.lua`):** new `Integrations.tk_dispatch` toggle +
> `Integrations.tkDispatch` map. Defaults to `"auto"` (only forwards when `tk_dispatch` is actually running,
> so it's a no-op otherwise). If you use tk_dispatch, set the per-type `jobs` to YOUR framework job names.

### Added

**Public developer API (`modules/api/`)**

- **A stable exports + events surface so other resources can talk to LACORE / LACORE MDT.** Every
  export wraps an existing internal function (no new backend logic). Called by the running resource
  name — `exports['lacore']:…` (core) or `exports['lacore-mdt']:…` (standalone).
- **Server exports:** `GetOfficer`, `IsOnDuty`, `GetCallsign`, `GetDepartment`, `GetOnDutyUnits`,
  `HasPermission`, `CreateCall`, `ResolveCall`, `GetActiveCalls`, `GetCall`, `QueryPerson`,
  `QueryPlate`, `GetBolos`, `CreateBolo`, `GetApiVersion`. `CreateCall`/`ResolveCall` let e.g. an
  alarm or heist script feed real CAD calls in and close them out; creation/resolution stays
  server-authoritative.
- **Records lookup:** `QueryPerson(query)` (by server id / name / plate) and `QueryPlate(plate)`
  reuse the MDT's own in-memory matching. Results are **sanitised** — the raw criminal `records` and
  `faction` fields are never exposed; active BOLO hits are attached under `bolos`.
- **BOLO creation:** `CreateBolo(opts)` issues a person / vehicle / plate BOLO and syncs it to
  on-duty units + the dispatch webhook. Refactored the officer NUI path (`mdt:BoloCreate`) onto the
  same shared `CreateBoloRecord` core (single source of truth).
- **Client exports:** `OpenMDT`, `CloseMDT`, `IsMDTOpen`, `GetApiVersion`.
- **Events emitted by LACORE:** `lacore:api:callCreated`, `lacore:api:callResolved`,
  `lacore:api:dutyChanged`, `lacore:api:boloCreated` (plus `lacore:mdt:opened` /
  `lacore:mdt:closed` for MDT open-state).
- **Docs:** the Developer API section is now a dropdown with an **API Bridge** (a drop-in adapter
  resource that auto-detects the `lacore` / `lacore-mdt` prefix and no-ops safely when LACORE isn't
  running) and an **AI Prompt** (a self-contained prompt that hands an AI the full contract to
  generate a tailored integration).
- Ships in both the full core and the `lacore-mdt` standalone product. Reference + examples in
  `modules/api/README.md`.

**Customer portal — license keys & server management**

- **License keys link a server to your dashboard account.** Generate a key in the customer portal,
  paste `setr lacore_license_key "…"` into `server.cfg`, and the server's telemetry now carries it
  (`modules/security/telemetry-sv.lua`). The web service verifies the key and stamps a **trusted**
  account link on the server record — replacing the old, unverified `lacore_owner_discord` self-claim.
  A bad / missing / revoked key never blocks registration; the server just stays "unlicensed".
- **New portal pages** (`landing/`): `/dashboard/keys` (create keys, copy the cfg line, revoke) and
  `/dashboard/servers` (your linked servers with live online status, players and version; rename +
  remove). Discord-login based — no new accounts, no passwords.
- **Payments** (`/dashboard/payments`): customers see their Tebex purchases (package, amount, status).
  The Discord bot's Tebex webhook now records each money event to PocketBase (`lacore_payments`),
  matched to the account by the Discord ID entered at checkout.
- **Online resource config** (`/dashboard/config`): tune a vetted, **allowlisted** set of settings
  across modules — branding, feature toggles (CAD, phone, CCTV, K9, …), HUD, notifications, MDT and
  Discord presence — from the dashboard, organised into sections with typed controls (toggle / number /
  text / dropdown). Each server pulls its config by license key (`modules/remoteconfig/` +
  `LacoreRelayFetch` + read-only, token-gated `POST /ingest/config`). **Live** settings (branding)
  apply at runtime; **load-time** settings are cached to `data/remote-config.json` and re-applied early
  on the next restart (before the feature modules load). The core also **reports its current values
  up** (`POST /ingest/config-report`) so the dashboard shows what's really running and can adopt it.
  Security by design: only known typed keys ever cross — **never code, never secrets, never raw config
  files** — so even a full site/DB compromise can't run anything on a server; any error falls back to
  the shipped local `configs/*.lua`. Broadened to 72 settings across 19 modules (features + sub-toggles,
  HUD, notifications, MDT, presence, corrections, impound, K9, air unit, profile, radio STT, CCTV, …),
  with a **plain-English description per section** and a **search box** so it stays approachable. The editor is now organised into tabs (General / Features / HUD & Phone / Modules); search spans all tabs. Plus
  **3 quick-start templates** (Full RP / Police-CAD-only / Lightweight) and a **rolling revision history
  (max 5)** you can restore from — and the core reports its live values back for one-click "adopt current".
- **Config data-list editor** (`/dashboard/config/lists`): edit LACORE's config *tables* — starting with
  the **penal code** (charges: code / title / class / fine / jail) — as an inline row editor. Each list
  maps to a resource global the core replaces wholesale by license key (`RemoteListTargets` +
  `ApplyRemoteLists` in `modules/remoteconfig/`; `POST /ingest/config` now also carries the lists). Pure
  typed DATA only — validated per field, never code. Extensible: add a `LIST_SCHEMAS` entry + the same id
  in the resource to expose more tables. Now also ships two flat vehicle lists — **blacklisted vehicles** and **member-only vehicles** — edited as a simple one-per-line textarea (spawn names or class numbers, deduped) — and the **phone directory** (`PhoneCfg.directory`: name / number / category), so the businesses players look up in the phone's Directory app can be maintained without touching Lua. A list target may now be **nested** (e.g. `PhoneCfg.directory`), not just a top-level global; it is only written if every parent already exists, so a target whose module isn't loaded is skipped rather than created.
- **`configs/cfg-blips-cl.lua` now documents what it actually does.** The file described map blips —
  sprite `id`, `x`/`y`, a hover `image`, a `location` — but **no code in the resource reads those fields**;
  the table is only consumed by the phone's Directory app (`name` / `phone` / `category`). Following the
  old comment therefore put nothing on the map. The config is untouched (the phone still reads it), but the
  comment no longer promises a feature that isn't there and points at `PhoneCfg.directory` instead.
- **Diagnostics — license & version checks** (`/lacore doctor`): the boot report now shows whether a
  **license key is activated** (and whether it's recognised / inactive), and compares the running
  version against the latest — with a **big console banner** (and a red report line) when a server is
  **2+ releases behind**. The relay `/ingest/server` + `/ingest/config` responses now carry the license
  state + latest version. Also fixed the misleading `remote config applied — 0 setting(s)` log for an
  unrecognised/inactive key (it now says the key isn't recognised and only logs real changes).
- **Downloads & versions** (`/dashboard/downloads`): current version, a Keymaster/store get-&-update
  CTA (delivery stays via Tebex & Keymaster, tied to the purchase), and the full parsed version history.
- **Portal support tickets** (`/dashboard/tickets`): customers can open a support ticket from the web —
  it creates a real private Discord ticket channel for them (via the bot's control API, their own
  Discord id only) so it flows through the existing claim / close / transcript pipeline. They also see
  their ticket history and read closed-ticket transcripts in the portal.
- **Team / sub-users** (`/dashboard/team`): an owner can grant trusted teammates (by Discord id)
  **scoped** access — `servers`, `config` and/or `billing`. Members sign in with their own Discord and
  switch into the owner's account from a sidebar switcher; the portal shows only the areas their scopes
  cover and every `/api/*` request re-checks membership + scope server-side (the client header alone
  grants nothing). Self view is unchanged.
- **Partner program** (`/dashboard/partner`): partners see their referral stats — referred sales,
  revenue and payout earnings — attributed by their referral code on each Tebex order (the bot's
  webhook records the referral on the payment; admins assign partners + codes in the dashboard).
- **Admin role settings** (`/admin/settings`): staff can set the dashboard role IDs (owner / staff /
  customer / supporter / partner) online — a PocketBase override over the `.env` defaults, applied on
  each user's next login. Fail-safe: if the override store is unreachable, the `.env` values still apply.
- **Portal logging** (`landing/`): a small structured logger (`lib/log.mjs`) with a `LOG_LEVEL` env
  (debug/info/warn/error). Wide coverage — request completions, logins, ingest (server registration,
  config pull, rejects), PocketBase errors, and every state-changing action (key / config / team /
  partner / role-settings / ticket) is logged with actor + target, greppable in `journalctl`. Secrets
  are never logged.

### Fixed

**LEO / CAD — reports & citations everywhere**

- **The LASD PCMS terminal can now file reports and issue citations / charges.** After a person query
  (DEX), two actions appear under the record: **Cite / Charge** (multi-select over the shared penal code,
  citation/arrest toggle, running fine + jail total) and **File Report** (report type, narrative, location,
  involved, incident #). Both are styled in the PCMS amber/teal skin and drive the same shared backend as
  the LAPD MDT — the server already gated this on *being an on-duty unit*, not on the department, so LASD
  deputies simply had no UI for it before.
- **The 9100-T retro CAD can now file reports and issue citations / charges too.** From a PERSON result the
  terminal offers **Cite / Charge** (type to filter the penal code, click charges to add, ENTER to issue)
  and **File Report** (pick a report type, type the narrative, ENTER to file) — all in the green CRT look.
- **Behind the scenes:** `OpenLasdMdt` now sends the penal code + report types to the LASD UI, and
  `OpenNineMdt` now also sends the report types (it already sent the penal code). No server logic changed —
  the citation / report events (`char:IssueCharges`, `char:FileReport`) are the exact same ones the LAPD and
  Agency MDTs use.

**Integrations**

- **Public integration bridge — add third-party scripts without touching the (encrypted) core.** LACORE
  now emits a full set of `lacore:api:*` events covering every dispatch/officer moment — `callCreated`
  (both the 911 path *and* MDT-created calls), `callUpdated`, `callResolved`, `panic`, `dutyChanged`,
  `unitStatusChanged`, `unitCallsignChanged`, `reportFiled`, `chargesIssued`, `boloCreated`, `boloCancelled`
  — plus drive-in exports (`CreateCall`, `ResolveCall`, `AddCallNote`, `SetUnitStatus`, `SetUnitCallsign`,
  `QueryPerson`, …). Any integration is now a plain external resource that *subscribes* to the events and
  *calls* the exports — no core edits, no escrow touch. A ready-to-run
  `examples/lacore_integration_example` and the full reference (docs → Developer API) ship with it.
- **TK_Dispatch (tk_scripts) — full `exports` support, event-driven.** LACORE's dispatch calls (911 / 311
  / Panic / Crime Broadcast / Shot Spotter / Requesting LEO/Fire-EMS/Coroner / Tow / Created Incident) mirror
  into `tk_dispatch`'s call list via `exports.tk_dispatch:addCall`, **and** a unit's callsign is pushed via
  `exports.tk_dispatch:setCallsign` on every duty change (cleared when going off duty). It's a bridge adapter
  (`modules/bridge/integrations-sv.lua`) that simply subscribes to `lacore:api:callCreated` /
  `unitCallsignChanged` — gated on the resource + an `"auto"`/`false` toggle and pcall-wrapped, a no-op
  without tk_dispatch. Per-type mapping (recipient jobs, code, priority, blip) + `syncCallsigns` live in
  `configs/cfg-integrations-sh.lua`.

**Access control**

- **Member-only perks no longer lock up when the Discord layer is off.** The `member` flag (used to gate
  `/onduty`, member vehicles and board voting) was derived *only* from the Discord "Member" role, so with
  `AccessControl.discordRoles = false` (ESX / QBCore / plug-and-play) it was `false` for everyone and the
  client blocked `/onduty` — even though the server-side duty auth already allowed it. Added
  `AccessControl.membership` (`"auto"` | `"open"` | `"role"`, default `"auto"`): in `"auto"` a player is a
  member when the Discord "Member" role is held **or** — when Discord auth is off — automatically, so the
  perks just work without Discord. Documented in [Discord & Access Control](/configuration/discord).

**Civilian**

- **Activity completion is now position-checked.** `civ:ActivityDone` verifies the player is actually
  at the activity's final step before granting the XP/achievement, so a modified client can no longer
  loop-report completions to farm rewards from off-map (mirrors the anti-spoof checks the turf system
  already does).
- **Showing your ID and placing a prop are now proximity-checked server-side.** Both require the
  target / spot to be near you — blocking a modified client from popping an ID card on someone across
  the map or dropping props remotely.
- **Organisation events are rate-limited.** Every org action writes the store to disk; a per-source
  rate limit now stops a modified client from looping create/disband or spamming MOTD/invites as a
  cheap DoS or to harass nearby players.

**CCTV**

- **Field-camera placement is capped, proximity-checked and rate-limited.** `cctv:PlaceCamera` now
  enforces a configurable maximum (`CCTV.maxCameras`, default 60), rejects placements far from the
  operator and validates the coordinates — so a compromised authorised client can't spam cameras
  across the map (each camera persists to disk and spawns a networked prop for every player).
  Remove / rename / set-group are rate-limited too.
- **On-foot CCTV is no longer a safe hideout.** The on-foot operator's desk standin was invincible,
  so an attacker at the desk couldn't touch them while they watched cameras. The standin is now
  damageable and the viewer bails out of CCTV the moment it's attacked — exposing the operator,
  exactly like the in-vehicle viewer already did.

**Impound**

- **Impounding can no longer world-delete an arbitrary vehicle.** `impound:Add` removes the vehicle
  for everyone, so it now verifies server-side (by netId) that the vehicle is real and near the
  officer before broadcasting the delete — a modified authorised client can no longer grief-delete
  cars anywhere on the map. Add / release are rate-limited too.

**K9**

- **A downed handler's dog now breaks off its attack.** The K9 kept biting its target after the
  handler was killed or knocked down; it now leaves combat and holds the moment the handler goes
  down, so a dead officer can't keep a working attack dog on someone.

**Corrections**

- **The inmate roster and release events are rate-limited.** Both are already LEO-gated and
  server-authoritative; a per-source rate limit now also caps how fast a client can pull the roster
  (which walks the inmate list) or fire releases (which write the store to disk).

**Fingerprint**

- **The mobile fingerprint scan is rate-limited.** It's already LEO-gated and proximity/cuff-checked;
  a per-source rate limit now caps how fast it can be fired (each scan runs a records + BOLO lookup).

**NADS (address system)**

- **Address submissions are validated and bounded.** `AddNADSStreet` (staff-only) now sanitises the
  street name and point list — capping the name length, limiting points per street and dropping
  non-numeric coordinates — so a crafted event can't inject a huge or malformed blob into the saved
  address store. Add / fetch are rate-limited too.

### Changed

- **Config backup/restore now MERGES instead of overwriting — updates no longer strip your new keys.**
  `/lacoreconfig restore` used to write whole files back, so restoring a backup taken on an older version
  removed any config keys a later update had added (and could re-introduce an old, restructured block).
  Each backup now also stores the pristine default it was edited from (shipped in `configs/.defaults/`), and
  restore does a 3-way merge: only *your* changes are re-applied onto the current files, so keys/blocks added
  by an update survive. Where an update changed the exact spot you did, the new default is kept (a feature
  never breaks) and the conflict count is reported. Legacy (pre-merge) backups still restore whole-file — re-run
  `/lacoreconfig backup` once to upgrade them.
- **NPC traffic can be turned back on (entity-lockdown is now configurable).** The default routing bucket
  was hard-locked to `"strict"` entity lockdown (an anti-cheat measure that blocks clients from spawning
  arbitrary networked entities) — but that also blocks the game's ambient NPC vehicles + peds, so streets
  were empty. New `EntityLockdown` key (`configs/cfg-server-sv.lua`, default `"strict"` = unchanged): set it
  `"inactive"` to restore NPC traffic (trading away that entity-spawn protection), or `"relaxed"` to test a
  middle ground.
- **Compatibility with third-party chat resources (cc-chat / cc-rpchat).** LACORE's OOC chat took over
  the stock `chatMessage` (re-posting it as `OOC | Name` and running a name anti-spoof kick). External chat
  resources don't honour LACORE's `CancelEvent()`, so every line showed **twice** and their RP names tripped
  the anti-spoof kick. New `ExternalChat` toggle (`configs/cfg-server-sv.lua`, default `false`): when `true`
  LACORE no longer re-posts/cancels and skips the name anti-spoof, so the external chat owns display — no
  double messages, no false kicks. The Discord OOC log and the slur filter stay active.
- **The holster system config is now simple (vx-holster style).** The old setup needed a per-ped drawable
  map (`HolsterConfig.Peds`) plus two separate weapon lists; it is replaced by one `HolsterConfig` with a
  single `weapons` whitelist, an `animation` toggle, an `eup` toggle and two position-paired `on` / `off`
  EUP lists (`{component, drawable, texture}` — `on[i]` = gun in holster ↔ `off[i]` = empty). Drawing a
  listed weapon swaps every EUP holster to its empty look **ped-agnostically** (a row only fires if the ped
  actually wears it), so it works for any uniform without listing ped models. Set the `on` / `off` numbers
  to your EUP pack.
- **The reaching / hand-on-holster animation (`/hh`, bound to X) is now configurable.** The animation
  dict/name was hardcoded; it now reads `HolsterAnim` from `configs/cfg-weapons-cl.lua`, so a server can
  swap the reach animation (`rest` = hand at the holster, `up` = hand raised) without touching code.
- **The civilian activity loop no longer runs on the 0 ms hot path while travelling** — it only
  tight-loops (to draw the objective marker) within ~60 m of the current step, polling slowly
  otherwise.
- **The Air Unit spotlight loop no longer touches the 0 ms path while the searchlight is off** — it
  idles at 200 ms and only runs per-frame while actually drawing the beam.

## [3.2.4] – Dashboard blocks override the local allow-list

### Changed

- **A dashboard server block now enforces even on an allow-listed IP.** The IP-lock used to
  check the local `EXTRA_ALLOWED_IPS` allow-list *first* and skip the remote block-list on a
  match, so a whitelisted server could never be blocked from the dashboard. The remote block-list
  is now authoritative: an active block locks the server down regardless of the allow-list. The
  allow-list still works, but only as a **fallback** when the licence server is unreachable (so a
  network blip can't lock the owner out). Also fixes a latent nil-index on the "licensed" log line.

## [3.2.3] – Richer server registration (public convars)

### Added

- **Server registration now includes the public server-browser convars.** On top of the existing
  metadata, each LACORE server also reports `sv_projectName`, `sv_projectDesc`, `tags`,
  `sv_enforceGameBuild`, `onesync`, `locale` / `sv_language`, `gametype` and `mapname`, shown in the
  admin dashboard's server-detail view. These come from a **fixed allowlist** — the telemetry never
  iterates or dumps all convars, so secrets like `mysql_connection_string`, `steam_webApiKey` and bot
  tokens are never sent. Still server-level only, still no player data.

## [3.2.2] – Automatic server registration out of the box

Fixes server auto-registration so it just works on every LACORE server with **zero configuration** —
no token to set, anywhere.

### Fixed

- **Server auto-registration now works on every server without any setup.** The write-only relay/ingest
  token is now a single fixed constant shipped inside the core (obfuscated in the escrow build) instead
  of a blank the maintainer had to fill before each build. Previously the token was empty, so the core's
  home-reporting (`/ingest/server`, identity link) short-circuited and **nothing** was ever sent — the
  admin dashboard's "LACORE servers" list stayed empty. Every LACORE server now reports `start` /
  heartbeat / `stop` automatically. The dashboard defaults to the same token, so it accepts those posts
  even when `INGEST_TOKEN` is unset. Still write-only and never a database credential — the resource
  continues to hold no DB host or credentials.

## [3.2.1] – ESX / framework compatibility & fixes

A compatibility pass for framework servers: LACORE no longer fights an ESX / QBCore / QBox server over
player spawning or vehicle plates. Also adds an ESX licence import into the MDT and moves the central
network endpoints out of the editable config.

### Added

- **ESX licence import into the MDT (owner-configurable).** On an ESX server LACORE now reads each
  player's `user_licenses` rows on load / character switch and shows their real licences in the CAD
  person record — no manual `/profile` entry. A new escrow-editable config
  (`configs/cfg-licenses-sh.lua`) lets server owners map their own ESX licence `type` strings onto the
  six MDT slots (driver · commercial · boating · pilot · ccw · hunting), with a toggle and configurable
  table/column names for non-standard forks. Best-effort: a fork without a `user_licenses` table never
  breaks the character import (licences just stay untouched). Standalone / QB / QBox are unaffected.
- **MDT plate query now hits the framework vehicle DB.** On an ESX server, running a plate that isn't
  in LACORE's own store is now looked up directly in `owned_vehicles` (matched normalised, so ESX's
  padded plates still match) and returns the vehicle plus its registered owner (from `users`) — so a
  car bought through the framework's own shop/garage shows up in the CAD even before it's mirrored into
  LACORE. Async, gated by `Bridge.useFrameworkCharacters`.
- **Search OFFLINE players by name in the MDT.** On an ESX server the person query now also searches the
  framework's `users` table (first / last / full name), merged with the local results and deduped by
  name — so an officer can look up a player who is offline or was never mirrored into LACORE. Async,
  gated by `Bridge.useFrameworkCharacters`.
- **Automatic server registration (zero configuration).** Every server running LACORE now registers
  itself with the LACORE service on start, sends a heartbeat every hour and reports on stop — so the
  team can see which servers are live, on what version and with how many slots. It goes through the same
  write-only relay as everything else (`lacore.netica.dev/ingest/server`): **server-level metadata only**
  (hostname, IP, version, slot/player count, optional owner Discord) — **never any player data**, no
  database credential, nothing for the owner to set up. Replaces the old start-up Discord webhook ping.

### Changed

- **🔒 The database host no longer appears in the resource at all.** The IP-lock and global-ban
  network used to read the licence/ban lists straight from the backing database URL (baked into the
  build). They now go through LACORE's own relay (`lacore.netica.dev/list/*`), and ban propagation/lift
  goes through token-gated relay endpoints — so the resource knows only `lacore.netica.dev` and holds no
  database address or credential. The public read endpoints expose exactly the same non-secret lists as
  before (blocked IPs, banned identifiers), which lets the database be locked down to superuser-only.
- **🔒 The resource no longer holds any central credential (identity link reworked).** The identity
  link used to require the server owner to put a database token in their `server.cfg`
  (`lacore_identity_token`). That was wrong: the token could read and modify **every** LACORE server's
  data. The core now posts to a narrow, **write-only ingest endpoint** on LACORE's own service instead —
  it never talks to the database and holds no database credential. There is **nothing to configure**:
  no convar, no token, no server.cfg line. The ingest endpoint accepts only identity records, rejects
  reads outright, validates every field and is rate-limited. Console/command messages no longer name
  any credential or backing store either.
- **Ban-network & identity-link need no endpoint configuration.** The central service endpoint for the
  global-ban network and the Discord identity link is now managed internally by LACORE and no longer
  lives in the editable config — there was never anything to set there, and it removes a footgun. The
  behaviour toggles (`enabled`, matched identifier types, refresh interval, fail-open, message) stay
  configurable as before.

### Fixed

- **Framework police cars demanded LACORE "membership".** LACORE's member-only vehicle restriction
  (`memberOnlyVehicles`, which includes class 18 = emergency) cut the engine and showed a "become a
  member" prompt for non-members — but on a framework server membership comes from Discord/playtime,
  which the server may have disabled, so a framework police officer got locked out of their own job
  vehicle. The restriction is now **skipped when a framework is detected** (the framework's job/
  permission system decides who may drive what). Standalone unchanged.
- **Entity-spam anti-cheat could delete server-spawned framework vehicles.** Garages / vehicle shops /
  dealerships that spawn vehicles **server-side** (e.g. `jg-advancedgarages`) tripped LACORE's
  entity-spam guard, which deleted the freshly spawned car — while client-side garages (e.g. esx_garage)
  were unaffected. On a framework server the check now steps aside for the framework's own AC
  (new `EntitySpam.skipOnFramework`, default `true`; set `false` to keep it on). Standalone unchanged.
- **Framework garage vehicles were removed right after spawning.** LACORE's per-frame vehicle loops
  (HUD dashboard, sunday-driver handling, tyre/nitro/plate tweaks) ran on the vehicle the ped was
  reported to be in — but a server-spawned vehicle (e.g. an ESX garage car) is reported before the
  client streams/owns the entity. Writing to it then (`SetVehicleHandlingFloat`, etc.) fought the
  OneSync ownership handshake — flooding the console with `No such entity` / `no script guid` and
  making the garage remove the freshly spawned car. LACORE now only tracks/writes a vehicle once it
  **exists locally** (`DoesEntityExist`), so it never touches a mid-handshake server vehicle. Also
  removed a stray `print(GetCurrentLocation())` debug line.
- **Framework servers: LACORE no longer controls player spawning.** LACORE set its own
  `spawnmanager` auto-spawn (fixed coords + a placeholder ped) and re-teleported the player on every
  `playerSpawned`. On an ESX / QBCore / QBox server the framework owns character spawning, so the two
  fought each other — which could teleport the player mid-action and stop **garage vehicles (e.g. the
  police garage) from spawning**. When a framework is detected (respecting a forced `Bridge.mode`),
  LACORE now leaves spawning entirely to the framework and never sets an auto-spawn, forces a respawn
  or teleports the player. Standalone servers are unchanged.
- **External garages / framework plates were overwritten.** LACORE re-formats vehicle plates to the
  server plate style and strips the yellow "EXEMPT" plate from civilian cars — but on an ESX/QBCore/QBox
  server the framework's garage owns each vehicle's plate and looks the vehicle up by it, so rewriting it
  made external garages report *"plate not found / shows a different plate."* Plate formatting is now
  gated by a new escrow-editable toggle `Vehicles.plateFormatting` (`configs/cfg-vehicles-sh.lua`),
  default `"auto"` → **on** standalone, **off** automatically when a framework is detected (the garage
  keeps its plate). Force it with `true` / `false`. Both plate-rewrite paths (the on-drive
  `CheckPlateValidity` and the EXEMPT-plate sweep) respect it.
- **"attempt to perform arithmetic on a nil value" when spawning / entering a vehicle.** The seatbelt
  ejection loop (`client/loops-cl.lua`) computed the vehicle's acceleration delta from a previous/current
  speed global that could still be unset on the very first vehicle frame — e.g. spawning straight into a
  garage vehicle — and divided by `GetFrameTime()`, which can momentarily be 0 mid-load. Both the speeds
  and the frame time are now guarded (`or 0.0` / zero-check), so the delta can never throw.

## [3.2.0] – New NUI Phone, Feature Toggles, Air Unit, Corrections & more

**Highlights:** a brand-new **iPhone-style NUI phone** (calls, SMS, apps and more), a **feature-toggle
config** so you can run only the parts of LACORE you want (e.g. just the MDT/CAD), real
**ESX / QBCore / QBox** compatibility, new gameplay systems (**Corrections / Jail**, **Impound**,
**Air Unit**, **K9**), premium notifications & dialogs, a full LACORE re-brand, config backup/restore,
and an experimental radio **speech-to-text**.

### Added

- **9100-T retro Mobile Data Terminal (new MDT skin).** A fourth CAD terminal styled after a 1990s
  in-car MDT — a green-phosphor CRT in a rugged chassis with a 12-key function panel (ACK / ENRT /
  SCENE / AVAIL / OUTSVC / TRANSP / UNAVAIL / VEH / PERSON / PROP / T-STOP / ONVIEW), a red EMER
  panic button and a **clickable on-screen keyboard** (works with the physical keys too). It is a
  re-skin of the shared LAPD/dispatch backend (same calls, statuses, self-assign and person/vehicle
  runs — no new server logic), routed automatically to any officer whose **department name contains
  "90s"**. Running a wanted person or a stolen vehicle shows a blinking red
  **"CODE 6 CHARLES – PROCEED WITH CAUTION"** banner with a compiled record summary. `ACK` attaches
  the unit and goes en route, `AVAIL` clears/detaches, `INSERT` opens incident comments,
  `SEND` runs a query, `BACKSPACE` goes back. New NUI component `web/src/components/RetroMdt.svelte`;
  routing + open/close in `modules/mdt/mdt-nui-cl.lua`. Fully localised (`nine_*` keys, en/de/ru).
- **Identity link for the LACORE Discord bot (optional).** A new server module
  (`modules/identitylink/`, feature toggle `identitylink`) records each connecting player's stable
  identifiers together with their Discord id in a central store, so the companion Discord bot can
  ban **all** of a player's identifiers from just their Discord user (not only the discord id). It
  only runs for players with a linked Discord, writes once per player per session, and is a no-op
  unless the server-only convar `lacore_identity_token` is set. Config: `configs/cfg-identitylink-sh.lua`.
- **Mobile fingerprint ID scanner (LEO).** A new handheld biometric device — a rugged, in-the-field
  mobile ID reader. `/mobileid` (bindable) scans the nearest **restrained** suspect: the LACORE ID device runs a
  capture animation, matches the print against the records database and returns the identity — name, DOB,
  sex, description, address, DL, and **active warrant / BOLO** flags — even when the suspect carries no ID
  and refuses to identify themselves. **Fair play:** you can only scan a cuffed suspect who's close by (no
  remote ID of free players), and every scan is written to the Big Brother audit log. Config
  `configs/cfg-fingerprint-sh.lua` (range, require-cuffed, fingers, keybind); feature toggle
  `fingerprint`. New module `modules/fingerprint/`.
- **MDT person record redesigned as an RMS-style folder.** Running a person now shows a proper
  records-management folder: a **From RMS** header, the name (with a mugshot slot), a tidy field grid —
  **Sex · Height · Weight · DOB · Hair · Eyes · Address** (address in yellow) plus **Race · OLN · CSZ ·
  Phone · Occupation** *when the identity provides them* — then the registered vehicles, and two labelled
  sections: **CRIMINAL HISTORY** (citations / arrests, or *"No criminal history on file"*) and **FLAGS /
  NOTES** (RP notes, reports & evidence, or *"No flags or notes on file"*), keeping the cite / report /
  evidence actions. Fields LACORE doesn't store are simply omitted, so it stays honest on a stock install
  and fills out fully on a framework identity. Applies to the LAPD and Agency MDTs.
- **Darker LAPD CAD theme.** The LACORE Mobile Client was reworked to a **dark-navy** palette — the bright
  royal-blue panels, header, toolbar and shiny 3D bevels are toned down to a flat, near-black navy that's
  easier on the eyes at night, while the coloured accents (status buttons, warrant / BOLO banners, the
  yellow address link, the green insured badge) stay for contrast. Scoped to the LAPD MDT only; the
  Dispatch console and the other CADs are unchanged.
- **Registered vehicles now show in the MDT person record.** Running a person (LAPD / Agency MDT query,
  or the Persons tab) lists every vehicle registered to them — plate, model, colour, type, year and an
  **Insured / No-insurance** badge, newest registration first — so an officer sees a suspect's cars
  straight from their file instead of having to run each plate. The data was already linked owner-side;
  it just wasn't surfaced.
- **CCTV cameras now spawn a real prop, placed with a freecam.** `/camtool` opens a **free-fly camera**
  (mouse + WASD, Space/Ctrl up-down, Shift faster). A **translucent preview** of the selected model sticks
  to the surface you look at — **ground for poles, walls for cams** — so nothing floats or sinks any more.
  **Scroll** cycles the model, **←→** rotate, **↑↓** nudge height, **LMB** places it exactly where the
  preview sits, **Backspace** exits. A **crosshair** + ground marker show exactly where the camera lands
  (red when you're aiming at nothing), and the freecam now has **collision** so it stops at walls instead
  of clipping through them. The placed **CCTV prop is visible to everyone** (not just operators) and
  despawns when the camera is removed. For **poles**, a per-model `camZ` puts the live view up at the
  lens instead of on the ground. Only models in `CCTV.props` can be spawned (the server rejects anything
  else); `CCTV.placeProps = false` keeps the old invisible cameras. New config: `CCTV.placeProps`,
  `CCTV.defaultProp`, `CCTV.props` (with `label` / `camZ`).
- **Phone polish pass.** The NUI phone got several quality-of-life upgrades: **notification banners** —
  an incoming text now slides a frosted banner down from the top (sender + preview, tap it to jump
  straight into the conversation), suppressed while *Do Not Disturb* is on; a working **Spotlight
  search** — the home-screen search pill now filters and launches any app; **colour-coded contact
  avatars** so people are distinct at a glance in Messages, Contacts and Bleeter (deterministic tint per
  name); and **share a photo to Bleeter** straight from the camera roll. The **top of the screen** was
  also reworked — the wallpaper / app header now runs edge-to-edge to the top with only the Dynamic
  Island left in black (previously a tall black status-bar band made the rounded top corners look
  uneven against the thin side bezels). Also fixed a calculator `%` quirk and removed some dead styling.
  All client-side — no config needed.
- **K9 overhaul — realistic behaviour, more commands, keybinds, map blip, in-game help.** The police dog
  no longer reacts to ambient gunfire / panic and wanders off — it ignores non-temporary events and holds
  its assigned task (`SetBlockingOfNonTemporaryEvents` + keep-task + no-flee), so it behaves like a
  trained working dog, and **teleports back to heel** if left too far behind (`K9.maxDistance`). New
  commands **`sit`**, **`lay`** (platz) and **`bark`** join heel / stay / search / engage / car, and
  **every action is a keybindable command** you can bind in *FiveM Settings → Key Bindings* (all unbound
  by default). The dog **shows on the map** with a configurable blip (`K9.blip`), `search` now trots
  ahead and sniffs the area, and `engage` commits and charges. `/k9 help` lists every command in chat.
  New config: `K9.maxDistance`, `K9.searchWalk`, `K9.blip`.
- **MDT vehicle-realism options (`configs/cfg-mdt-sh.lua`).** For realism, `MdtConfig.requireVehicle =
  true` makes the MDT (all four terminals, via `/mdt` / key O) only openable while inside a vehicle (any
  seat), and `MdtConfig.closeOnExit = true` auto-closes an open MDT the moment the officer leaves the car.
  An already-open MDT still closes on foot so no one gets stuck, and devmode bypasses both. Both default
  off (unchanged). Also in the [Config Editor](/configuration/editor).
- **HUD toggles (`configs/cfg-hud-sh.lua`).** LACORE's on-screen HUD can now be turned off — a master
  switch `HudCfg.enabled = false` disables the whole thing (run your own HUD, e.g. C7), or disable
  individual elements: **PLD** (street/AOP/alert/compass/time), **vehicle HUD** (speed/fuel/gear/seatbelt),
  the **player list** and **nameplates**. Default is fully on, so existing servers are unchanged. Also in
  the [Config Editor](/configuration/editor).
- **Configurable player-name length + Config Editor list editing.** The connect name-length limits are
  no longer hardcoded — `AccessControl.minNameLength` / `maxNameLength` (defaults 3 / 20, `0` disables a
  check) so long Steam names stop being rejected out of the box. The docs **Config Editor** now edits
  **list** configs too: the **Penal Code** is a full row editor (add / edit / remove / reorder charges,
  seeded with the defaults) that generates the complete `PenalCode = { … }` block to drop in. The editor
  panel is also fixed-height now, so it no longer resizes between steps.
- **Access-control toggles for framework servers (`AccessControl` in `configs/cfg-server-sv.lua`).**
  Two switches so ESX / QBCore / QBox servers don't have to run LACORE's own gatekeeping:
  `AccessControl.whitelist` (default on) disables the members-only join gate entirely when off (`/wl`
  becomes a no-op; bans still apply), and `AccessControl.discordRoles` (default on) turns off the whole
  Discord layer when off — no Discord required at connect, no roles read, no Discord→ACE bridge. With
  Discord off, duty-role gating is skipped (duty auth comes from the framework job) and Staff/Dev powers
  come from ACE / txAdmin instead.
- **CCTV camera groups by locality.** Runtime-placed field cameras (the CAM tool) are now auto-sorted
  into **groups by the in-game locality** they sit in — e.g. *Vinewood*, *Sandy Shores*, *Del Perro*.
  Each group is its own network in the CCTV viewer and its own section in the `/cameras` manager, so a
  long camera list stays organised. Placing a camera resolves its locality automatically; the `/cameras`
  manager lets you re-assign a camera's group (🏷) by hand. **Existing cameras are migrated
  fully automatically** — after the update the first player who loads resolves every ungrouped legacy
  camera into its locality group in one batch (no operator has to open CCTV). New options `CCTV.autoGroupField` (default on)
  and `CCTV.fieldGroupPrefix` in `configs/cfg-cctv-sh.lua`. *(NUI grouping verified in preview; in-game
  locality resolution + placement are for the live server.)*
- **ESX characters as the character source.** On an **ESX** server LACORE now takes its characters
  straight from the ESX database instead of asking players to fill out `/char` again. On load it reads
  the player's `users` row — **name** (firstname + lastname), **date of birth**, **sex**, **height**,
  **phone number** and **job** — plus their **`owned_vehicles`** (plates show up in the CAD vehicle
  query), and mirrors it into the LACORE character used everywhere (MDT/CAD lookup, `/profile`,
  on-screen name). Works with **esx_multicharacter**: each ESX character is its own LACORE character and
  re-syncs on every switch. Because ESX is the source, that identity (name / DOB / sex / height / phone /
  job) is **read-only** in LACORE's profile — records, notes and relationships stay editable. New toggle
  `Bridge.useFrameworkCharacters` (default `true`) in `configs/cfg-bridge-sh.lua`; requires oxmysql.
  *(DB read + in-game sync are for the live ESX server; syntax + NUI verified here.)*
- **New LACORE Phone — modern NUI phone (Phase 1).** The old native iFruit scaleform phone is being
  replaced by a purpose-built **Svelte NUI phone** in the LACORE look: an on-screen device (opens on
  **F1**, rebindable) with a phone **prop held in hand** so others see you're on the phone. Phase 1
  ships the telephony core — **Calls** (dialer, in-call screen with a live timer, recents log, real
  voice via pma-voice), **Messages** (SMS threads with per-conversation unread badges), **Contacts**
  (add / edit / delete), an **Eyefind browser** that opens the community page from `Branding` (never a
  hardcoded foreign site), and a **Settings** screen (number, wallpaper, branding). Each player gets a
  **stable phone number**, and contacts / threads / call log are **DB-persisted**. RP-only — there is
  no banking / money app. Config in `configs/cfg-phone-sh.lua` (`Phone.useNui`, key, apps, eyefind URL).
  Dispatch/911, camera/gallery and social apps follow in later phases. *(NUI verified in preview;
  in-game prop/anim, voice and cross-player delivery are for the live server.)*
- **Phone Phase 2 — Emergency (911/311) + Camera apps.** The phone now has an **Emergency** app: pick
  911 (emergency) or 311 (non-emergency), type what's happening, hit send — it files a dispatch call
  through the existing call-center pipeline (`call:Submit`) with your location attached automatically.
  A **Camera** app takes photos via `screenshot-basic` (the device hides itself for the shot) into a
  persisted **gallery** you can browse and open full-screen; an optional upload endpoint
  (`Phone.cameraUpload`) stores hosted URLs instead of inline images. Both apps are config-gated
  (`Phone.apps.dispatch` / `.camera`). *(Camera needs the `screenshot-basic` resource; verified in
  preview, live capture/upload is for the server.)*
- **Phone Phase 3 — social: Bleeter feed + messenger groups.** A **Bleeter** app (Twitter-style RP
  feed): post a short message, see a live server-wide timeline, and like/unlike posts. A **Groups**
  app for group chats: create a group and invite members by phone number, then everyone in it sees
  the shared thread live; leave any time. Feed and groups are **DB-persisted** and broadcast to online
  players (each viewer gets their own like state). Config-gated by `Phone.apps.social`.
  *(NUI verified in preview; cross-player delivery is for the live server.)*
- **Phone Phase 4 — settings, ringtones & modes.** The Settings app now has real depth: pick a
  **ringtone** (played on incoming calls) from a config-driven list with a **preview** button, a
  **notification sound** for SMS, **Do Not Disturb** (mutes ringtone + notifications) and **Airplane
  mode** (a "no service" indicator that blocks outgoing calls/SMS), plus a **wallpaper** picker — all
  saved locally and synced to the client for sound behaviour. Ringtones/notification sound are
  data-driven in `configs/cfg-phone-sh.lua` (`Phone.ringtones`, `Phone.notifSound`). This completes
  the phased phone rework. *(NUI verified in preview; ringtone/notification playback is in-game.)*
- **Phone — seven more apps.** The LACORE phone gains **Notes** (persisted notepad), **Garage** (your
  registered vehicles, read from the CAD civilian mirror), **Wallet** (a digital ID card — name, DOB,
  address, driver-licence status from your character), **Weather** (live in-game weather + clock),
  **Calculator**, a **Directory** (business/services list from `PhoneCfg.directory` + phone-tagged map
  blips, tap to call) and a **Flashlight** toggle. All config-gated via `PhoneCfg.apps`; RP-only.
- **Phone branding leak fixed (Eyefind).** The legacy phone hardcoded a foreign community's websites
  (`sarrp.org`) that the Eyefind browser loaded; it now uses the LACORE branding/phone URL, and the
  legacy scaleform phone goes dormant while the new NUI phone is active.
- **Feature toggles — enable/disable any component (`configs/cfg-features-sh.lua`).** You can now run
  exactly the parts of LACORE you want — e.g. **only the MDT/CAD**. A single `Features` table gates every
  major component: the **CAD suite** (with per-agency sub-toggles `lapd` / `lasd` / `ems` / `dispatch` /
  `bolo`), **Phone**, **Air Unit**, **CCTV**, **Corrections**, **Impound**, **K9**, field essentials,
  NADS, radio **STT**, staff **Admin** tools, **Web-Dispatch**, the **Civilian** update (with `org` /
  `turf` sub-toggles) and misc **Extras** (props / stretcher / trains / death-sync). A disabled feature's
  module simply doesn't load — no commands, threads or events, ~0 ms. **Default is ON**, so existing
  servers are unchanged; infrastructure (DB, Discord, security, framework bridge, identity, profile)
  always stays on and can't be disabled. The file is escrow-open and covered by config backup.
- **Switchable notification system (`configs/cfg-notify-sh.lua`).** Every LACORE notice now obeys a
  single `NotifyCfg.mode`: **`lacore`** (the built-in premium NUI toasts, default), **`gta`** (the native,
  lore-friendly GTA-V top-left feed), or **`custom`** — route notifications to **your own resource**
  (ox_lib / okokNotify / mythic_notify / ESX / …) via a one-line handler. `ShowNotification` gained an
  optional `{ ntype, title, duration }` and both it and the dispatch toast now flow through the same
  funnel, so the mode applies everywhere. Escrow-open + config backup.
- **Anticheat overhaul — server-authoritative, trust-based, near-zero false positives.** The anticheat
  gained a much stronger and safer core:
  - **Server-authoritative sweep (OneSync).** The server itself reads each player's ped **health,
    position and model** every few seconds — these checks run entirely server-side and **can't be
    patched out** by an executor that kills the client anticheat. Catches god-mode health, impossible
    on-foot teleports and blacklisted / god ped models. Auto-disables with a console warning if OneSync
    is off.
  - **Trust score (escalate, don't insta-ban).** Detections add points by severity and points **decay**
    during clean play, so a single false positive can't ban on its own — only a persistent offender
    crosses the kick/ban threshold. Makes running in `kick`/`log` mode safe.
  - **Immunity windows + whitelist.** Spawn / revive / jail-TP grant short immunity so legit
    invincibility & teleports never flag, and admins with an ACE bypass permission are never punished
    (still logged). New exports `AcImmune` / `AcFlag` for your own resources.
  - **Evidence capture (optional).** On a serious detection the server can request a **screenshot** from
    the flagged client and attach the link to the Discord admin log (needs `screenshot-basic`; off by
    default).
  - **Server-authoritative combat integrity.** New checks on the built-in weapon events (so they can't
    be hidden by a patched-out client anticheat): **dealing damage with a blacklisted weapon** is
    cancelled + punished server-side, an **aimbot / silent-aim heuristic** (too many distinct victims or
    an impossible hit-rate → feeds the trust score, never insta-bans a hot gunfight), **projectile spam**
    (grenade/RPG floods) and **particle-FX spam** (screen-crash exploits). The sweep also catches
    **impossible armour**. All configurable in `configs/cfg-anticheat-sh.lua` (`Trust`, `ServerSweep`,
    `Combat`, `Whitelist`, `Evidence`, `BlacklistedPeds`).
- **NativeLacoreUI — own standalone menu system, NativeUI dependency removed.** LACORE's in-world
  menus (settings, phone booth, vehicle spawner, AOP vote, props, character) previously required the
  external `NativeUILua_Reloaded` resource. They now run on **NativeLacoreUI**, LACORE's own
  native-drawn menu library (`client/nativelacoreui.lua`), so there's **one less resource to install**
  and the look is ours: a framed panel with a themed header + community wordmark, an accent selection
  bar, zebra rows, drawn checkboxes, **word-wrapped descriptions** (long help text no longer runs off
  the panel), a real scrollbar for long lists and a controls/brand footer — the whole theme is
  config-tunable at the top of the file. The **`/vehicle` spawner now actually spawns** the selected
  vehicle (the item-select was never wired). Drop-in — same menus, no setup change; just remove
  `ensure NativeUILua_Reloaded` from your `server.cfg`.
- **Third-party resource support (vames-store).** LACORE now plugs into popular paid resources when
  they're installed — no config wiring required, and it stays fully standalone without them:
  - **vms_housing** — a person's **registered property addresses now appear in the MDT** when you run
    them (queried live from vms_housing). Officers see where a suspect lives right in the record.
  - **vms_identity / vms_multichars** — these are framework (ESX/QBCore/QBox) resources, so they flow
    through LACORE's framework bridge: the active character's **identity (name) and identifier** are
    read automatically, and querying an online player who has no LACORE profile yet still returns a
    record built from their framework identity. New `configs/cfg-integrations-sh.lua` (each integration
    is `"auto"` = on when the resource is running, or `false` to disable).
- **ESX / QBCore / QBox framework compatibility (real integration).** The framework bridge now goes
  beyond detection: on a framework server the **framework job is accepted as duty authorisation**, so
  an ESX/QB police or EMS player can go on duty in LACORE (MDT, dispatch) **without also needing a
  LACORE Discord duty role** — verified server-side, so it can't be spoofed. Job changes now sync
  **instantly** via `esx:setJob` / `esx:playerLoaded` (and the QBCore equivalents) instead of a slow
  poll, and the player's **framework character name is adopted as their LACORE RP name** automatically
  (only if they haven't set one, so `/char` and multichar still win). Optional **auto-duty**
  (`Bridge.autoDuty`) puts mapped jobs on/off duty the moment the framework job changes. Configure the
  job→agency map in `configs/cfg-bridge-sh.lua`. Runs standalone by default (`Bridge.mode = "auto"`).
- **Corrections / Jail system (server core).** Arrests now have consequences. An arrest report whose
  Penal Code charges carry jail time automatically **books the suspect into jail** (jail-months →
  seconds, configurable). Sentences are **server-authoritative and persistent** — a disconnect/relog
  no longer escapes jail: the remaining time is stored per licence, restored on reconnect, and only
  counts down while the inmate is online. The manual `/jail` command is now persistent too, and
  `/releaseinmate <id>` frees someone early. New `modules/corrections/` + `configs/cfg-corrections-sh.lua`.
  Includes a **premium inmate roster** (`/inmates`, LEO) — see who's in custody, remaining time, and
  release early (with a confirm). Booking happens from the existing MDT arrest charge picker; the
  officer now sees the sentence, the jail **location is configurable** (run your own prison), and the
  on-screen jail timer reads as `mm:ss`. Reuses the existing jail teleport mechanic.
- **Impound / Tow lot.** LEO impound the vehicle they're in or nearest to with `/impound [reason]` —
  it's logged (plate, model, reason, officer, fee) and removed from the world for everyone. A premium
  **impound-lot panel** (`/impounds`) shows what's in the lot; LEO release a vehicle (with a confirm).
  Persistent across restarts. New `modules/impound/` + `configs/cfg-impound-sh.lua`.
- **Air Unit (police helicopter).** Realistic aviation tooling for a pilot or observer: **auto-orbit**
  (a hands-free circle around a GPS waypoint or the camera's lock point), a **controllable gimbal
  heli-cam** — usable by the pilot too — with pan / tilt / zoom, **night-vision and thermal (FLIR)**,
  a **ground or vehicle lock-on** (aim at a vehicle and press L — the cam auto-tracks it and reads its
  **number plate**), a live FLIR-style HUD, a **steerable spotlight** that follows the camera, and
  an in-cam overlay of **real street names + road driving-direction arrows colour-coded by direction**
  (like a real air downlink).
  Keybinds are rebindable (defaults F5 cam / F6 orbit / F7 light). New `modules/airunit/` +
  `configs/cfg-airunit-sh.lua`. (In-world native feature — orbit radius / altitude / speed are
  config-tunable.)
- **K9 Unit.** Deploy a police dog (`/k9`) that heels, holds position, **searches** an area and
  alerts on an armed subject, **engages** the aimed / nearest suspect, and loads into the patrol car
  — commands via `/k9 heel | stay | search | engage | car`. RP-only. New `modules/k9/` +
  `configs/cfg-k9-sh.lua`.
- **Premium notification system.** In-game notifications now render as modern, themed toasts
  (info / success / warning / error) with an icon, optional title and a draining timer bar — a big
  visual upgrade over the plain native feed. Every existing `ShowNotification` call is routed through
  it automatically (GTA colour codes like `~r~`/`~g~` set the type and are stripped), and it falls
  back to the native feed if the UI can't be reached. First step of the 3.2.0 polish pass.
- **Premium confirm dialogs.** A reusable, themed confirm dialog (keyboard-friendly: Enter/Esc) for
  destructive actions, built on the LACORE design system. Adopted on **cancel BOLO** and **deleting a
  dispatch zone**, which now confirm before the destructive action; more adopt it as the release grows.
- **Global ban network protection.** LACORE servers are part of a protected network: a player
  banned on the network is refused on connect, so known offenders can't just hop to another LACORE
  server. Only stable per-account identifiers are matched (never shared IPs), and the check is
  **fail-open** — if the network can't be reached, your players are let in rather than locked out.
- **Branding config + full LACORE re-brand.** New `configs/cfg-branding-sh.lua` centralises the
  visible community name (`Branding.label` / `Branding.community`). All remaining `Pacific Valley`
  strings — the on-screen spawn welcome, the phone-booth panel, the weapon-wheel panel, and the
  Discord connect title — are now LACORE-branded and driven by this config, so an operator can
  re-brand every in-game label in one place. (Internal identifiers / KVP keys are deliberately left
  untouched.)
- **Config backup / restore across reinstalls.** New `/lacoreconfig backup | restore | status`
  (console / staff) snapshots the hand-edited `configs/*.lua` files into the DB and can write them
  back after a reinstall (which ships default configs). Backup is manual by design — no auto-backup
  on start, which would clobber a good backup with fresh defaults right after a reinstall. `restore`
  first snapshots the current on-disk configs (rollback), and a resource restart applies it.
  (Runtime data in `data/*.json` is already DB-persisted and survives on its own with oxmysql.)

- **Unread badge on the MDT messages portal.** The **DISPATCH** tab (the shared dispatch⇄units chat)
  now shows a small **red count badge** and an accent bar when new messages arrive while you're on
  another tab — so units notice a message without staring at the tab. **Purely visual, no sound.**
  Opening the tab clears it; messages you receive while already reading it don't badge.

### Changed
- **LAPD unit list — no more `(N)` callsign suffix.** Partners sharing a callsign were listed as
  e.g. `1A-12 (2)`. The unit row now shows just the callsign; the members still expand via the row.
- **Internal KVP keys re-branded `PVP_CORE:*` → `LACORE:*`** (playerlist, world time, AOP). A one-shot
  migration on boot copies any existing legacy values over and deletes the old keys, so no persisted
  data is lost. (The client-side KVP migration for `PVP-CORE:*` player keys already existed.)
- **Console hygiene — gated debug logging.** New shared `Debug(...)` / `IsDebug()` helper (off by
  default). Developer trace `print()`s — most notably the client boot sequence in `world-cl.lua`
  (~25 lines that spammed every player's F8 console) plus vehicle/plates/CCTV/weapons/events traces
  and a couple of server score/AOP dumps — now route through `Debug()`. Enable with `setr lacore_debug 1`.
  **Intentional output is kept as `print()`**: security/IP-lock alerts, DB & startup status,
  missing-dependency warnings, `/lacore` diagnostics and the already-gated `CDbg` call-center helper.

### Fixed
- **MDT call list was broadcast to every player, not just units.** `mdt:SyncCalls` (the ~2 KB active-call
  list) was pushed to `-1` (all connected clients) on every call change — so **civilians**, who never open
  a CAD, received it too. On a busy server that wasted bandwidth and let the payload pile up in a slow
  client's reliable-command queue (visible as repeated pending `mdt:SyncCalls` in connection-timeout
  logs). It now goes **only to on-duty units** (like the LASD/EMS sync already did); units still get a
  fresh list directly via `mdt:RequestFullSync` when they open a CAD. (Doesn't cure a bad connection, but
  removes LACORE's share of the load — the largest pending payloads in those logs came from other
  resources.)
- **Pole CCTV view came from inside the post.** A pole camera's live view was placed directly above the
  base — i.e. inside the pole shaft, staring at the horizon. The viewpoint now sits a little **in front**
  of the base (new per-model `CCTV.props.camFwd`, along the aimed direction) and tilts **gently down**, so
  an elevated pole cam surveys the area instead. Re-place existing pole cameras to pick up the new
  geometry. Tune `camZ` / `camFwd` per model in `configs/cfg-cctv-sh.lua`.
- **CCTV manager didn't update live + couldn't place on objects.** Deleting a field camera in `/cameras`
  removed its world prop but left the row in the panel, because the camera-list refresh was pushed only
  through the duty-player loop (which didn't reliably reach the actor). The place / delete / rename /
  re-group handlers now push the updated list **directly to the actor** as well, so the manager and
  dispatch map update instantly. The placement freecam also raycast **world geometry only**, so you
  couldn't mount a camera on a prop/object — it now hits any geometry (world, objects, vehicles) like the
  old tool did, ignoring your own body.
- **CCTV broke when opened from inside a vehicle.** The viewer hides the operator's body and teleports
  it to the camera to stream the area — which ejected a seated player, so you (and your networked decoy)
  ended up **standing in the car** while viewing and after closing. When you open CCTV from a vehicle the
  operator now simply **stays seated**: the car is frozen so it can't roll away, the body is never
  moved/hidden/cloned, and the camera area still streams via the focus. On exit the car is unfrozen and
  you're left in your seat (with a re-seat safety net if the engine ejected you). The on-foot behaviour
  is unchanged. **Multiplayer fairness:** a vehicle operator is **not** made invincible, and the viewer
  **auto-closes the instant you're hurt, killed or pulled out of the car**, so the cameras can't be used
  as a safe hideout during combat. (Firing was already blocked while operating.)
- **Plug-and-play: a fresh install no longer locks everyone out.** Previously, with no Discord token
  configured, the connect check still *required* Discord and rejected every player (and `CanGoOnDuty`
  blocked LE duty). Discord role auth is now **auto-idle when unconfigured**: the core runs immediately
  without any Discord/whitelist setup, and role features (member gate, Staff/Dev, `DutyRoles`,
  Discord→ACE bridge) switch on automatically the moment you set `lacore_discord_token` +
  `lacore_discord_guild`. `AccessControl.discordRoles = false` still hard-disables it.
- **Notification config name collision crashed `ShowNotification`.** The new notify config table shared
  the name of a legacy global `Notify()` function in the client, which overwrote it — so any notification
  (e.g. toggling the CCTV camera tool) threw `attempt to index a function value (local 'cfg')`. The config
  table is now `NotifyCfg`; update `configs/cfg-notify-sh.lua` if you edited it (`Notify` → `NotifyCfg`).
- **`/time` did nothing.** The shipped config had `SyncGameTime = false`, which tells clients to
  ignore LACORE's clock (hand it to vMenu) — so `/time` set the server hour but no client applied it.
  Default is now `true` (LACORE owns the clock, as documented), so `/time` and the admin time slider
  work out of the box; `/time` now also **applies instantly** (broadcasts immediately instead of waiting
  for the next sync tick), validates the input (`/time <0-23> [0-59]`), persists, and replies with usage
  on bad input. Set `SyncGameTime = false` only if another resource (vMenu) should own the clock.
- **vMenu time conflict — clock kept fighting even with `SyncGameTime = false`.** LACORE set the
  day-length (`SetMillisecondsPerGameMinute`) in an **ungated** thread, so handing the clock to vMenu
  (`SyncGameTime = false`) stopped the hour/minute overrides but *not* the time-speed — vMenu and LACORE
  each forced their own speed and the clock jumped. The day-length call now also respects
  `SyncGameTime`: with it `false`, LACORE no longer touches the time speed at all, so vMenu owns the
  clock cleanly.
- **RPEmotes / DPEmotes not detected (emote radial).** The emote-provider detection ran **once** ~1.5 s
  after LACORE started, so an emote resource that starts later (load order) was missed — the civilian
  radial then reported "no provider". Detection now **retries for ~20 s**, **re-checks when a resource
  starts** and **lazily on first use**, recognises more folder names (`rpemotes`, `rpemotes-reborn`,
  `rpemotesv2`, `dpemotes`, `dp-emotes`), and a **`lacore_emote_resource` convar** lets you force a
  custom folder name. Note: **LACORE never registers `/e` itself** — it routes through your emote
  resource — so it does not block RPEmotes/DPEmotes `/e`.
- **Phone prop sits right in the hand + is tunable.** The in-hand phone prop used call-to-ear attach
  values, so it lay flat/awkwardly while reading the phone. The hold offset/rotation/bone are now in
  `configs/cfg-phone-sh.lua` (`PhoneCfg.hold`) with a clean default, and a live tuner —
  `/phonehold <x> <y> <z> <rx> <ry> <rz>` (while the phone is open) — lets you dial it in and copy the
  values into the config.
- **Anticheat — false positives removed (God Mode + Anti-Dump) & localised messages.** Two detections
  were wrongly punishing legit players:
  - **God Mode** flagged `hp > GetEntityMaxHealth`, but full GTA health is **200** while
    `GetEntityMaxHealth` reads inconsistently (a stale 175 vs. a live 200) — so a perfectly healthy
    player was kicked (`invincible=false hp=200/175`). It now flags only **real invincibility**
    (`GetPlayerInvincible`) or health **strictly above** a configurable ceiling (default 200, so 200
    never trips), sustained across several checks and **never during spawn protection** (config
    `GodMode.maxHealth` / `spawnGrace` / `strikes`).
  - **Anti-Dump** counted *every* short session (<120 s) toward the 24 h connect block, so a player who
    crashed or had a bad connection a few times got banned. It now only counts sessions where the
    client **never completed the anticheat handshake** — i.e. genuine headless dump-bot behaviour;
    real (verified) players are never blocked for short sessions.
  - Kick/ban messages now show a **friendly, localised reason** (e.g. "God mode" / "Gottmodus" /
    "Режим бога") instead of the raw internal code — the code still goes to the Discord admin log.
- **Phone — move while it's open, typing still captured.** The phone no longer freezes you in place:
  it now keeps game input so you can **walk and drive with the phone open**, and only grabs the
  keyboard while a **text field is focused** (writing a message), handing movement back on blur.
  Clicking the phone no longer shoots/swings and the pause menu is suppressed while it's open, and
  **F1 now toggles** the phone (so it always closes, even mid-typing).
- **Phone iPhone-16 redesign + camera crash guard.** The NUI phone now looks like an **iPhone 16** —
  a titanium-bezel frame with a **Dynamic Island**, an iOS status bar (signal / Wi-Fi / battery),
  a gradient wallpaper, **squircle app icons** with labels, a page dot and a **frosted dock**; chat
  bubbles, buttons and back arrows use iOS blue. The camera no longer throws
  `No such export requestScreenshot in resource screenshot-basic` — every `screenshot-basic` call is
  now `pcall`-guarded (prefers `requestScreenshotUpload`, falls back safely, and always restores the UI).
- **Phone crash + crisp home-screen icons.** The new phone config global collided with the legacy
  scaleform phone's `Phone()` function (`attempt to index a function value (global 'Phone')`); the
  config table is now `PhoneCfg`, so both coexist. The home-screen app icons are now proper **Lucide**
  glyphs (imported per-icon so the build stays fast) instead of emoji.
- **Air Unit overhaul.** Locking a target (Spacebar/L) then engaging orbit now **keeps flying after you
  leave the heli cam** — the lock persists so the auto-orbit keeps circling instead of dropping the
  target when the cam closes. A **compact status HUD** now shows even with the cam closed (orbit / lock
  / spotlight state, heli heading, speed and altitude, plus the tracked target). **Street names repeat
  along the road roughly every 15 m** and stay put (they no longer show once then delete themselves).
  The in-cam HUD gained more info: **gimbal pan/tilt angle**, **heli airspeed**, and the tracked
  vehicle's speed. Overlay density is config-tunable (`overlaySpacing` / `overlayGrid`).
  **Locking is now a scan**: hold the crosshair steadily on a vehicle/person for a couple of seconds
  (config `scanTime`) and the cam acquires and locks it — with an on-screen acquisition ring +
  progress — instead of an instant press; **Spacebar** now reliably **unlocks** (it was read as a
  disabled control before, so it did nothing). The **number-plate read-out was removed** from the cam.
- **No-agency players could open the LAPD MDT.** `/mdt` (and the `O` keybind) fell through to the LAPD
  LACORE Mobile Client for anyone not matching another agency — including players with no department set
  (which in devmode bypasses the job gate). Now only actual LAPD members open it; with no agency
  assigned nothing opens and you get a notice.
- **`/lacore` in the server console dumped a convar instead of running.** A server-browser info
  field was registered under the key `LACORE`, which collides with the `/lacore` console command — so
  typing `lacore status` in the console set a convar (`LACORE = "status"`) instead of running the
  command. The browser field is now `LACORE Discord`, so `/lacore …` works from the console again.
- **`/lacore status` (and telemetry) showed `vadamant` instead of the real version.** The version
  reader matched the first `version '…'` line in `fxmanifest.lua`, which is `fx_version 'adamant'`
  (the substring "version" is inside "fx_version"). It now reads the resource `version` metadata
  directly (with an anchored manifest fallback), so it reports `v3.2.0`.
- **Characters not persisting to the database.** The persistence layer wrote to `lacore_core_store`
  but read back from the old `pvp_core_store` table — so the DB was effectively write-only, and if the
  local JSON mirror was lost on a redeploy/restart, a newly created character couldn't be recovered.
  Reads now use `lacore_core_store`; the database is a real source of truth again.
- **Agency MDT opened for unemployed players.** The routing only required a non-empty department, and
  a civilian's `Unemployed` dept counts as non-empty (notably in devmode). It now requires an actual
  on-duty law-enforcement department.
- **Heli cam fixes:** the camera now actually renders from the heli belly (was a HUD-only overlay);
  **L** toggles the ground lock (press again to unlock); the **scroll wheel zooms** without spinning
  the weapon wheel (it's now blocked while in the cam); and **auto-orbit (F6) now physically flies a
  smooth circle** around the target (velocity-driven — no more teleporting), radius / altitude / speed
  config-tunable. Lock a vehicle with **L or Spacebar**, and the cam HUD gained **heading, distance to
  target, tracked-vehicle speed and the street name**. Locking or orbiting a target now drops a
  **private map blip on the target plus an orbit-radius circle** — visible only to the pilot — so you
  can see where and how to fly. **Lock now works on any entity** — vehicle, ped, player or object,
  not just vehicles — and **auto-orbit follows a moving target**: the circle re-centres on the locked
  subject every frame and the heli is allowed to fly faster to catch up, so it no longer loses a
  moving car and orbits an empty spot.
- **Devmode now lifts all membership restrictions.** In `/dev` mode you can go on duty without
  membership, drive member-only vehicles (previously the restriction wrongly *also* fired in devmode —
  engine cut + controls blocked), keep member-only weapons, and use nitro. Job-gated features already
  respected devmode; this closes the membership gaps.
- **Time snapping back after an admin / vMenu change.** LACORE's time-sync loop kept forcing the
  in-game clock, so changing the time via the admin panel (or vMenu) reverted within seconds. The
  admin panel's time control is now **server-authoritative** — it updates LACORE's clock for everyone
  and persists. A new **`SyncGameTime`** config flag also lets you hand the clock to another resource:
  set it `false` and LACORE stops forcing the time, so vMenu (or any external time system) owns it
  without snapping back. (Weather has no LACORE loop, so with vMenu's weather-sync off it already
  sticks.)
- **Vehicle HUD icons were invisible.** The car HUD draws its icons (fuel, engine, seatbelt, lights,
  turn signals, hood, trunk, limiter) from a streamed texture dictionary that was never requested,
  so nothing rendered. The HUD now requests the `vehicleui` dictionary before drawing (and keeps it
  loaded), and the `stream/vehicleui.ytd` sprite sheet ships with the resource.
- **Stuck CAD when switching department.** Opening a CAD/MDT is now exclusive: going on duty for
  another department (or reopening on a new one) closes the previous CAD instead of leaving it
  stuck on screen — the old one could no longer be moved or closed. Handled both on the department
  change itself and whenever `/mdt` opens a CAD.
- **Characters lost on core restart.** After restarting the resource, connected players were
  prompted to re-create their character. `playerSpawned` (which restores the active character) does
  not fire on a resource restart, so the client now also re-requests it on `onClientResourceStart`
  once the ped exists. Character data itself was always persisted — only the per-session link was
  missing.
- **Civilian props couldn't be removed.** The server used `GetEntityCoords` on a server-created
  object (unreliable — often `0,0,0`) for the "nearest prop" check, so pickup found nothing; and
  server-side `DeleteEntity` didn't propagate once a client owned the object. Now the stored
  placement coords drive the distance check, and the server broadcasts the netId so the owning
  client deletes it locally.

### Security & Robustness
- **Reusable hardening helpers** (`modules/security/harden-sv.lua`): per-key rate limiting, input
  sanitising, and identifier validation, applied to the network-ban tooling so bad input can't reach
  the shared ban list.
- **NADS: server-side staff gate.** `AddNADSStreet` now requires `HasPermission(src, "nads")`
  (staff / dev bypass) — the client-only `player.staff` check could be bypassed by a crafted event
  to inject addresses or spam the Discord webhook. The payload is also type-checked.
- **LASD / EMS unit registration gated to job.** `lasd:Register` and `ems:Register` now require an
  on-duty LEO / Fire-EMS-Coroner (or staff) via `PlayerIsAuthorized`. Previously any client could
  register as a unit and then pass every `IsLasdUnit` / `IsEmsUnit` gate — creating incidents,
  running **record queries**, changing status, etc.

- **Guarded `json.decode`.** The player-list KVP restore (server boot), the character KVP restore
  (`/character`), and the legacy phone screenshot-upload response are now wrapped in `pcall` with
  type checks, so a corrupt value can't throw during boot or at runtime.

### 🎙 Speech-to-Text — Radio Transcript (experimental — disabled by default)

> ⚠️ **This feature ships DISABLED (`STT.enabled = false`).** It is experimental and does not yet
> work reliably enough for production (offline recognition accuracy varies by client). The full
> implementation is included and can be enabled in `configs/cfg-stt-sh.lua` to try it — see the
> [Radio Transcript docs](https://tabysi.github.io/lacore-docs/features/radio-stt/).

### Added — push-to-talk radio dictation + transcript log
- **Offline speech recognition (Vosk / WebAssembly).** On-duty units hold a bindable **radio key**
  (`+radiostt`, unbound by default — bind under FiveM → Settings → Keybinds → "Radio: hold to
  transcribe"). Their own client transcribes their speech **entirely locally** via a Vosk model
  running in WebAssembly inside the NUI — **no cloud, no API keys, no cost, no NUI focus taken**.
  On release the final transcript is sent to the server. A small live "🎙 …" chip shows the partial.
  *(Note: the browser SpeechRecognition API does not work in FiveM's CEF — no speech backend — so
  LACORE uses Vosk instead. The `/sttcheck` probe reports both.)*
- **Self-hosted model + radio grammar.** The Vosk model is **not bundled** with the resource — Cfx
  Keymaster rejects assets that contain archives, so you host the model `.tar.gz` yourself (any
  static host / CDN) and point `STT.model` at it. Recommended: the larger, more accurate
  `vosk-model-en-us-0.22-lgraph` (~128 MB, downloaded once per client) — a dynamic-graph model that
  supports a **radio grammar**: `STT.grammar` in `cfg-stt-sh.lua` constrains **push-to-talk** radio
  recognition to ten-codes, the phonetic alphabet and common jargon for much higher accuracy.
  The grammar is applied to the radio only; **911/311 calls always use free recognition** (callers
  speak naturally). Override the model (e.g. German) via `STT.model`.
- **Searchable radio log.** The server attaches the sender's **callsign + department**, appends the
  line to a rolling (optionally persisted) log and broadcasts it. Open with **`/radiolog`** — a
  searchable transcript with timestamps and dept-coloured callsign badges (LAPD blue, LASD amber,
  EMS red). Config in `configs/cfg-stt-sh.lua` (`STT.enabled/lang/model/maxLen/logSize/persist/store`).
- **911/311 call transcription.** When a caller and a dispatcher are connected, **both sides are
  auto-transcribed** and each phrase is appended to the call transcript — shown **live** in the call
  session and **saved to the call log** (transcript log only; it is not copied into the incident
  notes). Reuses the existing `sess.transcript` pipeline; server toggles continuous mode per call
  (paused on hold). Toggle with `STT.calls` in `cfg-stt-sh.lua`.
- **Graceful fallback.** Clients where the offline engine can't initialise simply can't transmit
  (no crash) but can still read the log. Radio transmission is server-gated to on-duty units
  (callsign set); call transcription is gated to the call's participants.
- **Audio capture** runs on an **AudioWorklet** (audio thread — no main-thread jank, no deprecation
  warning), with a ScriptProcessorNode fallback for clients that can't load the worklet
  (`web/public/stt-worklet.js`).
- Files: `configs/cfg-stt-sh.lua`, `modules/stt/stt-sv.lua` (new), `modules/stt/stt-cl.lua`,
  `web/src/components/SttEngine.svelte` (Vosk) + `RadioLog.svelte` (new), `SttProbe.svelte` (probe +
  Vosk test), store/messages/locales, `nui/dist/models/` (model), `fxmanifest.lua`
  (`modules/stt/*-sv.lua`), dep `vosk-browser` (lazy-loaded chunk).

## [3.1.5] – CCTV Surveillance Suite, Scanner & Field Cameras

Headline release: the CCTV system is now a full surveillance suite — a fixed-position camera
viewer with a targeting scanner, runtime-placeable field cameras, and dispatch-map integration.
This section is the authoritative, final-state description of that work (the granular iteration
notes under 3.1.3 below are superseded by it).

### Added — CCTV camera viewer (`/cctv`)
- **Fixed-position POV camera.** Opens a scripted surveillance camera at each configured position.
  **WASD** and the **arrow keys** look around (A/D pan, W/S tilt), **scroll** zooms — the camera
  does not move (it's a wall camera). Look input is read natively while the NUI keeps a free mouse
  cursor (`SetNuiFocusKeepInput(true)`). Backspace/Esc exits.
- **Real area streaming.** On open, the player's spot is saved, a frozen clone ped is dropped at
  their desk, and the hidden real ped is teleported to the camera so the world (and the entities
  around it) actually stream and can be scanned. Restored on exit / resource stop.
- **Networks + access.** Cameras are grouped into networks in `configs/cfg-cctv-sh.lua`, gated
  server-side by job (`leo` / `security` / `all`). The overlay lists cameras (clickable) with a
  `‹ NET ›` network selector.
- Config: `CCTV.rotSpeed`, `CCTV.zoomMin/Max/Step`, `CCTV.scanTime` (old `panSpeed`/`panLimit`/
  free-fly `moveSpeed` removed). You can't fire your weapon while operating a camera
  (`DisablePlayerFiring` + attack controls blocked each frame).

### Added — CCTV targeting scanner
- **Click-to-scan.** Left-clicking raycasts from the camera through the cursor
  (`StartExpensiveSynchronousShapeTestLosProbe`) and classifies the hit: **player**, **NPC ped**
  or **vehicle** (objects are ignored). Up to 5 concurrent scans; dead entities auto-drop.
- **Animated scan sequence.** A corner-bracket targeting reticle over the target with a scanning
  grid, a sweeping scan line, a live time-based percentage counter and an "ANALYZING…" caption,
  plus a brief full-screen scan flash on each new scan. Duration = `CCTV.scanTime` (default
  **6 s**, tune 5000–8000); the record is buffered and only revealed once the full sweep finishes.
- **Info card anchored to the target.** On completion a card fades in and follows the entity on
  screen (`GetScreenCoordFromWorldCoord` per frame): a compact **ped mugshot**
  (`RegisterPedheadshotTransparent` → `nui-img`, freed on close), the identity, and — for
  registered people — a compact **MDT block** (visible priors count, active BOLO count, up to
  three recent records) reusing `RecordsVisibleTo` / `BolosForQuery`. Flags: **ACTIVE WARRANT**,
  **BOLO ACTIVE**, **REPORTED STOLEN**, **UNREGISTERED**.
- **Local-first, never hangs.** NPCs / NPC vehicles / unregistered targets resolve locally
  (sex, or model + class); the server (`cctv:Scan` → `cctv:ScanResult`) only answers for
  registered players/plates and overrides the local card with the real record. Record lookup is
  gated to LEO / Security.
- **Standin resolves to the real player.** The operator's desk clone is a *networked* ped
  registered server-side (`cctv:RegisterStandin`, netId → src). Scanning that standin through a
  camera returns the absent (or own) player's real record instead of UNIDENTIFIED. Cleaned up on
  close / drop / resource stop.

### Added — CCTV field cameras + dispatch-map integration
- **CAM placement tool.** `/camtool` gives a pistol whose damage is neutralised while it's out;
  firing raycasts from the gameplay camera and places a camera at the aimed point (looking back
  toward where you stood). `/cameras` opens a manager panel (`CctvManager.svelte`) to rename /
  delete placed cameras, jump the live view to one, and toggle the tool. Placed cameras are
  persisted + LEO/Security-gated server-side (`cctv-sv.lua`, `data/cctv_cams.json`) and appear in
  `/cctv` under a **"Field Cameras"** network. New client module `modules/cctv/cctv-place-cl.lua`.
- **Cameras on the dispatch map.** `/dispatch open` shows every camera the dispatcher may see
  (config + placed) as 📹 markers. Clicking one opens a "view this camera?" modal; confirming
  **closes the console, shows the live CCTV view in front, and reopens the console automatically
  when the operator leaves the camera** (`cctv:Request` accepts a `{net,cam}` focus). The console
  requests the camera list on open and it refreshes whenever a camera is placed/removed.

### Changed — Turf / Gang-War is now opt-in
- **`Turf.enabled` master switch (default `false`)** in `configs/cfg-turf-sh.lua`. When off,
  neither `turf-sv.lua` nor `turf-cl.lua` runs (no blips, HUD, kill reporting or capture logic).
- `Turf.drawMarkers` also defaults to **off** (the full-radius ground cylinder was heavy and
  noisy; map blips already show ownership).

### Fixed
- **Dispatch UI stayed in front of the camera.** `dispatchOpen` is a *file-local* in
  `mdt-nui-cl.lua`, so the CCTV module's `if dispatchOpen` check always saw `nil` and never closed
  the console. Added a global `IsDispatchNuiOpen()` getter; viewing a camera from the map now
  closes the console (CCTV in front) and reopens it on exit.
- **Could shoot while in a camera.** Because the viewer keeps game input alive for WASD, the
  hidden ped could still fire — now hard-blocked (`DisablePlayerFiring` + attack controls).
- **Dispatch map player position lag.** Units report their position **every 1 s** (was 2 s) so the
  marker tracks the real position closely instead of visibly lagging while moving. (A remaining
  constant *offset* would be tile calibration in `web/src/lib/mapproj.js` and needs an in-game
  reference point to tune.)

## [3.1.3] – Rebranding to LACORE + release ready

### Added — CCTV field cameras + dispatch-map integration
- **CAM placement tool.** `/camtool` gives a pistol whose damage is neutralised while it's out;
  the **bullet impact** marks where the camera is placed (looking back toward where you stood).
  `/cameras` opens a manager panel (`CctvManager.svelte`) to rename / delete placed cameras, jump
  the live CCTV view to one, and toggle the tool. Placed cameras are persisted + LEO/Security-
  gated server-side (`cctv-sv.lua`, `data/cctv_cams.json`) and appear in `/cctv` under a "Field
  Cameras" network. New client module `modules/cctv/cctv-place-cl.lua`.
- **Cameras on the dispatch map.** `/dispatch open` now shows every camera the dispatcher may see
  (config + placed) as 📹 markers. Clicking one opens a "view this camera?" modal; confirming
  **closes the console, shows the live CCTV view in front, and reopens the console automatically
  when the operator leaves the camera** (`cctv:Request` accepts a `{net,cam}` focus). The console
  requests the camera list on open and it refreshes whenever a camera is placed/removed.

### Fixed — dispatch map player position lag
- Units now report their position **every 1s** (was 2s), so the map marker tracks the real
  position much more closely instead of visibly lagging/jumping while moving (`mdt-nui-cl.lua`).
  (If the marker still looks *offset* rather than *laggy*, that is tile calibration in
  `web/src/lib/mapproj.js` and needs an in-game reference point to tune.)

### Changed — CCTV: POV camera + targeting scanner
- **Reworked into a fixed-position surveillance camera with a scanner** (`cctv-cl.lua`,
  `cctv-sv.lua`, `Cctv.svelte`, `cfg-cctv-sh.lua`). The old pan-clamp model is replaced:
  - **Fixed position, POV only.** The camera stays at its config `pos`; **WASD** and the **arrow
    keys** look around (A/D pan, W/S tilt), **scroll** zooms. It's a wall camera, not a free-fly
    drone. Look input is read natively in Lua (`SetNuiFocusKeepInput(true)`) so the mouse stays
    free as a cursor. The hidden operator ped is teleported once to the camera so its area (and
    entities) streams and can be scanned.
  - **Click-to-scan.** A left-click raycasts from the camera through the cursor
    (`StartExpensiveSynchronousShapeTestLosProbe`) and classifies the hit: player / NPC ped /
    vehicle / object.
  - **Local-first, never hangs.** Every target resolves locally after the scan sweep — NPCs show
    sex, NPC/unregistered vehicles show model + class + an **UNREGISTERED** flag. The server
    (`cctv:Scan` → `cctv:ScanResult`) only answers for **registered** players/plates and then
    overrides the local card with the real record (name / DOB / address / DL / **ACTIVE WARRANT**,
    owner / **REPORTED STOLEN**). This is why NPCs and NPC vehicles now scan instead of hanging.
  - **Anchored info cards.** Each scan shows a scanning animation, then an info card that anchors
    to the entity on screen and follows it (`GetScreenCoordFromWorldCoord` per frame). Up to 5
    concurrent scans; dead entities auto-drop. Record lookup is gated to LEO / Security.
  - Camera list is clickable; a NET ‹ › selector switches networks. Config: `rotSpeed` /
    `scanTime` + zoom (old `panSpeed` / `panLimit` / free-fly `moveSpeed` removed).
  - **Standin resolves to the real player.** The operator's desk clone is now a *networked* ped
    and registered server-side (`cctv:RegisterStandin` netId → src). When another operator (or the
    operator themselves) scans that standin through a camera, the server returns the real record
    instead of UNIDENTIFIED. Cleaned up on close / drop / resource stop. Only ped/vehicle hits
    scan now (objects are ignored).
  - **Mugshot + MDT summary.** Scan cards now show a compact ped mugshot
    (`RegisterPedheadshotTransparent` → `nui-img` texture, freed on card close) and, for
    registered people, a compact MDT block: visible priors count, active BOLO count and up to
    three recent records (category + title) reusing `RecordsVisibleTo` / `BolosForQuery`.
  - **Animated scan sequence.** The scanning phase is now a proper targeting sequence: a corner
    bracket reticle over the target with a scanning grid, a sweeping scan line, a live percentage
    counter, an "ANALYZING…" caption with a blinking cursor, and a brief full-screen scan flash +
    sweep on each new scan. The record card then fades/zooms in on completion.

### Changed — Turf / Gang-War is now opt-in
- **`Turf.enabled` master switch (default `false`)** in `configs/cfg-turf-sh.lua`. When off, neither
  `turf-sv.lua` nor `turf-cl.lua` runs (no blips, HUD, kill reporting or capture logic) — both files
  early-return on `not Turf.enabled`. Enable it explicitly to use kill-based territory capture.

### Changed — CCTV: real area streaming + mouse look
- **CCTV now streams the remote area** (`cctv-cl.lua`). Opening the viewer saves the player's
  spot, drops a frozen clone ped there, and teleports the (hidden, frozen, invincible) real ped
  to the active camera — so the world actually loads at the camera instead of showing an
  unloaded black view. `SetFocusPosAndVel` + `RequestCollisionAtCoord` reinforce streaming;
  switching cameras re-streams. On exit the ped is teleported back and the clone removed
  (also on resource stop).
- **Mouse pan fixed.** Two real bugs stacked on top of each other:
  1. Native look-control reads (`GetControlNormal` / `GetDisabledControlNormal`) are unreliable
     while a scripted cam renders over a frozen ped. Replaced by NUI input capture: the viewer
     gives the NUI focus + cursor (`SetNuiFocus(true, true)`), a full-screen capture layer in the
     overlay reads the absolute cursor position (pointer-lock is blocked in FiveM's CEF) and
     forwards it as `-1..1` via a `cctvAim` callback → mapped onto the pan angle.
  2. The camera still would not turn because `PointCamAtCoord` keeps a live "point at" that
     overrides `SetCamRot` every frame. Now `StopCamPointing` is called after the base aim is
     captured, so manual pan rotation takes effect.
  Arrows cycle cameras/networks, scroll zooms, Backspace/Esc exits — all forwarded from the
  overlay (`cctvCycle` / `cctvNet` / `cctvZoom` / `cctvExit`). Range via `CCTV.panLimit`.
  - Note: the teleported operator is briefly not visible to other players at the CCTV desk (the
    clone is a local placeholder). Acceptable for a surveillance terminal.

### Fixed — Turf marker performance
- `Turf.drawMarkers` now defaults to **off**. The in-world marker drew a cylinder at
  `radius * 2` (up to ~280 m) every frame — heavy and visually noisy. Map blips already show
  ownership; enable the marker only if you want an in-world boundary.

### Security / Fixed — post-launch hardening pass
- **Turf capture farming exploit fixed** (`turf-sv.lua`). `turf:Death` only validated the
  victim's zone position, so a modified client could name an arbitrary org member as the
  "killer" and suicide-report in a loop to farm influence + captures without real combat. Now
  the reported killer must ALSO be inside the same zone (server-checked ped coords), plus a
  20 s per-victim cooldown on qualifying contributions. Cooldown table cleared on disconnect.
- **Admin spectate rewritten** (`admin-cl.lua`). The old toggle expression
  (`not IsPlayerFreeAiming(...) and true`) was nonsensical and had no way to exit. Now a proper
  on/off toggle with a Backspace exit key, a "target not loaded" guard, and cleanup on resource
  stop so nobody is left stuck in spectator mode.
- **Admin noclip cleanup** — noclip state is now restored (collision / visibility /
  invincibility / freeze) on resource stop, so a restart mid-noclip can't leave a player
  ghosted.

### Fixed — Connect hang on "Checking bans..."
- The DB auto-migration used `MySQL.single.await(query)` **without a params argument**, which
  hangs on some oxmysql builds instead of returning. That left schema init stuck in its
  "working" state, so every `DBLoadStore` — including the connect ban check — blocked forever,
  freezing joins at "Checking bans...". Fixed in `db-sv.lua` and `bb-sv.lua`: the table-exists
  check now uses `MySQL.query.await(... WHERE TABLE_NAME = ? ..., { name })` wrapped in pcall.
- Added a **hard 10 s cap** to the schema-init wait loop so a stalled database can never freeze
  the whole server again — it falls back to local JSON instead.
- Hardened the `playerConnecting` ban check with a pcall + `ban.ident or {}` guard so a
  malformed ban entry or DB hiccup can never leave the connect deferral pending.

### Changed (BREAKING — read the upgrade steps!)
- **Resource rename** `pvp-corev3` → `lacore`. Rename the folder to `resources/lacore` and
  set `ensure lacore` in `server.cfg` (instead of `ensure pvp-corev3`/`pvp-core`).
- **Convar rename** `pvp_*` → `lacore_*` — affects ALL convars in `server.cfg`
  (`pvp_devmode`, `pvp_discord_token`/`_guild`, every `pvp_webhook_*`, every `pvp_bb_webhook*`,
  `pvp_bridge_url`/`_token`). Legacy convar names are no longer read — see
  `server.cfg.example` or `DOCS.md §4` for the full list.
- **ACE group rename** `group.pvp_dev`/`pvp_staff`/`pvp_mod` → `group.lacore_*`. Update any
  manually placed `add_principal identifier.xxx group.pvp_staff` lines accordingly.
- **Command / keybind rename** `pvp_release`/`pvp_cuff`/`pvp_drag`/`pvp_putin`/`pvp_civradial`
  etc. → `lacore_*`. Players with custom keybinds have to rebind once.

### Added
- **DB auto-migration:** on start, `db-sv.lua` automatically renames the legacy
  `pvp_core_store` table to `lacore_core_store`; `bb-sv.lua` does the same for
  `pvp_logs` → `lacore_logs`. No data loss on upgrade.
- `server.cfg.example` (replaces the outdated `pvp_config.cfg`) with the complete current
  convar block.
- `DOCS.md` — central complete documentation (setup, config, modules, MDT, dispatch, DB,
  bridge, exports, FAQ).
- `LICENSE.md` — full EULA covering the IP-lock enforcement, resale prohibition, warranty and
  jurisdiction.
- `docs/LASD_CAD.md` — previously empty file, now filled with content.

## [Unreleased]

### Added — Civilian Update
- **Custom emote editor in /profile → Radial Menu.** Players can create their own emote
  categories (with icon) and add their own emote entries. Persisted server-side per license
  in `data/civ_custom_emotes.json`; custom entries are merged into the radial next to the
  config-provided ones. Server enforces per-player limits (20 categories, 100 emotes) and
  sanitises every string against injection.
- **User-friendly emote picker.** Adding an emote is now one click: choose a target category
  from a dropdown, browse a curated library of 32 popular presets (gestures / poses /
  activities / dance) with search + group filter, hit the `+` button on any preset. Raw
  animation-dictionary entry is still available for power users under a collapsible
  "Advanced" section. Preset library lives in `web/src/lib/emote-library.js`.

### Added — Migration from pvp-corev3
- **Client-side KVP migration** (`client/migrate-cl.lua`). First-time-per-PC one-shot that
  renames `PVP-CORE:*` → `LACORE:*` so legacy playtime, settings, last-vehicle position and
  every stored character carry over untouched. Sets a `LACORE:MIGRATED` flag so the migration
  runs exactly once. All client scripts (`loops-cl`, `menus-cl`, `vehicle-cl`, `world-cl`,
  `character-cl`) now read/write under `LACORE:*`.

### Changed — Emotes now bridge to DPEmotes / RPEmotes
- **Removed the built-in animation/emote engine** (it clashed with the emote resources most
  servers already run). LACORE no longer registers `/e`, plays `TaskPlayAnim`/scenarios, or
  stores custom emotes.
- **New emote bridge** (`modules/civilian/emotebridge-cl.lua`) auto-detects **RPEmotes-reborn**
  (resource `rpemotes` or `rpemotes-reborn`) or **DPEmotes** (`dpemotes`) at load and routes the
  civilian radial's emote buttons through it. Play = `/e <name>`, menu = `/emotemenu`, cancel =
  `/emotecancel` (RPEmotes) or `/e c` (DPEmotes) — verified against the real resources. If
  neither is installed the buttons notify the player. Exports `GetEmoteProvider`.
- `configs/cfg-civilian-sh.lua` emote entries are now `{ cat, id, label, emote = "<dp/rp name>" }`
  — each button just plays that emote via the detected resource (run `/emotemenu` to see names).
- **Removed the custom-emote editor** from `/profile` (server events, `emote-library.js`,
  `civ_custom_emotes` store, the picker UI). The Radial tab keeps the enable/disable toggles
  for the config emotes + services.

### Added — Admin GUI Menu
- **`/admin` staff panel** (`modules/admin/` + `AdminMenu.svelte`). Server-gated to staff/dev;
  three tabs:
  - **Self:** noclip, god mode, invisible, heal, repair vehicle, spawn vehicle by model
  - **Players:** live online list → goto, bring, spectate, freeze/unfreeze, revive, heal, kick,
    ban (with reason)
  - **World:** weather presets, time-of-day slider
- Every action ON ANOTHER PLAYER is server-authoritative and validated with `HasPermission`
  (kick needs `kick`, ban needs `ban`) + logged via Big Brother; self-only conveniences run
  client-side. Reuses existing `BanPlayer` / `BBLog` / `GetPlayerByID`. Bindable key
  (`RegisterKeyMapping "admin"`, no default). Locales en/de/ru.

### Added — Turf / Gang War
- **Kill-based territory capture** for civilian organisations (`modules/civilian/turf-sv.lua`
  + `turf-cl.lua`, `configs/cfg-turf-sh.lua`). Circular turf zones with map blips + ground
  markers. When a member of a rival org kills someone inside a zone it fills that org's capture
  bar; reaching `killsToCapture` flips ownership, both orgs are notified, and the zone locks for
  a cooldown. Progress decays if the fighting stops.
- **Influence (RP prestige, no money)** — orgs earn influence per qualifying kill and a bonus on
  capture; shown as ★ on the org panel (`CivOrg.svelte`). `/turf` prints zone ownership +
  contest status + your influence.
- **Turf HUD** (`TurfHud.svelte`) — while inside a zone: zone name, current owner, and a live
  contest bar (attacker + progress) or a lock indicator during cooldown. State persisted to
  `data/turf.json`; server broadcasts ownership to all clients.
- Self-contained death detection (only fires inside a turf zone), server re-validates the
  victim's position against the reported zone (anti-spoof), friendly-fire and own-turf kills
  excluded. Locales en/de/ru.

### Added — CCTV Surveillance System
- **`/cctv` viewer** for on-duty LEO / Security (`modules/cctv/`). Fixed cameras grouped into
  networks (`configs/cfg-cctv-sh.lua`); server validates access by LACORE job/dept
  (`leo` / `security` / `all`) and only sends the networks the player may see.
- Scripted game camera at each config position with a **CCTV overlay** (`Cctv.svelte`):
  blinking REC, network + camera labels, live timestamp, camera list with the active one
  highlighted, control hints, scanline + vignette. Cycle cameras (← →), cycle networks
  (↑ ↓), mouse pan (clamped), scroll zoom, Backspace to exit. Camera is destroyed cleanly on
  exit / resource stop. Locales en/de/ru.

### Added — Evidence & Reports (LEO)
- **Formal report + evidence system** integrated into the existing DEX person record
  (`civilians[lic].records`) — inherits visibility, query, persistence and Big Brother logging,
  no parallel store. New config `configs/cfg-evidence-sh.lua` (evidence types, report types,
  tag prefix, length caps).
- **File Report** — pick a report type (arrest / incident / use-of-force / field interview /
  supplemental / traffic), write a narrative, add location / involved parties / incident #.
  Rendered as a distinct blue-bordered card in the person record. Server event
  `char:FileReport`.
- **Log Evidence** — pick an evidence type (weapon / substance / fingerprint / DNA / document /
  photo / …), description, location, incident #. Server assigns a unique tag
  (`EV<YYMMDD>-<hex>`). Rendered as a teal-bordered card with a **chain-of-custody** log; any
  on-duty officer can append custody entries (`char:EvidenceCustody`). Server events
  `char:LogEvidence` / `char:EvidenceCustody`.
- All three events are on-duty-unit gated, length-capped and target-validated by exact unique
  name (same guard as citations). Shown in every MDT variant via the shared PersonRecord
  component. Locales en/de/ru.

### Added — Framework Bridge (ESX / QBCore / QBox)
- **`modules/bridge/`** — compatibility layer so LACORE can run alongside an existing
  framework instead of a second identity system. Auto-detects `es_extended` / `qbx_core` /
  `qb-core` (config `Bridge.mode`), exposes a unified server + client API
  (`Bridge.GetIdentifier / GetName / GetJob / IsLeo / IsEms / Notify`, exports
  `GetFramework` / `BridgeGetJob`), and maps framework jobs → LACORE agencies via
  `configs/cfg-bridge-sh.lua` `Bridge.jobMap` (police→LAPD, sheriff→LASD, ambulance→EMS, …).
- **Job sync + optional auto-duty.** Fires `lacore:bridge:jobChanged` on the client when the
  mapped dept changes; with `Bridge.autoDuty = true` it drives LACORE's authoritative
  `/onduty` path (DutyRoles / CanGoOnDuty still validate) so the correct MDT opens
  automatically. Default off.
- **Anticheat honeypot conflict solved.** When a framework is detected the bridge tells the
  anticheat to skip ESX/QB event names at honeypot registration, so legit framework traffic
  isn't banned. The bridge itself uses exports (never the legacy `esx:getSharedObject` event),
  so it never trips the honeypot. Detection runs synchronously at load (bridge loads before the
  anticheat) so the skip is applied before handlers are armed.

### Added — Launch Prep
- **First-boot diagnostics** (`modules/security/diagnostics-sv.lua`). ~8 s after start LACORE
  prints a boxed health check to the console: resource name, each dependency's start state,
  devmode, database connection, Discord auth, webhooks, anticheat, framework bridge, IP-lock
  state and server-hardening convars — colour-coded ✓/!/✗ with an ok/warn/error tally.
  Re-runnable any time via **`/lacore doctor`** (also usable in-game by staff). Turns most
  "why doesn't X work" tickets into self-service.
- **`START-HERE.md`** — a concise buyer onboarding guide (requirements → install → server.cfg →
  first boot → config → in-game → troubleshooting) that points to `/lacore doctor` and `DOCS.md`.

### Added — Owner Command Suite
- **`/lacore` in-game command** (`modules/security/owner-commands-sv.lua`). Read-only
  diagnostics for operators / staff:
  - `/lacore version`   → resource + FXServer version, timestamp
  - `/lacore status`    → snapshot: version, uptime, hostname, slots, devmode, licence
    state (from iplock), database (oxmysql or JSON fallback), web bridge, Discord auth,
    anticheat status
  - `/lacore db`        → DB connection state + list of known store keys
  - `/lacore telemetry` → telemetry configuration + `lacore_owner_discord` convar
  - `/lacore modules`   → checklist of loaded modules (iplock / db / discord / permissions
    / bigbrother / anticheat / mdt / dispatch / civilian / webdispatch)
  Console always allowed; in-game gated to Staff / Dev via `HasPermission(src, "lacore")`.

### Added — Operator Telemetry
- **Owner telemetry channel** (`modules/security/telemetry-sv.lua`). Escrow-encrypted
  phone-home that reports server-level metadata to the operator's Discord webhook on start,
  every 60 minutes and on graceful stop. Reports: public IPv4 (piggy-backing on iplock's
  already-resolved value), sv_hostname, resource name + version, sv_licenseKey, optional
  `lacore_owner_discord` convar, sv_maxClients and uptime. Sends NO player identifiers, DB
  contents, file contents or secrets. Disclosed in the LACORE EULA and in the Tebex
  product listing.

### Security
- **Hardened the Big Brother client-fed log events against audit pollution / DoS**
  (`modules/bigbrother/bb-feed-sv.lua`). `bb:Death`, `bb:Vehicle` and `bb:Command` are
  `RegisterNetEvent` handlers any client can fire directly, and each wrote to the admin log
  with no throttle — a malicious client could flood the audit trail with fake entries + spam
  the DB and live panel. Added a per-source rate limiter (death 1 s, vehicle 500 ms, command
  250 ms) plus length-capping of the command name (40) and raw payload (200). Rate table
  cleared on `playerDropped`. (`bb:Action` kick/ban/jail was already `hasAccess`-gated;
  `bb:Query`/`bb:Dossier` already access-gated and SQL-parameterised — no change needed.)
- **Hardened the civilian custom-emote / radial events against DoS abuse**
  (`modules/civilian/civilian-sv.lua`). The `civ:RemoveCustomEmote` and
  `civ:RemoveCustomCategory` handlers previously serialised and wrote the entire
  `civ_custom_emotes` store to disk + DB on **every** call, even when nothing changed —
  a client could flood them with junk ids for a cheap server-side disk/CPU DoS. They now
  only persist when something actually changed. Added a shared per-source rate limiter
  (`rateOk`) to all civilian write events (`AddCustomCategory / RemoveCustomCategory /
  AddCustomEmote / RemoveCustomEmote / SetRadialPref`, min 400 ms apart), to
  `civ:GetCustomEmotes` (1 s) and to `civ:ShowId` (1.5 s, stops NUI-spam at other players).
  The rate-limit + activity-cooldown tables are now cleared on `playerDropped` so they can't
  grow unbounded across reconnect churn.

### Fixed
- **Agency MDT: only the latest comment showing in the single incident view.** The
  `mdt:setCallInformation` net-event handler in `mdt-nui-cl.lua` gated its `updateCallInfo`
  forward to `mdtNuiOpen` only — Agency MDT / Dispatch never received the per-call refresh
  after selecting an incident, so its `activeCall.comments` fell out of sync with newer
  entries until the next full `SyncCalls` broadcast. Now forwards for LAPD MDT, Agency MDT
  AND Dispatch.
- **Radial keybind (B) sticking after rebind.** `RegisterKeyMapping("+civradial", ...)` no
  longer sets a default key, so FiveM never re-applies "B" over the user's own binding after
  the pvp-corev3 → lacore resource rename. First-time users bind their key once via
  FiveM → Settings → Keybinds.

## [Unreleased] – Sprache (MDT separat) & Anticheat-Fix

### Fixed (Radial — Hold + Fokus-Rahmen)
- **Radial-Hold flackerte / öffnete nicht sauber.** Ursache: `SetNuiFocus` griff die Eingabe
  synchron → Phantom-Key-Up. Jetzt via **`SetNuiFocusKeepInput(true)`**: die Spiel-Eingabe bleibt
  aktiv, das Release-Event der Halte-Taste feuert zuverlässig und es entsteht kein Phantom →
  echtes „offen solange **B** gehalten, Loslassen schließt". Bewegung/Kampf/Pausemenü werden
  währenddessen geblockt; ESC/Backspace schließen ebenfalls.
- **Weißes Viereck um die Buttons entfernt:** war der Browser-Fokus-Rahmen auf den SVG-Segmenten
  beim Klick. `tabindex` von Segmenten/Hub entfernt (nicht mehr fokussierbar) + `outline: none`.

### Added (LASD CAD — Auto-Adresse, Auto-Waypoint, Incident-Templates, LPR)
- **Adresse auto-eingetragen:** beim Öffnen des „CREATE CALL"-Formulars wird das **LOC-Feld**
  automatisch mit der aktuellen **Straße (+ Kreuzung + Postal)** des Officers vorbefüllt
  (Callback `lasdGetLocation` → `lasdLocation`).
- **Auto-Waypoint beim ACK:** schließt man sich einem Incident an (`AssignSelf`), wird automatisch
  ein GPS-Wegpunkt zum Einsatzort gesetzt (Server sendet die Koords mit `lasd:Assigned`).
- **Incident-Templates:** im „Create CFS"-Formular eine Template-Leiste (Traffic Stop, Suspicious
  Vehicle/Person, Disturbance, Illegal Parking, Pursuit) → Ein-Klick füllt Code + Nature vor.
- **LPR (License Plate Reader):** `/lpr` (oder CAD-Callback) scannt das **Fahrzeug direkt vor dem
  Spieler** (Raycast), liest das Kennzeichen, führt die **VEH-Abfrage** aus und füllt beim
  Traffic-Stop das **VEH-Feld** des Create-Formulars automatisch. Locale-Keys en/de/ru.

### Changed (Civilian Update — Radial: Hold-to-open + konfigurierbar)
- **Radial ist jetzt „gedrückt halten"** statt Toggle: Keybind hält das Menü offen (`+civradial`),
  Loslassen schließt (`-civradial`); Items währenddessen mit der Maus anklicken. (`/e`/`/prop`
  ohne Argument öffnen weiterhin per Toggle.)
- **Keine Separatoren mehr** zwischen den Buttons (Segment-Gap 0, kein Stroke) — sauberer Ring.
- **Radial im Profil konfigurierbar:** neuer Profil-Tab **„Radial Menu"** mit Toggles für jede
  Emote (nach Kategorie) und jeden Service. Auswahl wird **pro Spieler persistiert**
  (`data/civ_radialprefs.json`, nur deaktivierte IDs gespeichert → neue Items default an) und
  filtert das Radial beim Öffnen. Events `civ:GetRadialPrefs`/`civ:SetRadialPref`/`civ:RadialPrefs`,
  NUI `civRadialConfig`, Locale-Keys en/de/ru. Im Preview verifiziert (DOM).

### Added (Civilian Update — Phase 4: Gang/Org-Rahmen)
- **Organisationen/Gangs** (`modules/civilian/org-sv.lua`, persistiert `data/civ_orgs.json`):
  anlegen, **nächsten Spieler einladen** (Owner/Officer) → `/orgaccept`, verlassen/auflösen,
  **MOTD**, **Ränge** (Owner > Officer > Member) mit Kick/Promote. Ein Spieler ist in höchstens
  einer Org.
- **LEO sieht die Zugehörigkeit:** Beitritt/Austritt setzt die `faction` des aktiven Charakters
  (neue Hilfsfunktion `SetCharFaction` in `characters-sv.lua` → Spiegel `civilians[lic]`),
  womit die Gang in der MDT-Personenakte auftaucht.
- **Org-Panel** (`web/src/components/CivOrg.svelte`), geöffnet über Radial → Services →
  „Organisation": Header (Farbe/Tag), editierbares MOTD, Mitgliederliste mit Rang-Badges +
  Online-Status, Promote/Kick (rechtebasiert), Invite/Leave/Disband. Store `S.citizen.org`,
  Messages `showCivOrg`/`hideCivOrg`, Actions + Locale-Keys en/de/ru. **Beide Panel-Zustände
  (Create + Management) im Preview verifiziert.**

### Added (Civilian Update — Phase 3: Aktivitäten/Jobs, RP-only)
- **Config-getriebene Civ-Aktivitäten** (`CivConfig.activities`): jede Aktivität ist eine Kette
  von Wegpunkten — Step 1 = Clock-in-Hub (Blip + Marker), Ankunft am letzten Step schließt ab.
  Beispiel „Garbage Run" enthalten (Koords sind **Platzhalter**, auf eigene Map anpassen).
- **Ablauf:** am Hub `E` zum Starten → GPS führt zu den Stops → Abschluss am Ziel. `/canceljob`
  bricht ab. Radial „Activities" setzt einen Wegpunkt zum nächsten Hub.
- **Belohnung RP-only (kein Geld):** Abschluss schaltet ein optionales **Achievement** frei
  (`UnlockAchievement`) und zählt einen **persistierten Fortschritt** pro Aktivität
  (`data/civ_activities.json`, server-seitig, mit 10s-Anti-Spam). Server-Event `civ:ActivityDone`
  validiert gegen die Config. Locale-Keys en/de/ru.

### Added (Civilian Update — Phase 2: Services-Hub im Radial)
- **Radial wird zum Bürger-Hub:** neue **„Services"-Sektion** im Bürger-Menü mit
  **Register Vehicle** (`/vreg`), **My ID** (zeigt den eigenen Ausweis inkl. eigenem Mugshot),
  **Call 911** und **Call 311**. Alles reine Wiederverwendung der bestehenden Core-Funktionen
  (`OpenVehRegForm`, `/911`+`/311` → `call:Submit`); 911/311 fragen per On-Screen-Keyboard nach
  einer Beschreibung. Adressiert das Feedback „Civs wissen nicht, was sie tun können".
- Server `civ:ShowMyId` (eigener Ausweis, kein „shown by"); Karten-Builder refaktorisiert.
  Store `S.citizen.services`, Action `civService`, Locale-Keys en/de/ru. Im Preview verifiziert
  (DOM: Services-Segmente + Hub).

### Added (Civilian Update — Phase 2: echte ID-Felder)
- **Ausweis zeigt echte Charakter-Daten.** Im Profil-Charakter-Formular (`Profile.svelte`) sind
  jetzt **Größe / Gewicht / Augen / Haare** editierbar (Augen/Haare als Auswahl BRN/BLU/…). Die
  Werte landen über `physical` im Charakter (`characters-sv.lua`, server-sanitisiert) und im
  CAD-Spiegel `civilians[lic]`. `civ:ShowId` sendet sie mit; die DL-Karte (`CivIdCard.svelte`)
  nutzt **echte** Werte, wenn gesetzt — sonst den deterministischen RP-Filler. Locale-Keys en/de/ru.
- **Live-Foto per Mugshot-Native.** Beim „Ausweis zeigen" registriert der **Empfänger** einen
  `RegisterPedheadshot` vom (direkt benachbarten) Ped des Vorzeigers — das Txd ist clientlokal —
  und zeigt es via FiveM-`nui-img`-Host als Portrait (Haupt- + Geister-Foto). Karte erscheint
  sofort, das Foto wird asynchron nachgereicht (`civIdPhoto`); ein Headshot bleibt gleichzeitig
  registriert (vorheriger wird freigegeben). Browser-Fallback: Platzhalter, wenn die nui-img-URL
  nicht auflöst.

### Added (Civilian Update — Phase 1: Emotes & Bürger-Menü)
- **Neues Modul `modules/civilian/`** + Config `configs/cfg-civilian-sh.lua` (datengetrieben,
  escrow-ignored). Start des RP-only Civilian-Updates (kein Geld-/Economy-System).
- **Emote-System:** `/e <name>` spielt eine Emote, `/e` öffnet das Bürger-Menü, `/e c` bricht ab.
  Unterstützt Anim- und Scenario-Emotes (alles Base-Game, keine Stream-Assets). Looping-Emotes
  werden beim Bewegen/Einsteigen automatisch beendet. Sync über FiveMs Ped-Anim-Replikation
  (kein Server-Relay nötig).
- **Bürger-Menü als echtes Radial-Wheel (Svelte-NUI):** Keybind `pvp_civradial` (Default **B**,
  frei bindbar) öffnet ein segmentiertes Kreis-Menü (SVG) mit Center-Hub + Hover-Highlight.
  Oberste Ebene = Sektionen (Emote-Kategorien + „Props"); Auswahl öffnet die Items, Center =
  „Zurück"/„Schließen". Esc/Rechtsklick schließt. `web/src/components/CivRadial.svelte`,
  Store-Namespace `S.citizen`, Messages `showCivRadial`/`hideCivRadial`.
- **Platzierbare Props (server-synchron):** server-autoritativ erzeugte, vernetzte Objekte
  (jeder sieht sie). Im Radial unter „Props" platzieren bzw. „Aufheben" (nächstes eigenes),
  oder `/prop <id>` / `/prop pickup`. Whitelist + Limit pro Spieler (`CivConfig.propLimit`),
  Cleanup beim Disconnect. Neues Server-Modul `modules/civilian/civilian-sv.lua`.
- **Radial schließt auf derselben Taste:** der Öffnen-Key (Default B) schließt das Menü auch
  wieder (NUI bekommt den gebundenen Key mitgeteilt und schließt bei Tastendruck).
- **Props per Third-Eye entfernen — auch fremde:** ox_target-Option „Prop entfernen" auf jedem
  platzierten Prop. Funktioniert auf JEDEM getrackten Prop (auch von anderen Spielern), per
  netId server-validiert (kann keine beliebigen Welt-Objekte löschen). Die Radial-„Aufheben"-
  Aktion bleibt eigenes-nächstes; das Auge ist der globale Weg.
- **Civ↔Civ: Ausweis zeigen.** Third-Eye-Option „Ausweis zeigen" auf Spielern → dem Gegenüber
  poppt eine **realistische California-Driver-License-Karte** auf: Header (CALIFORNIA/USA/Bär/
  Stern), Foto mit „SAMPLE"-Vertikalschrift + Mikroschrift-Streifen, Siegel-Wasserzeichen,
  Laser-Perforation, Diagonal-Streifen-Ecke, Geister-Foto, Unterschrift, und das volle
  Feld-Set (4d DLN, 4b EXP, 3 DOB, 1/2 Name, 8 Adresse+ZIP, 9 CLASS, 9a END, 12 REST, 4a ISS,
  5 DD, 15 SEX, 16 HGT, 17 WGT, 18 EYES, 19 HAIR). **Reale** Felder (Name/DOB/Geschlecht/Adresse)
  aus dem CAD-Spiegel `civilians[lic]`; DLN/EXP/ISS/HGT/WGT/EYES/HAIR sind deterministische
  RP-Filler (echte Charakter-Felder folgen in Phase 2). Komponente `CivIdCard.svelte`,
  Net-Events `civ:ShowId`/`civ:ReceiveId`. („Hände hoch" ist über die Emotes abgedeckt.)
- Locale-Keys (en/de/ru, Lua + JSON), DevLauncher-Karte „Civilian Menu" für die NUI-Vorschau.
- Radial-Wheel + ID-Karte im Vite-Preview visuell verifiziert (Drill-Down, Hover-Arc, Karte).

### Fixed (Incident-Attachment — ganze Unit)
- **Beim Erzeugen eines Einsatzes durch eine Unit wird jetzt die ganze Unit angehängt.**
  `AddDispatchCall` (Backup/Traffic/Code6/manueller Incident) hat nur die anfragende
  `source` an den Einsatz gehängt — ein Partner mit gleichem Callsign blieb unassigned.
  Jetzt werden Status/Incident für **alle Mitglieder derselben Unit** gesetzt (wie schon bei
  Self-Assign, Dispatcher-Assign und Statuswechsel).

### Added / Fixed (Third-Eye & Cuffing)
- **Neu: `ThirdEye`-Schalter in `configs/config.lua`.** `ThirdEye = true|false` aktiviert/
  deaktiviert alle ox_target-Spieleroptionen (LEO/EMS/Coroner). Default an. Die Befehle
  (`/release`, `/uncuff`, `/putin` …) bleiben unabhängig davon verfügbar.
- **Gezogene (gedraggte) Person ins Fahrzeug setzen ohne Re-Targeting.** Sobald man jemanden
  zieht, ist er an den Officer **attached** und kann mit dem Auge nicht mehr anvisiert werden
  — die „in Fahrzeug"-Eye-Option war damit unerreichbar. Neuer Befehl/Keybind **`/putin`**
  (`pvp_putin`, ohne Default-Taste — frei bindbar) setzt die **aktuell gezogene** Person ins
  nächste Fahrzeug. `/uncuff` und `/release` (Keybind X) decken Entfesseln bzw. Loslassen ab.
- **Cuff-Animation spielt zuverlässiger.** Der Loop, der die Fessel-Animation hält, lädt das
  Anim-Dict (`anim@arrest_crooks`) jetzt selbst nach, falls der Load beim Cuffen fehlschlug
  oder das Dict zwischenzeitlich entladen wurde (vorher: stilles No-Op → keine Animation).
- **Cuff-Sound auch bei nicht-interagierenden Spielern.** Ein Zivilist, der die NUI nie
  geöffnet hat, hat ggf. einen *suspended* Web-Audio-Context → der Cuff/Uncuff-Sound blieb
  stumm. `playSound` weckt den Audio-Context jetzt vor dem Abspielen auf.

### Fixed (Dispatcher-Karte — Marker-Position / „descale")
- **Marker (Einheiten/Einsätze) sitzen wieder korrekt auf der Karte.** Die Projektion
  Spielkoords→Tile-Pixel war über das Admin-Menü („Map Calibration": Scale/OffsetX/OffsetY)
  **runtime-verstellbar**, server-weit persistiert (`data/map_config.json`) und an alle
  Clients gebroadcastet — ein falscher Wert (z. B. `0.3 / 1 / 5550`) hat damit **alle**
  Marker descaled/verschoben. Die Kalibrierung ist aber eine **feste Eigenschaft des
  Tile-Rasters**, kein Tuning-Wert. Sie liegt jetzt zentral als Konstante in
  `web/src/lib/mapproj.js` (Single Source of Truth für Dispatch- **und** Big-Brother-Karte);
  die fehleranfälligen Kalibrierungs-Felder wurden aus dem Admin-Panel entfernt. Ein bereits
  kaputt gespeicherter Wert wird ignoriert → die Karte heilt sich beim nächsten Build.

### Fixed (EMS-CAD — nur EMS-relevante Calls)
- **Im EMS-CAD landen keine reinen Polizei-Calls mehr.** Der Bridge ins EMS-CAD
  (`AppendSharedDispatchCalls`) spiegelte **jeden** offenen Dispatcher-Einsatz. Jetzt nur
  noch **echte EMS-Anforderungen** (`Requesting Fire/EMS`, `Requesting Coroner`) **oder**
  Einsätze, an denen eine **EMS-Einheit hängt** (vom Dispatcher zugewiesen). Generisches
  „911 Emergency" kommt nur noch rein, wenn EMS tatsächlich zugewiesen wird.

### Fixed (MDT — Auto-Detach & 311-Calls)
- **Man wird nicht mehr ungewollt vom Einsatz detached.** `mdt:SetStatus` überschrieb
  `player.incident` IMMER mit dem mitgeschickten Wert — der Client sendet aber **0**
  bei BUSY/UNAVAILABLE/CLEAR/OUT TO STATION → jeder solche Statuswechsel löste die
  Zuweisung. Jetzt server-autoritativ: nur **CLEAR** detacht, ein expliziter Incident
  übernimmt, sonst bleibt die bestehende Zuweisung erhalten.
- **Self-Assign ist jetzt server-autoritativ (per `source`).** Die Zuweisung lief vorher
  über `mdt:SetStatus(callsign, …)` mit **Callsign-Matching** — stimmte der Client-
  Callsign nicht exakt mit `player.callsign`, schlug das Attach **lautlos** fehl und man
  erschien beim nächsten 2s-Sync wieder „unassigned" (das vom User vermutete „Server-
  Validierungs"-Problem). Neues Event `mdt:SelfAssign` ordnet sicher über die `src` zu.
- **911/311-Calls kollidieren nicht mehr.** `CreateCallQueueIncident` zählte noch mit
  rohem `+1` statt der rollierenden `NextIncidentNumber()` → ein Auto-Incident konnte
  eine **bereits aktive** Nummer treffen und den Call überschreiben/„verschwinden"
  lassen (betraf v.a. 311). Jetzt kollisionssicher (überspringt aktive Nummern).

### Fixed (Agency-MDT — Settings/Query öffneten das LAPD-MDT)
- **Settings öffnen nicht mehr das LAPD-Settings-Modal im Hintergrund.** Das Agency-MDT
  nutzte `S.settingsOpen` → das **globale LAPD-Modal** (Modals.svelte) ploppte hinter dem
  Fenster auf und blieb stuck. Jetzt hat das Agency-MDT ein **eigenes, gethemtes Settings-
  Panel** (lokaler State, wie beim LASD CAD) — Opacity/Scale/Position, Reset, Done.
- **Jemanden „runnen" öffnet nicht mehr das LAPD-MDT.** `RunPersonOrPlate` machte
  `if not mdtNuiOpen then OpenMdtNui()` → bei offenem Agency-/LASD-MDT poppte das LAPD-MDT
  im Hintergrund auf (und das LASD CAD blieb danach stuck). Der Helper respektiert jetzt
  das **aktuell offene** MDT und öffnet das LAPD-Fenster nur, wenn KEIN MDT offen ist.

### Fixed (Third-Eye — Release-Keybind + Englisch)
- Der hardcodierte **deutsche Keybind-Text** ist jetzt **englisch** („Release carried /
  Uncuff nearest"). Alle sichtbaren Strings laufen über die englische `en.lua`.
- Da der X-Keybind kollidieren oder erst gebunden werden muss, gibt es jetzt auch die
  **Chat-Commands `/release` und `/uncuff`** (gleiche Aktion: Getragenen absetzen bzw.
  nächsten Gefesselten entfesseln). Mit Rückmeldungen (entfesselt / niemand gefesselt /
  abgesetzt), damit man sieht, dass es feuert.

### Fixed (Third-Eye — Cuff/Carry ließ sich nicht rückgängig machen)
- Angehängte (getragene) bzw. weggebrachte Ziele kann man nicht mehr anvisieren →
  Uncuff/Release per Third-Eye ging nicht. Neuer **Release-Keybind (Standard `X`,
  umlegbar)**: trage ich jemanden → absetzen; sonst (LEO) → **nächsten gefesselten
  Spieler in Reichweite entfesseln** (server-seitiges Cuff-Tracking).

### Added (Field-Essentials — Breathalyser & Drugalyser)
- Nativ in den Core integriert (eigenständig implementiert, kein Fremd-Framework):
  **Alkomat** und **Drogen-Speicheltest** als RP-Tests. Officer fordert an (Third-Eye
  „Breathalyse"/„Drug Test" **oder** `/breatha` / `/druga`, nächste Person), die
  getestete Person liefert das Ergebnis selbst (`/breath <µg>` bzw.
  `/saliva <cannabis> <cocaine>`; leer = verweigert). Grenzwert 35 µg/100ml, Ergebnisse
  an Officer + Person, im Big-Brother-Log auditiert. Locales en/de/ru.
- Cuffing/Dragging waren bereits im Core vorhanden und wurden nicht doppelt übernommen.

### Added (Third-Eye / ox_target — Spieler-Interaktionen)
- Neues Modul `modules/target/` registriert **ox_target**-Eye-Optionen auf Spielern,
  jobabhängig (`canInteract`), verdrahtet auf bestehende + neue Server-Events:
  - **LEO:** Fesseln/Lösen (`cuffPlayer`), Ziehen/Loslassen (`dragPlayer`),
    Ins/aus Fahrzeug (`dragPlayer` vehicle).
  - **EMS:** Sanitäter/Transport (`hospitalServer`), **Revive** (neu, `ems:Revive` →
    `NetworkResurrectLocalPlayer`), **Puls prüfen** (lokal, zeigt Health/„kein Puls"),
    **Coroner/Leichensack** (neu, `target:DeadBag`, Coroner ODER Fire/EMS).
  - **CIV + alle:** **Tragen/Absetzen** (Fireman-Carry, `target:Carry`) — nur bei
    bewusstlosen/toten Zielen (Grief-Schutz, client-seitig geprüft).
- **Soft-Dependency:** ohne laufendes `ox_target` werden keine Targets registriert
  (kein Crash, Hinweis in der Konsole). Locales `target_*` (en/de/ru).

### Added (Anforderungen mit Detail-Eingabe)
- Bei **LEO Backup · Fire/EMS · Coroner · Tow · Crime Broadcast** kann jetzt vor dem
  Absetzen ein **optionaler Detail-Text** eingegeben werden (On-Screen-Keyboard; MDT bleibt
  offen, wird kurz entfokussiert). Die Details werden an die Standard-Meldung
  (`Callsign [Dept] — Typ`) angehängt und erscheinen im Einsatz/Dispatch. Gilt für alle
  MDTs (LAPD/Agency/EMS), zentral in `SendBackupRequest`. Locale `mdt_backup_details_prompt`.

### Fixed (Routing — AMR/Fire/EMS landete im Agency-MDT)
- Eine Fire/EMS/Coroner-Unit fällt jetzt **nie** mehr aufs Agency-MDT durch. Vorher war
  das Gate `if isEms and OpenEmsMdt` — fehlte das ems-Modul zur Laufzeit (`OpenEmsMdt` nil),
  öffnete fälschlich das Agency-MDT. Jetzt: `if isEms then …` (early return), und falls
  `OpenEmsMdt` fehlt, öffnet nichts + Konsolenhinweis „modules/ems geladen?".

### Added (EMS / Fire CAD — neues MDT)
- **Eigenes EMS/Fire-CAD-Terminal** (Dark-CAD-Look nach Mockup) für **Fire/EMS/Coroner**.
  Eigenes Backend (`modules/ems/ems-sv.lua`, Persistenz `data/ems_incidents.json`) wie das
  LASD-CAD, mit Bridge in das geteilte Dispatch-System (Dispatcher sieht EMS-Einsätze,
  agency="EMS") und Einblendung der geteilten 911-Einsätze (PD-…).
- **Layout** im echten RescueNet/FDM-Look: Top-Tab-Leiste (RM-Logo · UNITS · CAD · NEW) ·
  links Kontakt-/Einsatzliste mit Suche · Mitte CAD-**Chat-Thread** (Zeitstempel +
  Sprechblasen) mit kompakter INC/LOC/UNITS-Zeile und abgerundetem Eingabefeld + Send-Button ·
  rechts farbcodierte Status-Rail **EN RTE (F1) · ON SCN (F2) · CLEAR · BUSY · UA · BACKUP ·
  MN ACK · STGD · AT HSP** · unten Icon-Nav (Map/Incidents/Messages/Forms/Utilities) +
  Unit-Chip, Status-Chip und Uhr/Datum.
- **Bottom-Bar voll funktionsfähig:** **Map** (Einsatzliste mit „Waypoint setzen" →
  In-Game-GPS via neuem `emsWaypoint`-Callback) · **Incidents** (Einsatztabelle, Zeile
  öffnet den Thread, ACK je Zeile) · **Messages** (CAD-Chat) · **Forms** (Patient Care
  Report → strukturierter Eintrag in den Einsatz) · **Utilities** (Terminal-Info,
  Refresh-Sync, Close). Lokalisierung `ems_waypoint_set`.
- **Display-Einstellungen** in Utilities: **Größe (70–130 %)** und **Durchsichtigkeit
  (30–100 %)** per Slider, live angewandt (Scale/Opacity am Container) und lokal
  gespeichert (`localStorage 'ems-display'`), plus „Reset display".
- **Verschiebbar:** Top-Leiste ziehen → Fenster frei positionieren; Position wird
  mitgespeichert (Default zentriert).
- **EMS-Requests aus den anderen MDTs** (REQUEST BACKUP/EMS → „Requesting Fire/EMS",
  „Requesting Coroner", 911) werden im EMS-CAD angezeigt, mit rotem **EMS REQ**-Badge
  markiert und in der Liste nach oben priorisiert.
- **UNITS-Tab** (oben) zeigt **alle aktiven Fire/EMS-Units** mit Unit/Name/Status/Incident —
  inklusive on-duty Einheiten ohne offenes CAD (aus dem geteilten Roster, Status gemappt).
- **Status** server-autoritativ (nur CLEAR detacht), gemappt auf den geteilten HUD-Status
  inkl. **STAGED** und **AT HOSPITAL**. **ACK** = Einsatz attachen, **BACKUP** = Fire/EMS-
  Anforderung (`relaySpecialContact`), **COMMENTS** ins Einsatz-Log + Audit gespiegelt.
- **Routing** (`/mdt`): Job `Fire/EMS`/`Coroner` ODER dept `fire/ems/fd/medic` → EMS-CAD
  (vor dem Agency-MDT). Neues `/ems`-Command. Im DevLauncher als „EMS / Fire CAD".

### Fixed (Profil — aktiver Charakter wird beim Connect on-screen angewandt)
- Desync behoben: UI zeigte einen aktiven Charakter, on-screen (Nick) aber „keiner aktiv".
  Ursache: der aktive Charakter wurde nur beim **Öffnen** des Profils / **Erstellen**
  angewandt (Nick gesetzt), nicht beim **Spawn**. Neu: Client meldet `char:RestoreActive`
  beim Spawn → `EnsureActiveCharacter` wendet den aktiven Charakter an (Nick + Civilian-
  Spiegel) bzw. aktiviert den zuletzt aktiven, falls keiner gesetzt ist. Damit erscheint
  der Nick sofort, ohne dass man /char öffnen oder einen 2. Charakter erstellen muss.

### Fixed (Profil — kein aktiver Charakter nach /char)
- Beim Anlegen eines Charakters (`char:Create`) wurde `activeId` nie gesetzt → der
  **erste** Charakter war nicht aktiv, im Profil-UI war nichts markiert und es war kein
  Session-Nick gesetzt. Jetzt wird der erste Charakter **automatisch aktiviert**
  (`SetActiveCharacter` inkl. Nick + Civilian-Spiegel). Zusätzlich: `profile:Request`
  aktiviert bei Altdaten (Charaktere vorhanden, keiner aktiv) automatisch den zuletzt
  aktiven — so ist nach `/char` immer ein aktiver Charakter gesetzt.

### Changed (`/char` öffnet das Profil-UI statt des alten Char-Creators)
- `/char` (und `/character`) öffnen jetzt das **Player-Profile-UI direkt auf dem
  „Characters"-Tab** (Charaktere anlegen/aktivieren/bearbeiten/löschen) statt des
  alten separaten Civ-Datenblatts. Neue globale `OpenProfile(section)` in
  `profile-cl.lua`; `showProfile` trägt eine `section`, die das Profil-UI übernimmt
  (`/profile` bleibt auf „Overview"). Verifiziert.

### Fixed (MDT — „Request Backup / EMS / Tow" taten nichts)
- Die Backup-Buttons in **allen** MDTs riefen das Command `mdt_request_backup` auf, das
  **nirgends registriert** war → die Buttons hatten keine Funktion. Jetzt erzeugen sie
  über einen gemeinsamen Helper (`SendBackupRequest`) einen echten **Special-Contact-
  Einsatz** an der Unit-Position (`relaySpecialContact`), der an Dispatch und alle Units
  (MDTs) gebroadcastet wird. Betrifft REQUEST BACKUP, EMS, TOW, Coroner, Crime Broadcast
  und „Created Incident" — und ist damit auch fürs geplante **EMS/Fire-MDT** nutzbar.
- **„Tow Truck"** erzeugt jetzt ebenfalls einen Einsatz (fehlte in der Server-Typliste).
- Neue Lokalisierung `mdt_backup_sent` (en/de/ru) als Bestätigungs-Notification.

### Fixed (Agency-MDT — Incident-History wurde nie befüllt)
- Die **Incident-History** blieb im Agency-MDT immer leer: der Client leitete
  `mdt:IncidentHistory` nur weiter, wenn das **LAPD-MDT** offen war (`if mdtNuiOpen`).
  Jetzt auch für **Agency- und LASD-MDT** (`agencyMdtOpen`/`lasdOpen`) — verifiziert,
  zeigt die aufgelösten Einsätze.

### Added (Agency-MDT — Theme-Switcher)
- **Farbschema-Wechsler** im Settings-Panel: **CHP Blue · SAHP Gold · Ranger Green ·
  Fire/EMS Red · Slate · White (Light) · Black**. Die Kernfarben laufen jetzt über CSS-
  Variablen (`--a-*` inkl. `--a-on-accent`); jedes Theme tauscht das komplette Palette-Set
  (Hintergrund, Panels, Akzent, Text). Hartkodierte `#fff`-Vordergründe wurden auf
  Variablen umgestellt, damit der **Light-Modus** sauber lesbar ist. Auswahl wird lokal
  gespeichert (`localStorage 'amdt-theme'`) und beim Öffnen wiederhergestellt.

### Added (Agency-MDT — eigene Personen-/Fahrzeug-Such-UI)
- **Gestaltete Query-Oberfläche** (CHP-Dark-Blue) statt der eingebetteten LAPD-`QueryView`,
  die im dunklen Theme ohne Design dastand: linke **QUERIES**-Leiste (Person/Vehicle/
  Plate), gestaltete Formularkarte (Person: Name/DOB/Sex · Fahrzeug: Plate/Type/State/
  VIN/Year) mit Focus-Highlight, **Search/Clear**. Ergebnisse erscheinen auf einer hellen
  „Printout"-Karte (`PersonRecord` inkl. Cite/Charge + BOLO-Treffer). Nutzt dieselben
  Daten/Aktionen (`runQuery`, `S.query.results`) — kein neues Backend.

### Added (Agency-MDT — Resolve, getrennte Abfragen)
- **RESOLVE INCIDENT**-Button **direkt unter der Incident-Nummer** im Header (löst den
  Einsatz auf, `mdt:ResolveCall`, danach zurück zu CALLS).
- **11-27 = nur Personen, 10-28 = nur Kennzeichen** — die Funktionstasten öffnen die
  Query-Ansicht jetzt direkt mit der passenden Maske (Person bzw. Plate/Tag).
- **Funktionstaste „10-6 / 10-99" → „10-8 / 10-98"** und setzt den Status auf **CLEAR**
  (10-8 = im Dienst/verfügbar) statt BUSY.

### Added (Agency-MDT — Settings & LAPD/LASD-Funktionen)
- **Settings-Page** (Zahnrad in der Titelleiste) — nutzt dasselbe Modal wie das
  LAPD-MDT: **Opacity / Scale / Position / Theme**, persistent. Das Agency-MDT liest
  jetzt `mdtStyle(S.settings)` (verifiziert: Opacity wirkt) und ist per Titelleiste
  **verschiebbar** (Position wird gespeichert).
- **Funktionen aus LAPD/LASD nachgerüstet:** **Dispatch-Chat** (MAIL/RETURNS),
  **Schwarzes Brett** (BOARD), **Incident-History** (HISTORY) und **Backup-
  Anforderungen** (REQUEST BACKUP / EMS / TOW / CODE 6) in der Aktionsleiste.

### Added (Agency-MDT — BOLO, Citations & Field-Tabs)
- **WATCH LIST → BOLO-Ansicht** im Agency-MDT (`BoloView`); **Citations/Charges**
  laufen über die Query-Ansicht (`PersonRecord` mit ⚖-Charge-Picker + BOLO-Treffern,
  PenalCode beim Öffnen geladen) — Parität zum LAPD-MDT.
- **Incident-Field-Tabs funktional:** INFO (Typ/Code/Area/Beat/Location/State/Notes),
  UNITS (angehängte Einheiten), CALLER (Anrufer/Meldung), PRIORS (frühere Einsätze am
  selben Beat).

### Added (Drittes MDT — Agency-MDT für alle übrigen Exekutiven)
- Neues **Agency-MDT** (`web/.../AgencyMdt.svelte`) im **dunkler CAD-Stil**
  (dunkelblau) für **jede Exekutive außer LAPD und LASD**. Nachgebaut aus den
  Referenzbildern in `preview/`: Funktionsleiste (FOLLOW/STOP/10-6·10-99/11-27/10-28/
  CALLS/UNITS/WATCH LIST/MAIL·RETURNS) + Status, **ACTIVE/PENDING CALLS**, Incident-
  Detail (Header + INC#, Feldraster, Tabs UNITS/INFO/CALLER/PRIORS, COMMENTS + Add),
  rechte Aktionsleiste (SELF-ASSIGN/MAP IT/GET ROUTE/AUTO ZOOM/MORE), Units- und
  Query-Ansicht.
- **Re-Skin, kein eigenes Backend:** nutzt exakt dieselben geteilten Daten/Actions
  wie das LAPD-MDT (`S.calls`/`activeCall`/`units`, `selectCall`/`addComment`/
  `setStatus`/`selfAssign`/`setGps`/`requestBackup`).
- **Routing (`mdt-nui-cl.lua`):** `/mdt` → LAPD = LACORE Mobile Client · LASD/Sheriff/BCSO =
  CAD/PCMS · **alle anderen = Agency-MDT** (`OpenAgencyMdt`). Eigener Open/Close +
  Control-Block + Escape-Schutz; Dev-Launcher-Card „Agency MDT".

### Added (Dispatch — Karten-Kalibrierung gegen Pos-Versatz, #3)
- Die **Marker-Kalibrierung** (`scale/ox/oy`) ist jetzt **server-konfigurierbar** (Teil
  der MapConfig, persistent) und im **Admin-Modus live einstellbar** — inkl. Klick-auf-
  Karte-Koordinaten-Ablesung. Marker bewegen sich sofort mit (verifiziert). Wird auch
  von der **Big-Brother-Karte** gelesen, sodass beide Karten konsistent bleiben. Damit
  lässt sich der „Spieler-Position immer verschoben"-Versatz ohne Rebuild beheben.

### Fixed (BOLO funktionierte nicht — Recherche #7)
- **BOLOs ließen sich auf dem Live-Server nicht anlegen/aufheben.** Der Berechtigungs-
  Check nutzte `IsUnit`, das aber **lokal** in `mdt-civilian-sv.lua` definiert und im
  BOLO-Modul `nil` ist → der Gate war immer „verboten" (außer in devmode), das Anlegen
  schlug lautlos fehl. Ersetzt durch `MayBolo` (on-duty Unit via `ResolveRequestingUnit`
  oder Dispatcher via `IsDispatcher`). Auto-Treffer bei Abfragen waren nicht betroffen.

### Changed (Incident-Nummerierung)
- **LAPD CAD:** Incident-IDs sind jetzt **4-stellig, 1000–9999, rollierend** (nach 9999
  zurück auf 1000); aktive Nummern werden übersprungen (`NextIncidentNumber`).
- **LASD CAD:** Format **`[STATION][MMDDYY]-[TAG]`** (z. B. `CPT082923-0001`). TAG ist
  ein **per-Station** fortlaufender 4-stelliger Zähler (0001–9999, rollierend).
  Stationskürzel je Area (`Compton→CPT`, `Industry→IND`, erweiterbar). **Andere
  Agencies** (kein Sheriff) bekommen **kein Kürzel** → `082923-0001`.

### Fixed / Added (Dispatcher & LASD)
- **LASD: angehängte Units gehen nicht mehr verloren.** Die angezeigten Units eines
  Einsatzes sind jetzt die **Vereinigung** aus CAD-Liste und Live-Zuweisung
  (dedupliziert, `MergedUnits`) — eine weitere Unit überschreibt keine andere mehr.
- **Escape öffnet nicht mehr die GTA-Karte.** Beim Schließen von MDT/Dispatch wird das
  Pausemenü (Controls 199/200) ~0,5 s lang geblockt, sodass der schließende Escape
  nicht ins Spiel durchschlägt.
- **„Message Unit" ist jetzt eine echte Funktion:** taggt der Dispatcher eine Unit im
  Dispatch-Chat mit **`@Callsign`**, bekommt diese Unit eine **On-Screen-Benachrichtigung
  + Ton** (auch bei geschlossener MDT). `@`-Parsing serverseitig, dedupliziert.
- **Maptiles:** Leaflet-Ladeoptimierung (`keepBuffer`, `updateWhenIdle/Zooming=false`,
  `crossOrigin`) → weniger Re-Fetches/Last beim Tile-Server.

### Added (Dispatch-Console — Admin-Modus: Stadt & Bezirke)
- **Dispatch ⇄ Admin-Switch** in der Dispatch-Console (nur für Staff/Dispatcher
  sichtbar, `canEdit`). Im Admin-Modus lassen sich **Stadt**, die **Bezirksliste**
  (frei anlegen/umbenennen/Farbe/löschen) und der **Standard-Kartenstil** setzen;
  der Zone-Editor und der Bezirksgrenzen-Zeichner liegen jetzt ebenfalls hier.
- **Bezirke sind jetzt server-konfigurierbar** statt fest im Frontend
  (`modules/mdt/mdt-mapconfig-sv.lua`, persistent `data/map_config.json`, an alle
  gebroadcastet). Die Dropdowns im Zone-/Polygon-Editor und die Polygon-Farben lesen
  die Liste (`districtNames`/`districtColor`, Fallback auf die alte feste Liste). Die
  konfigurierte **Stadt** dient als Default-Region (Zone-„clear"-Wert). Editieren nur
  Staff/Dispatcher/devmode.

### Fixed (LASD CAD — Status/Attach)
- **Status-Wechsel löst die Einsatz-Zuweisung nicht mehr auf.** `lasd:SetStatus`
  setzte `u.incident` bei leerem `incidentId` auf "" → man wurde beim Statuswechsel
  ungewollt detached und der Einsatz bekam den Status nicht mit. Jetzt: nur **AVAIL
  (10-98)** detacht, sonst bleibt die Zuweisung erhalten; geloggt wird in den Einsatz,
  auf dem die Unit tatsächlich ist.
- **Nach MDT-Neustart ist man wieder dem Einsatz zugewiesen.** Beim (Neu-)Öffnen des
  CAD wählt die UI automatisch den Einsatz aus, an dem die Unit serverseitig hängt
  (`inc.units` enthält die eigene Callsign) — vorher war man optisch „keinem Incident
  zugewiesen".

### Added (Death-Sync — tote Spieler)
- **Tote Spieler werden jetzt an Spieler im Umkreis korrekt synchronisiert**
  (`modules/deathsync-*.lua`). Ein toter Spieler funkt seine echte Position; andere
  Clients filtern nach Radius (90 m) und bringen die Leiche per Ragdoll an die wahre
  Position (Netzwerk-Kontrolle wird nur bei spürbarem Drift angefordert → kein
  Rubberbanding). Behebt „Toter steht / Leiche driftet/flackert". *(Nur im echten
  Multiplayer testbar.)*

### Added (Feature-Parität — BOLO im LASD CAD)
- Das **LASD CAD** hat jetzt dieselbe BOLO-Funktion wie das LAPD-MDT: ein **BOLO-
  Funktionsbutton** öffnet die Liste aktiver Fahndungen und ein **BROADCAST-BOLO**-
  Formular (Person/Vehicle/Plate, Grund, 10-32). **BOLO-Treffer erscheinen jetzt auch
  in LASD-DEX-Abfragen** (`BolosForQuery` im `lasd:Query`-DEX-Pfad). Nutzt dasselbe
  Backend (`mdt:BoloCreate`/`mdt:BoloSync`) wie das LAPD-MDT.

### Added (Playerlist — 911-Dispatcher-Status)
- Das **I-Menü (Playerlist)** zeigt jetzt in der Server-Info-Box, ob ein **911-Dispatcher
  im Dienst** ist (grün „Im Dienst (N)" / rot „Nicht besetzt"). Server broadcastet die
  Dispatcher-Anzahl (`BroadcastDispatcherStatus` → `syncDispatcherStatus`) sofort bei
  On/Off-Duty und alle 2 s als Fallback (deckt Disconnects ab). Locales EN/DE/RU.

### Added (MDT — BOLO / Fahndungen)
- **BOLO-System (`modules/mdt/mdt-bolo-sv.lua` + `web/.../BoloView.svelte`):** LEO legen
  im neuen **BOLO-Tab** Fahndungen an (Person / Fahrzeug / Kennzeichen, Grund, Details,
  „armed & dangerous" 10-32). Werden an alle on-duty LEO gebroadcastet (Ton + Notification),
  laufen nach 24 h ab, persistent (`data/bolos.json`), Cancel jederzeit. Big-Brother- +
  Webhook-Log. **Auto-Treffer:** bei jeder Personen-/Kennzeichen-Abfrage prüft der Server
  aktive BOLOs (`BolosForQuery`) und zeigt sie als auffälligen Treffer in der Personenakte.

### Added (MDT — Citations + Charges / Penal Code)
- **Strafzettel & Anklagepunkte:** in der Personenakte öffnet ein **Charge-Picker**
  (⚖) eine durchsuchbare Liste aus der neuen `configs/cfg-charges-sh.lua`
  (Penal Code: Infraction/Misdemeanor/Felony, Bußgeld, Haftmonate). Officer wählt
  mehrere Punkte, sieht die Live-Summe (Bußgeld + Haftzeit) und stellt eine
  **Citation** oder einen **Arrest Report** aus.
- **Server-autoritativ:** `char:IssueCharges` (in `characters-sv.lua`) berechnet
  Bußgeld/Haftzeit aus dem Penal Code (Client-Werte werden ignoriert) und hängt das
  Ganze als Akteneintrag (Kategorie `citation`, fraktions-sichtbar) an den Ziel-
  Charakter — sichtbar in MDT-Akte und LASD-DEX. Notify an Officer + (falls online)
  an die betroffene Person. Big-Brother- + Webhook-Log.

### Added (Schutz — ACE-Permissions + Ban-Härtung)
- **Discord-Rollen → ACE-Brücke (`modules/security/permissions-sv.lua`):** legt beim
  Start ACE-Gruppen an (`group.pvp_dev` / `pvp_staff` / `pvp_mod` mit Vererbung) und
  hängt erkannte Discord-Staff/Dev zur Laufzeit per `add_principal` in die passende
  Gruppe (Entfernen bei `playerDropped`). Damit funktionieren die bereits
  ACE-restricted Admin-Commands (`/ban`, `/kick`, `/tempban`, `/unban`, `/warn`,
  `/staff`, `/dc`) endlich auch für In-Game-Staff — **ohne** Identifier von Hand in
  die `server.cfg` einzutragen. Pollt die globale `players`-Tabelle (kein Eingriff in
  server.lua nötig). `group.pvp_dev` erhält pauschal `command` (= alle Befehle).
- **`HasPermission(src, perm)`** als einheitlicher Helfer für alle Module
  (Konsole/devmode/Discord-Staff/ACE). `/myperms` zeigt die eigene erkannte Gruppe.
- **Ban-Härtung (`server.lua`):** Ban-/Warn-Datensätze speichern jetzt **`name`,
  `by` (Discord-ID des Issuers), `byName` und `created`** — vorher stand nur der
  Grund drin. `/unban` validiert die Ban-ID (kein stiller Fehlschlag mehr) und loggt
  in AdminLog + Big Brother. `BanPlayer`/`WarnPlayer` nehmen optional den Issuer-`src`.

### Added (Schutz — IP-Lock mit Remote-Lizenzserver)
- **IP-Lock (`modules/security/iplock-sv.lua`):** sperrt den gesamten Core auf
  freigegebene Server-IP(s). Beim Start ermittelt das Modul die öffentliche
  Server-IPv4 (mehrere Provider + Retry) und stoppt die Ressource via
  `StopResource`, wenn die IP nicht freigegeben ist.
- **Freigabe kommt live vom Lizenz-Server** (PocketBase, `LICENSE_URL`): das Modul
  lädt die Lizenzliste und sucht einen Eintrag, dessen `serverIp` passt **und**
  dessen `start`/`end`-Zeitfenster aktuell gültig ist. Neue Server schaltet man so
  ohne neuen Build frei/sperrt sie (end-Datum in die Vergangenheit). Datumsvergleich
  über `YYYYMMDDHHMMSS`-Strings (bewusst ohne `os.time` → kein Y2038-Problem bei
  Laufzeiten > 2038). Optionale lokale Notfall-Liste `EXTRA_ALLOWED_IPS`.
  `FAIL_OPEN=false` (Lizenzserver/IP nicht erreichbar → Stopp). Modul lädt früh im
  Manifest (nach `configs/*-sv.lua`) und ist escrow-verschlüsselt.
- **Discord-Webhook-Alarm:** bei einem Lock-Verstoß geht (optional) ein Embed an
  einen hinterlegten Webhook raus (erkannte IP, Hostname, Zeit) — Stopp wird kurz
  verzögert, damit der Request noch rausgeht (`ALERT_WEBHOOK` im Modul).
- **Anti-Removal-Guard:** das Modul setzt beim Laden ein globales `_PVP_IPLOCK` mit
  geheimem `SEC_TOKEN`. Ein Guard in der **verschlüsselten** `server/server.lua`
  prüft nach 60 s, ob Token vorhanden/korrekt ist — fehlt das Lock-Modul (entfernt
  oder Manifest-Zeile gelöscht), sperrt der Core sich selbst. `ENABLED=false`
  behält den Token (legitimes Deaktivieren löst den Guard NICHT aus). `SEC_TOKEN`
  in beiden Dateien muss identisch sein.

### Added / Fixed (LASD CAD/PCMS — Tester-Feedback)
- **Rechtsklick auf einen Einsatz** im DISPATCH INDEX öffnet ein Dropdown mit
  **RESOLVE INCIDENT** (öffnet die CLR/Dispo-Maske) und **ACK / ATTACH** — wie in
  der LAPD-Konsole (`openIncCtx` in `LasdMdt.svelte`).
- **ACK auf einem ausgewählten Einsatz** hängt die Unit jetzt an den Einsatz an und
  setzt den Status auf **ENROUTE** (wie LAPD) — statt nur den Status zu melden.
  `lasdAssignSelf` zieht zusätzlich den geteilten MDT-/HUD-Status auf ENROUTE.
- **10-98 löst den Einsatz jetzt auch auf gebrückten Dispatcher-/911-Einsätzen
  (`PD-…`) auf.** Diese liegen nur im geteilten `emergencyCallList`, nicht in
  `lasdIncidents` — `lasd:ResolveIncident`/`lasd:AssignSelf` erkennen die `PD-`-ID
  jetzt und greifen direkt auf das geteilte System zu (`PdNumber`-Helfer). Das war
  der Grund, warum „10-98 = resolve" vorher nichts tat.
- **Angehängte Units werden im Einsatz-Record angezeigt** (`UNITS ATTACHED: …`,
  sonst `NONE`). Für `PD-`-Einsätze werden die Units aus `player.incident`
  abgeleitet (`AttachedUnitsFor`).
- **Das LASD-CAD/PCMS-Terminal gilt jetzt für JEDE Agency außer LAPD** (LASD,
  Fire/EMS, Coroner, BCSO, …). Nur das LAPD nutzt weiterhin das LACORE Mobile Client
  (Routing in `mdt-nui-cl.lua`).

### Added (Dispatch-Konsole — Unit-Rechtsklickmenü)
- **Rechtsklick auf eine Unit** in der Dispatch-Konsole öffnet ein Kontextmenü mit:
  - **Einsatz erstellen** — legt einen neuen Einsatz an **und weist diese Unit sofort
    zu** (ENROUTE). Öffnet das Erstellen-Formular mit Hinweis „→ <Callsign>"
    (`mdt:DispatcherCreateIncidentForUnit`, `dispatchCreateForUnit`).
  - **Unit anrufen** — baut über **pma-voice** eine private Sprechverbindung zwischen
    Dispatcher und Unit auf (Toggle; erneuter Klick / „Anruf beenden" / `/hangup`
    trennt). Beide Seiten bekommen Ton + Hinweis; eine grüne **In-Call-Leiste** zeigt
    „Im Gespräch mit <Callsign>" und hebt die Unit-Zeile hervor
    (`mdt:DispatchCallUnit` / `mdt:DispatchEndUnitCall`, reuse der Voice-Helfer aus
    `mdt-callqueue-sv.lua`). Cleanup bei Disconnect **und** `/dispatch off`.
  - **Aktuellen Einsatz anzeigen** — wählt den der Unit zugewiesenen Einsatz aus.
  - **Auf Karte zeigen** (eigene Idee) — zentriert die Leaflet-Karte auf die Unit.
  - **Unit anschreiben** (eigene Idee) — füllt den Dispatch-Chat mit `@<Callsign> `.
  Alle sichtbaren Texte über Locale-Keys (`dispatch_ctx_*`, `dispatch_call_*`) in
  EN/DE/RU.
- **Rechtsklick direkt auf den Unit-Marker der Karte** öffnet dasselbe Menü
  (`m.on('contextmenu')` in `renderMarkers`). Da die Dispatch-Karte **alle** Units
  (LAPD **und** LASD) zeigt, steht das Menü dort automatisch auch für LASD-Units
  bereit — ein separates Menü im LASD-PCMS-Einzelterminal ist nicht nötig.

### Added
- **Separate NUI-/MDT-Sprache:** neue Config `MdtLanguage` (configs/config.lua).
  Leer = folgt `Language`. So kann Spiel/HUD z.B. Deutsch sein und das MDT
  Englisch. Umgesetzt über den neuen Helfer `UiLocale()` (configs/locale-sh.lua);
  alle NUI-Sender (MDT, Dispatch, Profil, Big Brother) nutzen ihn.

### Added (WIP)
- **Speech-to-Text — Machbarkeits-Probe (`/sttcheck`):** öffnet im FiveM-Client ein
  Panel, das prüft, ob `SpeechRecognition` + Mikrofon (`getUserMedia`) im CEF
  funktionieren, inkl. Live-Erkennungstest; Ergebnis auch in der F8-Konsole
  (`modules/stt/stt-cl.lua`, `SttProbe.svelte`). Grundlage für das geplante
  Selbst-Transkriptions-System (jeder Client schreibt sein eigenes Mikro mit →
  Anrufer + Dispatcher ins Protokoll, ohne pma-voice-Audio anzugreifen).

### Fixed / Added (Dispatch-Konsole — Tester-Feedback)
- **Incidents ließen sich nicht auflösen:** ein reiner Dispatcher (Job evtl.
  „Civilian") wurde von `ResolveRequestingUnit` abgewiesen. `ResolveDispatchCall`
  erlaubt jetzt zusätzlich Dispatcher (`IsDispatcher`) → Label „DISPATCH".
- **Status hängte Unit an ausgewählten Incident:** „C6" auf eine Unit wies sie
  fälschlich dem gerade markierten Einsatz zu. Jetzt sinnvolle CAD-Semantik:
  **ER** weist (bewusst) dem ausgewählten Einsatz zu, **C6** behält den eigenen
  Einsatz der Unit, **CL** macht frei (Einsatz 0).
- **Einsatz abwählen:** Klick auf den markierten Einsatz (oder den ✕-Button im
  Detail-Header) hebt die Auswahl jetzt auf (vorher nur durch Anklicken eines
  anderen möglich).
- **NEU — Dispatcher kann Einsätze erstellen:** „+ Neu"-Formular (Typ/Ort/Details)
  in der Detail-Leiste → `mdt:DispatcherCreateIncident` → `AddDispatchCall`
  (keine Unit wird dabei zugewiesen).
- **NEU — Dispatcher-Notizen:** Notiz-Editor pro Einsatz in der Detail-Leiste
  (speichert über `mdt:SetNotes`).

### Fixed (Dispatch/MDT)
- **Dispatcher off-duty ließ Anrufe hängen:** `mdt:DispatcherOffDuty` räumte die
  Call-Warteschlange/Session nicht auf. Neuer Helfer `HandleDispatcherGone` (aus
  off-duty **und** disconnect): laufender Anruf wird **neu zugewiesen** (zurück in
  die Queue, wenn andere Dispatcher online), sonst beendet; ist **kein** Dispatcher
  mehr online, wird die Queue aufgelöst → **AutoIncident**. Caller bekommt
  `call:Requeued`-Hinweis.
- **Incidents fehlten im LASD-Message-Index:** Die LASD-PCMS zeigte nur LASD-eigene
  Einsätze. Dispatcher-erstellte und 911-Call-Incidents (geteilte `emergencyCallList`)
  werden jetzt in die LASD-Sync gemischt (als `agency="PD"`, mit Aktivitäts-Eintrag
  → erscheinen im Message Index). LASD-Origin-Calls werden nicht doppelt gezeigt.
- **ACK markierte ALLE Ungelesenen als gelesen:** Das Öffnen des Calls-Tabs rief
  `markCallsRead` (leerte `S.unread` komplett). Jetzt wird ein Call **erst beim
  Anklicken** als gelesen markiert (`selectCall`), nicht pauschal beim Tab-Wechsel.

### Fixed / Debug
- **911-Call (pma-voice) — lautloses Scheitern + Debug:** `SetVoiceCall` rief
  `exports['pma-voice']:SetCallChannel` in einem **`pcall`, das Fehler verschluckte**
  — passte der Export-Name nicht zur pma-voice-Version, verband die Voice **nie,
  ohne Meldung**. Jetzt: Fehler werden **ausgegeben**, plus Fallback auf
  `setPlayerCall`, plus Prüfung, ob die Resource `pma-voice` überhaupt läuft.
- **Durchgängige Debug-Prints** für den 911/311-Flow (Flag `CallCenter.Debug`,
  standardmäßig **an**): Client `/911` registriert/gesendet; Server `call:Submit`
  (alle Guards: Enabled, Typ, Befehl-vs-Telefon, Dispatcher online), Queue/
  AutoIncident, `call:Answer` (Dispatcher-Check, Anruf gefunden) und der Voice-
  Channel-Aufbau. So sieht man in der Server-Konsole genau, wo ein Anruf hängt.

### Fixed
- **Halb-übersetzte Strings nachgezogen:** Der HUD-Standort zeigte „Area of Play"
  auch auf Deutsch/Russisch (der Übersetzungs-*Wert* war englisch geblieben, nicht
  der Key). Jetzt **Spielgebiet** (DE) / **Зона игры** (RU); ebenso `aop_vote`.
  Außerdem konsistent: `Private Sitzung`, `auf/ab`/`вверх/вниз`, sowie im NUI
  `bb_cat_combat → Kampf`, `bb_jail → Einsperren`, `Sortieren: Status`.
  (Ein Vergleich EN↔DE/RU bestätigte: der Rest sind bewusste Lehnwörter/CAD-Begriffe
  wie GPS, Status, Dispatch, Code 6, BIG BROTHER.)
- **Big Brother DB-Crash (`pvp_logs` INSERT):** „Truncated incorrect DECIMAL value".
  Der Batch-Insert nutzte `params[#params + 1] = v`; bei `nil`-Feldern (optionale
  `zone`, oder `x/y/z` ohne Koordinaten) legt Lua nichts ab und `#` wandert nicht
  weiter → alle Folgewerte verrutschen um eine Position (ein String landet in einer
  DECIMAL-Spalte). Jetzt expliziter Positions-Zähler → `nil` bleibt als sauberes
  SQL `NULL`, nichts verrutscht mehr.
- **Anticheat NoClip — False-Positives/„False-Bans":** `GetEntityCollisionDisabled()`
  ist auch bei legitimen Zuständen `true` (Teleport/Spawn/Streaming, Screen-Fade,
  Tod/Ragdoll, Player-Switch, Fallen). Diese werden jetzt **ausgeschlossen** und das
  Zeitfenster auf **~8 s ununterbrochen** erhöht → praktisch keine Fehlauslösungen
  mehr beim Respawn/Jail-Teleport. (Hinweis: Admins, die legitim per vMenu noclippen,
  brauchen weiterhin die Discord-Rolle `Staff`/`Dev` → sie werden nie bestraft.)
- **Richtungsanzeige (Kompass):** nutzt bereits `T("dir_*")` und übersetzt mit
  `Language` korrekt (EN/DE/RU). Setze `Language = "de"` für deutsche Richtungen
  (O/NO/SO …); das MDT bleibt über `MdtLanguage` unabhängig einstellbar.

## [Unreleased] – Web-Dispatcher-Portal (Phase 1)

Beginn eines externen, browserbasierten Dispatcher-Portals (eigener VPS).
**Phase 1 (Fundament, Live-Ansicht):**
- **FiveM-Brücke** (`modules/webdispatch/webdispatch-sv.lua`): pusht alle 2s einen
  State-Snapshot (`BuildCallList`/`BuildUnitList`/`BuildCallQueue`) an eine externe
  Node-Bridge und stellt einen token-gesicherten Inbound-Endpoint bereit
  (Aktionen folgen in Phase 4). Standardmäßig **aus** (Convars `pvp_bridge_url`/
  `pvp_bridge_token` leer = kein Overhead).
- **Node-Bridge** (`bridge/`, eigenständiger Dienst, nicht escrow): `POST /ingest`
  (Token) → In-Memory-State → **WebSocket-Broadcast** an verbundene Browser;
  `GET /health`. Lokal end-to-end getestet (Ingest → WS-Broadcast, Bad-Token → 401).
- Discord-Login (Phase 3) und voll interaktive Aktionen (Phase 4) folgen.

**Phase 2 (externe Web-App, Live-Ansicht im Browser):**
- **Transport-Abstraktion:** `nui()` (`web/src/lib/nui.js`) routet Aktionen über die
  Bridge, wenn `window.__pvpWsSend` registriert ist — **in-game unverändert**.
- **Bridge-Client** (`web/src/lib/bridge-client.js`): verbindet per WebSocket
  (Auto-Reconnect mit Backoff), speist den State in **dieselbe** Message-Pipeline
  wie die NUI (`updateCalls`/`updateUnits`) → `Dispatch.svelte` wird unverändert
  wiederverwendet.
- **Eigener Build:** `web/dispatch.html` + `dispatch-main.js` + `DispatchApp.svelte`
  (nur Dispatch + Verbindungsanzeige); `npm run build:web` → `web/dist-web`
  (deploybar). Die In-Game-NUI (`../nui/dist`) bleibt davon unberührt.
- Lokal verifiziert: Browser lädt `/dispatch.html?bridge=…` → **LIVE**; Calls/Units
  (inkl. LASD-Badge) erscheinen und **aktualisieren sich live** ohne Reload; keine
  JS-Fehler. (Karten-Tiles brauchen einen externen Host via `mapBase`/`?map=`.)

**Plug-and-Play-Deploy (ein Dienst, ein Befehl):**
- Die **Bridge liefert jetzt alles aus einem Dienst**: WebSocket **+** die gebaute
  Dispatch-App (`/`) **+** die Karten-Tiles (`/mdt/map`). Die App verbindet
  automatisch „same-origin" — kein separates Hosting, Karte funktioniert sofort.
  (`bridge/lib/static.js`, `npm run build:web` → `bridge/public`.)
- **Web-Setup-Assistent** (`/setup`): beim ersten Start druckt die Bridge einen
  einmaligen Setup-Key ins Log; die geschützte Seite erzeugt das Token, speichert
  die Config (Volume `config.json`) und zeigt die fertigen `server.cfg`-Convars zum
  Kopieren. Danach gesperrt. Discord-Felder vorbereitet (Phase 3).
- **Docker-Compose + Caddy**: `docker compose up -d --build` startet Bridge +
  automatisches **HTTPS/WSS** (nur Domain draufzeigen). `bridge/Dockerfile`,
  `bridge/deploy/{docker-compose.yml,Caddyfile,.env.example}`.
- Lokal verifiziert: Setup-Key-Gate, Token-Speichern → Ingest sofort gültig,
  falsches Token 401, `/` liefert die App; `docker compose config` valide.

**Phase 3 (Discord-Login + Rollen-Gate):**
- **OAuth2-Login** an der Bridge (`bridge/lib/auth.js`, `/auth/login`,`/callback`,
  `/me`,`/logout`): Discord-Consent → Code-Tausch → Guild-Mitgliedschaft + erlaubte
  Rolle (via Bot-Token) → HMAC-signierte Session-Cookie. Rollen-Allow-Liste,
  CSRF-State, 8h-Session.
- **WebSocket-Gate:** ohne gültige Session/Rolle **kein** Socket (`verifyClient`).
- **Login-Screen** in der Web-App (`DispatchApp.svelte`): prüft `/auth/me`, zeigt
  sonst „Mit Discord anmelden"; Fehlertexte (keine Rolle / abgebrochen / nicht
  konfiguriert).
- **Dev-Bypass** (`DEV_BYPASS_AUTH=1`) für lokale Tests ohne echte Discord-App.
- Lokal verifiziert: Bypass → `/auth/me` 200 + WS verbindet; erzwungen ohne Session
  → `/auth/me` 401, `/auth/login` → `/?login=unavailable`, **WS abgewiesen (401)**;
  Login-Screen rendert.

**Phase 4 (Aktionen scharf — voll interaktiv):**
- **Externe Actor-Unterstützung** im MDT-Kern: `ResolveDispatchCall`/`AddDispatchCall`
  und das Audit (`ActorOf`/`RecordCall*`) akzeptieren jetzt einen externen Actor
  (Discord-Identität des Web-Dispatchers) statt nur eines In-Game-`src` — rückwärts-
  kompatibel.
- **FiveM `/action`-Endpoint** (`modules/webdispatch`): führt Web-Aktionen über
  **dieselben** Funktionen aus — `status`/`assign` → `setUnitStatus`, `resolve` →
  `ResolveDispatchCall`, `create` → `AddDispatchCall` — + sofortiger Re-Sync und
  **Big-Brother-Audit** mit Discord-Identität.
- **Bridge-Relay:** WS-Aktionen werden gegen eine **Whitelist** gemappt und mit
  Token + Discord-Actor an `fivemUrl/action` weitergeleitet (Setup-Wizard-Feld
  „FiveM-Server-URL"). Die Session-Identität hängt am Socket.
- Lokal verifiziert: WS-Aktion → Bridge → Mock-FiveM erhält die gemappte Aktion
  mit korrektem Token + Actor; nicht-whitelistete Aktion wird **nicht** weiter-
  geleitet. → Der externe Dispatcher ist **voll interaktiv**.

## [3.0.5h] – 2026-06-14 — Profilsystem: echte Multi-Charaktere („digitale Akte")

Das Profil wird vom Einzel-Profil zu einem vollwertigen **Multi-Charakter-System**:
jeder Charakter ist eine eigenständige digitale Akte mit eigenen Fahrzeugen,
Akteneinträgen, Timeline und Stats.

### Added — Multi-Charaktere (`modules/profile/characters-sv.lua`)
- Neuer **`characters`-Store** (DB + `data/characters.json`) als Quelle der
  Wahrheit. Der **aktive Charakter** wird in `civilians[lic]` gespiegelt, sodass
  das gesamte **CAD/MDT/LASD-Lookup unverändert** weiterläuft.
- **Migration** beim Start: bestehende `char_presets` + `civilians` werden
  verlustfrei in Charaktere überführt (Presets → Charaktere, aktives Profil inkl.
  Fahrzeuge → aktiver Charakter).
- CRUD: `char:Create/Edit/Delete/Activate`. Charakterwechsel setzt Session-Nick
  und lädt die komplette Akte.
- **Fahrzeuge pro Charakter** statt pro Spieler; Charakterwechsel leert sie
  **nicht** mehr.

### Added — Profil-UI-Restruktur (`Profile.svelte` + neue Komponenten)
- **Sidebar-Navigation** mit zwei Zuständen: ohne aktiven Charakter nur
  *Übersicht* + *Charaktere*; mit aktivem Charakter zusätzlich *Fahrzeuge*,
  *Akteneinträge*, *Einstellungen* (gegated mit Schloss-Symbol).
- **Charakter-Roster** (aktivieren/erstellen/bearbeiten/löschen) + Inline-Formular.
- **Fahrzeugübersicht** (`ProfileVehicles.svelte`): Klasse (autom. via
  `GetVehicleClassFromName`), Kaufdatum (= Registrierzeit), Versicherungs-Schalter,
  Suche + Klassenfilter + Detailansicht.
- **Akteneinträge** (`ProfileRecords.svelte`): Kategorien, Privat/Fraktion-Flag,
  Archivieren, sowie ein **Zeitstrahl** (Geburtsjahr + datierte Einträge).
- EN/DE/RU-Locales für alle neuen Strings.

### Added — Akten-Rechte & CAD-Integration
- Besitzer hat volle Rechte an seiner Akte. **„Öffentlich für Fraktionen"**-Einträge
  sind für Mitglieder derselben Fraktion sichtbar, **Staff** sieht alle.
- Die CAD-Personenakte (`PersonRecord.svelte`) zeigt Officern die fraktions-/
  staff-sichtbaren Akteneinträge der abgefragten Person.

### Added — Konsolidierung & Erweiterungen (Multichar)
- **LASD-Parität:** Die LASD-PCMS-DEX-Abfrage zeigt jetzt ebenfalls die sichtbaren
  Akteneinträge („FILE NOTES").
- **Officer-Aktenvermerk:** On-duty-Units können aus dem CAD einen fraktions-
  sichtbaren Vermerk an eine Person hängen (Ziel per eindeutigem Namen).
- **Bild-URLs** für Fahrzeuge und Akteneinträge (kein Datei-Upload — nur URL).
- **Stats pro Charakter:** Tode/Kills (über den Client-Tod-Melder erfasst) sowie
  **Spielzeit pro Charakter** (60s-Tick, dem aktiven Charakter gutgeschrieben).
- **Beziehungen pro Charakter:** Familie/Partner/Freund/Bekannter/Rivale/Sonstige
  mit Notiz; eigener Profil-Tab „Beziehungen".
- **Big-Brother-Kategorie `profile`:** Charaktererstellung/-wechsel/-löschung und
  Akteneinträge werden geloggt.
- **Vereinheitlicht:** `/char` bearbeitet nur noch den aktiven Charakter; die
  komplette Verwaltung (erstellen/aktivieren/löschen) läuft über `/profile`. Das
  alte Preset-System schreibt nicht mehr (verhindert zwei konkurrierende Quellen).

### Fixed
- **Privacy-Leak:** Bei einer CAD-Personenabfrage wurde das rohe `records`-Feld
  (inkl. **privater** Akteneinträge) an den Officer-Client gesendet, obwohl die UI
  nur die gefilterten zeigte. Es wird jetzt nur noch eine bereinigte Kopie mit den
  sichtbaren Einträgen übertragen (LAPD **und** LASD).
- **Aktiven Charakter löschen** ist nicht mehr möglich (sonst kein Session-Nick) —
  Server-Guard + ausgeblendeter Löschen-Button.

## [3.0.5g] – 2026-06-12 — Bugfixes, RP-Befehl-Lokalisierung & Discord-Presence

### Fixed
- **Ladereihenfolge im Manifest (Root-Cause für mehrere Bugs):** `shared_scripts`
  (Sprachen, `configs/*-sh.lua` → `Achievements`/`Anticheat`/`Locale`/`T()`) wurde
  **nach** `client_scripts` geladen, sodass diese Globals beim Laden der
  Client-Module **`nil`** waren. FiveM lädt in Manifest-Reihenfolge — `shared`
  ist **nicht** automatisch zuerst. Block jetzt **vor** client/server verschoben.
  Behebt damit zugleich:
  - **„Frieda Collector"**: Katzen wurden nicht gespawnt (Guard auf `Achievements`).
  - **Easter Eggs** + **client-seitige Anticheat-Detections** liefen nie an.
- **`/bblog` öffnete nicht:** `bb-cl.lua` hatte einen Guard auf die *server-only*
  Config `BigBrother` (clientseitig `nil`). Guard entfernt — Zugriff erzwingt der
  Server.
- **LASD-CAD Status blieb nicht erhalten:** Status hing am geteilten
  `player.status` (vom LAPD-MDT/Duty-System überschrieben). In eine eigene
  `lasdStatus`-Variable entkoppelt.
- **Big-Brother-Panel ließ sich nicht schließen:** `CloseBB` (Client) sendete
  beim Klick auf ✕ kein `hideBigBrother` an das NUI — der Fokus ging weg, das
  Panel blieb sichtbar und blockierte. `hideBigBrother` jetzt in `CloseBB`.
- **Frieda-Katzen (robuster):** Das Modul brach beim Laden hart ab, falls die
  `Achievements`-Config (Timing) noch nicht da war → dauerhaft tot. Jetzt
  **wartet** es bis zu 10s auf die Config und gated seine Loops, statt
  unwiderruflich auszusteigen.

- **Big-Brother-Crash beim 2. Öffnen** (`each_key_duplicate`): doppelte Live-Logs
  wurden mit identischer `id` eingefügt → doppelte Svelte-each-Keys. Jetzt werden
  Duplikate beim Live-Insert verworfen und der each-Key ist garantiert eindeutig.
- **LASD-CAD Status wurde nicht serverseitig übernommen:** `lasd:Unregister`
  (beim Schließen der MDT) **löschte die Unit** → Status ging verloren und beim
  erneuten Öffnen entstand eine frische `AVAIL`-Unit; Dispatch sah den Officer
  bei geschlossener MDT gar nicht. Unit bleibt jetzt erhalten (nur `playerDropped`
  räumt sie ab), Status persistiert.
- **LASD-Status sprang im HUD (unten) sofort auf UNAVAILABLE zurück:** die
  PCMS-Statuscodes liefen nur ins LASD-System, nicht in den gemeinsamen
  MDT-Status — `syncPlayerList` überschrieb `player.status` darum wieder. Die
  LASD-Codes werden jetzt auf MDT-Status gemappt (`AVAIL→CLEAR`, `ENRT→ENROUTE`,
  `ONSCENE→ON SCENE`, `CODE6→CODE SIX`, `OBS/ACK→BUSY/ENROUTE`) und zusätzlich
  via `SetMdtStatus` gesetzt → HUD + LAPD-Dispatch zeigen den Status korrekt.

### Added — LASD-PCMS an das gemeinsame Dispatch-System angebunden (Bridge)
- LASD-Einsätze landeten bisher in einer **separaten** `lasdIncidents`-Tabelle —
  der **Dispatcher sah sie nicht**, und es gab **kein** Audit-Log/Webhook/Big
  Brother. Jetzt spiegelt das PCMS Erstellen/Zuweisen/Notizen/Auflösen über
  **dieselben Funktionen** wie das LAPD-MDT.
- **Gemeinsame Helfer extrahiert** (`modules/mdt/mdt-sv.lua`): `AddDispatchCall(opts)`
  und `ResolveDispatchCall(inc, reason, src)` — werden jetzt von LAPD **und** LASD
  genutzt. LASD-Calls erscheinen in der Dispatcher-/MDT-Call-Liste, **markiert
  mit `agency = "LASD"`** (goldenes Badge in `Mdt.svelte` + `Dispatch.svelte`).
- LASD-Calls werden identisch **auditiert** (`RecordCallCreation`/`RecordCallEvent`
  → `call_audit.json`, `calllog`), an **`Webhooks.DispatchLog`** gemeldet und in
  **Big Brother** geloggt. *(Hinweis: dadurch werden nun auch LAPD-Call-Erstellungen
  in Big Brother geloggt — gewollte Vereinheitlichung.)*
- Neues Klarmelden: CLR-Maske löst den Einsatz über `lasd:ResolveIncident` →
  `ResolveDispatchCall` auf (Resolved-State + DISPO + Audit), statt nur eine Notiz
  zu schreiben.
- **LASD-Einsätze werden jetzt persistiert** (`lasd_incidents` Store → DB +
  `data/lasd_incidents.json`, wie `calls.json`): beim Start geladen, alte
  aufgelöste Einsätze (>7 Tage) ausgemistet, `lasdSeq` kollisionssicher gesetzt.
  Damit übersteht die PCMS-Einsatzansicht einen Server-Neustart. *(Saved Chars,
  Char-Presets, Fahrzeuge, Achievements, Playtime etc. lagen bereits in der DB.)*

### Changed — UI / Gameplay
- **Profil- & Big-Brother-Panel: transparenter Backdrop** (kein Vollbild-Dimmen
  / Blur mehr) — der Spielhintergrund bleibt sichtbar.
- **Default-Charakter beim Spawn**: Spawn-Modell von `mp_m_freemode_01` auf
  `u_m_m_partytarget` umgestellt (`DEFAULT_SPAWN_MODEL` in `client/events-cl.lua`).

### Changed — RP-Befehle lokalisiert
- `/run`, `/grun`, `/search`, `/gsearch` gaben fest englischen Text aus
  („… runs … what comes back?"). Jetzt über das Lang-System
  (`rp_run`, `rp_search`) in **EN/DE/RU**.

### Added — Discord Rich Presence & Connect-Link (`configs/cfg-presence-sh.lua`)
- Rich Presence (App-ID, Art-Assets, klickbare **Discord/Website-Buttons**,
  rotierende Statuszeilen mit `{players}`/`{aop}`/`{discord}`) aus dem hartkodierten
  Loop in eine **Config** ausgelagert.
- Optionale **Discord-Karte auf dem Connect-Screen** (`connectCard`, Standard aus).
- Convars `pvp_discord_invite` / `pvp_website` + Doku zum Server-Browser-„Corner"
  (`sv_projectName` / `sv_projectDesc`) in `server.cfg.example`.

## [3.0.5f] – 2026-06-11 — „Big Brother is watching you" (Admin-Logging)

Ein neues, zentrales **Admin-Logging-/Überwachungssystem**. Jedes wichtige Event
fließt in eine durchsuchbare DB, ein In-Game-Admin-Panel und optional Discord.

### Added — Big Brother (`modules/bigbrother/`)
- **Log-Backend** (`bb-sv.lua`): eigene append-only Tabelle **`pvp_logs`** (indexiert),
  **gebufferte Batch-Inserts** (kein INSERT pro Event), **Auto-Retention**
  (Standard 30 Tage), zentrale **`BBLog(category, src, action, detail, opts)`-API**.
  Funktioniert auch ohne DB (Memory-Fallback).
- **Event-Feeds** (`bb-feed-sv.lua`) für alle Kategorien — wo möglich als
  *zusätzliche* Handler ohne Eingriff in die Originalmodule:
  - **Connection** (Join/Leave + Session-Dauer), **Chat**, **MDT/LEO**
    (Jail/Cuff/Drag/Coroner/Hospital/Dispatch), **Combat** (Client-Tod-Detektor
    meldet Killer/Waffe/Distanz), **Vehicle** (`/dv`).
  - **Admin** (Kick/Ban/Tempban — in `server.lua`, unter dem Ziel-Spieler geloggt)
    und **Anticheat** (alle Flags, inkl. Staff-exempt) speisen direkt ein.
- **In-Game-Panel** (`/bblog`, `BigBrother.svelte`): Live-Feed, Filter
  (Kategorie/Spieler/Text), farbcodierte Log-Tabelle, **Spieler-Dossier**
  (Counts pro Kategorie, First/Last Seen, Verlauf) und **Teleport** zum Log-Ort.
  Zugriff **rollen-gated** (Staff/Dev/LeadDeveloper), EN/DE/RU.
- **Discord-Embeds** pro Kategorie (eigene Kanäle via Convars
  `pvp_bb_webhook*`), gefiltert nach Severity — Chat/Commands spammen Discord
  standardmäßig nicht.
- **Config** (`configs/cfg-bigbrother-sv.lua`, server-only wegen Webhook-Secrets):
  Kategorien an/aus, Retention, Batch-Intervall, Zugriffs-Rollen, Discord.

### Changed
- `server.cfg.example`: Big-Brother-Webhook-Convars dokumentiert.
- `fxmanifest.lua`: `modules/bigbrother/*` eingebunden.

### Notes
- Generisches „jeder getippte Command"-Logging ist in FiveM ohne
  `RegisterCommand`-Wrapper nicht möglich — daher werden Chat + die wichtigen
  Admin-Commands explizit geloggt; die `command`-Kategorie ist für eigene
  Einspeisungen vorbereitet.

---

## [3.0.5e] – 2026-06-11 — Dokumentation & weitere Easter Eggs

### Added
- **4 neue Easter Eggs** ([cfg-achievements-sh.lua](configs/cfg-achievements-sh.lua)):
  🌟 *Hollywood* (Vinewood-Schriftzug), 🏙 *Top of the Tower* (Maze-Bank-Dach),
  🎡 *Pier Pressure* (Del Perro Pier) und 🤝 *Good Game* (`/gg`). Nutzen die
  vorhandenen Trigger-Typen (coord/command) — kein Code-Change. Der
  *Completionist*-Erfolg verlangt diese nun automatisch mit (9 Eggs total).
  Namen/Beschreibungen in EN/DE/RU.

### Changed — Dokumentation
- **`server.cfg.example`:** Anti-Cheat-Härtungs-Convars ergänzt
  (`sv_scriptHookAllowed 0`, `sv_pureLevel 2`, `sv_enforceGameBuild`,
  `sv_filterRequestControl`).
- **`README.md`:** Neue Config-Dateien dokumentiert (Anti-Cheat, Profil,
  Achievements, `DutyRoles`, `GameMinuteSeconds`, `membershipHours`, Sprachen);
  erledigtes To-Do (On-Duty-Rollen-Gate) entfernt.
- **`ANLEITUNG.md`:** Neue Abschnitte zu Sprachen/`lang`, `DutyRoles`, Anti-Cheat,
  Spieler-Profil und Achievements/Easter Eggs; `/profile` zu den Spieler-Commands.

---

## [3.0.5d] – 2026-06-11 — Full localisation, a bigger config layer & hardening

Großer Feinschliff-Release: der **komplette Core ist jetzt durchgängig
lokalisiert** (EN-Quelle + DE/RU), praktisch alles Spieler-/Profil-/Rollen-
bezogene ist **konfigurierbar**, und eine offene Sicherheitslücke wurde
geschlossen.

### Security
- **`ondutyServer` abgesichert:** Die Job-Zuweisung (LEO/Fire/Coroner) wird jetzt
  serverseitig per **Discord-Rolle** geprüft (`DutyRoles` in
  `configs/cfg-server-sv.lua`). Vorher konnte sich **jeder Client** zu LEO machen
  und damit MDT/Dispatch/Jail/Cuff nutzen. devmode + Staff/Dev umgehen die Prüfung;
  leere Rolle = offen.

### Added — Profil-Config (`configs/cfg-profile-sh.lua`)
- **Discord-Rollen-Badges** frei konfigurierbar: Rolle → Label, Farbe, Icon
  (Reihenfolge = Anzeigereihenfolge; weitere Rollen einfach ergänzen).
- **Status-Farben**, **Member-Badge** (Icon/Farbe), **Level-Formel**
  (`minutesPerLevel`) und **Stat-Erfolg-Schwellen** (Veteran/Legend/Garage…)
  konfigurierbar. Alle Werte werden an die NUI durchgereicht → Server und Anzeige
  bleiben synchron.
- **Membership-Schwelle in STUNDEN** (`membershipHours`) als **eine** Quelle der
  Wahrheit — gilt coreweit (Profil-Badge, „Member"-Erfolg, 10h-Benachrichtigung
  in `playtime-sv.lua` + Webhook). Die In-Game-Meldung und die Erfolg-Beschreibung
  passen sich dynamisch an.

### Added — Spielwelt-Config
- **Ingame-Zeit-Geschwindigkeit konfigurierbar:** `GameMinuteSeconds`
  (`configs/config.lua`) = echte Sekunden pro Ingame-Minute (Standard 8). Steuert
  den Tag/Nacht-Zyklus zentral (vorher hart `minuteDuration = 8000`).

### Added — Achievements-Ausbau
- **Stat-Erfolge serverseitig:** Veteran/Garage/… schalten beim Erreichen frei
  (Toast + persistent „erreicht am"), erste Runde pro Spieler still (kein
  Toast-Spam beim ersten Deployment).
- **Meta-Erfolg „Completionist":** automatisch, wenn alle Eggs gefunden sind.
- **Unlock-Datum** wird bei Eggs und Stat-Erfolgen angezeigt.
- **Frieda:** Katzen werden sauber auf den Boden gesetzt (`GetGroundZFor_3dCoord`,
  kein Schweben/Versinken mehr) und liegen in einer ruhigen Pose.

### Changed — Vollständige Lokalisierung (EN/DE/RU)
Alle verbleibenden hardcodierten, spielerseitigen Strings laufen jetzt über das
`lang/`-System (`T()` Lua-seitig, `t()` NUI-seitig):
- **Player-/Server-Board (Taste „i"):** Online-Spieler, Sessions, Seitenzahl,
  AOP-Texte, Server-Status, Einheiten-Zähler.
- **Server:** Kick-/Ban-Meldungen, `/dc`-Befehl. **LASD-Modul:** die deutschen
  Reste auf Englisch + lokalisiert.
- **Client-Notifications:** Charakter/Fahrzeug (`/char`, `/vreg`, Stolen-Plate…),
  MDT/Dispatch (Usage, GPS, „assigned to incident"…), Whitelist, NADS.
- **NUI-Komponenten:** `CallSession`, `QueryView`, `PersonRecord`, `ZoneEditor`,
  **`Modals`** (komplette `/char`/`/vreg`-Formulare, Disposition, MDT-Settings),
  sowie die generischen Chrome-Strings von `LasdMdt`.
- **Befehls-Hilfetexte** (`chat:addSuggestion`) für ~27 Befehle + das Telefon.

Bewusst **englisch belassen** (Begründung im Code): authentisches LASD-CAD-/Funk-
Jargon (10-98, NCIC, RMK…), serverseitige Daten-Werte (Male/Sedan/Valid…) und
literale Befehls-Keywords.

### Changed — Escrow
- **`build/escrow.js`:** `lang/`-Dateien werden nicht mehr obfuskiert (wie
  `configs/`), damit Käufer die Übersetzungen bearbeiten können. `lang/*` auch in
  `escrow_ignore` (Cfx-Keymaster) ergänzt.

---

## [3.0.5c] – 2026-06-11 — Spieler-Profil, Achievements & Easter Eggs

Eine neue, moderne **Spieler-UI** (`/profile`) mit Playtime, Charakteren,
Lizenzen, Fahrzeugen und **Achievements** – inklusive versteckter **Easter Eggs**
und einem Sammel-Erfolg „Frieda Collector". Plus: **Funken bei offener
Dispatch-Konsole** und durchgängige **Lokalisierung** der neuen UI.

### Added — Spieler-Profil (`/profile`)
- Eigenständiges **Dashboard** (Svelte) im modernen Dark-Look, unabhängig vom
  MDT: links Profilkarte (Avatar, **Level** aus Playtime + XP-Bar, Rollen,
  Mitgliedschaft), oben Stat-Karten, in der Mitte Tabs **Vehicles / Characters /
  Licenses / Achievements**.
- Neues Servermodul `modules/profile/profile-sv.lua` sammelt **vorhandene**
  Daten in eine Payload (Playtime, Charakter + Lizenzen + Fahrzeuge,
  `/char`-Presets, Discord-Rollen) – **keine neue Datenhaltung** nötig.
- `modules/profile/profile-cl.lua`: `/profile`-Befehl, NUI-Bridge, Aktivieren
  eines gespeicherten Charakters (über den bestehenden `civ:Save`-Flow).
- ESC schließt; im Dev-Launcher als Karte **„Player Profile"** öffenbar.

### Added — Achievements & Easter Eggs (`modules/profile/`)
- **Achievements-Tab**: berechnete Erfolge (Willkommen, Mitglied, Veteran,
  Legende, Garage, Sammler, Voll lizenziert, Saubere Weste …) mit ✓ bzw.
  Fortschrittsbalken – live aus den Spielerdaten.
- **Easter Eggs** (`achievements-sv.lua` / `achievements-cl.lua`,
  `configs/cfg-achievements-sh.lua`): geheime, **persistente** Erfolge
  (DB-Store `achievements`), config-gesteuert mit Trigger-Typen `coord`,
  `command`, `konami`. Beispiel-Eggs: UFO, Bergspitze, `/42`, Konami-Code.
  - **Anti-Spoofing:** Koordinaten-Eggs werden serverseitig gegen die echte
    Spielerposition geprüft.
  - **Toast** „🏆 Achievement unlocked!" beim Freischalten (`Toast.svelte`).
  - In der UI als **„Secrets"** im Achievements-Tab; ungefundene zeigen 🔒 **???**.
  - Server-Export-Style: `UnlockAchievement(src, id)` global für andere Module.

### Added — „Frieda Collector" (Sammel-Egg)
- Über die Map verteilte **Katzen** (`modules/profile/frieda-cl.lua`,
  Modell `a_c_cat_01`), die lokal in Spielernähe spawnen. In der Nähe erscheint
  ein **„Pet Frieda"**-Prompt; **10 gesammelt → Achievement**.
- Fortschritt **serverseitig pro Spieler** gespeichert (DB-Store `friedas`),
  Sammeln serverseitig positionsgeprüft (Anti-Spoof).
- Eigenes **Bild-Icon** (`web/public/frieda.svg`); per `img = "frieda.png"` in
  der Config gegen ein echtes Foto austauschbar.
- 12 Beispiel-Spawnpunkte in der Config (an die eigene Map anzupassen).

### Added — Funken bei offener Dispatch-Konsole
- Die Dispatch-Konsole nutzt jetzt `SetNuiFocusKeepInput` (wie das MDT/LAPD-CAD):
  bei offener Konsole kann man sich **bewegen und über pma-voice funken**; Maus
  steuert nur den Cursor (Kamera/Waffe geblockt), beim Tippen in ein Feld wird
  der Game-Input kurz unterdrückt (`modules/mdt/mdt-nui-cl.lua`).

### Changed — Lokalisierung (English + Locales)
- **Alle sichtbaren Profil-/Achievement-/Egg-/Frieda-Strings auf Englisch** und
  über das `lang/`-System: ~60 neue Keys in `lang/en.json` / `de.json` /
  `ru.json` (`profile_*`, `lic_*`, `ach_*`) sowie `frieda_prompt` /
  `frieda_progress` in `lang/en.lua` / `de.lua` / `ru.lua`. Englisch ist Quelle,
  DE + RU vollständig übersetzt.
- **Dev-NUI komplett auf Englisch** (Launcher-Texte + Mock-Daten in `dev-data.js`).

---

## [3.0.5b] – 2026-06-10 — AntiCheat, Anti-Dump & Asset-Schutz

Vollständiges, in den Core **integriertes Anticheat** (kein externes Resource),
Verhaltens-basierter **Anti-Dump-Schutz** mit Challenge-Response-Handshake sowie
ein Leitfaden gegen Asset-/Code-Leaks. Alle Detections loggen nach
`Webhooks.AdminLog`; Bestrafung läuft über die bestehende Core-Banlist.

### Added — AntiCheat (`modules/anticheat/`)
- **Serverseitige Checks** (nicht umgehbar):
  - Geblockte Explosionstypen (Orbital Cannon, Script-Missiles …) → Cancel + Ban
  - Explosions-Spam (>8 / 10 s) → Ban
  - Damage-Modifier (Waffenschaden > 250) → Cancel + Kick
  - Entity-Spam (> 20 client-gespawnte Entities / min) → Delete + Kick
- **Clientseitige Detections** (Report an Server, **Strike-System** gegen
  False-Positives bei Spawn-Schutz/Ragdoll/Fades): Godmode, Invincibility,
  **Super Jump**, **NoClip**, Speedhack, Unsichtbarkeit, **Blacklist-Waffen**
  (inkl. Auto-Remove), **Blacklist-Fahrzeuge** (inkl. Delete), Teleport.
- **Injection-/Modmenü-Schutz** (`anticheat-events-sv.lua`):
  - **33 Honeypot-Events** (ESX/QBCore/bekannte Menü-Events) — Trigger auf einem
    Standalone-Core = injiziertes Script → Ban.
  - **Event-Rate-Limits** für missbrauchsanfällige Core-Events (jail, cuff, 911 …)
    — stoppt Modmenü-Spam auch bei autorisierten (kompromittierten) Clients.
  - **Heartbeat** (Client-Ping alle 30 s; Ausbleiben → Kick, fängt Resource-Stop
    per Executor).
- **Pro-Detection-Aktion** `log` / `kick` / `ban`, konfigurierbar in
  `configs/cfg-anticheat-sh.lua`.
- **Staff-/Dev-Bypass:** verifizierte Discord-Rollen werden nie bestraft,
  Detections aber weiterhin geloggt (`[STAFF — exempt]`).
- **Startup-Check** warnt in der Konsole bei fehlender `server.cfg`-Härtung
  (`sv_scriptHookAllowed 0`, `sv_pureLevel 2`, `sv_enforceGameBuild`,
  `sv_filterRequestControl`).

### Added — Anti-Dump (`modules/anticheat/anticheat-dump-sv.lua`)
- **Challenge-Response-Handshake:** Der echte Client beantwortet eine
  **pro-Session zufällige Challenge** (FNV-1a + Salt aus
  `AntiDump.challengeSalt`). Headless-Dump-Bots senden nie „hello"; Replay-Bots
  liefern die falsche Antwort → **sofortiger Kick** (statt erst nach Timeout).
- **Kurz-Session-Sperre:** wiederholte Connect→Download→Disconnect-Muster
  (Cache-Dump-Bots) → 24 h Connect-Block (in-memory).
- **Server-Export `IsClientVerified(src)`** (in `fxmanifest.lua` deklariert):
  separate Asset-Resources (Models/Maps/Fahrzeuge) können prüfen, ob ein Client
  den Core wirklich ausführt, bevor sie Server-Logik bedienen.

### Added — Dokumentation
- **`ASSET-PROTECTION.md`:** Leitfaden gegen Asset-/Code-Leaks — Bedrohungsmodell
  (was schützbar ist, was nicht), **Watermarking-Checkliste** pro Asset-Typ
  (`.ytd`/`.ydr`/`.yft`/`.ymap`, inkl. Pro-Kunde-Watermark), `server.cfg`-Härtung
  und eine fertige **DMCA-Takedown-Vorlage**.

### Added — Sprachen (Anticheat)
- Neue Lua-Keys `ac_kicked`, `ac_banned`, `ac_dump_blocked` in `lang/en.lua`,
  `lang/de.lua`, `lang/ru.lua`.

### Changed — Lokalisierung verfeinert
- **MDT-/Dispatcher-NUI-Übersetzungen** von `web/src/lib/locale/` nach
  **`lang/*.json`** verschoben (zentral neben den Lua-Sprachdateien);
  `web/src/lib/i18n.js` importiert nun von dort.
- 8 neue **Callqueue**-Keys (Warteschlange) in allen drei NUI-Sprachen +
  `CallQueue.svelte` lokalisiert.

### Changed — Wiring
- `fxmanifest.lua`: Anticheat-Module (`modules/anticheat/*-cl.lua` /
  `*-sv.lua`) in Client- und Server-Load eingetragen; Export `IsClientVerified`
  ergänzt.

### Security
- ⚠️ Clientseitige Detections sind bauartbedingt umgehbar — die **serverseitigen
  Checks + `server.cfg`-Convars** sind die Basis-Schutzschicht.
- **Stream-Assets** (Models/Maps/Fahrzeuge) sind technisch **nicht** vor Dumping
  schützbar (die GPU braucht Rohdaten); realer Schutz = **Watermarking + DMCA**
  (siehe `ASSET-PROTECTION.md`). Cfx-Escrow schützt primär Code, nicht Streams.

---

## [3.0.5] – 2026-06-07 — Multi-Language Support (DE / ES / FR / PL / RU / EN)

The entire resource now ships with a **built-in i18n (internationalisation) system**
covering both the server-side Lua layer and the NUI/Svelte front-end. A single
config value switches the active language for all player-facing text at once — no
code changes required.

### Added

- **`Language` config key** (`configs/config.lua`, default `"en"`).
  Set to `"en"`, `"de"` or `"ru"` to switch the active language server-wide.
- **Lua locale module** (`configs/locale-sh.lua`) — shared script (loaded on both
  client and server) that defines string tables for all three languages and exposes
  the global `T(key)` / `T(key, arg, …)` helper function.
  - Falls back to English if a key is missing in the selected locale.
  - Supports `string.format`-style placeholders (`%s`) for dynamic values.
- **NUI locale JSON files** (`web/src/lib/locale/en.json`, `de.json`, `ru.json`) —
  ~80 keys covering all visible MDT and Dispatch Console labels.
- **`web/src/lib/i18n.js`** — NUI i18n helper with:
  - `t(key, vars?)` — translates a key; `vars` is an optional `{placeholder: value}` map.
  - `setLocale(lang)` — switches the active locale reactively (Svelte 5 `$state`-backed).
  - `LOCALE_CODES` — array of all registered language codes for building a language picker.

### Changed — Lua notifications & log entries

All hardcoded English strings in the server scripts have been replaced with `T()` calls:

### Changed — NUI / Svelte

- **`S.locale`** field added to the central store (`store.svelte.js`).
- **`messages.js`** calls `setLocale(d.locale)` when the server sends a `show` or
  `showDispatch` NUI message — the language is delivered from `Language` in `config.lua`.
- **`mdt-nui-cl.lua`** now includes `locale = Language` in both the `show` and
  `showDispatch` `SendNUIMessage` payloads.
- **`Mdt.svelte`** — all visible labels replaced with `t()`:
  - Left-rail sub-tab labels (`railItems` converted to `$derived` for reactivity)
  - Toolbar buttons (Home, Query, Traffic, C6, Calls, Dispatch, Enroute, Station, Dispo)
  - Status grid (BUSY, UNAVAIL, CLEAR, ENROUTE, STATION, CODE 6, ON SCENE) — display only; the internal status values sent to the server are unchanged
  - Request grid (LEO Backup, Fire/EMS, Coroner, Tow, Crime Broadcast)
  - Command bar ("Enter commands", "GPS Online")
  - Active Calls panel header + empty state
- **`Dispatch.svelte`** — all visible labels replaced with `t()`:
  - Top-bar title, Zones button, ATTENTION ALL UNITS tone button
  - ACTIVE INCIDENTS, INCIDENT DETAIL, ON-DUTY UNITS, DISPATCH CHAT panel headers
  - ASSIGN / RESOLVE action buttons + their select-placeholder options
  - On-duty unit group headers (LAW ENFORCEMENT, FIRE / EMS)
  - Unit table column headers (UNIT, INC)
  - Sort dropdown options (Callsign, Status, Default)
  - Dispatch chat input placeholder + Send button

### Ressources

- <https://github.com/tabysi/lacore-community/blob/main/README.md#translations>
- <https://gitlocalize.com/repo/10802>

### How to add a new language
1. Create `web/src/lib/locale/<code>.json` (copy `en.json`, translate all values).
2. In `web/src/lib/i18n.js` — add `import <code> from './locale/<code>.json'` and
   register it in the `LOCALES` object.
3. In `configs/locale-sh.lua` — add a `_L.<code> = { … }` block with all keys.
4. Set `Language = "<code>"` in `configs/config.lua` and rebuild (`npm run build`).

---

## [3.0.4] – 2026-06-05 — Datenbank-Persistenz (oxmysql) & Local/DB-Sync

Alle persistenten Daten werden jetzt zusätzlich in einer **MySQL-Datenbank über
oxmysql** gespeichert. Die lokalen `data/*.json`-Dateien bleiben als jederzeit
synchroner Offline-Cache erhalten — die DB ist die dauerhafte Quelle der Wahrheit.
Ziel: **keine Daten gehen mehr verloren**, auch nicht bei Crash/Neustart/Update.

### Added — MDT: Status-Codes, Location, Response-Code, History & Schwarzes Brett
- **ST-Spalte = 2-Buchstaben-Status-Code** (schmal): `CL` Clear, `AS` On Scene,
  `EN` Enroute, `C6` Code 6, `BY` Busy, `UA` Unavailable, `ST` Out to Station
  (`EX` reserviert). Voller Status weiterhin als Tooltip.
- **UNIT-Location status-abhängig:** Standard = letzte Straße; bei `CL` leer; bei
  `ST` „OUT TO STATION" als Default. **Eigene Unit kann die Location überschreiben**
  (Klick auf die Location-Zelle → editierbar, z. B. fremde Station bei BY/UA/ST) —
  serverseitig pro Unit gespeichert (`mdt:SetLocationOverride`).
- **Response-Code-Spalte (`Code`):** leer ohne Incident; **311 → Code 2**, **911 →
  Code 3** automatisch beim Anlegen; alle anderen Codes **manuell** im Incident
  wähl-/änderbar (`Code`-Dropdown im Summary/Incident-Info, `mdt:SetIncidentCode`).
- **Incident History abrufbar:** Der „Incident History"-Tab listet jetzt **alle
  abgeschlossenen Incidents** (aus dem Store, neueste zuerst) mit „View" zum Laden
  (`mdt:RequestIncidentHistory`).
- **Schwarzes Brett (Attachment-Tab):** gemeinsames Board, an das **alle On-Duty**
  Notizen pinnen können (interne Regelung, kein Hard-Lock). Persistiert im neuen
  DB-Store `board` (+ `data/board.json`), an alle offenen MDTs gesynct; löschen darf
  der Ersteller oder Staff (`modules/mdt/mdt-board-sv.lua`, `board:Post/Delete/Request`).
- **Sound-Cues (`sound/mdtentry.ogg`):** wird abgespielt, wenn ein Officer im MDT
  einen Incident erstellt (Traffic / Code 6 / manuell) — an **alle On-Duty-Units** —
  und wenn ein **Kommentar** zu einem Incident hinzugefügt wird — an **alle attachten Units**.
  Neuer generischer Client-Trigger `mdt:PlaySound(index)` (Index 7 = mdtentry);
  spielt auch bei geschlossenem MDT.

### Added
- **Zentraler Persistenz-Layer** (`modules/db/db-sv.lua`): eine Tabelle
  `pvp_core_store` (Key → JSON-Blob), beim Start automatisch angelegt. Generische
  Helfer `DBLoadStore(key, file)` / `DBSaveStore(key, file, tbl)` plus `SaveCalls()`.
- **Automatische Migration:** Ist die DB für einen Store noch leer, werden die
  vorhandenen lokalen JSON-Daten beim ersten Start übernommen. Beim Laden gewinnt
  die DB und aktualisiert die lokale Spiegeldatei.
- **Config-Schalter** `UseDatabase` (`configs/config.lua`, Standard `true`). Auf
  `false` verhält sich das Script wie bisher (reine JSON-Speicherung).

### Changed
- **Alle Stores laufen über den DB-Layer:** Zivilisten-/Charakter-Profile,
  `/char`-Presets, registrierte Fahrzeuge, **gestohlene Kennzeichen**, Dispatch-
  **Calls** (alle Speicherstellen via `SaveCalls()`), **Call-Audit-Log**, **Banliste**
  (Connect-Check + Ban/Warn/Unban), Bleets und NADS-Adressen. Jeder Save schreibt
  **immer lokal und in die DB** → lokal/DB stets synchron.
- **Playtime jetzt server-autoritativ & in der DB** (`modules/db/playtime-sv.lua`):
  die Spielzeit wird pro Spieler-Identifier serverseitig gezählt und im `playtime`-
  Store (DB + `data/playtime.json`) gespeichert — überlebt Neustarts, folgt dem
  Spieler über PCs hinweg und ist nicht mehr clientseitig manipulierbar. Der Client
  spiegelt den Wert nur noch für `/playtime` + die 10h-Mitgliedschafts-Meldung
  (Events `pvp:SyncPlaytime` / `pvp:PlaytimeReached`). Der alte clientseitige
  KVP-Zähler und das `playtimeReached`-Netevent entfallen.

### Added (Playtime-Migration)
- **Einmalige Übernahme der alten Playtime:** Beim ersten Join liest der Client den
  alten lokalen KVP-Wert — inkl. des **Pre-Rebrand-Keys `SAR-CORE:PT`** (das Maximum
  aus altem `SAR-CORE:PT` und neuem `PVP-CORE:PT`) — und schickt ihn an den Server
  (`pvp:MigratePlaytime`).
  Der Server importiert ihn **genau einmal pro Identifier** (persistentes Flag in
  `data/playtime_migrated.json`) und nur, wenn er den aktuellen DB-Wert übersteigt
  (mit Sanity-Cap) — so geht die bisherige Spielzeit nicht verloren und kann nicht
  wiederholt zum Inflationieren missbraucht werden.
- **fxmanifest:** `@oxmysql/lib/MySQL.lua` eingebunden, `modules/db/*-sv.lua` lädt
  **vor** allen datennutzenden Modulen, `oxmysql` als Dependency ergänzt.

### Changed — Map-Tiles in eigenes Resource ausgelagert
- **Neues Resource `lacore-maps`** enthält jetzt die Leaflet-Map-Tiles
  (~121 MB, ~4100 Tiles, Styles Atlas/Grid/Satelite). Sie sind **aus dem
  Haupt-Resource entfernt** → werden **einmal** geladen und bei Core-Updates nicht
  neu heruntergeladen (FiveM cached das stabile Tiles-Resource per Hash). `ensure
  lacore-maps` alongside `lacore`.
- **UI lädt Tiles via `https://cfx-nui-lacore-maps/mdt/map/`** (`MAP_TILE_BASE`).
  Zur Laufzeit per Server überschreibbar (`showDispatch.mapBase`) über die neue
  Config **`DispatchTileBase`** — z. B. um Tiles von einem eigenen CDN zu laden.

### Changed — Discord-Rollen-Auth eingebaut (kein `discordroles` mehr)
- **`discordroles` als Dependency entfernt:** Die Discord-Rollen-Prüfung ist jetzt
  **nativ in Lua eingebaut** (`modules/discord/discord-roles-sv.lua`). Sie liest die
  Gilden-Rollen eines Spielers direkt über die Discord-API (Bot-Token) und stellt
  dieselben Helfer bereit, die der Server nutzt: `GetDiscordRoles(src)` und
  `IsDiscordRolePresent(src, name)` (ersetzen `exports.discordroles:GetRoles` /
  `:IsRolePresent`). Ergebnisse werden pro Spieler gecached (`DiscordAuth.cacheSeconds`).
- **Konfiguration:** Bot-Token & Guild über Convars **`pvp_discord_token`** /
  **`pvp_discord_guild`**, Rollen-Namen → IDs in `DiscordAuth.roles`
  (`configs/cfg-server-sv.lua`). Der Bot muss in der Gilde sein und die
  **Server-Members-Intent** aktiviert haben. In `devmode` werden alle Rollen-Checks
  übersprungen.
- **Drop-in-Exports für andere Scripts:** dieselben Exports wie `discordroles`
  (Callback-Stil, Rollen-**IDs**) sind verfügbar:
  `exports['lacore']:isRolePresent(user, role, [guild], cb)`,
  `:getUserRoles(user, [guild], cb)`, `:getUserData(user, [guild], cb)`. Fremde
  Resources müssen nur `exports.discordroles` → `exports['lacore']` umstellen.

### Changed (Breaking) — Rebrand SAR → PVP
- **Convars umbenannt:** `sar_devmode` → **`pvp_devmode`**, `sar_webhook_*` →
  **`pvp_webhook_*`** (serverlog/livechat/adminlog/dispatch/reports/prison/bleeter/
  txadmin). **In der echten `server.cfg` anpassen**, sonst greifen Devmode &
  Discord-Logging nicht mehr. Vorlagen aktualisiert (`server.cfg.example`,
  `README.md`, `ANLEITUNG.md`).
- **KVP-Keys umbenannt:** `SAR-CORE:*` → **`PVP-CORE:*`** (Client: Settings,
  Playtime `PT`, gespeicherte Charaktere) und `SAR_CORE:*` → **`PVP_CORE:*`**
  (Server: Playerlist, AOP, Server-Zeit). Alte unter `SAR(-|_)CORE:*` gespeicherte
  Werte starten unter den neuen Keys frisch (rein clientseitige Caches, kein
  Gameplay-Datenverlust).
- **Branding bereinigt:** Header-Kommentar `--- SAR CORE SA` → `--- PVP CORE`,
  Init-Print `sar_core initialised!` → `pvp_core initialised!`.

### Notes
- **Voraussetzung:** Die Resource **`oxmysql`** muss laufen (mit gesetztem
  `mysql_connection_string`-Convar). Ist die DB nicht erreichbar, fällt das Script
  mit einer einmaligen Warnung sauber auf reine JSON-Speicherung zurück.

### Changed
- **Counties entfernt → automatische Stadt-/Regionserkennung:** Die alte
  County-Liste (Los Angeles County / Ventura County / San Bernardino County …) im
  Location-System wurde entfernt. Stattdessen erkennt das Script die Region jetzt
  **automatisch** anhand der GTA-Zone (`GetNameOfZone` → `CityZones`-Map in
  `client/vehicle-cl.lua`, `GetCityFromCoords`). Regionen: **Thousand Oaks,
  San Tierra, Los Angeles, West Hollywood, Beverly Hills, Santa Monica, Compton,
  Industry** (Default „Los Angeles"). Die erkannte Stadt wird in **PLD** und in den
  **MDT-Incidents** (`city`-Feld, City-Spalte im MDT) genutzt — durchgereicht über
  Incident-Erstellung, 911/311, Panik & Crime-Broadcast. (Agentur-Namen wie
  „… County Sheriff" bleiben unverändert — das sind Department-Namen, keine Region.)
  Neuer Befehl **`/citydebug`** blendet live Zonen-Code, Zonen-Name, erkannte Region
  und Koordinaten ein — zum Feinjustieren der `CityZones`-Map.
- **Zone-Editor (Dispatcher-Konsole _und_ MDT-Dispatch-Tab):** Über den Button
  **„⛬ Zones / Zone Editor"** lässt sich jede GTA-Zone einer Region zuordnen
  (durchsuchbare Liste, Region-Dropdown). Die Overrides werden **serverseitig im
  DB-Store `zone_regions` gespeichert**, live an alle Clients gesynct und haben
  Vorrang vor der Default-Map (`GetCityFromCoords`). Nur Dispatcher/Staff dürfen
  editieren (`modules/mdt/mdt-zones-sv.lua`). Eigene Komponente `ZoneEditor.svelte`,
  global gerendert (Overlay `position:fixed`, `z-index:9999` — vorher lag das Modal
  hinter der Leaflet-Karte und war unsichtbar).
- **Polygon-/Boundary-Editor auf der Dispatch-Karte:** Regionen lassen sich jetzt
  als **gezeichnete Polygone** direkt auf der Karte definieren („Draw Zone" →
  Punkte klicken → Region wählen → Finish). Ein Punkt erbt die Region des Polygons,
  in dem er liegt (Point-in-Polygon via `IsPointInBounds`) — **Priorität: Polygon >
  Zonen-Code-Override > CityZones-Default > Los Angeles**. Polygone werden im
  DB-Store `zone_polygons` gespeichert, live gesynct, farbig je Region dargestellt
  und sind anklickbar (Region ändern / löschen). Nur Dispatcher/Staff.
- **Map-Style direkt in der UI umschaltbar:** Dropdown in der Dispatcher-Konsole
  (Atlas / Grid / Satellite); die Auswahl wird pro Client in `localStorage` gemerkt
  und der Tile-Layer ohne Neuladen getauscht. (Config `DispatchMapStyle` bleibt der
  Default.) Der Konsolen-Titel zeigt nicht mehr „LOS ANGELES COUNTY".
- **Incident-Map-Blips abschaltbar:** Die GPS-Blips für aktive Incidents (pro Typ
  eingefärbt) sind ein gewolltes CAD-Feature, aber jetzt per Config **`ShowIncidentBlips`**
  (Standard `true`) komplett deaktivierbar.

### Performance
- **`IsLegal()` von O(n) auf O(1):** Die Funktion lief bei jedem Entity-Spawn
  (~3–4/s) und führte pro Aufruf bis zu **186 `GetHashKey`-Aufrufe** für jede
  Blacklist-Iteration aus (~180.000 native Calls in 5 Minuten). Die Hashes werden
  jetzt **einmal beim Resource-Start** in ein Set-Lookup vorgerechnet
  (`blacklistedVehicleHashes` / `blacklistedModelHashes`). Bonus: globale Variable
  `hashkey` (Leak) entfernt.
- **`entityCreating` schneller + sauberer:** doppelte `GetEntityModel`- und
  `NetworkGetEntityOwner`-Aufrufe (bis zu 6 redundante Natives pro Spawn) auf
  jeweils 1 reduziert; `metrotrain`-Hash gecached statt pro Spawn berechnet.
- **`entityRemoved`: Bug-Fix + Speed:** `table.remove` in `ipairs`-Schleife
  übersprang nachfolgende Einträge (subtiler Bug) und scannte unnötig weiter,
  obwohl jede Entity-ID nur einmal vorkommt → jetzt mit frühem `return`, im
  Schnitt halber Aufwand.
- **Leere `Wait(0)`-Schleife entfernt** (`client/hud-cl.lua`): ein `while true do
  Wait(0) end` mit nur einem Kommentar drin brannte jeden Frame CPU für nichts.

### Fixed (Layout & Sound-Spam)
- **Incident-History-Tab überläuft die UI nicht mehr:** bei vielen Einträgen lief
  die Tabelle über die UNIT-STATUS- und REQUEST-Strips am unteren Rand des MDT.
  Die History hat jetzt einen **eigenen scrollbaren Container** (`.pm-history-wrap`
  / `.pm-history-list`) mit Sticky-Header — der Bottom-Bar-Bereich bleibt
  unberührt, der aktive Incident steht oben (max. 25 % Höhe, ebenfalls scrollbar),
  die History scrollt darunter.
- **Sound-Cooldown gegen Spam (Ohrenschutz!):** zwei Drosseln verhindern, dass
  Officer durch Knopfhämmern alle anderen Spieler beschallen können:
  - **Client-seitig** (`mdt:PlaySound`): **3 Sekunden Cooldown pro Sound-Index**
    pro Client — egal woher der Trigger kommt. Der einzelne Spieler hört
    `mdtentry.ogg` & Co. niemals öfter als 1×/3 s.
  - **Server-seitig** (`mdt:CreateUnitIncident`): pro Quelle **3 s Cooldown auf
    Incident-Erstellung** (Traffic/Code 6/Manual). Spam-Clicks werden lautlos
    verworfen, der Officer bekommt eine kleine Notify — kein Broadcast, kein Sync.

### MDT UX
- **MDT mit ESC oder Backspace schließen** (zusätzlich zur **O**-Taste). Backspace
  wird ignoriert, wenn ein Textfeld fokussiert ist (sonst kann man dort nicht mehr
  löschen). Schließt auch das Zone-Editor-Modal sauber, falls offen.
- **Response-Codes nur noch 0/2/3/5** (statt 0-6) — passt zum tatsächlich genutzten
  Code-Schema.
- **MDT-Dispatch-Tab aufgeräumt:** die redundante „On-Duty Units"-Liste wurde
  entfernt (die Units stehen schon im Unit-Details-Tab der Vollbild-Dispatch-Konsole).
  Der **Zone-Editor-Button** wandert in den Dispatch-Chat-Header, damit er weiter
  greifbar ist.

### Fixed
- **„Unread MDT Calls" bleibt hängen:** Der On-Screen-Hinweis `mdtUnread` wurde nie
  zurückgesetzt und blieb daher dauerhaft eingeblendet (auch wenn nichts ungelesen
  war / nach dem Schließen des MDT). Beim **Öffnen des MDT** wird er jetzt gelöscht
  (= als gelesen markiert).

## [3.0.3c] – 2026-06-05 — Hotfixes (MDT-Fokus & Politur)

Nachbesserungen rund um die Eingabe-/Maus-Steuerung im MDT und kleinere Korrekturen.

### Added
- **Persons-Tab zeigt Personendaten:** Der „Persons"-Sub-Tab im MDT-Home zeigt jetzt
  den abgefragten Personendatensatz (Name + Warrant-Status, DOB/Geschlecht, Adresse,
  **Notes**, Lizenzen, registrierte Fahrzeuge) — dieselbe Karte wie im Query-Tab
  (neue, wiederverwendbare `PersonRecord`-Komponente, kein Duplikat). Bei einem
  Treffer (per `/run` oder MDT-Suche) springt das MDT **automatisch** auf den
  Persons-Tab, sodass die Person sofort aufpoppt.

### Fixed
- **MDT-Maus & Funk:** Bei offenem MDT bleibt die **Maus jetzt auf der UI** — die
  Kamera dreht sich nicht mehr mit (Look-Controls werden per Frame deaktiviert).
  Gleichzeitig kann man sich weiter **bewegen** und über **pma-voice funken** (die
  Funktaste ist ein `RegisterKeyMapping`-Command und feuert trotz NUI-Fokus, dank
  `SetNuiFocusKeepInput`).
- **Kein Fehlschuss beim Klicken:** Attack/Aim/Melee/Waffen-Controls werden bei
  offenem MDT geblockt — Klicks landen nur in der UI, lösen keinen Schuss/Schlag aus.
  Tippen in ein Textfeld schaltet kurz auf vollen Tastatur-Fokus.
- **MDT-Settings:** Die Position-Option **„Custom (dragged)"** ist jetzt wähl-/
  anzeigbar — beim Ziehen der Titelleiste zeigt das Dropdown korrekt den freien Modus.

### Changed
- **California-Theme:** `State`-Dropdown im Query-Formular von „San Andreas" auf
  California umgestellt (CA / NV / AZ / OR). (Der GTA-Textur-Name `driver_san_andreas`
  und das interne Blip-Default-Konzept „San Andreas" bleiben — sind Engine-Begriffe.)

## [3.0.3] – 2026-06-05 — Svelte NUI, a bigger CAD & escrow

Komplette Migration der NUI auf **Svelte 5 + Vite**, großer Funktionsausbau von
MDT / Dispatch / Query sowie ein lokales Obfuskations-/Escrow-Buildsystem.

### Added
- **NUI komplett auf Svelte 5 + Vite migriert** (`web/` → Build nach `nui/dist`).
  Das Lua-/Message-Protokoll blieb unverändert, das Win98/CAD-CSS wurde 1:1
  übernommen. `ui_page` zeigt jetzt auf `nui/dist/index.html`.
- **MDT-Einstellungen** (Zahnrad in der Titelleiste): Opacity, Skalierung, Position
  (Presets) und **freies Verschieben durch Ziehen der Titelleiste** — pro Client in
  `localStorage` gespeichert. Inkl. Theme-Toggle.
- **Bewegen & Funken im MDT:** während das (Hochkant-)MDT offen ist, kann man sich
  weiter bewegen und über pma-voice **funken** (Cursor-only-Fokus; volle Tastatur
  nur beim Tippen in ein Feld).
- **`/run <Name|Kennzeichen>`:** öffnet das MDT direkt auf dem Query-Tab und zeigt
  die Person sofort an. Jeder Run (per `/run` **oder** MDT-Suche) postet
  `<Callsign> ran "<Query>"` in den **Game-Chat** (für alle OnDuty-Units).
- **Query im CAD-Stil:** linker Query-Typ-Rail (Person / Vehicle / Plate),
  strukturierte Formulare mit gelb hervorgehobenem „Key"-Feld.
- **Live-Kennzeichen-Run + Diebstahl-Logik:** runt ein Beamter ein unbekanntes
  Kennzeichen, bekommt der **aktuelle Fahrer** ein VREG-Formular mit **15-Sekunden-
  Countdown** im MDT des Beamten. Ausgefüllt → registriert; abgebrochen/abgelaufen →
  Fahrzeug **als gestohlen geflaggt** (rotes Banner, persistent in
  `data/stolen_plates.json`). VREG-Formular um Owner/Color/Type/Year erweitert.
- **`/char`-Notes:** Freitext-Feld (z. B. Gang-RP-Kontext), das Beamten beim Run im
  CAD angezeigt wird.
- **`/char`-Presets:** beliebig viele Charakter-Presets, pro Spieler-Identifier
  gespeichert (`data/char_presets.json`).
- **„UNITS"/Unit-Details-Ansicht** im MDT-Rail: volle OnDuty-Liste mit Spalten
  UNIT / ST / Location / Inc / Type / Code, Filter (LEO / FD-EMS / Coroner) und
  Sortierung.
- **Dispatcher-Alarmton** („ATTENTION ALL UNITS"): spielt `sound/3beep.ogg` bei allen
  OnDuty-LEO ab.
- **Pfeiltasten-Steuerung** im MDT (Tabs ←/→, Liste/Incident ↑/↓).
- **Lokales ESCROW-Buildsystem** (`build/escrow.js` + `.\escrow.ps1`): packt die
  Resource obfuskiert (Lua minified + Locals umbenannt, NUI als fertiges Vite-Bundle)
  als ready-to-use Ordner + ZIP nach `/ESCROW/<name>-<version>/`. Der GitHub-Release-
  Workflow nutzt dasselbe Tool. **Hinweis:** Obfuskation, kein echtes Cfx-Escrow.

### Changed
- **On-Duty-Unit-Listen:** Spieler mit demselben Callsign werden zu **einer Unit**
  zusammengeführt; in der Dispatch-Konsole sind **LEO und Fire/EMS getrennt**
  gelistet, mit Sortier-Optionen (Callsign natürlich / Status / Default).
- **Eigener Status per Dropdown** im Command-Bar setzbar (alle rollen-gültigen Codes).
- **Dispatch sendet nur noch aktive Calls** an die Clients (`BuildCallList`) — das
  verhindert eine riesige NUI-Payload und sorgt dafür, dass neue Incidents zuverlässig
  in Calls-Tab und Dispatcher erscheinen.
- **Comments doppeln als Aktivitäts-/Audit-Log:** Zuweisungen und Disposition werden
  zusätzlich ins sichtbare Incident-Protokoll geschrieben; ein resolvter Incident
  bleibt nach „Clear Incident" sichtbar.
- **Unit-Location** (Straßenname) wird mit der Position mitgesendet und in der
  UNITS-Ansicht angezeigt.
- `fxmanifest.lua` auf reine String-Literale umgestellt (keine `local`-Variablen
  mehr) — behebt „failed to parse fxmanifest" beim Cfx-/Keymaster-Upload.

### Fixed
- **Devmode:** Traffic/C6/Manual-Incidents, Dispatcher-Assign/Status und Resolve
  funktionieren jetzt auch ohne On-Duty (Fallback-Callsign) statt still
  fehlzuschlagen; Nicht-Units bekommen eine On-Screen-Meldung.
- **`/char` & Session:** das Absenden von `/char` setzt jetzt den Session-Nick → man
  kann danach der RP-Session beitreten (vorher blieb man hängen). Vehicles werden
  beim Char-Erstellen zurückgesetzt.
- **Query im White-Mode:** Suchergebnisse waren weiß auf hell (unsichtbar) → behoben.
- **Dispatcher-UI passt in den Screen** (Layout-Overflow behoben) und der
  `DispatchMapStyle` aus der Config greift jetzt wirklich.
- **CI:** CfxLua-Backtick-Hashes (`` `WEAPON_UNARMED` ``) durch `GetHashKey(...)`
  ersetzt (brachen luacheck **und** luamin); luacheck-Config bereinigt (`.luarocks`
  ausgeschlossen).

### Performance
- Mehrere dauerhafte `Wait(0)`-Client-Loops schlafen jetzt im Idle (Headlight,
  Anti-Whip, Weapon-Drop, Mask, Seatbelt, Drag, Report-Queue) → niedrigere
  Resource-Last.
- **`data/calls.json` wird beim Serverstart geprunt** (resolvte Incidents älter als
  `CallRetentionDays`, Default 7) + einmaliges Backup; neue Incidents bekommen
  `createdAtUnix`.

### Removed
- Alte Vanilla-JS-NUI (`nui/index.html`, `nui/mdt/js/app.js`, `nui/mdt/css/`) sowie
  tote `.bak`-Dateien entfernt — durch den Svelte-Build ersetzt.

## [Unreleased] – 2026-06-02 — MDT, Dispatch & CAD

Großer Ausbau und Redesign des **MDT-, Dispatch- und CAD-Systems** im Stil des
„LACORE Mobile Client" (Police-CAD-Look), inklusive Kommentaren und einem
admin-only Audit-Log.

### Added
- **MDT (Mobile Data Terminal)** komplett im CAD-Look (Hochformat,
  In-Vehicle-Terminal, bottom-right): Icon-Toolbar (Home/Query/Traffic/C6/Calls/
  Units/Persons/Station/Dispo), Kommando-/Status-Strip (Dept · Callsign · Status ·
  GPS · Zeit), linke Tab-Spalte, **„Active Incident"-Feldmaske**, **Comments/
  Narrative**-Feld und untere Aktionsleiste. Getrennt von der Dispatch-Konsole
  (`/mdt` vs. `/dispatch open`).
- **Dispatch-Konsole** (Fullscreen) im gleichen Look: echte **GTA-V-Kartenkacheln**
  (Leaflet, `nui/mdt/map/styleAtlas`), **Live-Unit-Marker** (Name + GPS-Position),
  **Incident-Marker**, Klick-Zuweisung von Einheiten (Auto-Enroute + GPS), Status
  setzen und Calls auflösen direkt aus der Konsole.
- **Kommentare (IC):** Einheiten können zeitgestempelte Kommentare an einen
  Incident schreiben (`mdt:AddComment`); sie erscheinen im Comments-Log und werden
  live auf allen offenen Terminals aktualisiert. Autor/Callsign werden serverseitig
  gesetzt (kein Spoofing), Text wird bereinigt und begrenzt.
- **Admin-Audit (OOC):** neues, rein serverseitiges Modul
  `modules/mdt/mdt-audit-sv.lua`. Speichert pro Call **wer** ihn erstellt hat (inkl.
  Identifiers: license/discord/steam …), **wann** (UTC), **wo** (Koordinaten +
  Postal + Adresse) und eine **Timeline** (Zuweisungen, State-Änderungen, Notes,
  Comments) in `data/call_audit.json`. **Wird nie an Clients/NUI gesendet.**
  Admin-Befehl **`calllog <incidentNumber>`** (Server-Konsole immer, in-game via
  Ace `command.calllog`).
- **„Active Incident" beim Öffnen laden:** `mdt:GetMyActiveCall` lädt den aktuell
  zugewiesenen Incident des Spielers **serverautoritativ** ins MDT; Self-Assign
  befüllt das Panel sofort; leert sauber, wenn kein Incident zugewiesen ist.
- **Traffic-/C6-Toolbar-Buttons** im MDT funktionsfähig: erstellen einen Incident
  für die Einheit im Format `<UNIT> // TRAFFIC STOP // <LOCATION>` bzw.
  `<UNIT> // CODE6 // <LOCATION>`, hängen die Einheit an (Status ON SCENE/CODE SIX)
  und öffnen ihn direkt im „Active Incident"-Panel zum Kommentieren
  (`mdt:CreateUnitIncident`).
- **Bürger-/Charakter-Datensystem** (serverseitig, persistent in
  `data/civilians.json`): `/char` öffnet ein NUI-Formular für Name, Geburtsdatum,
  Adresse, Führerschein-Status und Haftbefehl (aktiv + Grund). Reminder beim Spawn
  (Chat + oben rechts). Neue Module `modules/mdt/mdt-civilian-{cl,sv}.lua`.
- **MDT-Query** (Beamten-„Run"): der **Query**-Tab fragt eine Person per Name oder
  Server-ID ab und zeigt Adresse, DL, Warrant (rot hervorgehoben) und registrierte
  Fahrzeuge. Wird jemand abgefragt, der keine Daten hinterlegt hat, öffnet sich bei
  ihm automatisch das `/char`-Popup.
- **Fahrzeug-Registrierung:** beim Einsteigen in ein nicht registriertes Fahrzeug
  erscheint eine Erinnerung (oben rechts); `/vreg` öffnet ein Popup zum Hinterlegen
  des Fahrzeugs (Kennzeichen → Profil). Keine harte Fahrsperre (nur Erinnerung).
- **1:1-CAD-Layout** (max. spec): zweizeilige Command-Bar mit Dropdowns
  (Incident / Logged in / Unread / Night / In Vehicle / Status / GPS Online), volle
  CAD-Feldmaske (Mod Circum, Loc Name, Apt/Unit, Report #, City, Description, Cross
  Streets, Call Initiated, Beat), Icons in der linken Leiste, `< >`-Incident-
  Navigation und exakte Bottom-Bar (Close View / Primary Unit / Import to Incident /
  Locate on Mobile Map). Echte Toolbar-Icons unter `nui/mdt/icons/`
  (Plate / STOP / Pending / Radio).
- **Charakter-Profil erweitert (Merge mit `/character`):** Geschlecht,
  Körperbeschreibung (Größe/Gewicht/Haare/Augen) und voller Lizenzsatz
  (Driver/Commercial/Boating/Pilot/CCW/Hunting). `/character` ist jetzt ein Alias
  für `/char`.
- **Query per Kennzeichen:** Beamte können zusätzlich nach einem registrierten
  Kennzeichen suchen (neben Name / Server-ID).
- **Unread-Calls:** der „Unread (n)"-Chip zählt neu eingehende Calls; ungelesene
  Zeilen sind in der Calls-Liste markiert; Öffnen des Calls-Tabs (oder Klick auf den
  Chip) markiert sie als gelesen.
- **White-/Normal-Mode:** Theme-Umschalter (Knopf in der Titelleiste, gespeichert in
  `localStorage`) zwischen dem dunklen CAD-Look und einem hellen „White"-Mode
  — inkl. der `/char`- und `/vreg`-Popups. Auch als Command `/mdttheme [white|normal]`.
- **Disposition-Resolve:** Dispatch-RESOLVE mit Reason-Dropdown (ADV/ARR/ARM/CIT/
  GOA/FAL/CCB/CMP). Beim Auflösen wird `DISPO // <Uhrzeit> // <REASON> // <UNIT>` in
  die Notes geschrieben (`mdt:ResolveCall`).
- **Manuelles Incident:** Klick auf das „Incident"-Dropdown öffnet ein Fenster, in
  dem ein Officer den Anlass eintippt → erstellt ein Incident `<UNIT> // INC //
  <Text> // <Location>` an seiner Position.
- **Toolbar-Status-Buttons:** Station → UNAVAILABLE, Enroute → ENROUTE, Traffic →
  CODE SIX (+ Incident), Code 6 → CODE SIX (+ Incident).
- Toolbar-Reihenfolge: Home · Query · Traffic · C6 · Calls · Dispatch · Enroute ·
  Station · Dispo, mit echten Icons unter `nui/mdt/icons/`.
- **Dispatch-Live-Chat:** gemeinsamer Echtzeit-Kanal zwischen Einheiten (MDT) und
  Dispatchern (Konsole). Dispatcher bekommen beim On-Duty eine zufällige
  **Operator-Nummer** (z. B. „Operator 4256"); Einheiten erscheinen mit ihrem
  Callsign. Schreibt eine Einheit, während ein Dispatcher die Konsole nicht offen
  hat, bekommt er eine **Benachrichtigung** (oben rechts + Sound). Chat-Panel im
  MDT (Home) und in der Dispatch-Sidebar; Verlauf wird beim Öffnen geladen.
- Branding-Assets unter `branding/`: Produktbild `pvp-core.png` und eine
  Tebex-Produktbeschreibung `tebex-description.html` (HTML-Import).

### Changed
- **Design auf „älteren" Win32-Look** umgestellt (nur MDT): flache Vollfarben statt
  Verläufe, harte 3D-Bevel-Ränder, System-Font (MS Sans Serif/Tahoma), eckige
  Ecken, klassische Scrollbars und ein **schwarzes CAD-Terminal** (grüner
  Monospace) für die Kommentare. Dispatch-Konsole separat im gleichen Blau-Theme.
- **Dispatch-Karte kalibriert:** Game→Pixel-Umrechnung empirisch aus `map.png`
  bestimmt (Landmarken; Skala ≈ 0,68 px/Spieleinheit, Offsets statt symmetrischer
  −4096..4096-Bounds) → Marker sitzen jetzt korrekt. `bounds` am TileLayer ergänzt
  (kein weißer Rand um die Insel mehr).
- Voll- und periodischer Sync liefern **Unit-Positionen dauerhaft**
  (`BuildUnitList`/`BuildCallList`); **neueste Incidents zuerst**; max. **10**
  Incident-Marker auf der Karte.
- `GetPostalCoords` nutzt jetzt einen **O(1)-Index** (Memoization) statt linearer
  Suche — verhindert Ruckler beim Coords-Backfill vieler Calls.
- Neue Calls speichern ein `comments`-Feld.

### Fixed
- **Incident-Marker fehlten:** Alt-Calls aus `calls.json` ohne Koordinaten bekommen
  ihre Position jetzt über den **Postal-Code** (`EnsureCallCoords` +
  `GetPostalCoords`) — 704/706 Postals abgedeckt.
- **Karten-Offset:** Marker landeten im Ozean (falsche, symmetrische Bounds) →
  korrekte, asymmetrische Kalibrierung.
- `SetNuiFocus is not defined` in der NUI entfernt (NUI-Fokus wird nur in Lua
  gesetzt).
- Calls/Units wurden im Dispatcher nicht geladen (Sync prüfte nur `mdtNuiOpen`) →
  `or dispatchOpen` + 1-s-Retry beim Öffnen.
- Unit-Koordinaten waren nur temporär (periodischer Sync überschrieb sie ohne
  x/y/z) → einheitliche Helfer.
- **`leo-only`/`ems-only`-Buttons** (CODE 6, Crime Broadcast) wurden nie angezeigt
  (Inline-`display=''` fiel auf CSS `none` zurück) → Klassen-Toggle `.role-hidden`.
- Active-Incident-Daten erschienen nicht beim Zuweisen bzw. erneuten Öffnen → über
  `mdt:GetMyActiveCall` und Befüllen bei Self-Assign behoben.

### Removed
- Temporärer Map-Debug-Modus (gelber Marker + Koordinaten-Overlay), nachdem die
  Kalibrierung verifiziert war.

## [Unreleased] – 2026-06-01

Großes Refactoring von Sicherheit, Struktur und Konfiguration. Es wurde **kein
Gameplay-Verhalten** absichtlich geändert.

> ⚠️ **Migration erforderlich:** Discord-Webhooks liegen nicht mehr im Code,
> sondern werden aus Convars gelesen. Siehe `server.cfg.example` und trage die
> `set pvp_webhook_*`-Werte in deine `server.cfg` ein, sonst ist das
> Discord-Logging deaktiviert. Die alten, im Code hinterlegten Webhooks gelten
> als kompromittiert und sollten in Discord **neu generiert** werden.

### Security
- Berechtigungsprüfungen für client-auslösbare Server-Events ergänzt: `jailServer`,
  `coronerServer`, `hospitalServer`, `cuffPlayer`, `dragPlayer`,
  `putPlayerInVehicle` prüfen jetzt Job/Staff und die Existenz des Ziels.
  Zuvor konnte **jeder** Client diese Aktionen gegen beliebige Spieler auslösen.
- Sämtliche hartkodierten Discord-Webhook-URLs aus dem Code entfernt (waren über
  `server.lua`, `phone-sv.lua`, `pages-sv.lua`, `bleeter-sv.lua` verteilt) und
  durch server-seitige Convars ersetzt (werden nicht an Clients gesendet).

### Fixed
- Ban-/Warn-Grund wurde durch eine globale Variable statt den `reason`-Parameter
  gespeichert → falscher/zufälliger Grund in der Banliste.
- Server-Start-Crash bei leerer `calls.json` (nil-Index) abgefangen.
- Falscher Event-Name: `responseSpecialContact`-Handler hing am Event
  `relaySpecialContact` (lief doppelt beim Notruf, nie bei der Antwort).
- Operator-Präzedenzfehler im Explosions-Filter (`~= nil and ... or ...`).
- Mögliche Endlosschleife bei der Discord-Rollenabfrage (Wert wurde in der
  `while`-Schleife nie neu geladen).
- Echtes Lock (`while` statt `if`) für Ban-/Warn-/Unban-Schreibzugriffe auf
  `banlist.json` (verhinderte verlorene Schreibvorgänge bei Parallelität).
- `PerformHttpRequest(ServerLog, ...)` (Tabelle als URL) in mehreren Modulen
  durch `LogWebhook(Webhooks.ServerLog, ...)` ersetzt.
- `LogWebhook` ignoriert nun leere/`nil`-URLs.

### Changed
- **Ordnerstruktur** eingeführt: `client/`, `server/`, `shared/` sowie `data/`
  für zur Laufzeit geschriebene JSON-Dateien (`banlist`, `calls`, `address`,
  `bleets`). Alle Datei-Pfade und das Manifest entsprechend angepasst.
- **`client.lua` (≈5485 Zeilen) in 13 fokussierte Module aufgeteilt** unter
  `client/`: `core`, `util`, `plates`, `menus`, `events`, `drawtext`, `world`,
  `blips`, `vehicle`, `hud`, `loops`, `commands`, `weapons`. Ladereihenfolge ist
  explizit im Manifest festgelegt. Aufteilung erfolgte verlustfrei (per
  byte-identischem bzw. zeilen-multiset-identischem Abgleich verifiziert).
- Dateiübergreifend benötigte `local`-Variablen zu Globals gemacht, damit der
  Split in FiveM (getrennte Lua-Chunks) korrekt funktioniert.
- FiveM-Antipattern `RegisterServerEvent("name", strayArg)` an 18 Stellen
  bereinigt (überflüssiges zweites Argument entfernt).
- Debug-`print`-Ausgaben entfernt (u. a. Spam in einer `Wait(0)`-Schleife).
- Diverse lose globale Schleifenvariablen lokalisiert.

### Added
- `configs/cfg-server-sv.lua` – zentrale, kommentierte Server-Konfiguration
  (Webhooks & `devmode` über Convars).
- `server.cfg.example` – Vorlage mit allen `set pvp_*`-Convars.
- `README.md` – Abhängigkeiten, Installation, Konfiguration, Projektstruktur.
- Git-Repository als Sicherheitsnetz initialisiert; jeder Schritt als eigener Commit.

### Security-Hinweis (offen)
- `ondutyServer` ist weiterhin ungeschützt – Jobs sind selbst zuweisbar, wodurch
  die o. g. Job-Checks keinen harten Schutzwall bilden. Empfehlung: Department-
  Zuweisung per Discord-Rolle whitelisten.
