import { useContext } from "react";
import { useNavigate } from "react-router";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";

function GoogleButton({ showLogout = false, onBeforeSignup }) {
  const navigate = useNavigate();
  const { login, logout } = useContext(AuthContext);
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleGoogleLogout = () => {
    googleLogout(); // clear Google session
    logout(); // clear app auth state
    navigate("/login"); // redirect to login
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Check terms agreement for signup flow
      if (onBeforeSignup && !onBeforeSignup()) {
        return;
      }

      const idToken = credentialResponse.credential;
      if (!idToken) return;

      const res = await axios.post(
        `${apiUrl}/api/user/google`,
        {
          idToken,
          // Include terms agreement for new signups
          ...(onBeforeSignup && { agreedToTerms: true }),
        },
        { withCredentials: true }
      );

      login(res.data.token, () => navigate("/"));
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4 gap-2">
      {!showLogout ? (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.error("Google Login Failed")}
          shape="pill"
        />
      ) : (
        <button
          onClick={handleGoogleLogout}
          className="px-4 py-2 rounded-full bg-danger text-white hover:bg-danger/50 transition"
        >
          Logout from Google
        </button>
      )}
    </div>
  );
}

export default GoogleButton;
