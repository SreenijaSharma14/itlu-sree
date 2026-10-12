
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    login,
    register,
    user,
    profile,
    loading: authLoading,
  } = useAuth();

  const requestedRedirect =
    searchParams.get("redirect");

  const safeRedirect =
    requestedRedirect?.startsWith("/") &&
    !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : null;

  const [mode, setMode] = useState("login");
  const [showLoginPassword, setShowLoginPassword] =
    useState(false);
  const [showRegistrationPassword, setShowRegistrationPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const passwordVisible =
    mode === "login"
      ? showLoginPassword
      : showRegistrationPassword;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [pendingLoginUserId, setPendingLoginUserId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!pendingLoginUserId || authLoading) {
      return;
    }

    if (user?.id !== pendingLoginUserId) {
      return;
    }

    if (profile?.id !== pendingLoginUserId) {
      setError("Your account profile could not be loaded. Please try logging in again.");
      setPendingLoginUserId(null);
      return;
    }

    navigate(
      safeRedirect || (profile.role === "admin" ? "/admin/orders" : "/"),
      { replace: true }
    );
    setPendingLoginUserId(null);
  }, [
    authLoading,
    navigate,
    pendingLoginUserId,
    profile,
    safeRedirect,
    user,
  ]);

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
    const isRegistration = mode === "register";

    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isRegistration) {
        if (
          formData.password !==
          formData.confirmPassword
        ) {
          throw new Error(
            "Passwords do not match."
          );
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

        if (data.session) {
          navigate("/", {
            replace: true,
          });
        } else {
          setMessage(
            "If you're registering for the first time, check your inbox for a confirmation email. If you already have an account, please log in."
          );
        }
      } else {
        const data = await login(
          formData.email,
          formData.password
        );

        if (!data.user?.id) {
          throw new Error("Unable to confirm the signed-in account. Please try again.");
        }

        setPendingLoginUserId(data.user.id);
      }
    } catch (err) {
      const errorCode = String(err?.code || "").toLowerCase();
      const errorMessage = String(err?.message || "");
      const normalizedMessage = errorMessage.toLowerCase();

      if (
        isRegistration &&
        (Number(err?.status) === 429 ||
          errorCode.includes("rate_limit") ||
          normalizedMessage.includes("rate limit"))
      ) {
        setError(
          "Too many signup requests right now. Please wait a few minutes and try again."
        );
      } else if (
        isRegistration &&
        (["user_already_exists", "email_exists"].includes(errorCode) ||
          normalizedMessage.includes("user already registered") ||
          normalizedMessage.includes("email already exists"))
      ) {
        setError(
          "An account with this email may already exist. Try logging in instead."
        );
      } else {
        setError(
          errorMessage || "Something went wrong. Please try again."
        );
      }
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

          {mode === "register" && (
            <p className="auth-registration-notice">
              Already have an account or already registered? Please log in instead of registering again.
            </p>
          )}

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

              <div className="password-input-wrap">
                <input
                  id="auth-password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="password-visibility-toggle"
                  aria-controls="auth-password"
                  aria-label={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                  aria-pressed={passwordVisible}
                  onClick={() =>
                    mode === "login"
                      ? setShowLoginPassword((visible) => !visible)
                      : setShowRegistrationPassword((visible) => !visible)
                  }
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div className="form-field">
                <label htmlFor="auth-confirm-password">
                  Confirm password
                </label>

                <div className="password-input-wrap">
                  <input
                    id="auth-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password again"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-visibility-toggle"
                    aria-controls="auth-confirm-password"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirmPassword}
                    onClick={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
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
