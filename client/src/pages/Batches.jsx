import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import {
  Calendar, IndianRupee, Users, CheckCircle2, BookOpen,
  Search, Shield, X
} from 'lucide-react';
import React from 'react';

const STATUS_CONFIG = {
  NOT_STARTED: { variant: 'info', label: 'Upcoming' },
  ONGOING: { variant: 'warning', label: 'Live Now' },
  COMPLETED: { variant: 'success', label: 'Completed' },
};

const BatchSkeleton = () => (
  <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
    <div className="flex gap-2"><Skeleton className="h-5 w-20 rounded-full" /></div>
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <div className="flex gap-2"><Skeleton className="h-6 w-24 rounded-full" /><Skeleton className="h-6 w-20 rounded-full" /></div>
    <div className="grid grid-cols-2 gap-2"><Skeleton className="h-4" /><Skeleton className="h-4" /></div>
    <Skeleton className="h-9 w-full" />
  </div>
);

const Batches = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [enrollTarget, setEnrollTarget] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(null);
  const [enrollError, setEnrollError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bRes = await axios.get('/api/batches');
        const all = bRes.data?.batches || [];
        setBatches(all.filter(b => b.status !== 'COMPLETED'));

        if (isAuthenticated) {
          const eRes = await axios.get('/api/enrollments/my');
          setMyEnrollments(eRes.data.enrollments || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const isEnrolled = (batchId) =>
    myEnrollments.some(e => e.batchId === batchId || e.batch?.id === batchId);

  const filtered = batches.filter(b => {
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q) ||
      b.courses?.some(c => c.title.toLowerCase().includes(q))
    );
  });

  const openEnroll = (batch) => {
    if (!isAuthenticated) return navigate('/login');
    setEnrollTarget(batch);
    setEnrollError('');
    setEnrolled(null);
  };

  const confirmEnroll = async () => {
    if (!enrollTarget) return;
    setEnrolling(true);
    setEnrollError('');
    try {
      const eRes = await axios.post('/api/enrollments', { batchId: enrollTarget.id });
      const pRes = await axios.post('/api/payments/initiate', { enrollmentId: eRes.data.enrollment.id });
      await axios.post('/api/payments/confirm', { paymentId: pRes.data.payment.id });
      setEnrolled(enrollTarget.id);
      setMyEnrollments(prev => [...prev, { batchId: enrollTarget.id, batch: enrollTarget }]);
      setTimeout(() => {
        setEnrollTarget(null);
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setEnrollError(err.response?.data?.error || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-16 border-b border-border">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <Badge variant="secondary" className="mb-4">
            <Calendar size={11} className="mr-1" />
            Batches
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Available <span className="gradient-text">Batches</span>
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Enroll in a batch that bundles multiple programs at one fee. Start learning together.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search batches or courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <BatchSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-4">
              <Calendar size={24} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No batches found</h3>
            <p className="text-sm text-muted-foreground">
              {search ? `No results for "${search}".` : 'No active batches available right now.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-sm text-indigo-400 hover:text-indigo-300 mt-3">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((batch) => {
              const statusCfg = STATUS_CONFIG[batch.status] || STATUS_CONFIG.NOT_STARTED;
              const enrolledBatch = isEnrolled(batch.id);
              const seats = batch.seatsLeft ?? (batch.totalSeats - (batch.enrollments?.length || batch.enrolledCount || 0));
              const startDate = batch.startDate
                ? new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Starting soon';

              return (
                <Card key={batch.id} className="flex flex-col hover:border-indigo-500/30 transition-all hover:-translate-y-0.5">
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                      {enrolledBatch && <Badge variant="success">Enrolled</Badge>}
                    </div>

                    <h3 className="font-semibold text-foreground text-base mb-1 leading-snug">{batch.name}</h3>
                    {batch.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{batch.description}</p>
                    )}

                    {/* Courses included */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {batch.courses?.map(c => (
                        <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                          <BookOpen size={10} /> {c.title}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                   {/* Meta */}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-muted-foreground mb-5">
                      <span className="flex items-center gap-2 flex-wrap col-span-2">
                        <span className="line-through text-muted-foreground">
                          ₹5,000
                        </span>
                    
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                          ~33% OFF
                        </span>
                    
                        <span className="text-emerald-500 font-medium">
                          ₹{batch.fee?.toLocaleString('en-IN')}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={11} />
                        {seats > 0 ? `${seats} seats left` : 'Full'}
                      </span>
                      <span className="flex items-center gap-1.5 col-span-2">
                        <Calendar size={11} />
                        Starts {startDate}
                      </span>
                    </div>

                    <div className="mt-auto">
                      {enrolledBatch ? (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/dashboard')}>
                          Go to Dashboard
                        </Button>
                      ) : seats <= 0 ? (
                        <Button variant="outline" size="sm" className="w-full" disabled>
                          Batch Full
                        </Button>
                      ) : (
                        <Button variant="gradient" size="sm" className="w-full" onClick={() => openEnroll(batch)}>
                          Enroll Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Enroll Modal */}
      {enrollTarget && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => !enrolling && setEnrollTarget(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Complete Enrollment</h2>
              {!enrolling && (
                <button
                  onClick={() => setEnrollTarget(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {enrolled === enrollTarget.id ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 size={40} className="text-emerald-500" />
                <p className="text-foreground font-medium">Enrolled successfully!</p>
                <p className="text-sm text-muted-foreground">Redirecting to dashboard…</p>
              </div>
            ) : (
              <>
                {/* Summary rows */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Course</span>
                    <span className="text-foreground font-medium text-right max-w-[60%]">
                      {enrollTarget.courses?.map(c => c.title).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Batch</span>
                    <span className="text-foreground font-medium">{enrollTarget.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="text-foreground font-medium">
                      {enrollTarget.startDate && enrollTarget.endDate
                        ? Math.ceil(
                            (new Date(enrollTarget.endDate) - new Date(enrollTarget.startDate))
                            / (1000 * 60 * 60 * 24 * 30)
                          ) + ' months'
                        : '—'}
                    </span>
                  </div>
                  <Separator />
             <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Total Amount</span>
              
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      ₹5,000
                    </span>
              
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                      ~33% OFF
                    </span>
                  </div>
              
                  <span className="text-emerald-500 font-bold text-lg">
                    ₹{enrollTarget.fee?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
                  </div>

                {/* QR Code */}
                {enrollTarget.QrImage && (
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <p className="text-sm text-muted-foreground">Scan to pay</p>
                    <img
                      src={enrollTarget.QrImage}
                      alt="Payment QR"
                      className="w-48 h-48 object-contain rounded-xl border border-border p-2 bg-white"
                    />
                    <p className="text-xs text-center text-muted-foreground leading-relaxed">
                      Scan and make payment. Once completed, await confirmation from admin.
                      <br />
                      <span className="text-muted-foreground/60">Confirmation within 24 hours.</span>
                    </p>
                  </div>
                )}

                {enrollError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                    {enrollError}
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    onClick={confirmEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Processing...' : 'Confirm & Pay'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setEnrollTarget(null)}
                    disabled={enrolling}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Batches;
