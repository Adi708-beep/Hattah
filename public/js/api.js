const API_BASE_URL = "http://localhost:5000/api";
const ADMIN_TOKEN_KEY = "hattahAdminToken";
const ADMIN_PROFILE_KEY = "hattahAdminProfile";

const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY) || "";

const setAdminSession = ({ token, admin }) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin));
};

const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
};

const getAdminProfile = () => {
  const profile = localStorage.getItem(ADMIN_PROFILE_KEY);

  if (!profile) {
    return null;
  }

  try {
    return JSON.parse(profile);
  } catch (error) {
    return null;
  }
};

const apiRequest = async (endpoint, options = {}) => {
  const { auth = false, headers = {}, ...restOptions } = options;
  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = getAdminToken();

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: requestHeaders,
    ...restOptions,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

window.HATTAH_API = {
  API_BASE_URL,
  apiRequest,
  formatCurrency,
  getAdminToken,
  setAdminSession,
  clearAdminSession,
  getAdminProfile,
};
