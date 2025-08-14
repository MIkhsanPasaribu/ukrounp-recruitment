/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";

interface ModifyDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApplicationData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  faculty: string;
  department: string;
  studyProgram: string;
  educationLevel?: "S1" | "D4" | "D3";
  nim: string;
  nia: string;
  nickname?: string;
  gender?: "LAKI_LAKI" | "PEREMPUAN";
  previousSchool?: string;
  padangAddress?: string;
  motivation?: string;
  futurePlans?: string;
  whyYouShouldBeAccepted?: string;
  software?: {
    corelDraw: boolean;
    photoshop: boolean;
    adobePremierePro: boolean;
    adobeAfterEffect: boolean;
    autodeskEagle: boolean;
    arduinoIde: boolean;
    androidStudio: boolean;
    visualStudio: boolean;
    missionPlaner: boolean;
    autodeskInventor: boolean;
    autodeskAutocad: boolean;
    solidworks: boolean;
    others: string;
  };
  // File uploads
  mbtiProof?: string;
  photo?: string;
  studentCard?: string;
  studyPlanCard?: string;
  igFollowProof?: string;
  tiktokFollowProof?: string;
}

export default function ModifyDataModal({
  isOpen,
  onClose,
}: ModifyDataModalProps) {
  const [step, setStep] = useState<"verify" | "edit">("verify");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editedData, setEditedData] = useState<ApplicationData | null>(null);
  const [fileUploads, setFileUploads] = useState({
    mbtiProof: "",
    photo: "",
    studentCard: "",
    studyPlanCard: "",
    igFollowProof: "",
    tiktokFollowProof: "",
  });
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  // Daftar fakultas dan jurusan
  const facultyOptions = [
    "Fakultas Teknik",
    "Fakultas Ilmu Pendidikan",
    "Fakultas Matematika dan Ilmu Pengetahuan Alam",
    "Fakultas Ilmu Sosial",
    "Fakultas Bahasa dan Seni",
    "Fakultas Ilmu Keolahragaan",
    "Fakultas Ekonomi",
    "Fakultas Pariwisata dan Perhotelan",
  ];

  const getNiaFromNim = (nim: string): string => {
    // Remove any non-numeric characters
    const numericNim = nim.replace(/\D/g, "");

    if (!numericNim) return "";

    // Convert to integer and then to hexadecimal
    try {
      const hexValue = parseInt(numericNim, 10).toString(16).toUpperCase();
      return `16.${hexValue}`;
    } catch (error) {
      return "";
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/verify-modification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          birthDate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEditedData(data.data);
        // Initialize file uploads with existing data
        setFileUploads({
          mbtiProof: data.data.mbtiProof || "",
          photo: data.data.photo || "",
          studentCard: data.data.studentCard || "",
          studyPlanCard: data.data.studyPlanCard || "",
          igFollowProof: data.data.igFollowProof || "",
          tiktokFollowProof: data.data.tiktokFollowProof || "",
        });
        setStep("edit");
      } else {
        setErrorMessage(data.message);
      }
    } catch {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!editedData) return;

    setLoading(true);
    setErrorMessage("");

    try {
      // Combine editedData with file uploads
      const dataToUpdate = {
        ...editedData,
        ...fileUploads,
      };

      const response = await fetch("/api/update-application", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToUpdate),
      });

      const result = await response.json();

      if (result.success) {
        alert("Data berhasil diperbarui!");
        handleClose();
      } else {
        setErrorMessage(
          result.message || "Gagal memperbarui data. Silakan coba lagi."
        );
      }
    } catch {
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("verify");
    setEmail("");
    setBirthDate("");
    setEditedData(null);
    setFileUploads({
      mbtiProof: "",
      photo: "",
      studentCard: "",
      studyPlanCard: "",
      igFollowProof: "",
      tiktokFollowProof: "",
    });
    setFileErrors({});
    setErrorMessage("");
    setLoading(false);
    onClose();
  };

  const handleInputChange = (field: keyof ApplicationData, value: string) => {
    if (editedData) {
      const updatedData = {
        ...editedData,
        [field]: value,
      };

      // Auto-update NIA ketika NIM berubah
      if (field === "nim") {
        const calculatedNia = getNiaFromNim(value);
        updatedData.nia = calculatedNia;
      }

      setEditedData(updatedData);
    }
  };

  const handleSoftwareChange = (
    softwareName: string,
    checked: boolean | string
  ) => {
    if (editedData && editedData.software) {
      setEditedData({
        ...editedData,
        software: {
          ...editedData.software,
          [softwareName]: checked,
        },
      });
    }
  };

  const handleFileUpload = (fieldName: string, base64Data: string) => {
    setFileUploads((prev) => ({
      ...prev,
      [fieldName]: base64Data,
    }));
    // Clear any previous error for this field
    setFileErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header - Mobile Responsive */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h3 className="text-lg sm:text-xl font-semibold">
            {step === "verify"
              ? "Verifikasi Data"
              : "Modifikasi Data Pendaftaran"}
          </h3>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 p-1"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        <div className="p-4 sm:p-6">
          {step === "verify" ? (
            <>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Untuk memodifikasi data pendaftaran Anda, silakan verifikasi
                identitas terlebih dahulu dengan memasukkan email dan tanggal
                lahir yang sama dengan yang digunakan saat mendaftar.
              </p>

              <form
                onSubmit={handleVerification}
                className="space-y-4 max-w-md mx-auto"
              >
                <div>
                  <label
                    htmlFor="modify-email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="modify-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Masukkan email yang digunakan saat mendaftar"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="modify-birthDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    id="modify-birthDate"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {loading ? "Memverifikasi..." : "Verifikasi"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            editedData && (
              <>
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <p className="text-green-700 font-medium text-sm sm:text-base">
                      ✓ Verifikasi berhasil untuk: {editedData.fullName}
                    </p>
                    <p className="text-green-600 text-xs sm:text-sm mt-1">
                      Silakan edit data yang ingin Anda ubah. Pastikan semua
                      informasi sudah benar sebelum menyimpan.
                    </p>
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {/* Section 1: Data Pribadi */}
                  <div className="border rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      📋 Data Pribadi
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          value={editedData.fullName || ""}
                          onChange={(e) =>
                            handleInputChange("fullName", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Panggilan
                        </label>
                        <input
                          type="text"
                          value={editedData.nickname || ""}
                          onChange={(e) =>
                            handleInputChange("nickname", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={editedData.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nomor Telepon *
                        </label>
                        <input
                          type="tel"
                          value={editedData.phoneNumber || ""}
                          onChange={(e) =>
                            handleInputChange("phoneNumber", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal Lahir *
                        </label>
                        <input
                          type="date"
                          value={editedData.birthDate || ""}
                          onChange={(e) =>
                            handleInputChange("birthDate", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jenis Kelamin
                        </label>
                        <select
                          value={editedData.gender || ""}
                          onChange={(e) =>
                            handleInputChange("gender", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="LAKI_LAKI">Laki-laki</option>
                          <option value="PEREMPUAN">Perempuan</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Alamat di Padang
                        </label>
                        <textarea
                          value={editedData.padangAddress || ""}
                          onChange={(e) =>
                            handleInputChange("padangAddress", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Data Akademik */}
                  <div className="border rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      🎓 Data Akademik
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fakultas *
                        </label>
                        <select
                          value={editedData.faculty || ""}
                          onChange={(e) =>
                            handleInputChange("faculty", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          required
                        >
                          <option value="">Pilih Fakultas</option>
                          {facultyOptions.map((faculty) => (
                            <option key={faculty} value={faculty}>
                              {faculty}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jurusan *
                        </label>
                        <input
                          type="text"
                          value={editedData.department || ""}
                          onChange={(e) =>
                            handleInputChange("department", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Program Studi *
                        </label>
                        <input
                          type="text"
                          value={editedData.studyProgram || ""}
                          onChange={(e) =>
                            handleInputChange("studyProgram", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NIM *
                        </label>
                        <input
                          type="text"
                          value={editedData.nim || ""}
                          onChange={(e) =>
                            handleInputChange("nim", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NIA *{" "}
                          <span className="text-xs text-gray-500">
                            (Otomatis dari NIM)
                          </span>
                        </label>
                        <input
                          type="text"
                          value={editedData.nia || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed text-sm sm:text-base"
                          readOnly
                          placeholder="NIA akan otomatis terhitung dari NIM"
                        />
                        {editedData.nim && (
                          <div className="mt-1 text-xs text-blue-600">
                            ✓ NIA: {getNiaFromNim(editedData.nim)} (dari NIM:{" "}
                            {editedData.nim})
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Asal Sekolah
                        </label>
                        <input
                          type="text"
                          value={editedData.previousSchool || ""}
                          onChange={(e) =>
                            handleInputChange("previousSchool", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: File Upload */}
                  <div className="border rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      📄 File Upload
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* MBTI Proof */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bukti Tes MBTI *
                        </label>
                        <FileUpload
                          onFileSelected={(base64) =>
                            handleFileUpload("mbtiProof", base64)
                          }
                          error={fileErrors.mbtiProof}
                          required
                        />
                        {fileUploads.mbtiProof && (
                          <div className="mt-2 text-xs text-green-600">
                            ✓ File berhasil diupload/diperbarui
                          </div>
                        )}
                      </div>

                      {/* Photo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Foto Diri *
                        </label>
                        <FileUpload
                          onFileSelected={(base64) =>
                            handleFileUpload("photo", base64)
                          }
                          error={fileErrors.photo}
                          required
                        />
                        {fileUploads.photo && (
                          <div className="mt-2 text-xs text-green-600">
                            ✓ File berhasil diupload/diperbarui
                          </div>
                        )}
                      </div>

                      {/* Student Card */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kartu Mahasiswa *
                        </label>
                        <FileUpload
                          onFileSelected={(base64) =>
                            handleFileUpload("studentCard", base64)
                          }
                          error={fileErrors.studentCard}
                          required
                        />
                        {fileUploads.studentCard && (
                          <div className="mt-2 text-xs text-green-600">
                            ✓ File berhasil diupload/diperbarui
                          </div>
                        )}
                      </div>

                      {/* Study Plan Card */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          KRS (Kartu Rencana Studi) *
                        </label>
                        <FileUpload
                          onFileSelected={(base64) =>
                            handleFileUpload("studyPlanCard", base64)
                          }
                          error={fileErrors.studyPlanCard}
                          required
                        />
                        {fileUploads.studyPlanCard && (
                          <div className="mt-2 text-xs text-green-600">
                            ✓ File berhasil diupload/diperbarui
                          </div>
                        )}
                      </div>

                      {/* IG Follow Proof */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bukti Follow Instagram *
                        </label>
                        <FileUpload
                          onFileSelected={(base64) =>
                            handleFileUpload("igFollowProof", base64)
                          }
                          error={fileErrors.igFollowProof}
                          required
                        />
                        {fileUploads.igFollowProof && (
                          <div className="mt-2 text-xs text-green-600">
                            ✓ File berhasil diupload/diperbarui
                          </div>
                        )}
                      </div>

                      {/* TikTok Follow Proof */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bukti Follow TikTok *
                        </label>
                        <FileUpload
                          onFileSelected={(base64) =>
                            handleFileUpload("tiktokFollowProof", base64)
                          }
                          error={fileErrors.tiktokFollowProof}
                          required
                        />
                        {fileUploads.tiktokFollowProof && (
                          <div className="mt-2 text-xs text-green-600">
                            ✓ File berhasil diupload/diperbarui
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Software Skills */}
                  {editedData.software && (
                    <div className="border rounded-lg p-4 sm:p-6">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                        💻 Kemampuan Software
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {Object.entries({
                          corelDraw: "CorelDraw",
                          photoshop: "Photoshop",
                          adobePremierePro: "Adobe Premiere Pro",
                          adobeAfterEffect: "Adobe After Effect",
                          autodeskEagle: "Autodesk Eagle",
                          arduinoIde: "Arduino IDE",
                          androidStudio: "Android Studio",
                          visualStudio: "Visual Studio",
                          missionPlaner: "Mission Planer",
                          autodeskInventor: "Autodesk Inventor",
                          autodeskAutocad: "Autodesk AutoCAD",
                          solidworks: "SolidWorks",
                        }).map(([key, label]) => (
                          <div key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              id={key}
                              checked={
                                typeof editedData.software?.[
                                  key as keyof typeof editedData.software
                                ] === "boolean"
                                  ? (editedData.software?.[
                                      key as keyof typeof editedData.software
                                    ] as boolean)
                                  : false
                              }
                              onChange={(e) =>
                                handleSoftwareChange(key, e.target.checked)
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={key}
                              className="ml-2 text-xs sm:text-sm text-gray-700 leading-tight"
                            >
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Software Lainnya
                        </label>
                        <input
                          type="text"
                          value={editedData.software?.others || ""}
                          onChange={(e) =>
                            handleSoftwareChange("others", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          placeholder="Sebutkan software lain yang dikuasai"
                        />
                      </div>
                    </div>
                  )}

                  {/* Section 5: Motivasi dan Rencana */}
                  <div className="border rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      💭 Motivasi dan Rencana
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Motivasi bergabung dengan UKRO
                        </label>
                        <textarea
                          value={editedData.motivation || ""}
                          onChange={(e) =>
                            handleInputChange("motivation", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          rows={4}
                          placeholder="Ceritakan motivasi Anda bergabung dengan Unit Kegiatan Robotika"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rencana masa depan
                        </label>
                        <textarea
                          value={editedData.futurePlans || ""}
                          onChange={(e) =>
                            handleInputChange("futurePlans", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          rows={4}
                          placeholder="Ceritakan rencana masa depan Anda"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mengapa Anda harus diterima
                        </label>
                        <textarea
                          value={editedData.whyYouShouldBeAccepted || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "whyYouShouldBeAccepted",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                          rows={4}
                          placeholder="Jelaskan mengapa Anda harus diterima di UKRO"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mt-6">
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                  </div>
                )}

                {/* Action Buttons - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t mt-6">
                  <button
                    onClick={() => setStep("verify")}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    ← Kembali
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
                  >
                    {loading ? "Menyimpan..." : "💾 Simpan Perubahan"}
                  </button>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
