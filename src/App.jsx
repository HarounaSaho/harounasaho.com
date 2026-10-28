import { useCallback, useEffect, useRef, useState } from "react";
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
  const roonAnchor = useRef(null);
  const roonFleeRef = useRef(null);
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

  const openProject = (id, fromView, e) => {
    if (e) e.preventDefault();
    if (id === "ring") return;
    top();
    const origin = fromView === "design" ? "design" : "art";
    setPage(origin);
    setView("project");
    setProjectId(id);
    setFrom(origin);
  };

  const goBackFromWork = (e) => {
    if (e) e.preventDefault();
    top();
    if (from === "room" && room) {
      setPage("art");
      setView("room");
      setWorkCat(null);
    } else {
      setPage("art");
      setView("index");
      setWorkCat(null);
      setRoom(null);
    }
  };

  const roonFlee = (e) => {
    if (page !== "home" || !heroRef.current) return;
    const r = roonRef.current;
    const dodges = dodgesRef.current;
    const hero = heroRef.current.getBoundingClientRect();
    const margin = 24;
    const sigW = 88;
    const sigH = 48;
    const minX = margin;
    const minY = margin;
    const maxX = Math.max(minX, hero.width - sigW - margin);
    const maxY = Math.max(minY, hero.height - sigH - margin);

    const teleport = () => ({
      fled: true,
      x: Math.round(minX + Math.random() * Math.max(0, maxX - minX)),
      y: Math.round(minY + Math.random() * Math.max(0, maxY - minY)),
      r: Math.round(Math.random() * 40 - 20),
    });

    const commit = (next) => {
      roonRef.current = next;
      dodgesRef.current = dodges + 1;
      setRoon(next);
      setRoonDodges(dodges + 1);
    };

    if (!r.fled) {
      const next = teleport();
      const el = roonAnchor.current;
      if (el) {
        el.style.transition = "none";
        el.style.position = "fixed";
        el.style.left = hero.left + next.x + "px";
        el.style.top = hero.top + next.y + "px";
        el.style.margin = "0";
        el.style.transform = "rotate(" + next.r + "deg)";
        el.style.zIndex = "90";
        el.style.pointerEvents = "none";
      }
      commit(next);
      return;
    }

    if (Math.random() < Math.min(0.75, 0.4 + dodges * 0.02)) {
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
    commit({ fled: true, x: Math.round(x), y: Math.round(y), r: Math.round(Math.random() * 40 - 20) });
  };
  roonFleeRef.current = roonFlee;

  useEffect(() => {
    if (page !== "home" || roon.fled || roonCaught) return;
    const pad = 72;
    const onMove = (e) => {
      const el = roonAnchor.current;
      if (!el || roonRef.current.fled) return;
      const box = el.getBoundingClientRect();
      const near =
        e.clientX >= box.left - pad &&
        e.clientX <= box.right + pad &&
        e.clientY >= box.top - pad &&
        e.clientY <= box.bottom + pad;
      if (near) roonFleeRef.current(e);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [page, roon.fled, roonCaught]);

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
        roonAnchor={roonAnchor}
        chase={page === "home"}
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
            onOpenWork={(cat, e) => openWork(cat, "index", null, e)}
          />
        )}
        {page === "art" && view === "index" && (
          <ArtIndex onHome={goHome} onOpenRoom={openRoom} onOpenWork={openWork} />
        )}
        {page === "design" && view === "index" && (
          <DesignIndex
            onHome={goHome}
            onOpenSidonia={(e) => openProject("sidonia", "design", e)}
          />
        )}
        {page === "design" && view === "project" && (
          <ProjectDetail projectId={projectId} onBack={goDesign} backLabel="DESIGN" />
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
