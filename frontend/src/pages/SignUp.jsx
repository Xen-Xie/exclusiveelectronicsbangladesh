/* eslint-disable no-unused-vars */
import { useState } from "react";
import Btn from "../components/Common/Btn";
import { Link } from "react-router";
import axios from "axios";
import { useNavigate } from "react-router";
import { signInWithPopup } from "firebase/auth";
import { auth, provide } from "../firebase/firebase";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passError, setPassError] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Email Validation
  const validateEmail = (value) => {
    setEmail(value);
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value.trim()) setEmailError("Email is required");
    else if (!regex.test(value)) setEmailError("Invalid email format");
    else setEmailError("");
  };

  // Password Validation
  const validatePassword = (value) => {
    setPassword(value);

    if (!value.trim()) setPassError("Password is required");
    else if (value.length < 6)
      setPassError("Password must be at least 6 characters");
    else setPassError("");

    // Confirm Password Match Check
    if (confirmPassword && value !== confirmPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  };

  // Confirm Password Validation
  const validateConfirmPassword = (value) => {
    setConfirmPassword(value);

    if (value !== password) setConfirmError("Passwords do not match");
    else setConfirmError("");
  };

  // Terms & Conditions validation
  const validateTerms = (checked) => {
    setAgreeToTerms(checked);
    if (!checked) {
      setTermsError("You must agree to the Terms & Conditions");
    } else {
      setTermsError("");
    }
  };

  // Form Submit Validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;

    if (!email) {
      setEmailError("Email is required");
      valid = false;
    }

    if (!password) {
      setPassError("Password is required");
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      valid = false;
    }

    if (!agreeToTerms) {
      setTermsError("You must agree to the Terms & Conditions");
      valid = false;
    }

    if (!valid) return;

    try {
      const res = await axios.post(`${apiUrl}/api/user/signup`, {
        name,
        email,
        password,
        agreeToTerms,
      });

      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.message || "Sign Up failed. Please try again."
      );
    }
  };

  // Simplified Google Signup
  const handleGoogleSignup = async () => {
    if (!agreeToTerms) {
      setTermsError("You must agree to the Terms & Conditions");
      return;
    }

    setTermsError("");
    setGoogleLoading(true);

    try {
      // 1. Sign in with Firebase
      const result = await signInWithPopup(auth, provide);
      const user = result.user;

      console.log("Firebase user:", user);

      // 2. Prepare simple data for backend
      const userData = {
        uid: user.uid, // This is Firebase UID (use as googleId)
        email: user.email,
        name: user.displayName || name || user.email.split("@")[0],
        agreeToTerms: true,
      };

      console.log("Sending to backend:", userData);

      // 3. Send to your Google auth endpoint
      const res = await axios.post(`${apiUrl}/api/user/google`, userData);

      console.log("Backend response:", res.data);

      // 4. Handle success
      if (res.data.status === "success") {
        // Store token in localStorage
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.data));
        }

        // Show success message
        alert(res.data.message || "🎉 Successfully signed up with Google!");

        // Redirect to home
        navigate("/login");
      } else {
        throw new Error(res.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Google signup error:", error);

      let errorMessage = "Google Sign Up failed. Please try again.";

      // Handle specific Firebase errors
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Signup cancelled. Please try again.";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Signup cancelled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-container max-w-md mx-2 xs:mx-3 md:mx-auto mt-10 p-6 rounded-2xl shadow-lg font-urbanist mb-8">
      <h1 className="text-center text-2xl font-inter">Sign Up</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 mt-6">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-lg mx-1">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter Your Name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border px-3 py-1.5 rounded-3xl outline-none transition border-secondary"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="Email" className="text-lg mx-1">
              Email address
            </label>

            <input
              type="email"
              placeholder="Enter Your Email"
              id="Email"
              value={email}
              onChange={(e) => validateEmail(e.target.value)}
              className={`border px-3 py-1.5 rounded-3xl outline-none transition 
                ${
                  emailError
                    ? "border-warning/60 bg-warning/20"
                    : "border-secondary"
                }
              `}
            />

            {emailError && (
              <p className="text-warning text-sm mx-1">{emailError}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-lg mx-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                id="password"
                value={password}
                onChange={(e) => validatePassword(e.target.value)}
                className={`border px-3 py-1.5 rounded-3xl outline-none w-full pr-10 transition
                  ${
                    passError
                      ? "border-warning/60 bg-warning/20"
                      : "border-secondary"
                  }
                `}
              />

              <i
                className={`fa-solid text-primary ${
                  showPassword ? "fa-eye" : "fa-eye-slash"
                } absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            {passError && (
              <p className="text-warning text-sm mx-1">{passError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-lg mx-1">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm Your Password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => validateConfirmPassword(e.target.value)}
              className={`border px-3 py-1.5 rounded-3xl outline-none transition w-full
                ${
                  confirmError
                    ? "border-warning/60 bg-warning/20"
                    : "border-secondary"
                }
              `}
            />

            {confirmError && (
              <p className="text-warning text-sm mx-1">{confirmError}</p>
            )}
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => validateTerms(e.target.checked)}
                className="mt-1 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-secondary">
                I agree to the{" "}
                <Link
                  to="/terms-and-conditions"
                  className="text-blue-500 hover:underline font-medium"
                  target="_blank"
                >
                  Terms & Conditions
                </Link>
              </label>
            </div>
            {termsError && (
              <p className="text-warning text-sm mx-1 mt-1">{termsError}</p>
            )}
          </div>

          <Btn
            variant="primary"
            type="submit"
            className="w-full mt-4"
            disabled={!agreeToTerms}
          >
            Sign Up
          </Btn>
        </div>

        <div className="text-center mt-4">
          Already have an account?{" "}
          <Link to={"/login"} className="text-blue-500 hover:underline">
            Login
          </Link>
        </div>

        <h1 className="text-center font-semibold font-inter mt-4">OR</h1>

        {/* Google Signup Button */}
        <div className="mt-4">
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading || !agreeToTerms}
            className="w-full border px-3 py-3 rounded-3xl outline-none transition border-secondary flex items-center justify-center gap-3 hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Signing up...</span>
              </>
            ) : (
              <>
                <img
                  src="/googleLogo.png"
                  alt="Google Logo"
                  className="w-5 h-5"
                />
                <span className="font-medium">Sign Up with Google</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
