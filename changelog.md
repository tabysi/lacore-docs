# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.
Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [Unreleased] – Security hardening

### Added
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

### Fixed
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

### Security
- **NADS: server-side staff gate.** `AddNADSStreet` now requires `HasPermission(src, "nads")`
  (staff / dev bypass) — the client-only `player.staff` check could be bypassed by a crafted event
  to inject addresses or spam the Discord webhook. The payload is also type-checked.
- **LASD / EMS unit registration gated to job.** `lasd:Register` and `ems:Register` now require an
  on-duty LEO / Fire-EMS-Coroner (or staff) via `PlayerIsAuthorized`. Previously any client could
  register as a unit and then pass every `IsLasdUnit` / `IsEmsUnit` gate — creating incidents,
  running **record queries**, changing status, etc.

### Robustness
- **Guarded `json.decode`.** The player-list KVP restore (server boot), the character KVP restore
  (`/character`), and the legacy phone screenshot-upload response are now wrapped in `pcall` with
  type checks, so a corrupt value can't throw during boot or at runtime.

### Changed — console hygiene
- **Gated debug logging.** New shared `Debug(...)` / `IsDebug()` helper (off by default). Developer
  trace `print()`s — most notably the client boot sequence in `world-cl.lua` (~25 lines that spammed
  every player's F8 console) plus vehicle/plates/CCTV/weapons/events traces and a couple of server
  score/AOP dumps — now route through `Debug()`. Enable with `setr lacore_debug 1`. **Intentional
  output is kept as `print()`**: security/IP-lock alerts, DB & startup status, missing-dependency
  warnings, `/lacore` diagnostics and the already-gated `CDbg` call-center helper.

## [3.1.6] – Speech-to-Text Radio Transcript (experimental — disabled by default)

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
- Neues **Agency-MDT** (`web/.../AgencyMdt.svelte`) im **CHP/PremierOne-IMPACT-Stil**
  (dunkelblau) für **jede Exekutive außer LAPD und LASD**. Nachgebaut aus den
  Referenzbildern in `preview/`: Funktionsleiste (FOLLOW/STOP/10-6·10-99/11-27/10-28/
  CALLS/UNITS/WATCH LIST/MAIL·RETURNS) + Status, **ACTIVE/PENDING CALLS**, Incident-
  Detail (Header + INC#, Feldraster, Tabs UNITS/INFO/CALLER/PRIORS, COMMENTS + Add),
  rechte Aktionsleiste (SELF-ASSIGN/MAP IT/GET ROUTE/AUTO ZOOM/MORE), Units- und
  Query-Ansicht.
- **Re-Skin, kein eigenes Backend:** nutzt exakt dieselben geteilten Daten/Actions
  wie das LAPD-MDT (`S.calls`/`activeCall`/`units`, `selectCall`/`addComment`/
  `setStatus`/`selfAssign`/`setGps`/`requestBackup`).
- **Routing (`mdt-nui-cl.lua`):** `/mdt` → LAPD = PremierOne-MDT · LASD/Sheriff/BCSO =
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
  Fire/EMS, Coroner, BCSO, …). Nur das LAPD nutzt weiterhin das PremierOne-MDT
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

## [3.0.5d] – 2026-06-11 — Vollständige Lokalisierung, Config-Ausbau & Härtung

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

## [3.0.3] – 2026-06-05 — Svelte-NUI, CAD-Ausbau & Escrow

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
- **Query im PremierOne-Stil:** linker Query-Typ-Rail (Person / Vehicle / Plate),
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
„PremierOne Mobile Client" (echtes Police-CAD), inklusive Kommentaren und einem
admin-only Audit-Log.

### Added
- **MDT (Mobile Data Terminal)** komplett im PremierOne-CAD-Look (Hochformat,
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
- **1:1-PremierOne-Layout** (max. spec): zweizeilige Command-Bar mit Dropdowns
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
  `localStorage`) zwischen dem dunklen PremierOne-Look und einem hellen „White"-Mode
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
