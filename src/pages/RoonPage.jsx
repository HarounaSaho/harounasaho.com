export default function RoonPage({ dodges, onStudio, onAbout }) {
  return (
    <section className="roon-page">
      <div className="sec-tag">SEC · 00 / ROON - CAUGHT</div>
      <h1>You caught it.</h1>
      <p>Wow, you&apos;re dedicated.</p>
      <table className="roon-table">
        <tbody>
          <tr>
            <td>DODGES</td>
            <td className="val">{String(dodges).padStart(3, "0")}</td>
          </tr>
        </tbody>
      </table>
      <div className="sneak-wrap">
        <a href="#studio" className="sneak-btn" onClick={onStudio}>
          <span>SNEAK PEEK - WHAT I&apos;M WORKING ON</span>
          <span className="arrow">→</span>
        </a>
      </div>
      <div className="roon-back">
        <a href="#about" className="crumb" onClick={onAbout}>
          ← INFO
        </a>
      </div>
    </section>
  );
}
