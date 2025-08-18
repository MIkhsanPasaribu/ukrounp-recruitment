"use client";

import { useState, useCallback } from "react";

export type DetailModalTab =
  | "overview"
  | "personal"
  | "academic"
  | "software"
  | "essays"
  | "files"
  | "actions";

export interface TabConfig {
  id: DetailModalTab;
  label: string;
  icon: string;
  description: string;
}

export const TAB_CONFIGS: TabConfig[] = [
  {
    id: "overview",
    label: "Ringkasan",
    icon: "📋",
    description: "Status dan informasi utama pendaftaran",
  },
  {
    id: "personal",
    label: "Data Pribadi",
    icon: "👤",
    description: "Informasi identitas dan kontak",
  },
  {
    id: "academic",
    label: "Data Akademik",
    icon: "🎓",
    description: "Informasi pendidikan dan akademik",
  },
  {
    id: "software",
    label: "Pengalaman Software",
    icon: "💻",
    description: "Keahlian software dan teknologi",
  },
  {
    id: "essays",
    label: "Esai",
    icon: "📝",
    description: "Jawaban esai pendaftaran",
  },
  {
    id: "files",
    label: "Berkas Upload",
    icon: "📁",
    description: "File dan dokumen yang diupload",
  },
  {
    id: "actions",
    label: "Aksi",
    icon: "⚙️",
    description: "Tindakan administratif",
  },
];

interface UseModalNavigationProps {
  initialTab?: DetailModalTab;
  availableTabs?: DetailModalTab[];
}

export function useModalNavigation({
  initialTab = "overview",
  availableTabs = TAB_CONFIGS.map((t) => t.id),
}: UseModalNavigationProps = {}) {
  const [activeTab, setActiveTab] = useState<DetailModalTab>(initialTab);
  const [tabHistory, setTabHistory] = useState<DetailModalTab[]>([initialTab]);
  const [tabData, setTabData] = useState<
    Partial<Record<DetailModalTab, unknown>>
  >({});

  // Get filtered tab configs based on available tabs
  const visibleTabs = TAB_CONFIGS.filter((tab) =>
    availableTabs.includes(tab.id)
  );

  // Navigate to specific tab
  const navigateToTab = useCallback(
    (tab: DetailModalTab) => {
      if (!availableTabs.includes(tab)) return;

      setActiveTab(tab);
      setTabHistory((prev) => {
        const newHistory = prev.filter((t) => t !== tab);
        return [...newHistory, tab];
      });
    },
    [availableTabs]
  );

  // Go to previous tab
  const goBack = useCallback(() => {
    if (tabHistory.length <= 1) return;

    const newHistory = [...tabHistory];
    newHistory.pop(); // Remove current tab
    const previousTab = newHistory[newHistory.length - 1];

    setActiveTab(previousTab);
    setTabHistory(newHistory);
  }, [tabHistory]);

  // Go to next tab in sequence
  const goNext = useCallback(() => {
    const currentIndex = visibleTabs.findIndex((tab) => tab.id === activeTab);
    if (currentIndex < visibleTabs.length - 1) {
      const nextTab = visibleTabs[currentIndex + 1];
      navigateToTab(nextTab.id);
    }
  }, [activeTab, visibleTabs, navigateToTab]);

  // Check if can go back/next
  const canGoBack = tabHistory.length > 1;
  const canGoNext = () => {
    const currentIndex = visibleTabs.findIndex((tab) => tab.id === activeTab);
    return currentIndex < visibleTabs.length - 1;
  };

  // Get current tab config
  const getCurrentTab = () => {
    return visibleTabs.find((tab) => tab.id === activeTab);
  };

  // Store data for specific tab
  const setDataForTab = useCallback((tab: DetailModalTab, data: unknown) => {
    setTabData((prev) => ({
      ...prev,
      [tab]: data,
    }));
  }, []);

  // Get data for specific tab
  const getDataForTab = useCallback(
    (tab: DetailModalTab) => {
      return tabData[tab];
    },
    [tabData]
  );

  // Reset navigation state
  const reset = useCallback((newInitialTab: DetailModalTab = "overview") => {
    setActiveTab(newInitialTab);
    setTabHistory([newInitialTab]);
    setTabData({} as Partial<Record<DetailModalTab, unknown>>);
  }, []);

  // Check if tab has been visited
  const isTabVisited = useCallback(
    (tab: DetailModalTab) => {
      return tabHistory.includes(tab);
    },
    [tabHistory]
  );

  // Get tab progress (for showing completion status)
  const getTabProgress = useCallback(() => {
    return {
      visited: tabHistory.length,
      total: visibleTabs.length,
      percentage: Math.round((tabHistory.length / visibleTabs.length) * 100),
    };
  }, [tabHistory, visibleTabs]);

  return {
    // State
    activeTab,
    visibleTabs,
    tabHistory,

    // Navigation
    navigateToTab,
    goBack,
    goNext,
    reset,

    // Utilities
    canGoBack,
    canGoNext: canGoNext(),
    getCurrentTab: getCurrentTab(),
    isTabVisited,
    getTabProgress: getTabProgress(),

    // Data management
    setDataForTab,
    getDataForTab,
  };
}

export type UseModalNavigationReturn = ReturnType<typeof useModalNavigation>;
