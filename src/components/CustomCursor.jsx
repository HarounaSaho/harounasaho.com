import { useEffect, useRef } from "react";
import pointSrc from "../assets/wii-cursor-point.png";
import grabSrc from "../assets/wii-cursor-grab.png";

export default function CustomCursor() {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const onMove = (e) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      el.style.display = "block";
    };
    const onLeave = (e) => {
      if (e.relatedTarget) return;
      if (document.querySelector(".is-dragging")) return;
      el.style.display = "none";
    };

    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div ref={elRef} className="custom-cursor">
      <img src={pointSrc} alt="" draggable="false" className="wii-point" />
      <img src={grabSrc} alt="" draggable="false" className="wii-grab" />
    </div>
  );
}
