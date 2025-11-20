/* eslint-disable no-unused-vars */
import { useState } from "react";
import Btn from "../components/Common/Btn";
import { Link } from "react-router";
import GoogleButton from "../components/GoogleButton";
import axios from "axios";
import { useNavigate } from "react-router";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const [password, setPassword] = useState("");
  const [passError, setPassError] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

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

    if (!valid) return;

    try {
      const res = await axios.post(`${apiUrl}/api/user/signup`, {
        name,
        email,
        password,
      });

      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.message || "Sign Up failed. Please try again."
      );
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

          <Btn variant="primary" type="submit" className="w-full mt-4">
            Sign Up
          </Btn>
        </div>

        <div className="text-center mt-4">
          Already have an account?{" "}
          <Link to={"/login"} className="text-blue-500 hover:underline">
            Login
          </Link>
        </div>
        <h1 className="text-center font-semibold font-inter">OR</h1>
        <div>
          <GoogleButton />
        </div>
      </form>
    </div>
  );
}

export default SignUp;
