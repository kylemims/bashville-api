import { useState, useEffect, useCallback } from "react";
import {
  getNotes,
  createQuickNote,
  deleteNote,
  toggleNoteCompletion,
  toggleNoteArchived,
  toggleNoteImportant,
  getNoteStats,
  searchNotes,
} from "../../services/noteService";
import { ErrorMessage } from "../common/ErrorMessage.jsx";
import { ActionButton } from "../common/ActionButton.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import { NoteCard } from "./NoteCard.jsx";
import { BlockBasedNoteCard } from "../project/BlockBasedNoteCard.jsx";
import { QuickNoteInput } from "./QuickNoteInput.jsx";
import { NoteFilters } from "./NoteFilters.jsx";
import { NoteStats } from "./NoteStats.jsx";
import "./NotesTab.css";

export const NotesTab = ({ project }) => {
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    is_completed: null,
    is_archived: false,
    is_important: null,
    project: project?.id || null,
  });
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [sortBy, setSortBy] = useState("-created_at"); // Most recent first
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "columns"
  const [useBlockMode, setUseBlockMode] = useState(true); // New block-based architecture
  const [groupBy, setGroupBy] = useState("none"); // "none", "project", "category", "priority"

  // Load notes when component mounts or filters change
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const queryParams = {
        ...filters,
        ordering: sortBy,
      };

      // Only include project filter if we're in project context
      if (project?.id) {
        queryParams.project = project.id;
      }

      const response = await getNotes(queryParams);
      setNotes(response.results || response); // Handle both paginated and simple responses
    } catch (err) {
      console.error("❌ Failed to load notes:", err);
      setError(`Failed to load notes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, project?.id]);

  const loadStats = useCallback(async () => {
    try {
      const projectId = project?.id || null;
      const statsData = await getNoteStats(projectId);
      setStats(statsData);
    } catch (err) {
      console.error("❌ Failed to load stats:", err);
      // Don't show error for stats, it's not critical
    }
  }, [project?.id]);

  useEffect(() => {
    loadNotes();
    loadStats();
  }, [loadNotes, loadStats]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If empty search, just reload with current filters
      loadNotes();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await searchNotes(searchQuery);
      setNotes(response.results || response);
    } catch (err) {
      console.error("❌ Search failed:", err);
      setError(`Search failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickNoteCreate = async (content) => {
    try {
      setError("");
      const newNote = await createQuickNote(content, project?.id);

      // Add the new note to the top of the list
      setNotes((prevNotes) => [newNote, ...prevNotes]);

      // Refresh stats
      loadStats();

      setShowQuickNote(false);

      console.log("✅ Quick note created:", newNote);
    } catch (err) {
      console.error("❌ Failed to create quick note:", err);
      setError(`Failed to create note: ${err.message}`);
    }
  };

  const handleNoteUpdate = (updatedNote) => {
    setNotes((prevNotes) => prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note)));
    loadStats();
  };

  const handleNoteDelete = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note? This cannot be undone.")) {
      return;
    }

    try {
      setError("");
      await deleteNote(noteId);

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      loadStats();

      console.log("✅ Note deleted");
    } catch (err) {
      console.error("❌ Failed to delete note:", err);
      setError(`Failed to delete note: ${err.message}`);
    }
  };

  const handleToggleCompletion = async (noteId) => {
    try {
      setError("");
      const updatedNote = await toggleNoteCompletion(noteId);
      handleNoteUpdate(updatedNote);
      console.log("✅ Note completion toggled");
    } catch (err) {
      console.error("❌ Failed to toggle completion:", err);
      setError(`Failed to update note: ${err.message}`);
    }
  };

  const handleToggleArchived = async (noteId) => {
    try {
      setError("");
      const updatedNote = await toggleNoteArchived(noteId);
      handleNoteUpdate(updatedNote);
      console.log("✅ Note archived status toggled");
    } catch (err) {
      console.error("❌ Failed to toggle archived:", err);
      setError(`Failed to update note: ${err.message}`);
    }
  };

  const handleToggleImportant = async (noteId) => {
    try {
      setError("");
      const updatedNote = await toggleNoteImportant(noteId);
      handleNoteUpdate(updatedNote);
      console.log("✅ Note importance toggled");
    } catch (err) {
      console.error("❌ Failed to toggle importance:", err);
      setError(`Failed to update note: ${err.message}`);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      is_completed: null,
      is_archived: false,
      is_important: null,
      project: project?.id || null,
    });
    setSearchQuery("");
  };

  const getFilteredNoteCount = () => {
    if (!notes) return 0;
    return notes.length;
  };

  const groupNotes = (notes, groupBy) => {
    if (groupBy === "none") {
      return { "All Notes": notes };
    }

    const groups = {};

    notes.forEach((note) => {
      let groupKey;

      switch (groupBy) {
        case "project":
          groupKey = note.project_title || note.project_name || "No Project";
          break;
        case "category":
          groupKey = note.category_display || note.category || "Other";
          break;
        case "priority":
          groupKey = `${
            (note.priority_level || "medium").charAt(0).toUpperCase() +
            (note.priority_level || "medium").slice(1)
          } Priority`;
          break;
        default:
          groupKey = "All Notes";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(note);
    });

    return groups;
  };

  const renderNotesContent = () => {
    if (viewMode === "grid") {
      return (
        <div className="notes-grid">
          {notes.map((note) =>
            useBlockMode ? (
              <BlockBasedNoteCard
                key={note.id}
                note={note}
                onUpdate={handleNoteUpdate}
                onDelete={() => handleNoteDelete(note.id)}
              />
            ) : (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleNoteUpdate}
                onDelete={() => handleNoteDelete(note.id)}
                onToggleCompletion={() => handleToggleCompletion(note.id)}
                onToggleArchived={() => handleToggleArchived(note.id)}
                onToggleImportant={() => handleToggleImportant(note.id)}
              />
            )
          )}
        </div>
      );
    }

    // Column view
    const groupedNotes = groupNotes(notes, groupBy);

    return (
      <div className="notes-columns">
        {Object.entries(groupedNotes).map(([groupName, groupNotes]) => (
          <div key={groupName} className="notes-column" data-category={groupName.toLowerCase()}>
            <div className="column-header">
              <h4 className="column-title">{groupName}</h4>
              <span className="column-count">{groupNotes.length}</span>
            </div>
            <div className="column-notes">
              {groupNotes.map((note) =>
                useBlockMode ? (
                  <BlockBasedNoteCard
                    key={note.id}
                    note={note}
                    onUpdate={handleNoteUpdate}
                    onDelete={() => handleNoteDelete(note.id)}
                  />
                ) : (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onUpdate={handleNoteUpdate}
                    onDelete={() => handleNoteDelete(note.id)}
                    onToggleCompletion={() => handleToggleCompletion(note.id)}
                    onToggleArchived={() => handleToggleArchived(note.id)}
                    onToggleImportant={() => handleToggleImportant(note.id)}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="notes-tab">
      {/* Header Section */}
      <div className="notes-header">
        <h3 className="section-title-available">{project ? `${project.title} Notes` : "All Notes"}</h3>
        <div className="notes-gradient-line"></div>
        <div className="notes-actions">
          <ActionButton
            variant="secondary"
            size="xs"
            onClick={() => setShowStats(!showStats)}
            title="Toggle Statistics">
            <MaterialIcon icon={showStats ? "analytics" : "analytics"} size={20} color="var(--muted)" />
          </ActionButton>

          <ActionButton
            variant="add-field"
            size="xs"
            onClick={() => setShowQuickNote(!showQuickNote)}
            title="Quick Note">
            <MaterialIcon icon="add" size={26} color="var(--muted)" />
          </ActionButton>
        </div>
      </div>
      {showStats && stats && <NoteStats stats={stats} projectTitle={project?.title} />}

      {/* Quick Note Input */}
      {showQuickNote && (
        <QuickNoteInput
          onSubmit={handleQuickNoteCreate}
          onCancel={() => setShowQuickNote(false)}
          placeholder={project ? `Quick note for ${project.title}...` : "Quick note..."}
        />
      )}
      <div className="search-and-filter-container">
        {/* Search Bar */}
        <div className="notes-search">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Search notes... (try: project:name, tag:bug, category:todo)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="search-input"
            />
            <ActionButton variant="primary" size="sm" onClick={handleSearch} disabled={loading}>
              <MaterialIcon icon="search" size={17} />
            </ActionButton>
          </div>
        </div>
        {/* Filters */}
        <NoteFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
          resultCount={getFilteredNoteCount()}
        />

        {/* Sort Options */}
        <div className="notes-sort">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="-updated_at">Recently Updated</option>
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
            <option value="category">Category</option>
            <option value="-is_important,created_at">Important First</option>
          </select>
        </div>

        {/* View Mode Controls */}
        <div className="notes-view-controls">
          <div className="view-mode-selector">
            <ActionButton
              variant={useBlockMode ? "primary" : "secondary"}
              size="xs"
              onClick={() => setUseBlockMode(!useBlockMode)}
              title="Toggle Block Mode">
              <MaterialIcon icon="view_module" size={16} />
            </ActionButton>
            <ActionButton
              variant={viewMode === "grid" ? "primary" : "secondary"}
              size="xs"
              onClick={() => setViewMode("grid")}
              title="Grid View">
              <MaterialIcon icon="grid_view" size={16} />
            </ActionButton>
            <ActionButton
              variant={viewMode === "columns" ? "primary" : "secondary"}
              size="xs"
              onClick={() => setViewMode("columns")}
              title="Column View">
              <MaterialIcon icon="view_column" size={16} />
            </ActionButton>
          </div>

          {viewMode === "columns" && (
            <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="group-by-select">
              <option value="none">No Grouping</option>
              <option value="project">Group by Project</option>
              <option value="category">Group by Category</option>
              <option value="priority">Group by Priority</option>
            </select>
          )}
        </div>
      </div>

      {/* Error Message */}
      <ErrorMessage message={error} onDismiss={() => setError("")} />

      {/* Notes List */}
      <div className="notes-content">
        {loading && (
          <div className="loading-spinner">
            <MaterialIcon icon="hourglass_empty" size={24} />
            <span>Loading notes...</span>
          </div>
        )}

        {!loading && notes.length === 0 && (
          <div className="empty-state">
            <MaterialIcon icon="note_add" size={48} color="var(--muted)" />
            <h4>No notes found</h4>
            <p>
              {searchQuery || Object.values(filters).some((f) => f && f !== project?.id)
                ? "Try adjusting your search or filters"
                : project
                ? `Start taking notes for ${project.title}`
                : "Create your first note to get started"}
            </p>
            <ActionButton variant="primary" size="md" onClick={() => setShowQuickNote(true)}>
              <MaterialIcon icon="add" size={18} />
              Create Note
            </ActionButton>
          </div>
        )}

        {!loading && notes.length > 0 && renderNotesContent()}
      </div>
    </div>
  );
};
