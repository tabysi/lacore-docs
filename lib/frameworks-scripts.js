// Data for the /frameworks-scripts page. Edit the two arrays below to add or
// change supported frameworks and scripts — the page renders from this file.
//
// LOGOS: to show a real logo, drop the image in `public/logos/` and set `logo`
// to its path (e.g. logo: '/logos/esx.png'). Leave `logo: ''` to fall back to a
// coloured tile with the `badge` text (frameworks) or `icon` emoji (scripts).
// `color` sets the tile's gradient / accent.

export const frameworks = [
  {
    name: 'Standalone',
    resource: "LACORE's own identity",
    badge: 'LA',            // shown when no logo
    color: '#1f6feb',
    logo: '/lacoresmall.png',
    status: '★ Default',
    statusColor: '#1f6feb',
  },
  {
    name: 'ESX',
    resource: 'es_extended',
    badge: 'ESX',
    color: '#3a4a5e',
    logo: '/logos/esx.png',
    status: '✓ Supported',
    statusColor: '#16a34a',
  },
  {
    name: 'QBCore',
    resource: 'qb-core',
    badge: 'QB',
    color: '#8b5cf6',
    logo: '/logos/qbcore.png',
    status: '✓ Supported',
    statusColor: '#16a34a',
  },
  {
    name: 'QBox',
    resource: 'qbx_core',
    badge: 'QBX',
    color: '#06b6d4',
    logo: '/logos/qbox.png',
    status: '✓ Supported',
    statusColor: '#16a34a',
  },
]

export const scripts = [
  {
    name: 'TK_Dispatch',
    via: 'Auto · cfg-integrations',
    icon: '📟',
    color: '#ef4444',
    logo: '',
    desc: "LACORE's automatic calls (911 / Panic / Shots / Crime Broadcast / …) mirror into tk_dispatch's call list, and unit callsigns sync on duty change. Per-type job/blip mapping in cfg-integrations-sh.lua.",
  },
  {
    name: 'vms_housing',
    via: 'Native export',
    icon: '🏠',             // shown when no logo
    color: '#f59e0b',
    logo: '/logos/vms.png',
    desc: "A queried person's registered property addresses show in the MDT person record.",
  },
  {
    name: 'vms_identity',
    via: 'Via framework bridge',
    icon: '🪪',
    color: '#6d28d9',
    logo: '/logos/vms.png',
    desc: 'Character identity (name) is read automatically for MDT records.',
  },
  {
    name: 'vms_multichars',
    via: 'Via framework bridge',
    icon: '👥',
    color: '#0ea5e9',
    logo: '/logos/vms.png',
    desc: 'The active character is recognised; querying an online player with no LACORE profile still returns a record.',
  },
  {
    name: 'ox_target',
    via: 'Third-Eye',
    icon: '🎯',
    color: '#22c55e',
    logo: '',
    desc: 'Player interactions run through ox_target — LEO cuff / drag / put-in-vehicle / breath / drug tests, EMS medic / revive / pulse, coroner dead-bag, carry.',
  },
  {
    name: 'screenshot-basic',
    via: 'Camera uploads',
    icon: '📸',
    color: '#0ea5e9',
    logo: '',
    desc: 'Powers the phone camera app and mugshot / evidence photo uploads (needs an upload endpoint).',
  },
  {
    name: 'blip_info',
    via: 'Native export',
    icon: '📍',
    color: '#f43f5e',
    logo: '',
    desc: 'Rich blip info panels (name, open/closed status, website, phone, postal) on LACORE map blips.',
  },
  {
    name: 'bob74_ipl',
    via: 'Interior loader',
    icon: '🏝️',
    color: '#14b8a6',
    logo: '',
    desc: 'Loads GTA interiors / IPLs (North Yankton, Cayo Perico island) used by LACORE world features.',
  },
  {
    name: 'LibertyV',
    via: 'Map support',
    icon: '🗽',
    color: '#64748b',
    logo: '',
    desc: 'Liberty City map — LACORE switches its street & postal lookups to Liberty City when LibertyV runs.',
  },
  {
    name: 'Notify systems',
    via: 'Framework or custom',
    icon: '🔔',
    color: '#eab308',
    logo: '',
    desc: 'Route LACORE notifications through the framework notify (ESX / QBCore) or your own handler — ox_lib, okokNotify, mythic_notify … via cfg-notify-sh.lua / cfg-bridge-sh.lua.',
  },
  {
    name: 'cc-chat / cc-rpchat',
    via: 'Compatibility',
    icon: '💬',
    color: '#a855f7',
    logo: '',
    desc: 'Third-party chat resources are supported — set ExternalChat = true so LACORE stops re-posting OOC (no double messages, no false anti-spoof kicks on RP names).',
  },
]
