import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [backendUrl, setBackendUrl] = useState("");
  const [networkError, setNetworkError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Get the backend URL from environment variables when component mounts
  useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL;
    setBackendUrl(url || "http://localhost:3000");

    // Reset network error if we have a URL
    if (url) {
      setNetworkError(false);
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate name
    if (!name) {
      errors.name = "Name is required";
      isValid = false;
    } else if (name.length < 2 || name.length > 50) {
      errors.name = "Name must be between 2 and 50 characters";
      isValid = false;
    }

    // Validate email
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Validate password confirmation
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset all error states
    setError("");
    setFieldErrors({});
    setNetworkError(false);

    // Validate form inputs
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${backendUrl}/api/user/register`, {
        name,
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', JSON.stringify(response.data.user));
      login(response.data.user, response.data.token);
      setSuccess(true);
      setTimeout(() => {
        navigate("/create-quiz"); // <-- redirect after success
      }, 800); // short delay for user to see success
    } catch (err) {
      console.error("Registration error:", err);

      // Handle different error scenarios
      if (err.code === "ERR_NETWORK") {
        setNetworkError(true);
        setError(
          "Network error: Cannot connect to the server. Please check your internet connection."
        );
      } else if (err.response) {
        // The server responded with an error status code
        const status = err.response.status;
        const responseData = err.response.data;

        if (status === 400 && responseData.errors) {
          // Field validation errors from server
          setFieldErrors(responseData.errors);
        } else if (status === 409) {
          // Conflict - Email already exists
          setFieldErrors({ email: "This email is already registered" });
        } else if (status >= 500) {
          // Server errors
          setError("Server error. Please try again later.");
        } else {
          // Other errors from the server
          setError(
            responseData.message || "An error occurred during registration."
          );
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response received from server. Please try again later.");
      } else {
        // Something happened in setting up the request
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 overflow-hidden transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-gray-800 text-2xl font-semibold mb-2">
            Create an Account
          </h1>
          <p className="text-gray-500 text-sm">Please sign up to get started</p>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center text-center py-8 text-green-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 mb-4"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
            <p className="text-xl font-medium">Registration successful!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-2">
                {error}
              </div>
            )}

            {networkError && (
              <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm mb-2 border-l-4 border-red-800">
                <p>
                  Cannot connect to the server. Please check your internet
                  connection or try again later.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-600"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                className={`px-4 py-3 border ${
                  fieldErrors.name
                    ? "border-red-600 bg-red-50 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-600 focus:ring-blue-200"
                } rounded-md text-base transition-colors focus:outline-none focus:ring-2`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
              {fieldErrors.name && (
                <span className="text-red-600 text-xs mt-1">
                  {fieldErrors.name}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-600"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`px-4 py-3 border ${
                  fieldErrors.email
                    ? "border-red-600 bg-red-50 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-600 focus:ring-blue-200"
                } rounded-md text-base transition-colors focus:outline-none focus:ring-2`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
              {fieldErrors.email && (
                <span className="text-red-600 text-xs mt-1">
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-600"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className={`px-4 py-3 border ${
                  fieldErrors.password
                    ? "border-red-600 bg-red-50 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-600 focus:ring-blue-200"
                } rounded-md text-base transition-colors focus:outline-none focus:ring-2`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {fieldErrors.password && (
                <span className="text-red-600 text-xs mt-1">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-600"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`px-4 py-3 border ${
                  fieldErrors.confirmPassword
                    ? "border-red-600 bg-red-50 focus:ring-red-200"
                    : "border-gray-300 focus:border-blue-600 focus:ring-blue-200"
                } rounded-md text-base transition-colors focus:outline-none focus:ring-2`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {fieldErrors.confirmPassword && (
                <span className="text-red-600 text-xs mt-1">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              className={`bg-gradient-to-r from-blue-600 to-blue-900 text-white rounded-md py-3 px-4 text-base font-medium transition-all 
                ${
                  loading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:from-blue-700 hover:to-blue-950 active:scale-[0.98]"
                }
              `}
              disabled={loading || networkError}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                Already have an account?{" "}
                <Link
                  to="/"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;