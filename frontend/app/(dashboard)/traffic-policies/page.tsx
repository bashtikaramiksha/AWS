export default function TrafficPoliciesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Traffic policies</h1>
        <p className="text-sm text-gray-500">Create complex routing configurations using visual map policies.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-2">Policy Map Configuration</h2>
        <div className="border border-dashed border-gray-300 rounded p-12 text-center text-xs text-gray-400 space-y-2">
          <span className="font-semibold text-gray-500 block">Coming Soon</span>
          <p className="max-w-md mx-auto leading-relaxed">
            Traffic Flow visual canvas to connect Geo-location, Failover, and Latency rules will be implemented in this section.
          </p>
        </div>
      </div>
    </div>
  );
}
