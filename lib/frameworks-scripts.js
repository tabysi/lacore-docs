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
    logo: '/logos/esx.jpg',
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
    name: 'vms_housing',
    via: 'Native export',
    icon: '🏠',             // shown when no logo
    color: '#f59e0b',
    logo: '/logos/vms.webp',
    desc: "A queried person's registered property addresses show in the MDT person record.",
  },
  {
    name: 'vms_identity',
    via: 'Via framework bridge',
    icon: '🪪',
    color: '#6d28d9',
    logo: '/logos/vms.webp',
    desc: 'Character identity (name) is read automatically for MDT records.',
  },
  {
    name: 'vms_multichars',
    via: 'Via framework bridge',
    icon: '👥',
    color: '#0ea5e9',
    logo: '/logos/vms.webp',
    desc: 'The active character is recognised; querying an online player with no LACORE profile still returns a record.',
  },
]
