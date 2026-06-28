export default function HealthChecksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health checks</h1>
        <p className="text-sm text-gray-500">Monitor health status of web servers, endpoints, and other resources.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-2">Server Status Monitor</h2>
        <div className="border border-dashed border-gray-300 rounded p-12 text-center text-xs text-gray-400 space-y-2">
          <span className="font-semibold text-gray-500 block">Coming Soon</span>
          <p className="max-w-md mx-auto leading-relaxed">
            Configure HTTP/HTTPS/TCP health checks, alarm actions, and status dashboards.
          </p>
        </div>
      </div>
    </div>
  );
}
