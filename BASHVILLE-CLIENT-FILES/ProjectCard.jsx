import { Link } from "react-router-dom";
import { ActionButton } from "../common/ActionButton.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import { ColorPreview } from "../common/ColorPreview.jsx";
import "./ProjectCard.css";

export const ProjectCard = ({ project, onDelete, onLaunch, isDeleting, onGenerateSetup }) => {
  const hasCommands = project.commands_preview && project.commands_preview.length > 0;
  const hasColors = project.color_palette_preview;

  const getProjectTypeConfig = (type) => {
    const configs = {
      "static-tailwind": {
        label: "Static + Tailwind",
        icon: "bolt",
        color: "var(--color-accent)",
        complexity: "Simple",
      },
      "static-css": {
        label: "Static + CSS",
        icon: "palette",
        color: "var(--color-accent)",
        complexity: "Simple",
      },
      "fullstack-tailwind": {
        label: "Full-Stack + Tailwind",
        icon: "rocket_launch",
        color: "var(--color-secondary)",
        complexity: "Advanced",
      },
      "fullstack-css": {
        label: "Full-Stack + CSS",
        icon: "settings",
        color: "var(--color-secondary)",
        complexity: "Advanced",
      },
    };
    return configs[type] || configs["static-tailwind"];
  };

  const typeConfig = getProjectTypeConfig(project.project_type);

  return (
    <div className="project-card">
      <div className="project-card-header">
        <h3 className="project-title">{project.title}</h3>
        <div className="project-type-badge" style={{ borderColor: typeConfig.color }}>
          <MaterialIcon icon={typeConfig.icon} />
          <span className="project-type-label">{typeConfig.label}</span>
          <span className="project-complexity">{typeConfig.complexity}</span>
        </div>

        {project.description && <p className="project-description">{project.description}</p>}

        <div className="project-stats">
          <div className="project-stat">
            <MaterialIcon icon="bolt" size={16} color="var(--color-accent)" />
            <span className="stat-text">
              {hasCommands ? `${project.commands_preview.length} commands` : "No commands"}
            </span>
          </div>
          <div className="project-stat">
            {hasColors ? (
              <>
                <ColorPreview palette={hasColors} size="md" showTooltip={true} />
                <span className="stat-text">{hasColors.name}</span>
              </>
            ) : (
              <>
                <MaterialIcon icon="palette" size={16} color="var(--muted)" />
                <span className="stat-text">No palette</span>
              </>
            )}
          </div>
        </div>

        <Link to={`/projects/${project.id}`} className="project-view-btn">
          VIEW PROJECT
        </Link>
      </div>
      <div className="project-actions">
        <Link
          to={`/projects/${project.id}`}
          className="action-btn edit-btn"
          title="Edit Project"
          aria-label="Edit project">
          <MaterialIcon icon="edit_square" size={23} color="var(--muted)" className="hover-primary" />
        </Link>
        <ActionButton
          onClick={() => onDelete(project.id)}
          className="action-btn delete-btn"
          variant="delete"
          size="sm"
          disabled={isDeleting}
          title="Delete Project"
          aria-label="Delete project">
          <MaterialIcon icon="delete" size={26} color="var(--color-secondary)" className="hover-primary" />
        </ActionButton>
        <ActionButton
          onClick={() => onLaunch(project)}
          className="action-btn launch-btn"
          variant="launch"
          size="sm"
          title="Generate Setup Scripts"
          aria-label="Generate setup scripts">
          <MaterialIcon icon="markdown" size={26} color="var(--color-accent)" className="hover-primary" />
        </ActionButton>
      </div>
    </div>
  );
};
