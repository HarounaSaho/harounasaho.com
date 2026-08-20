import { useRef } from "react";

let dragZ = 30;
const CLICK_MAX = 6;

export default function Draggable({ children, className = "", handle, style, onClick }) {
  const ref = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const drag = useRef(null);

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest("button, a, canvas, input, textarea, select")) return;
    if (handle && !e.target.closest(handle)) return;
    e.stopPropagation();
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    drag.current = {
      px: e.clientX,
      py: e.clientY,
      x: pos.current.x,
      y: pos.current.y,
      moved: false,
    };
    dragZ += 1;
    el.style.zIndex = String(dragZ);
    el.classList.add("is-dragging");
    document.querySelector(".custom-cursor")?.classList.add("is-grab");
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    e.preventDefault();
    const dx = e.clientX - drag.current.px;
    const dy = e.clientY - drag.current.py;
    if (Math.abs(dx) > CLICK_MAX || Math.abs(dy) > CLICK_MAX) drag.current.moved = true;
    const x = drag.current.x + dx;
    const y = drag.current.y + dy;
    pos.current = { x, y };
    const el = ref.current;
    if (el) el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onPointerUp = (e) => {
    if (!drag.current) return;
    const wasClick = !drag.current.moved;
    drag.current = null;
    const el = ref.current;
    if (el) {
      el.classList.remove("is-dragging");
      if (!document.querySelector(".is-dragging")) {
        document.querySelector(".custom-cursor")?.classList.remove("is-grab");
      }
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    if (wasClick && onClick) onClick(e);
  };

  return (
    <div
      ref={ref}
      className={`draggable${className ? ` ${className}` : ""}`}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
    </div>
  );
}
