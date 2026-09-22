import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * AuthContext:
 * Alinhado à Aula 3 (Slide 15 - Estado Global de Autenticação) e
 * Aula 4 (Slide 8 e 15 - OWASP M2: Token seguro armazenado via SecureStore no Keychain/Keystore).
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'player' | 'master';
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, role: 'player' | 'master') => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'questsheet_jwt_token';
const USER_KEY = 'questsheet_user_data';

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carrega o token com segurança no startup (Aula 4, Slide 8)
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUserJson = await SecureStore.getItemAsync(USER_KEY);

        if (storedToken && storedUserJson) {
          setToken(storedToken);
          setUser(JSON.parse(storedUserJson));
        }
      } catch (err) {
        console.warn('Erro ao ler credenciais seguras do SecureStore:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!email.trim() || !pass.trim()) {
      return { success: false, error: 'E-mail e senha são obrigatórios' };
    }

    if (pass.length < 6) {
      return { success: false, error: 'A senha deve ter no mínimo 6 caracteres' };
    }

    // Mock de token JWT assinado conforme Aula 3, Slide 37
    const mockJwt = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ email, sub: 'user_1' }))}.sig_${Date.now()}`;
    const mockUser: User = {
      id: '1',
      name: email.split('@')[0],
      email: email.trim(),
      role: 'player',
    };

    try {
      await SecureStore.setItemAsync(TOKEN_KEY, mockJwt);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));

      setToken(mockJwt);
      setUser(mockUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Falha ao salvar sessão com segurança' };
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    role: 'player' | 'master'
  ) => {
    if (!name.trim()) {
      return { success: false, error: 'O nome do aventureiro é obrigatório' };
    }
    if (!email.trim() || !pass.trim()) {
      return { success: false, error: 'E-mail e senha são obrigatórios' };
    }
    if (pass.length < 6) {
      return { success: false, error: 'A senha deve ter no mínimo 6 caracteres' };
    }

    const mockJwt = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ email, sub: `user_${Date.now()}` }))}.sig_${Date.now()}`;
    const newUser: User = {
      id: String(Date.now()),
      name: name.trim(),
      email: email.trim(),
      role,
    };

    try {
      await SecureStore.setItemAsync(TOKEN_KEY, mockJwt);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));

      setToken(mockJwt);
      setUser(newUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Falha ao salvar credenciais com segurança no SecureStore' };
    }
  };

  const loginAsGuest = async () => {
    const guestUser: User = {
      id: 'guest',
      name: 'Aventureiro Convidado',
      email: 'convidado@questsheet.com',
      role: 'player',
    };
    const guestToken = 'guest_token_offline';

    try {
      await SecureStore.setItemAsync(TOKEN_KEY, guestToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(guestUser));
      setToken(guestToken);
      setUser(guestUser);
    } catch (e) {
      console.warn('Erro ao salvar convidado:', e);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (e) {
      console.warn('Erro ao remover sessão:', e);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
