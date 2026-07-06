'use client'

import './roadmap.css'
import { phases } from '../lib/roadmap.js'

// Horizontal roadmap timeline: phase cards flow left → right along a connecting
// line, each with a status node, coloured accent and item list.
export function RoadmapTimeline() {
  return (
    <div className="rm-wrap">
      <div className="rm-scroller">
        <div className="rm-rail">
          {phases.map((p) => (
            <div className="rm-phase" key={p.title} style={{ '--rm': p.accent }}>
              <span className="rm-when">{p.when}</span>
              <span className="rm-dot" />
              <div className="rm-card">
                <span className="rm-status">{p.icon} {p.status}</span>
                <div className="rm-title">{p.title}{p.tag && <span className="rm-tag">{p.tag}</span>}</div>
                <ul className="rm-list">
                  {p.items.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="rm-hint">← scroll to explore the full timeline →</p>
    </div>
  )
}
