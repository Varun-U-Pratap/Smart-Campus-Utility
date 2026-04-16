import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiRequest } from '../lib/api';
import { AuthSession, AuthUser, Role } from '../types/domain';

const STORAGE_KEY = 'smart-campus-session';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto extends LoginDto {
  fullName: string;
  role: Role;
  studentId?: string;
  department?: string;
  employeeCode?: string;
}

interface AuthContextValue {
  isBootstrapping: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  token: string | null;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const readSession = (): AuthSession | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    setSession(readSession());
    setIsBootstrapping(false);
  }, []);

  const persist = useCallback((next: AuthSession | null) => {
    setSession(next);
    if (!next) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const login = useCallback(
    async (dto: LoginDto) => {
      const next = await apiRequest<AuthSession>('/auth/login', {
        method: 'POST',
        body: dto,
      });
      persist(next);
    },
    [persist],
  );

  const register = useCallback(
    async (dto: RegisterDto) => {
      const next = await apiRequest<AuthSession>('/auth/register', {
        method: 'POST',
        body: dto,
      });
      persist(next);
    },
    [persist],
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const refreshProfile = useCallback(async () => {
    if (!session?.accessToken) {
      return;
    }

    const profile = await apiRequest<{
      id: string;
      email: string;
      fullName: string;
      role: Role;
    }>('/users/me', {
      token: session.accessToken,
    });

    persist({
      ...session,
      user: {
        sub: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
      },
    });
  }, [persist, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isBootstrapping,
      session,
      user: session?.user ?? null,
      token: session?.accessToken ?? null,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [isBootstrapping, session, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
