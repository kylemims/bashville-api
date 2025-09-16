import { useState } from "react";
import "./FeaturesShowcase.css";

const SparkIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M12 2l1.9 5.8h6.1l-4.9 3.6 1.9 5.8L12 13.6 7 17.2l1.9-5.8L4 7.8h6.1z" />
  </svg>
);
const PlugIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
    <path
      fill="currentColor"
      d="M7 2h2v6h6V2h2v6h3v2h-3v3.5A6.5 6.5 0 0 1 7.5 20H4v-2h3.5A4.5 4.5 0 0 0 12 13.5V10H7z"
    />
  </svg>
);
const ShieldIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...props}>
    <path fill="currentColor" d="M12 2l8 3v7c0 5-3.4 9.7-8 10-4.6-.3-8-5-8-10V5l8-3z" />
  </svg>
);

export const FeaturesShowcase = () => {
  const [copiedKey, setCopiedKey] = useState(null);
  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  const weeklyTemplates = [
    {
      key: "django-lite",
      title: "Django: Quickstart",
      blurb: "Startproject + DRF + CORS in one go.",
      cmd: "pipenv run django-admin startproject myproj . && pipenv run python manage.py startapp api",
    },
    {
      key: "node-api",
      title: "Node API Stub",
      blurb: "Express + nodemon + basic routes.",
      cmd: 'npm init -y && npm i express nodemon && echo "node server.js"',
    },
    {
      key: "git-essentials",
      title: "Git Essentials",
      blurb: "Init repo, write .gitignore, first commit.",
      cmd: "git init && echo 'node_modules/' >> .gitignore && git add . && git commit -m \"init\"",
    },
  ];

  return (
    <section className="fs-wrap" aria-labelledby="why-bash-heading">
      <header className="fs-head">
        <h2 id="why-bash-heading" className="fs-title">
          WHY BASH?
        </h2>
        <div className="fs-line" />
      </header>

      <p className="fs-sub">
        Bash Stash turns repeat setup steps into one‑click, human‑readable scripts. Less fumbling in
        terminals, more shipping projects.
      </p>

      <div className="fs-grid">
        <article className="fs-card">
          <div className="fs-card-head">
            <span className="fs-icon">
              <SparkIcon />
            </span>
            <h3 className="fs-card-title">Generate & Go</h3>
          </div>
          <p className="fs-card-text">
            Build a script from your <em>project commands</em>, color palette, and backend schema preview.
            Download it as <code>setup.sh</code> or copy in one click.
          </p>
        </article>

        <article className="fs-card">
          <div className="fs-card-head">
            <span className="fs-icon">
              <PlugIcon />
            </span>
            <h3 className="fs-card-title">Plays Nice with Django</h3>
          </div>
          <p className="fs-card-text">
            Your config becomes real code: models, serializers, routers. Add to your repo when you’re ready.
          </p>
        </article>

        <article className="fs-card">
          <div className="fs-card-head">
            <span className="fs-icon">
              <ShieldIcon />
            </span>
            <h3 className="fs-card-title">Safe by Default</h3>
          </div>
          <p className="fs-card-text">
            We don’t overwrite files blindly. The generated script checks for existing files first.
          </p>
        </article>
      </div>

      <div className="fs-palette">
        <span className="fs-chip fs-chip--1" title="Primary" />
        <span className="fs-chip fs-chip--2" title="Secondary" />
        <span className="fs-chip fs-chip--3" title="Accent" />
        <span className="fs-chip fs-chip--4" title="Background" />
        <span className="fs-chip fs-chip--fade" />
      </div>

      <div className="fs-templates">
        <div className="fs-templates-head">
          <h3 className="fs-templates-title">Weekly Templates (preview)</h3>
          <p className="fs-templates-sub">Tiny, copy‑ready snippets to kickstart common workflows.</p>
        </div>

        <div className="fs-templates-scroller">
          {weeklyTemplates.map((t) => (
            <div className="fs-tile" key={t.key}>
              <div className="fs-tile-top">
                <h4 className="fs-tile-title">{t.title}</h4>
                <p className="fs-tile-blurb">{t.blurb}</p>
              </div>
              <pre className="fs-tile-code">
                <code>{t.cmd}</code>
              </pre>
              <div className="fs-tile-actions">
                <button type="button" className="fs-btn fs-btn--primary" onClick={() => copy(t.cmd, t.key)}>
                  {copiedKey === t.key ? "Copied!" : "Copy command"}
                </button>
                <button
                  type="button"
                  className="fs-btn fs-btn--ghost"
                  onClick={() => alert("Add to Stash coming soon ✨")}>
                  Add to Stash
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
