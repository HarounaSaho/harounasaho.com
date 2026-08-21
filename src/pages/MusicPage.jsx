import AlbumScrub from "../components/AlbumScrub";

export default function MusicPage({ onHome }) {
  return (
    <section className="page music-page fade-in">
      <a href="#home" className="crumb" onClick={onHome}>
        ← HOME
      </a>
      <div className="sec-tag">SEC · 00 / MUSIC</div>
      <h1 className="page-h1">music i like</h1>
      <div className="music-body">
        <div className="music-stage">
          <AlbumScrub />
        </div>
        <p className="music-caption">
          I pull inspiration from everywhere. Music is a big one.
        </p>
      </div>
    </section>
  );
}
