// Data model for the interactive Config Editor (components/ConfigWizard.jsx).
// Each section is one step in the wizard. Each field knows which config file it
// belongs to and how to render itself as a Lua assignment (or a server.cfg convar),
// so the wizard can assemble a ready-to-paste config at the end.
//
// field.type:  'bool' | 'number' | 'text' | 'select'
// field.path:  the Lua assignment target, e.g. 'PhoneCfg.useNui' or 'GameMinuteSeconds'.
//              These are appended at the END of the target file, where the table/global
//              already exists, so a re-assignment cleanly overrides the default.
// field.file:  the config file the generated line is grouped under.

export const SECTIONS = [
  {
    id: 'branding',
    title: 'Branding',
    icon: '🏷️',
    intro:
      'Your community name, shown everywhere in-game (MDT headers, phone, notifications). ' +
      'This is the first thing to change — nothing here should say “LACORE” on your server.',
    file: 'configs/cfg-branding-sh.lua',
    fields: [
      { id: 'brand_label', file: 'configs/cfg-branding-sh.lua', path: 'Branding.label',
        type: 'text', default: 'LACORE', label: 'Short label',
        help: 'Short name used in tight UI spots (badges, titles). Keep it short, e.g. “LACORE” or “PVRP”.' },
      { id: 'brand_community', file: 'configs/cfg-branding-sh.lua', path: 'Branding.community',
        type: 'text', default: 'LACORE Roleplay', label: 'Full community name',
        help: 'Full community/server name used in longer text, e.g. “Los Angeles Roleplay”.' },
    ],
  },

  {
    id: 'gameplay',
    title: 'World & Gameplay',
    icon: '🌎',
    intro:
      'The main gameplay knobs from config.lua: time speed, language, database, and the dispatch map look.',
    file: 'configs/config.lua',
    fields: [
      { id: 'game_min', file: 'configs/config.lua', path: 'GameMinuteSeconds',
        type: 'number', default: 8, label: 'Real seconds per in-game minute',
        help: '8 → a full day ≈ 3.2 real hours. 60 = real time (1:1). Lower = faster day/night cycle.' },
      { id: 'sync_time', file: 'configs/config.lua', path: 'SyncGameTime',
        type: 'bool', default: true, label: 'LACORE owns the world clock',
        help: 'Keep ON so the time advances smoothly for everyone and /time works. Turn OFF only if ANOTHER resource controls the time.' },
      { id: 'language', file: 'configs/config.lua', path: 'Language',
        type: 'select', default: 'en', options: [['en', 'English'], ['de', 'Deutsch'], ['ru', 'Русский']],
        label: 'Language (server & HUD)',
        help: 'Locale for all server/HUD text. Supported out of the box: English, German, Russian.' },
      { id: 'mdt_language', file: 'configs/config.lua', path: 'MdtLanguage',
        type: 'select', default: '', options: [['', 'Follow main language'], ['en', 'English'], ['de', 'Deutsch'], ['ru', 'Русский']],
        label: 'MDT / NUI language',
        help: 'Separate language just for the MDT / Dispatch / Profile UI. Leave on “Follow” to use the main language.' },
      { id: 'use_db', file: 'configs/config.lua', path: 'UseDatabase',
        type: 'bool', default: true, label: 'Mirror data to MySQL (oxmysql)',
        help: 'ON = every store is mirrored to MySQL AND kept as local JSON. OFF = local JSON only. Needs oxmysql when ON.' },
      { id: 'third_eye', file: 'configs/config.lua', path: 'ThirdEye',
        type: 'bool', default: true, label: 'ox_target interactions',
        help: 'Enable ox_target player interactions (cuff / drag / medic / carry …). Requires ox_target. Chat commands still work either way.' },
      { id: 'trains', file: 'configs/config.lua', path: 'trainsEnabled',
        type: 'bool', default: true, label: 'Metro trains',
        help: 'Enable metro trains. Only metros by default — other train types can bug out.' },
      { id: 'map_style', file: 'configs/config.lua', path: 'DispatchMapStyle',
        type: 'select', default: 'styleGrid', options: [['styleGrid', 'Grid'], ['styleAtlas', 'Atlas'], ['styleSatelite', 'Satellite']],
        label: 'Dispatch map style', help: 'Tile style for the dispatch map.' },
      { id: 'retention', file: 'configs/config.lua', path: 'CallRetentionDays',
        type: 'number', default: 7, label: 'Keep resolved calls (days)',
        help: 'How many days resolved dispatch incidents are kept before pruning. Active incidents are always kept.' },
      { id: 'incident_blips', file: 'configs/config.lua', path: 'ShowIncidentBlips',
        type: 'bool', default: false, label: 'Map blip per active incident',
        help: 'Show a GTA map blip for every active incident to on-duty units.' },
    ],
  },

  {
    id: 'callcenter',
    title: 'Call Center (911/311)',
    icon: '☎️',
    intro: 'The incoming 911 / 311 call queue in config.lua.',
    file: 'configs/config.lua',
    fields: [
      { id: 'cc_enabled', file: 'configs/config.lua', path: 'CallCenter.Enabled', type: 'bool', default: true, label: 'Enable 911/311', help: 'Master switch for the call-center system.' },
      { id: 'cc_voice', file: 'configs/config.lua', path: 'CallCenter.UseVoice', type: 'bool', default: true, label: 'Voice calls', help: 'Connect caller ↔ dispatcher via pma-voice.' },
      { id: 'cc_autoinc', file: 'configs/config.lua', path: 'CallCenter.AutoIncident', type: 'bool', default: true, label: 'Auto-create incident', help: 'Auto-create an MDT incident when no dispatcher is online.' },
      { id: 'cc_cmds', file: 'configs/config.lua', path: 'CallCenter.AllowCommands', type: 'bool', default: true, label: '/911 & /311 commands', help: 'Allow the chat commands in addition to the phone app.' },
      { id: 'cc_maxlogs', file: 'configs/config.lua', path: 'CallCenter.MaxCallLogs', type: 'number', default: 500, label: 'Archived call logs', help: 'How many past calls are kept in data/call_logs.json.' },
      { id: 'cc_debug', file: 'configs/config.lua', path: 'CallCenter.Debug', type: 'bool', default: true, label: 'Debug prints', help: 'Verbose 911/311 flow prints — set false in production.' },
    ],
  },

  {
    id: 'mdt',
    title: 'MDT',
    icon: '🚓',
    intro: 'Options for the Mobile Data Terminals (all open through /mdt, default key O).',
    file: 'configs/cfg-mdt-sh.lua',
    fields: [
      { id: 'mdt_requirevehicle', file: 'configs/cfg-mdt-sh.lua', path: 'MdtConfig.requireVehicle', type: 'bool', default: false, label: 'Only open in a vehicle', help: 'Realism: require the officer to be in a vehicle to OPEN an MDT (any seat). An open MDT still closes on foot; devmode bypasses.' },
    ],
  },

  {
    id: 'features',
    title: 'Feature Toggles',
    icon: '🎛️',
    intro:
      'Turn whole components on or off. Want to run ONLY the MDT/CAD? Turn everything else off here. ' +
      'A disabled feature simply doesn’t load — no commands, no threads, ~0 ms cost.',
    file: 'configs/cfg-features-sh.lua',
    fields: [
      { id: 'f_cad', file: 'configs/cfg-features-sh.lua', path: 'Features.cad.enabled',
        type: 'bool', default: true, label: 'Police CAD suite (master)',
        help: 'The whole police CAD suite. Turn off to remove LAPD + LASD + dispatch + BOLO at once.' },
      { id: 'f_lapd', file: 'configs/cfg-features-sh.lua', path: 'Features.cad.lapd', type: 'bool', default: true, label: '· LAPD MDT', help: 'LAPD PremierOne MDT.' },
      { id: 'f_lasd', file: 'configs/cfg-features-sh.lua', path: 'Features.cad.lasd', type: 'bool', default: true, label: '· LASD CAD', help: 'LASD CAD / PCMS.' },
      { id: 'f_ems', file: 'configs/cfg-features-sh.lua', path: 'Features.cad.ems', type: 'bool', default: true, label: '· EMS / Fire CAD', help: 'EMS / Fire CAD.' },
      { id: 'f_dispatch', file: 'configs/cfg-features-sh.lua', path: 'Features.cad.dispatch', type: 'bool', default: true, label: '· Dispatch console', help: 'The /dispatch console.' },
      { id: 'f_bolo', file: 'configs/cfg-features-sh.lua', path: 'Features.cad.bolo', type: 'bool', default: true, label: '· BOLO system', help: 'Be-On-the-Look-Out alerts.' },
      { id: 'f_phone', file: 'configs/cfg-features-sh.lua', path: 'Features.phone', type: 'bool', default: true, label: 'Phone', help: 'The LACORE NUI phone.' },
      { id: 'f_airunit', file: 'configs/cfg-features-sh.lua', path: 'Features.airunit', type: 'bool', default: true, label: 'Air Unit', help: 'Helicopter heli-cam.' },
      { id: 'f_cctv', file: 'configs/cfg-features-sh.lua', path: 'Features.cctv', type: 'bool', default: true, label: 'CCTV', help: 'CCTV surveillance + field cameras.' },
      { id: 'f_corrections', file: 'configs/cfg-features-sh.lua', path: 'Features.corrections', type: 'bool', default: true, label: 'Corrections / Jail', help: 'Jail / corrections system.' },
      { id: 'f_impound', file: 'configs/cfg-features-sh.lua', path: 'Features.impound', type: 'bool', default: true, label: 'Impound', help: 'Impound lot.' },
      { id: 'f_k9', file: 'configs/cfg-features-sh.lua', path: 'Features.k9', type: 'bool', default: true, label: 'K9', help: 'K9 unit.' },
      { id: 'f_field', file: 'configs/cfg-features-sh.lua', path: 'Features.field', type: 'bool', default: true, label: 'Field tools', help: 'Field essentials (breathalyser …).' },
      { id: 'f_nads', file: 'configs/cfg-features-sh.lua', path: 'Features.nads', type: 'bool', default: true, label: 'New Address System', help: 'Street/address labelling.' },
      { id: 'f_stt', file: 'configs/cfg-features-sh.lua', path: 'Features.stt', type: 'bool', default: true, label: 'Radio speech-to-text', help: 'Experimental push-to-talk radio STT.' },
      { id: 'f_admin', file: 'configs/cfg-features-sh.lua', path: 'Features.admin', type: 'bool', default: true, label: 'Staff tools', help: 'Big Brother log + admin menu.' },
      { id: 'f_webdispatch', file: 'configs/cfg-features-sh.lua', path: 'Features.webdispatch', type: 'bool', default: true, label: 'Web dispatcher', help: 'External web dispatcher bridge.' },
      { id: 'f_civilian', file: 'configs/cfg-features-sh.lua', path: 'Features.civilian.enabled', type: 'bool', default: true, label: 'Civilian systems', help: 'Emotes / props / orgs / turf.' },
      { id: 'f_extras', file: 'configs/cfg-features-sh.lua', path: 'Features.extras.enabled', type: 'bool', default: true, label: 'Extras', help: 'Misc gameplay: props, stretcher, trains, death-sync.' },
    ],
  },

  {
    id: 'access',
    title: 'Access Control',
    icon: '🔐',
    intro:
      'LACORE’s own gatekeeping. On a framework server (ESX / QBCore / QBox) that manages identity and ' +
      'permissions itself, you can switch both of these off.',
    file: 'configs/cfg-server-sv.lua',
    fields: [
      { id: 'ac_whitelist', file: 'configs/cfg-server-sv.lua', path: 'AccessControl.whitelist',
        type: 'bool', default: true, label: 'Members-only whitelist',
        help: 'The /wl members-only join gate. OFF = disabled entirely: /wl does nothing and no one is rejected for “members only”. Bans still apply.' },
      { id: 'ac_discord', file: 'configs/cfg-server-sv.lua', path: 'AccessControl.discordRoles',
        type: 'bool', default: true, label: 'Discord role auth + ACE bridge',
        help: 'OFF = no Discord required at connect, no Discord roles read, no Discord→ACE bridge. Duty gating is skipped and Staff/Dev come from ACE / txAdmin. Recommended OFF on ESX/QB servers.' },
      { id: 'ac_minname', file: 'configs/cfg-server-sv.lua', path: 'AccessControl.minNameLength',
        type: 'number', default: 3, label: 'Min player-name length', help: 'Reject names shorter than this at connect. 0 = no minimum.' },
      { id: 'ac_maxname', file: 'configs/cfg-server-sv.lua', path: 'AccessControl.maxNameLength',
        type: 'number', default: 20, label: 'Max player-name length', help: 'Reject names longer than this at connect. Raise it (or 0 = no limit) if long Steam names get rejected.' },
    ],
  },

  {
    id: 'penalcode',
    title: 'Penal Code',
    icon: '⚖️',
    intro:
      'The charge list used by citations, arrest reports and the fine/jail calculation. Edit the rows, ' +
      'add your own charges, or remove ones you don’t use. class: I = Infraction, M = Misdemeanor, ' +
      'F = Felony · fine in USD · jail in months (0 = none).',
    file: 'configs/cfg-charges-sh.lua',
    list: {
      path: 'PenalCode',
      replace: true, // paste REPLACES the existing block (the file rebuilds PenalCodeByCode right after)
      addLabel: 'Add charge',
      newRow: { code: '', title: '', class: 'M', fine: 0, jail: 0 },
      columns: [
        { key: 'code', label: 'Code', type: 'text', width: 72 },
        { key: 'title', label: 'Title', type: 'text', grow: true },
        { key: 'class', label: 'Class', type: 'select', options: [['I', 'I — Infraction'], ['M', 'M — Misdemeanor'], ['F', 'F — Felony']], width: 150 },
        { key: 'fine', label: 'Fine $', type: 'number', width: 90 },
        { key: 'jail', label: 'Jail (mo)', type: 'number', width: 90 },
      ],
      defaults: [
        { code: 'T1', title: 'Speeding (1-15 over)', class: 'I', fine: 150, jail: 0 },
        { code: 'T2', title: 'Speeding (16-25 over)', class: 'I', fine: 250, jail: 0 },
        { code: 'T3', title: 'Reckless Driving', class: 'M', fine: 500, jail: 0 },
        { code: 'T4', title: 'Failure to Stop (Red/Stop)', class: 'I', fine: 150, jail: 0 },
        { code: 'T5', title: "No Valid Driver's License", class: 'M', fine: 400, jail: 0 },
        { code: 'T6', title: 'Illegal Parking', class: 'I', fine: 75, jail: 0 },
        { code: 'M1', title: 'Disturbing the Peace', class: 'M', fine: 250, jail: 0 },
        { code: 'M2', title: 'Trespassing', class: 'M', fine: 350, jail: 1 },
        { code: 'M3', title: 'Public Intoxication', class: 'M', fine: 200, jail: 0 },
        { code: 'M4', title: 'Resisting a Peace Officer', class: 'M', fine: 750, jail: 2 },
        { code: 'M5', title: 'Petty Theft', class: 'M', fine: 500, jail: 1 },
        { code: 'M6', title: 'Possession (Controlled Subst.)', class: 'M', fine: 600, jail: 2 },
        { code: 'F1', title: 'Grand Theft Auto', class: 'F', fine: 2000, jail: 8 },
        { code: 'F2', title: 'Assault w/ Deadly Weapon', class: 'F', fine: 3000, jail: 12 },
        { code: 'F3', title: 'Armed Robbery (211)', class: 'F', fine: 5000, jail: 20 },
        { code: 'F4', title: 'Evading a Peace Officer', class: 'F', fine: 2500, jail: 10 },
        { code: 'F5', title: 'Possession of a Firearm (illegal)', class: 'F', fine: 4000, jail: 15 },
        { code: 'F6', title: 'Kidnapping', class: 'F', fine: 6000, jail: 25 },
        { code: 'F7', title: 'Murder (187)', class: 'F', fine: 10000, jail: 60 },
      ],
    },
  },

  {
    id: 'hud',
    title: 'HUD',
    icon: '🖥️',
    intro:
      'LACORE’s on-screen HUD. Turn the whole thing off if you run another HUD (e.g. C7), or disable ' +
      'individual elements. Each is independent.',
    file: 'configs/cfg-hud-sh.lua',
    fields: [
      { id: 'hud_enabled', file: 'configs/cfg-hud-sh.lua', path: 'HudCfg.enabled', type: 'bool', default: true, label: 'HUD master switch', help: 'OFF = the entire LACORE HUD is disabled (nothing below renders). Use this to run your own HUD.' },
      { id: 'hud_pld', file: 'configs/cfg-hud-sh.lua', path: 'HudCfg.pld', type: 'bool', default: true, label: 'Player Location Display', help: 'The street / AOP / alert / compass / time overlay at the bottom (the "PLD").' },
      { id: 'hud_vehicle', file: 'configs/cfg-hud-sh.lua', path: 'HudCfg.vehicle', type: 'bool', default: true, label: 'Vehicle HUD', help: 'Speed, fuel, gear and the seatbelt indicator while driving.' },
      { id: 'hud_playerlist', file: 'configs/cfg-hud-sh.lua', path: 'HudCfg.playerlist', type: 'bool', default: true, label: 'Player list', help: 'The scoreboard shown while holding the player-list key.' },
      { id: 'hud_nameplates', file: 'configs/cfg-hud-sh.lua', path: 'HudCfg.nameplates', type: 'bool', default: true, label: 'Nameplates', help: 'Names drawn above nearby players (shown with the player list).' },
    ],
  },

  {
    id: 'notifications',
    title: 'Notifications',
    icon: '🔔',
    intro:
      'How every LACORE on-screen notice looks. Keep the built-in premium toasts, switch to native GTA, ' +
      'or route to your own notify resource.',
    file: 'configs/cfg-notify-sh.lua',
    fields: [
      { id: 'notify_mode', file: 'configs/cfg-notify-sh.lua', path: 'NotifyCfg.mode',
        type: 'select', default: 'lacore',
        options: [['lacore', 'LACORE premium toasts'], ['gta', 'Native GTA feed'], ['custom', 'Custom notify resource']],
        label: 'Notification style',
        help: 'lacore = built-in NUI toasts. gta = native lore-friendly feed. custom = your own handler (wire it in cfg-notify-sh.lua).' },
      { id: 'notify_gtatitle', file: 'configs/cfg-notify-sh.lua', path: 'NotifyCfg.gtaShowTitle',
        type: 'bool', default: true, label: 'Show title line (GTA mode)',
        help: 'In “gta” mode, show a bold title line above the message when one is provided.' },
    ],
  },

  {
    id: 'phone',
    title: 'Phone',
    icon: '📱',
    intro: 'The LACORE NUI phone — which apps are available and how it opens. RP-only (no banking app).',
    file: 'configs/cfg-phone-sh.lua',
    fields: [
      { id: 'ph_usenui', file: 'configs/cfg-phone-sh.lua', path: 'PhoneCfg.useNui', type: 'bool', default: true, label: 'Use the new NUI phone', help: 'ON = the modern NUI phone. OFF = the legacy scaleform phone.' },
      { id: 'ph_key', file: 'configs/cfg-phone-sh.lua', path: 'PhoneCfg.openKey', type: 'text', default: 'F1', label: 'Open key', help: 'Default open/close key. Players can rebind it in FiveM keybind settings.' },
      { id: 'ph_nick', file: 'configs/cfg-phone-sh.lua', path: 'PhoneCfg.requireNick', type: 'bool', default: true, label: 'Require an RP nick', help: 'Require a set RP nick before the phone opens (devmode bypasses).' },
      { id: 'ph_prefix', file: 'configs/cfg-phone-sh.lua', path: 'PhoneCfg.numberPrefix', type: 'text', default: '555', label: 'Phone-number prefix', help: 'Prefix for generated phone numbers, e.g. 555-0142.' },
      { id: 'ph_eyefind', file: 'configs/cfg-phone-sh.lua', path: 'PhoneCfg.eyefindUrl', type: 'text', default: 'https://lacore.gg', label: 'Eyefind browser home', help: 'The in-phone browser home page — point it at YOUR community, never a foreign site.' },
      { id: 'ph_app_dispatch', file: 'configs/cfg-phone-sh.lua', path: 'PhoneCfg.apps.dispatch', type: 'bool', default: true, label: 'App · Emergency (911/311)', help: 'The 911/311 report app.' },
      { id: 'ph_app_camera', file: 'configs/cfg-phone-sh.lua', path: 'PhoneCfg.apps.camera', type: 'bool', default: true, label: 'App · Camera', help: 'Camera + gallery (needs screenshot-basic).' },
      { id: 'ph_app_social', file: 'configs/cfg-phone-sh.lua', path: 'PhoneCfg.apps.social', type: 'bool', default: true, label: 'App · Social', help: 'Bleeter feed + messenger groups.' },
      { id: 'ph_app_garage', file: 'configs/cfg-phone-sh.lua', path: 'PhoneCfg.apps.garage', type: 'bool', default: true, label: 'App · Garage', help: 'Personal vehicle list.' },
      { id: 'ph_app_wallet', file: 'configs/cfg-phone-sh.lua', path: 'PhoneCfg.apps.wallet', type: 'bool', default: true, label: 'App · Wallet / ID', help: 'Digital ID / wallet.' },
    ],
  },

  {
    id: 'bridge',
    title: 'Framework Bridge',
    icon: '🔗',
    intro:
      'Interoperate with an existing framework (ESX / QBCore / QBox) so jobs and identity come from it. ' +
      'Leave on “auto” for standalone servers — it just detects nothing and stays standalone.',
    file: 'configs/cfg-bridge-sh.lua',
    fields: [
      { id: 'br_mode', file: 'configs/cfg-bridge-sh.lua', path: 'Bridge.mode',
        type: 'select', default: 'auto',
        options: [['auto', 'Auto-detect (recommended)'], ['standalone', 'Standalone (LACORE identity)'], ['esx', 'Force ESX'], ['qb', 'Force QBCore'], ['qbox', 'Force QBox']],
        label: 'Framework', help: 'auto = detect ESX/QB/QBox, else standalone. Force a specific one only if auto-detect misses it.' },
      { id: 'br_name', file: 'configs/cfg-bridge-sh.lua', path: 'Bridge.useFrameworkName', type: 'bool', default: true, label: 'Use framework character name', help: 'Pull the character name from the framework instead of the LACORE /char nickname.' },
      { id: 'br_chars', file: 'configs/cfg-bridge-sh.lua', path: 'Bridge.useFrameworkCharacters', type: 'bool', default: true, label: 'Use framework characters (ESX)', help: 'On ESX: read the whole character (name, DOB, sex, height, phone, vehicles) from the ESX database. Identity becomes read-only in LACORE. Requires oxmysql.' },
      { id: 'br_autoduty', file: 'configs/cfg-bridge-sh.lua', path: 'Bridge.autoDuty', type: 'bool', default: false, label: 'Auto-duty from job', help: 'ON = a framework job that maps to an agency instantly puts the player on duty. OFF = they still run /onduty (recommended).' },
      { id: 'br_notify', file: 'configs/cfg-bridge-sh.lua', path: 'Bridge.useFrameworkNotify', type: 'bool', default: false, label: 'Use framework notifications', help: 'Route LACORE notifications through the framework’s notify UI for a consistent look.' },
    ],
  },

  {
    id: 'cctv',
    title: 'CCTV',
    icon: '📹',
    intro: 'Surveillance viewer + placeable field cameras. Field cameras auto-group by locality.',
    file: 'configs/cfg-cctv-sh.lua',
    fields: [
      { id: 'cctv_group', file: 'configs/cfg-cctv-sh.lua', path: 'CCTV.autoGroupField', type: 'bool', default: true, label: 'Auto-group field cameras by locality', help: 'ON = placed cameras are sorted into groups by the in-game locality (Vinewood, Sandy Shores …). OFF = one flat “Field Cameras” network.' },
      { id: 'cctv_prefix', file: 'configs/cfg-cctv-sh.lua', path: 'CCTV.fieldGroupPrefix', type: 'text', default: 'Field', label: 'Field group prefix', help: 'Label shown before the locality, e.g. “Field · Vinewood”.' },
      { id: 'cctv_rot', file: 'configs/cfg-cctv-sh.lua', path: 'CCTV.rotSpeed', type: 'number', default: 70, label: 'Look speed (°/s)', help: 'WASD / arrow-key look speed while operating a camera.' },
      { id: 'cctv_scan', file: 'configs/cfg-cctv-sh.lua', path: 'CCTV.scanTime', type: 'number', default: 6000, label: 'Scan sweep time (ms)', help: 'How long the scan sweep runs before the info card is revealed. 5000–8000 feels good.' },
    ],
  },

  {
    id: 'corrections',
    title: 'Corrections / Jail',
    icon: '⛓️',
    intro: 'Server-authoritative jail. Sentences persist and arrests can auto-book.',
    file: 'configs/cfg-corrections-sh.lua',
    fields: [
      { id: 'corr_enabled', file: 'configs/cfg-corrections-sh.lua', path: 'Corrections.enabled', type: 'bool', default: true, label: 'Enable corrections', help: 'The jail / corrections system.' },
      { id: 'corr_spm', file: 'configs/cfg-corrections-sh.lua', path: 'Corrections.secondsPerMonth', type: 'number', default: 30, label: 'Real seconds per sentenced month', help: 'How long a "month" of a sentence takes in real time.' },
      { id: 'corr_min', file: 'configs/cfg-corrections-sh.lua', path: 'Corrections.minSeconds', type: 'number', default: 30, label: 'Min sentence (s)', help: 'Lower clamp on any single sentence.' },
      { id: 'corr_max', file: 'configs/cfg-corrections-sh.lua', path: 'Corrections.maxSeconds', type: 'number', default: 1200, label: 'Max sentence (s)', help: 'Upper clamp on any single sentence.' },
      { id: 'corr_autobook', file: 'configs/cfg-corrections-sh.lua', path: 'Corrections.autoBookArrests', type: 'bool', default: true, label: 'Auto-book arrests', help: 'An arrest report with jail time books the suspect automatically.' },
      { id: 'corr_persist', file: 'configs/cfg-corrections-sh.lua', path: 'Corrections.persist', type: 'bool', default: true, label: 'Persist sentences', help: 'Keep the remaining sentence across reconnects.' },
    ],
  },

  {
    id: 'impound',
    title: 'Impound',
    icon: '🚧',
    intro: 'Officers impound nearby vehicles; owners retrieve them for a fee.',
    file: 'configs/cfg-impound-sh.lua',
    fields: [
      { id: 'imp_enabled', file: 'configs/cfg-impound-sh.lua', path: 'Impound.enabled', type: 'bool', default: true, label: 'Enable impound', help: 'The impound lot system.' },
      { id: 'imp_fee', file: 'configs/cfg-impound-sh.lua', path: 'Impound.fee', type: 'number', default: 500, label: 'Retrieval fee', help: 'What an owner pays to get a vehicle back.' },
      { id: 'imp_dist', file: 'configs/cfg-impound-sh.lua', path: 'Impound.maxDistance', type: 'number', default: 8.0, label: 'Impound distance (m)', help: 'How close an officer must be to impound a vehicle.' },
      { id: 'imp_persist', file: 'configs/cfg-impound-sh.lua', path: 'Impound.persist', type: 'bool', default: true, label: 'Persist impounds', help: 'Remember impounded vehicles across restarts.' },
    ],
  },

  {
    id: 'k9',
    title: 'K9 Unit',
    icon: '🐕',
    intro: 'A police dog that follows its handler and searches suspects.',
    file: 'configs/cfg-k9-sh.lua',
    fields: [
      { id: 'k9_enabled', file: 'configs/cfg-k9-sh.lua', path: 'K9.enabled', type: 'bool', default: true, label: 'Enable K9', help: 'The K9 unit.' },
      { id: 'k9_model', file: 'configs/cfg-k9-sh.lua', path: 'K9.model', type: 'text', default: 'a_c_shepherd', label: 'Dog model', help: 'The ped model spawned as the K9.' },
      { id: 'k9_name', file: 'configs/cfg-k9-sh.lua', path: 'K9.name', type: 'text', default: 'Rex', label: 'Dog name', help: 'Display name of the dog.' },
      { id: 'k9_follow', file: 'configs/cfg-k9-sh.lua', path: 'K9.followDistance', type: 'number', default: 1.6, label: 'Follow distance (m)', help: 'How closely the dog trails its handler.' },
      { id: 'k9_search', file: 'configs/cfg-k9-sh.lua', path: 'K9.searchRadius', type: 'number', default: 12.0, label: 'Search radius (m)', help: 'How far the dog detects search targets.' },
    ],
  },

  {
    id: 'airunit',
    title: 'Air Unit',
    icon: '🚁',
    intro: 'The helicopter observation camera (heli-cam) for air support.',
    file: 'configs/cfg-airunit-sh.lua',
    fields: [
      { id: 'air_enabled', file: 'configs/cfg-airunit-sh.lua', path: 'AirUnit.enabled', type: 'bool', default: true, label: 'Enable Air Unit', help: 'The heli-cam feature.' },
      { id: 'air_radius', file: 'configs/cfg-airunit-sh.lua', path: 'AirUnit.orbit.radius', type: 'number', default: 150.0, label: 'Orbit radius (m)', help: 'Distance the helicopter circles the target from.' },
      { id: 'air_alt', file: 'configs/cfg-airunit-sh.lua', path: 'AirUnit.orbit.altitude', type: 'number', default: 120.0, label: 'Orbit altitude (m)', help: 'Height above the target.' },
      { id: 'air_speed', file: 'configs/cfg-airunit-sh.lua', path: 'AirUnit.orbit.speed', type: 'number', default: 20.0, label: 'Orbit speed (m/s)', help: 'Speed along the circle.' },
      { id: 'air_scan', file: 'configs/cfg-airunit-sh.lua', path: 'AirUnit.cam.scanTime', type: 'number', default: 2.5, label: 'Lock time (s)', help: 'Seconds the crosshair must hold an entity to lock it.' },
    ],
  },

  {
    id: 'profile',
    title: 'Profile & XP',
    icon: '🪪',
    intro: 'The /profile UI: playtime levelling and the membership threshold.',
    file: 'configs/cfg-profile-sh.lua',
    fields: [
      { id: 'prof_perlevel', file: 'configs/cfg-profile-sh.lua', path: 'ProfileConfig.minutesPerLevel', type: 'number', default: 60, label: 'Minutes per level', help: 'Playtime minutes per profile level (60 = 1 level/hour).' },
      { id: 'prof_memhours', file: 'configs/cfg-profile-sh.lua', path: 'ProfileConfig.membershipHours', type: 'number', default: 10, label: 'Membership hours', help: 'Hours of playtime before the "Member" achievement unlocks.' },
    ],
  },

  {
    id: 'presence',
    title: 'Discord Rich Presence',
    icon: '🎮',
    intro: 'The "Playing …" status + invite button shown on the player’s Discord.',
    file: 'configs/cfg-presence-sh.lua',
    fields: [
      { id: 'pres_invite', file: 'configs/cfg-presence-sh.lua', path: 'RichPresence.discordInvite', type: 'text', default: 'discord.gg/YOURINVITE', label: 'Discord invite', help: 'Invite the presence "join" button opens. Use your own invite code.' },
      { id: 'pres_website', file: 'configs/cfg-presence-sh.lua', path: 'RichPresence.website', type: 'text', default: '', label: 'Website', help: 'Optional website button URL (empty = no button).' },
      { id: 'pres_rotate', file: 'configs/cfg-presence-sh.lua', path: 'RichPresence.rotateSeconds', type: 'number', default: 4, label: 'Rotate every (s)', help: 'How often the status text rotates.' },
    ],
  },

  {
    id: 'globalban',
    title: 'Global-ban network',
    icon: '🚫',
    intro: 'Optional shared ban list across LACORE servers.',
    file: 'configs/cfg-globalban-sh.lua',
    fields: [
      { id: 'gb_enabled', file: 'configs/cfg-globalban-sh.lua', path: 'GlobalBan.enabled', type: 'bool', default: true, label: 'Check the network', help: 'Refuse joining players who are banned on the network.' },
      { id: 'gb_refresh', file: 'configs/cfg-globalban-sh.lua', path: 'GlobalBan.refreshMinutes', type: 'number', default: 15, label: 'Refresh (min)', help: 'How often the shared list is refreshed.' },
      { id: 'gb_failopen', file: 'configs/cfg-globalban-sh.lua', path: 'GlobalBan.failOpen', type: 'bool', default: true, label: 'Fail-open on outage', help: 'If the list is unreachable, still let players in (recommended).' },
      { id: 'gb_propagate', file: 'configs/cfg-globalban-sh.lua', path: 'GlobalBan.propagate', type: 'bool', default: false, label: 'Push my bans', help: 'Share YOUR bans to the network (off by default).' },
    ],
  },

  {
    id: 'anticheat',
    title: 'Anti-Cheat',
    icon: '🛡️',
    intro:
      'Core detections. Actions are log / kick / ban. The whole system is OFF by default — turn it on ' +
      'and tune per detection. Fine-grained thresholds live in configs/cfg-anticheat-sh.lua.',
    file: 'configs/cfg-anticheat-sh.lua',
    fields: [
      { id: 'ac_enabled', file: 'configs/cfg-anticheat-sh.lua', path: 'Anticheat.Enabled', type: 'bool', default: false, label: 'Enable anti-cheat', help: 'Master switch. Off by default; turn on once you’ve reviewed the actions below.' },
      { id: 'ac_god_action', file: 'configs/cfg-anticheat-sh.lua', path: 'Anticheat.GodMode.action', type: 'select', default: 'kick', options: [['log', 'Log only'], ['kick', 'Kick'], ['ban', 'Ban']], label: 'God-mode action', help: 'What happens when a player is detected with impossible health.' },
      { id: 'ac_god_grace', file: 'configs/cfg-anticheat-sh.lua', path: 'Anticheat.GodMode.spawnGrace', type: 'number', default: 12, label: 'God-mode spawn grace (s)', help: 'Ignore invincibility for this long after (re)spawn/revive/jail TP.' },
      { id: 'ac_weap_action', file: 'configs/cfg-anticheat-sh.lua', path: 'Anticheat.WeaponDamage.action', type: 'select', default: 'kick', options: [['log', 'Log only'], ['kick', 'Kick'], ['ban', 'Ban']], label: 'Weapon-damage action', help: 'Action when a hit exceeds the max legit damage (damage modifier).' },
      { id: 'ac_weap_max', file: 'configs/cfg-anticheat-sh.lua', path: 'Anticheat.WeaponDamage.maxDamage', type: 'number', default: 250, label: 'Max weapon damage', help: 'Anything above this is treated as a damage modifier (sniper headshot ≈ 200).' },
      { id: 'ac_bw_action', file: 'configs/cfg-anticheat-sh.lua', path: 'Anticheat.BlacklistedWeapons.action', type: 'select', default: 'ban', options: [['log', 'Log only'], ['kick', 'Kick'], ['ban', 'Ban']], label: 'Blacklisted-weapon action', help: 'Action when a player pulls a weapon that is never legitimately given out.' },
      { id: 'ac_expl_action', file: 'configs/cfg-anticheat-sh.lua', path: 'Anticheat.Explosions.action', type: 'select', default: 'ban', options: [['log', 'Log only'], ['kick', 'Kick'], ['ban', 'Ban']], label: 'Explosion action', help: 'Action for blocked/spammed explosion types (orbital cannon, script missile …).' },
    ],
  },
]

// A static reminder for server.cfg — secrets are NEVER collected in the browser;
// the wizard only emits placeholder lines you fill in locally.
export const CONVAR_TEMPLATE = `# ── LACORE secrets & convars (edit values locally, never commit real secrets) ──
# Discord bot token + guild (for duty roles / auth). Get them from your Discord application.
set lacore_discord_token "CHANGE_ME"
set lacore_discord_guild "CHANGE_ME"
# Dev mode — "true" only on a private test server, "false" in production.
set lacore_devmode "false"
# Optional Discord webhooks (leave empty to disable that log channel).
set lacore_webhook_dispatch ""
set lacore_webhook_adminlog ""
set lacore_webhook_serverlog ""`
