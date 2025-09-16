import { API_BASE_URL } from "../utils/constants.js";

const getToken = () => process.env.REACT_APP_USER_TOKEN || localStorage.getItem("bashville_auth_token") || "";

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem("bashville_auth_token");
    localStorage.removeItem("bashville_user_data");
    window.location.href = "/login";
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) {
    let msg = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      msg = data.message || data.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return response.json();
};

export const generateCodeForProject = async (projectId) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/codegen/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ project_id: projectId }),
  });
  return handleResponse(response);
};

export const downloadGeneratedCode = async (codeId) => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/codegen/download/${codeId}`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download generated code`);
  }
  return response.blob();
};
