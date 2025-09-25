import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants";

// Helper function to get authentication token
const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  console.log("📡 Response status:", response.status);
  console.log("📡 Response URL:", response.url);

  if (response.status === 401) {
    // Token expired or invalid - trigger logout
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    window.location.href = "/login";
    throw new Error("Authentication failed");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("❌ API Error Response:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData,
    });
    throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
  }

  const data = await response.json();

  // Handle nested response structure - if response has a 'note' key, extract it
  if (data.note && typeof data.note === "object") {
    console.log("📡 Extracting nested note data from response");
    return data.note;
  }

  // Handle array responses or direct objects
  return data;
};

// Helper function to build query parameters
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });

  return searchParams.toString();
};

// Get all notes with optional filtering and pagination
export const getNotes = async (filters = {}) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const queryString = buildQueryParams(filters);
  const url = `${API_BASE_URL}/notes${queryString ? `?${queryString}` : ""}`;

  console.log("🔍 Requesting Notes URL:", url);
  console.log("🔑 Using token:", token ? "✅ Token present" : "❌ No token");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

// Get a single note by ID
export const getNote = async (noteId) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

// Create a new note
export const createNote = async (noteData) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  });

  return handleResponse(response);
};

// Create a quick note (minimal data)
export const createQuickNote = async (content, projectId = null) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  // Convert content to blocks format for compatibility with block-based backend
  const quickNoteData = {
    blocks: [
      {
        id: "quick-block-1",
        type: "text",
        content: content,
        order: 0,
      },
    ],
    project: projectId,
  };

  const response = await fetch(`${API_BASE_URL}/notes/quick_create`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(quickNoteData),
  });

  return handleResponse(response);
};

// Update an existing note
export const updateNote = async (noteId, noteData) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: "PUT",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  });

  return handleResponse(response);
};

// Partially update a note (PATCH)
export const patchNote = async (noteId, partialData) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(partialData),
  });

  return handleResponse(response);
};

// Delete a note
export const deleteNote = async (noteId) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 204) {
    return { success: true };
  }

  return handleResponse(response);
};

// Search notes with advanced syntax
export const searchNotes = async (query) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const queryParams = new URLSearchParams({ q: query });
  const response = await fetch(`${API_BASE_URL}/notes/search?${queryParams}`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

// Get note statistics
export const getNoteStats = async (projectId = null) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const params = projectId ? { project: projectId } : {};
  const queryString = buildQueryParams(params);
  const url = `${API_BASE_URL}/notes/stats${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

// Get notes by category
export const getNotesByCategory = async (category) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const url = category
    ? `${API_BASE_URL}/notes/by_category?category=${category}`
    : `${API_BASE_URL}/notes/by_category`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

// Get notes by project
export const getNotesByProject = async (projectId) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/by_project?project_id=${projectId}`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

// Get recent notes
export const getRecentNotes = async (limit = 10) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/recent/?limit=${limit}`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

// Toggle note completion status
export const toggleNoteCompletion = async (noteId) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/toggle_completion`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

// Archive/unarchive a note
export const toggleNoteArchived = async (noteId) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/toggle_archived`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

// Mark note as important/unimportant
export const toggleNoteImportant = async (noteId) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/${noteId}/toggle_important`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
};

// Bulk operations
export const bulkDeleteNotes = async (noteIds) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/bulk_actions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      note_ids: noteIds,
      action: "delete",
    }),
  });

  return handleResponse(response);
};

export const bulkArchiveNotes = async (noteIds) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/bulk_actions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      note_ids: noteIds,
      action: "archive",
    }),
  });

  return handleResponse(response);
};

export const bulkCompleteNotes = async (noteIds) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/bulk_actions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      note_ids: noteIds,
      action: "complete",
    }),
  });

  return handleResponse(response);
};

// Bulk reorder notes for drag and drop
export const bulkReorderNotes = async (updates) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token");

  const response = await fetch(`${API_BASE_URL}/notes/bulk_reorder`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ updates }),
  });

  return handleResponse(response);
};

// Export functions for easier access
const noteService = {
  getNotes,
  getNote,
  createNote,
  createQuickNote,
  updateNote,
  patchNote,
  deleteNote,
  searchNotes,
  getNoteStats,
  getNotesByCategory,
  getNotesByProject,
  getRecentNotes,
  toggleNoteCompletion,
  toggleNoteArchived,
  toggleNoteImportant,
  bulkDeleteNotes,
  bulkArchiveNotes,
  bulkCompleteNotes,
  bulkReorderNotes,
};

export default noteService;
