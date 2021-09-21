import React, { createContext, useEffect, ReactNode, useContext, useState } from 'react'
import * as AuthSession from 'expo-auth-session'
export const AuthContext = createContext({} as IAuthContextData)
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface AuthProviderProps {
  children: ReactNode;

}
interface IAuthContextData {
  user: User;
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>;
  signOut(): Promise<void>;
  userStorageLoading: boolean;

}
interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  };
  type: string;
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>({} as User);
  const [userStorageLoading, setUserStorageLoading] = useState(true);


  const CLIENT_ID = "250860383432-onujj4i4i3qrgjaqrhodc835kjvgd4rb.apps.googleusercontent.com"
  const REDIRECT_URI = "https://auth.expo.io/@mariorobertobr/gofinances"
  async function signInWithApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      })

      if (credential) {
        const name = credential.fullName!.givenName!
        const photo = `https://ui-avatar.com/api/?name${name}&lenght=2`
        const userLogged = {
          id: String(credential.user),
          email: credential.email!,
          name,
          photo,
        }
        setUser(userLogged)
        await AsyncStorage.setItem('@gofinances:user', JSON.stringify(userLogged))

      }

    }
    catch (error) {
      console.log(error);
    }
  }
  async function signInWithGoogle() {
    try {

      const RESPONSE_TYPE = 'token'
      const SCOPE = encodeURI('profile email');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

      const { type, params } = await AuthSession
        .startAsync({ authUrl }) as AuthorizationResponse;

      if (type === 'success') {
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
        const userInfo = await response.json();
        const userLogged = {

          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.given_name,
          photo: userInfo.picture


        }

        setUser(userLogged)
        await AsyncStorage.setItem('@gofinances:user', JSON.stringify(userLogged))
      }
      console.log(user)
    }
    catch (error) {
      console.error(error)
    }


  }

  async function signOut() {
    setUser({} as User);
    await AsyncStorage.removeItem('@gofinances:user')
  }

  useEffect(() => {
    async function loadUserStorageDate() {
      const userStorage = await AsyncStorage.getItem('@gofinances:user')

      if (userStorage) {
        const userLogged = JSON.parse(userStorage) as User;
        setUser(userLogged)
      }
      setUserStorageLoading(false);
    }
    loadUserStorageDate();
  }, [])

  return (

    <AuthContext.Provider value={{
      user,
      signInWithGoogle,
      signInWithApple,
      signOut,
      userStorageLoading

    }}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)
  return context;

}

export { AuthProvider, useAuth }