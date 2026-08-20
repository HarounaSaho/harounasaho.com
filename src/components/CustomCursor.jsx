import { useEffect, useRef } from "react";
import pointSrc from "../assets/wii-cursor-point.png";
import grabSrc from "../assets/wii-cursor-grab.png";

export default function CustomCursor() {
  const elRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const setGrab = (on) => {
      el.classList.toggle("is-grab", on);
    };

    const onMove = (e) => {
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      el.style.display = "block";
    };
    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      setGrab(true);
    };
    const onUp = () => {
      if (document.querySelector(".is-dragging")) return;
      setGrab(false);
    };
    const onLeave = (e) => {
      if (e.relatedTarget) return;
      if (document.querySelector(".is-dragging")) return;
      el.style.display = "none";
    };

    document.addEventListener("pointermove", onMove, true);
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("pointerup", onUp, true);
    window.addEventListener("blur", onUp);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove, true);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("blur", onUp);
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
