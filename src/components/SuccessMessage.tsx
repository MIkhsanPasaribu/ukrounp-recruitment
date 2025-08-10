import Link from "next/link";

export default function SuccessMessage() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      {/* Back button to landing page */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>

      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>{" "}
        <h2 className="mt-3 text-xl font-medium text-gray-900">
          Aplikasi Berhasil Dikirim!
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Terima kasih telah mendaftar ke Unit Kegiatan Robotika UNP. Kami akan
          meninjau aplikasi Anda dan menghubungi Anda segera.
        </p>
        <div className="mt-6">
          <Link href="/status" className="text-blue-600 hover:text-blue-800">
            Cek status aplikasi Anda
          </Link>
        </div>
      </div>
    </div>
  );
}
