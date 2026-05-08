import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import {
  Plus, Calendar, Users, PlayCircle, CheckCircle2, Clock,
  X, Mail, Phone, IndianRupee, Pencil, Trash2, BookOpen,
} from 'lucide-react';
import React from 'react';

const STATUS_BADGE = {
  NOT_STARTED: { variant: 'info', label: 'Upcoming' },
  ONGOING: { variant: 'warning', label: 'Ongoing' },
  COMPLETED: { variant: 'success', label: 'Completed' },
};

const EMPTY_FORM = { name: '', description: '', fee: '', courseIds: [], startDate: '', endDate: '', totalSeats: '100', status: 'NOT_STARTED' };

const ManageBatches = () => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [detailBatch, setDetailBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bR, cR] = await Promise.all([
        axios.get('/api/batches'),
        axios.get('/api/courses'),
      ]);
      setBatches(bR.data?.batches || []);
      setCourses(cR.data?.courses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditBatch(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (batch, e) => {
    e.stopPropagation();
    setEditBatch(batch);
    setFormData({
      name: batch.name,
      description: batch.description || '',
      fee: String(batch.fee),
      courseIds: batch.courses.map(c => c.id),
      startDate: batch.startDate ? new Date(batch.startDate).toISOString().split('T')[0] : '',
      endDate: batch.endDate ? new Date(batch.endDate).toISOString().split('T')[0] : '',
      totalSeats: String(batch.totalSeats),
      status: batch.status || 'NOT_STARTED',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const toggleCourse = (courseId) => {
    setFormData(prev => {
      const ids = prev.courseIds.includes(courseId)
        ? prev.courseIds.filter(id => id !== courseId)
        : [...prev.courseIds, courseId];
      return { ...prev, courseIds: ids };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.name.trim()) return setFormError('Batch name is required.');
    if (formData.courseIds.length === 0) return setFormError('Select at least one course.');
    if (!formData.startDate) return setFormError('Start date is required.');
    if (!formData.endDate) return setFormError('end date is required.');

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        fee: parseFloat(formData.fee) || 0,
        courseIds: formData.courseIds,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalSeats: parseInt(formData.totalSeats) || 100,
        status: formData.status,
      };
      if (editBatch) {
        await axios.put(`/api/batches/${editBatch.id}`, payload);
      } else {
        await axios.post('/api/batches', payload);
      }
      setDialogOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save batch.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/batches/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/batches/${id}/status`, { status });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const openBatchDetail = async (batch) => {
    setDetailBatch(batch);
    setDetailLoading(true);
    setBatchStudents([]);
    try {
      const r = await axios.get(`/api/enrollments/batch/${batch.id}`);
      setBatchStudents(r.data.enrollments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Batches</h1>
          <p className="text-sm text-muted-foreground mt-1">{batches.length} batch{batches.length !== 1 ? 'es' : ''} total</p>
        </div>
        <Button variant="gradient" onClick={openCreate} className="gap-2">
          <Plus size={15} /> New Batch
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Calendar size={22} className="text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground mb-4">No batches yet</p>
          <Button variant="outline" onClick={openCreate} className="gap-2">
            <Plus size={14} /> Create first batch
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch) => {
            const statusInfo = STATUS_BADGE[batch.status] || STATUS_BADGE.NOT_STARTED;
            const enrolled = batch.enrollments?.length || 0;
            const pct = batch.totalSeats > 0 ? Math.round((enrolled / batch.totalSeats) * 100) : 0;
            return (
              <Card key={batch.id} className="hover:border-border/60 transition-all cursor-pointer" onClick={() => openBatchDetail(batch)}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Name + status */}
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{batch.name}</h3>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>

                      {/* Description */}
                      {batch.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{batch.description}</p>
                      )}

                      {/* Courses */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {batch.courses?.map(c => (
                          <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400">
                            <BookOpen size={10} /> {c.title}
                          </span>
                        ))}
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(batch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={12} />
                          {enrolled} / {batch.totalSeats}
                        </span>
                        <span className="flex items-center gap-1.5 text-emerald-500">
                          <IndianRupee size={12} />
                          {batch.fee?.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground/60">{pct}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                      {batch.status === 'NOT_STARTED' && (
                        <Button variant="success" size="sm" className="gap-1.5" onClick={() => updateStatus(batch.id, 'ONGOING')}>
                          <PlayCircle size={13} /> Start
                        </Button>
                      )}
                      {batch.status === 'ONGOING' && (
                        <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => updateStatus(batch.id, 'COMPLETED')}>
                          <CheckCircle2 size={13} /> Complete
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={e => openEdit(batch, e)}>
                        <Pencil size={13} />
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-1.5" onClick={e => { e.stopPropagation(); setDeleteTarget(batch); }}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Batch Detail Modal */}
      {detailBatch && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setDetailBatch(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl max-h-[85vh] -translate-x-1/2 dark:bg-black/60 bg-white/90 -translate-y-1/2 rounded-2xl border border-border bg-card flex flex-col shadow-2xl">
            <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{detailBatch.name}</h2>
                {detailBatch.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{detailBatch.description}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar size={12} />
                    {new Date(detailBatch.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5"><Calendar size={12} />
                    {new Date(detailBatch.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5"><Users size={12} />
                    {detailBatch.enrollments?.length || 0} / {detailBatch.totalSeats} seats
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <IndianRupee size={12} />₹{detailBatch.fee?.toLocaleString('en-IN')}
                  </span>
                  <Badge variant={STATUS_BADGE[detailBatch.status]?.variant}>{STATUS_BADGE[detailBatch.status]?.label}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {detailBatch.courses?.map(c => (
                    <span key={c.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400">
                      <BookOpen size={10} /> {c.title}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setDetailBatch(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Enrolled Students ({batchStudents.length})
              </h3>
              {detailLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
                  ))}
                </div>
              ) : batchStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/50">
                  <Users size={28} className="mb-3" />
                  <p className="text-sm">No students enrolled yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {batchStudents.map((enrollment) => {
                    const s = enrollment.student;
                    const paid = enrollment.payment?.status === 'SUCCESS';
                    return (
                      <div key={enrollment.id} className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-muted/20 border border-border">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-500 dark:text-indigo-400 shrink-0">
                            {s?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{s?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{s?.college} · {s?.branch}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                          <span className="hidden sm:flex items-center gap-1"><Mail size={11} />{s?.email}</span>
                          {s?.phone && <span className="hidden md:flex items-center gap-1"><Phone size={11} />{s?.phone}</span>}
                          <Badge variant={paid ? 'success' : 'warning'}>{paid ? 'Paid' : 'Pending'}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editBatch ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto pr-1">

              <div className="space-y-1.5">
                <Label>Batch Name *</Label>
                <Input
                  placeholder="e.g. Full Stack Batch 2025 A"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description of this batch…"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Batch Fee (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 4500"
                  value={formData.fee}
                  onChange={e => setFormData({ ...formData, fee: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Courses Included * <span className="text-muted-foreground/60 font-normal">(select one or more)</span></Label>
                <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2 max-h-44 overflow-y-auto">
                  {courses.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 text-center py-2">No courses available</p>
                  ) : courses.map(c => {
                    const checked = formData.courseIds.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => toggleCourse(c.id)}
                          className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-colors cursor-pointer ${
                            checked
                              ? 'bg-indigo-500 border-indigo-500'
                              : 'border-border bg-muted group-hover:border-indigo-400/50'
                          }`}
                        >
                          {checked && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        <span className="text-sm text-foreground/80 leading-snug select-none" onClick={() => toggleCourse(c.id)}>
                          {c.title}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Total Seats *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.totalSeats}
                    onChange={e => setFormData({ ...formData, totalSeats: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status *</Label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="flex h-9 w-full bg-black rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option className='' value="NOT_STARTED">Upcoming</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving ? (editBatch ? 'Saving…' : 'Creating…') : (editBatch ? 'Save Changes' : 'Create Batch')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Batch</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete <span className="text-foreground font-medium">"{deleteTarget?.name}"</span>?
            This will also remove all enrollments in this batch.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete Batch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBatches;
