import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { GraduationCap, Eye, EyeOff, AlertCircle, ArrowRight, Code2, Users, Award } from 'lucide-react';
import React from 'react';

const HIGHLIGHTS = [
  { icon: Code2, label: 'Real-world projects' },
  { icon: Users, label: '500+ trained students' },
  { icon: Award, label: 'Certified programs' },
];

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(result.user?.role === 'ADMIN' ? '/admin' : '/');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#060610]">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 bg-slate-50 dark:bg-transparent">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-100/80 via-violet-100/40 to-transparent dark:from-indigo-900/50 dark:via-violet-900/30 dark:to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl dark:bg-indigo-500/20" />

        <div className="relative text-center max-w-md">
          <div className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Intern<span className="text-indigo-500 dark:text-indigo-400">Hub</span>
            </span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight dark:text-white">
            Welcome back to your learning journey
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-10 dark:text-white/50">
            Continue building skills that employers are looking for. Your next opportunity is one step away.
          </p>

          <div className="flex flex-col gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-sm text-slate-700 dark:bg-white/5 dark:border-white/8 dark:text-white/70">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center dark:bg-indigo-500/20">
                  <Icon size={14} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Intern<span className="text-indigo-500 dark:text-indigo-400">Hub</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 mb-1 dark:text-white">Sign in</h1>
          <p className="text-sm text-slate-500 mb-8 dark:text-white/40">
            New here?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400 dark:hover:text-indigo-300">
              Create an account
            </Link>
          </p>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-6 dark:bg-red-500/10 dark:border-red-500/20">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors dark:text-white/30 dark:hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="gradient" size="lg" className="w-full gap-2 group" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
            </Button>
          </form>

          <p className="text-xs text-center text-slate-400 mt-8 dark:text-white/20">
            By signing in, you agree to our{' '}
            <Link to="/" className="text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/60">Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
