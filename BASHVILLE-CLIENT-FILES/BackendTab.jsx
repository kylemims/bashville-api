import { useEffect, useState } from "react";
import { setBackendConfig, getBackendConfig, clearBackendConfig } from "../../utils/backendConfig";
import { saveBackendConfig } from "../../services/projectService";
import { generateCodeForProject } from "../../services/codeGenService";
import { ActionButton } from "../common/ActionButton.jsx";
import { MaterialIcon } from "../common/MaterialIcon.jsx";
import "./BackendTab.css";

export const BackendTab = ({ project }) => {
  const projectId = project?.id;
  const [config, setConfig] = useState(
    () => getBackendConfig(projectId) || { models: [], relationships: [] }
  );
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    setBackendConfig(projectId, config);
  }, [projectId, config]);

  const getModelNames = () => {
    return config.models?.filter((model) => model.name.trim()).map((model) => model.name.trim()) || [];
  };

  const addModel = () => {
    setConfig((c) => ({
      ...c,
      models: [...(c.models || []), { name: "", fields: [] }],
    }));
  };

  const removeModel = (idx) => {
    setConfig((c) => ({
      ...c,
      models: c.models.filter((_, i) => i !== idx),
    }));
  };

  const updateModelName = (idx, name) => {
    setConfig((c) => {
      const models = [...c.models];
      models[idx] = { ...models[idx], name };
      return { ...c, models };
    });
  };

  const addField = (mIdx) => {
    setConfig((c) => {
      const models = [...c.models];
      const model = { ...models[mIdx] };
      model.fields = [...(model.fields || []), { name: "", type: "CharField" }];
      models[mIdx] = model;
      return { ...c, models };
    });
  };

  const updateField = (mIdx, fIdx, patch) => {
    setConfig((c) => {
      const models = [...c.models];
      const model = { ...models[mIdx] };
      const fields = [...(model.fields || [])];
      fields[fIdx] = { ...fields[fIdx], ...patch };
      model.fields = fields;
      models[mIdx] = model;
      return { ...c, models };
    });
  };

  const removeField = (mIdx, fIdx) => {
    setConfig((c) => {
      const models = [...c.models];
      const model = { ...models[mIdx] };
      model.fields = model.fields.filter((_, i) => i !== fIdx);
      models[mIdx] = model;
      return { ...c, models };
    });
  };

  const addRelationship = () => {
    setConfig((c) => ({
      ...c,
      relationships: [
        ...(c.relationships || []),
        { from: "", type: "FK", to: "", on_delete: "CASCADE", related_name: "" },
      ],
    }));
  };

  const updateRelationship = (rIdx, patch) => {
    setConfig((c) => {
      const rels = [...(c.relationships || [])];
      rels[rIdx] = { ...rels[rIdx], ...patch };
      return { ...c, relationships: rels };
    });
  };

  const removeRelationship = (rIdx) => {
    setConfig((c) => {
      const rels = [...(c.relationships || [])];
      rels.splice(rIdx, 1);
      return { ...c, relationships: rels };
    });
  };

  const reset = () => {
    clearBackendConfig(projectId);
    setConfig({ models: [], relationships: [] });
  };

  const zipAndDownload = async (files, appLabel = "generated_app") => {
    const [{ default: JSZip }, { saveAs }] = await Promise.all([import("jszip"), import("file-saver")]);

    const zip = new JSZip();
    const folder = zip.folder(appLabel);
    Object.entries(files).forEach(([name, content]) => {
      folder.file(name, content);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${appLabel}.zip`);
  };

  const handleGenerateAndWrite = async () => {
    if (!projectId) return;
    setBusy(true);
    setStatusMsg("Saving configuration…");
    try {
      await saveBackendConfig(projectId, config);

      setStatusMsg("Generating code…");
      const { app_label, files } = await generateCodeForProject(projectId);

      setStatusMsg("Packaging files…");
      await zipAndDownload(files, app_label);

      setStatusMsg("✅ Code generated and downloaded.");
      setTimeout(() => setStatusMsg(""), 2500);
    } catch (err) {
      console.error(err);
      setStatusMsg(`❌ ${err.message || "Generation failed."}`);
    } finally {
      setBusy(false);
    }
  };

  const availableModels = getModelNames();

  return (
    <div className="backend-tab">
      <div className="backend-actions">
        <ActionButton variant="secondary" size="sm" onClick={reset}>
          <MaterialIcon icon="clear_all" size={16} />
          Clear All
        </ActionButton>
        <ActionButton
          variant="accent"
          size="sm"
          onClick={handleGenerateAndWrite}
          disabled={busy || !projectId}
          aria-busy={busy}>
          {busy ? "Working…" : "Generate & Write"}
        </ActionButton>
      </div>

      {statusMsg && <div className="backend-status">{statusMsg}</div>}

      <div className="backend-grid">
        {/* LEFT COLUMN - Models Only */}
        <div className="models-column">
          <section className="backend-section">
            <div className="section-header-with-action">
              <h3 className="section-title-with-line">Models</h3>
              <div className="section-gradient-line"></div>
              <ActionButton variant="add-field" size="xs" onClick={addModel} title="Add Model">
                <MaterialIcon icon="add" size={26} color="var(--muted)" />
              </ActionButton>
            </div>

            {config.models?.length ? (
              config.models.map((m, mIdx) => (
                <div key={mIdx} className="model-card">
                  <div className="model-row">
                    <input
                      className="model-name-input"
                      placeholder="Model name (e.g., Post)"
                      value={m.name}
                      onChange={(e) => updateModelName(mIdx, e.target.value)}
                    />
                    <ActionButton variant="delete" size="xs" onClick={() => removeModel(mIdx)}>
                      <MaterialIcon icon="delete" size={16} color="var(--mutedx)" />
                    </ActionButton>
                  </div>

                  <div className="fields">
                    <div className="fields-header">
                      <span>Fields</span>
                      <ActionButton variant="add-field" size="xs" onClick={() => addField(mIdx)}>
                        <MaterialIcon icon="add" size={12} />
                        Add Field
                      </ActionButton>
                    </div>
                    {m.fields?.length ? (
                      m.fields.map((f, fIdx) => (
                        <div key={fIdx} className="field-row">
                          <input
                            className="text-input"
                            placeholder="field_name"
                            value={f.name}
                            onChange={(e) => updateField(mIdx, fIdx, { name: e.target.value })}
                          />
                          <select
                            className="select-input"
                            value={f.type}
                            onChange={(e) => updateField(mIdx, fIdx, { type: e.target.value })}>
                            <option>CharField</option>
                            <option>TextField</option>
                            <option>IntegerField</option>
                            <option>BooleanField</option>
                            <option>DateTimeField</option>
                            <option>ForeignKey</option>
                            <option>ManyToManyField</option>
                          </select>
                          <ActionButton variant="delete" size="xs" onClick={() => removeField(mIdx, fIdx)}>
                            <MaterialIcon icon="remove" size={14} color="var(--mutedx)" />
                          </ActionButton>
                        </div>
                      ))
                    ) : (
                      <p className="empty-note">No fields yet.</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-note">No models yet. Click + to add a model.</p>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN - Relationships AND Preview */}
        <div className="right-column">
          {/* Relationships Section */}
          <section className="backend-section">
            <div className="section-header-with-action">
              <div className="rel-title">
                <h3 className="section-title-with-line">Relationships</h3>
                <span
                  className="rel-help"
                  title={
                    "FK (ForeignKey): Many-to-One. Example: Many Book -> one Author\n" +
                    "M2M (ManyToMany): Many-to-Many. Example: Post <-> Tag\n" +
                    "O2O (OneToOne): One-to-One. Example: User <-> Profile\n\n" +
                    "Tips:\n" +
                    "• Put the FK on the Many side (e.g., Book.author -> Author)\n" +
                    "• M2M creates a join table automatically\n" +
                    "• O2O is like a unique FK (1:1)"
                  }
                  aria-label="Relationship help">
                  <MaterialIcon icon="help" size={16} />
                </span>
              </div>
              <div className="section-gradient-line"></div>
              <ActionButton variant="add-field" size="xs" onClick={addRelationship} title="Add Relationship">
                <MaterialIcon icon="add" size={26} color="var(--muted)" />
              </ActionButton>
            </div>

            {config.relationships?.length ? (
              config.relationships.map((r, rIdx) => (
                <div key={rIdx} className="rel-row">
                  {/* <input
                    className="text-input"
                    placeholder="From model (e.g., Post)"
                    value={r.from}
                    onChange={(e) => updateRelationship(rIdx, { from: e.target.value })}
                  /> */}
                  <select
                    className="select-input model-select"
                    value={r.from}
                    onChange={(e) => updateRelationship(rIdx, { from: e.target.value })}
                    title="From model">
                    <option value="">From model...</option>
                    {availableModels.map((modelName) => (
                      <option key={modelName} value={modelName}>
                        {modelName}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select-input"
                    value={r.type}
                    onChange={(e) => updateRelationship(rIdx, { type: e.target.value })}>
                    <option value="FK">FK</option>
                    <option value="M2M">M2M</option>
                    <option value="O2O">O2O</option>
                  </select>
                  {/* <input
                    className="text-input"
                    placeholder="To model (e.g., User)"
                    value={r.to}
                    onChange={(e) => updateRelationship(rIdx, { to: e.target.value })}
                  /> */}
                  <select
                    className="select-input model-select"
                    value={r.to}
                    onChange={(e) => updateRelationship(rIdx, { to: e.target.value })}
                    title="To model">
                    <option value="">To model...</option>
                    {availableModels.map((modelName) => (
                      <option key={modelName} value={modelName}>
                        {modelName}
                      </option>
                    ))}
                  </select>
                  <ActionButton variant="delete" size="xs" onClick={() => removeRelationship(rIdx)}>
                    <MaterialIcon icon="remove" size={14} color="var(--color-secondary)" />
                  </ActionButton>
                </div>
              ))
            ) : (
              <p className="empty-note">No relationships yet.</p>
            )}

            {/* ✨ HELPFUL HINT */}
            {availableModels.length === 0 && (
              <div className="relationships-hint">
                <MaterialIcon icon="info" size={16} color="var(--muted)" />
                <span>Create some models first to add relationships between them.</span>
              </div>
            )}
          </section>

          {/* Preview Section */}
          <section className="backend-section">
            <h3 className="section-title">Preview</h3>
            <pre className="preview">{JSON.stringify(config, null, 2)}</pre>
            <p className="hint">Saved locally for project #{projectId}. Setup files will include this.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
