import axios from "axios";

// ✅ Détection automatique rigoureuse et sécurisée de l'URL de production pour Render et le local
const getBaseUrl = () => {
  if (window.location.hostname.includes('onrender.com')) {
    // Harmonisation parfaite avec l'URL de votre instance de production Render
    return "https://musafa-project.onrender.com/api";
  }
  return "http://localhost:8080/api";
};

const API_BASE = getBaseUrl();

const login = async (username, password) => {
  localStorage.removeItem("user");
  const response = await axios.post(`${API_BASE}/auth/signin`, {
    username,
    password,
  });

  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const register = (username, email, password, role = "ELEVE") => {
  return axios.post(`${API_BASE}/auth/signup`, {
    username,
    email,
    password,
    role,
  });
};

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

// ✅ Méthode d'activation de la licence d'un établissement pour l'administrateur système
const activateSchool = async (schoolId, activationCode) => {
  const user = getCurrentUser();
  const token = user?.token;

  // ✅ Adaptation dynamique propre et robuste sans altération de chaînes de caractères
  const response = await axios.post(
    `${API_BASE}/school/activate`,
    { schoolId, activationCode },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
  return response.data;
};

const AuthService = {
  login,
  register,
  logout,
  getCurrentUser,
  activateSchool,
};

export default AuthService;