export default function Placeholder({ label, variant = "default" }) {
  const cls = ["ph"];
  if (variant === "fine") cls.push("fine");
  if (variant === "on-blue") cls.push("on-blue");
  if (variant === "studio") cls.push("studio");
  return (
    <div className={cls.join(" ")}>
      <span>{label}</span>
    </div>
  );
}
