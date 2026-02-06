import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button3D, Input3D } from './ui/theme-3d';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    const result = await onLogin(email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-theme-bg flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-md my-auto">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <img src="/logo.png" alt="School KM" className="w-24 h-24 mx-auto mb-3 object-contain" />
          <h1 className="text-2xl font-bold text-text-primary mb-1">School KM</h1>
          <p className="text-text-secondary">ระบบจัดการความรู้โรงเรียน</p>
        </div>

        {/* Login Card — theme-3d */}
        <div className="gradient-card-3d shadow-card-3d rounded-2xl p-6 radius-touch-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                อีเมล
              </label>
              <Input3D
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.ac.th"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Input3D
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-theme-error/10 border border-[var(--error)] text-[var(--error)] text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 px-6 rounded-2xl text-lg font-medium bg-blue-600 text-white hover:bg-blue-700 active:translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ minHeight: '48px' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10">
            <p className="text-xs text-text-muted text-center mb-2">บัญชีทดสอบ</p>
            <div className="bg-accent rounded-xl p-3 text-xs text-text-secondary space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">ครู:</span>
                <span>teacher@demo.com / demo1234</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Curator:</span>
                <span>admin@demo.com / demo1234</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          © 2569 School KM - ระบบจัดการความรู้
        </p>
      </div>
    </div>
  );
}
