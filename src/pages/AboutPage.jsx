import { STUDIO_TIMELINE } from "../data";
import Placeholder from "../components/Placeholder";

export default function AboutPage({ isStudio, onHome, onAbout, onStudio }) {
  return (
    <section className="info-page slide-top">
      <div className="info-inner">
        <a href="#home" className="crumb info-crumb" onClick={onHome}>
          ← HOME
        </a>
        <div className="sub-nav">
          <a href="#about" className="active-dark" onClick={onAbout}>
            INFO
          </a>
          <a href="#studio" className="idle-blue" onClick={onStudio}>
            STUDIO
          </a>
        </div>
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

      {isStudio && (
        <div className="studio-overlay">
          <div className="studio-inner">
            <a href="#about" className="crumb" onClick={onAbout}>
              ← ABOUT
            </a>
            <div className="sub-nav">
              <a href="#about" className="idle-yellow" onClick={onAbout}>
                INFO
              </a>
              <a href="#studio" className="active-light" onClick={onStudio}>
                STUDIO
              </a>
            </div>
            <div className="studio-tag">SEC · 03.1 / STUDIO - LIVE</div>
            <h1>In progress</h1>
            <div className="studio-caption">STUDIO PICS · TRAVEL NOTES - NEWEST FIRST</div>
            <div className="timeline-wrap">
              <div className="timeline-rule" />
              <div className="timeline">
                {STUDIO_TIMELINE.map((col) => (
                  <div className="timeline-col" key={col.date}>
                    <div className="timeline-date">
                      <div className="d">{col.date}</div>
                      <div className="p">{col.place}</div>
                    </div>
                    <div className="tick-row">
                      <div className="tick" />
                    </div>
                    <div className="timeline-cards">
                      {col.cards.map((card) => (
                        <article className="studio-card" key={card.title}>
                          <div className="kicker">{card.kicker}</div>
                          <h2>{card.title}</h2>
                          <Placeholder label={card.photo} variant="studio" />
                          <p>{card.caption}</p>
                          <div className="tech">{card.meta}</div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="timeline-end" />
              </div>
              <div className="scroll-hint">SCROLL →  EARLIER ENTRIES TO THE RIGHT</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
