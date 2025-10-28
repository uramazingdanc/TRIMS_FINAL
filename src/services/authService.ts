
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
    
    // Get or create the user profile in the profiles table
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);

    // Auto-create a minimal profile if not found (first login after signup or dashboard-created user)
    if (!profile) {
      const displayName = (data.user.user_metadata?.name as string) || (data.user.email?.split('@')[0] ?? 'User');
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          name: displayName,
        });
      if (createProfileError) {
        // If creation fails due to RLS/session, surface a friendly message
        throw new Error(createProfileError.message || 'Unable to create user profile');
      }

      // Re-fetch profile to proceed
      const { data: createdProfile, error: refetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      if (refetchError) throw new Error(refetchError.message);
      profile = createdProfile as any;
    }
    
    // Get user role using secure RPC function
    const { data: roleData, error: roleError } = await (supabase as any)
      .rpc('current_user_role');
    
    if (roleError) {
      console.error('Error fetching role:', roleError);
    }
    
    const profileData = profile as ProfilesTable;
    const userRole = (roleData as any) || 'tenant';
    
    // Map Supabase user to our User type with proper type safety
    const user: User = {
      id: data.user.id,
      name: profileData.name,
      email: data.user.email!,
      role: userRole,
      avatarUrl: undefined,
    };
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<User> => {
  try {
    const userRole = data.role || 'tenant';
    
    // Register the new user with Supabase - auto-confirm to skip email verification
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          name: data.name,
          role: userRole,
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!authData || !authData.user) throw new Error('Registration failed: No user data returned');
    
    // Create or update profile row for this user (no trigger in DB)
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id === authData.user.id) {
        const { error: profileUpsertError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: data.email,
            name: data.name,
          }, { onConflict: 'id' });
        if (profileUpsertError) {
          console.error('Profile upsert failed:', profileUpsertError);
        }
      }
    } catch (e) {
      console.error('Profile creation attempt failed:', e);
    }
    
    // Create user role entry in user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: userRole as any,
      });
    
    if (roleError) {
      console.error('Role creation failed:', roleError);
    }
    
    // If user is registering as tenant, create tenant record
    if (userRole === 'tenant') {
      const { error: tenantError } = await supabase
        .from('tenants')
        .insert({
          user_id: authData.user.id,
          name: data.name,
          email: data.email,
          lease_start: new Date().toISOString().split('T')[0],
          lease_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    localStorage.removeItem('trims_user');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  try {
    // First check local storage (for backward compatibility)
    const userStr = localStorage.getItem('trims_user');
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
