import { STORAGE_KEYS, API_BASE_URL } from "../utils/constants.js";

export const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || "";
};

export const registerUser = async (username, email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Registration failed");
  }

  const data = await response.json();

  return {
    token: data.token,
    user: {
      id: data.user_id,
      username: data.username || username,
      email: email,
    },
  };
};

export const loginUser = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.non_field_errors?.[0] || "Login failed");
  }

  const data = await response.json();

  return {
    token: data.token,
    user: {
      id: data.user_id || data.id,
      username: data.username || username,
      email: data.email || "",
    },
  };
};
