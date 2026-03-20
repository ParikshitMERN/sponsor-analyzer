import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAnalysisResult } from "../services/videoService";
import { AnalysisResult } from "../types/analysis.types";
import Navbar from "../components/shared/Navbar";

const ReportPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (videoId) {
      getAnalysisResult(videoId)
        .then(setReport)
        .finally(() => setLoading(false));
    }
  }, [videoId]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </div>
    );

  if (!report) return null;

  const isPass = report.verdict === "pass";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Analysis Report
            </h1>
            <p className="text-gray-500 text-sm mt-1">{report.message}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium
            ${isPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {isPass ? "PASS" : "FAIL"}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Efficiency Score",
              value: `${report.efficiency_score}/100`,
            },
            {
              label: "Visibility Duration",
              value: `${report.visibility_duration}s`,
            },
            {
              label: "Avg Screen Coverage",
              value: `${report.average_coverage}%`,
            },
            { label: "Total Detections", value: report.detections.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-xl font-semibold text-gray-800">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Score Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Efficiency Score</span>
            <span className="font-medium">{report.efficiency_score}/100</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${isPass ? "bg-green-500" : "bg-red-500"}`}
              style={{ width: `${report.efficiency_score}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Pass threshold: 40/100</p>
        </div>

        {/* Detections Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-800">Logo Detections</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Logo
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Timestamp
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Confidence
                </th>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">
                  Coverage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {report.detections.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-800 capitalize">
                    {d.logo_name}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{d.timestamp}s</td>
                  <td className="px-6 py-3">
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs">
                      {(d.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">
                    {d.screen_coverage}%
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

export default ReportPage;
