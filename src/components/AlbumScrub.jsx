import { useEffect, useState } from "react";

const covers = Object.entries(
  import.meta.glob("../assets/covers/*.jpg", { eager: true, import: "default" })
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src);

function shuffledOrder() {
  const order = covers.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export default function AlbumScrub() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (covers.length < 2) return;
    let order = shuffledOrder();
    let step = 0;
    const tick = () => {
      step += 1;
      if (step >= order.length) {
        order = shuffledOrder();
        step = 0;
      }
      setIndex(order[step]);
    };
    const id = setInterval(tick, 850);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="album-scrub">
      {covers.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          draggable="false"
          className={i === index ? "is-on" : ""}
        />
      ))}
    </div>
  );
}
