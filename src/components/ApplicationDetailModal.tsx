import { ApplicationData } from "@/types";

interface ApplicationDetailModalProps {
  application: ApplicationData;
  onClose: () => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export default function ApplicationDetailModal({
  application,
  onClose,
  onDelete,
  onStatusChange,
}: ApplicationDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Application Details
            </h2>
            <p className="text-sm text-gray-500">
              Submitted:{" "}
              {application.submittedAt
                ? new Date(application.submittedAt).toLocaleString()
                : "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Application Status Bar */}
          <div className="mb-8 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      application.status === "DITERIMA"
                        ? "bg-green-500"
                        : application.status === "DITOLAK"
                        ? "bg-red-500"
                        : application.status === "INTERVIEW"
                        ? "bg-purple-500"
                        : application.status === "DAFTAR_PENDEK"
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <select
                    value={application.status || "SEDANG_DITINJAU"}
                    onChange={(e) => {
                      onStatusChange(application.id, e.target.value);
                    }}
                    className="font-medium text-gray-800 bg-transparent border-0 focus:ring-0 p-0 pr-7"
                  >
                    <option value="SEDANG_DITINJAU">Sedang Ditinjau</option>
                    <option value="DAFTAR_PENDEK">Masuk Daftar Pendek</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="DITERIMA">Diterima</option>
                    <option value="DITOLAK">Ditolak</option>
                  </select>
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">Application ID</p>
                <p className="font-mono text-sm text-gray-800">
                  {application.id}
                </p>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">Contact</p>
                <a
                  href={`mailto:${application.email}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {application.email}
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-blue-800">
                  Personal Information
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Full Name</span>
                  <span className="font-medium text-gray-900">
                    {application.fullName}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Nickname</span>
                  <span className="text-gray-900">{application.nickname}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Jenis Kelamin</span>
                  <span className="text-gray-900">
                    {application.gender === "LAKI_LAKI"
                      ? "Laki-laki"
                      : application.gender === "PEREMPUAN"
                      ? "Perempuan"
                      : application.gender === "MALE"
                      ? "Laki-laki"
                      : application.gender === "FEMALE"
                      ? "Perempuan"
                      : application.gender || "Tidak diketahui"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Tanggal Lahir</span>
                  <span className="text-gray-900">{application.birthDate}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Nomor Telepon</span>
                  <a
                    href={`tel:${application.phoneNumber}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {application.phoneNumber}
                  </a>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">
                    Alamat di Padang
                  </span>
                  <span className="text-gray-900">
                    {application.padangAddress}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">NIM</span>
                  <span className="font-mono text-gray-900">
                    {application.nim || "Tidak tersedia"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">NIA</span>
                  <span className="font-mono font-medium text-blue-600">
                    {application.nia || "Belum dibuat"}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-green-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-green-800">
                  Informasi Akademik
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Faculty</span>
                  <span className="font-medium text-gray-900">
                    {application.faculty}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Department</span>
                  <span className="text-gray-900">
                    {application.department}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Study Program</span>
                  <span className="text-gray-900">
                    {application.studyProgram}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Previous School</span>
                  <span className="text-gray-900">
                    {application.previousSchool}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Software Experience */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-purple-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-purple-800">
                Software Experience
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {application.software && (
                  <>
                    {application.software.corelDraw && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        CorelDraw
                      </div>
                    )}
                    {application.software.photoshop && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Photoshop
                      </div>
                    )}
                    {application.software.adobePremierePro && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Adobe Premiere Pro
                      </div>
                    )}
                    {application.software.adobeAfterEffect && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Adobe After Effect
                      </div>
                    )}
                    {application.software.autodeskEagle && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Autodesk Eagle
                      </div>
                    )}
                    {application.software.arduinoIde && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Arduino IDE
                      </div>
                    )}
                    {application.software.androidStudio && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Android Studio
                      </div>
                    )}
                    {application.software.visualStudio && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Visual Studio
                      </div>
                    )}
                    {application.software.missionPlaner && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Mission Planer
                      </div>
                    )}
                    {application.software.autodeskInventor && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Autodesk Inventor
                      </div>
                    )}
                    {application.software.autodeskAutocad && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Autodesk Autocad
                      </div>
                    )}
                    {application.software.solidworks && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 flex items-center">
                        <svg
                          className="w-5 h-5 text-purple-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        Solidworks
                      </div>
                    )}
                    {application.software.others && (
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200 col-span-full">
                        <span className="font-medium">Others: </span>
                        {application.software.others}
                      </div>
                    )}
                  </>
                )}
                {!application.software ||
                  (Object.values(application.software).every((val) => !val) && (
                    <p className="col-span-full text-gray-500 italic">
                      No software experience specified
                    </p>
                  ))}
              </div>
            </div>
          </div>

          {/* Essays */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-amber-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-amber-800">Essays</h3>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  Motivation for Joining Robotics:
                </h4>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700">
                  {application.motivation || "Not provided"}
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  Future Plans After Joining:
                </h4>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700">
                  {application.futurePlans || "Not provided"}
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  Why Should Be Accepted:
                </h4>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-700">
                  {application.whyYouShouldBeAccepted || "Not provided"}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete this application? This action cannot be undone."
                  )
                ) {
                  onDelete(application.id);
                  onClose();
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Application
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
