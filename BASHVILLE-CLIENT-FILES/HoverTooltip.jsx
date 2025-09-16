import { useState } from "react";
import "./HoverTooltip.css";

export const HoverTooltip = ({ children, tooltipContent, onClick, className }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="icon-tooltip-container">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={`hover-tooltip ${className}`}
        children={children}></div>

      {showTooltip && <div className="tooltip-content">{tooltipContent}</div>}
    </div>
  );
};
