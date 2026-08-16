import { WORKS, SHOWS } from "../data";
import Placeholder from "../components/Placeholder";

export function ArtIndex({ onHome, onOpenRoom, onOpenWork }) {
  return (
    <section className="page slide-right">
      <a href="#home" className="crumb art-crumb" onClick={onHome}>
        ← HOME
      </a>
      <div className="art-head">
        <div>
          <div className="sec-tag">SEC · 02 / ART</div>
          <h1 className="page-h1">Archive</h1>
        </div>
        <div className="art-count">
          {String(WORKS.length).padStart(3, "0")} ENTRIES
          <br />
          OIL · ACRYLIC · WOODCARVING
        </div>
      </div>
      <p className="art-intro">Concept art for one continuing world - no fixed story, each piece its own scene.</p>
      <div className="statement">
        <div className="statement-label">ARTIST STATEMENT</div>
        <p>
          I paint the same world from a different vantage each time - not to tell its story, but to keep proving it
          exists. A concept artist builds a place before anyone writes what happens in it; that&apos;s the job I&apos;ve
          given myself, one canvas at a time.
        </p>
      </div>
      <table className="archive">
        <thead>
          <tr>
            <th>CAT</th>
            <th>TITLE</th>
            <th>MEDIUM</th>
            <th>YR</th>
            <th>EXHIBITION</th>
          </tr>
        </thead>
        <tbody>
          {WORKS.map((row) => (
            <tr
              key={row.cat}
              data-clickable="true"
              onClick={(e) => (row.ex ? onOpenRoom(row.ex, e) : onOpenWork(row.cat, "index", null, e))}
            >
              <td>{row.cat}</td>
              <td className="title">{row.title}</td>
              <td className="medium">{row.medium}</td>
              <td className="yr">{row.yr}</td>
              <td className="ex">{row.ex || "One-off"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function RoomView({ roomName, onArt, onOpenWork }) {
  const tiles = WORKS.filter((w) => w.ex === roomName);
  return (
    <section className="page fade-in">
      <a href="#art" className="crumb" onClick={onArt}>
        ← ARCHIVE
      </a>
      <div className="room-head">
        <h1>{roomName}</h1>
        <div className="art-count">
          {SHOWS[roomName] || ""}
          <br />
          {tiles.length} WORKS
        </div>
      </div>
      <div className="room-grid">
        {tiles.map((tile) => (
          <a
            key={tile.cat}
            href="#work"
            className="room-tile"
            onClick={(e) => onOpenWork(tile.cat, "room", roomName, e)}
          >
            <Placeholder label="SQUARE CROP" variant="fine" />
            <div className="room-tile-meta">
              <span className="cat">{tile.cat}</span>
              <span className="title">{tile.title}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export function WorkView({ workCat, from, room, onBack }) {
  const work = WORKS.find((w) => w.cat === workCat);
  if (!work) return null;
  const backLabel = from === "room" ? room : "ARCHIVE";

  return (
    <section className="page fade-in">
      <a href="#back" className="crumb" onClick={onBack}>
        ← {backLabel}
      </a>
      <div className="work-layout">
        <div className="work-image">
          <Placeholder label="SQUARE CROP · PAINTING" />
        </div>
        <div className="work-side">
          <div className="work-cat">{work.cat}</div>
          <h1>{work.title}</h1>
          <table className="meta-table">
            <tbody>
              <tr>
                <td>MEDIUM</td>
                <td>{work.medium}</td>
              </tr>
              <tr>
                <td>YEAR</td>
                <td>{work.yr}</td>
              </tr>
              <tr>
                <td>DIMENSIONS</td>
                <td className="work-dims">{work.dims}</td>
              </tr>
              <tr>
                <td>EXHIBITION</td>
                <td>{work.ex || "One-off"}</td>
              </tr>
            </tbody>
          </table>
          <p className="work-close">
            Concept art for one continuing world - no fixed story, each piece its own scene.
          </p>
        </div>
      </div>
    </section>
  );
}
