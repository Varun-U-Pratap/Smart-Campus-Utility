import {
  createContext,
  PropsWithChildren,
  useCallback,
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

interface VerifyEmailOtpDto {
  email: string;
  code: string;
}

interface ResendOtpDto {
  email: string;
}

interface AuthContextValue {
  isBootstrapping: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  token: string | null;
  pendingVerificationEmail: string | null;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<{ email: string; requiresVerification: boolean }>;
  verifyEmail: (dto: VerifyEmailOtpDto) => Promise<void>;
  resendOtp: (dto: ResendOtpDto) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components -- this module must export context and provider together in the current workspace setup.
export const AuthContext = createContext<AuthContextValue | null>(null);

const readSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AuthSession;
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore localStorage errors and treat as logged out.
    }
    return null;
  }
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<AuthSession | null>(readSession);
  const [isBootstrapping] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  const persist = useCallback((next: AuthSession | null) => {
    setSession(next);
    if (next) {
      setPendingVerificationEmail(null);
    }
    try {
      if (!next) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore localStorage write failures so auth state still works in-memory.
    }
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
      const response = await apiRequest<{ email: string; requiresVerification: boolean }>('/auth/register', {
        method: 'POST',
        body: dto,
      });
      setPendingVerificationEmail(response.email);
      return response;
    },
    [],
  );

  const verifyEmail = useCallback(
    async (dto: VerifyEmailOtpDto) => {
      const next = await apiRequest<AuthSession>('/auth/verify-email', {
        method: 'POST',
        body: dto,
      });
      persist(next);
    },
    [persist],
  );

  const resendOtp = useCallback(
    async (dto: ResendOtpDto) => {
      await apiRequest<{ message: string; email: string }>('/auth/resend-otp', {
        method: 'POST',
        body: dto,
      });
    },
    [],
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
      pendingVerificationEmail,
      login,
      register,
      verifyEmail,
      resendOtp,
      logout,
      refreshProfile,
    }),
    [
      isBootstrapping,
      session,
      pendingVerificationEmail,
      login,
      register,
      verifyEmail,
      resendOtp,
      logout,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
