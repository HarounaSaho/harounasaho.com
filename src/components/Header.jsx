export default function Header({ roon, roonCaught, onHome, onWorks, onAbout, onRoon, onRoonFlee, roonAnchor, chase }) {
  const dodge = (e) => {
    if (e) e.preventDefault();
    onRoonFlee(e);
  };

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
            ref={roonAnchor}
            className="roon"
            style={roon.fled ? { visibility: "hidden", pointerEvents: "none" } : undefined}
            onMouseEnter={chase ? dodge : undefined}
            onPointerDown={chase ? dodge : undefined}
            onClick={chase ? dodge : onRoon}
          >
            roon
          </a>
        )}
      </div>
      <div className="header-actions">
        <nav className="top-nav">
          <a href="#works" onClick={onWorks}>
            WORKS
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
