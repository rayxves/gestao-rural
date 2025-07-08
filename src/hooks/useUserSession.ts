
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useUserSession = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Try to get user_id from URL first (works on any route)
    const urlParams = new URLSearchParams(location.search);
    const userIdFromUrl = urlParams.get('user_id');
    
    if (userIdFromUrl) {
      // Save to localStorage and set state
      localStorage.setItem('gestao_rural_user_id', userIdFromUrl);
      setUserId(userIdFromUrl);
      setIsLoading(false);
      console.log('User ID captured from URL:', userIdFromUrl);
    } else {
      // Try to get from localStorage
      const storedUserId = localStorage.getItem('gestao_rural_user_id');
      if (storedUserId) {
        setUserId(storedUserId);
        console.log('User ID loaded from localStorage:', storedUserId);
      } else {
        console.log('No user ID found in URL or localStorage');
      }
      setIsLoading(false);
    }
  }, [location.search]);

  const clearUserId = () => {
    localStorage.removeItem('gestao_rural_user_id');
    setUserId(null);
    console.log('User ID cleared');
  };

  const setUserIdManually = (newUserId: string) => {
    localStorage.setItem('gestao_rural_user_id', newUserId);
    setUserId(newUserId);
    console.log('User ID set manually:', newUserId);
  };

  return {
    userId,
    isLoading,
    clearUserId,
    setUserIdManually,
    hasUserId: !!userId
  };
};
