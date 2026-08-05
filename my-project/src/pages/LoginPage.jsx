import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginModal from '../components/LoginModal';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSuccess = (user) => {
    const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
    if (redirect) {
      navigate(redirect);
    } else if (storedRedirect) {
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(storedRedirect);
    } else {
      navigate('/profile');
    }
  };

  return (
    <LoginModal 
      isStandalonePage={true} 
      onSuccess={handleSuccess} 
    />
  );
};

export default LoginPage;