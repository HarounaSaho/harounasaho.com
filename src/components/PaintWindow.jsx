import { useEffect, useRef, useState } from "react";

const PALETTE = [
  "#000000",
  "#808080",
  "#800000",
  "#808000",
  "#008000",
  "#008080",
  "#000080",
  "#800080",
  "#808040",
  "#004040",
  "#0080ff",
  "#004080",
  "#400080",
  "#800040",
  "#ffffff",
  "#c0c0c0",
  "#ff0000",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#0000ff",
  "#ff00ff",
  "#ffff80",
  "#80ffff",
  "#80c0ff",
  "#8080ff",
  "#ff80c0",
  "#ff8000",
];

const TOOLS = [
  { id: "select-free", label: "Free-Form Select" },
  { id: "select-rect", label: "Select" },
  { id: "eraser", label: "Eraser" },
  { id: "fill", label: "Fill With Color" },
  { id: "eyedropper", label: "Pick Color" },
  { id: "magnifier", label: "Magnifier" },
  { id: "pencil", label: "Pencil" },
  { id: "brush", label: "Brush" },
  { id: "airbrush", label: "Airbrush" },
  { id: "text", label: "Text" },
  { id: "line", label: "Line" },
  { id: "curve", label: "Curve" },
  { id: "rect", label: "Rectangle" },
  { id: "polygon", label: "Polygon" },
  { id: "ellipse", label: "Ellipse" },
  { id: "roundrect", label: "Rounded Rectangle" },
];

const DRAW_TOOLS = new Set(["eraser", "fill", "eyedropper", "pencil", "brush", "airbrush", "line", "rect", "ellipse", "roundrect"]);
const SHAPE_TOOLS = new Set(["line", "rect", "ellipse", "roundrect"]);
const MENUS = ["File", "Edit", "View", "Image", "Options", "Help"];

function toolWidth(tool, size) {
  if (tool === "pencil") return [1, 2, 3, 4][size] || 1;
  if (tool === "brush") return [4, 8, 12, 18][size] || 8;
  if (tool === "eraser") return [8, 14, 22, 32][size] || 14;
  if (tool === "airbrush") return [10, 16, 24, 32][size] || 16;
  return [1, 2, 3, 4, 5][size] || 1;
}

function seededSpray(x, y, radius, n, seed) {
  const dots = [];
  let s = seed + 1;
  for (let i = 0; i < n; i++) {
    s = (s * 16807) % 2147483647;
    const a = (s / 2147483647) * Math.PI * 2;
    s = (s * 16807) % 2147483647;
    const d = Math.sqrt(s / 2147483647) * radius;
    dots.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
  }
  return dots;
}

function drawStroke(ctx, st) {
  if (st.tool === "eraser") ctx.globalCompositeOperation = "destination-out";
  else ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = st.color;
  ctx.fillStyle = st.color;
  ctx.lineCap = st.tool === "pencil" ? "butt" : "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = st.width;

  if (st.tool === "airbrush") {
    (st.points || []).forEach((p, i) => {
      seededSpray(p[0], p[1], st.width, 14, i * 97 + Math.round(p[0] + p[1])).forEach(([dx, dy]) => {
        ctx.fillRect(dx, dy, 1, 1);
      });
    });
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  if (st.tool === "line" && st.points?.length >= 2) {
    const a = st.points[0];
    const b = st.points[st.points.length - 1];
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  } else if (st.tool === "rect" && st.points?.length >= 2) {
    const a = st.points[0];
    const b = st.points[st.points.length - 1];
    const x = Math.min(a[0], b[0]);
    const y = Math.min(a[1], b[1]);
    const w = Math.abs(b[0] - a[0]);
    const h = Math.abs(b[1] - a[1]);
    if (st.fillMode === "fill") ctx.fillRect(x, y, w, h);
    else if (st.fillMode === "both") {
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, w - 1), Math.max(0, h - 1));
    } else ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, w - 1), Math.max(0, h - 1));
  } else if ((st.tool === "ellipse" || st.tool === "roundrect") && st.points?.length >= 2) {
    const a = st.points[0];
    const b = st.points[st.points.length - 1];
    const x = Math.min(a[0], b[0]);
    const y = Math.min(a[1], b[1]);
    const w = Math.max(1, Math.abs(b[0] - a[0]));
    const h = Math.max(1, Math.abs(b[1] - a[1]));
    ctx.beginPath();
    if (st.tool === "roundrect") {
      const r = Math.min(12, w / 4, h / 4);
      if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
      else {
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      }
    } else ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    if (st.fillMode === "fill") ctx.fill();
    else if (st.fillMode === "both") {
      ctx.fill();
      ctx.stroke();
    } else ctx.stroke();
  } else if (st.points?.length) {
    ctx.beginPath();
    ctx.moveTo(st.points[0][0], st.points[0][1]);
    for (let i = 1; i < st.points.length; i++) ctx.lineTo(st.points[i][0], st.points[i][1]);
    if (st.points.length === 1) ctx.lineTo(st.points[0][0] + 0.01, st.points[0][1]);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
}

function floodFill(ctx, x, y, fillColor) {
  const { width: w, height: h } = ctx.canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const x0 = Math.max(0, Math.min(w - 1, Math.round(x)));
  const y0 = Math.max(0, Math.min(h - 1, Math.round(y)));
  const start = (y0 * w + x0) * 4;
  const sr = data[start];
  const sg = data[start + 1];
  const sb = data[start + 2];
  const sa = data[start + 3];
  const parsed = parseInt(fillColor.slice(1), 16);
  const fr = (parsed >> 16) & 255;
  const fg = (parsed >> 8) & 255;
  const fb = parsed & 255;
  if (sr === fr && sg === fg && sb === fb && sa === 255) return;
  const match = (i) => data[i] === sr && data[i + 1] === sg && data[i + 2] === sb && data[i + 3] === sa;
  const stack = [x0, y0];
  while (stack.length) {
    const cy = stack.pop();
    const cx = stack.pop();
    let px = cx;
    while (px >= 0 && match((cy * w + px) * 4)) px--;
    px++;
    let spanUp = false;
    let spanDown = false;
    while (px < w && match((cy * w + px) * 4)) {
      const i = (cy * w + px) * 4;
      data[i] = fr;
      data[i + 1] = fg;
      data[i + 2] = fb;
      data[i + 3] = 255;
      if (cy > 0 && match(((cy - 1) * w + px) * 4)) {
        if (!spanUp) {
          stack.push(px, cy - 1);
          spanUp = true;
        }
      } else spanUp = false;
      if (cy < h - 1 && match(((cy + 1) * w + px) * 4)) {
        if (!spanDown) {
          stack.push(px, cy + 1);
          spanDown = true;
        }
      } else spanDown = false;
      px++;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function cropDrawing(canvas) {
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  const { data } = ctx.getImageData(0, 0, w, h);
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return null;
  const pad = 10;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w, maxX + pad);
  maxY = Math.min(h, maxY + pad);
  const cw = Math.max(20, maxX - minX);
  const ch = Math.max(20, maxY - minY);
  const out = document.createElement("canvas");
  out.width = cw;
  out.height = ch;
  out.getContext("2d").drawImage(canvas, minX, minY, cw, ch, 0, 0, cw, ch);
  const size = Math.max(cw, ch);
  return { src: out.toDataURL("image/png"), size, x: minX, y: minY, w: cw, h: ch };
}

function ToolIcon({ id }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    "aria-hidden": "true",
    shapeRendering: "crispEdges",
  };
  switch (id) {
    case "select-free":
      return (
        <svg {...common}>
          <path d="M3 2h2v1H4v2H3V2zm4 0h2v1H7V2zm4 0h2v1h-1v2h-1V2zM2 6h1v2H2V6zm11 0h1v2h-1V6zM2 10h1v2H2v-2zm11 1h1v2h-1v-2zM3 13h2v1H3v-1zm4 0h2v1H7v-1zm4 0h2v1h-2v-1z" fill="#000" />
          <path d="M5 5h6v6H5z" fill="none" stroke="#000" strokeDasharray="1 1" />
        </svg>
      );
    case "select-rect":
      return (
        <svg {...common}>
          <rect x="2" y="3" width="12" height="10" fill="none" stroke="#000" strokeDasharray="1 1" />
        </svg>
      );
    case "eraser":
      return (
        <svg {...common}>
          <path d="M3 9l4-4 6 6-4 4H5L3 13V9z" fill="#f7b6c2" stroke="#000" />
          <path d="M7 5l6 6" stroke="#000" />
          <path d="M5 13h4" stroke="#000" />
        </svg>
      );
    case "fill":
      return (
        <svg {...common}>
          <path d="M8 2l5 5-6 6-5-5 6-6z" fill="#00a2e8" stroke="#000" />
          <path d="M3 13h4l1 2H4z" fill="#ff7a18" stroke="#000" />
          <circle cx="11" cy="4" r="1" fill="#000" />
        </svg>
      );
    case "eyedropper":
      return (
        <svg {...common}>
          <path d="M10 2l4 4-2 1-3-3 1-2z" fill="#c0c0c0" stroke="#000" />
          <path d="M9 6L4 11v3h3l5-5" fill="#000080" stroke="#000" />
        </svg>
      );
    case "magnifier":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="4.5" fill="#fff" stroke="#000" />
          <path d="M10 10l4 4" stroke="#000" strokeWidth="2" />
        </svg>
      );
    case "pencil":
      return (
        <svg {...common}>
          <path d="M3 13l2-1 7-7-1-1-7 7-1 2z" fill="#ffc90e" stroke="#000" />
          <path d="M11 4l1 1 1-1-1-1z" fill="#f0d0c0" stroke="#000" />
          <path d="M3 13l1-2" stroke="#000" />
        </svg>
      );
    case "brush":
      return (
        <svg {...common}>
          <path d="M7 2h3l1 6H6L7 2z" fill="#b5e61d" stroke="#000" />
          <path d="M6 8h5l-1 3H7z" fill="#808080" stroke="#000" />
          <path d="M7 11h3v3H8l-1-1v-2z" fill="#000" />
        </svg>
      );
    case "airbrush":
      return (
        <svg {...common}>
          <path d="M6 3h5l2 4H9L6 3z" fill="#c0c0c0" stroke="#000" />
          <path d="M7 7h4v5H8l-1-2V7z" fill="#808080" stroke="#000" />
          <path d="M4 9h2M3 11h3M4 13h2" stroke="#000" />
        </svg>
      );
    case "text":
      return (
        <svg {...common}>
          <path d="M3 3h10v2H9v8H7V5H3V3z" fill="#000" />
        </svg>
      );
    case "line":
      return (
        <svg {...common}>
          <path d="M2 13L14 3" stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    case "curve":
      return (
        <svg {...common}>
          <path d="M2 12C6 12 6 4 8 4s2 8 6 8" fill="none" stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    case "rect":
      return (
        <svg {...common}>
          <rect x="2" y="4" width="12" height="8" fill="none" stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    case "polygon":
      return (
        <svg {...common}>
          <path d="M8 2l6 4v6l-6 3-6-3V6z" fill="none" stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    case "ellipse":
      return (
        <svg {...common}>
          <ellipse cx="8" cy="8" rx="6" ry="4.5" fill="none" stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    case "roundrect":
      return (
        <svg {...common}>
          <rect x="2" y="4" width="12" height="8" rx="2" fill="none" stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function PaintWindow() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const layerRef = useRef(null);
  const floatRef = useRef(null);
  const strokesRef = useRef([]);
  const drawingRef = useRef(false);
  const pointsRef = useRef(null);
  const toolRef = useRef("pencil");
  const colorRef = useRef("#000000");
  const bgRef = useRef("#ffffff");
  const sizeRef = useRef(1);
  const fillModeRef = useRef("stroke");
  const strokeColorRef = useRef("#000000");
  const animTimer = useRef(0);
  const floatRaf = useRef(0);
  const menuRef = useRef(null);

  const [tool, setTool] = useState("pencil");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(1);
  const [fillMode, setFillMode] = useState("stroke");
  const [menu, setMenu] = useState(null);
  const [status, setStatus] = useState("For Help, click Help Topics on the Help Menu.");
  const [coords, setCoords] = useState("0,0");
  const [animating, setAnimating] = useState(false);
  const [floatingSrc, setFloatingSrc] = useState(null);
  const [floatBox, setFloatBox] = useState({ x: 0, y: 0, size: 120 });
  const [helpOpen, setHelpOpen] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  toolRef.current = tool;
  colorRef.current = fg;
  bgRef.current = bg;
  sizeRef.current = size;
  fillModeRef.current = fillMode;

  const replay = (ctx) => {
    strokesRef.current.forEach((st) => {
      if (st.tool === "fill") {
        ctx.globalCompositeOperation = "source-over";
        floodFill(ctx, st.x, st.y, st.color);
      } else drawStroke(ctx, st);
    });
  };

  const rebuildLayer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let layer = layerRef.current;
    if (!layer || layer.width !== canvas.width || layer.height !== canvas.height) {
      layer = document.createElement("canvas");
      layer.width = canvas.width;
      layer.height = canvas.height;
      layerRef.current = layer;
    }
    const lctx = layer.getContext("2d");
    lctx.clearRect(0, 0, layer.width, layer.height);
    replay(lctx);
  };

  const paint = (preview, fromStrokes = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (fromStrokes) {
      replay(ctx);
      return;
    }
    if (!layerRef.current || layerRef.current.width !== canvas.width) rebuildLayer();
    ctx.drawImage(layerRef.current, 0, 0);
    if (preview) drawStroke(ctx, preview);
  };

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const nextW = Math.max(120, Math.floor(r.width));
      const nextH = Math.max(120, Math.floor(r.height));
      if (canvas.width === nextW && canvas.height === nextH) return;
      canvas.width = nextW;
      canvas.height = nextH;
      rebuildLayer();
      paint();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(null);
    };
    document.addEventListener("pointerdown", onDown);
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        clearCanvas();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(floatRaf.current);
      clearTimeout(animTimer.current);
    };
  }, []);

  const pointFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const startFloating = () => {
    const shot = cropDrawing(canvasRef.current);
    if (!shot || !wrapRef.current) return;
    strokesRef.current = [];
    setStrokeCount(0);
    rebuildLayer();
    paint();
    const bounds = wrapRef.current.getBoundingClientRect();
    const vx = (Math.random() < 0.5 ? -1 : 1) * (1.1 + Math.random());
    const vy = (Math.random() < 0.5 ? -1 : 1) * (1.1 + Math.random());
    const vel = { vx, vy };
    const startX = Math.max(0, Math.min(bounds.width - shot.size, shot.x));
    const startY = Math.max(0, Math.min(bounds.height - shot.size, shot.y));
    setFloatingSrc(shot.src);
    setFloatBox({ x: startX, y: startY, size: shot.size });
    const pos = { x: startX, y: startY };
    const step = () => {
      pos.x += vel.vx;
      pos.y += vel.vy;
      if (pos.x <= 0 || pos.x >= bounds.width - shot.size) {
        vel.vx *= -1;
        pos.x = Math.max(0, Math.min(bounds.width - shot.size, pos.x));
      }
      if (pos.y <= 0 || pos.y >= bounds.height - shot.size) {
        vel.vy *= -1;
        pos.y = Math.max(0, Math.min(bounds.height - shot.size, pos.y));
      }
      if (floatRef.current) {
        floatRef.current.style.left = `${pos.x}px`;
        floatRef.current.style.top = `${pos.y}px`;
      }
      floatRaf.current = requestAnimationFrame(step);
    };
    cancelAnimationFrame(floatRaf.current);
    floatRaf.current = requestAnimationFrame(step);
  };

  const animateDoodle = () => {
    setMenu(null);
    const list = strokesRef.current.filter((st) => st.tool !== "fill" && st.points?.length);
    if (!list.length || animating) return;
    setAnimating(true);
    setStatus("Playing animation...");
    let index = 0;
    let step = 1;
    const saved = strokesRef.current.slice();
    const tick = () => {
      const st = list[index];
      if (!st) {
        setAnimating(false);
        strokesRef.current = saved;
        rebuildLayer();
        paint();
        startFloating();
        setStatus("For Help, click Help Topics on the Help Menu.");
        return;
      }
      const total = st.points.length;
      const shown = Math.max(2, Math.ceil((total * step) / 8));
      strokesRef.current = saved.slice(0, saved.indexOf(st)).concat([{ ...st, points: st.points.slice(0, shown) }]);
      paint(null, true);
      if (shown >= total) {
        index += 1;
        step = 1;
      } else step += 1;
      animTimer.current = setTimeout(tick, 28);
    };
    strokesRef.current = [];
    paint(null, true);
    tick();
  };

  const clearCanvas = () => {
    setMenu(null);
    cancelAnimationFrame(floatRaf.current);
    clearTimeout(animTimer.current);
    strokesRef.current = [];
    setStrokeCount(0);
    setFloatingSrc(null);
    setAnimating(false);
    rebuildLayer();
    paint();
    setStatus("New image");
  };

  const undo = () => {
    setMenu(null);
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
    rebuildLayer();
    paint();
    setStatus("Undo");
  };

  const setActiveTool = (id) => {
    setTool(id);
    const item = TOOLS.find((t) => t.id === id);
    setStatus(item ? item.label : "");
    if (id === "pencil") setSize(0);
    if (id === "brush" || id === "airbrush") setSize(1);
    if (id === "eraser") setSize(1);
    if (SHAPE_TOOLS.has(id)) setSize(0);
  };

  const startStroke = (e) => {
    if (animating) return;
    if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 2) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const pt = pointFromEvent(e);
    const current = toolRef.current;
    const color = e.button === 2 ? bgRef.current : colorRef.current;

    if (current === "eyedropper") {
      const ctx = canvasRef.current.getContext("2d");
      const pixel = ctx.getImageData(Math.round(pt[0]), Math.round(pt[1]), 1, 1).data;
      if (pixel[3] < 8) return;
      const hex = `#${[pixel[0], pixel[1], pixel[2]].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
      if (e.button === 2) setBg(hex);
      else setFg(hex);
      setActiveTool("pencil");
      return;
    }

    if (current === "fill") {
      strokesRef.current = strokesRef.current.concat([{ tool: "fill", x: pt[0], y: pt[1], color }]);
      setStrokeCount(strokesRef.current.length);
      rebuildLayer();
      paint();
      return;
    }

    if (current === "magnifier" || current === "text" || current === "select-free" || current === "select-rect" || current === "curve" || current === "polygon") {
      setStatus(`${TOOLS.find((t) => t.id === current)?.label || "Tool"} — try Pencil, Brush, or Eraser`);
      return;
    }

    drawingRef.current = true;
    pointsRef.current = [pt];
    strokeColorRef.current = current === "eraser" ? "#ffffff" : color;
    paint({
      tool: current,
      points: [pt],
      color: strokeColorRef.current,
      width: toolWidth(current, sizeRef.current),
      fillMode: fillModeRef.current,
    });
  };

  const moveStroke = (e) => {
    const pt = pointFromEvent(e);
    setCoords(`${Math.max(0, Math.round(pt[0]))},${Math.max(0, Math.round(pt[1]))}`);
    if (!drawingRef.current) return;
    e.preventDefault();
    const current = toolRef.current;
    let next;
    if (SHAPE_TOOLS.has(current)) next = [pointsRef.current[0], pt];
    else next = (pointsRef.current || []).concat([pt]);
    pointsRef.current = next;
    paint({
      tool: current,
      points: next,
      color: strokeColorRef.current,
      width: toolWidth(current, sizeRef.current),
      fillMode: fillModeRef.current,
    });
  };

  const endStroke = (e) => {
    if (e?.currentTarget && e.pointerId != null) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    if (!drawingRef.current) return;
    const pts = pointsRef.current;
    drawingRef.current = false;
    pointsRef.current = null;
    if (!pts || !pts.length) {
      paint();
      return;
    }
    const current = toolRef.current;
    if (!SHAPE_TOOLS.has(current) && pts.length < 2) {
      paint();
      return;
    }
    strokesRef.current = strokesRef.current.concat([
      {
        tool: current,
        points: pts,
        color: strokeColorRef.current,
        width: toolWidth(current, sizeRef.current),
        fillMode: fillModeRef.current,
      },
    ]);
    setStrokeCount(strokesRef.current.length);
    rebuildLayer();
    paint();
  };

  const pickSwatch = (color, e) => {
    e.preventDefault();
    if (e.button === 2) setBg(color);
    else setFg(color);
  };

  const sizeCount = SHAPE_TOOLS.has(tool) ? 5 : 4;

  return (
    <div className="paint-window" onContextMenu={(e) => e.preventDefault()}>
      <div className="paint-title">
        <span className="paint-title-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" shapeRendering="crispEdges">
            <circle cx="6" cy="9" r="5" fill="#ff7a18" stroke="#000" />
            <circle cx="9" cy="6" r="3.5" fill="#ed1c24" stroke="#000" />
            <circle cx="11" cy="10" r="3" fill="#00a2e8" stroke="#000" />
            <path d="M12 2h1v6l-1 1h-1V3z" fill="#808080" stroke="#000" />
            <path d="M11 1h3v2h-3z" fill="#00a2e8" stroke="#000" />
          </svg>
        </span>
        <span className="paint-title-text">untitled - Paint</span>
        <div className="paint-controls">
          <button type="button" className="paint-ctrl" aria-label="Minimize">
            _
          </button>
          <button type="button" className="paint-ctrl" aria-label="Maximize">
            □
          </button>
          <button type="button" className="paint-ctrl paint-ctrl-close" aria-label="New image" onClick={clearCanvas}>
            ×
          </button>
        </div>
      </div>

      <div className="paint-menubar" ref={menuRef}>
        {MENUS.map((name) => (
          <button
            key={name}
            type="button"
            className={`paint-menu-btn${menu === name ? " open" : ""}`}
            onClick={() => setMenu((m) => (m === name ? null : name))}
          >
            <u>{name[0]}</u>
            {name.slice(1)}
          </button>
        ))}
        {menu === "File" && (
          <div className="paint-dropdown" style={{ left: 2 }}>
            <button type="button" onClick={clearCanvas}>
              New<span>Ctrl+N</span>
            </button>
            <button type="button" onClick={animateDoodle} disabled={!strokeCount || animating}>
              Animate doodle
            </button>
            <div className="paint-drop-rule" />
            <button type="button" onClick={clearCanvas}>
              Exit
            </button>
          </div>
        )}
        {menu === "Edit" && (
          <div className="paint-dropdown" style={{ left: 34 }}>
            <button type="button" onClick={undo} disabled={!strokeCount}>
              Undo<span>Ctrl+Z</span>
            </button>
          </div>
        )}
        {menu === "Image" && (
          <div className="paint-dropdown" style={{ left: 108 }}>
            <button type="button" onClick={animateDoodle} disabled={!strokeCount || animating}>
              {animating ? "Playing…" : "Animate"}
            </button>
            <button type="button" onClick={clearCanvas}>
              Clear Image<span>Ctrl+Shft+N</span>
            </button>
          </div>
        )}
        {menu === "Help" && (
          <div className="paint-dropdown paint-dropdown-help">
            <button
              type="button"
              onClick={() => {
                setMenu(null);
                setHelpOpen(true);
              }}
            >
              Help Topics
            </button>
          </div>
        )}
        {(menu === "View" || menu === "Options") && (
          <div className="paint-dropdown" style={{ left: menu === "View" ? 72 : 156 }}>
            <button type="button" onClick={() => setMenu(null)}>
              {menu === "View" ? "Show Toolbox" : "Edit Colors..."}
            </button>
          </div>
        )}
      </div>

      <div className="paint-body">
        <div className="paint-tools-col">
          <div className="paint-toolbox">
            {TOOLS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`paint-tool${tool === item.id ? " active" : ""}`}
                title={item.label}
                aria-label={item.label}
                aria-pressed={tool === item.id}
                onClick={() => setActiveTool(item.id)}
              >
                <ToolIcon id={item.id} />
              </button>
            ))}
          </div>
          <div className="paint-tool-opts" aria-hidden="true">
            {DRAW_TOOLS.has(tool) && tool !== "fill" && tool !== "eyedropper" && (
              <div className={`paint-sizes${SHAPE_TOOLS.has(tool) ? " lines" : ""}`}>
                {Array.from({ length: sizeCount }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={size === i ? "on" : ""}
                    onClick={() => setSize(i)}
                  >
                    <span style={{ height: toolWidth(SHAPE_TOOLS.has(tool) ? "line" : tool, i) }} />
                  </button>
                ))}
              </div>
            )}
            {SHAPE_TOOLS.has(tool) && tool !== "line" && (
              <div className="paint-fillmodes">
                {["stroke", "both", "fill"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={fillMode === mode ? "on" : ""}
                    onClick={() => setFillMode(mode)}
                    aria-label={mode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="paint-canvas-frame">
          <div className="paint-canvas-scroll">
            <div ref={wrapRef} className="paint-canvas-wrap">
              <canvas
                ref={canvasRef}
                className="paint-canvas"
                onPointerDown={startStroke}
                onPointerMove={moveStroke}
                onPointerUp={endStroke}
                onPointerCancel={endStroke}
              />
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
            </div>
            <div className="paint-scrollbar paint-scrollbar-y">
              <span className="paint-scroll-btn">▴</span>
              <span className="paint-scroll-thumb" />
              <span className="paint-scroll-btn">▾</span>
            </div>
          </div>
          <div className="paint-scrollbar paint-scrollbar-x">
            <span className="paint-scroll-btn">◂</span>
            <span className="paint-scroll-thumb" />
            <span className="paint-scroll-btn">▸</span>
            <span className="paint-scroll-corner" />
          </div>
        </div>
      </div>

      <div className="paint-palette-row">
        <div className="paint-current">
          <span className="paint-swatch-bg" style={{ background: bg }} />
          <span className="paint-swatch-fg" style={{ background: fg }} />
        </div>
        <div className="paint-swatches">
          {PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              className="paint-swatch"
              style={{ background: color }}
              aria-label={color}
              onPointerDown={(e) => pickSwatch(color, e)}
            />
          ))}
        </div>
      </div>

      <div className="paint-status">
        <div className="paint-status-help">{status}</div>
        <div className="paint-status-coords">{coords}</div>
      </div>

      {helpOpen && (
        <div className="paint-help-modal">
          <div className="paint-title">
            <span className="paint-title-text">Paint Help</span>
            <button type="button" className="paint-ctrl paint-ctrl-close" onClick={() => setHelpOpen(false)}>
              ×
            </button>
          </div>
          <p>Help me decorate. Draw in the canvas, then choose Image → Animate.</p>
          <button type="button" className="paint-ok" onClick={() => setHelpOpen(false)}>
            OK
          </button>
        </div>
      )}
    </div>
  );
}
