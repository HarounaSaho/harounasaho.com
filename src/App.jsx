import { useCallback, useRef, useState } from "react";
import CustomCursor from "./components/CustomCursor.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import HomePage from "./pages/HomePage.jsx";
import { DesignIndex, ProjectDetail } from "./pages/DesignPage.jsx";
import { ArtIndex, RoomView, WorkView } from "./pages/ArtPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import RoonPage from "./pages/RoonPage.jsx";

function top() {
  try {
    window.scrollTo(0, 0);
  } catch {
    /* ignore */
  }
}

export default function App() {
  const homeAreaRef = useRef(null);
  const [page, setPage] = useState("home");
  const [view, setView] = useState("index");
  const [room, setRoom] = useState(null);
  const [workCat, setWorkCat] = useState(null);
  const [from, setFrom] = useState("index");
  const [projectId, setProjectId] = useState(null);
  const [roon, setRoon] = useState({ x: 0, y: 0, r: -8 });
  const [roonDodges, setRoonDodges] = useState(0);
  const roonRef = useRef(roon);
  const dodgesRef = useRef(roonDodges);
  roonRef.current = roon;
  dodgesRef.current = roonDodges;

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
      if (nextPage === "home" && page === "roon") {
        dodgesRef.current = 0;
        setRoonDodges(0);
      }
    },
    [page]
  );

  const goHome = (e) => nav("home", e);
  const goArt = (e) => nav("art", e);
  const goDesign = (e) => nav("design", e);
  const goAbout = (e) => nav("about", e);

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
    const r = roonRef.current;
    const dodges = dodgesRef.current;
    const rect = homeAreaRef.current?.getBoundingClientRect?.() ?? {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const minX = rect.left;
    const minY = rect.top;
    const w = rect.width;
    const h = rect.height;
    const margin = 24;

    if (!r.fled) {
      const x = minX + margin + Math.random() * Math.max(60, w - 140 - margin * 2);
      const y = minY + margin + Math.random() * Math.max(60, h - 100 - margin * 2);
      const next = { fled: true, x: Math.round(x), y: Math.round(y), r: Math.round(Math.random() * 40 - 20) };
      roonRef.current = next;
      dodgesRef.current = dodges + 1;
      setRoon(next);
      setRoonDodges(dodges + 1);
      return;
    }

    const curX = r.x;
    const curY = r.y;
    if (Math.random() < Math.min(0.75, 0.4 + dodges * 0.02)) {
      const x = minX + margin + Math.random() * Math.max(60, w - 140 - margin * 2);
      const y = minY + margin + Math.random() * Math.max(60, h - 100 - margin * 2);
      const next = { fled: true, x: Math.round(x), y: Math.round(y), r: Math.round(Math.random() * 40 - 20) };
      roonRef.current = next;
      dodgesRef.current = dodges + 1;
      setRoon(next);
      setRoonDodges(dodges + 1);
      return;
    }

    const cursorX = e ? e.clientX : curX;
    const cursorY = e ? e.clientY : curY;
    let dx = curX - cursorX;
    let dy = curY - cursorY;
    const mag = Math.hypot(dx, dy) || 1;
    dx /= mag;
    dy /= mag;
    const jump = Math.min(140, 70 + dodges * 3);
    let x = curX + dx * jump + (Math.random() * 40 - 20);
    let y = curY + dy * jump + (Math.random() * 40 - 20);
    x = Math.max(minX + margin, Math.min(minX + w - 100, x));
    y = Math.max(minY + margin, Math.min(minY + h - 60, y));
    const next = { fled: true, x: Math.round(x), y: Math.round(y), r: Math.round(Math.random() * 40 - 20) };
    roonRef.current = next;
    dodgesRef.current = dodges + 1;
    setRoon(next);
    setRoonDodges(dodges + 1);
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
        onHome={goHome}
        onArt={goArt}
        onDesign={goDesign}
        onAbout={goAbout}
        onRoon={goRoon}
        onRoonFlee={roonFlee}
      />
      <div className="home-area" ref={homeAreaRef}>
        {page === "home" && (
          <HomePage
            onArt={goArt}
            onDesign={goDesign}
            onAbout={goAbout}
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
        {page === "roon" && <RoonPage dodges={roonDodges} onStudio={goStudio} onAbout={goAbout} />}
      </div>
      <Footer />
    </div>
  );
}
