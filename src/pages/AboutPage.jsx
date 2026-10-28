export default function AboutPage({ onHome }) {
  return (
    <section className="info-page slide-top">
      <div className="info-inner">
        <a href="#home" className="crumb info-crumb" onClick={onHome}>
          ← HOME
        </a>
        <div className="sec-tag">SEC · 03 / INFO</div>
        <h1>A painter building one world, scene by scene.</h1>
        <div className="info-bio">
          <p>
            Harouna Saho is a senior at Yale, painting out of New Haven. He is from The Gambia and grew up in Norman,
            Oklahoma.
          </p>
          <p>
            The paintings are concept art for one continuing world. There is no plot and no name for it - each canvas
            is a scene, and the world gets larger the way a location does, not the way a story does.
          </p>
        </div>
        <div className="cv-wrap">
          <a href="#cv" className="cv-btn">
            <span>VIEW CV</span>
            <span className="pdf">PDF</span>
          </a>
        </div>
        <div className="contact">
          <div className="contact-label">CONTACT</div>
          <table className="contact-table">
            <tbody>
              <tr>
                <td>EMAIL</td>
                <td>
                  <a href="mailto:harouna.saho@yale.edu">harouna.saho@yale.edu</a>
                </td>
              </tr>
              <tr>
                <td>INSTAGRAM</td>
                <td>
                  <a href="https://instagram.com/roonart_" target="_blank" rel="noreferrer">
                    @roonart_
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
