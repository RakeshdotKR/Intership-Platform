import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Users, Download, Search, Mail, Phone, BookOpen, CheckCircle2, Clock } from 'lucide-react';
import React from 'react';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sR, bR] = await Promise.all([
          axios.get('/api/admin/students'),
          axios.get('/api/batches'),
        ]);
        setStudents(sR.data.students || []);
        setBatches(bR.data?.batches || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = students.length > 0 ? students.filter((s) => {
    const matchBatch = selectedBatch
      ? s.enrollments?.some((e) => e.batchId === parseInt(selectedBatch))
      : true;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.college?.toLowerCase().includes(q);
    return matchBatch && matchSearch;
  }) : [];

  const handleExport = async () => {
    if (!selectedBatch) return;
    try {
      const r = await axios.get(`/api/admin/export/${selectedBatch}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {selectedBatch && (
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download size={14} /> Export CSV
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <Input placeholder="Search by name, email, college..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="sm:w-64">
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.course?.title} — {new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Users size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground">
            {search || selectedBatch ? 'No students match your filters' : 'No students yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((student) => {
            const paid = student.enrollments?.some((e) => e.payment?.status === 'SUCCESS');
            const enrolledCourses = student.enrollments?.map((e) => e.batch?.course?.title).filter(Boolean);
            const enrollDate = student.enrollments?.[0]?.createdAt;
            return (
              <Card key={student.id} className="hover:border-border/60 transition-all">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-400 shrink-0">
                        {student.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{student.college} · {student.branch}</p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Mail size={11} />{student.email}</span>
                      {student.phone && <span className="flex items-center gap-1.5"><Phone size={11} />{student.phone}</span>}
                      {enrolledCourses?.length > 0 && (
                        <span className="flex items-center gap-1.5 max-w-45 truncate">
                          <BookOpen size={11} />{enrolledCourses[0]}
                          {enrolledCourses.length > 1 && <span className="text-indigo-400">+{enrolledCourses.length - 1}</span>}
                        </span>
                      )}
                      {enrollDate && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={11} />
                          {new Date(enrollDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <Badge variant={paid ? 'success' : 'warning'}>
                        {paid ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageStudents;
