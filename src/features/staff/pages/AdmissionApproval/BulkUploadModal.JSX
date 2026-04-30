import React, { useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { Upload, X, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../../config/api";

export default function BulkUploadModal({ open, onClose, selectedCampus }) {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Theme styles matching StudentList
  const card = `rounded-2xl border transition-all ${isDark ? 'bg-[#141414] border-white/5 shadow-2xl' : 'bg-gray-50 border-gray-200 shadow-xl'}`;
  const inp = `w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium ${isDark ? 'bg-[#1A1A1A] border-white/10 text-white focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'}`;
  const lbl = `block text-[10px] font-black uppercase mb-1 tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;

  if (!open) return null;

  const resetModal = () => {
    setFile(null);
    setPreviewData([]);
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const fileName = selectedFile.name.toLowerCase();

    if (fileName.endsWith(".csv")) {
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setPreviewData(result.data);
        },
      });
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const workbook = XLSX.read(event.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        setPreviewData(data);
      };
       e.target.value = null;
      reader.readAsBinaryString(selectedFile);
    } else {
      toast.error("Only CSV, XLS, and XLSX files are allowed");
      setFile(null);
      setPreviewData([]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    if (selectedCampus?.id) {
      formData.append("campusId", selectedCampus.id);
    }

    try {
      setLoading(true);

      await api.post("/students/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Bulk upload successful");
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`${card} w-full max-w-5xl max-h-[90vh] overflow-hidden`}>

        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
          <div>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Bulk Upload Students
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Upload student data using CSV or Excel file
            </p>
          </div>

          <button onClick={handleClose} className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">

          <div className={`border-2 border-dashed rounded-xl p-8 text-center ${isDark ? 'border-white/10' : 'border-gray-300'}`}>
            <FileSpreadsheet className={`mx-auto mb-3 ${isDark ? 'text-primary' : 'text-primary'}`} size={42} />

            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white hover:opacity-90">
              <Upload size={18} />
              Choose CSV / Excel File
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                onClick={(e) => {
                  e.target.value = null;
                }}
              />
            </label>

            {file && (
              <div className="mt-3 flex items-center justify-center gap-3">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Selected: <span className="text-primary font-bold">{file.name}</span>
                </p>

                <button
                  type="button"
                  onClick={resetModal}
                  className="px-3 py-1 rounded-lg bg-red-500/10 text-red-500 border border-red-400/20 text-xs font-bold hover:bg-red-500/20"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {previewData.length > 0 && (
            <div>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Preview Data ({previewData.length} rows)
              </h3>

              <div className={`overflow-auto border rounded-xl ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <table className="min-w-full text-sm">
                  <thead className={`${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-100'}`}>
                    <tr>
                      {Object.keys(previewData[0]).map((key) => (
                        <th
                          key={key}
                          className={`px-4 py-3 text-left text-[10px] font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} whitespace-nowrap`}
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {previewData.slice(0, 10).map((row, index) => (
                      <tr key={index} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        {Object.keys(previewData[0]).map((key) => (
                          <td
                            key={key}
                            className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}
                          >
                            {row[key] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {previewData.length > 10 && (
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  Showing first 10 rows only.
                </p>
              )}
            </div>
          )}
        </div>

        <div className={`flex justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={handleClose}
            className={`px-5 py-2 rounded-lg border transition-all ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-800' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
          >
            Cancel
          </button>

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="px-5 py-2 rounded-lg bg-primary text-white disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}