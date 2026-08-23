import { useCallback, useEffect, useRef, useState } from "react";
import CustomCursor from "./components/CustomCursor.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import { DesignIndex, ProjectDetail } from "./pages/DesignPage.jsx";
import { ArtIndex, RoomView, WorkView } from "./pages/ArtPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import MusicPage from "./pages/MusicPage.jsx";
import MusiciansPage from "./pages/MusiciansPage.jsx";
import RoonPage from "./pages/RoonPage.jsx";

function top() {
  try {
    window.scrollTo(0, 0);
  } catch {
    /* ignore */
  }
}

export default function App() {
  const heroRef = useRef(null);
  const [page, setPage] = useState("home");
  const [view, setView] = useState("index");
  const [room, setRoom] = useState(null);
  const [workCat, setWorkCat] = useState(null);
  const [from, setFrom] = useState("index");
  const [projectId, setProjectId] = useState(null);
  const [roon, setRoon] = useState({ x: 0, y: 0, r: -8 });
  const [roonDodges, setRoonDodges] = useState(0);
  const [roonCaught, setRoonCaught] = useState(false);
  const roonRef = useRef(roon);
  const dodgesRef = useRef(roonDodges);
  roonRef.current = roon;
  dodgesRef.current = roonDodges;

  useEffect(() => {
    if (page === "home") return;
    if (!roonRef.current.fled) return;
    const resetRoon = { x: 0, y: 0, r: -8 };
    roonRef.current = resetRoon;
    setRoon(resetRoon);
  }, [page]);

  const nav = useCallback(
    (nextPage, e) => {
      if (e) e.preventDefault();
      top();
      setPage(nextPage);
      setView("index");
      setRoom(null);
      setWorkCat(null);
      setFrom("index");
      setProjectId(null);
      if (nextPage === "home") {
        setRoonCaught(false);
        if (page === "roon") {
          dodgesRef.current = 0;
          setRoonDodges(0);
        }
      }
      if (nextPage !== "home") {
        const resetRoon = { x: 0, y: 0, r: -8 };
        roonRef.current = resetRoon;
        setRoon(resetRoon);
      }
    },
    [page]
  );

  const goHome = (e) => nav("home", e);
  const goArt = (e) => nav("art", e);
  const goDesign = (e) => nav("design", e);
  const goAbout = (e) => nav("about", e);
  const goMusic = (e) => nav("music", e);
  const goMusicians = (e) => nav("musicians", e);

  const goStudio = (e) => {
    if (e) e.preventDefault();
    top();
    setPage("about");
    setView("studio");
  };

  const goRoon = (e) => {
    if (e) e.preventDefault();
    top();
    setPage("roon");
    setView("index");
    setRoonCaught(true);
    const resetRoon = { x: 0, y: 0, r: -8 };
    roonRef.current = resetRoon;
    setRoon(resetRoon);
  };

  const openWork = (cat, fromView, roomName, e) => {
    if (e) e.preventDefault();
    top();
    setPage("art");
    setView("work");
    setWorkCat(cat);
    setFrom(fromView);
    setRoom(roomName);
  };

  const openRoom = (name, e) => {
    if (e) e.preventDefault();
    top();
    setPage("art");
    setView("room");
    setRoom(name);
  };

  const openProject = (id, e) => {
    if (e) e.preventDefault();
    top();
    setPage("design");
    setView("project");
    setProjectId(id);
  };

  const goBackFromWork = (e) => {
    if (e) e.preventDefault();
    top();
    if (from === "room" && room) {
      setView("room");
      setWorkCat(null);
    } else {
      setView("index");
      setWorkCat(null);
      setRoom(null);
    }
  };

  const roonFlee = (e) => {
    if (page !== "home" || !heroRef.current) return;
    const r = roonRef.current;
    const dodges = dodgesRef.current;
    const heroEl = heroRef.current;
    const hero = heroEl.getBoundingClientRect();
    const margin = 24;
    const sigW = 88;
    const sigH = 48;
    const minX = margin;
    const minY = margin;
    const maxX = Math.max(minX, hero.width - sigW - margin);
    const maxY = Math.max(minY, hero.height - sigH - margin);

    const featuredEl = heroEl.querySelector(".hero-featured");
    let avoid = null;
    if (featuredEl) {
      const fr = featuredEl.getBoundingClientRect();
      const pad = 20;
      avoid = {
        left: fr.left - hero.left - pad,
        top: fr.top - hero.top - pad,
        right: fr.right - hero.left + pad,
        bottom: fr.bottom - hero.top + pad,
      };
    }

    const overlapsFeatured = (x, y) =>
      !!avoid && x < avoid.right && x + sigW > avoid.left && y < avoid.bottom && y + sigH > avoid.top;

    const randomSpot = () => {
      for (let i = 0; i < 28; i++) {
        const x = minX + Math.random() * Math.max(0, maxX - minX);
        const y = minY + Math.random() * Math.max(0, maxY - minY);
        if (!overlapsFeatured(x, y)) return { x: Math.round(x), y: Math.round(y) };
      }
      const corners = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: minX, y: maxY },
        { x: maxX, y: maxY },
      ];
      return corners.find((p) => !overlapsFeatured(p.x, p.y)) || corners[0];
    };

    const spin = () => Math.round(Math.random() * 40 - 20);

    const teleport = () => {
      const spot = randomSpot();
      return { fled: true, x: spot.x, y: spot.y, r: spin() };
    };

    const commit = (next) => {
      roonRef.current = next;
      dodgesRef.current = dodges + 1;
      setRoon(next);
      setRoonDodges(dodges + 1);
    };

    if (!r.fled || Math.random() < Math.min(0.75, 0.4 + dodges * 0.02)) {
      commit(teleport());
      return;
    }

    const curX = r.x;
    const curY = r.y;
    const cursorX = e ? e.clientX - hero.left : curX;
    const cursorY = e ? e.clientY - hero.top : curY;
    let dx = curX - cursorX;
    let dy = curY - cursorY;
    const mag = Math.hypot(dx, dy) || 1;
    dx /= mag;
    dy /= mag;
    const jump = Math.min(140, 70 + dodges * 3);
    let x = curX + dx * jump + (Math.random() * 40 - 20);
    let y = curY + dy * jump + (Math.random() * 40 - 20);
    x = Math.max(minX, Math.min(maxX, x));
    y = Math.max(minY, Math.min(maxY, y));
    if (overlapsFeatured(x, y)) {
      commit(teleport());
      return;
    }
    commit({ fled: true, x: Math.round(x), y: Math.round(y), r: spin() });
  };

  return (
    <div className="app">
      <CustomCursor />
      <div className="marks" aria-hidden="true">
        <span className="tl">+</span>
        <span className="tr">+</span>
        <span className="bl">+</span>
        <span className="br">+</span>
      </div>
      <Header
        roon={roon}
        roonCaught={roonCaught}
        onHome={goHome}
        onArt={goArt}
        onDesign={goDesign}
        onAbout={goAbout}
        onRoon={goRoon}
        onRoonFlee={roonFlee}
      />
      <div className="home-area">
        {page === "home" && (
          <HomePage
            heroRef={heroRef}
            roon={roon}
            onRoonFlee={roonFlee}
            onRoon={goRoon}
            onArt={goArt}
            onDesign={goDesign}
            onAbout={goAbout}
            onMusic={goMusic}
            onMusicians={goMusicians}
            onOpenWork={(cat, e) => openWork(cat, "index", null, e)}
            onOpenRing={(e) => openProject("ring", e)}
          />
        )}
        {page === "design" && view === "index" && (
          <DesignIndex
            onHome={goHome}
            onOpenSidonia={(e) => openProject("sidonia", e)}
            onOpenRing={(e) => openProject("ring", e)}
          />
        )}
        {page === "design" && view === "project" && (
          <ProjectDetail projectId={projectId} onDesign={goDesign} />
        )}
        {page === "art" && view === "index" && (
          <ArtIndex onHome={goHome} onOpenRoom={openRoom} onOpenWork={openWork} />
        )}
        {page === "art" && view === "room" && (
          <RoomView roomName={room} onArt={goArt} onOpenWork={openWork} />
        )}
        {page === "art" && view === "work" && (
          <WorkView workCat={workCat} from={from} room={room} onBack={goBackFromWork} />
        )}
        {page === "about" && (
          <AboutPage isStudio={view === "studio"} onHome={goHome} onAbout={goAbout} onStudio={goStudio} />
        )}
        {page === "music" && <MusicPage onHome={goHome} />}
        {page === "musicians" && <MusiciansPage onHome={goHome} />}
        {page === "roon" && <RoonPage dodges={roonDodges} onStudio={goStudio} onAbout={goAbout} />}
      </div>
      <Footer />
    </div>
  );
}
