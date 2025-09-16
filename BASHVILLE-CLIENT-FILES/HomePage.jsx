// src/views/HomePage.jsx
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { ActionButton } from "../components/common/ActionButton.jsx";
import { HomeWhySection } from "../components/home/HomeWhySection.jsx";
import { FutureSneakPeek } from "../components/home/FutureSneakPeek.jsx";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export const HomePage = () => {
  useDocumentTitle("Home • BASH STASH");
  const navigate = useNavigate();

  return (
    <main id="page-content" role="main" aria-labelledby="page-title" className="mt-4 page-enter">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-headline">Welcome to Bash Stash</h1>
          <p className="hero-subtext">Launch projects faster.</p>
          <div className="hero-ctas">
            <ActionButton label="Go to Dashboard" onClick={() => navigate("/dashboard")} variant="secondary">
              GO TO DASHBOARD
            </ActionButton>{" "}
            <ActionButton
              label="Create New Project"
              onClick={() => navigate("/projects/new")}
              variant="accent">
              CREATE NEW PROJECT
            </ActionButton>
          </div>
        </div>
        <div className="hero-graphic">
          <img src="/assets/images/bashed-logo.svg" alt="Bash Stash Hero" className="hero-image" />
        </div>
      </section>
      <HomeWhySection />
      <FutureSneakPeek />
    </main>
  );
};
