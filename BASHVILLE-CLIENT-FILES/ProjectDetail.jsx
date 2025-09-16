import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { getProjectById, updateProject, deleteProject } from "../services/projectService";
import { getCommands } from "../services/commandService";
import { getColorPalettes } from "../services/colorPaletteService";
import { CommandsTab } from "../components/tabs/CommandsTab";
import { ColorsTab } from "../components/tabs/ColorsTab";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { ActionButton } from "../components/common/ActionButton";
import { ProjectHeader } from "../components/project/ProjectHeader";
import { ProjectTabs } from "../components/project/ProjectTabs";
import { BackendTab } from "../components/tabs/BackendTab.jsx";
import { GenerateProjectModal } from "../components/project/GenerateProjectModal.jsx";
import { ROUTES } from "../utils/constants";

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [showNewCommandForm, setShowNewCommandForm] = useState(false);
  const [showNewPaletteForm, setShowNewPaletteForm] = useState(false);
  const [showSetupGenerator, setShowSetupGenerator] = useState(false);
  const [state, setState] = useState({
    project: null,
    availableCommands: [],
    availablePalettes: [],
    loading: true,
    error: null,
    activeTab: "commands",
  });

  const handleAddNew = () => {
    if (state.activeTab === "commands") {
      setShowNewCommandForm(true);
    } else if (state.activeTab === "colors") {
      setShowNewPaletteForm(true);
    }
  };

  useDocumentTitle(state.project ? `${state.project.title} • Bash Stash` : "Project • Bash Stash");
  const handleGenerateSetup = () => {
    setShowSetupGenerator(true);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectData, commandsData, palettesData] = await Promise.all([
          getProjectById(projectId),
          getCommands(),
          getColorPalettes(),
        ]);

        setState((prev) => ({
          ...prev,
          project: projectData,
          availableCommands: commandsData,
          availablePalettes: palettesData,
          loading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err.message,
          loading: false,
        }));
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const updateState = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveProject = async (updatedData) => {
    try {
      const updatedProject = await updateProject(projectId, updatedData);
      console.log("Project updated successfully:", updatedProject);

      updateState({ project: updatedProject });

      return updatedProject;
    } catch (error) {
      console.error("Failed to save project:", error);
      throw new Error(`Failed to save project: ${error.message}`);
    }
  };

  if (state.loading) {
    return (
      <div className="page-content">
        <LoadingSpinner size="lg" text="Loading project..." />
      </div>
    );
  }

  if (state.error || !state.project) {
    return (
      <div className="page-content">
        <div className="page-card">
          <ErrorMessage message={state.error || "Project not found"} />
          <ActionButton onClick={() => navigate(ROUTES.DASHBOARD)} variant="primary">
            Back to Dashboard
          </ActionButton>
        </div>
      </div>
    );
  }

  const handleProjectUpdate = async (updatedData) => {
    try {
      const updatedProject = await updateProject(projectId, updatedData);
      updateState({ project: updatedProject });
      return updatedProject;
    } catch (error) {
      console.error("❌ Failed to update project:", error);
      throw error;
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(state.project.id || projectId);
        navigate(ROUTES.DASHBOARD);
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const tabProps = {
    project: state.project,
    onSave: handleSaveProject,
  };

  return (
    <div className="page-content page-enter">
      <div className="project-detail">
        <ProjectHeader
          title={state.project.title}
          onBack={() => navigate(ROUTES.DASHBOARD)}
          onGenerateSetup={handleGenerateSetup}
          onProjectDelete={handleDeleteProject}
          onProjectUpdate={handleProjectUpdate}
        />

        <ProjectTabs
          activeTab={state.activeTab}
          onTabChange={(tab) => updateState({ activeTab: tab })}
          onAddNew={handleAddNew}
        />

        <div className="tab-content">
          {state.activeTab === "commands" ? (
            <CommandsTab
              {...tabProps}
              availableCommands={state.availableCommands}
              onCommandsUpdate={(commands) => updateState({ availableCommands: commands })}
              showNewCommandForm={showNewCommandForm}
              onNewCommandFormChange={setShowNewCommandForm}
            />
          ) : state.activeTab === "colors" ? (
            <ColorsTab
              {...tabProps}
              availablePalettes={state.availablePalettes}
              onPalettesUpdate={(palettes) => updateState({ availablePalettes: palettes })}
              showNewPaletteForm={showNewPaletteForm}
              onNewPaletteFormChange={setShowNewPaletteForm}
            />
          ) : (
            <BackendTab project={state.project} />
          )}

          {showSetupGenerator && (
            <GenerateProjectModal
              project={state.project}
              isOpen={showSetupGenerator}
              onClose={() => setShowSetupGenerator(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
