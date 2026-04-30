import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FileText, Plus, Search, Filter, Edit, Trash2, Eye,
  X, ChevronDown, CheckCircle, AlertCircle, Calendar,
  Loader2, Layers, RefreshCw, Save
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import api from "../../../../config/api";
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";

// ─── Badge ─────────────────────────────────────────────────────────────────
const Badge = ({ type }) => {
  const cfg = {
    required: 'bg-primary/10 text-primary border border-primary/20',
    optional: 'bg-gray-500/10 text-gray-500 border border-gray-400/20',
    active: 'bg-emerald-500/10 text-emerald-600 border border-emerald-400/20',
    inactive: 'bg-red-500/10 text-red-500 border border-red-400/20',
  }[type] || '';
  const label = { required: 'REQUIRED', optional: 'OPTIONAL', active: 'ACTIVE', inactive: 'INACTIVE' }[type] || type;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg}`}>
      {label}
    </span>
  );
};

export default function DocumentMaster() {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocument, setNewDocument] = useState({ name: "", mandatory: false });
  const [isEditMode, setIsEditMode] = useState(false);

  // ─── STYLES — matching StudentList ────────────────────────────────────────
  const panel = isDark ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200';
  const card = `rounded-3xl border shadow-sm transition-all ${panel}`;
  const input = `w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium ${isDark ? 'bg-[#1A1A1A] border-white/10 text-white focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'}`;
  const label = `block text-[10px] font-black uppercase mb-1 tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
  const thCell = `px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-500'}`;
  const tdCell = `px-8 py-6 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const trHover = `border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-100 hover:bg-slate-50'}`;

  // ─── API ───────────────────────────────────────────────────────────────
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/documents-master/all');
      setDocuments(response.data || []);
    } catch {
      toast.error('Failed to fetch documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'active' && doc.active)
      || (statusFilter === 'inactive' && !doc.active);
    return matchesSearch && matchesStatus;
  });

  const openCreate = () => {
    setIsEditMode(false);
    setNewDocument({ name: "", mandatory: false });
    setSelectedDocument(null);
    setShowCreateModal(true);
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;
    try {
      await api.patch(`/api/documents-master/deactivate/${selectedDocument.id}`);
      fetchDocuments();
      setShowDeleteModal(false);
      setSelectedDocument(null);
      toast.success('Document deactivated successfully');
    } catch {
      toast.error('Failed to deactivate document');
    }
  };

  const handleCreate = async () => {
    if (!newDocument.name.trim()) { toast.error("Please enter document name"); return; }
    try {
      await api.post('/api/documents-master/add', { name: newDocument.name, mandatory: newDocument.mandatory });
      fetchDocuments();
      setNewDocument({ name: "", mandatory: false });
      setShowCreateModal(false);
      toast.success("Document created successfully");
    } catch { toast.error("Failed to create document"); }
  };

  const handleUpdate = async () => {
    if (!newDocument.name.trim()) { toast.error("Please enter document name"); return; }
    try {
      await api.put(`/api/documents-master/update/${selectedDocument.id}`, {
        name: newDocument.name, mandatory: newDocument.mandatory
      });
      fetchDocuments();
      setShowCreateModal(false);
      setSelectedDocument(null);
      setIsEditMode(false);
      setNewDocument({ name: "", mandatory: false });
      toast.success("Document updated successfully");
    } catch { toast.error("Failed to update document"); }
  };

  return (
    <div className="min-h-screen pb-24">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1A1A1A' : '#fff',
            color: isDark ? '#fff' : '#000',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px', fontSize: '13px', fontWeight: 600,
          },
        }}
      />

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
            <FileText className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-heading font-black tracking-tighter uppercase">
              Document <span className="text-primary">Master</span>
            </h1>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Document Management &amp; Configuration · <AutoBreadcrumb />
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="h-14 px-6 bg-primary text-white rounded-2xl font-black uppercase text-button tracking-widest flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Create Document
        </button>
      </header>

      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <div className={`${card} overflow-hidden mb-6`}>
        <div className="p-6 border-b border-white/5 flex items-center gap-2 bg-primary/5">
          <Layers size={15} className="text-primary" />
          <h3 className="font-black uppercase text-title-table tracking-widest">Filter &amp; Search</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className={label}>Search Documents</label>
              <div className="relative">
                <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search by document name…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${input} pl-9`}
                />
              </div>
            </div>
            {/* Status Filter */}
            <div>
              <label className={label}>Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`${input} appearance-none pr-8`}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
              </div>
            </div>
          </div>

          {/* Stats chips */}
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-dashed border-gray-200/30">
            {[
              { label: 'Total', value: documents.length, color: 'bg-primary/10 text-primary border-primary/20' },
              { label: 'Active', value: documents.filter(d => d.active).length, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20' },
              { label: 'Inactive', value: documents.filter(d => !d.active).length, color: 'bg-red-500/10 text-red-500 border-red-400/20' },
              { label: 'Mandatory', value: documents.filter(d => d.mandatory).length, color: 'bg-amber-500/10 text-amber-600 border-amber-400/20' },
            ].map(({ label: l, value, color }) => (
              <div key={l} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${color}`}>
                <span>{l}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Documents Table ──────────────────────────────────────────────── */}
      <div className={`${card} overflow-hidden`}>
        {/* Table header bar */}
        <div className={`p-6 border-b flex items-center justify-between bg-primary/5
          ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 text-primary">
            <FileText size={15} />
            <h3 className="font-black uppercase text-title-table tracking-widest">Documents Registry</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
              {filteredDocuments.length} records
            </span>
            <button
              onClick={fetchDocuments}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all
                ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/10' : 'border-slate-200 text-gray-500 hover:bg-slate-50'}`}
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'} text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                <th className={`${thCell} w-10`}>#</th>
                <th className={thCell}>Document Name</th>
                <th className={thCell}>Type</th>
                <th className={thCell}>Status</th>
                <th className={thCell}>Created</th>
                <th className={`${thCell} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 size={24} className="animate-spin text-primary" />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading documents…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <FileText size={36} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-sm font-black uppercase tracking-widest opacity-30 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {searchTerm || statusFilter !== 'all' ? 'No documents match your filters' : 'No documents found'}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or status filter' : 'Click Create Document to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc, idx) => (
                  <tr key={doc.id} className={trHover}>
                    <td className={`${tdCell} font-black text-primary/40`}>{String(idx + 1).padStart(2, '0')}</td>
                    <td className={tdCell}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isDark ? 'bg-primary/10' : 'bg-primary/5'}`}>
                          <FileText size={15} className="text-primary" />
                        </div>
                        <span className="font-semibold">{doc.name || 'Unnamed Document'}</span>
                      </div>
                    </td>
                    <td className={tdCell}>
                      <Badge type={doc.mandatory ? 'required' : 'optional'} />
                    </td>
                    <td className={tdCell}>
                      <Badge type={doc.active ? 'active' : 'inactive'} />
                    </td>
                    <td className={`${tdCell} font-medium`}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="opacity-40" />
                        {doc.createdAt
                          ? new Date(doc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </div>
                    </td>
                    <td className={`${tdCell} text-center`}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setIsEditMode(true);
                            setSelectedDocument(doc);
                            setNewDocument({ name: doc.name, mandatory: doc.mandatory });
                            setShowCreateModal(true);
                          }}
                          className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-amber-500/10 text-amber-500' : 'hover:bg-amber-50 text-amber-600'}`}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => { setSelectedDocument(doc); setShowDeleteModal(true); }}
                          className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
                          title="Deactivate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        {!loading && filteredDocuments.length > 0 && (
          <div className={`flex items-center gap-4 px-8 py-4 border-t ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/50'}`}>
            <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Summary:</span>
            <span className="text-[11px] font-bold text-primary">{filteredDocuments.length} Total</span>
            <span className={`text-[11px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              · {filteredDocuments.filter(d => d.active).length} Active
              · {filteredDocuments.filter(d => d.mandatory).length} Mandatory
            </span>
          </div>
        )}
      </div>

      {/* ── Delete / Deactivate Modal ────────────────────────────────────── */}
      {showDeleteModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl border shadow-2xl max-w-md w-full ${isDark ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200'}`}>
            {/* Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-primary/5' : 'border-slate-200 bg-primary/5'}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shadow-sm">
                  <Trash2 size={15} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">Deactivate Document</p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedDocument(null); }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className={`p-4 rounded-2xl border ${isDark ? 'border-red-500/20 bg-red-500/5' : 'border-red-100 bg-red-50'}`}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedDocument.name}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      Deactivating this document will remove it from all future configurations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedDocument(null); }}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${isDark ? 'bg-white/10 text-gray-300 hover:bg-white/15' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-red-500 text-white hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-red-500/20"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl border shadow-2xl max-w-md w-full ${isDark ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200'}`}>
            {/* Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-primary/5' : 'border-slate-200 bg-primary/5'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${isEditMode ? 'bg-amber-500/15 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                  {isEditMode ? <Edit size={15} /> : <Plus size={15} />}
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">
                    {isEditMode ? 'Update Document' : 'Create Document'}
                  </p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isEditMode ? 'Modify document details' : 'Add a new document to master list'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className={label}>Document Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                  className={input}
                  placeholder="Enter document name…"
                />
              </div>

              {/* Type toggle */}
              <div>
                <label className={label}>Document Type</label>
                <div className={`flex rounded-xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <button
                    type="button"
                    onClick={() => setNewDocument({ ...newDocument, mandatory: false })}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider transition-all
                      ${!newDocument.mandatory ? 'bg-primary text-white' : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Optional
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewDocument({ ...newDocument, mandatory: true })}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider transition-all
                      ${newDocument.mandatory ? 'bg-primary text-white' : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Mandatory
                  </button>
                </div>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${isDark ? 'bg-white/10 text-gray-300 hover:bg-white/15' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={isEditMode ? handleUpdate : handleCreate}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-primary text-white hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {isEditMode ? <><Save size={12} />Update</> : <><Plus size={12} />Create</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
