export default function ProfilesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profiles</h1>
        <p className="text-sm text-gray-500">Manage route53 configurations across multiple AWS accounts and VPCs.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 mb-2">Configuration Profiles</h2>
        <div className="border border-dashed border-gray-300 rounded p-12 text-center text-xs text-gray-400 space-y-2">
          <span className="font-semibold text-gray-500 block">Coming Soon</span>
          <p className="max-w-md mx-auto leading-relaxed">
            Link Route 53 resource associations (Hosted Zones, Resolver rules) into reusable multi-VPC Profiles.
          </p>
        </div>
      </div>
    </div>
  );
}
