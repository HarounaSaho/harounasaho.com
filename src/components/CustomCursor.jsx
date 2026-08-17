import { useEffect, useRef, useState } from "react";

const CLICKABLE = "a, button, [role='button'], input, select, textarea, tr[data-clickable]";

export default function CustomCursor() {
  const elRef = useRef(null);
  const downRef = useRef(false);
  const [label, setLabel] = useState("cursor");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncLabel = (clickable) => {
      const next = clickable || downRef.current ? "click" : "cursor";
      setLabel((prev) => (prev === next ? prev : next));
    };

    const onMove = (e) => {
      const el = elRef.current;
      if (el) {
        el.style.left = `${e.clientX}px`;
        el.style.top = `${e.clientY}px`;
      }
      setVisible(true);
      const clickable = !!(e.target && e.target.closest && e.target.closest(CLICKABLE));
      syncLabel(clickable);
    };

    const onLeave = () => setVisible(false);
    const onDown = () => {
      downRef.current = true;
      setLabel("click");
    };
    const onUp = (e) => {
      downRef.current = false;
      const clickable = !!(e.target && e.target.closest && e.target.closest(CLICKABLE));
      syncLabel(clickable);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={elRef}
      className="custom-cursor"
      style={{ display: visible ? "block" : "none" }}
    >
      {label}
    </div>
  );
}
