import { useMemo } from "react";
import { validatePalette, getValidationRecommendations } from "../../utils/validatePalette.js";
import "./PaletteValidationSummary.css";

export const PaletteValidationSummary = ({ formData, isVisible = true }) => {
  const validation = useMemo(() => {
    if (!formData) return null;
    return validatePalette(formData);
  }, [formData]);

  const recommendations = useMemo(() => {
    if (!validation || validation.isValid) return [];
    return getValidationRecommendations(validation.failed);
  }, [validation]);

  if (!isVisible || !validation) return null;

  return (
    <div className={`validation-summary ${validation.summary.type}`}>
      <div className="validation-header">
        <h4 className="validation-title">{validation.summary.title}</h4>
        <div className="validation-score">
          <span className="score-value">{validation.score}%</span>
          <span className="score-label">Accessibility Score</span>
        </div>
      </div>

      <p className="validation-message">{validation.summary.message}</p>

      {validation.failed.length > 0 && (
        <div className="validation-details">
          <h5>Issues Found:</h5>
          <ul className="issues-list">
            {validation.failed.map(([key, check]) => (
              <li key={key} className="issue-item">
                <span className="issue-element">{check.label}</span>
                <span className="issue-description">
                  may be hard to read ({check.text} on {check.background})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="validation-recommendations">
          <h5>💡 Suggestions:</h5>
          <ul className="recommendations-list">
            {recommendations.map((rec, index) => (
              <li key={index} className="recommendation-item">
                {rec.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validation.isValid && (
        <div className="validation-success">
          <p>
            🎉 Your palette follows accessibility best practices and will create a professional, readable
            website!
          </p>
        </div>
      )}
    </div>
  );
};
