import { useEffect, useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import { useNavigate } from "react-router";

function GoogleButton() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiUrl = import.meta.env.VITE_API_URL;

  const [message, setMessage] = useState("");

  const handleGoogleResponse = async (response) => {
    try {
      const res = await axios.post(`${apiUrl}/api/user/google`, {
        idToken: response.credential,
      });

      login(res.data.token, () => {
        setMessage(`Login success! Welcome ${res.data.data.name}`);
        setTimeout(() => navigate("/"), 1500);
      });
    } catch (err) {
      console.error(err);
      setMessage("Google login failed");
    }
  };

  useEffect(() => {
    if (!window.google || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
      ux_mode: "popup",
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      {
        theme: "outline",
        size: "large",
        shape: "pill",
      }
    );
  }, [clientId]);

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
