import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';
import type { AuthUser, TeacherProfile, AuthState } from '@/types';

// Simple hash function for demo (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Demo mode: accept plain text comparison for demo accounts
  if (storedHash === 'demo1234' || password === storedHash) {
    return true;
  }
  
  // Hash the input and compare
  const inputHash = await hashPassword(password);
  console.log('Password verification:', { inputHash, storedHash, match: inputHash === storedHash });
  
  // Also check if stored hash matches expected demo hash
  const expectedDemoHash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';
  if (storedHash === expectedDemoHash && password === 'demo1234') {
    return true;
  }
  
  return inputHash === storedHash;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as AuthUser;
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
          isLoading: false
        }));
        // Load profile if teacher_id exists
        if (user.teacher_id && isSupabaseAvailable && supabase) {
          loadTeacherProfile(user.teacher_id);
        }
      } catch {
        localStorage.removeItem('auth_user');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const loadTeacherProfile = async (teacherId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from('teacher_profile')
      .select('*')
      .eq('id', teacherId)
      .single();
    if (data) {
      setState(prev => ({ ...prev, profile: data as TeacherProfile }));
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseAvailable || !supabase) {
      return { success: false, error: 'ไม่สามารถเชื่อมต่อ Supabase ได้' };
    }

    try {
      // Fetch user by email
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .limit(1);

      if (error) {
        console.error('Login query error:', error);
        return { success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
      }

      if (!users || users.length === 0) {
        return { success: false, error: 'ไม่พบบัญชีผู้ใช้นี้' };
      }

      const dbUser = users[0];

      // Verify password
      const isValid = await verifyPassword(password, dbUser.password);
      if (!isValid) {
        return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
      }

      // Update last_login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', dbUser.id);

      const authUser: AuthUser = {
        id: dbUser.id,
        email: dbUser.email,
        full_name: dbUser.full_name,
        role: dbUser.role,
        teacher_id: dbUser.teacher_id,
        is_active: dbUser.is_active,
        last_login: new Date().toISOString()
      };

      // Save to localStorage
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      setState({
        user: authUser,
        profile: null,
        isLoading: false,
        isAuthenticated: true
      });

      // Load teacher profile if available
      if (authUser.teacher_id) {
        loadTeacherProfile(authUser.teacher_id);
      }

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_user');
    setState({
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false
    });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<TeacherProfile>) => {
    if (!supabase || !state.profile) return false;
    const { error } = await supabase
      .from('teacher_profile')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', state.profile.id);
    if (!error) {
      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null
      }));
      return true;
    }
    return false;
  }, [state.profile]);

  return {
    ...state,
    login,
    logout,
    updateProfile,
    isCurator: state.user?.role === 'ADMIN' || state.user?.role === 'PRINCIPAL'
  };
}

// Export hash function for creating users
export { hashPassword };
