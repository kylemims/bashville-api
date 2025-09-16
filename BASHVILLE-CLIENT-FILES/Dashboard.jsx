import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getProjects, deleteProject } from "../services/projectService";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { ProjectCard } from "../components/project/ProjectCard";
import { EmptyState } from "../components/project/EmptyState";
import { SetupGenerator } from "../components/project/SetupGenerator";
import "./Dashboard.css";

export const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showSetupGenerator, setShowSetupGenerator] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filterType, setFilterType] = useState("all");

  useDocumentTitle("Dashboard • Bash Stash");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectData = await getProjects();
        setProjects(projectData);
        setError(null);
      } catch (err) {
        setError(`Failed to load projects: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    const confirmMessage = `Are you sure you want to delete "${
      project?.title || "this project"
    }"?\n\nThis action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setDeletingId(projectId);
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setError(null);
    } catch (err) {
      setError(`Failed to delete project: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLaunchProject = (project) => {
    setSelectedProject(project);
    setShowSetupGenerator(true);
  };

  const filteredProjects = projects.filter((project) => {
    if (filterType === "all") return true;
    return project.project_type === filterType;
  });

  const projectTypes = [
    { value: "all", label: "All Projects" },
    { value: "static-tailwind", label: "Static + Tailwind" },
    { value: "static-css", label: "Static + CSS" },
    { value: "fullstack-tailwind", label: "Full-Stack + Tailwind" },
    { value: "fullstack-css", label: "Full-Stack + CSS" },
  ];

  const handleCloseSetupGenerator = () => {
    setShowSetupGenerator(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="page-content">
        <LoadingSpinner size="lg" text="Loading your projects..." />
      </div>
    );
  }

  return (
    <div className="page-content page-enter">
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">
            {user?.username ? `${user.username}'s Projects` : "Your Projects"}
          </h1>
          <p className="dashboard-subtitle">Manage your development project stashes</p>
        </div>
        <div className="dashboard-controls">
          <select
            className="project-type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}>
            {projectTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <Link to="/projects/new" className="button">
            Create Project
          </Link>
        </div>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {filteredProjects.length === 0 ? (
        projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="projects-section">
            <div className="projects-stats">
              <span className="stats-text">No projects match the selected filter</span>
            </div>
          </div>
        )
      ) : (
        <div className="projects-section">
          <div className="projects-stats">
            <span className="stats-text">
              {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? "s" : ""}
              {filterType !== "all" && ` (${projectTypes.find((t) => t.value === filterType)?.label})`}
            </span>
          </div>

          <div className="project-grid">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
                onLaunch={handleLaunchProject}
                isDeleting={deletingId === project.id}
              />
            ))}
          </div>
        </div>
      )}

      {showSetupGenerator && selectedProject && (
        <SetupGenerator project={selectedProject} onClose={handleCloseSetupGenerator} />
      )}
    </div>
  );
};
