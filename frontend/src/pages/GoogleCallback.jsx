// src/pages/GoogleCallback.jsx
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";

function GoogleCallback() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idToken = urlParams.get("credential") || urlParams.get("id_token");

    if (!idToken) {
      console.error("No Google credential found in callback");
      return;
    }

    (async () => {
      try {
        const res = await axios.post(`${apiUrl}/api/user/google`, {
          idToken,
        });

        login(res.data.token, () => {
          navigate("/"); // redirect to home after login
        });
      } catch (err) {
        console.error("Google login failed:", err);
      }
    })();
  }, [apiUrl, login, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">Logging you in with Google...</p>
    </div>
  );
}

export default GoogleCallback;
