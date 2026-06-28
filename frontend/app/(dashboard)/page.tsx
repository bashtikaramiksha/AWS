import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Route 53 Dashboard</h1>
        <p className="text-sm text-gray-500">Simplify DNS routing, domain registration, and health checking.</p>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4 flex space-x-3 text-sm text-blue-800">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <span className="font-semibold">Welcome to Route 53 Clone console.</span> You can configure public and private DNS records globally.
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* DNS Management Card */}
        <div className="bg-white border border-gray-200 rounded p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 font-bold">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2>DNS management</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Create hosted zones to route traffic for your domains. Define A, CNAME, TXT, and other standard DNS records.
          </p>
          <Link
            href="/hosted-zones"
            className="inline-block text-xs font-semibold text-[#0066cc] hover:underline"
          >
            Manage hosted zones &rarr;
          </Link>
        </div>

        {/* Traffic Management Card (Placeholder) */}
        <div className="bg-white border border-gray-200 rounded p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 font-bold">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h2>Traffic flow</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Create traffic policies to route traffic based on geolocation, latency, or failover configurations.
          </p>
          <Link
            href="/traffic-policies"
            className="inline-block text-xs font-semibold text-[#0066cc] hover:underline"
          >
            View traffic policies &rarr;
          </Link>
        </div>

        {/* Health Checking Card (Placeholder) */}
        <div className="bg-white border border-gray-200 rounded p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-gray-900 font-bold">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2>Availability monitoring</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Configure health checks to monitor the status of web servers and automatically fail over DNS records.
          </p>
          <Link
            href="/health-checks"
            className="inline-block text-xs font-semibold text-[#0066cc] hover:underline"
          >
            Configure health checks &rarr;
          </Link>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-2">Metrics & Analytics Summary</h2>
        <div className="border border-dashed border-gray-300 rounded p-8 text-center text-xs text-gray-400">
          <span className="font-semibold text-gray-500 block mb-1">Coming Soon</span>
          DNS queries, request rates, and health metrics graphs will be displayed here.
        </div>
      </div>
    </div>
  );
}
