import { useEffect, useRef, useState } from "react";
import { WORKS } from "../data";
import Placeholder from "../components/Placeholder";

function pathLength(d) {
  try {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    svg.style.overflow = "hidden";
    svg.appendChild(p);
    document.body.appendChild(svg);
    const len = p.getTotalLength();
    document.body.removeChild(svg);
    return len || 1;
  } catch {
    return 400;
  }
}

function rasterizeStrokes(svgEl, strokes) {
  if (!svgEl || !strokes.length) return null;
  const rect = svgEl.getBoundingClientRect();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  strokes.forEach((st) => {
    (st.d.match(/[\d.]+,[\d.]+/g) || []).forEach((pair) => {
      const [x, y] = pair.split(",").map(Number);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
  });
  if (!isFinite(minX)) return null;
  const pad = 16;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  const w = Math.max(20, maxX - minX);
  const h = Math.max(20, maxY - minY);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.translate(-minX, -minY);
  strokes.forEach((st) => {
    const path = new Path2D(st.d);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (st.filter && st.filter !== "none") {
      ctx.strokeStyle = st.color || "#111111";
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = (st.width || 3) * 0.7;
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6);
        ctx.stroke(path);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.strokeStyle = st.color || "#111111";
      ctx.lineWidth = st.width || 3;
      ctx.stroke(path);
    }
  });
  const size = Math.max(w, h);
  return {
    src: canvas.toDataURL("image/png"),
    size,
    cx: rect.left + minX + w / 2,
    cy: rect.top + minY + h / 2,
  };
}

export default function HomePage({ onArt, onDesign, onAbout, onOpenWork, onOpenRing }) {
  const svgRef = useRef(null);
  const floatRef = useRef(null);
  const workSectionRef = useRef(null);
  const floatRaf = useRef(0);
  const animTimer = useRef(0);
  const drawingRef = useRef(false);
  const pointsRef = useRef(null);
  const moveRaf = useRef(0);
  const heroRef = useRef(null);

  const [strokes, setStrokes] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [curPoints, setCurPoints] = useState(null);
  const [tool, setTool] = useState("pencil");
  const [animating, setAnimating] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [animMeta, setAnimMeta] = useState([]);
  const [floatingSrc, setFloatingSrc] = useState(null);
  const [floatBox, setFloatBox] = useState({ x: 0, y: 0, size: 140 });
  const [workVisible, setWorkVisible] = useState(false);

  useEffect(() => {
    const el = workSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => setWorkVisible(entries[0].isIntersecting),
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(floatRaf.current);
      clearTimeout(animTimer.current);
    };
  }, []);

  const stopFloat = () => {
    cancelAnimationFrame(floatRaf.current);
  };

  const startFloating = (currentStrokes) => {
    const shot = rasterizeStrokes(svgRef.current, currentStrokes);
    if (!shot || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const vx = (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random());
    const vy = (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random());
    const vel = { vx, vy };
    const bounds = { w: rect.width, h: rect.height };
    const startX = Math.max(0, Math.min(rect.width - shot.size, shot.cx - rect.left - shot.size / 2));
    const startY = Math.max(0, Math.min(rect.height - shot.size, shot.cy - rect.top - shot.size / 2));
    setStrokes([]);
    setFloatingSrc(shot.src);
    setFloatBox({ x: startX, y: startY, size: shot.size });

    const pos = { x: startX, y: startY };
    const step = () => {
      const size = shot.size;
      pos.x += vel.vx;
      pos.y += vel.vy;
      if (pos.x <= 0 || pos.x >= bounds.w - size) {
        vel.vx *= -1;
        pos.x = Math.max(0, Math.min(bounds.w - size, pos.x));
      }
      if (pos.y <= 0 || pos.y >= bounds.h - size) {
        vel.vy *= -1;
        pos.y = Math.max(0, Math.min(bounds.h - size, pos.y));
      }
      const node = floatRef.current;
      if (node) {
        node.style.left = `${pos.x}px`;
        node.style.top = `${pos.y}px`;
      }
      floatRaf.current = requestAnimationFrame(step);
    };
    stopFloat();
    floatRaf.current = requestAnimationFrame(step);
  };

  const animateDoodle = (e) => {
    e.stopPropagation();
    if (!strokes.length || animating) return;
    const speed = 900;
    let elapsed = 0;
    const meta = strokes.map((st) => {
      if (st.isEraser) return { skip: true, delay: 0, dur: 0, len: 0 };
      const len = pathLength(st.d);
      const dur = Math.max(0.15, len / speed);
      const delay = elapsed;
      elapsed += dur;
      return { skip: false, delay, dur, len };
    });
    setAnimating(true);
    setAnimKey((k) => k + 1);
    setAnimMeta(meta);
    clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => {
      setAnimating(false);
      startFloating(strokes);
    }, elapsed * 1000 + 200);
  };

  const pointFromEvent = (e) => {
    const rect = (heroRef.current || e.currentTarget).getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const startStroke = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest("a, button")) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const pt = pointFromEvent(e);
    drawingRef.current = true;
    pointsRef.current = [pt];
    setDrawing(true);
    setCurPoints([pt]);
  };

  const moveStroke = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    const next = (pointsRef.current || []).concat([pointFromEvent(e)]);
    pointsRef.current = next;
    if (!moveRaf.current) {
      moveRaf.current = requestAnimationFrame(() => {
        setCurPoints(pointsRef.current);
        moveRaf.current = 0;
      });
    }
  };

  const endStroke = (e) => {
    if (e?.currentTarget && e.pointerId != null) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    if (moveRaf.current) {
      cancelAnimationFrame(moveRaf.current);
      moveRaf.current = 0;
    }
    const pts = pointsRef.current;
    if (!drawingRef.current || !pts || pts.length < 2) {
      drawingRef.current = false;
      pointsRef.current = null;
      setDrawing(false);
      setCurPoints(null);
      return;
    }
    const d = "M" + pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L");
    const isEraser = tool === "eraser";
    setStrokes((prev) =>
      prev.concat([
        {
          d,
          color: isEraser ? "#ffffff" : "#111111",
          width: isEraser ? 18 : 3,
          filter: isEraser ? "none" : "url(#pencilTexture)",
          isEraser,
        },
      ])
    );
    drawingRef.current = false;
    pointsRef.current = null;
    setDrawing(false);
    setCurPoints(null);
  };

  const clearStrokes = (e) => {
    e.stopPropagation();
    stopFloat();
    clearTimeout(animTimer.current);
    setStrokes([]);
    setFloatingSrc(null);
    setAnimating(false);
  };

  const liveStrokes = (() => {
    const list =
      drawing && curPoints && curPoints.length > 1
        ? strokes.concat([
            {
              d: "M" + curPoints.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L"),
              color: tool === "eraser" ? "#ffffff" : "#111111",
              width: tool === "eraser" ? 18 : 3,
              filter: tool === "eraser" ? "none" : "url(#pencilTexture)",
            },
          ])
        : strokes;
    return list.map((st, i) => {
      if (!animating) return { ...st, key: "s" + i, animStyle: undefined };
      const meta = animMeta[i];
      if (!meta || meta.skip || st.isEraser) {
        return { ...st, key: "s" + i + "-play" + animKey, animStyle: undefined };
      }
      return {
        ...st,
        key: "s" + i + "-play" + animKey,
        animStyle: {
          "--len": meta.len,
          strokeDasharray: meta.len,
          animation: `drawStroke ${meta.dur}s linear ${meta.delay.toFixed(2)}s both`,
        },
      };
    });
  })();

  const homeTiles = [
    { tag: WORKS[8].cat, title: WORKS[8].title, open: (e) => onOpenWork(WORKS[8].cat, e) },
    { tag: WORKS[3].cat, title: WORKS[3].title, open: (e) => onOpenWork(WORKS[3].cat, e) },
    { tag: "DESIGN", title: "Ring, concept", open: onOpenRing },
    { tag: WORKS[6].cat, title: WORKS[6].title, open: (e) => onOpenWork(WORKS[6].cat, e) },
  ];

  return (
    <>
      <section
        ref={heroRef}
        className="hero"
        onPointerDown={startStroke}
        onPointerMove={moveStroke}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
      >
        <svg ref={svgRef} className="hero-svg">
          <filter id="pencilTexture">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
          </filter>
          {liveStrokes.map((stroke) => (
            <path
              key={stroke.key}
              d={stroke.d}
              fill="none"
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={stroke.filter}
              style={stroke.animStyle}
            />
          ))}
        </svg>
        {floatingSrc && (
          <div
            ref={floatRef}
            className="floating-doodle"
            style={{
              left: floatBox.x,
              top: floatBox.y,
              width: floatBox.size,
              height: floatBox.size,
              backgroundImage: `url(${floatingSrc})`,
            }}
          />
        )}
        <div className="doodle-toolbar" onPointerDown={(e) => e.stopPropagation()}>
          <div className="doodle-tools">
            <button
              type="button"
              className={`tool-btn${tool === "pencil" ? " active" : ""}`}
              onClick={() => setTool("pencil")}
            >
              PENCIL
            </button>
            <button
              type="button"
              className={`tool-btn${tool === "eraser" ? " active" : ""}`}
              onClick={() => setTool("eraser")}
            >
              ERASER
            </button>
            <button type="button" className="tool-btn trash" onClick={clearStrokes}>
              TRASH
            </button>
          </div>
          <div className="doodle-help">HELP ME DECORATE</div>
          <button type="button" className="animate-btn" onClick={animateDoodle}>
            {animating ? "PLAYING…" : "ANIMATE"}
          </button>
        </div>
        <div className="sec-tag">SEC · 00 / HOME</div>
        <h1>
          Harouna Saho
          <br />
          <span>Artist and Designer</span>
        </h1>
        <p className="hero-lede">Visual language is the language I understand best.</p>
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
        <a href="#selected-work" className="scroll-cue" aria-label="Scroll to selected work">
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
