import { API_BASE_URL } from "../utils/constants.js";

const getToken = () => {
  const token = localStorage.getItem("bashville_auth_token");
  if (!token) {
    throw new Error("No authentication token found. Please log in again.");
  }
  return token;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem("bashville_auth_token");
    localStorage.removeItem("bashville_user_data");
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;

        if (errorData.errors && typeof errorData.errors === "object") {
          const fieldErrors = Object.entries(errorData.errors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
            .join("; ");
          errorMessage = fieldErrors;
        }
      } catch (parseError) {
        console.warn("Could not parse error response:", parseError);
      }
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

//*----------------------------------------------------------------------

export const getProjects = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/projects`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return handleResponse(response);
};

//*----------------------------------------------------------------------

export const getProjectById = async (projectId) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return handleResponse(response);
};

//*----------------------------------------------------------------------

export const createProject = async (projectData) => {
  const token = getToken();
  console.log("Creating project with token:", token ? "✓" : "✗");
  console.log("Project data:", projectData);

  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(projectData),
  });
  return handleResponse(response);
};

//*----------------------------------------------------------------------

export const updateProject = async (projectId, projectData) => {
  const token = getToken();
  console.log("Updating project:", projectId, "with data:", projectData);

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(projectData),
  });
  return handleResponse(response);
};

//*----------------------------------------------------------------------

export const deleteProject = async (projectId) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("bashville_auth_token");
    localStorage.removeItem("bashville_user_data");
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error("Failed to delete project");
  }
  return true;
};

//*----------------------------------------------------------------------

export const saveBackendConfig = async (projectId, backendConfig) => {
  const token = localStorage.getItem("bashville_auth_token");
  if (!token) throw new Error("No authentication token found. Please log in again.");

  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ backendConfig }),
  });
  return handleResponse(response);
};
