export default function RoonPage({ dodges, onAbout }) {
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
      <div className="roon-back">
        <a href="#about" className="crumb" onClick={onAbout}>
          ← INFO
        </a>
      </div>
    </section>
  );
}
