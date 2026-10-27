import { PROJECTS, WORKS } from "../data";

function yearsIn(text) {
  const found = String(text).match(/\d{4}/g);
  return found ? found.map(Number) : [];
}

function yearLabel(text) {
  const years = yearsIn(text);
  if (years.length >= 2 && years[0] !== years[years.length - 1]) {
    return years[0] + " – " + years[years.length - 1];
  }
  return years[0] ? String(years[0]) : String(text);
}

function latestYear(text) {
  const years = yearsIn(text);
  return years.length ? Math.max(...years) : 0;
}

export default function WorksPage({ onHome, onOpenWork, onOpenProject }) {
  const art = WORKS.map((work) => ({
    key: work.cat,
    kind: "Art",
    title: work.title,
    year: work.yr,
    sort: Number(work.yr),
    image: work.image,
    href: "#work",
    open: (e) => onOpenWork(work.cat, "works", null, e),
  }));

  const design = Object.values(PROJECTS).map((project) => ({
    key: project.id,
    kind: "Design",
    title: project.title,
    year: yearLabel(project.dates),
    sort: latestYear(project.dates),
    image: null,
    plate: project.locked ? "LOCKED" : project.status,
    href: "#" + project.id,
    open: (e) => onOpenProject(project.id, e),
  }));

  const entries = [...art, ...design].sort((a, b) => b.sort - a.sort);
  const artCount = String(art.length).padStart(3, "0");
  const designCount = String(design.length).padStart(3, "0");

  return (
    <section className="page slide-right">
      <a href="#home" className="crumb art-crumb" onClick={onHome}>
        ← HOME
      </a>
      <div className="art-head">
        <div>
          <div className="sec-tag">SEC · 01 / WORKS</div>
          <h1 className="page-h1">Works</h1>
        </div>
        <div className="art-count">
          {String(entries.length).padStart(3, "0")} ENTRIES
          <br />
          {artCount} ART · {designCount} DESIGN
        </div>
      </div>
      <p className="art-intro">Paintings, prints, and product work, newest first.</p>
      <div className="room-grid">
        {entries.map((entry) => (
          <a key={entry.key} href={entry.href} className="room-tile" onClick={entry.open}>
            {entry.image ? (
              <img
                className="work-photo"
                src={entry.image}
                alt={entry.title + ", " + entry.year + ", by Harouna Saho"}
              />
            ) : (
              <div className="ph">
                <span>{entry.plate}</span>
              </div>
            )}
            <div className="room-tile-meta">
              <span className="cat">
                {entry.kind.toUpperCase()} · {entry.year}
              </span>
              <span className="title">{entry.title}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
