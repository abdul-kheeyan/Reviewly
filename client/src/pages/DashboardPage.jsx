import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

/**
 * Minimal placeholder for the real PR dashboard described in the project spec
 * (repo browser, PR list, Monaco diff viewer, review metrics). This page only
 * renders once ProtectedRoute has confirmed the visitor is signed in.
 */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/repos")
      .then((res) => {
        if (!cancelled) setRepos(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load repositories.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-800 px-8 py-10 text-white">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-400">
              Signed in as <span className="text-gray-200">{user?.username ?? "…"}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-400 transition hover:border-gray-500 hover:text-white"
          >
            Sign out
          </button>
        </div>

        <div className="rounded-2xl border border-gray-700 bg-[#24282c] p-6">
          <h2 className="mb-4 font-display text-base font-semibold">Connected repositories</h2>

          {loading && <p className="text-sm text-gray-400">Loading…</p>}
          {error && <p className="text-sm text-gray-400">{error}</p>}
          {!loading && !error && repos.length === 0 && (
            <p className="text-sm text-gray-400">
              No repositories yet — connect one from GitHub to start getting reviews.
            </p>
          )}

          <ul className="divide-y divide-gray-700">
            {repos.map((repo) => (
              <li key={repo._id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  {repo.owner}/{repo.name}
                </span>
                <span className="font-mono text-xs text-gray-400">{repo.defaultBranch}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
