import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { setUnauthorizedHandler } from "../api/client";

export function SessionWatcher() {
  const { logout } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    setUnauthorizedHandler(() => { logout(); navigate("/login"); });
  }, [logout, navigate]);
  return null;
}

export default function RequireAuth({ children, role }) {
  const { user } = useUser();
  if (!user?.institutionId) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/mural" replace />;
  return children;
}
