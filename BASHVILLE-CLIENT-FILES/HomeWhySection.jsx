import { useNavigate } from "react-router-dom";
import { ActionButton } from "../common/ActionButton.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import { ROUTES } from "../../utils/constants";
import "./HomeWhySection.css";

export const HomeWhySection = () => {
  const navigate = useNavigate();

  const goToDashboard = () => navigate(ROUTES.DASHBOARD || "/dashboard");
  const goToCreateProject = () => navigate(ROUTES.NEW_PROJECT || "/projects/new");

  const cards = [
    {
      icon: "terminal",
      title: "Stash Commands",
      blurb: "Save your go‑to CLI commands in one place. Reuse them across projects and launch faster.",
      cta: { label: "View Commands", onClick: goToDashboard },
    },
    {
      icon: "palette",
      title: "Color Palettes",
      blurb:
        "Theme projects instantly with curated palettes. Export CSS variables and keep your UI consistent.",
      cta: { label: "Browse Palettes", onClick: goToDashboard },
    },
    {
      icon: "bolt",
      title: "One‑Click Scripts",
      blurb: "Generate an executable bash script and README in seconds. Copy or download and run.",
      cta: { label: "Generate Script", onClick: goToDashboard },
    },
    {
      icon: "description",
      title: "Docs on Day One",
      blurb: "Auto‑build a clean README with setup steps, palettes, and a backend schema preview.",
      cta: { label: "Preview README", onClick: goToDashboard },
    },
  ];

  return (
    <section className="why-wrap" aria-labelledby="why-heading">
      <div className="why-head">
        <h2 id="why-heading">Why Bash Stash?</h2>
        <p className="why-sub">
          Launch faster with reusable commands, instant theming, and one‑click generators.
        </p>
      </div>

      <div className="why-grid">
        {cards.map((c, i) => (
          <article key={i} className="why-card">
            <div className="why-icon">
              <MaterialIcon icon={c.icon} size={28} />
            </div>
            <h3 className="why-title">{c.title}</h3>
            <p className="why-blurb">{c.blurb}</p>
            <div className="why-actions">
              <ActionButton variant="tab" size="sm" onClick={c.cta.onClick}>
                {c.cta.label}
              </ActionButton>
            </div>
          </article>
        ))}
      </div>

      <div className="why-cta-row">
        <ActionButton variant="primary" size="md" onClick={goToCreateProject}>
          Create New Project
        </ActionButton>
        <ActionButton variant="secondary" size="md" onClick={goToDashboard}>
          Go to Dashboard
        </ActionButton>
      </div>
    </section>
  );
};
