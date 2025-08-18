"use client";

interface AdminTabNavigationProps {
  activeTab: "overview" | "applications" | "enhanced";
  setActiveTab: (tab: "overview" | "applications" | "enhanced") => void;
  applicationsCount: number;
}

export default function AdminTabNavigation({
  activeTab,
  setActiveTab,
  applicationsCount,
}: AdminTabNavigationProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-4 sm:space-x-8">
        {/* Overview Tab */}
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "overview"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <span className="flex items-center gap-1">
            <span>📊</span>
            <span className="hidden sm:inline">Overview & Statistics</span>
            <span className="sm:hidden">Stats</span>
          </span>
        </button>

        {/* Applications Management Tab */}
        <button
          onClick={() => setActiveTab("applications")}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "applications"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <span className="flex items-center gap-1">
            <span>📋</span>
            <span className="hidden sm:inline">
              Manage Applications ({applicationsCount})
            </span>
            <span className="sm:hidden">Data ({applicationsCount})</span>
          </span>
        </button>

        {/* Enhanced Dashboard Tab */}
        <button
          onClick={() => setActiveTab("enhanced")}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === "enhanced"
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <span className="flex items-center gap-1">
            <span>🚀</span>
            <span className="hidden sm:inline">Enterprise Dashboard</span>
            <span className="sm:hidden">Enhanced</span>
          </span>
        </button>
      </nav>
    </div>
  );
}
