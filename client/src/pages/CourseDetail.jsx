import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import {
  Clock,
  IndianRupee,
  Users,
  CalendarDays,
  CheckCircle2,
  BookOpen,
  ArrowLeft,
  X,
  Shield,
  Award,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STATUS_BADGE = {
  NOT_STARTED: { variant: "info", label: "Upcoming" },
  ONGOING: { variant: "warning", label: "Ongoing" },
  COMPLETED: { variant: "success", label: "Completed" },
};
import React from "react";

const DetailSkeleton = () => (
  <div className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl space-y-8">
    <Skeleton className="h-6 w-24" />
    <Skeleton className="h-56 w-full rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  </div>
);

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [error, setError] = useState("");
  const [openWeek, setOpenWeek] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/api/courses/${id}`);
        const courseData = response.data?.course || response.data;
        setCourse(courseData);
        setSelectedBatch(courseData.batches?.[0] || null);

        if (isAuthenticated) {
          const enrollRes = await axios.get("/api/enrollments/my");
          const myEnrollments = enrollRes.data.enrollments || [];
          const alreadyIn = myEnrollments.some((e) =>
            e.batch?.courses?.some((c) => c.id === parseInt(id)),
          );
          setIsAlreadyEnrolled(alreadyIn);
        }
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, isAuthenticated]);

  const handleEnroll = () => {
    if (!isAuthenticated) return navigate("/login");
    if (!selectedBatch) return;
    setShowPayment(true);
  };

  const handlePayment = async () => {
    setEnrolling(true);
    setError("");
    try {
      const enrollRes = await axios.post("/api/enrollments", {
        batchId: selectedBatch.id,
      });
      // const payRes = await axios.post('/api/payments/initiate', { enrollmentId: enrollRes.data.enrollment.id });
      // await axios.post('/api/payments/confirm', { paymentId: payRes.data.payment.id });
      setEnrolled(true);
      setShowPayment(false);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.error || "Enrollment failed. Please try again.",
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!course)
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-muted-foreground mb-4">Course not found</p>
        <Link to="/courses">
          <Button variant="outline">Browse Courses</Button>
        </Link>
      </div>
    );

  const batch = selectedBatch;
  const seatsLeft = batch
    ? batch.totalSeats - (batch.enrollments?.length || batch.enrolledCount || 0)
    : 0;
  const startDate = batch?.startDate
    ? new Date(batch.startDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Starting soon";
  const displayFee = batch?.fee ?? course.fee;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to courses
        </button>

        {course.image && (
          <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-8 border border-border">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}

        <div
          className={`grid grid-cols-1 gap-8 ${batch ? "lg:grid-cols-3" : ""}`}
        >
          {/* Main content */}
          <div className={`space-y-8 ${batch ? "lg:col-span-2" : ""}`}>
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {batch?.status === "ONGOING" && (
                  <Badge variant="success">Live Batch</Badge>
                )}
                {batch?.status === "NOT_STARTED" && (
                  <Badge variant="info">Upcoming</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {course.title}
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Technologies Covered
              </h2>
              <div className="flex flex-wrap gap-2">
                {course.techStack?.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-sm text-indigo-500 dark:text-indigo-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Syllabus
              </h2>
              <div className="space-y-2">
                {course.syllabus?.map((week, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-muted/20 overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                      onClick={() => setOpenWeek(openWeek === i ? -1 : i)}
                    >
                      <span className="font-medium text-foreground text-sm">
                        Week {week.week}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {week.topics?.length} topics
                        </span>
                        {openWeek === i ? (
                          <ChevronUp
                            size={14}
                            className="text-muted-foreground"
                          />
                        ) : (
                          <ChevronDown
                            size={14}
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </button>
                    {openWeek === i && (
                      <div className="px-4 pb-4 border-t border-border">
                        <ul className="space-y-1.5 mt-3">
                          {week.topics?.map((topic, j) => (
                            <li
                              key={j}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle2
                                size={13}
                                className="text-emerald-500 shrink-0"
                              />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar card */}
          {batch && (
            <div className="lg:col-span-1">
              <Card className="sticky top-20 border-indigo-500/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {batch?.name && (
                      <p className="text-lg text-muted-foreground mt-1">
                        {batch.name}
                      </p>
                    )}
                    {/* <span className="text-muted-foreground text-sm font-normal mr-1">₹</span>
                  {displayFee?.toLocaleString('en-IN')} */}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        icon: Clock,
                        label: "Duration",
                        value: course.duration,
                      },
                      {
                        icon: CalendarDays,
                        label: "Start Date",
                        value: startDate,
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Icon size={14} />
                          {label}
                        </div>
                        <span className="text-foreground font-medium">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {[
                      "Certificate of completion",
                      "Placement support",
                      "Real project experience",
                      "Live mentorship sessions",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2
                          size={12}
                          className="text-emerald-500 shrink-0"
                        />
                        {item}
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {enrolled ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-emerald-500">
                      <CheckCircle2 size={16} />
                      <span className="text-sm font-medium">
                        Enrolled! Redirecting...
                      </span>
                    </div>
                  ) : isAlreadyEnrolled ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-2 py-2 text-emerald-500">
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-medium">
                          Already Enrolled
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate("/dashboard")}
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      onClick={handleEnroll}
                    >
                      Enroll Now
                    </Button>
                  )}

                  <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                    <Shield size={11} />
                    Secure payment
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Available Batches Slider */}
        {course.batches?.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Available Batches
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {course.batches.length} batch
                  {course.batches.length !== 1 ? "es" : ""} · click to select
                  for enrollment
                </p>
              </div>
              {course.batches.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      sliderRef.current?.scrollBy({
                        left: -320,
                        behavior: "smooth",
                      })
                    }
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={() =>
                      sliderRef.current?.scrollBy({
                        left: 320,
                        behavior: "smooth",
                      })
                    }
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {course.batches.map((b) => {
                const enrolledCount =
                  b.enrollments?.length || b.enrolledCount || 0;
                const seatsRemaining = b.totalSeats - enrolledCount;
                const pct =
                  b.totalSeats > 0
                    ? Math.round((enrolledCount / b.totalSeats) * 100)
                    : 0;
                const isSelected = selectedBatch?.id === b.id;
                const statusInfo =
                  STATUS_BADGE[b.status] || STATUS_BADGE.NOT_STARTED;
                const isFull = seatsRemaining <= 0;

                return (
                  <div
                    key={b.id}
                    onClick={() =>
                      !isFull && b.status !== "COMPLETED" && setSelectedBatch(b)
                    }
                    className={`snap-start shrink-0 w-72 rounded-2xl border p-4 transition-all ${
                      isFull || b.status === "COMPLETED"
                        ? "border-border bg-muted/5 opacity-60 cursor-not-allowed"
                        : isSelected
                          ? "border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/30 cursor-pointer"
                          : "border-border bg-muted/10 hover:border-border/70 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                      {isSelected && !isFull && b.status !== "COMPLETED" && (
                        <span className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                          <CheckCircle2 size={11} /> Selected
                        </span>
                      )}
                      {isFull && (
                        <span className="text-xs text-red-400">Full</span>
                      )}
                    </div>

                    <h3 className="font-semibold text-foreground text-sm mb-3 leading-snug">
                      {b.name}
                    </h3>

                    <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={11} />
                        <span>
                          {new Date(b.startDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-muted-foreground/40">→</span>
                        <span>
                          {new Date(b.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={11} />
                        <span>
                          {seatsRemaining} seats left of {b.totalSeats}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <IndianRupee size={11} />
                        <span>₹{b.fee?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : "bg-indigo-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground/60">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Payment modal */}
      {showPayment && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPayment(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md dark:bg-black bg-white -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Complete Enrollment
              </h2>
              <button
                onClick={() => setShowPayment(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Course</span>
                <span className="text-foreground font-medium">
                  {course.title}
                </span>
              </div>
              {batch?.name && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Batch</span>
                  <span className="text-muted-foreground">{batch.name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="text-muted-foreground">{course.duration}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-foreground font-bold text-lg">
                  ₹{displayFee?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* QR Code */}
            {batch?.QrImage && (
              <div className="flex flex-col items-center gap-2 mb-6">
                <p className="text-sm text-muted-foreground">Scan to pay</p>
                <img
                  src={batch.QrImage}
                  alt="Payment QR"
                  className="w-48 h-48 object-contain rounded-xl border border-border p-2 bg-white"
                />
                <p className="text-xs text-center text-muted-foreground leading-relaxed">
                  Scan and make payment. Once completed, await confirmation from
                  admin.
                  <br />
                  <span className="text-muted-foreground/60">
                    Confirmation within 24 hours.
                  </span>
                </p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={handlePayment}
                disabled={enrolling}
              >
                {enrolling ? "Processing..." : "Confirm & Pay"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowPayment(false)}
              >
                Cancel
              </Button>
            </div>
            {/* ✅ "Demo payment" line removed */}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseDetail;
