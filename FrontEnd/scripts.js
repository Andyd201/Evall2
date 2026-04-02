const API_URL = "http://localhost:3000/api";

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return res.json();
}



document.getElementById("loginBtn").addEventListener("click", login);

async function login() {
  const email = document.getElementById("email").value;
  const motdepasse = document.getElementById("password").value;

  const data = await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      motdepasse,
    }),
  });

  console.log(data);

  if (data.token) {
    localStorage.setItem("token", data.token);
    alert("Login réussi !");
    window.location.href = "catalogue.html";
  } else {
    alert("Erreur login");
  }
}

