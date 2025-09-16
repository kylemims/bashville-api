import { useState, useEffect } from "react";
import { getProjects } from "../services/projectService";
import { generateBashScript } from "../utils/generateBashScript";
import { downloadFile } from "../utils/downloadFile";
import "./Launch.css";

export const Launch = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const handleDownload = () => {
    const project = projects.find((p) => p.id === Number(selectedProjectId));
    if (!project) return;

    const script = generateBashScript(project);
    downloadFile(script, "launch.sh");
  };

  if (loading) return <div className="page-content">Loading projects...</div>;

  return (
    <div className="page-content page-enter">
      <div className="page-card">
        <div className="card-title">
          <h2>🚀 Launch Project</h2>
        </div>

        <div className="mb-4">
          <label htmlFor="projectSelect" className="text-sm text-muted">
            Select a project
          </label>
          <select
            id="projectSelect"
            className="launch-select"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}>
            <option value="">-- Choose a project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <button className="button" onClick={handleDownload} disabled={!selectedProjectId}>
          Download launch.sh
        </button>
      </div>
    </div>
  );
};
