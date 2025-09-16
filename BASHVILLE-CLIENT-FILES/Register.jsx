import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { registerUser } from "../services/auth";
import { ROUTES } from "../utils/constants";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { FormField } from "../components/common/FormField.jsx";
import { ActionButton } from "../components/common/ActionButton.jsx";
import { ErrorMessage } from "../components/common/ErrorMessage.jsx";

export const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useDocumentTitle("Register • BASH STASH");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
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
      const response = await registerUser(formData.username, formData.email, formData.password);
      login(response.token, response.user);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
      setError(`Registration failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.username && formData.email && formData.password;

  return (
    <div className="page-content page-enter">
      <div className="page-card">
        <h1 className="text-2xl mb-6">Join Bash Stash</h1>
        <h2 className="card-title">Create Account</h2>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <FormField
            label="Username"
            type="text"
            value={formData.username}
            onChange={(value) => handleInputChange("username", value)}
            placeholder="Choose a username"
            required
            disabled={loading}
            autoFocus
          />
          <FormField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange("email", value)}
            placeholder="your.email@example.com"
            required
            disabled={loading}
          />
          <FormField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(value) => handleInputChange("password", value)}
            placeholder="Create a password"
            required
            disabled={loading}
          />

          <ActionButton
            type="submit"
            variant="secondary"
            disabled={loading || !isFormValid}
            style={{ width: "100%", marginBottom: "1rem" }}>
            {loading ? "Creating Account..." : "Sign Up"}
          </ActionButton>
        </form>

        <div className="text-center">
          <Link to={ROUTES.LOGIN} style={{ color: "var(--color-accent)" }}>
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
