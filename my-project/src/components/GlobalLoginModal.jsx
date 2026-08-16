import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const GlobalLoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();

  if (!isLoginModalOpen) return null;

  return (
    <LoginModal
      onClose={closeLoginModal}
      onSuccess={(user, token) => {
        login(user, token);
      }}
    />
  );
};

export default GlobalLoginModal;
