"use client";

import { UseModalNavigationReturn } from "@/hooks/admin/useModalNavigation";

interface DetailModalTabsProps {
  navigation: UseModalNavigationReturn;
  className?: string;
}

export default function DetailModalTabs({
  navigation,
  className = "",
}: DetailModalTabsProps) {
  const {
    activeTab,
    visibleTabs,
    navigateToTab,
    isTabVisited,
    getTabProgress,
  } = navigation;
  const progress = getTabProgress;

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">
            Progress Tinjauan
          </span>
          <span className="text-xs text-gray-500">
            {progress.visited} dari {progress.total} bagian
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 pt-3">
        <nav className="flex space-x-1" aria-label="Tabs">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isVisited = isTabVisited(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => navigateToTab(tab.id)}
                className={`
                  relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  flex items-center gap-2 min-w-0 group
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-blue-200 border"
                      : isVisited
                      ? "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
                title={tab.description}
              >
                {/* Tab Icon */}
                <span className="text-base shrink-0">{tab.icon}</span>

                {/* Tab Label */}
                <span className="truncate">{tab.label}</span>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 rounded-full"></div>
                )}

                {/* Visited Indicator */}
                {isVisited && !isActive && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent to-transparent group-hover:from-blue-50/50 group-hover:to-transparent transition-all duration-200"></div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Current Tab Info */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        {(() => {
          const currentTab = visibleTabs.find((tab) => tab.id === activeTab);
          if (!currentTab) return null;

          return (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentTab.icon}</span>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {currentTab.label}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {currentTab.description}
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2">
                {navigation.canGoBack && (
                  <button
                    onClick={navigation.goBack}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-all"
                    title="Kembali ke tab sebelumnya"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                )}

                {navigation.canGoNext && (
                  <button
                    onClick={navigation.goNext}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-all"
                    title="Lanjut ke tab berikutnya"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
