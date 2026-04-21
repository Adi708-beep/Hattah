const adminLoginForm = document.getElementById("adminLoginForm");
const loginAlert = document.getElementById("loginAlert");
const loginButton = document.getElementById("loginButton");

const showLoginAlert = (message, isError = false) => {
  loginAlert.className = `alert ${isError ? "error" : "success"}`;
  loginAlert.textContent = message;
};

const validateExistingSession = async () => {
  const token = window.HATTAH_API.getAdminToken();

  if (!token) {
    return;
  }

  try {
    await window.HATTAH_API.apiRequest("/admin/overview", { auth: true });
    window.location.href = "/admin-dashboard.html";
  } catch (error) {
    window.HATTAH_API.clearAdminSession();
  }
};

adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(adminLoginForm);
  const payload = {
    email: String(formData.get("email") || "").trim().toLowerCase(),
    password: String(formData.get("password") || ""),
  };

  loginButton.disabled = true;

  try {
    const response = await window.HATTAH_API.apiRequest("/admin/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    window.HATTAH_API.setAdminSession(response.data);
    showLoginAlert("Login successful. Redirecting to dashboard...");
    setTimeout(() => {
      window.location.href = "/admin-dashboard.html";
    }, 700);
  } catch (error) {
    showLoginAlert(error.message, true);
  } finally {
    loginButton.disabled = false;
  }
});

validateExistingSession();
