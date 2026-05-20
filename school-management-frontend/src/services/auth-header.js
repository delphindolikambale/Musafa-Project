export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    // Adapter selon ce que retourne ton Spring Boot (Bearer token)
    return { Authorization: 'Bearer ' + user.token }; 
  } else {
    return {};
  }
}