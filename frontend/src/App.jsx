import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import OAuthCallback from "./pages/OAuthCallback.jsx";
import NotFound from "./pages/NotFound.jsx";
import CotTruyen from "./pages/sections/CotTruyen.jsx";
import NhanVat from "./pages/sections/NhanVat.jsx";
import BXH from "./pages/sections/BXH.jsx";
import DienDan from "./pages/sections/DienDan.jsx";
import TaiGame from "./pages/sections/TaiGame.jsx";
import NapThe from "./pages/sections/NapThe.jsx";

import SuccessPage from "./pages/SuccessPage.jsx";
import CancelPage from "./pages/CancelPage.jsx";

import { Auth } from "./lib/api.js";

function RequireAuth({ children }) {
  return Auth.isLoggedIn() ? children : <Navigate to="/login" replace />;
}
function GuestOnly({ children }) {
  return Auth.isLoggedIn() ? <Navigate to="/dashboard" replace /> : children;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace("#", ""));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cot-truyen" element={<CotTruyen />} />
        <Route path="/nhan-vat" element={<NhanVat />} />
        <Route path="/bxh" element={<BXH />} />
        <Route path="/dien-dan" element={<DienDan />} />
        <Route path="/tai-game" element={<TaiGame />} />
        <Route path="/nap-the" element={<NapThe />} />

        {/* Route cho PayOS */}
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />

        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
