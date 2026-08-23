import musiciansSrc from "../assets/musicians.jpg";

export default function MusiciansPage({ onHome }) {
  return (
    <section className="page musicians-page fade-in">
      <a href="#home" className="crumb" onClick={onHome}>
        ← HOME
      </a>
      <div className="sec-tag">SEC · 00 / THE MUSICIANS</div>
      <div className="work-layout">
        <div className="work-image">
          <img src={musiciansSrc} alt="The Musicians, Caravaggio x Roon" />
        </div>
        <div className="work-side">
          <div className="work-cat">HS · ROON</div>
          <h1>The Musicians</h1>
          <table className="meta-table">
            <tbody>
              <tr>
                <td>ARTISTS</td>
                <td>Caravaggio (Michelangelo Merisi) × Roon (Harouna Saho)</td>
              </tr>
              <tr>
                <td>ORIGIN</td>
                <td>Italian × Gambian</td>
              </tr>
              <tr>
                <td>YEAR</td>
                <td className="work-dims">1597 × 2026</td>
              </tr>
              <tr>
                <td>SOURCE</td>
                <td>
                  <a
                    href="https://www.metmuseum.org/art/collection/search/435844"
                    target="_blank"
                    rel="noreferrer"
                  >
                    The Met
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
