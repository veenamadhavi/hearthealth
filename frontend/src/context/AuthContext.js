import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () =>
  useContext(AuthContext);

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const token =
          localStorage.getItem(
            'hh_token'
          );

        const userData =
          localStorage.getItem(
            'hh_user'
          );

        if (token && userData) {
          const parsedUser =
            JSON.parse(userData);

          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (
    email,
    password,
    role
  ) => {
    let response;

    if (role === 'patient') {
      response =
        await authAPI.patientLogin({
          email,
          password,
        });
    } else {
      response =
        await authAPI.doctorLogin({
          email,
          password,
        });
    }

    const {
      token,
      user: userData,
    } = response.data;

    localStorage.setItem(
      'hh_token',
      token
    );

    localStorage.setItem(
      'hh_user',
      JSON.stringify(userData)
    );

    setUser(userData);
    setIsAuthenticated(true);

    return response.data;
  };

  const register = async (
    userData,
    role
  ) => {
    let response;

    if (role === 'patient') {
      response =
        await authAPI.patientRegister(
          userData
        );
    } else {
      response =
        await authAPI.doctorRegister(
          userData
        );
    }

    const {
      token,
      user: newUser,
    } = response.data;

    localStorage.setItem(
      'hh_token',
      token
    );

    localStorage.setItem(
      'hh_user',
      JSON.stringify(newUser)
    );

    setUser(newUser);
    setIsAuthenticated(true);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(
      'hh_token'
    );

    localStorage.removeItem(
      'hh_user'
    );

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};