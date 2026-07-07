'use client'

import './framework-cards.css'

// GitHub Pages serves under a subpath (basePath). Raw <img> tags are NOT
// prefixed automatically by Next.js, so build the asset URL with the basePath.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''
const asset = (p) => (p && p.startsWith('/') ? BASE + p : p)

function Tile({ logo, badge, icon, color, name }) {
  if (logo) {
    return <img className="fc-tile fc-tile-img" src={asset(logo)} alt={name} />
  }
  return (
    <div className="fc-tile" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
      {icon ? <span className="fc-icon">{icon}</span> : <span className="fc-badge">{badge}</span>}
    </div>
  )
}

export function FrameworkGrid({ items = [] }) {
  if (!items.length) return null
  return (
    <div className="fc-grid">
      {items.map((f) => (
        <div className="fc-card fc-card-row" key={f.name}>
          <Tile logo={f.logo} badge={f.badge} color={f.color} name={f.name} />
          <div className="fc-meta">
            <div className="fc-name">{f.name}</div>
            {f.resource && <div className="fc-sub">{f.resource}</div>}
          </div>
          {f.status && (
            <span className="fc-status" style={{ color: f.statusColor || '#16a34a' }}>{f.status}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export function ScriptGrid({ items = [] }) {
  if (!items.length) return null
  return (
    <div className="fc-grid fc-grid-wide">
      {items.map((s) => (
        <div className="fc-card fc-card-col" key={s.name}>
          <div className="fc-card-head">
            <Tile logo={s.logo} icon={s.icon} badge={s.badge} color={s.color} name={s.name} />
            <div className="fc-meta">
              <div className="fc-name">{s.name}</div>
              {s.via && <div className="fc-sub">{s.via}</div>}
            </div>
          </div>
          {s.desc && <div className="fc-desc">{s.desc}</div>}
        </div>
      ))}
    </div>
  )
}
