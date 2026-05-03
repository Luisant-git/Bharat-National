const VITE_API_URL = import.meta.env.VITE_API_URL;

// helper
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const auth = {

  // ✅ SIGNUP
  async signup(userData) {
    const response = await fetch(`${VITE_API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    return handleResponse(response);
  },

  // ✅ SEND OTP (CALL BACKEND)
  async sendOTP(mobilenumber) {
    const response = await fetch(`${VITE_API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobilenumber }),
    });

    return handleResponse(response);
  },

  // ✅ VERIFY OTP (CALL BACKEND)
  async verifyOTP(mobilenumber, otp) {
    const response = await fetch(`${VITE_API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobilenumber, otp }),
    });

    return handleResponse(response);
  },

  // ✅ LOGOUT
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingCartItem');
    window.dispatchEvent(new Event('auth:logout'));
  },

  // ✅ CHECK AUTH
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  // ✅ GET USER
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};