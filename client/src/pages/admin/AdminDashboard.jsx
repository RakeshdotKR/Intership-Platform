import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Users, IndianRupee, PlayCircle, CheckCircle, BookOpen, Calendar, ArrowRight, Clock } from 'lucide-react';
import React from 'react';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <Card className="hover:border-border/60 transition-all">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </CardContent>
  </Card>
);

const QuickLink = ({ to, icon: Icon, label, desc, color }) => (
  <Link to={to}>
    <Card className="group hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
      <CardContent className="p-6">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
          <Icon size={18} className="text-indigo-400" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">{label}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <div className="flex items-center gap-1 mt-3 text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Manage <ArrowRight size={11} />
        </div>
      </CardContent>
    </Card>
  </Link>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then((r) => setStats(r.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { icon: Users, label: 'Total Students', value: stats.totalStudents, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { icon: IndianRupee, label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Clock, label: 'Upcoming Batches', value: stats.upcomingBatches, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { icon: PlayCircle, label: 'Ongoing Batches', value: stats.ongoingBatches, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: CheckCircle, label: 'Completed Batches', value: stats.completedBatches, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ] : [];

  const quickLinks = [
    { to: '/admin/courses', icon: BookOpen, label: 'Manage Courses', desc: 'Create, edit, and delete courses', color: 'bg-indigo-500/10 border border-indigo-500/20' },
    { to: '/admin/batches', icon: Calendar, label: 'Manage Batches', desc: 'Create batches and update status', color: 'bg-amber-500/10 border border-amber-500/20' },
    { to: '/admin/students', icon: Users, label: 'Manage Students', desc: 'View enrolled students and export data', color: 'bg-emerald-500/10 border border-emerald-500/20' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-4 w-24 mb-4" /><Skeleton className="h-8 w-16" /></CardContent></Card>
            ))
          : statCards.map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Quick links */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((q) => <QuickLink key={q.label} {...q} />)}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
