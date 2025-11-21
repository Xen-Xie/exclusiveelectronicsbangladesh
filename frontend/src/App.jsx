import "./App.css";
import { Route, Routes } from "react-router";
import Layout from "./utils/layout";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import GoogleCallback from "./pages/GoogleCallback";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
