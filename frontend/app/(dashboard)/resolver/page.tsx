export default function ResolverPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resolver</h1>
        <p className="text-sm text-gray-500">Configure VPC DNS resolution rules and DNS query logging endpoints.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-2">VPC DNS Inbound / Outbound Endpoints</h2>
        <div className="border border-dashed border-gray-300 rounded p-12 text-center text-xs text-gray-400 space-y-2">
          <span className="font-semibold text-gray-500 block">Coming Soon</span>
          <p className="max-w-md mx-auto leading-relaxed">
            Inbound and outbound endpoints for forwarding queries between VPCs and on-premises networks.
          </p>
        </div>
      </div>
    </div>
  );
}
