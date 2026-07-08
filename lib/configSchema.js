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
