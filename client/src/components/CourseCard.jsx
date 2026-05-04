import { Link } from 'react-router-dom';
import { Clock, IndianRupee, Users, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import React from 'react';

const PLACEHOLDER_COLORS = [
  'from-indigo-600/30 to-violet-600/30',
  'from-blue-600/30 to-cyan-600/30',
  'from-purple-600/30 to-pink-600/30',
  'from-amber-600/30 to-orange-600/30',
  'from-emerald-600/30 to-teal-600/30',
  'from-rose-600/30 to-pink-600/30',
];

const CourseCard = ({ course, index = 0 }) => {
  const batch = course.batches?.[0];
  const seatsLeft = batch ? batch.totalSeats - (batch.enrollments?.length || batch.enrolledCount || 0) : null;
  const startDate = batch?.startDate ? new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Starting soon';
  const colorClass = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];

  return (
    <Card className="group flex flex-col overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Image / Placeholder */}
      <div className="relative h-44 overflow-hidden">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-linear-to-br ${colorClass} flex items-center justify-center`}>
            <BookOpen size={40} className="text-white/30" />
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        {/* <div className="absolute top-3 left-3 flex gap-2">
          {batch?.status === 'ONGOING' && (
            <Badge variant="success" className="text-xs">Live Now</Badge>
          )}
          {batch?.status === 'NOT_STARTED' && (
            <Badge variant="info" className="text-xs">Upcoming</Badge>
          )}
          {seatsLeft !== null && seatsLeft <= 20 && seatsLeft > 0 && (
            <Badge variant="warning" className="text-xs">Only {seatsLeft} left</Badge>
          )}
        </div> */}
      </div>

      <CardContent className="p-5 flex flex-col flex-1">
        {/* Tech stack tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {course.techStack?.slice(0, 3).map((tech) => (
            <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {tech}
            </span>
          ))}
          {course.techStack?.length > 3 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              +{course.techStack.length - 3}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-foreground text-base mb-2 leading-snug group-hover:text-indigo-500 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1">
          {course.description}
        </p>

        {/* Meta info */}
        {/* <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Clock size={12} className="text-white/30" />
            {course.duration}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <IndianRupee size={12} className="text-white/30" />
            {course.fee?.toLocaleString('en-IN')}
          </div>
          {seatsLeft !== null && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Users size={12} className="text-white/30" />
              {seatsLeft} seats left
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <span className="text-white/20">Starts</span> {startDate}
          </div>
        </div> */}

        <Link to={`/courses/${course.id}`}>
          <Button variant="outline" size="sm" className="w-full gap-1.5 group/btn">
            View Details
            <ArrowRight size={13} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
