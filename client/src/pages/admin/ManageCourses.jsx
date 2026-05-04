import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Separator } from '../../components/ui/separator';
import ImageUpload from '../../components/ImageUpload';
import { Plus, Pencil, Trash2, BookOpen, Clock, IndianRupee, AlertCircle } from 'lucide-react';
import React from 'react';

const EMPTY_FORM = {
  title: '', description: '', fee: '', duration: '',
  techStack: '', syllabus: '', image: '',
};

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const r = await axios.get('/api/courses');
      setCourses(r.data.courses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingCourse(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      fee: String(course.fee),
      duration: course.duration,
      techStack: course.techStack?.join(', ') || '',
      syllabus: JSON.stringify(course.syllabus, null, 2),
      image: course.image || '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      let syllabusData;
      try {
        syllabusData = JSON.parse(formData.syllabus);
      } catch {
        setFormError('Syllabus must be valid JSON array.');
        setSaving(false);
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        fee: parseFloat(formData.fee),
        duration: formData.duration,
        techStack: formData.techStack.split(',').map((t) => t.trim()).filter(Boolean),
        syllabus: syllabusData,
        image: formData.image || null,
      };

      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse.id}`, payload);
      } else {
        await axios.post('/api/courses', payload);
      }

      setDialogOpen(false);
      fetchCourses();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (course) => {
    setDeleteTarget(course);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/courses/${deleteTarget.id}`);
      setDeleteDialogOpen(false);
      fetchCourses();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const f = (k) => (e) => setFormData({ ...formData, [k]: e.target.value });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">{courses.length} program{courses.length !== 1 ? 's' : ''} available</p>
        </div>
        <Button variant="gradient" onClick={openCreate} className="gap-2">
          <Plus size={15} /> New Course
        </Button>
      </div>

      {/* Course grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-32 w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <BookOpen size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground mb-4">No courses yet</p>
          <Button variant="outline" onClick={openCreate} className="gap-2">
            <Plus size={14} /> Create your first course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden hover:border-border/60 transition-all">
              {course.image ? (
                <img src={course.image} alt={course.title} className="h-36 w-full object-cover" />
              ) : (
                <div className="h-36 bg-linear-to-br from-indigo-500/10 to-violet-500/10 flex items-center justify-center">
                  <BookOpen size={30} className="text-muted-foreground/20" />
                </div>
              )}
              <CardContent className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{course.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Clock size={11} />{course.duration}</span>
                  <span className="flex items-center gap-1"><IndianRupee size={11} />{course.fee?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(course)}>
                    <Pencil size={12} /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1 gap-1.5" onClick={() => confirmDelete(course)}>
                    <Trash2 size={12} /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'New Course'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave}>
            <div className="space-y-5">
              {formError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{formError}</p>
                </div>
              )}

              {/* Image */}
              <div className="space-y-1.5">
                <Label>Course Image</Label>
                <ImageUpload value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Title *</Label>
                  <Input placeholder="e.g. Full Stack Web Development" value={formData.title} onChange={f('title')} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Duration *</Label>
                  <Input placeholder="e.g. 3 months" value={formData.duration} onChange={f('duration')} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Fee (₹) *</Label>
                  <Input type="number" placeholder="4500" value={formData.fee} onChange={f('fee')} required min="0" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Tech Stack <span className="text-muted-foreground/60">(comma-separated)</span></Label>
                  <Input placeholder="React, Node.js, PostgreSQL" value={formData.techStack} onChange={f('techStack')} required />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Description *</Label>
                  <Textarea placeholder="Describe the course..." value={formData.description} onChange={f('description')} rows={3} required />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>
                    Syllabus <span className="text-muted-foreground/60">(JSON array)</span>
                  </Label>
                  <Textarea
                    placeholder={'[{"week": 1, "topics": ["HTML", "CSS"]}, {"week": 2, "topics": ["JavaScript"]}]'}
                    value={formData.syllabus}
                    onChange={f('syllabus')}
                    rows={5}
                    className="font-mono text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">
            Are you sure you want to delete <span className="text-foreground font-medium">"{deleteTarget?.title}"</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCourses;
