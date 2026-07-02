import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import SaaSBarrier from "../views/errors/SaaSBarrier";

const SaaSGuard = () => {
  const userString = localStorage.getItem("user");
  const theme = localStorage.getItem("app-theme") || "light";
  const lang = localStorage.getItem("app-lang") || "FR";
  
  if (!userString) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userString);
  const userRoles = user.roles || [];

  // Vérification des privilèges
  const isSuperAdmin = userRoles.includes("ROLE_SUPER_ADMIN_SYSTEM") || userRoles.includes("SUPER_ADMIN_SYSTEM");
  const isLocalAdmin = userRoles.includes("ROLE_ADMIN_SYSTEM") || userRoles.includes("ADMIN") || userRoles.includes("ROLE_ADMIN");

  // Règle d'or : Le Super Admin du système global n'est jamais bloqué
  if (isSuperAdmin) {
    return <Outlet />;
  }

  // Si l'utilisateur appartient à une école, on extrait de manière tolérante les booléens du backend
  if (user.schoolId) {
    const isSubActive = user.isSubscriptionActive ?? user.subscriptionActive;
    const isSchoolConfig = user.isSchoolConfigured ?? user.schoolConfigured;

    // Blocage strict si la licence (abonnement) n'est pas active
    if (isSubActive === false) {
      return <SaaSBarrier type="EXPIRED" theme={theme} lang={lang} />;
    }

    // ✅ ADAPTATION : Ne bloquer pour non-configuration QUE les utilisateurs normaux.
    // L'administrateur de l'école (Local Admin) DOIT pouvoir entrer pour configurer l'école.
    if (isSchoolConfig === false && !isLocalAdmin) {
      return <SaaSBarrier type="UNCONFIGURED" theme={theme} lang={lang} />;
    }
  }

  // Tout est valide (ou c'est l'admin qui entre pour configurer) -> Accès autorisé aux routes enfants
  return <Outlet />;
};

export default SaaSGuard;