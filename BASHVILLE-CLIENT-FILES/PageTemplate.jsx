import { ActionButton } from "../components/common/ActionButton.jsx";
import "./PageTemplate.css";

export const PageTemplate = () => {
  const cards = [
    { title: "Starter Django CRUD", blurb: "Basic models, serializers, views, URLs." },
    { title: "Auth + Profiles", blurb: "Login, register, profile scaffold." },
    { title: "Color-First UI", blurb: "Pre-wired palette tokens & CSS vars." },
    { title: "Bash Boost Pack", blurb: "Handy shell helpers for local dev." },
  ];

  return (
    <div className="tpl-wrap">
      <header className="tpl-hero">
        <div className="tpl-badge">Coming Soon</div>
        <h1 className="tpl-title">Weekly Templates</h1>
        <p className="tpl-sub">
          Curated color palettes, boilerplate code, and starter scripts—ready to drop into your project and
          customize.
        </p>
      </header>

      <section className="tpl-grid">
        {cards.map((c, i) => (
          <article key={i} className="tpl-card">
            <div className="tpl-thumb">Preview</div>
            <h3 className="tpl-card-title">{c.title}</h3>
            <p className="tpl-card-text">{c.blurb}</p>
            <ActionButton className="tpl-card-btn" disabled>
              Coming Soon
            </ActionButton>
          </article>
        ))}
      </section>

      <footer className="tpl-foot">
        <p className="tpl-note">🚧 This section is under construction. Check back for new drops each week.</p>
      </footer>
    </div>
  );
};
