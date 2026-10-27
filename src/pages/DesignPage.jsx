import { PROJECTS } from "../data";
import Placeholder from "../components/Placeholder";

export function DesignIndex({ onHome, onOpenSidonia, onOpenRing }) {
  return (
    <section className="page narrow slide-left">
      <a href="#home" className="crumb" onClick={onHome}>
        ← HOME
      </a>
      <div className="sec-tag design-sec">SEC · 01 / DESIGN</div>
      <h1 className="page-h1">Product design.</h1>
      <p className="design-intro">A smaller, growing shelf, not organized as an archive.</p>
      <div className="design-cards">
        <a href="#sidonia" className="design-card" onClick={onOpenSidonia}>
          <div className="design-date">
            SUMMER 2026 <span className="locked">🔒 LOCKED</span>
          </div>
          <h2>Sidonia AI</h2>
          <div className="design-role">HEAD OF DESIGN AND GROWTH</div>
          <p>Interface and identity work for an agent platform - mostly making complex state legible.</p>
          <div className="open-cta">OPEN →</div>
        </a>
        <a href="#ring" className="design-card" onClick={onOpenRing}>
          <div className="design-date">2024 - 2025</div>
          <h2>Ring, concept</h2>
          <div className="design-role">WEARABLE AI · SELF‑INITIATED</div>
          <p>A voice-first ring with no screen: industrial study, gesture set, and a small system of haptic replies.</p>
          <div className="open-cta">OPEN →</div>
        </a>
      </div>
    </section>
  );
}

export function ProjectDetail({ projectId, onBack, backLabel }) {
  const project = PROJECTS[projectId];
  if (!project) return null;

  return (
    <section className="page narrow slide-left">
      <a href={backLabel === "DESIGN" ? "#design" : "#art"} className="crumb" onClick={onBack}>
        ← {backLabel}
      </a>
      <div className="sec-tag project-sec">{project.sec}</div>
      <h1 className="page-h1 tight">{project.title}</h1>
      <p className="project-lede">{project.lede}</p>
      {project.locked ? (
        <div className="nda-box">
          <div className="nda-head">
            <span className="nda-lock">🔒</span>
            <span className="nda-label">PROPRIETARY - UNDER NDA</span>
          </div>
          <p>
            This project involves confidential product work and can&apos;t be shown publicly. Role, dates, and surface
            are listed below; details are available on request.
          </p>
          <table className="meta-table spaced">
            <tbody>
              <tr>
                <td>ROLE</td>
                <td>{project.role}</td>
              </tr>
              <tr>
                <td>DATES</td>
                <td>{project.dates}</td>
              </tr>
              <tr>
                <td>SURFACE</td>
                <td>{project.surface}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="project-layout">
          <div className="project-images">
            <Placeholder label={project.slotA} />
            <Placeholder label={project.slotB} />
          </div>
          <div className="project-side">
            <table className="meta-table">
              <tbody>
                <tr>
                  <td>ROLE</td>
                  <td>{project.role}</td>
                </tr>
                <tr>
                  <td>DATES</td>
                  <td>{project.dates}</td>
                </tr>
                <tr>
                  <td>SURFACE</td>
                  <td>{project.surface}</td>
                </tr>
                <tr>
                  <td>STATUS</td>
                  <td className="status">{project.status}</td>
                </tr>
              </tbody>
            </table>
            <div className="project-notes">
              {project.notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
