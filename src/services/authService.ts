
import { LoginCredentials, RegisterData, User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { ProfilesTable } from '@/types/supabase';

// Modified authentication functions to use Supabase
export const login = async ({ email, password }: LoginCredentials): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    if (!data || !data.user) throw new Error('Login failed: No user data returned');
    
    // Get the user profile from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();
      
    if (profileError) throw new Error(profileError.message);
    if (!profile) throw new Error('User profile not found');
    
    // Cast the profile to the correct type
    const profileData = profile as ProfilesTable;
    
    // Map Supabase user to our User type with proper type safety
    const user: User = {
      id: data.user.id,
      name: profileData.name,
      email: data.user.email!,
      role: profileData.role as 'admin' | 'tenant',
      avatarUrl: undefined, // avatar_url doesn't exist in profiles table
    };
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<User> => {
  try {
    // Register the new user with Supabase
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) throw new Error(error.message);
    if (!authData || !authData.user) throw new Error('Registration failed: No user data returned');
    
    const userRole = data.role || 'tenant';
    
    // Create the profile manually
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        name: data.name,
        email: data.email,
        role: userRole,
      })
      .select()
      .single();
    
    if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);
    
    // If user is registering as tenant, create tenant record
    if (userRole === 'tenant') {
      const { error: tenantError } = await supabase
        .from('tenants')
        .insert({
          user_id: authData.user.id,
          name: data.name,
          email: data.email,
          lease_start_date: new Date().toISOString().split('T')[0],
          lease_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        });
      
      if (tenantError) {
        console.error('Tenant record creation failed:', tenantError);
        // Don't throw here as the user account is already created
      }
    }
    
    // Map to our User type
    const user: User = {
      id: authData.user.id,
      name: data.name,
      email: authData.user.email!,
      role: userRole,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
    };
    
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    localStorage.removeItem('tmis_user');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  try {
    // First check local storage (for backward compatibility)
    const userStr = localStorage.getItem('tmis_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    
    // This function now returns null as we're handling async session retrieval in the AuthContext
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};
