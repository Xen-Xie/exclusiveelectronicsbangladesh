import { useState, useContext } from "react";
import Btn from "../components/Common/Btn";
import { Link } from "react-router";
import GoogleButton from "../components/GoogleButton";
import axios from "axios";
import { useNavigate } from "react-router";
import { AuthContext } from "../auth/AuthContext";

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

    // Validation before sending request
    if (!email) {
      setEmailError("Email is required");
      return;
    }
    if (!password) {
      setPassError("Password is required");
      return;
    }

    try {
      const res = await axios.post(`${apiUrl}/api/user/login`, {
        email,
        password,
      });

      login(res.data.token, () => {
        navigate("/");
      });
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        setFormError("Incorrect email or password");
      } else {
        setFormError(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Login failed. Please try again."
        );
      }
    }
  };

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

          {/* Form error */}
          {formError && (
            <p className="text-red-600 text-sm text-center mt-2">{formError}</p>
          )}

          <Btn variant="primary" type="submit" className="w-full mt-4">
            Login
          </Btn>
        </div>

        <div className="text-center mt-4">
          Don't have an account?{" "}
          <Link to={"/sign-up"} className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </div>

        <h1 className="text-center font-semibold font-inter mt-4">OR</h1>
        <div>
          <GoogleButton /> {/* Continue with Google */}
        </div>
      </form>
    </div>
  );
}

export default Login;
