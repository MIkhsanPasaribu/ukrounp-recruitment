"use client";

import { useState, useEffect } from "react";
import { ApplicationData, ApplicationStatus } from "@/types";
import AdminDashboard from "@/components/AdminDashboard";
import EnhancedAdminDashboard from "@/components/EnhancedAdminDashboard";
import AdminLogin from "@/components/AdminLogin";
import Pagination from "@/components/Pagination";
import AdminHeaderButtons from "@/components/AdminHeaderButtons";
import RegistrationStatusToggle from "@/components/admin/RegistrationStatusToggle";
import ApplicationDetailModal from "@/components/admin/detail/ApplicationDetailModal";
import ModifyDataModal from "@/components/ModifyDataModal";
import AdminTabNavigation from "@/components/admin/AdminTabNavigation";
import SearchAndFilters from "@/components/admin/SearchAndFilters";
import BulkActions from "@/components/admin/BulkActions";
import ApplicationsTable from "@/components/admin/ApplicationsTable";
import MobileApplicationsView from "@/components/admin/MobileApplicationsView";
import { exportApplicationsToCSV } from "@/utils/csvExport";

// Custom Hooks
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useApplications } from "@/hooks/useApplications";
import { useRegistrationStatus } from "@/hooks/useRegistrationStatus";
import { useBulkOperations } from "@/hooks/useBulkOperations";

export default function AdminPage() {
  // Authentication
  const {
    token,
    admin,
    isAuthenticated,
    loading,
    handleLoginSuccess,
    handleLogout,
  } = useAdminAuth();

  // Registration Status
  const {
    isRegistrationOpen,
    registrationStatusLoading,
    fetchRegistrationStatus,
    toggleRegistrationStatus,
  } = useRegistrationStatus(token);

  // Applications Management
  const {
    applications,
    setApplications,
    loading: applicationsLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    applicationsPerPage,
    setApplicationsPerPage,
    pagination,
    fetchApplications,
    handleStatusUpdate,
    handleDelete,
    handleUpdateSuccess,
  } = useApplications(token);

  // Bulk Operations
  const {
    selectedApplications,
    selectAll,
    setSelectedApplications,
    handleSelectApplication,
    handleSelectAll,
    handleBulkStatusUpdate,
    handleBulkDownloadPDF,
    handleBulkExportCSV,
  } = useBulkOperations(applications, setApplications, token);

  // Tab Management
  const [activeTab, setActiveTab] = useState<
    "overview" | "applications" | "enhanced"
  >("overview");

  // Modal Management
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch registration status when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchRegistrationStatus();
    }
  }, [isAuthenticated, token, fetchRegistrationStatus]);

  // Clear selections when applications change
  useEffect(() => {
    setSelectedApplications([]);
  }, [applications, setSelectedApplications]);

  // Handlers for modals and actions
  const handleShowDetail = (application: ApplicationData) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const handleEditApplication = (application: ApplicationData) => {
    setSelectedApplication(application);
    setShowEditModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedApplication(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedApplication(null);
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          Memuat...
        </div>
      );
    }
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4 sm:gap-0">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Panel Admin
              </h1>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Registration Status Toggle Component */}
              <RegistrationStatusToggle
                isOpen={isRegistrationOpen}
                isLoading={registrationStatusLoading}
                onToggle={toggleRegistrationStatus}
              />

              <AdminHeaderButtons
                onLogout={handleLogout}
                hasApplications={applications.length > 0}
                onExportCSV={() => exportApplicationsToCSV(applications)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab Navigation */}
        <AdminTabNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          applicationsCount={applications.length}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <AdminDashboard
              token={token!}
              admin={admin || undefined}
              onLogout={handleLogout}
            />
          )}

          {/* Enhanced Tab */}
          {activeTab === "enhanced" && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span>🚀</span>
                    Enterprise Dashboard
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Streaming & Caching
                    </span>
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Advanced data management dengan real-time streaming,
                    intelligent caching, dan enterprise-grade performance
                    optimization.
                  </p>
                </div>

                <EnhancedAdminDashboard
                  initialApplications={applications}
                  initialPagination={pagination || undefined}
                />
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <>
              {/* Search and Filters */}
              <SearchAndFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />

              {/* Bulk Actions */}
              <BulkActions
                selectedApplicationsCount={selectedApplications.length}
                onClearSelection={() => setSelectedApplications([])}
                onBulkStatusUpdate={handleBulkStatusUpdate}
                onBulkExportCSV={handleBulkExportCSV}
                onBulkDownloadPDF={handleBulkDownloadPDF}
              />

              {/* Applications Table/List */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                {applicationsLoading ? (
                  <div className="p-8 text-center">
                    Memuat data pendaftaran...
                  </div>
                ) : error ? (
                  <div className="p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="text-red-600 mb-4">
                        <svg
                          className="w-12 h-12 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <p className="text-lg font-semibold">{error}</p>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={() =>
                            fetchApplications(
                              currentPage,
                              applicationsPerPage,
                              searchTerm,
                              statusFilter
                            )
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          disabled={applicationsLoading}
                        >
                          {applicationsLoading
                            ? "Mencoba ulang..."
                            : "Coba Lagi"}
                        </button>
                        <p className="text-sm text-gray-600">
                          Tips: Coba gunakan filter untuk mengurangi jumlah data
                          yang dimuat
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <ApplicationsTable
                      applications={applications}
                      selectedApplications={selectedApplications}
                      selectAll={selectAll}
                      onSelectApplication={handleSelectApplication}
                      onSelectAll={handleSelectAll}
                      onStatusUpdate={handleStatusUpdate}
                      onEditApplication={handleEditApplication}
                      onDelete={handleDelete}
                      onShowDetail={handleShowDetail}
                    />

                    {/* Mobile View */}
                    <MobileApplicationsView
                      applications={applications}
                      selectedApplications={selectedApplications}
                      selectAll={selectAll}
                      onSelectApplication={handleSelectApplication}
                      onSelectAll={handleSelectAll}
                      onStatusUpdate={handleStatusUpdate}
                      onEditApplication={handleEditApplication}
                      onDelete={handleDelete}
                      onShowDetail={handleShowDetail}
                    />

                    {/* Pagination */}
                    <div className="mt-6 px-4 sm:px-0">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={pagination?.totalPages || 1}
                        itemsPerPage={applicationsPerPage}
                        totalItems={pagination?.total || 0}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(newLimit) => {
                          setApplicationsPerPage(newLimit);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedApplication && (
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={handleCloseDetailModal}
          onDelete={handleDelete}
          onStatusChange={(id: string, status: string) =>
            handleStatusUpdate(id, status as ApplicationStatus)
          }
        />
      )}

      {showEditModal && selectedApplication && (
        <ModifyDataModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          isAdminMode={true}
          applicationData={selectedApplication}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
