import Link from 'next/link';

export default function SuccessMessage() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
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
        </svg>
        <h2 className="mt-3 text-xl font-medium text-gray-900">Application Submitted Successfully!</h2>
        <p className="mt-2 text-sm text-gray-500">
          Thank you for applying to ITitanix. We will review your application and get back to you soon.
        </p>
        <div className="mt-6">
          <Link href="/status" className="text-blue-600 hover:text-blue-800">
            Check your application status
          </Link>
        </div>
      </div>
    </div>
  );
}