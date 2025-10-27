import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User, LoginCredentials, RegisterData } from '@/types/auth';
import { login, register, logout } from '@/services/authService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProfilesTable } from '@/types/supabase';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            // Get user profile data
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            if (profileError) throw profileError;

            if (profileData) {
              // Cast to correct type
              const profile = profileData as ProfilesTable;
              
              const user: User = {
                id: session.user.id,
                email: session.user.email!,
                name: profile.name || '',
                role: profile.role as 'admin' | 'tenant',
                avatarUrl: undefined, // avatar_url doesn't exist in profiles table
              };

              setState({
                user,
                isAuthenticated: true,
                isLoading: false,
              });

              // Save to localStorage for backward compatibility
              localStorage.setItem('trims_user', JSON.stringify(user));
            } else {
              // Handle case where profile doesn't exist yet
              setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } catch (error) {
            console.error('Error getting user profile:', error);
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('trims_user');
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    // THEN check for existing session
    const checkCurrentSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Get user profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) throw profileError;

          if (profileData) {
            // Cast to correct type
            const profile = profileData as ProfilesTable;
            
            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              name: profile.name || '',
              role: profile.role as 'admin' | 'tenant',
              avatarUrl: undefined, // avatar_url doesn't exist in profiles table
            };

            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });

            // Save to localStorage for backward compatibility
            localStorage.setItem('trims_user', JSON.stringify(user));
          } else {
            setState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error loading current session:", error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };
    
    checkCurrentSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await login(credentials);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      return user;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred during login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const user = await register(data);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast({
        title: "Registration successful",
        description: `Welcome to TRIMS, ${user.name}!`,
      });
      
      return user;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const value = {
    ...state,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};