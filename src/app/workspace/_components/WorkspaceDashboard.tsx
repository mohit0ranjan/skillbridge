"use client";

import { useState } from "react";
import { Layout, Folder, CheckSquare, Upload, LogOut, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function WorkspaceDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [progress, setProgress] = useState([false, false, false, false]);
  const [githubLink, setGithubLink] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<"none" | "pending" | "approved" | "rejected">("none");

  const projects = [
    { id: 1, title: "Landing Page Clone", difficulty: "Easy", desc: "Build a responsive static landing page with modern semantics and clean CSS." },
    { id: 2, title: "To-Do Application", difficulty: "Easy", desc: "Create a functional, persistent task planner relying on local storage APIs." },
    { id: 3, title: "Auth Flow Implementation", difficulty: "Medium", desc: "Set up secure JWT-based authentication endpoints and middleware validation." },
    { id: 4, title: "CRUD Dashboard", difficulty: "Medium", desc: "Develop a functional data grid supporting complex sorting and filtering." },
    { id: 5, title: "E-Commerce Cart", difficulty: "Hard", desc: "Implement robust global state management and a full checkout workflow." },
    { id: 6, title: "Real-time Chat", difficulty: "Hard", desc: "Build a scalable socket-based chatting application with isolated rooms." },
  ];

  const toggleProgress = (index: number) => {
    const newProgress = [...progress];
    newProgress[index] = !newProgress[index];
    setProgress(newProgress);
  };

  const handleSelectProject = (id: number) => {
    if (selectedProject !== null) return;
    setSelectedProject(id);
    setActiveTab("progress");
  };

  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubLink) return;
    setSubmissionStatus("pending");
  };

  const completedWeeks = progress.filter(Boolean).length;
  const currentProgressPercent = (completedWeeks / 4) * 100;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="max-w-4xl animate-fade-in mx-auto">
            <header className="mb-8 pb-6 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Welcome to your workspace</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your project, track weekly progress, and submit final deliverables.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Active Project Card */}
              <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3 mb-6 text-sm font-medium text-gray-500">
                  <Folder className="w-4 h-4 text-emerald-600" />
                  Your Project
                </div>
                {selectedProject !== null ? (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {projects.find((p) => p.id === selectedProject)?.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                      {projects.find((p) => p.id === selectedProject)?.desc}
                    </p>
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      In progress
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No project selected</h3>
                    <p className="text-sm text-gray-500 mb-6">Select an assignment to begin your internship journey.</p>
                    <button
                      onClick={() => setActiveTab("projects")}
                      className="text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors w-fit shadow-sm"
                    >
                      Browse Projects
                    </button>
                  </>
                )}
              </div>

              {/* Progress Overview Card */}
              <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-3 mb-6 text-sm font-medium text-gray-500">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Program Progress
                </div>
                <div className="flex items-end justify-between mb-3">
                  <div className="text-4xl font-semibold text-gray-900 tracking-tight">{currentProgressPercent}%</div>
                  <div className="text-sm text-gray-500 font-medium mb-1">{completedWeeks} of 4 weeks</div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full transition-all duration-700 ease-out" 
                    style={{ width: `${currentProgressPercent}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => setActiveTab("progress")}
                  disabled={selectedProject === null}
                  className="text-sm font-medium text-gray-900 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors group"
                >
                  View timeline <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        );
      case "projects":
        return (
          <div className="max-w-5xl animate-fade-in mx-auto">
            <header className="mb-8 pb-6 border-b border-gray-200 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Available Projects</h1>
                <p className="text-sm text-gray-500 mt-1">Review the assignments below. You may only select and commit to one project.</p>
              </div>
            </header>
            
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => {
                const isSelected = selectedProject === p.id;
                const isDisabled = selectedProject !== null && !isSelected;
                
                let badgeStyle = "text-emerald-700 bg-emerald-50 border-emerald-200";
                if (p.difficulty === "Medium") badgeStyle = "text-amber-700 bg-amber-50 border-amber-200";
                if (p.difficulty === "Hard") badgeStyle = "text-rose-700 bg-rose-50 border-rose-200";

                return (
                  <div 
                    key={p.id} 
                    className={`flex flex-col p-6 rounded-2xl border transition-all duration-200 ${
                      isSelected 
                        ? "border-emerald-600 ring-1 ring-emerald-600 bg-emerald-50/20 shadow-sm" 
                        : isDisabled 
                          ? "opacity-50 pointer-events-none border-gray-100 bg-gray-50/50" 
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-lg font-bold">
                        {p.title.charAt(0)}
                      </div>
                      <span className={`px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded flex items-center border ${badgeStyle}`}>
                        {p.difficulty}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-base mb-2">{p.title}</h3>
                    <p className="text-sm text-gray-600 mb-8 leading-relaxed flex-1">{p.desc}</p>
                    
                    <button
                      onClick={() => handleSelectProject(p.id)}
                      disabled={isDisabled || isSelected}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        isSelected 
                          ? "bg-gray-100 text-gray-500 border-transparent cursor-default" 
                          : "bg-white text-emerald-700 border-gray-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                      }`}
                    >
                      {isSelected ? "Committed" : "Select Project"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "progress":
        return (
          <div className="max-w-3xl animate-fade-in mx-auto">
            <header className="mb-8 pb-6 border-b border-gray-200 flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Weekly Deliverables</h1>
                <p className="text-sm text-gray-500 mt-1">Mark weeks complete as you finish the corresponding tasks.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{currentProgressPercent}% Complete</span>
              </div>
            </header>
            
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {[1, 2, 3, 4].map((week, index) => {
                const isComplete = progress[index];
                return (
                  <div 
                    key={week} 
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-6 transition-colors ${
                      index !== 3 ? "border-b border-gray-100" : ""
                    } hover:bg-gray-50/50`}
                  >
                    <button
                      onClick={() => toggleProgress(index)}
                      className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                        isComplete 
                          ? "bg-emerald-100 text-emerald-600" 
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                       {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-sm bg-gray-300"></div>}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium mb-1 text-base ${isComplete ? "text-gray-900" : "text-gray-900"}`}>
                        Week {week} Milestones
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Finalize all core layout structures, integrate state management securely, and ensure local repository builds without warnings.
                      </p>
                    </div>
                    {isComplete && (
                      <span className="hidden sm:inline-flex text-xs font-semibold text-emerald-600 tracking-wide uppercase bg-emerald-50 px-2 py-1 rounded">
                         Done
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case "submission":
        return (
          <div className="max-w-2xl animate-fade-in mx-auto">
            <header className="mb-8 pb-6 border-b border-gray-200">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Final Submission</h1>
              <p className="text-sm text-gray-500 mt-1">Submit your completed assignment for mentor review.</p>
            </header>
            
            {submissionStatus === "none" ? (
              <form onSubmit={handleSubmission} className="bg-white p-8 border border-gray-200 rounded-2xl shadow-sm">
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Repository URL</label>
                  <p className="text-sm text-gray-500 mb-4">Please ensure your repository is public or accessible to our reviewers.</p>
                  <input
                    type="url"
                    required
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all bg-gray-50 focus:bg-white"
                    placeholder="https://github.com/username/repository"
                  />
                </div>
                
                <div className="flex gap-4 p-5 bg-[#F9F9FB] rounded-xl border border-gray-200 mb-8">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-gray-500 mt-0.5" />
                  <p className="text-sm leading-relaxed text-gray-600">
                    Submissions are final. Make sure you have verified all functionality, tested your deployment, and included a comprehensive <code className="text-xs bg-gray-200 px-1 py-0.5 rounded ml-1">README.md</code> before proceeding.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm flex justify-center items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Submit Project
                </button>
              </form>
            ) : (
              <div className="bg-white p-12 border border-gray-200 rounded-2xl shadow-sm text-center">
                <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 tracking-tight mb-3">Under Review</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-10 leading-relaxed">
                  Your project has been successfully submitted. Our senior mentors will evaluate your work and provide feedback.
                </p>
                
                <div className="text-left bg-[#F9F9FB] rounded-xl p-5 border border-gray-200/60 inline-block w-full max-w-md">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Submitted Link</p>
                  <p className="text-sm font-mono text-gray-700 truncate select-all">{githubLink}</p>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFDFD] font-sans antialiased text-gray-900">
      {/* 
        Ultra Minimal Sidebar - Notion/Linear Inspired 
      */}
      <aside className="w-[260px] bg-[#F7F7F8] border-r border-gray-200 flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 mt-2">
             <div className="w-5 h-5 rounded-[6px] bg-emerald-600 mr-3 shadow-sm"></div>
             <span className="font-bold text-[16px] text-emerald-600 tracking-tight">
               SkillBridge <span className="text-[#0F172A] font-semibold">Workspace</span>
             </span>
          </div>
          
          <div className="px-3 pt-6">
            <div className="text-[11px] font-medium text-gray-400 mb-2 px-3">Overview</div>
            <nav className="space-y-0.5">
              <NavItem icon={<Layout size={15} />} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
              <NavItem icon={<Folder size={15} />} label="Projects" active={activeTab === "projects"} onClick={() => setActiveTab("projects")} />
              <NavItem icon={<CheckSquare size={15} />} label="Timeline" active={activeTab === "progress"} onClick={() => setActiveTab("progress")} disabled={selectedProject === null} />
              <NavItem icon={<Upload size={15} />} label="Submission" active={activeTab === "submission"} onClick={() => setActiveTab("submission")} disabled={selectedProject === null} />
            </nav>
          </div>
        </div>

        <div className="p-3 mb-2">
          <a href="/workspace/login" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg transition-colors w-full">
            <LogOut size={15} />
            Log out
          </a>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Minimal Topbar */}
        <header className="h-14 border-b border-gray-100 flex items-center justify-between px-8 lg:px-12 shrink-0 bg-white">
          <div className="flex items-center text-sm text-gray-500 font-medium capitalize">
             {activeTab === "progress" ? "Timeline" : activeTab}
          </div>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 py-1.5 px-2 rounded-lg transition-colors">
             <div className="text-sm text-gray-700 font-medium">Intern</div>
             <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-[11px] shadow-sm">
               IN
             </div>
          </div>
        </header>

        {/* Clean Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-12 md:px-12 lg:px-20 custom-scrollbar relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, disabled }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
        active 
          ? "bg-white text-emerald-700 shadow-[0_1px_3px_rgb(0,0,0,0.04)] border border-gray-200/50" 
          : disabled 
            ? "opacity-40 cursor-not-allowed text-gray-400 border border-transparent" 
            : "text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 border border-transparent"
      }`}
    >
      <span className={`${active ? "text-emerald-600" : "text-gray-400"}`}>{icon}</span>
      {label}
    </button>
  );
}