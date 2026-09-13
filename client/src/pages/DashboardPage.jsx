import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AddRepoModal } from "@/components/AddRepoModal";
import { Plus, GitFork, Star, Trash2, FolderGit2, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRepos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/repos");
      setRepos(res.data?.data?.repos || res.data?.data || []);
    } catch (err) {
      setError("Couldn't load repositories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleDelete = async (repoId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this repository? All associated analysis data will be lost.")) return;
    
    setDeletingId(repoId);
    try {
      await api.delete(`/repos/${repoId}`);
      setRepos(Array.isArray(repos) ? repos.filter(r => r._id !== repoId) : []);
    } catch (err) {
      alert("Failed to delete repository.");
    } finally {
      setDeletingId(null);
    }
  };

  const getLanguageColor = (lang) => {
    const colors = {
      JavaScript: "bg-yellow-400",
      TypeScript: "bg-blue-500",
      Python: "bg-blue-400",
      Go: "bg-cyan-500",
      Rust: "bg-orange-500",
      Java: "bg-red-500",
      "C++": "bg-pink-500"
    };
    return colors[lang] || "bg-gray-400";
  };

  const repoList = Array.isArray(repos) ? repos : (repos?.repos || []);

  const analyzedRepos = repoList.filter(r => r.lastAnalyzedAt || r.qualityScore || r.aiSummary);
  const scoredRepos = repoList.filter(r => r.qualityScore?.overallScore != null);
  const avgScore = scoredRepos.length > 0
    ? Math.round(scoredRepos.reduce((acc, r) => acc + Number(r.qualityScore.overallScore), 0) / scoredRepos.length)
    : null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-gray-400">
              Welcome back, <span className="text-gray-200">{user?.name || user?.username || "Developer"}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:opacity-90"
            >
              <Plus size={18} /> Add Repository
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="rounded-xl border border-gray-700 px-5 py-2.5 text-sm font-semibold text-gray-400 transition hover:border-gray-500 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
            <p className="text-sm text-gray-400">Total Repositories</p>
            <p className="mt-2 text-3xl font-bold text-white">{repoList.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
            <p className="text-sm text-gray-400">Analyzed Repositories</p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">{analyzedRepos.length}</p>
          </div>
          <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
            <p className="text-sm text-gray-400">Avg Quality Score</p>
            <p className="mt-2 text-3xl font-bold text-white">{avgScore !== null ? `${avgScore}/100` : "—"}</p>
          </div>
        </div>

        <h2 className="mb-6 font-display text-xl font-semibold">Your Repositories</h2>


        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-gray-700 border-dashed bg-gray-800/20">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-500">
            {error}
          </div>
        ) : repoList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-700 border-dashed bg-gray-800/30 py-20 text-center">
            <div className="mb-4 rounded-full bg-gray-800 p-4">
              <FolderGit2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">No repositories yet</h3>
            <p className="mb-6 max-w-sm text-sm text-gray-400">
              Add your first GitHub repository to start analyzing code quality, finding bugs, and getting AI insights.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gray-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-600"
            >
              <Plus size={18} /> Add your first repo
            </button>
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {repoList.map((repo) => (
              <motion.div
                key={repo._id}
                variants={item}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 p-6 transition-all hover:border-gray-600 hover:shadow-xl hover:shadow-gray-900/50"
              >
                <div className="mb-4 flex items-start justify-between">
                  <a 
                    href={`https://github.com/${repo.owner}/${repo.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-emerald-400 hover:underline line-clamp-1 flex-1"
                    onClick={e => e.stopPropagation()}
                  >
                    {repo.owner}/{repo.name}
                  </a>
                  <button
                    onClick={(e) => handleDelete(repo._id, e)}
                    disabled={deletingId === repo._id}
                    className="ml-4 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                    aria-label="Delete repository"
                  >
                    {deletingId === repo._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>

                <p className="mb-6 line-clamp-2 text-sm text-gray-400 flex-1">
                  {repo.description || "No description provided."}
                </p>

                <div className="mt-auto flex items-center gap-4 text-xs text-gray-400">
                  {repo.language && (
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${getLanguageColor(repo.language)}`} />
                      {repo.language}
                    </div>
                  )}
                  {repo.stars !== undefined && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-gray-500" />
                      {repo.stars}
                    </div>
                  )}
                  {repo.forks !== undefined && (
                    <div className="flex items-center gap-1">
                      <GitFork size={14} className="text-gray-500" />
                      {repo.forks}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/dashboard/repo/${repo._id}`)}
                  className="mt-6 w-full rounded-xl bg-gray-700/50 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-600"
                >
                  Analyze Repo
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AddRepoModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onRepoAdded={() => {
          fetchRepos();
        }}
      />
    </div>
  );
}
