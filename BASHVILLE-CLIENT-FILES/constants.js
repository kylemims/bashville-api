export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || "http://localhost:8000";

export const STORAGE_KEYS = {
  AUTH_TOKEN: "bashville_auth_token",
  USER_DATA: "bashville_user_data",
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROJECTS: "/projects",
  NEW_PROJECT: "/projects/new",
  PROJECT_DETAIL: "/projects/:projectId",
  COMMANDS: "/commands",
  PALETTES: "/palettes",
};
