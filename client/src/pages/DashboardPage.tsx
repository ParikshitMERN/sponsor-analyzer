import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAllReports } from "../services/videoService";
import { AnalysisResult } from "../types/analysis.types";
import Navbar from "../components/shared/Navbar";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Welcome, {user?.name}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{user?.companyName}</p>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            + New Analysis
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Analyses", value: reports.length },
            {
              label: "Passed",
              value: reports.filter((r) => r.verdict === "pass").length,
            },
            {
              label: "Failed",
              value: reports.filter((r) => r.verdict === "fail").length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-3xl font-semibold text-gray-800 mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Reports List */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-800">Recent Analyses</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No analyses yet.</p>
              <button
                onClick={() => navigate("/upload")}
                className="mt-3 text-blue-600 text-sm hover:underline"
              >
                Upload your first video
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Video
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Score
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Verdict
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {report.videoId}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {report.efficiency_score}/100
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
                          report.verdict === "pass"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {report.verdict.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/report/${report.videoId}`)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
