import { useState } from "react";
import "./InfoTip.css";

export const InfoTip = ({ label = "What’s this?", children }) => {
  const [open, setOpen] = useState(false);
  return (
    <span className="info-tip">
      <button className="info-tip__button" type="button" onClick={() => setOpen((o) => !o)}>
        ⓘ
      </button>
      {open && (
        <div className="info-tip__card">
          <div className="info-tip__header">
            <strong>{label}</strong>
            <button className="info-tip__close" type="button" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="info-tip__body">{children}</div>
        </div>
      )}
    </span>
  );
};
