import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Auth() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        if (formData.password.length < 6) {
          throw new Error(
            "Password must be at least 6 characters."
          );
        }

        const data = await register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        });

        if (!data.session) {
          setMessage(
            "Account created! Please check your email to confirm your account."
          );
        } else {
          navigate("/");
        }
      } else {
        await login(
          formData.email,
          formData.password
        );

        navigate("/");
      }
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">

        <div className="auth-intro">
          <Link to="/" className="back-link">
            ← Back to home
          </Link>

          <p className="eyebrow">
            ITLU SREE
          </p>

          <h1>
            {mode === "login" ? (
              <>
                Welcome
                <br />
                back.
              </>
            ) : (
              <>
                Come on
                <br />
                in.
              </>
            )}
          </h1>

          <p className="auth-description">
            {mode === "login"
              ? "Your little corner of hand-painted things is waiting for you."
              : "Create an account to keep track of your orders and custom pieces."}
          </p>
        </div>

        <div className="auth-card">

          <div className="auth-tabs">
            <button
              type="button"
              className={
                mode === "login"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => switchMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={
                mode === "register"
                  ? "auth-tab active"
                  : "auth-tab"
              }
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {mode === "register" && (
              <>
                <div className="form-field">
                  <label htmlFor="auth-name">
                    Your name
                  </label>

                  <input
                    id="auth-name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="auth-phone">
                    Phone number
                  </label>

                  <input
                    id="auth-phone"
                    name="phone"
                    type="tel"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-field">
              <label htmlFor="auth-email">
                Email address
              </label>

              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="auth-password">
                Password
              </label>

              <input
                id="auth-password"
                name="password"
                type="password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {mode === "register" && (
              <div className="form-field">
                <label htmlFor="auth-confirm-password">
                  Confirm password
                </label>

                <input
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Enter your password again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {error && (
              <p className="auth-message auth-error">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-message auth-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login →"
                : "Create account →"}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login"
              ? "New to itlu sree?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() =>
                switchMode(
                  mode === "login"
                    ? "register"
                    : "login"
                )
              }
            >
              {mode === "login"
                ? "Create an account"
                : "Login instead"}
            </button>
          </p>

        </div>
      </div>
    </main>
  );
}

export default Auth;