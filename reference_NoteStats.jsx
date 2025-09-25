import { MaterialIcon } from "../common/MaterialIcon.jsx";
import "./NoteStats.css";

export const NoteStats = ({ stats, projectTitle }) => {
  if (!stats) return null;

  const {
    total_notes,
    completed_notes,
    important_notes,
    archived_notes,
    category_breakdown,
    recent_activity,
    productivity_score,
  } = stats;

  const categoryConfig = {
    bug: { icon: "bug_report", color: "var(--color-secondary)", label: "Bugs" },
    todo: { icon: "task_alt", color: "var(--accent)", label: "Todos" },
    wishlist: { icon: "star", color: "var(--color-primary)", label: "Wishlist" },
    code: { icon: "code", color: "var(--muted)", label: "Code" },
    question: { icon: "help", color: "var(--color-accent)", label: "Questions" },
    reminder: { icon: "schedule", color: "var(--color-primary)", label: "Reminders" },
    other: { icon: "note", color: "var(--text)", label: "General" },
  };

  const completionRate = total_notes > 0 ? Math.round((completed_notes / total_notes) * 100) : 0;
  const importanceRate = total_notes > 0 ? Math.round((important_notes / total_notes) * 100) : 0;

  const getProductivityColor = (score) => {
    if (score >= 80) return "var(--accent)";
    if (score >= 60) return "var(--color-primary)";
    if (score >= 40) return "var(--muted)";
    return "var(--color-secondary)";
  };

  const getProductivityLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="note-stats">
      <div className="stats-header">
        <h4 className="stats-title">
          <MaterialIcon icon="analytics" size={18} />
          {projectTitle ? `${projectTitle} Analytics` : "Notes Analytics"}
        </h4>
      </div>

      <div className="stats-grid">
        {/* Overview Cards */}
        <div className="stat-card overview-card">
          <div className="stat-content">
            <div className="stat-number">{total_notes}</div>
            <div className="stat-label">Total Notes</div>
          </div>
          <MaterialIcon icon="note" size={24} color="var(--text)" />
        </div>

        <div className="stat-card completion-card">
          <div className="stat-content">
            <div className="stat-number">{completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
            <div className="stat-detail">
              {completed_notes} of {total_notes}
            </div>
          </div>
          <MaterialIcon icon="check_circle" size={24} color="var(--accent)" />
        </div>

        <div className="stat-card importance-card">
          <div className="stat-content">
            <div className="stat-number">{importanceRate}%</div>
            <div className="stat-label">Important</div>
            <div className="stat-detail">{important_notes} notes</div>
          </div>
          <MaterialIcon icon="priority_high" size={24} color="var(--color-secondary)" />
        </div>

        {productivity_score !== undefined && (
          <div className="stat-card productivity-card">
            <div className="stat-content">
              <div className="stat-number">{productivity_score}</div>
              <div className="stat-label">Productivity</div>
              <div className="stat-detail">{getProductivityLabel(productivity_score)}</div>
            </div>
            <MaterialIcon icon="trending_up" size={24} color={getProductivityColor(productivity_score)} />
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {category_breakdown && Object.keys(category_breakdown).length > 0 && (
        <div className="category-stats">
          <h5 className="subsection-title">
            <MaterialIcon icon="category" size={16} />
            Categories
          </h5>
          <div className="category-grid">
            {Object.entries(category_breakdown)
              .sort(([, a], [, b]) => b - a) // Sort by count descending
              .map(([category, count]) => {
                const config = categoryConfig[category] || categoryConfig.other;
                const percentage = total_notes > 0 ? Math.round((count / total_notes) * 100) : 0;

                return (
                  <div key={category} className="category-stat">
                    <div className="category-info">
                      <MaterialIcon icon={config.icon} size={16} color={config.color} />
                      <span className="category-name">{config.label}</span>
                    </div>
                    <div className="category-numbers">
                      <span className="category-count">{count}</span>
                      <span className="category-percentage">({percentage}%)</span>
                    </div>
                    <div
                      className="category-bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: config.color,
                      }}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recent_activity && (
        <div className="recent-activity">
          <h5 className="subsection-title">
            <MaterialIcon icon="history" size={16} />
            Recent Activity
          </h5>
          <div className="activity-summary">
            <div className="activity-item">
              <MaterialIcon icon="add_circle" size={14} color="var(--accent)" />
              <span>{recent_activity.notes_created_today || 0} notes created today</span>
            </div>
            <div className="activity-item">
              <MaterialIcon icon="check_circle" size={14} color="var(--accent)" />
              <span>{recent_activity.notes_completed_today || 0} notes completed today</span>
            </div>
            <div className="activity-item">
              <MaterialIcon icon="update" size={14} color="var(--muted)" />
              <span>{recent_activity.notes_updated_week || 0} notes updated this week</span>
            </div>
          </div>
        </div>
      )}

      {/* Archive Status */}
      {archived_notes > 0 && (
        <div className="archive-status">
          <div className="archive-info">
            <MaterialIcon icon="archive" size={16} color="var(--muted)" />
            <span>
              {archived_notes} archived note{archived_notes !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="insights">
        <h5 className="subsection-title">
          <MaterialIcon icon="lightbulb" size={16} />
          Insights
        </h5>
        <div className="insight-list">
          {total_notes === 0 && (
            <div className="insight-item">
              <MaterialIcon icon="info" size={14} color="var(--color-accent)" />
              <span>Start taking notes to see analytics and insights</span>
            </div>
          )}

          {total_notes > 0 && completionRate < 30 && (
            <div className="insight-item">
              <MaterialIcon icon="trending_down" size={14} color="var(--color-secondary)" />
              <span>Low completion rate - consider reviewing and completing some todos</span>
            </div>
          )}

          {total_notes > 0 && completionRate > 80 && (
            <div className="insight-item">
              <MaterialIcon icon="celebration" size={14} color="var(--accent)" />
              <span>Great completion rate! You're staying on top of your tasks</span>
            </div>
          )}

          {category_breakdown?.bug > 5 && (
            <div className="insight-item">
              <MaterialIcon icon="warning" size={14} color="var(--color-secondary)" />
              <span>High number of bug reports - consider prioritizing fixes</span>
            </div>
          )}

          {category_breakdown?.question > 3 && (
            <div className="insight-item">
              <MaterialIcon icon="help" size={14} color="var(--color-accent)" />
              <span>Several open questions - might be good to seek answers</span>
            </div>
          )}

          {importanceRate > 50 && (
            <div className="insight-item">
              <MaterialIcon icon="priority_high" size={14} color="var(--color-primary)" />
              <span>Many important notes - focus on high-priority items first</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
