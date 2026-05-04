import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import {
  Users, Download, Search, Mail, Phone, BookOpen, Clock,
  Plus, Pencil, Trash2, AlertCircle,
} from 'lucide-react';
import React from 'react';

const EMPTY_FORM = { name: '', email: '', phone: '', college: '', branch: '', year: '', password: '' };

const YEAR_OPTIONS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
];
const yearLabel = (y) => YEAR_OPTIONS.find((o) => o.value === String(y))?.label || (y ? `Year ${y}` : '');

const normalizeYear = (y) => {
  if (!y) return '';
  const s = String(y).trim();
  if (['1', '2', '3', '4'].includes(s)) return s;
  const byLabel = YEAR_OPTIONS.find((o) => o.label.toLowerCase() === s.toLowerCase());
  if (byLabel) return byLabel.value;
  const digit = s.match(/[1-4]/);
  return digit ? digit[0] : '';
};

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchData(); }, []);

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

  const filtered = students.filter((s) => {
    const matchBatch = selectedBatch
      ? s.enrollments?.some((e) => e.batchId === parseInt(selectedBatch))
      : true;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.college?.toLowerCase().includes(q);
    return matchBatch && matchSearch;
  });

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

  const openCreate = () => {
    setEditingStudent(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      college: student.college || '',
      branch: student.branch || '',
      year: normalizeYear(student.year),
      password: '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingStudent) {
        const payload = { name: formData.name, email: formData.email, phone: formData.phone, college: formData.college, branch: formData.branch, year: formData.year };
        const r = await axios.put(`/api/admin/students/${editingStudent.id}`, payload);
        setStudents((prev) => prev.map((s) => s.id === editingStudent.id ? r.data.student : s));
      } else {
        const r = await axios.post('/api/admin/students', formData);
        setStudents((prev) => [r.data.student, ...prev]);
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save student.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/admin/students/${deleteTarget.id}`);
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {selectedBatch && (
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download size={14} /> Export CSV
            </Button>
          )}
          <Button variant="gradient" onClick={openCreate} className="gap-2">
            <Plus size={15} /> Add Student
          </Button>
        </div>
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
            <option key={b.id} value={b.id}>{b.name}</option>
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
          <p className="text-muted-foreground mb-4">
            {search || selectedBatch ? 'No students match your filters' : 'No students yet'}
          </p>
          {!search && !selectedBatch && (
            <Button variant="outline" onClick={openCreate} className="gap-2">
              <Plus size={14} /> Add first student
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((student) => {
            const enrollments = student.enrollments || [];
            return (
              <Card key={student.id} className="hover:border-border/60 transition-all">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Avatar + info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/20 flex items-center justify-center text-sm font-bold text-indigo-500 dark:text-indigo-400 shrink-0">
                        {student.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">{student.name}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail size={11} />{student.email}</span>
                          {student.phone && <span className="flex items-center gap-1"><Phone size={11} />{student.phone}</span>}
                          {student.college && <span>{student.college}{student.branch ? ` · ${student.branch}` : ''}</span>}
                          {student.year && <span>{yearLabel(student.year)}</span>}
                        </div>

                        {/* Per-batch enrollment + payment status */}
                        {enrollments.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {enrollments.map((en) => {
                              const paid = en.payment?.status === 'SUCCESS';
                              const batchName = en.batch?.name || `Batch #${en.batchId}`;
                              return (
                                <div key={en.id} className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-muted/30 text-xs">
                                  <BookOpen size={10} className="text-muted-foreground shrink-0" />
                                  <span className="text-foreground/80">{batchName}</span>
                                  <Badge variant={paid ? 'success' : 'warning'} className="text-[10px] px-1.5 py-0">
                                    {paid ? 'Paid' : 'Pending'}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(student)}>
                        <Pencil size={12} /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setDeleteTarget(student)}>
                        <Trash2 size={12} /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-4 mb-6">
              {formError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{formError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input placeholder="Student full name" value={formData.name} onChange={f('name')} required />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="student@example.com" value={formData.email} onChange={f('email')} required />
                </div>
                {!editingStudent && (
                  <div className="col-span-2 space-y-1.5">
                    <Label>Password *</Label>
                    <Input type="password" placeholder="Minimum 6 characters" value={formData.password} onChange={f('password')} required minLength={6} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input placeholder="10-digit number" value={formData.phone} onChange={f('phone')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Year</Label>
                  <Select value={formData.year} onChange={f('year')}>
                    <option value="">Select year</option>
                    {YEAR_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>College</Label>
                  <Input placeholder="College name" value={formData.college} onChange={f('college')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Branch</Label>
                  <Input placeholder="e.g. CSE" value={formData.branch} onChange={f('branch')} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving ? 'Saving...' : editingStudent ? 'Save Changes' : 'Add Student'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-2">
            Are you sure you want to delete <span className="text-foreground font-medium">"{deleteTarget?.name}"</span>?
            All their enrollments and payments will also be removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageStudents;
