import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Configure default base URL for Axios
// In development: relative paths go through Vite proxy
// In production:  set VITE_API_URL to your deployed backend (e.g. https://api.example.com)
axios.defaults.baseURL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null;
    try { return localStorage.getItem('token') || null; } catch (e) { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Apply Authorization Token to all Axios requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load current user profile from token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          
          // Verify backend connectivity with lightweight health check
          await axios.get('/api/health');
        } catch (e) {
          console.warn('Backend connectivity check failed.', e);
          try {
            setUser(JSON.parse(storedUser));
          } catch (parseErr) {
            console.warn('Corrupted cached user data. Clearing localStorage.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Axios Response Interceptor for Token Refreshing
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const res = await axios.post('/api/auth/refresh-token', { refreshToken });
            const { accessToken, newRefreshToken } = res.data;
            
            setToken(accessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
            
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            console.error('Refresh token failed. Logging out...');
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async ({ email, password, rememberMe } = {}) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { accessToken, refreshToken, user: loggedUser } = response.data;
      setToken(accessToken);
      setUser(loggedUser);
      if (rememberMe) {
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
      } else {
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('user', JSON.stringify(loggedUser));
      }
      return loggedUser;
    } catch (err) {
      console.error('API login failed:', err);
      const msg = err.response?.data?.message || 'Server connection failed.';
      throw new Error(msg);
    }
  };

  const register = async (formData) => {
    try {
      const response = await axios.post('/api/auth/register', formData);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await axios.post('/api/auth/logout', { refreshToken });
    } catch (err) {
      console.warn('Backend logout failed or offline.');
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const verifyEmail = async (verificationCode) => {
    try {
      const response = await axios.post('/api/auth/verify-email', { token: verificationCode });
      if (user) {
        const updated = { ...user, isVerified: true };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Verification failed.');
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Reset request failed.');
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post('/api/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Password reset failed.');
    }
  };

  const updateProfile = async (profileData) => {
    const response = await axios.put('/api/auth/profile', profileData);
    const updatedUser = response.data.user;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, verifyEmail, forgotPassword, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
