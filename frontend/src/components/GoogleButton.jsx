import { useEffect, useContext, useState, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router";

function GoogleButton() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiUrl = import.meta.env.VITE_API_URL;

  const [message, setMessage] = useState("");

  const handleGoogleResponse = useCallback(
    async (response) => {
      try {
        const idToken = response?.credential || null;

        if (!idToken) {
          setMessage("No Google credential received");
          return;
        }

        const res = await axios.post(
          `${apiUrl}/api/user/google`,
          { idToken },
          { withCredentials: true }
        );

        login(res.data.token, () => {
          navigate("/"); // redirect after login
        });
      } catch (err) {
        console.error("Google login failed:", err);
        setMessage("Google login failed");
      }
    },
    [apiUrl, login, navigate]
  );

  useEffect(() => {
    if (!window.google || !clientId) return;

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
      ux_mode: isMobile ? "redirect" : "popup",
      redirect_uri: isMobile
        ? "https://exclusiveelectronicbangladesh.netlify.app/google-callback"
        : undefined,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "outline", size: "large", shape: "pill" }
    );

    if (!isMobile) window.google.accounts.id.prompt();
  }, [clientId, handleGoogleResponse]);

  return (
    <div className="mt-4 flex flex-col items-center">
      <div id="googleBtn" className="w-full max-w-[320px]"></div>
      {message && (
        <p className="mt-2 text-success font-medium text-center">{message}</p>
      )}
    </div>
  );
}

export default GoogleButton;
