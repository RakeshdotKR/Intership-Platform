import { useState, useEffect } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Search, BookOpen, SlidersHorizontal } from 'lucide-react';
import React from 'react';

const CourseSkeleton = () => (
  <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
    <Skeleton className="h-44 w-full rounded-none" />
    <div className="p-5 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-9 w-full mt-2" />
    </div>
  </div>
);

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('/api/courses');
        setCourses(response.data?.courses || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.techStack?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-16 border-b border-border">
        <div className="absolute inset-0 hero-gradient opacity-50" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <Badge variant="secondary" className="mb-4">
            <BookOpen size={11} className="mr-1" />
            Programs
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-pretty mb-3">
            Internship <span className="gradient-text">Programs</span>
          </h1>
          <p className=" mb-8 max-w-md mx-auto">
            Industry-aligned programs built to get you hired. Choose your path.
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="Search courses, skills, technologies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 py-10">
        {/* Results info */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filtered.length} program{filtered.length !== 1 ? 's' : ''} found
              {search && <span> for "<span className="text-foreground">{search}</span>"</span>}
            </p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <CourseSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-4">
              <Search size={24} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No courses found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {search ? `No results for "${search}". Try a different search.` : 'No courses available yet.'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="text-sm text-indigo-400 hover:text-indigo-300">
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
