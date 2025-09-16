import { Link } from "react-router-dom";
import "./EmptyState.css";

export const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-state-content">
      <div className="empty-state-icon">📁</div>
      <h2 className="empty-state-title">No Projects Yet</h2>
      <p className="empty-state-description">
        Create your first project to start organizing your development commands and color palettes!
      </p>
      <Link to="/projects/new" className="button">
        Create Your First Project
      </Link>
    </div>
  </div>
);
