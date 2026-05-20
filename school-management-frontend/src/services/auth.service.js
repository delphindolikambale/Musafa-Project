import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

const login = async (username, password) => {
  localStorage.removeItem("user");
  const response = await axios.post(API_URL + "signin", {
    username,
    password,
  });

  if (response.data.token) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const register = (username, email, password, role = "ELEVE") => {
  return axios.post(API_URL + "signup", {
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

const AuthService = {
  login,
  register,
  logout,
  getCurrentUser,
};

export default AuthService;