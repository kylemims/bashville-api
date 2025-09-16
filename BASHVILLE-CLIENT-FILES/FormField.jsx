import "./FormField.css";

export const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  autoFocus = false,
  error,
  ...props
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="form-field">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`input ${error ? "input--error" : ""}`}
          {...props}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`input ${error ? "input--error" : ""}`}
          {...props}
        />
      )}

      {error && <span className="form-error">{error}</span>}
    </div>
  );
};
