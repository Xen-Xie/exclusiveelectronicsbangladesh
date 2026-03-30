// pages/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../firebase/firebase";
import toast from "react-hot-toast";
import Btn from "../components/Common/Btn";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Get the oobCode from URL (Firebase sends this in the reset link)
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get("oobCode");

  useEffect(() => {
    if (!oobCode) {
      toast.error("Invalid reset link. Please request a new one.");
      navigate("/forgot-password");
    }
  }, [oobCode, navigate]);

  const validatePassword = (value) => {
    setPassword(value);
    if (!value.trim()) {
      setPassError("Password is required");
    } else if (value.length < 6) {
      setPassError("Password must be at least 6 characters");
    } else {
      setPassError("");
    }

    // Check confirm password match
    if (confirmPassword && value !== confirmPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  const validateConfirmPassword = (value) => {
    setConfirmPassword(value);
    if (value !== password) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      setPassError("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setPassError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Reset password using Firebase
      await confirmPasswordReset(auth, oobCode, password);

      setResetSuccess(true);
      toast.success(
        "Password reset successfully! Please login with your new password.",
        {
          duration: 5000,
        },
      );

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);

      let errorMessage = "Failed to reset password. Please try again.";

      if (error.code === "auth/expired-action-code") {
        errorMessage = "Reset link has expired. Please request a new one.";
      } else if (error.code === "auth/invalid-action-code") {
        errorMessage = "Invalid reset link. Please request a new one.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      }

      toast.error(errorMessage);

      if (
        errorMessage.includes("expired") ||
        errorMessage.includes("invalid")
      ) {
        setTimeout(() => {
          navigate("/forgot-password");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-check-circle text-4xl text-green-600"></i>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Password Reset Successful!
          </h2>

          <p className="text-gray-600">
            Your password has been reset successfully.
          </p>

          <p className="text-sm text-gray-500">Redirecting to login page...</p>

          <Btn
            variant="primary"
            onClick={() => navigate("/login")}
            className="w-full py-2 px-4 rounded-lg font-medium"
          >
            Go to Login
          </Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-container max-w-md mx-2 xs:mx-3 md:mx-auto mt-10 p-6 rounded-2xl shadow-lg font-urbanist mb-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-lock text-primary text-2xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
        <p className="text-gray-500 text-sm mt-2">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* New Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-lg mx-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                id="password"
                value={password}
                onChange={(e) => validatePassword(e.target.value)}
                className={`border px-3 py-1.5 rounded-3xl outline-none w-full pr-10 transition focus:ring-2 focus:ring-primary/20
                  ${
                    passError
                      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-secondary focus:border-primary"
                  }
                `}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i
                  className={`fa-solid ${
                    showPassword ? "fa-eye" : "fa-eye-slash"
                  }`}
                ></i>
              </button>
            </div>
            {passError && (
              <p className="text-red-600 text-sm mx-1">{passError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-lg mx-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => validateConfirmPassword(e.target.value)}
              className={`border px-3 py-1.5 rounded-3xl outline-none transition w-full focus:ring-2 focus:ring-primary/20
                ${
                  confirmError
                    ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-secondary focus:border-primary"
                }
              `}
              required
            />
            {confirmError && (
              <p className="text-red-600 text-sm mx-1">{confirmError}</p>
            )}
          </div>

          <Btn
            variant="primary"
            type="submit"
            className="w-full mt-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Btn>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/login")}
            className="text-primary hover:underline text-sm"
          >
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;
