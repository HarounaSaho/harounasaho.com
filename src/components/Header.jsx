export default function Header({ roon, onHome, onArt, onDesign, onAbout, onRoon, onRoonFlee }) {
  const fled = !!roon.fled;
  const roonStyle = fled
    ? { left: roon.x, top: roon.y, transform: `rotate(${roon.r}deg)` }
    : undefined;

  return (
    <header className="site-header">
      <div className="rule-wrap bottom">
        <div className="rule drift-a" />
      </div>
      <div className="brand">
        <a href="#home" className="wordmark" onClick={onHome}>
          HAROUNA SAHO
        </a>
        <a
          href="#roon"
          className={`roon${fled ? " fled" : ""}`}
          style={roonStyle}
          onMouseEnter={onRoonFlee}
          onClick={onRoon}
        >
          roon
        </a>
      </div>
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
    </header>
  );
}
