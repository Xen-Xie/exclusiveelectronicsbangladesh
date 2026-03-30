import { useState, useContext } from "react";
import Btn from "../components/Common/Btn";
import { Link } from "react-router";
import axios from "axios";
import { useNavigate } from "react-router";
import { AuthContext } from "../auth/AuthContext";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provide } from "../firebase/firebase";
import toast from "react-hot-toast";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passError, setPassError] = useState("");
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationPassword, setVerificationPassword] = useState("");

  // Email validation
  const validateEmail = (value) => {
    setEmail(value);
    setFormError("");
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) setEmailError("Email is required");
    else if (!regex.test(value)) setEmailError("Invalid email format");
    else setEmailError("");
  };

  // Password validation
  const validatePassword = (value) => {
    setPassword(value);
    setFormError("");
    if (!value.trim()) setPassError("Password is required");
    else if (value.length < 6)
      setPassError("Password must be at least 6 characters");
    else setPassError("");
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    if (!email) {
      setEmailError("Email is required");
      setFormLoading(false);
      return;
    }
    if (!password) {
      setPassError("Password is required");
      setFormLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${apiUrl}/api/user/login`, {
        email,
        password,
      });

      toast.success("🎉 Successfully logged in!");

      if (login) {
        login(res.data.token, () => {
          navigate("/");
        });
      } else {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem(
          "user",
          JSON.stringify(res.data.user || res.data.data),
        );
        navigate("/");
        window.dispatchEvent(new CustomEvent("authStateChanged"));
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please try again.";

      if (
        error.response?.status === 403 &&
        error.response?.data?.message?.includes("verify your email")
      ) {
        setNeedsVerification(true);
        setVerificationEmail(email);
        setVerificationPassword(password);
        errorMessage = "Please verify your email address before logging in.";
      } else if (error.response?.status === 401) {
        errorMessage = "Incorrect email or password";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  // Verify email and update backend
  const verifyEmailAndLogin = async () => {
    try {
      setFormLoading(true);
      // Sign in with Firebase to check verification status
      const userCredential = await signInWithEmailAndPassword(
        auth,
        verificationEmail,
        verificationPassword,
      );
      await userCredential.user.reload();

      if (userCredential.user.emailVerified) {
        // Update backend
        await axios.post(`${apiUrl}/api/user/verify-email`, {
          email: verificationEmail,
          firebaseUid: userCredential.user.uid,
        });

        toast.success("Email verified! Logging you in...");
        setNeedsVerification(false);

        // Now try to login again
        const res = await axios.post(`${apiUrl}/api/user/login`, {
          email: verificationEmail,
          password: verificationPassword,
        });

        if (login) {
          login(res.data.token, () => {
            navigate("/");
          });
        }
      } else {
        toast.error(
          "Email not verified yet. Please check your inbox and click the verification link.",
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to verify email. Please try again.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setFormError("");

    try {
      const result = await signInWithPopup(auth, provide);
      const user = result.user;

      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split("@")[0],
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
          res.data.message || "🎉 Successfully logged in with Google!",
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
        throw new Error(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      let errorMessage = "Google Login failed. Please try again.";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Login cancelled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Show verification screen if needed
  if (needsVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fa-regular fa-envelope text-4xl text-yellow-600"></i>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </h2>

          <p className="text-gray-600">
            Please verify your email address before logging in.
            <br />
            <span className="font-semibold text-primary">
              {verificationEmail}
            </span>
          </p>

          <p className="text-sm text-gray-500">
            Check your inbox and click the verification link. If you didn't
            receive the email, check your spam folder.
          </p>

          <div className="space-y-3">
            <Btn
              variant="primary"
              onClick={verifyEmailAndLogin}
              disabled={formLoading}
              className="w-full text-primarybg py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {formLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Verifying...
                </>
              ) : (
                "I've Verified My Email"
              )}
            </Btn>

            <Link
              to="/sign-up"
              className="block text-sm text-primary hover:underline mt-2"
            >
              Back to Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-container max-w-md mx-2 xs:mx-3 md:mx-auto mt-10 p-6 rounded-2xl shadow-lg font-urbanist mb-8">
      <h1 className="text-center text-2xl font-inter">Login</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 mt-6">
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

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center flex items-center justify-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                {formError}
              </p>
            </div>
          )}

          <Btn
            variant="primary"
            type="submit"
            className="w-full mt-2"
            disabled={formLoading}
          >
            {formLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Btn>
        </div>

        <div className="text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign Up
          </Link>
        </div>

        <h1 className="text-center font-semibold font-inter mt-4">OR</h1>

        <div className="mt-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full border border-gray-300 px-3 py-3 rounded-3xl outline-none transition flex items-center justify-center gap-3 hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            {googleLoading ? (
              <>
                <i className="fas fa-spinner fa-spin text-gray-600"></i>
                <span className="font-medium text-gray-700">Logging in...</span>
              </>
            ) : (
              <>
                <img
                  src="/googleLogo.png"
                  alt="Google Logo"
                  className="w-5 h-5"
                />
                <span className="font-medium text-gray-700">
                  Continue with Google
                </span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            By continuing with Google, you agree to our Terms & Conditions
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
