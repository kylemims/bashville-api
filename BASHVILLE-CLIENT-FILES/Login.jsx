import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginUser } from "../services/auth.js";
import { ROUTES } from "../utils/constants";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { FormField } from "../components/common/FormField.jsx";
import { ActionButton } from "../components/common/ActionButton.jsx";
import { ErrorMessage } from "../components/common/ErrorMessage.jsx";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useDocumentTitle("Login • BASH STASH");

  const from = location.state?.from || ROUTES.DASHBOARD;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await loginUser(formData.username, formData.password);
      login(response.token, response.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.username && formData.password;

  return (
    <div className="page-content page-enter">
      <div className="page-card">
        <h1 className="text-2xl mb-6">Welcome Back</h1>
        <h2 className="card-title">Sign In</h2>

        {from !== ROUTES.DASHBOARD && (
          <p className="mb-4" style={{ color: "var(--color-accent)" }}>
            Please sign in to access your projects
          </p>
        )}

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <FormField
            label="Username"
            type="text"
            value={formData.username}
            onChange={(value) => handleInputChange("username", value)}
            placeholder="Your username"
            required
            disabled={loading}
            autoFocus
          />

          <FormField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(value) => handleInputChange("password", value)}
            placeholder="Your password"
            required
            disabled={loading}
          />

          <ActionButton
            type="submit"
            variant="secondary"
            disabled={loading || !isFormValid}
            style={{ width: "100%", marginBottom: "1rem" }}>
            {loading ? "Signing In..." : "Sign In"}
          </ActionButton>
        </form>

        <div className="text-center">
          <Link to={ROUTES.REGISTER} style={{ color: "var(--color-accent)" }}>
            Don't have an account? Create one
          </Link>
        </div>
      </div>
    </div>
  );
};
