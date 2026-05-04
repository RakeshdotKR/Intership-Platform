import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import {
  Menu, X, BookOpen, Calendar, LayoutDashboard, LogOut, GraduationCap, Sun, Moon,
} from 'lucide-react';
import React from 'react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { to: '/courses', label: 'Courses', icon: BookOpen },
    //{ to: '/batches', label: 'Batches', icon: Calendar },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm dark:bg-[#060610]/90 dark:border-white/6 dark:shadow-black/20'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Intern<span className="text-indigo-500 dark:text-indigo-400">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive(to)
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth + Theme toggle */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/8">
                  <div className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-white/80">{user.name?.split(' ')[0]}</span>
                </div>
                <Link
                  to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive(user.role === 'ADMIN' ? '/admin' : '/dashboard')
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
                  )}
                >
                  <LayoutDashboard size={15} />
                  {user.role === 'ADMIN' ? 'Admin' : 'Dashboard'}
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 gap-1.5 dark:text-white/50 dark:hover:text-red-400">
                  <LogOut size={14} />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="gradient" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl dark:border-white/6 dark:bg-[#060610]/95">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive(to)
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-200 dark:border-white/6 space-y-1">
              {user ? (
                <>
                  <Link
                    to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5"
                  >
                    <LayoutDashboard size={16} />
                    {user.role === 'ADMIN' ? 'Admin Dashboard' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 w-full text-left dark:text-red-400/80 dark:hover:text-red-400 dark:hover:bg-red-400/5"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/5">
                    Sign In
                  </Link>
                  <Link to="/register" className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
