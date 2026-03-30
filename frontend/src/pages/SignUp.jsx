import { useState, useContext } from "react";
import Btn from "../components/Common/Btn";
import { Link } from "react-router";
import axios from "axios";
import { useNavigate } from "react-router";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, provide } from "../firebase/firebase";
import { AuthContext } from "../auth/AuthContext";
import toast from "react-hot-toast";

function SignUp() {
  const { login } = useContext(AuthContext);
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
  const [formLoading, setFormLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  // Email Validation
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

  // Password Validation
  const validatePassword = (value) => {
    setPassword(value);

    if (!value.trim()) {
      setPassError("Password is required");
    } else if (value.length < 6) {
      setPassError("Password must be at least 6 characters");
    } else {
      setPassError("");
    }

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

    if (value !== password) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
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

  // Form Submit Validation with Firebase Email Verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    // Clear previous errors
    setEmailError("");
    setPassError("");
    setConfirmError("");
    setTermsError("");

    let valid = true;

    if (!name.trim()) {
      toast.error("Name is required");
      valid = false;
    }

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

    if (!valid) {
      setFormLoading(false);
      return;
    }

    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // 2. Send email verification
      await sendEmailVerification(firebaseUser);

      // 3. Store verification info
      setVerificationEmail(email);
      setVerificationSent(true);

      // 4. Create user in your backend
      const res = await axios.post(`${apiUrl}/api/user/signup`, {
        name,
        email,
        password,
        agreeToTerms: agreeToTerms || true,
        phoneNumber: "",
        address: "",
        firebaseUid: firebaseUser.uid,
        emailVerified: false,
      });

      console.log("Signup successful:", res.data);

      toast.success(
        "Verification email sent! Please check your inbox and verify your email address.",
        {
          duration: 5000,
          icon: "📧",
        },
      );

      // Don't navigate immediately - wait for verification
      // Show verification screen instead
    } catch (error) {
      console.error("Signup error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code,
      });

      // Handle Firebase errors
      let errorMessage = "Sign Up failed. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use. Please try logging in instead.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);

      // Highlight the specific field
      const errorLower = errorMessage.toLowerCase();
      if (errorLower.includes("email")) {
        setEmailError(errorMessage);
      } else if (errorLower.includes("password")) {
        setPassError(errorMessage);
      } else if (errorLower.includes("terms")) {
        setTermsError(errorMessage);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        toast.success("Verification email resent! Please check your inbox.", {
          icon: "📧",
        });
      } else {
        toast.error(
          "Unable to resend verification. Please try signing up again.",
        );
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Failed to resend verification email. Please try again.");
    }
  };

  // Check verification status
  const checkVerificationStatus = async () => {
    try {
      // Show loading state
      toast.loading("Checking verification status...");

      // Reload Firebase user to get latest verification status
      await auth.currentUser?.reload();

      if (auth.currentUser?.emailVerified) {
        // Call your backend to update emailVerified status
        const response = await axios.post(`${apiUrl}/api/user/verify-email`, {
          email: verificationEmail,
          firebaseUid: auth.currentUser?.uid,
        });

        if (response.data.status === "success") {
          toast.dismiss();
          toast.success("Email verified! Redirecting to login...");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          toast.dismiss();
          toast.error(
            response.data.message || "Verification failed. Please try again.",
          );
        }
      } else {
        toast.dismiss();
        toast.error(
          "Email not verified yet. Please check your inbox and click the verification link.",
        );
      }
    } catch (error) {
      console.error("Verification check error:", error);
      toast.dismiss();
      toast.error(
        error.response?.data?.message ||
          "Failed to verify email. Please try again.",
      );
    }
  };

  // Simplified Google Signup
  const handleGoogleSignup = async () => {
    if (!agreeToTerms) {
      setTermsError("You must agree to the Terms & Conditions");
      toast.error("Please agree to the Terms & Conditions");
      return;
    }

    setTermsError("");
    setGoogleLoading(true);

    try {
      // 1. Sign in with Firebase
      const result = await signInWithPopup(auth, provide);
      const user = result.user;

      // Show loading toast
      const loadingToast = toast.loading("Creating your account...");

      // 2. Prepare data for backend
      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || name || user.email.split("@")[0],
        agreeToTerms: true,
        profilePicture: user.photoURL,
        emailVerified: user.emailVerified,
      };

      const res = await axios.post(`${apiUrl}/api/user/google`, userData);

      if (res.data.status === "success") {
        const token = res.data.token;
        const userDataRes = res.data.data || res.data.user;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userDataRes));

        toast.success(
          res.data.message || "🎉 Successfully signed up with Google!",
          { id: loadingToast },
        );

        if (login) {
          login(token, () => {
            navigate("/");
          });
        } else {
          navigate("/");
          window.dispatchEvent(new CustomEvent("authStateChanged"));
        }
      } else {
        throw new Error(res.data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Google signup error:", error);

      let errorMessage = "Google Sign Up failed. Please try again.";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Signup cancelled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Show verification screen if verification email was sent
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fa-regular fa-envelope text-4xl text-green-600"></i>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </h2>

          <p className="text-gray-600">
            We've sent a verification email to:
            <br />
            <span className="font-semibold text-primary">
              {verificationEmail}
            </span>
          </p>

          <p className="text-sm text-gray-500">
            Please check your inbox and click the verification link to activate
            your account. If you don't see the email, check your spam folder.
          </p>

          <div className="space-y-3">
            <Btn
              variant="primary"
              onClick={checkVerificationStatus}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
            >
              I've Verified My Email
            </Btn>

            <Btn
              variant="secondary"
              onClick={resendVerificationEmail}
              className="w-full text-secondary py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Resend Verification Email
            </Btn>

            <Link
              to="/login"
              className="block text-sm text-primary hover:underline mt-2"
            >
              Back to Login
            </Link>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">
              <i className="fa-regular fa-lightbulb mr-1"></i>
              Tip: After verifying your email, click the "I've Verified My
              Email" button to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
              className="border px-3 py-1.5 rounded-3xl outline-none transition border-secondary focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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
              placeholder="Confirm Your Password"
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

          {/* Terms & Conditions Checkbox */}
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => validateTerms(e.target.checked)}
                className="mt-1 text-primary focus:ring-primary rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <Link
                  to="/terms-and-conditions"
                  className="text-blue-600 hover:underline font-medium"
                  target="_blank"
                >
                  Terms & Conditions
                </Link>
              </label>
            </div>
            {termsError && (
              <p className="text-red-600 text-sm mx-1 mt-1">{termsError}</p>
            )}
          </div>

          <Btn
            variant="primary"
            type="submit"
            className="w-full mt-4"
            disabled={!agreeToTerms || formLoading}
          >
            {formLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </Btn>
        </div>

        <div className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link
            to={"/login"}
            className="text-blue-600 hover:underline font-medium"
          >
            Login
          </Link>
        </div>

        <h1 className="text-center font-semibold font-inter mt-4">OR</h1>

        {/* Google Signup Button */}
        <div className="mt-2">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || !agreeToTerms}
            className="w-full border border-gray-300 px-3 py-3 rounded-3xl outline-none transition flex items-center justify-center gap-3 hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {googleLoading ? (
              <>
                <i className="fas fa-spinner fa-spin text-gray-600"></i>
                <span className="font-medium text-gray-700">Signing up...</span>
              </>
            ) : (
              <>
                <img
                  src="/googleLogo.png"
                  alt="Google Logo"
                  className="w-5 h-5"
                />
                <span className="font-medium text-gray-700">
                  Sign Up with Google
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
