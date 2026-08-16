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

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
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
