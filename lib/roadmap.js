// Roadmap phases, rendered as a horizontal timeline by components/Roadmap.jsx.
// Keep this the single source of truth — edit here, not in the MDX.

export const phases = [
  {
    when: 'Now',
    status: 'Shipped',
    icon: '✅',
    accent: '#22c55e',
    title: 'The Foundation',
    tag: 'v3.1.5',
    items: [
      '4 MDTs — LAPD · LASD · Agency · EMS/Fire',
      'Dispatch console + zone / district editor',
      'CCTV suite — scanner, field cams, map',
      'BOLOs · charges · citations · penal code',
      'Evidence & reports · multi-char profiles',
      'Security stack + ESX / QB / QBox bridge',
      'Civilian base — emotes, ID, props, orgs, turf',
      'External web dispatcher',
    ],
  },
  {
    when: 'Next',
    status: 'In progress',
    icon: '🔨',
    accent: '#f59e0b',
    title: 'Finish Line',
    items: [
      'Civilian activities & jobs (XP, RP-only)',
      'Speech-to-text → dispatch / radio log',
      'New address system (NADS)',
      'EMS / Fire CAD depth & workflows',
    ],
  },
  {
    when: 'Then',
    status: 'Planned',
    icon: '📱',
    accent: '#3b82f6',
    title: 'Communications',
    items: [
      'Full modern phone rework',
      'Structured 911 / 311 → dispatch',
      'Contacts, messaging & RP tools',
    ],
  },
  {
    when: 'Later',
    status: 'Planned',
    icon: '🧍',
    accent: '#a855f7',
    title: 'Civilian Depth II',
    items: [
      'Org / gang expansion — territory, ranks, MOTD',
      'Turf balancing & anti-farm tuning',
      'Civ interactions — show ID, hand over',
      'More props & tools',
    ],
  },
  {
    when: 'Later',
    status: 'Planned',
    icon: '🚔',
    accent: '#ef4444',
    title: 'LEO Depth II',
    items: [
      'Warrant workflow (request → approval)',
      'Court / DA integration',
      'Forensics — fingerprint / DNA',
      'ALPR / ANPR on cameras → BOLO hit',
      'Impound / tow · optional K9',
    ],
  },
  {
    when: 'Vision',
    status: 'Exploring',
    icon: '🚀',
    accent: '#ec4899',
    title: 'The Vision',
    items: [
      'Feature-toggle "app store"',
      'Web records / DA portal',
      'Deeper framework interop',
      'More languages · performance budget',
    ],
  },
]
