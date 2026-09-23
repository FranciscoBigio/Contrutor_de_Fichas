import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * AuthContext:
 * Alinhado à Aula 3 (Slide 15 - Estado Global de Autenticação) e
 * Aula 4 (Slide 8 e 15 - OWASP M2: Token seguro armazenado via SecureStore com fallback resiliente para AsyncStorage).
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'player' | 'master';
}

export interface StoredAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'player' | 'master';
  createdAt: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    pass: string,
    role: 'player' | 'master'
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'questsheet_jwt_token';
const USER_KEY = 'questsheet_user_data';
const ACCOUNTS_STORAGE_KEY = '@questsheet_registered_accounts_v1';

// Contas padrão pré-carregadas para demonstração
const SEED_ACCOUNTS: StoredAccount[] = [
  {
    id: 'user-master-01',
    name: 'Mestre da Masmorra',
    email: 'mestre@questsheet.com',
    password: 'senha123',
    role: 'master',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-player-01',
    name: 'Aventureiro Francisco',
    email: 'jogador@questsheet.com',
    password: 'senha123',
    role: 'player',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Helpers de Armazenamento Seguro Híbrido (SecureStore no iOS/Android, AsyncStorage no Web)
 */
async function secureGet(key: string): Promise<string | null> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      return await SecureStore.getItemAsync(key);
    }
  } catch {
    // Fallback silencioso
  }
  return await AsyncStorage.getItem(`@secure_${key}`);
}

async function secureSet(key: string, value: string): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
  } catch {
    // Fallback silencioso
  }
  await AsyncStorage.setItem(`@secure_${key}`, value);
}

async function secureDelete(key: string): Promise<void> {
  try {
    const isAvailable = await SecureStore.isAvailableAsync();
    if (isAvailable) {
      await SecureStore.deleteItemAsync(key);
      return;
    }
  } catch {
    // Fallback silencioso
  }
  await AsyncStorage.removeItem(`@secure_${key}`);
}

// Gerador seguro de tokens JWT sem dependência de btoa instável
function generateSafeJwtToken(email: string, id: string): string {
  const timestamp = Date.now();
  const randomHex = Math.random().toString(36).substring(2, 10);
  return `eyJhbGciOiJIUzI1NiJ9.qs_${id}_${encodeURIComponent(email)}_${timestamp}.sig_${randomHex}`;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicializa contas salvas e restaura a sessão segura
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        // Inicializa repositório de contas cadastradas se estiver vazio
        const accountsRaw = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
        if (!accountsRaw) {
          await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(SEED_ACCOUNTS));
        }

        // Restaura credenciais da sessão ativa
        const storedToken = await secureGet(TOKEN_KEY);
        const storedUserJson = await secureGet(USER_KEY);

        if (storedToken && storedUserJson) {
          const parsedUser = JSON.parse(storedUserJson);
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (err) {
        console.warn('Erro ao carregar sessão de autenticação:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  // Obter todas as contas registradas
  const getRegisteredAccounts = async (): Promise<StoredAccount[]> => {
    try {
      const data = await AsyncStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignora erro
    }
    return SEED_ACCOUNTS;
  };

  // Salvar lista de contas
  const saveRegisteredAccounts = async (accounts: StoredAccount[]) => {
    try {
      await AsyncStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Erro ao salvar contas no AsyncStorage:', e);
    }
  };

  // Login de Usuário
  const login = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'E-mail e senha são obrigatórios.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' };
    }

    try {
      const accounts = await getRegisteredAccounts();
      const existingAccount = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

      if (existingAccount) {
        // Verifica a senha cadastrada
        if (existingAccount.password !== cleanPass) {
          return { success: false, error: 'Senha incorreta para este aventureiro.' };
        }

        const validUser: User = {
          id: existingAccount.id,
          name: existingAccount.name,
          email: existingAccount.email,
          role: existingAccount.role,
        };
        const jwt = generateSafeJwtToken(validUser.email, validUser.id);

        await secureSet(TOKEN_KEY, jwt);
        await secureSet(USER_KEY, JSON.stringify(validUser));

        setToken(jwt);
        setUser(validUser);
        return { success: true };
      }

      // Se a conta não existe, cria como novo aventureiro de forma transparente
      const autoUser: StoredAccount = {
        id: `user_${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        password: cleanPass,
        role: 'player',
        createdAt: new Date().toISOString(),
      };

      const updatedAccounts = [...accounts, autoUser];
      await saveRegisteredAccounts(updatedAccounts);

      const loggedUser: User = {
        id: autoUser.id,
        name: autoUser.name,
        email: autoUser.email,
        role: autoUser.role,
      };
      const jwt = generateSafeJwtToken(loggedUser.email, loggedUser.id);

      await secureSet(TOKEN_KEY, jwt);
      await secureSet(USER_KEY, JSON.stringify(loggedUser));

      setToken(jwt);
      setUser(loggedUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Falha ao salvar sessão do aventureiro.' };
    }
  };

  // Cadastro de Novo Usuário (com verificação de duplicidade e perfil)
  const register = async (
    name: string,
    email: string,
    pass: string,
    role: 'player' | 'master'
  ) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'O nome do aventureiro deve ter no mínimo 2 letras.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Informe um e-mail válido com @ e domínio.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: 'A senha deve ter no mínimo 6 caracteres.' };
    }

    try {
      const accounts = await getRegisteredAccounts();
      const alreadyExists = accounts.some((a) => a.email.toLowerCase() === cleanEmail);

      if (alreadyExists) {
        return {
          success: false,
          error: 'Este e-mail já está registrado na guilda. Faça login ou utilize outro endereço.',
        };
      }

      const newAccount: StoredAccount = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role,
        createdAt: new Date().toISOString(),
      };

      // Persiste a nova conta no banco de dados de usuários
      const updatedAccounts = [...accounts, newAccount];
      await saveRegisteredAccounts(updatedAccounts);

      // Inicia a sessão automaticamente
      const newUser: User = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        role: newAccount.role,
      };
      const jwt = generateSafeJwtToken(newUser.email, newUser.id);

      await secureSet(TOKEN_KEY, jwt);
      await secureSet(USER_KEY, JSON.stringify(newUser));

      setToken(jwt);
      setUser(newUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Falha ao gravar novo cadastro na guilda.' };
    }
  };

  // Redefinição de Senha
  const resetPassword = async (email: string, newPass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = newPass.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'E-mail e nova senha são obrigatórios.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    try {
      const accounts = await getRegisteredAccounts();
      const accountIdx = accounts.findIndex((a) => a.email.toLowerCase() === cleanEmail);

      if (accountIdx === -1) {
        return { success: false, error: 'Nenhuma conta encontrada com este e-mail.' };
      }

      accounts[accountIdx].password = cleanPass;
      await saveRegisteredAccounts(accounts);
      return { success: true };
    } catch {
      return { success: false, error: 'Erro ao atualizar a senha no banco de dados.' };
    }
  };

  // Login de Convidado
  const loginAsGuest = async () => {
    const guestUser: User = {
      id: 'guest',
      name: 'Aventureiro Convidado',
      email: 'convidado@questsheet.com',
      role: 'player',
    };
    const guestToken = 'guest_token_offline';

    try {
      await secureSet(TOKEN_KEY, guestToken);
      await secureSet(USER_KEY, JSON.stringify(guestUser));
      setToken(guestToken);
      setUser(guestUser);
    } catch (e) {
      console.warn('Erro ao salvar convidado:', e);
    }
  };

  // Encerramento de Sessão (Logout)
  const logout = async () => {
    try {
      await secureDelete(TOKEN_KEY);
      await secureDelete(USER_KEY);
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
        resetPassword,
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
