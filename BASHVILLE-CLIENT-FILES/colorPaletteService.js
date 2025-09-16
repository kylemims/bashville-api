import { API_BASE_URL } from "../utils/constants.js";

const getToken = () => {
  if (process.env.REACT_APP_USER_TOKEN) {
    return process.env.REACT_APP_USER_TOKEN;
  }
  return localStorage.getItem("bashville_auth_token") || "";
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
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (parseError) {
      console.warn("Could not parse error response:", parseError);
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const getColorPalettes = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/colorpalettes`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return handleResponse(response);
};

export const createColorPalette = async (paletteData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/colorpalettes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(paletteData),
  });
  return handleResponse(response);
};

export const updateColorPalette = async (paletteId, paletteData) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/colorpalettes/${paletteId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(paletteData),
  });
  return handleResponse(response);
};

export const deleteColorPalette = async (paletteId) => {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/colorpalettes/${paletteId}`, {
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
    throw new Error("Failed to delete color palette");
  }

  return true;
};
