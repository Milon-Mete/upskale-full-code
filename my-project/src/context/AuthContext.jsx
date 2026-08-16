import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to parse stored user:", e);
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // Pending action callback to execute seamlessly after login
  const pendingActionRef = useRef(null);

  // Synchronize state across tabs / storage changes
  const syncAuthState = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setToken(storedToken || null);
    } catch (e) {
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('storage', syncAuthState);
    
    // Custom event listener for axios interceptors or non-React modules
    const handleTriggerLoginModal = (event) => {
      const options = event?.detail || {};
      openLoginModal(options);
    };
    window.addEventListener('trigger-login-modal', handleTriggerLoginModal);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('trigger-login-modal', handleTriggerLoginModal);
    };
  }, [syncAuthState]);

  // Handle Google OAuth query parameters seamlessly on any page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isGoogleLogin = params.get('googleLogin');
    const googleToken = params.get('token');

    if (isGoogleLogin === 'success') {
      if (googleToken) {
        localStorage.setItem('token', googleToken);
        setToken(googleToken);
      }

      // Fetch fresh profile from /user/me
      const fetchGoogleProfile = async () => {
        try {
          const headers = { 'Content-Type': 'application/json' };
          if (googleToken) headers['Authorization'] = `Bearer ${googleToken}`;

          const res = await fetch(`${BASE_URL}/user/me`, {
            headers,
            credentials: 'include'
          });

          if (res.ok) {
            const data = await res.json();
            const userData = data.user || data;
            if (userData && userData._id) {
              login(userData, googleToken);
            }
          }
        } catch (err) {
          console.error("Error retrieving Google OAuth user profile:", err);
        } finally {
          // Clean URL params without page reload or route jump
          const cleanUrl = window.location.pathname + (window.location.hash || '');
          window.history.replaceState({}, document.title, cleanUrl);
        }
      };

      fetchGoogleProfile();
    }
  }, []);

  /**
   * Open the global Login Modal
   * @param {Object} options - { onSuccess: callback, message: string }
   */
  const openLoginModal = useCallback((options = {}) => {
    if (typeof options === 'function') {
      pendingActionRef.current = options;
      setModalMessage('');
    } else {
      pendingActionRef.current = options.onSuccess || null;
      setModalMessage(options.message || '');
    }
    setIsLoginModalOpen(true);
  }, []);

  /**
   * Close the global Login Modal
   */
  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    setModalMessage('');
    pendingActionRef.current = null;
  }, []);

  /**
   * Successful Login Handler
   * Stores user data, token, closes modal, and resumes pending flow
   */
  const login = useCallback((userData, authToken = null) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
    if (authToken) {
      localStorage.setItem('token', authToken);
      setToken(authToken);
    }
    window.dispatchEvent(new Event('storage'));

    setIsLoginModalOpen(false);
    setModalMessage('');

    // Execute pending callback if any, passing the logged-in user
    if (pendingActionRef.current && typeof pendingActionRef.current === 'function') {
      try {
        const callback = pendingActionRef.current;
        pendingActionRef.current = null;
        callback(userData);
      } catch (err) {
        console.error("Error executing pending action after login:", err);
      }
    }
  }, []);

  /**
   * Logout Handler
   */
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    window.dispatchEvent(new Event('storage'));
  }, []);

  /**
   * Update User Data in place
   */
  const updateUser = useCallback((newUserData) => {
    const updated = typeof newUserData === 'function' ? newUserData(user) : { ...user, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    window.dispatchEvent(new Event('storage'));
  }, [user]);

  /**
   * Require Auth Helper:
   * If logged in, immediately executes actionCallback.
   * If not logged in, opens login modal and executes actionCallback upon login completion without redirecting.
   */
  const requireAuth = useCallback((actionCallback, message = '') => {
    if (user) {
      if (typeof actionCallback === 'function') {
        actionCallback(user);
      }
      return true;
    }

    openLoginModal({
      onSuccess: actionCallback,
      message: message
    });
    return false;
  }, [user, openLoginModal]);

  const value = {
    user,
    token,
    isLoggedIn: Boolean(user),
    isLoginModalOpen,
    modalMessage,
    openLoginModal,
    closeLoginModal,
    requireAuth,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
