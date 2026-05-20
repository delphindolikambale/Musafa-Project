import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthService from "../services/auth.service";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = AuthService.getCurrentUser();
  const location = useLocation();

  // Si l'utilisateur n'est pas connecté, retour au login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Spring Boot renvoie souvent un tableau de rôles (ex: ["ROLE_ELEVE"]) ou une chaîne
  // On s'assure d'avoir un tableau pour la vérification
  const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
  
  const hasAccess = allowedRoles.some(role => userRoles.includes(role));

  if (!hasAccess) {
    // S'il n'a pas accès, on le renvoie vers la page appropriée
    if (userRoles.includes("ROLE_ELEVE") || userRoles.includes("ELEVE")) {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;