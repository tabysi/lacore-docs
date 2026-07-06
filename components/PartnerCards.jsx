'use client'

import { useState } from 'react'
import './partner-cards.css'

// GitHub Pages serves under a subpath (basePath). Raw <img> tags are NOT
// prefixed automatically by Next.js — only next/image and next/link are —
// so build the asset URL with the basePath ourselves.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ''
const asset = (p) => (p && p.startsWith('/') ? BASE + p : p)

// Deterministic accent colour from a name (so avatars/cards look varied but stable).
function hue(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
  return h
}
function initials(name) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || name.slice(0, 2).toUpperCase()
}

function Avatar({ name, logo, accent }) {
  if (logo) {
    return <img className="pc-avatar" src={asset(logo)} alt={name} />
  }
  return (
    <div className="pc-avatar" style={{ background: `linear-gradient(135deg, ${accent}, hsl(${(hue(name) + 40) % 360} 70% 40%))` }}>
      {initials(name)}
    </div>
  )
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className={'pc-copy' + (copied ? ' copied' : '')}
      onClick={() => {
        try {
          navigator.clipboard?.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1400)
        } catch (_) {}
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

export function CreatorGrid({ items = [] }) {
  if (!items.length) return <p className="pc-empty">No creator codes yet — check back soon.</p>
  return (
    <div className="pc-grid">
      {items.map((c) => {
        const accent = `hsl(${hue(c.name)} 70% 50%)`
        return (
          <div className="pc-card" key={c.name} style={{ '--pc-accent': accent }}>
            <div className="pc-top">
              <Avatar name={c.name} logo={c.logo} accent={accent} />
              <div>
                <div className="pc-name">{c.name}</div>
                {c.tagline && <div className="pc-sub">{c.tagline}</div>}
              </div>
            </div>
            {c.code && (
              <div className="pc-code">
                <div>
                  <span className="pc-code-label">Creator Code</span>
                  <span className="pc-code-value">{c.code}</span>
                </div>
                <CopyButton value={c.code} />
              </div>
            )}
            {c.url && (
              <a className="pc-link" href={c.url} target="_blank" rel="noreferrer">Visit →</a>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function PartnerGrid({ items = [] }) {
  if (!items.length) return <p className="pc-empty">No partners listed yet — interested? See below.</p>
  return (
    <div className="pc-grid">
      {items.map((p) => {
        const accent = `hsl(${hue(p.name)} 65% 50%)`
        return (
          <div className="pc-card" key={p.name} style={{ '--pc-accent': accent }}>
            <div className="pc-top">
              <Avatar name={p.name} logo={p.logo} accent={accent} />
              <div>
                <div className="pc-name">{p.name}</div>
                {p.role && <div className="pc-sub">{p.role}</div>}
              </div>
            </div>
            {p.desc && <div className="pc-desc">{p.desc}</div>}
            {p.url && (
              <a className="pc-link" href={p.url} target="_blank" rel="noreferrer">Visit →</a>
            )}
          </div>
        )
      })}
    </div>
  )
}
