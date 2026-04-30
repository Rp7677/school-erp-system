import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import { 
  FileStack, Download, Search, RefreshCw, 
  Loader2, Calendar, LayoutGrid, Clock, 
  PlusSquare, ShieldCheck, FileSpreadsheet,
  Upload, CheckCircle2, AlertCircle, FileUp
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const NACHBatchList = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  
  const fileInputRef = useRef(null);
  const [activeBatchForUpload, setActiveBatchForUpload] = useState(null);

  // Theme Constants
  const glassPanel = `rounded-[2.5rem] border shadow-2xl backdrop-blur-xl ${isDark ? "bg-[#0A0A0A]/90 border-white/10" : "bg-white/90 border-gray-100"}`;
  const inputStyle = `px-5 py-4 rounded-2xl border outline-none font-bold text-xs transition-all ${isDark ? "bg-white/5 border-white/10 text-white focus:border-primary" : "bg-gray-50 border-gray-200 text-gray-800 focus:border-primary"}`;

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/nach/batches");
      const sortedData = (res.data || []).sort((a, b) => b.batchId - a.batchId);
      setBatches(sortedData);
    } catch (error) {
      toast.error("Database Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatchFile = async (batchId) => {
    setProcessingId(batchId);
    const loadingToast = toast.loading(`Initializing Batch Processing #${batchId}...`);
    try {
      await api.post(`/api/nach/files/generate/${batchId}`);
      toast.success("Batch File Generated & Ready", { id: loadingToast });
      fetchBatches(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Generation Failed", { id: loadingToast });
    } finally {
      setProcessingId(null);
    }
  };

  // FIXED DOWNLOAD FUNCTION
  const handleDownloadFile = async (fileId, batchName) => {
    if (!fileId) return toast.error("File record not found.");
    
    setDownloadingId(fileId);
    const loadingToast = toast.loading("Downloading file...");
    
    try {
      // Direct call to the API as a blob because Postman shows this returns the file content
      const response = await api.get(`/api/nach/files/download/${fileId}`, {
        responseType: 'blob', 
      });

      // Create a Blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      // Formatting file name
      const safeFileName = `${batchName.replace(/[^a-z0-9]/gi, '_')}_Batch_${fileId}.csv`;
      link.setAttribute('download', safeFileName);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download complete", { id: loadingToast });
    } catch (error) {
      console.error("Download Error:", error);
      toast.error("Could not download file. Server returned an error.", { id: loadingToast });
    } finally {
      setDownloadingId(null);
    }
  };

  const triggerUpload = (batchId) => {
    setActiveBatchForUpload(batchId);
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !activeBatchForUpload) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingId(activeBatchForUpload);
    const uploadToast = toast.loading(`Uploading Response for Batch #${activeBatchForUpload}...`);

    try {
      await api.post(`/api/nach/files/upload-response/${activeBatchForUpload}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Response Uploaded Successfully", { id: uploadToast });
      fetchBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload Failed", { id: uploadToast });
    } finally {
      setUploadingId(null);
      setActiveBatchForUpload(null);
      event.target.value = null; 
    }
  };

  const filteredBatches = batches.filter(b => 
    b.batchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.batchId.toString().includes(searchTerm)
  );

  return (
    <div className={`min-h-screen p-6 lg:p-10 max-w-[1700px] mx-auto space-y-8 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-center" reverseOrder={false} />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".csv,.xls,.xlsx" 
        onChange={handleFileChange} 
      />

      <div className="flex justify-between items-center border-b border-white/10 pb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-3xl shadow-2xl shadow-primary/40">
            <FileStack size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
              NACH <span className="text-primary not-italic">REPOSITORY</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1 w-8 bg-primary rounded-full"></span>
              <p className="text-[10px] font-bold text-gray-500 tracking-[0.5em] uppercase">Batch Settlement Engine</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="SEARCH BATCH ID OR NAME..." 
                className={`${inputStyle} pl-12 w-80 shadow-inner`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button onClick={fetchBatches} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/50 transition-all active:scale-90">
              <RefreshCw size={22} className={`${loading ? "animate-spin text-primary" : "text-gray-400"}`} />
           </button>
        </div>
      </div>

      <div className={glassPanel}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="text-[11px] font-black uppercase text-gray-500 border-b border-white/5">
                <th className="px-10 py-8">Batch Identification</th>
                <th className="px-6 py-8">Execution Date</th>
                <th className="px-6 py-8">Volume</th>
                <th className="px-6 py-8 text-center">Status</th>
                <th className="px-6 py-8">Net Amount</th>
                <th className="px-10 py-8 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={48}/>
                  </td>
                </tr>
              ) : filteredBatches.map((batch) => (
                <tr key={batch.batchId} className="group hover:bg-primary/[0.03] transition-all">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary font-black text-sm border border-white/10 group-hover:border-primary/50 transition-all">
                        {batch.batchId}
                      </div>
                      <div>
                        <p className="font-black text-base tracking-tighter leading-none">{batch.batchName}</p>
                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-1">Campus ID: {batch.campusId}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-7 text-xs font-black tracking-tight">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary opacity-50" />
                      {new Date(batch.batchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>

                  <td className="px-6 py-7">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                       <span className="text-[12px] font-black text-primary">{batch.totalRecords}</span>
                       <span className="text-[9px] font-bold text-gray-500 uppercase">Entries</span>
                    </div>
                  </td>

                  <td className="px-6 py-7 text-center">
                      <span className={`px-5 py-2 rounded-xl border text-[9px] font-black tracking-[0.15em] uppercase flex items-center gap-2 shadow-sm
                        ${batch.status === 'FILE_GENERATED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                          batch.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                          'bg-primary/10 text-primary border-primary/20'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${batch.status === 'FILE_GENERATED' ? 'bg-green-500' : batch.status === 'PROCESSING' ? 'bg-blue-500' : 'bg-primary'} animate-pulse`}></div>
                        {batch.status.replace('_', ' ')}
                      </span>
                  </td>

                  <td className="px-6 py-7">
                    <p className="text-sm font-black tracking-tighter">
                      <span className="text-primary mr-1 italic">₹</span>
                      {batch.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </td>

                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {batch.status === "CREATED" ? (
                        <button 
                          onClick={() => handleGenerateBatchFile(batch.batchId)}
                          disabled={processingId === batch.batchId}
                          className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {processingId === batch.batchId ? <Loader2 size={16} className="animate-spin" /> : <PlusSquare size={16} />}
                          Generate File
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleDownloadFile(batch.file?.fileId, batch.batchName)}
                            disabled={!batch.file?.fileId || downloadingId === batch.file?.fileId} 
                            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl transition-all
                              ${(!batch.file?.fileId || downloadingId === batch.file?.fileId)
                                ? "bg-gray-400 cursor-not-allowed opacity-50" 
                                : "bg-[#1D6F42] text-white hover:bg-[#248a52] hover:scale-105 active:scale-95 shadow-green-900/20"
                              }`}
                          >
                            {downloadingId === batch.file?.fileId ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                            Download
                          </button>
                          
                          <button 
                            onClick={() => triggerUpload(batch.batchId)}
                            disabled={uploadingId === batch.batchId}
                            className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-blue-900/20 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                          >
                            {uploadingId === batch.batchId ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            Upload Response
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NACHBatchList;