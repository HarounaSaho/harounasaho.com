import { useEffect, useRef, useState } from "react";
import { WORKS } from "../data";
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
  onWorks,
  onAbout,
  onOpenWork,
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

  const featured = WORKS[0];
  const homeTiles = WORKS.slice(0, 4).map((work) => ({
    tag: work.cat,
    title: work.title,
    yr: work.yr,
    image: work.image,
    open: (e) => onOpenWork(work.cat, e),
  }));

  return (
    <>
      <style>{".current-show:hover .current-show-title{text-decoration:underline;text-decoration-color:#ffc20e;text-decoration-thickness:3px;text-underline-offset:6px}"}</style>
      <section ref={heroRef} className={"hero" + (workVisible ? " is-leaving" : "")}>
        {roon?.fled && (
          <a
            href="#roon"
            className="roon fled"
            style={{ left: roon.x, top: roon.y, transform: "rotate(" + roon.r + "deg)" }}
            onMouseEnter={onRoonFlee}
            onClick={onRoon}
          >
            roon
          </a>
        )}
        <a className="current-show" href="/beyond-the-space-in-two/" style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:8,margin:"0 0 28px",textDecoration:"none",color:"#111111"}}>
          <span className="current-show-title" style={{fontFamily:"Arial, Helvetica, sans-serif",fontWeight:"bold",letterSpacing:"-0.035em",fontSize:"clamp(36px, 7vw, 64px)",lineHeight:0.95,color:"#002fa7"}}>CURRENT SHOW</span>
          <span className="current-show-name" style={{fontFamily:"Bodoni Moda, Times New Roman, serif",fontStyle:"italic",fontWeight:500,fontSize:"clamp(22px, 3vw, 32px)",lineHeight:1.1,color:"#111111"}}>Beyond the Space In Two</span>
        </a>
        <div className="sec-tag">SEC · 00 / HOME</div>
        <h1>
          Harouna Saho
          <br />
          <span>Artist and Designer</span>
        </h1>
        <p className="hero-lede">Speaking with visuals</p>
        <div className="hero-stage">
          <a href="#work" className="hero-featured" onClick={(e) => onOpenWork(featured.cat, e)}>
            <img className="work-photo" src={featured.image} alt={featured.title + ", " + featured.yr + ", by Harouna Saho"} />
            <div className="musicians-caption">
              <span className="musicians-caption-title">{featured.title}</span>
              <span>{featured.yr}</span>
            </div>
          </a>
          <Draggable className="musicians-frame" onClick={onWorks}>
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
          <Draggable className="jones-frame" onClick={onWorks}>
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
          <Draggable className="cj-drag" onClick={onWorks}>
            <img className="cj-img" src={cardJitsuSrc} alt="Card-Jitsu" draggable="false" />
          </Draggable>
          <Draggable className="album-drag" onClick={onAbout}>
            <AlbumScrub />
            <div className="musicians-caption">
              <span className="musicians-caption-title">music i like</span>
            </div>
          </Draggable>
          <Draggable className="paint-drag" onClick={onWorks}>
            <PaintWindow />
          </Draggable>
        </div>
        <nav className="hero-nav">
          <a href="#works" onClick={onWorks}>
            WORKS
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
        className={"selected-work" + (workVisible ? " visible" : " hidden")}
      >
        <div className="selected-work-head">
          <h2>Selected Work</h2>
        </div>
        <div className="selected-grid">
          {homeTiles.map((tile) => (
            <a key={tile.title} href="#work" className="selected-tile" onClick={tile.open}>
              <img className="work-photo" src={tile.image} alt={tile.title + ", " + tile.yr + ", by Harouna Saho"} />
              <div className="tile-meta">
                <span className="tile-tag">{tile.tag}</span>
                <span className="tile-title">{tile.title}</span>
              </div>
            </a>
          ))}
        </div>
        <a href="#works" className="archive-link" onClick={onWorks}>
          SEE ALL WORKS →
        </a>
      </section>
    </>
  );
}
