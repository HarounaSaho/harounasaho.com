import { useEffect, useRef, useState } from "react";
import { WORKS } from "../data";
import Placeholder from "../components/Placeholder";
import PaintWindow from "../components/PaintWindow";
import AlbumScrub from "../components/AlbumScrub";
import Draggable from "../components/Draggable";
import musiciansSrc from "../assets/musicians.jpg";
import cardJitsuSrc from "../assets/card-jitsu.png";
import ugwuEkeSrc from "../assets/ugwu-eke.jpg";

export default function HomePage({
  heroRef,
  roon,
  onRoonFlee,
  onRoon,
  onArt,
  onDesign,
  onAbout,
  onMusic,
  onOpenWork,
  onOpenRing,
}) {
  const workSectionRef = useRef(null);
  const [workVisible, setWorkVisible] = useState(false);

  useEffect(() => {
    const el = workSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        setWorkVisible(entries[0].isIntersecting);
      },
      { threshold: 0.18, rootMargin: "0px 0px -12% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const homeTiles = [
    { tag: WORKS[8].cat, title: WORKS[8].title, open: (e) => onOpenWork(WORKS[8].cat, e) },
    { tag: WORKS[3].cat, title: WORKS[3].title, open: (e) => onOpenWork(WORKS[3].cat, e) },
    { tag: "DESIGN", title: "Ring, concept", open: onOpenRing },
    { tag: WORKS[6].cat, title: WORKS[6].title, open: (e) => onOpenWork(WORKS[6].cat, e) },
  ];

  return (
    <>
      <section ref={heroRef} className={`hero${workVisible ? " is-leaving" : ""}`}>
        {roon?.fled && (
          <a
            href="#roon"
            className="roon fled"
            style={{ left: roon.x, top: roon.y, transform: `rotate(${roon.r}deg)` }}
            onMouseEnter={onRoonFlee}
            onClick={onRoon}
          >
            roon
          </a>
        )}
        <div className="sec-tag">SEC · 00 / HOME</div>
        <h1>
          Harouna Saho
          <br />
          <span>Artist and Designer</span>
        </h1>
        <p className="hero-lede">Speaking with visuals</p>
        <div className="hero-stage">
          <a href="#art" className="hero-featured" onClick={onArt}>
            <Placeholder label="FEATURED WORK" />
            <div className="musicians-caption">
              <span className="musicians-caption-title">Work</span>
              <span>To be shown here</span>
            </div>
          </a>
          <Draggable className="musicians-frame" onClick={onArt}>
            <img className="musicians-img" src={musiciansSrc} alt="Caravaggio, The Musicians" draggable="false" />
            <div className="musicians-caption">
              <a
                className="musicians-caption-title"
                href="https://www.metmuseum.org/art/collection/search/435844"
                target="_blank"
                rel="noreferrer"
              >
                The Musicians
              </a>
              <span>Caravaggio (Michelangelo Merisi) Italian x Roon (Harouna Saho) Gambian</span>
              <span>1597 x 2026</span>
            </div>
          </Draggable>
          <Draggable className="jones-frame" onClick={onArt}>
            <img
              className="jones-img"
              src={ugwuEkeSrc}
              alt="People from Ugwu Eke village wearing Igbo masks, near Alayi"
              draggable="false"
            />
            <div className="musicians-caption">
              <span className="musicians-caption-title">
                People from Ugwu Eke village wearing Igbo masks, near Alayi
              </span>
              <span>Photo by G. I. Jones</span>
              <span>1930s</span>
            </div>
          </Draggable>
          <Draggable className="cj-drag" onClick={onDesign}>
            <img className="cj-img" src={cardJitsuSrc} alt="Card-Jitsu" draggable="false" />
          </Draggable>
          <Draggable className="album-drag" onClick={onMusic}>
            <AlbumScrub />
            <div className="musicians-caption">
              <span className="musicians-caption-title">music i like</span>
            </div>
          </Draggable>
          <Draggable className="paint-drag" onClick={onDesign}>
            <PaintWindow />
          </Draggable>
        </div>
        <nav className="hero-nav">
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
        <a
          href="#selected-work"
          className="scroll-cue"
          aria-label="Scroll to selected work"
          onClick={(e) => {
            e.preventDefault();
            setWorkVisible(true);
            requestAnimationFrame(() => {
              workSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
        >
          ↓
        </a>
      </section>
      <section
        id="selected-work"
        ref={workSectionRef}
        className={`selected-work${workVisible ? " visible" : " hidden"}`}
      >
        <div className="selected-work-head">
          <h2>Selected Work</h2>
        </div>
        <div className="selected-grid">
          {homeTiles.map((tile) => (
            <a key={tile.title} href="#work" className="selected-tile" onClick={tile.open}>
              <Placeholder label="SQUARE CROP" variant="on-blue" />
              <div className="tile-meta">
                <span className="tile-tag">{tile.tag}</span>
                <span className="tile-title">{tile.title}</span>
              </div>
            </a>
          ))}
        </div>
        <a href="#art" className="archive-link" onClick={onArt}>
          SEE FULL ARCHIVE →
        </a>
      </section>
    </>
  );
}
