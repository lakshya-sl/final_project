const form = document.getElementById("authForm");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const toggleMode = document.getElementById("toggleMode");
const toggleText = document.getElementById("toggleText");
const message = document.getElementById("message");
const nameInput = document.getElementById("name");

let isLogin = true;

// Toggle between Login and Sign Up
toggleMode.addEventListener("click", () => {
  isLogin = !isLogin;
  if (isLogin) {
    formTitle.textContent = "Welcome Back";
    submitButton.textContent = "Sign In";
    toggleText.textContent = "Don’t have an account?";
    toggleMode.textContent = "Sign up";
    nameInput.style.display = "none";
  } else {
    formTitle.textContent = "Create Account";
    submitButton.textContent = "Sign Up";
    toggleText.textContent = "Already have an account?";
    toggleMode.textContent = "Sign in";
    nameInput.style.display = "block";
  }
  message.textContent = "";
});

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const name = document.getElementById("name").value.trim();

  if (!email || !password || (!isLogin && !name)) {
    message.style.color = "red";
    message.textContent = "Please fill all fields.";
    return;
  }

  if (isLogin) {
    // ✅ Login logic
    fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          message.style.color = "green";
          message.textContent = "Login successful! Redirecting...";
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        } else {
          message.style.color = "red";
          message.textContent = "Invalid credentials.";
        }
      })
      .catch(err => {
        console.error("Login error:", err);
        message.style.color = "red";
        message.textContent = "Login failed.";
      });
  } else {
    // ✅ Signup logic
    fetch("http://127.0.0.1:8000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          message.style.color = "green";
          message.textContent = `Welcome, ${name}! Account created.`;
          toggleMode.click(); // Switch back to login mode
        } else {
          message.style.color = "red";
          message.textContent = data.message || "Signup failed.";
        }
      })
      .catch(err => {
        console.error("Signup error:", err);
        message.style.color = "red";
        message.textContent = "Signup failed.";
      });
  }
});

// Optional Google Sign-In handler
// function handleGoogleLogin(response) {
//   const userObject = parseJwt(response.credential);
//   message.style.color = "green";
//   message.textContent = `Welcome, ${userObject.name}! Logged in with Google.`;
//   setTimeout(() => {
//     window.location.href = "/dashboard";
//   }, 1000);
// }

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
}
