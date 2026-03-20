import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { uploadVideo } from "../services/videoService";
import Navbar from "../components/shared/Navbar";

const UploadPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [logoInput, setLogoInput] = useState("");
  const [logoNames, setLogoNames] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("video/")) {
      setFile(dropped);
    }
  };

  const addLogo = () => {
    const trimmed = logoInput.trim().toLowerCase();
    if (trimmed && !logoNames.includes(trimmed)) {
      setLogoNames([...logoNames, trimmed]);
      setLogoInput("");
    }
  };

  const removeLogo = (name: string) => {
    setLogoNames(logoNames.filter((l) => l !== name));
  };

  const handleUpload = async () => {
    if (!file || !title || logoNames.length === 0 || !user) return;
    setError("");
    setUploading(true);
    try {
      const response = await uploadVideo(file, title, logoNames);
      localStorage.setItem(`jobId-${response.videoId}`, response.jobId);
      navigate(`/analysis/${response.videoId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Upload Event Video
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Upload a video to analyze sponsor logo visibility
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById("file-input")?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition mb-6
            ${
              dragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
            }`}
        >
          <input
            id="file-input"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file ? (
            <div>
              <p className="text-green-600 font-medium">{file.name}</p>
              <p className="text-gray-400 text-sm mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500 font-medium">Drop your video here</p>
              <p className="text-gray-400 text-sm mt-1">
                or click to browse — MP4, MOV, AVI supported
              </p>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Champions League Final 2025"
          />
        </div>

        {/* Logo Names */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Logo names to detect
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={logoInput}
              onChange={(e) => setLogoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLogo()}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. netflix, adidas, nike"
            />
            <button
              onClick={addLogo}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {logoNames.map((name) => (
              <span
                key={name}
                className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full flex items-center gap-2"
              >
                {name}
                <button
                  onClick={() => removeLogo(name)}
                  className="text-blue-400 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || !title || logoNames.length === 0 || uploading}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {uploading ? "Uploading & analyzing..." : "Upload & Analyze"}
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
