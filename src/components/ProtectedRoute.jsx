import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, requiredRole }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && usuario.rol !== requiredRole) {
    // Si intenta entrar a una ruta que no es de su rol
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
