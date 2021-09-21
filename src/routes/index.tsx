import React from 'react';
import { AuthRoutes } from './auth.routes';
import { NavigationContainer } from '@react-navigation/native';
import { AppRoutes } from './app.routes';
import { useAuth } from '../hooks/auth';

export function Routes() {
  const { user } = useAuth();
  console.log(user)
  return (
    <NavigationContainer>
      {user.id ? <AppRoutes /> : <AuthRoutes />}
    </NavigationContainer>
  )
}