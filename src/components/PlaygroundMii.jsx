import { useEffect, useRef } from "react";

const W = 118;
const H = 188;
const GRAVITY = 2400;
const GRAB_FOLLOW = 46;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function pendulum(limb, rest, stiffness, damping, kick, dt) {
  limb.v += (rest - limb.a) * stiffness * dt + kick;
  limb.v *= Math.pow(damping, dt * 60);
  limb.a += limb.v * dt;
}

export default function PlaygroundMii({ onClick }) {
  const stageRef = useRef(null);
  const miiRef = useRef(null);
  const svgRef = useRef(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    const stage = stageRef.current;
    const mii = miiRef.current;
    const svg = svgRef.current;
    if (!stage || !mii || !svg) return;

    const els = {
      root: svg.querySelector(".mii-puppet"),
      head: svg.querySelector(".mii-head"),
      lArm: svg.querySelector(".mii-arm-l"),
      rArm: svg.querySelector(".mii-arm-r"),
      lLeg: svg.querySelector(".mii-leg-l"),
      rLeg: svg.querySelector(".mii-leg-r"),
      shadow: svg.querySelector(".mii-shadow"),
      mouth: svg.querySelector(".mii-mouth"),
    };

    const pointer = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0 };
    const grabOff = { x: W / 2, y: 86 };
    const down = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    const limbs = {
      lArm: { a: 16, v: 0 },
      rArm: { a: -16, v: 0 },
      lLeg: { a: 6, v: 0 },
      rLeg: { a: -6, v: 0 },
    };

    let grabbed = false;
    let dragged = false;
    let facing = 1;
    let tilt = 0;
    let lift = 0;
    let squash = 1;
    let walkTimer = 1.2;
    let walkDir = 1;
    let walking = false;
    let look = 0;
    let last = performance.now();
    let raf = 0;

    const floorY = () => {
      const r = stage.getBoundingClientRect();
      const viewFloor = window.innerHeight - r.top - H - 28;
      return clamp(viewFloor, 210, Math.max(210, r.height - H - 4));
    };

    const placeStart = () => {
      const r = stage.getBoundingClientRect();
      pos.x = Math.max(r.width * 0.62, Math.min(r.width - W - 36, r.width * 0.72));
      pos.y = floorY();
    };

    const bounds = () => {
      const r = stage.getBoundingClientRect();
      const minX = -40;
      const maxX = r.width - W + 40;
      if (pos.x < minX) {
        pos.x = minX;
        vel.x = Math.abs(vel.x);
        walkDir = 1;
      } else if (pos.x > maxX) {
        pos.x = maxX;
        vel.x = -Math.abs(vel.x);
        walkDir = -1;
      }
      pos.y = clamp(pos.y, -80, floorY());
    };

    const setLimb = (el, angle, cx, cy) => {
      if (el) el.setAttribute("transform", `rotate(${angle} ${cx} ${cy})`);
    };

    const render = () => {
      mii.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      const face = facing < 0 ? -1 : 1;
      if (els.root) {
        els.root.setAttribute(
          "transform",
          `translate(100 318) scale(${face} ${squash}) rotate(${tilt}) translate(-100 -318)`
        );
      }
      if (els.head) {
        els.head.setAttribute("transform", `rotate(${look * 0.35} 100 92)`);
      }
      setLimb(els.lArm, limbs.lArm.a, 90, 174);
      setLimb(els.rArm, limbs.rArm.a, 110, 174);
      setLimb(els.lLeg, limbs.lLeg.a, 88, 232);
      setLimb(els.rLeg, limbs.rLeg.a, 112, 232);
      if (els.shadow) {
        const airborne = floorY() - pos.y;
        const s = clamp(1 - airborne / 220, 0.2, 1);
        els.shadow.setAttribute("rx", String(36 * s));
        els.shadow.setAttribute("opacity", String(0.2 * s));
      }
      if (els.mouth) {
        els.mouth.setAttribute("ry", grabbed ? "8" : "6.5");
      }
      mii.classList.toggle("is-dragging", grabbed);
      mii.classList.toggle("is-airborne", floorY() - pos.y > 18);
    };

    const localPointer = (e) => {
      const r = stage.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };

    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      localPointer(e);
      grabbed = true;
      dragged = false;
      walking = false;
      down.x = pointer.x;
      down.y = pointer.y;
      grabOff.x = pointer.x - pos.x;
      grabOff.y = pointer.y - pos.y;
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      pointer.vx = 0;
      pointer.vy = 0;
      vel.x = 0;
      vel.y = 0;
      try {
        mii.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    const onMove = (e) => {
      localPointer(e);
      if (!grabbed) {
        const cx = pos.x + W / 2;
        look = clamp((pointer.x - cx) * 0.08, -14, 14);
      }
    };

    const onUp = (e) => {
      if (!grabbed) return;
      localPointer(e);
      grabbed = false;
      const wasClick = !dragged;
      if (wasClick) {
        vel.x = 0;
        vel.y = 0;
      } else {
        vel.x = clamp(pointer.vx * 0.92, -1600, 1600);
        vel.y = clamp(pointer.vy * 0.92, -1800, 1100);
      }
      try {
        mii.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (wasClick) onClickRef.current?.(e);
    };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const dt = clamp((now - last) / 1000, 0, 1 / 30);
      last = now;
      const floor = floorY();
      const pvx = (pointer.x - pointer.px) / Math.max(dt, 1 / 120);
      const pvy = (pointer.y - pointer.py) / Math.max(dt, 1 / 120);
      pointer.vx = lerp(pointer.vx, pvx, 0.45);
      pointer.vy = lerp(pointer.vy, pvy, 0.45);

      if (grabbed) {
        if (Math.hypot(pointer.x - down.x, pointer.y - down.y) > 8) dragged = true;
        const tx = pointer.x - grabOff.x;
        const ty = pointer.y - grabOff.y;
        const follow = 1 - Math.exp(-GRAB_FOLLOW * dt);
        pos.x = lerp(pos.x, tx, follow);
        pos.y = lerp(pos.y, ty, follow);
        vel.x = pointer.vx;
        vel.y = pointer.vy;
        lift = lerp(lift, 1, 0.2);
        squash = lerp(squash, 1.04, 0.2);
        tilt = lerp(tilt, clamp(vel.x * 0.045, -28, 28), 0.22);
        facing = vel.x < -18 ? -1 : vel.x > 18 ? 1 : facing;
        const kick = -pvx * 0.028 - pvy * 0.01;
        pendulum(limbs.lArm, 4, 9, 0.94, kick + 0.8, dt);
        pendulum(limbs.rArm, -4, 9, 0.94, -kick - 0.75, dt);
        pendulum(limbs.lLeg, 3, 10, 0.93, kick * 0.85, dt);
        pendulum(limbs.rLeg, -3, 10, 0.93, -kick * 0.85, dt);
        look = lerp(look, clamp(-tilt * 0.4, -16, 16), 0.2);
      } else {
        vel.y += GRAVITY * dt;
        pos.x += vel.x * dt;
        pos.y += vel.y * dt;
        const airborne = pos.y < floor - 2;
        if (pos.y >= floor) {
          pos.y = floor;
          if (vel.y > 520) {
            vel.y *= -0.22;
            squash = 0.86;
          } else {
            vel.y = 0;
            vel.x *= 0.82;
          }
        } else {
          vel.x *= 0.995;
        }

        lift = lerp(lift, 0, 0.12);
        squash = lerp(squash, 1, 0.16);
        tilt = lerp(tilt, airborne ? clamp(vel.x * 0.03, -22, 22) : 0, airborne ? 0.12 : 0.2);

        if (!airborne && Math.abs(vel.x) < 28 && Math.abs(vel.y) < 40) {
          walkTimer -= dt;
          if (walkTimer <= 0) {
            walking = !walking;
            if (walking) walkDir = Math.random() > 0.5 ? 1 : -1;
            walkTimer = walking ? 1.4 + Math.random() * 1.6 : 1.8 + Math.random() * 2.4;
          }
          if (walking) {
            vel.x = walkDir * 46;
            facing = walkDir;
            const swing = Math.sin(now / 140) * 16;
            pendulum(limbs.lArm, 18 + swing, 22, 0.7, 0, dt);
            pendulum(limbs.rArm, -18 - swing, 22, 0.7, 0, dt);
            pendulum(limbs.lLeg, 6 - swing * 0.7, 24, 0.7, 0, dt);
            pendulum(limbs.rLeg, -6 + swing * 0.7, 24, 0.7, 0, dt);
          } else {
            vel.x *= 0.86;
            pendulum(limbs.lArm, 16, 18, 0.72, 0, dt);
            pendulum(limbs.rArm, -16, 18, 0.72, 0, dt);
            pendulum(limbs.lLeg, 6, 20, 0.72, 0, dt);
            pendulum(limbs.rLeg, -6, 20, 0.72, 0, dt);
          }
        } else {
          walking = false;
          const hang = airborne ? 1 : 0;
          pendulum(limbs.lArm, hang ? 6 : 16, 12, 0.9, -vel.x * 0.0008, dt);
          pendulum(limbs.rArm, hang ? -6 : -16, 12, 0.9, vel.x * 0.0008, dt);
          pendulum(limbs.lLeg, hang ? 5 : 6, 12, 0.9, -vel.x * 0.0005, dt);
          pendulum(limbs.rLeg, hang ? -5 : -6, 12, 0.9, vel.x * 0.0005, dt);
        }
      }

      bounds();
      pointer.px = pointer.x;
      pointer.py = pointer.y;
      render();
    };

    placeStart();
    render();
    last = performance.now();
    raf = requestAnimationFrame(tick);

    const onResize = () => bounds();
    mii.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      mii.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div ref={stageRef} className="mii-playground">
      <div
        ref={miiRef}
        className="playground-mii"
        role="img"
        aria-label="Harouna's Mii. Click for Info, or grab and drag like the Wii Plaza."
      >
        <svg
          ref={svgRef}
          className="mii-svg"
          viewBox="0 0 200 340"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="miiSkin" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stopColor="#8A5638" />
              <stop offset="42%" stopColor="#6B3E28" />
              <stop offset="100%" stopColor="#3E2418" />
            </radialGradient>
            <linearGradient id="miiShirt" x1="18%" y1="0%" x2="88%" y2="100%">
              <stop offset="0%" stopColor="#4A8CFF" />
              <stop offset="45%" stopColor="#1E5AE8" />
              <stop offset="100%" stopColor="#153DB8" />
            </linearGradient>
            <linearGradient id="miiPants" x1="40%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#5A5A5A" />
              <stop offset="100%" stopColor="#2A2A2A" />
            </linearGradient>
            <radialGradient id="miiHand" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#F2F2F2" />
              <stop offset="65%" stopColor="#D5D5D5" />
              <stop offset="100%" stopColor="#B8B8B8" />
            </radialGradient>
            <linearGradient id="miiHair" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#3A2418" />
              <stop offset="100%" stopColor="#1A0E0A" />
            </linearGradient>
          </defs>

          <ellipse className="mii-shadow" cx="100" cy="328" rx="36" ry="7" fill="#111111" opacity="0.2" />

          <g className="mii-puppet">
            <g className="mii-leg mii-leg-l">
              <rect x="78" y="230" width="18" height="72" rx="9" fill="url(#miiPants)" />
              <ellipse cx="87" cy="304" rx="13" ry="8" fill="#2A2A2A" />
            </g>
            <g className="mii-leg mii-leg-r">
              <rect x="104" y="230" width="18" height="72" rx="9" fill="url(#miiPants)" />
              <ellipse cx="113" cy="304" rx="13" ry="8" fill="#2A2A2A" />
            </g>

            <path d="M100 146 L134 228 L66 228 Z" fill="url(#miiShirt)" />
            <rect x="72" y="224" width="56" height="10" rx="2" fill="#3A3A3A" />

            <g className="mii-arm mii-arm-l">
              <rect x="84" y="172" width="12" height="58" rx="6" fill="url(#miiShirt)" />
              <ellipse cx="90" cy="232" rx="10" ry="13" fill="url(#miiHand)" />
            </g>
            <g className="mii-arm mii-arm-r">
              <rect x="104" y="172" width="12" height="58" rx="6" fill="url(#miiShirt)" />
              <ellipse cx="110" cy="232" rx="10" ry="13" fill="url(#miiHand)" />
            </g>

            <g className="mii-head">
              <ellipse cx="48" cy="100" rx="10" ry="14" fill="url(#miiSkin)" />
              <ellipse cx="152" cy="100" rx="10" ry="14" fill="url(#miiSkin)" />

              <path
                className="mii-hair-back"
                d="M44 78 L34 48 L48 72 L54 14 L72 70 L82 2 L100 68 L118 2 L128 70 L146 14 L152 72 L166 48 L156 78 Q100 42 44 78 Z"
                fill="#14110F"
              />
              <ellipse cx="100" cy="96" rx="52" ry="56" fill="url(#miiSkin)" />
              <path
                className="mii-hair"
                d="M48 72 L40 44 L56 68 L64 10 L80 66 L90 0 L100 64 L110 0 L120 66 L136 10 L144 68 L160 44 L152 72 Q100 54 48 72 Z"
                fill="#111111"
                stroke="#2A1810"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />

              <path d="M60 78 Q76 64 94 76" fill="none" stroke="#1A0A08" strokeWidth="5" strokeLinecap="round" />
              <path d="M106 76 Q124 64 140 78" fill="none" stroke="#1A0A08" strokeWidth="5" strokeLinecap="round" />
              <path d="M66 86 Q78 82 90 88" fill="none" stroke="#1A0A08" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M110 88 Q122 82 134 86" fill="none" stroke="#1A0A08" strokeWidth="1.6" strokeLinecap="round" />

              <ellipse cx="80" cy="101" rx="11" ry="9" fill="#7A4A28" />
              <ellipse cx="120" cy="101" rx="11" ry="9" fill="#7A4A28" />
              <circle cx="80" cy="102" r="3.6" fill="#111111" />
              <circle cx="120" cy="102" r="3.6" fill="#111111" />
              <circle cx="77" cy="98" r="1.8" fill="#FFFFFF" />
              <circle cx="117" cy="98" r="1.8" fill="#FFFFFF" />

              <path d="M96 110 Q104 120 100 128" fill="none" stroke="#1A0A08" strokeWidth="2.6" strokeLinecap="round" />
              <ellipse className="mii-mouth" cx="100" cy="140" rx="5" ry="6.5" fill="#1A0A08" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
