import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import {
  BookOpen,
  Clock,
  IndianRupee,
  CalendarDays,
  ArrowRight,
  GraduationCap,
  X,
  Users,
  Layers,
  AlertCircle,
  Phone,
  MessageCircle,
  CheckCircle2,
  XCircle,
  CreditCard,
} from "lucide-react";
import React from "react";

// ─── Replace with your actual contact details ────────────────────────────────
const CONTACT_PHONE   = "+91-99999-99999";   // tel link number
const CONTACT_WA      = "919999999999";       // WhatsApp number (no + or -)
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  NOT_STARTED: { variant: "info",    label: "Upcoming"    },
  ONGOING:     { variant: "warning", label: "In Progress" },
  COMPLETED:   { variant: "success", label: "Completed"   },
};

const PAYMENT_STATUS_CONFIG = {
  PENDING:  { variant: "warning",  label: "Payment Pending",  color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10",   border: "border-amber-200 dark:border-amber-500/20" },
  SUCCESS:  { variant: "success",  label: "Payment Verified", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
  FAILED:   { variant: "destructive", label: "Payment Failed",   color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-500/10",       border: "border-red-200 dark:border-red-500/20" },
};

const fmt = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Starting soon";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const EnrollmentSkeleton = () => (
  <Card>
    <CardContent className="p-5 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
    </CardContent>
  </Card>
);

// ─── Payment Status Badge ─────────────────────────────────────────────────────
const PaymentStatusBadge = ({ status }) => {
  const cfg = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING;
  return (
    <Badge variant={cfg.variant} className="gap-1">
      {status === "SUCCESS" && <CheckCircle2 size={10} />}
      {status === "PENDING" && <Clock size={10} />}
      {status === "FAILED" && <XCircle size={10} />}
      {cfg.label}
    </Badge>
  );
};

// ─── Payment Status Banner ──────────────────────────────────────────────────────
const PaymentStatusBanner = ({ payment, compact = false }) => {
  if (!payment) return null;
  
  const cfg = PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.PENDING;
  
  if (payment.status === "SUCCESS") {
    return (
      <div className={`flex items-center gap-2 rounded-xl ${cfg.bg} border ${cfg.border} ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
        <CheckCircle2 size={compact ? 13 : 15} className={`${cfg.color} shrink-0`} />
        <span className={`font-semibold ${cfg.color} ${compact ? "text-xs" : "text-sm"}`}>
          Payment Verified ✓
        </span>
        {payment.paidAt && (
          <span className="text-xs text-emerald-500/60 ml-auto">
            {new Date(payment.paidAt).toLocaleDateString("en-IN")}
          </span>
        )}
      </div>
    );
  }

  if (payment.status === "FAILED") {
    return (
      <div className={`flex items-start gap-2 rounded-xl ${cfg.bg} border ${cfg.border} ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
        <XCircle size={compact ? 13 : 15} className={`${cfg.color} mt-0.5 shrink-0`} />
        <div className="flex flex-col gap-1 min-w-0">
          <span className={`font-semibold ${cfg.color} ${compact ? "text-xs" : "text-sm"}`}>
            Payment Failed
          </span>
          <span className={`${compact ? "text-xs" : "text-xs"} text-red-500/70 dark:text-red-400/60 leading-relaxed`}>
            Please contact admin to resolve.{" "}
            <a href={`tel:${CONTACT_PHONE}`} className="font-semibold underline underline-offset-2">
              {CONTACT_PHONE}
            </a>
          </span>
          {payment.transactionId && (
            <span className="text-[10px] text-red-400/40 font-mono truncate">
              Txn: {payment.transactionId}
            </span>
          )}
        </div>
      </div>
    );
  }

  // PENDING
  return (
    <div className={`flex items-start gap-2 rounded-xl ${cfg.bg} border ${cfg.border} ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
      <AlertCircle size={compact ? 13 : 15} className={`${cfg.color} mt-0.5 shrink-0`} />
      <div className="flex flex-col gap-1 min-w-0">
        <span className={`font-semibold ${cfg.color} ${compact ? "text-xs" : "text-sm"}`}>
          Payment Pending Verification
        </span>
        <span className={`${compact ? "text-xs" : "text-xs"} text-amber-600/80 dark:text-amber-400/70 leading-relaxed`}>
          Our team will confirm within 24 hrs. Need help?{" "}
          <a href={`tel:${CONTACT_PHONE.replace(/\D/g, "").replace(/^/, "+")}`} className="inline-flex items-center gap-0.5 font-semibold underline underline-offset-2">
            <Phone size={10} />
            {CONTACT_PHONE}
          </a>{" "}
          or{" "}
          <a href={`https://wa.me/${CONTACT_WA}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold underline underline-offset-2">
            <MessageCircle size={10} />
            WhatsApp us
          </a>
        </span>
        {payment.transactionId && (
          <span className="text-[10px] text-amber-500/60 dark:text-amber-400/40 font-mono truncate">
            Txn: {payment.transactionId}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Batch Detail Modal ───────────────────────────────────────────────────────
const BatchDetailModal = ({ enrollment, onClose }) => {
  const batch     = enrollment?.batch;
  const payment   = enrollment?.payment;
  const statusCfg = STATUS_CONFIG[batch?.status] || STATUS_CONFIG.NOT_STARTED;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full min-w-9/12 max-w-lg max-h-[78vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-black/10 overflow-hidden dark:border-white/10 dark:bg-[#0d0d1a] dark:shadow-black/60">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0 dark:border-white/8">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-base font-semibold text-slate-900 truncate dark:text-white">
                {batch?.name}
              </h2>
              <Badge variant={statusCfg.variant} className="shrink-0">
                {statusCfg.label}
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="ml-3 shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors dark:text-white/40 dark:hover:text-white/80 dark:hover:bg-white/5"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1">

            {/* Hero image */}
            {batch?.courses?.[0]?.image ? (
              <img
                src={batch.courses[0].image}
                alt={batch.courses[0].title}
                className="w-full h-40 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center dark:from-indigo-500/10 dark:to-violet-500/10">
                <BookOpen size={32} className="text-indigo-300 dark:text-white/15" />
              </div>
            )}

            <div className="flex flex-col gap-5 p-6">

              {/* Payment Status - PROMINENT at top */}
              {payment && (
                <div className="mb-1">
                  <PaymentStatusBanner payment={payment} />
                </div>
              )}

              {/* Key info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <CalendarDays size={13} />, label: "Start Date", value: fmt(batch?.startDate) },
                  { icon: <CalendarDays size={13} />, label: "End Date",   value: fmt(batch?.endDate)   },
                  {
                    icon: <IndianRupee size={13} />,
                    label: "Fee",
                    value: batch?.fee != null ? `₹${batch.fee.toLocaleString("en-IN")}` : "—",
                  },
                  {
                    icon: <Users size={13} />,
                    label: "Batch Size",
                    value: batch?.totalSeats ? `${batch.totalSeats} seats` : "—",
                  },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/4 dark:border-white/6"
                  >
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-white/40">
                      {icon}{label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {batch?.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 dark:text-white/30">
                      About this batch
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed dark:text-white/60">
                      {batch.description}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Courses included */}
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5 dark:text-white/30">
                  <Layers size={11} /> Courses Included
                </p>
                <div className="flex flex-col gap-2">
                  {batch?.courses?.length ? (
                    batch.courses.map((course, idx) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/4 dark:border-white/6"
                      >
                        <span className="shrink-0 w-6 h-6 rounded-md bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-600 dark:bg-indigo-500/15 dark:border-indigo-500/20 dark:text-indigo-400">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm text-slate-900 font-medium truncate dark:text-white">
                            {course.title}
                          </span>
                          {course.duration && (
                            <span className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 dark:text-white/40">
                              <Clock size={10} />{course.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-white/30">
                      No courses listed.
                    </p>
                  )}
                </div>
              </div>

              {/* Payment details section */}
              {payment && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5 dark:text-white/30">
                      <CreditCard size={11} /> Payment Details
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/4 dark:border-white/6">
                        <span className="text-xs text-slate-500 dark:text-white/40">Amount</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          ₹{payment.amount?.toLocaleString("en-IN") || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/4 dark:border-white/6">
                        <span className="text-xs text-slate-500 dark:text-white/40">Transaction ID</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white font-mono truncate">
                          {payment.transactionId || "—"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/4 dark:border-white/6">
                        <span className="text-xs text-slate-500 dark:text-white/40">Status</span>
                        <div className="mt-0.5">
                          <PaymentStatusBadge status={payment.status} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-white/4 dark:border-white/6">
                        <span className="text-xs text-slate-500 dark:text-white/40">Paid On</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {payment.paidAt ? fmt(payment.paidAt) : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Enrollment date */}
              {enrollment?.createdAt && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-white/30">
                    <span>Enrolled on</span>
                    <span className="text-slate-600 dark:text-white/50">
                      {fmt(enrollment.createdAt)}
                    </span>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Student Dashboard ────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [enrollments, setEnrollments]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  useEffect(() => {
    axios
      .get("/api/enrollments/my")
      .then((r) => setEnrollments(r.data.enrollments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setSelectedEnrollment(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const stats = {
    total:     enrollments.length,
    ongoing:   enrollments.filter((e) => e.batch?.status === "ONGOING").length,
    completed: enrollments.filter((e) => e.batch?.status === "COMPLETED").length,
  };

  return (
    <div className="min-h-screen">

      {/* ── Header ── */}
      <section className="relative py-12 border-b border-slate-200 dark:border-white/6">
        <div className="absolute inset-0 hero-gradient opacity-40" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1 dark:text-white/40">Welcome back</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {user?.name?.split(" ")[0]}'s Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1 dark:text-white/40">
                {user?.college} · {user?.branch}
              </p>
            </div>
            <Link to="/courses">
              <Button variant="gradient" className="gap-2">
                Browse More Courses <ArrowRight size={15} />
              </Button>
            </Link>
          </div>

          {!loading && enrollments.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { label: "Enrolled",    value: stats.total,     color: "text-indigo-600 dark:text-indigo-400"  },
                { label: "In Progress", value: stats.ongoing,   color: "text-amber-600 dark:text-amber-400"    },
                { label: "Completed",   value: stats.completed, color: "text-emerald-600 dark:text-emerald-400" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 dark:bg-white/5 dark:border-white/8"
                >
                  <span className={`text-lg font-bold ${color}`}>{value}</span>
                  <span className="text-sm text-slate-500 dark:text-white/40">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Content ── */}
      <div className="container mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <EnrollmentSkeleton key={i} />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-300 rounded-2xl dark:border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-5 dark:bg-indigo-500/10 dark:border-indigo-500/20">
              <GraduationCap size={26} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2 dark:text-white">
              No courses yet
            </h3>
            <p className="text-sm text-slate-500 mb-6 text-center max-w-xs dark:text-white/40">
              You haven't enrolled in any programs. Browse our courses and start your journey today.
            </p>
            <Link to="/courses">
              <Button variant="gradient" className="gap-2">
                Browse Programs <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-base font-semibold text-slate-900 mb-5 dark:text-white">
              My Enrolled Programs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.map((enrollment) => {
                const batch      = enrollment.batch;
                const payment    = enrollment.payment;
                const firstCourse = batch?.courses?.[0];
                const statusCfg  = STATUS_CONFIG[batch?.status] || STATUS_CONFIG.NOT_STARTED;
                const startDate  = batch?.startDate
                  ? new Date(batch.startDate).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })
                  : "Starting soon";

                return (
                  <Card
                    key={enrollment.id}
                    className="flex flex-col hover:border-slate-300 dark:hover:border-white/10 transition-all overflow-hidden"
                  >
                    {/* Course image */}
                    {firstCourse?.image ? (
                      <img
                        src={firstCourse.image}
                        alt={firstCourse.title}
                        className="h-36 w-full object-cover"
                      />
                    ) : (
                      <div className="h-36 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center dark:from-indigo-500/10 dark:to-violet-500/10">
                        <BookOpen size={28} className="text-indigo-300 dark:text-white/15" />
                      </div>
                    )}

                    <CardContent className="p-5 flex flex-col flex-1">
                      {/* Batch name + status */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug dark:text-white">
                          {batch?.name}
                        </h3>
                        <Badge variant={statusCfg.variant} className="shrink-0">
                          {statusCfg.label}
                        </Badge>
                      </div>

                      {/* Course tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {batch?.courses?.map((c) => (
                          <span
                            key={c.id}
                            className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded dark:text-white/40 dark:bg-white/5"
                          >
                            {c.title}
                          </span>
                        ))}
                      </div>

                      {/* Meta info */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mt-auto mb-4 dark:text-white/40">
                        <span className="flex items-center gap-1.5">
                          <Clock size={11} />{firstCourse?.duration || "—"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <IndianRupee size={11} />
                          {batch?.fee != null ? batch.fee.toLocaleString("en-IN") : "—"}
                        </span>
                        <span className="flex items-center gap-1.5 col-span-2">
                          <CalendarDays size={11} />Batch starts {startDate}
                        </span>
                      </div>

                      {/* Payment Status Banner on card */}
                      {payment && (
                        <div className="mb-3">
                          <PaymentStatusBanner payment={payment} compact />
                        </div>
                      )}

                      {/* View details button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-xs"
                        onClick={() => setSelectedEnrollment(enrollment)}
                      >
                        View Details <ArrowRight size={12} />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedEnrollment && (
        <BatchDetailModal
          enrollment={selectedEnrollment}
          onClose={() => setSelectedEnrollment(null)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;