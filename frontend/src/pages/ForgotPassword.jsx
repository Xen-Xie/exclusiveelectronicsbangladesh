// pages/ForgotPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";
import axios from "axios";
import toast from "react-hot-toast";
import Btn from "../components/Common/Btn";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const validateEmail = (value) => {
    setEmail(value);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError("Email is required");
    } else if (!regex.test(value)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (emailError) return;

    setLoading(true);

    try {
      // First check if user exists in our backend
      const checkUser = await axios.post(`${apiUrl}/api/user/forgot-password`, {
        email,
      });

      if (checkUser.data.status === "success") {
        // Only if user exists, send password reset email via Firebase
        await sendPasswordResetEmail(auth, email);

        setEmailSent(true);
        toast.success("Password reset email sent! Check your inbox.", {
          icon: "📧",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      let errorMessage = "";

      // Handle backend errors (user not found, etc.)
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      // Handle Firebase errors
      else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else {
        errorMessage = "Failed to send reset email. Please try again.";
      }

      // Show error message to user
      toast.error(errorMessage);

      // Update email error state
      if (
        errorMessage.toLowerCase().includes("account") ||
        errorMessage.toLowerCase().includes("found") ||
        errorMessage.toLowerCase().includes("email")
      ) {
        setEmailError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fa-regular fa-envelope text-4xl text-green-600"></i>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>

          <p className="text-gray-600">
            We've sent a password reset link to:
            <br />
            <span className="font-semibold text-primary">{email}</span>
          </p>

          <p className="text-sm text-gray-500">
            Click the link in the email to reset your password. If you don't see
            the email, check your spam folder.
          </p>

          <div className="space-y-3">
            <Btn
              variant="primary"
              onClick={() => navigate("/login")}
              className="w-full py-2 px-4 rounded-lg font-medium"
            >
              Back to Login
            </Btn>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="text-sm text-primary hover:underline"
            >
              Resend Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-container max-w-md mx-2 xs:mx-3 md:mx-auto mt-10 p-6 rounded-2xl shadow-lg font-urbanist mb-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-key text-primary text-2xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
        <p className="text-gray-500 text-sm mt-2">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-lg mx-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              id="email"
              value={email}
              onChange={(e) => validateEmail(e.target.value)}
              className={`border px-3 py-1.5 rounded-3xl outline-none transition focus:ring-2 focus:ring-primary/20
                ${
                  emailError
                    ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-secondary focus:border-primary"
                }
              `}
              required
            />
            {emailError && (
              <p className="text-red-600 text-sm mx-1">{emailError}</p>
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
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Btn>
        </div>

        <div className="text-center mt-4">
          <Link to="/login" className="text-primary hover:underline text-sm">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
