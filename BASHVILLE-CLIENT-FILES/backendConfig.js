const KEY = (projectId) => `bashville_backend_${projectId}`;

export const getBackendConfig = (projectId) => {
  try {
    const raw = localStorage.getItem(KEY(projectId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setBackendConfig = (projectId, config) => {
  localStorage.setItem(KEY(projectId), JSON.stringify(config || {}));
};

export const clearBackendConfig = (projectId) => {
  localStorage.removeItem(KEY(projectId));
};
