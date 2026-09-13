import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Github, Star, GitFork, 
  CheckCircle, AlertTriangle, Info, Shield, 
  Zap, Code, Loader2, Package 
} from "lucide-react";
import { api } from "@/lib/api";

const TABS = [
  { id: "overview", label: "Overview", icon: Info },
  { id: "bugs", label: "Bug Analysis", icon: AlertTriangle },
  { id: "quality", label: "Code Quality", icon: Code },
  { id: "security", label: "Security", icon: Shield },
  { id: "dependencies", label: "Dependencies", icon: Package }
];

export default function RepoDetailPage() {
  const { repoId } = useParams();
  const navigate = useNavigate();
  
  const [repo, setRepo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const [data, setData] = useState({
    explanation: null,
    bugs: null,
    quality: null,
    security: null,
    dependencies: null
  });
  
  const [loading, setLoading] = useState({
    repo: true,
    explanation: false,
    bugs: false,
    quality: false,
    security: false,
    dependencies: false
  });

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await api.get(`/repos/${repoId}`);
        setRepo(res.data?.data?.repo || res.data?.data);
      } catch (err) {
        console.error("Error fetching repo:", err);
      } finally {
        setLoading(prev => ({ ...prev, repo: false }));
      }
    };
    
    // Also try fetching cached data for all analysis tabs
    const fetchCachedData = async () => {
      try {
        const [explRes, bugsRes, qualRes, secRes, depRes] = await Promise.all([
          api.get(`/analysis/${repoId}/explain`).catch(() => null),
          api.get(`/analysis/${repoId}/bugs`).catch(() => null),
          api.get(`/analysis/${repoId}/quality-score`).catch(() => null),
          api.get(`/analysis/${repoId}/security-scan`).catch(() => null),
          api.get(`/analysis/${repoId}/dependencies`).catch(() => null),
        ]);
        
        setData(prev => ({
          ...prev,
          explanation: explRes?.data?.data?.explanation || null,
          bugs: bugsRes?.data?.data?.bugReport || null,
          quality: qualRes?.data?.data?.qualityScore || null,
          security: secRes?.data?.data?.securityScan || null,
          dependencies: depRes?.data?.data?.dependencies || null,
        }));
      } catch (err) {
        // Silently fail cache fetch
      }
    };
    
    fetchRepo();
    fetchCachedData();
  }, [repoId]);

  const runAnalysis = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      let endpoint = '';
      if (type === 'explanation') endpoint = `/analysis/${repoId}/explain`;
      else if (type === 'bugs') endpoint = `/analysis/${repoId}/analyze-bugs`;
      else if (type === 'quality') endpoint = `/analysis/${repoId}/quality-score`;
      else if (type === 'security') endpoint = `/analysis/${repoId}/security-scan`;
      else if (type === 'dependencies') endpoint = `/analysis/${repoId}/dependencies`;
      
      const res = await api.post(endpoint);
      
      if (type === 'explanation') setData(prev => ({ ...prev, explanation: res.data?.data?.explanation }));
      else if (type === 'bugs') setData(prev => ({ ...prev, bugs: res.data?.data?.bugReport }));
      else if (type === 'quality') setData(prev => ({ ...prev, quality: res.data?.data?.qualityScore }));
      else if (type === 'security') setData(prev => ({ ...prev, security: res.data?.data?.securityScan }));
      else if (type === 'dependencies') setData(prev => ({ ...prev, dependencies: res.data?.data?.dependencies }));
      
    } catch (err) {
      alert(`Failed to run ${type} analysis.`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  if (loading.repo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center flex-col text-white">
        <h2 className="text-2xl font-bold mb-4">Repository not found</h2>
        <button onClick={() => navigate('/dashboard')} className="text-emerald-500 hover:underline">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 pt-8 pb-4 sticky top-0 z-10 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                {repo.name}
                <a href={`https://github.com/${repo.owner}/${repo.name}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition">
                  <Github size={24} />
                </a>
              </h1>
              <p className="text-gray-400 mt-2 max-w-2xl">{repo.description || "No description provided."}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm bg-gray-800 rounded-lg p-3 border border-gray-700">
              {repo.language && (
                <div className="flex items-center gap-1.5 border-r border-gray-700 pr-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  {repo.language}
                </div>
              )}
              <div className="flex items-center gap-1 border-r border-gray-700 pr-4">
                <Star size={16} className="text-gray-400" /> {repo.stars || 0}
              </div>
              <div className="flex items-center gap-1">
                <GitFork size={16} className="text-gray-400" /> {repo.forks || 0}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-6 mt-8 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 px-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "border-emerald-500 text-emerald-500 font-semibold" 
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-8">
        <AnimatePresence mode="wait">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {!data.explanation ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                  <Info size={48} className="text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No AI Summary Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md text-center text-sm">
                    Generate a comprehensive AI explanation to understand the architecture, tech stack, and purpose of this repository.
                  </p>
                  <button 
                    onClick={() => runAnalysis('explanation')}
                    disabled={loading.explanation}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {loading.explanation ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                    Generate AI Explanation
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-emerald-400">Summary</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">{data.explanation.summary}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
                      <h3 className="text-xl font-semibold mb-4 text-emerald-400">Architecture & Purpose</h3>
                      <p className="text-gray-300 mb-6">{data.explanation.purpose}</p>
                      <p className="text-gray-300">{data.explanation.architecture}</p>
                    </div>
                    
                    <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
                      <h3 className="text-xl font-semibold mb-4 text-emerald-400">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2 mb-8">
                        {data.explanation.techStack?.map((tech, i) => (
                          <span key={i} className="bg-gray-700 px-3 py-1.5 rounded-lg text-sm text-gray-200 border border-gray-600">
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-3 text-emerald-400">Key Files</h3>
                      <ul className="space-y-2">
                        {data.explanation.keyFiles?.map((file, i) => (
                          <li key={i} className="text-sm font-mono text-gray-400 flex items-start gap-2">
                            <span className="text-gray-500 mt-1">↳</span> {file}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-emerald-900/10 rounded-2xl p-6 md:p-8 border border-emerald-500/20">
                      <h3 className="text-xl font-semibold mb-4 text-emerald-400 flex items-center gap-2">
                        <CheckCircle size={20} /> Strengths
                      </h3>
                      <ul className="space-y-3">
                        {data.explanation.strengths?.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-300">
                            <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-yellow-900/10 rounded-2xl p-6 md:p-8 border border-yellow-500/20">
                      <h3 className="text-xl font-semibold mb-4 text-yellow-400 flex items-center gap-2">
                        <AlertTriangle size={20} /> Areas for Improvement
                      </h3>
                      <ul className="space-y-3">
                        {data.explanation.improvements?.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-300">
                            <AlertTriangle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* BUGS TAB */}
          {activeTab === "bugs" && (
            <motion.div
              key="bugs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {!data.bugs ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                  <AlertTriangle size={48} className="text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Bug Analysis Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md text-center text-sm">
                    Scan the codebase for potential bugs, vulnerabilities, and code smells.
                  </p>
                  <button 
                    onClick={() => runAnalysis('bugs')}
                    disabled={loading.bugs}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {loading.bugs ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                    Run Bug Analysis
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700">
                    <div className="flex flex-col items-center justify-center bg-gray-900 rounded-xl p-6 border border-gray-700 min-w-[200px]">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#374151" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={data.bugs.overallScore > 80 ? "#10B981" : data.bugs.overallScore > 60 ? "#F59E0B" : "#EF4444"} strokeWidth="3" strokeDasharray={`${data.bugs.overallScore}, 100`} />
                        </svg>
                        <div className="absolute text-3xl font-bold">{data.bugs.overallScore}</div>
                      </div>
                      <span className="mt-4 text-sm text-gray-400 font-medium">Health Score</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-white">Analysis Summary</h3>
                      <p className="text-gray-300 text-lg">{data.bugs.summary}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 text-white">Detected Issues</h3>
                    {data.bugs.bugs?.map((bug, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                              bug.severity === 'critical' || bug.severity === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                              bug.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {bug.severity.toUpperCase()}
                            </span>
                            <span className="bg-gray-700 px-2 py-1 text-xs rounded text-gray-300">
                              {bug.type}
                            </span>
                          </div>
                          <div className="text-sm font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                            {bug.filePath} : {bug.line}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">{bug.title}</h4>
                          <p className="text-gray-400 text-sm">{bug.message}</p>
                        </div>
                        {bug.suggestedFix && (
                          <div className="mt-2 bg-gray-900 rounded-lg p-4 border border-gray-700">
                            <span className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Suggested Fix</span>
                            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto">
                              {bug.suggestedFix}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                    {(!data.bugs.bugs || data.bugs.bugs.length === 0) && (
                      <div className="text-center p-10 bg-gray-800 rounded-xl border border-gray-700">
                        <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold">No issues found!</h4>
                        <p className="text-gray-400">The codebase looks clean.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* QUALITY TAB */}
          {activeTab === "quality" && (
            <motion.div
              key="quality"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
               {!data.quality ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                  <Code size={48} className="text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Quality Score Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md text-center text-sm">
                    Analyze maintainability, readability, performance, and best practices.
                  </p>
                  <button 
                    onClick={() => runAnalysis('quality')}
                    disabled={loading.quality}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {loading.quality ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                    Analyze Quality
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 bg-gray-800 rounded-2xl p-8 border border-gray-700 flex flex-col items-center justify-center text-center">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 text-4xl font-bold ${
                        data.quality.grade.includes('A') ? 'bg-emerald-500/20 text-emerald-500 border-2 border-emerald-500' :
                        data.quality.grade.includes('B') ? 'bg-blue-500/20 text-blue-500 border-2 border-blue-500' :
                        data.quality.grade.includes('C') ? 'bg-yellow-500/20 text-yellow-500 border-2 border-yellow-500' :
                        'bg-red-500/20 text-red-500 border-2 border-red-500'
                      }`}>
                        {data.quality.grade}
                      </div>
                      <h3 className="text-xl font-semibold">Overall Grade</h3>
                      <p className="text-3xl font-bold text-white mt-2">{data.quality.overallScore}<span className="text-gray-500 text-lg">/100</span></p>
                    </div>
                    
                    <div className="col-span-1 md:col-span-2 bg-gray-800 rounded-2xl p-8 border border-gray-700">
                      <h3 className="text-xl font-semibold mb-3">Quality Summary</h3>
                      <p className="text-gray-300">{data.quality.summary}</p>
                      
                      <h4 className="text-sm uppercase text-gray-500 font-semibold mt-6 mb-3">Top Improvements</h4>
                      <ul className="space-y-2">
                        {data.quality.topImprovements?.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                            <span className="text-emerald-500 font-bold">{i+1}.</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.quality.categories && Object.entries(data.quality.categories).map(([key, cat]) => (
                      <div key={key} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold capitalize">{key}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            cat.score > 80 ? 'bg-emerald-500/20 text-emerald-500' :
                            cat.score > 60 ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {cat.score}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
                          <div className={`h-2 rounded-full ${
                            cat.score > 80 ? 'bg-emerald-500' : cat.score > 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} style={{ width: `${cat.score}%` }}></div>
                        </div>
                        <ul className="space-y-2">
                          {cat.issues?.map((issue, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-gray-600 mt-1">•</span> {issue}
                            </li>
                          ))}
                          {(!cat.issues || cat.issues.length === 0) && (
                            <li className="text-sm text-gray-500 italic">No major issues found.</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
               {!data.security ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                  <Shield size={48} className="text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Security Scan Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md text-center text-sm">
                    Scan for OWASP vulnerabilities, exposed secrets, and security misconfigurations.
                  </p>
                  <button 
                    onClick={() => runAnalysis('security')}
                    disabled={loading.security}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {loading.security ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                    Run Security Scan
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700 flex flex-col md:flex-row gap-8">
                     <div className="flex flex-col items-center justify-center bg-gray-900 rounded-xl p-6 border border-gray-700 min-w-[200px]">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#374151" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={data.security.securityScore > 80 ? "#10B981" : data.security.securityScore > 60 ? "#F59E0B" : "#EF4444"} strokeWidth="3" strokeDasharray={`${data.security.securityScore}, 100`} />
                        </svg>
                        <div className="absolute text-3xl font-bold">{data.security.securityScore}</div>
                      </div>
                      <span className="mt-4 text-sm text-gray-400 font-medium">Security Score</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-3 text-white">Security Report</h3>
                      <p className="text-gray-300 text-lg">{data.security.summary}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 text-white">Vulnerabilities</h3>
                    {data.security.vulnerabilities?.map((vuln, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col gap-3">
                         <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                              vuln.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                              vuln.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
                              vuln.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                              'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {vuln.severity.toUpperCase()}
                            </span>
                            <span className="bg-gray-700 px-2 py-1 text-xs rounded text-gray-300 border border-gray-600">
                              {vuln.category}
                            </span>
                          </div>
                          <div className="text-sm font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
                            {vuln.filePath} {vuln.line ? `: ${vuln.line}` : ''}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">{vuln.title}</h4>
                          <p className="text-gray-400 text-sm">{vuln.description}</p>
                        </div>
                        {vuln.remediation && (
                          <div className="mt-2 bg-emerald-900/10 rounded-lg p-4 border border-emerald-500/20">
                            <span className="text-xs text-emerald-500 uppercase font-semibold mb-2 flex items-center gap-1">
                              <Shield size={14} /> Remediation
                            </span>
                            <p className="text-sm text-gray-300">
                              {vuln.remediation}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    {(!data.security.vulnerabilities || data.security.vulnerabilities.length === 0) && (
                      <div className="text-center p-10 bg-gray-800 rounded-xl border border-gray-700">
                        <Shield size={40} className="text-emerald-500 mx-auto mb-3" />
                        <h4 className="text-lg font-semibold">Secure Codebase!</h4>
                        <p className="text-gray-400">No major security vulnerabilities were detected.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* DEPENDENCIES TAB */}
          {activeTab === "dependencies" && (
            <motion.div
              key="dependencies"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {!data.dependencies ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-2xl border border-gray-700 border-dashed">
                  <Package size={48} className="text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Dependency Audit Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md text-center text-sm">
                    Scan package manifests for outdated libraries, vulnerabilities, and upgrade opportunities.
                  </p>
                  <button 
                    onClick={() => runAnalysis('dependencies')}
                    disabled={loading.dependencies}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {loading.dependencies ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                    Audit Dependencies
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700 flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center justify-center bg-gray-900 rounded-xl p-6 border border-gray-700 min-w-[200px]">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#374151" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={data.dependencies.healthScore > 80 ? "#10B981" : data.dependencies.healthScore > 60 ? "#F59E0B" : "#EF4444"} strokeWidth="3" strokeDasharray={`${data.dependencies.healthScore || 0}, 100`} />
                        </svg>
                        <div className="absolute text-3xl font-bold">{data.dependencies.healthScore || 0}</div>
                      </div>
                      <span className="mt-4 text-sm text-gray-400 font-medium">Dependency Health</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3 text-white">Dependency Summary</h3>
                      <p className="text-gray-300 text-lg mb-6">{data.dependencies.summary}</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700">
                          <span className="text-xs text-gray-400 uppercase">Total Packages</span>
                          <p className="text-2xl font-bold text-white mt-1">{data.dependencies.totalDependencies || 0}</p>
                        </div>
                        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700">
                          <span className="text-xs text-yellow-400 uppercase">Outdated</span>
                          <p className="text-2xl font-bold text-yellow-400 mt-1">{data.dependencies.outdatedCount || 0}</p>
                        </div>
                        <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700">
                          <span className="text-xs text-red-400 uppercase">Vulnerable</span>
                          <p className="text-2xl font-bold text-red-400 mt-1">{data.dependencies.vulnerableCount || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {data.dependencies.recommendations && data.dependencies.recommendations.length > 0 && (
                    <div className="bg-emerald-900/10 rounded-2xl p-6 border border-emerald-500/20">
                      <h4 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                        <CheckCircle size={18} /> Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {data.dependencies.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-emerald-500 font-bold">•</span> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 text-white">Analyzed Packages</h3>
                    {data.dependencies.dependencies?.map((dep, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className="text-lg font-mono font-semibold text-white">{dep.name}</h4>
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md ${
                              dep.status === 'vulnerable' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              dep.status === 'outdated' || dep.status === 'deprecated' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {dep.status?.toUpperCase() || 'OK'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mt-1">{dep.details}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-mono bg-gray-900 px-4 py-2 rounded-lg border border-gray-700">
                          <div>
                            <span className="text-gray-500 text-xs block">CURRENT</span>
                            <span className="text-gray-300">{dep.currentVersion}</span>
                          </div>
                          {dep.recommendedVersion && (
                            <>
                              <span className="text-gray-600">→</span>
                              <div>
                                <span className="text-emerald-400 text-xs block">TARGET</span>
                                <span className="text-emerald-300 font-bold">{dep.recommendedVersion}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!data.dependencies.dependencies || data.dependencies.dependencies.length === 0) && (
                      <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700">
                        <CheckCircle size={36} className="text-emerald-500 mx-auto mb-2" />
                        <h4 className="text-base font-semibold">Dependencies are in good shape!</h4>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
