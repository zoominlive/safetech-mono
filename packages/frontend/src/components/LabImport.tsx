import React, { useState, useRef, useEffect } from "react";
import { reportService } from "@/services/api/reportService";

interface LabImportProps {
  projectId: string;
}

const LabImport: React.FC<LabImportProps> = ({ projectId }) => {
  const [labData, setLabData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialFetch, setInitialFetch] = useState(true);

  // Fetch lab reports on mount
  useEffect(() => {
    const fetchLabReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await reportService.getLabReports(projectId);
        setLabData(response.data?.labReports || []);
      } catch (err: any) {
        setError("Failed to fetch lab reports.");
      } finally {
        setLoading(false);
        setInitialFetch(false);
      }
    };
    fetchLabReports();
  }, [projectId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("project_id", projectId);
      await reportService.importLab(formData);
      setSuccess("File uploaded successfully. Fetching lab data...");
      // Fetch lab data for the project
      const response = await reportService.getLabReports(projectId);
      setLabData(response.data?.labReports || []);
      setSuccess(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to upload or fetch lab data.");
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      {/* Show table if labData exists and has length */}
      {labData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border mt-4">
            <thead>
              <tr>
                {Object.keys(labData[0]).map((col) => (
                  <th key={col} className="border px-2 py-1 bg-gray-100">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labData.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="border px-2 py-1">
                      {typeof val === 'object' && val !== null
                        ? JSON.stringify(val)
                        : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Only show the import button if not loading and not initial fetch
        !loading && !initialFetch && (
          <>
            <input
              id="lab-csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={loading}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={loading}
              className="bg-gray-700 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              Import Lab Results (CSV)
            </button>
          </>
        )
      )}
    </div>
  );
};

export default LabImport; 