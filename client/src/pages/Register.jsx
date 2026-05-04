import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { GraduationCap, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import React from 'react';

const PERKS = [
  'Access to all internship programs',
  'Real project experience & portfolio',
  'Industry-recognized certification',
  'Placement support & resume review',
];

const BRANCHES = {
  'IT / Software-Aligned': [
    'Computer Science & Engineering (CSE)',
    'Information Technology (IT)',
    'Information Science & Engineering (ISE)',
    'Computer Science & Business Systems (CSBS)',
    'Artificial Intelligence & Machine Learning (AIML)',
    'Computer Science & Data Science (CSD / DS)',
    'Computer Science & Artificial Intelligence (CSAI)',
    'Computer Science & Systems Engineering (CSSE)',
  ],
  'Emerging / Specialized': [
    'Artificial Intelligence (AI)',
    'Machine Learning (ML)',
    'Artificial Intelligence & Data Science (AI & DS)',
    'Cyber Security (CS - Cyber)',
    'Internet of Things (IoT)',
  ],
  'Electronics + IT Hybrid': [
    'Electronics & Communication Engineering (ECE)',
    'Electronics & Instrumentation Engineering (EIE)',
    'Electronics & Telecommunication Engineering (ETE)',
    'Electrical & Electronics Engineering (EEE)',
  ],
  'Non-IT': [
    'Mechanical Engineering (ME)',
    'Civil Engineering (CE / CIVIL)',
    'Chemical Engineering (CHE)',
  ],
};

const Year = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year / Dual Degree'];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', college: '', branch: '', year: '', password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const textFields = [
    { name: 'name',    label: 'Full Name',          type: 'text',  placeholder: 'Rahul Sharma',      col: 2 },
    { name: 'email',   label: 'Email Address',       type: 'email', placeholder: 'you@example.com',   col: 2 },
    { name: 'phone',   label: 'Mobile Number',       type: 'tel',   placeholder: '+91 98765 43210',   col: 1 },
    { name: 'college', label: 'College / University', type: 'text', placeholder: 'IIT Delhi',         col: 1 },
  ];

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#060610]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden flex-col items-center justify-center p-12 bg-slate-50 dark:bg-transparent">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-100/80 via-violet-100/40 to-transparent dark:from-indigo-900/50 dark:via-violet-900/30 dark:to-transparent" />
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl dark:bg-indigo-500/20" />

        <div className="relative max-w-xs">
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Intern<span className="text-indigo-500 dark:text-indigo-400">Hub</span>
            </span>
          </Link>

          <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-tight dark:text-white">
            Start your tech career today
          </h2>
          <p className="text-slate-500 text-sm mb-8 dark:text-white/50">
            Join thousands of students who landed their first job through InternHub.
          </p>

          <div className="space-y-3">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3 text-sm text-slate-600 dark:text-white/70">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 dark:text-emerald-400" />
                {perk}
              </div>
            ))}
          </div>

          <div className="mt-10 p-4 rounded-xl bg-white border border-slate-200 dark:bg-white/5 dark:border-white/8">
            <p className="text-sm font-medium text-slate-900 mb-1 dark:text-white">One-time fee: ₹4,500</p>
            <p className="text-xs text-slate-500 dark:text-white/40">Includes certificate + placement support</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-lg py-6">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Intern<span className="text-indigo-500 dark:text-indigo-400">Hub</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 mb-1 dark:text-white">Create your account</h1>
          <p className="text-sm text-slate-500 mb-7 dark:text-white/40">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium dark:text-indigo-400 dark:hover:text-indigo-300">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 mb-6 dark:bg-red-500/10 dark:border-red-500/20">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {textFields.map(({ name, label, type, placeholder, col }) => (
                <div key={name} className={`space-y-1.5 ${col === 2 ? 'col-span-2' : 'col-span-1'}`}>
                  <Label htmlFor={name}>{label}</Label>
                  <Input
                    id={name}
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="year">Year of Study</Label>
                <Select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="appearance-none pr-2"
                >
                  <option value="">Select year</option>
                  {Year.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="appearance-none pr-2"
                >
                  <option value="">Select branch</option>
                  {Object.entries(BRANCHES).map(([group, options]) => (
                    <optgroup key={group} label={group}>
                      {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pr-10"
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
            </div>

            <Button type="submit" variant="gradient" size="lg" className="w-full gap-2 group mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
            </Button>
          </form>

          <p className="text-xs text-center text-slate-400 mt-6 dark:text-white/20">
            By creating an account, you agree to our{' '}
            <Link to="/" className="text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/60">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/" className="text-slate-500 hover:text-slate-700 dark:text-white/40 dark:hover:text-white/60">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
