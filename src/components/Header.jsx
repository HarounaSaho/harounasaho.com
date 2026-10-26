export default function Header({ roon, roonCaught, onHome, onArt, onDesign, onAbout, onRoon, onRoonFlee }) {
  return (
    <header className="site-header">
      <div className="rule-wrap bottom">
        <div className="rule drift-a" />
      </div>
      <div className="brand">
        <a href="#home" className="wordmark" onClick={onHome}>
          HAROUNA SAHO
        </a>
        {!roonCaught && (
          <a
            href="#roon"
            className="roon"
            style={roon.fled ? { visibility: "hidden", pointerEvents: "none" } : undefined}
            onMouseEnter={onRoonFlee}
            onClick={onRoon}
          >
            roon
          </a>
        )}
      </div>
      <div className="header-actions">
        <nav className="top-nav">
          <a href="#art" onClick={onArt}>
            ART
          </a>
          <a href="#design" onClick={onDesign}>
            DESIGN
          </a>
          <a href="#about" onClick={onAbout}>
            INFO
          </a>
        </nav>
        <a className="prints-btn" href="/prints/">
          Shop prints
        </a>
      </div>
    </header>
  );
}
