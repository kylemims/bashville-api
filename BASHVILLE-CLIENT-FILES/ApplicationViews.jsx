import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./views/Login";
import { Register } from "./views/Register.jsx";
import { NewProject } from "./views/NewProject";
import { ProjectDetail } from "./views/ProjectDetail";
import { Dashboard } from "./views/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PageTemplate } from "./views/PageTemplate";
import { HomePage } from "./views/HomePage";
import { Launch } from "./views/Launch";
import { FeaturesShowcase } from "./views/FeaturesShowcase.jsx";

export const ApplicationViews = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/template" element={<PageTemplate />} />
      <Route path="/features" element={<FeaturesShowcase />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <NewProject />
          </ProtectedRoute>
        }
      />

      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/launch"
        element={
          <ProtectedRoute>
            <Launch />
          </ProtectedRoute>
        }
      />

      {/* Redirect any unknown routes to HomePage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
