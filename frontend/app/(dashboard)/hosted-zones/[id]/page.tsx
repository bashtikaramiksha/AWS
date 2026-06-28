"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HostedZone {
  id: number;
  domain_name: string;
  zone_type: "public" | "private";
  description?: string;
  record_count: number;
  created_at: string;
  updated_at: string;
}

interface DNSRecord {
  id: number;
  hosted_zone_id: number;
  record_name: string;
  record_type: "A" | "AAAA" | "CNAME" | "TXT" | "MX" | "NS" | "PTR" | "SRV" | "CAA";
  value: string;
  ttl: number;
  routing_policy: string;
  created_at: string;
  updated_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const RECORD_TYPES = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"];

export default function HostedZoneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // Hosted Zone State
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"records" | "details">("records");

  // DNS Records State
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // Search, Filter & Pagination for Records
  const [recSearch, setRecSearch] = useState("");
  const [recTypeFilter, setRecTypeFilter] = useState("");
  const [recPage, setRecPage] = useState(1);

  // Bulk Selection
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);

  // Edit / Delete Modals for Zone
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Zone Form Fields
  const [domainName, setDomainName] = useState("");
  const [zoneType, setZoneType] = useState<"public" | "private">("public");
  const [zoneDesc, setZoneDesc] = useState("");

  // Record Modals
  const [isCreateRecordOpen, setIsCreateRecordOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DNSRecord | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<number | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Export Dropdown State
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Record Form Fields
  const [recName, setRecName] = useState("");
  const [recType, setRecType] = useState<DNSRecord["record_type"]>("A");
  const [recValue, setRecValue] = useState("");
  const [recTTL, setRecTTL] = useState(300);
  const [recRouting, setRecRouting] = useState("Simple");

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchZoneDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${id}`);
      if (!res.ok) {
        let errMsg = "Failed to load hosted zone details";
        try {
          const data = await res.json();
          if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setZone(data);
      setDomainName(data.domain_name);
      setZoneType(data.zone_type);
      setZoneDesc(data.description || "");
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(`Unable to connect to backend at ${API_BASE}. Make sure the server is running.`);
      } else {
        setError(err.message || "Error connecting to backend");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      let url = `${API_BASE}/hosted-zones/${id}/records?page=${recPage}&limit=10`;
      if (recSearch) url += `&search=${recSearch}`;
      if (recTypeFilter) url += `&type=${recTypeFilter}`;

      const res = await fetch(url);
      if (!res.ok) {
        let errMsg = "Failed to load DNS records";
        try {
          const data = await res.json();
          if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setRecords(data);
      setSelectedRecordIds([]); // Reset selection on page or search change
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setRecordsError("Unable to connect to backend server.");
      } else {
        setRecordsError(err.message || "Failed to fetch records.");
      }
    } finally {
      setRecordsLoading(false);
    }
  }, [id, recSearch, recTypeFilter, recPage]);

  useEffect(() => {
    fetchZoneDetails();
  }, [id]);

  useEffect(() => {
    if (activeTab === "records") {
      fetchRecords();
    }
  }, [activeTab, fetchRecords]);

  // Zone Handlers
  const handleEditZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain_name: domainName,
          zone_type: zoneType,
          description: zoneDesc || null,
        }),
      });
      if (!res.ok) {
        let errMsg = "Failed to update hosted zone";
        try {
          const data = await res.json();
          if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {}
        throw new Error(errMsg);
      }
      setIsEditing(false);
      triggerToast("Hosted zone updated successfully");
      fetchZoneDetails();
    } catch (err: any) {
      triggerToast(err.message || "Error updating hosted zone", "error");
    }
  };

  const handleDeleteZone = async () => {
    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${id}`, { method: "DELETE" });
      if (!res.ok) {
        let errMsg = "Failed to delete hosted zone";
        try {
          const data = await res.json();
          if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {}
        throw new Error(errMsg);
      }
      router.push("/hosted-zones");
    } catch (err: any) {
      triggerToast(err.message || "Error deleting hosted zone", "error");
    }
  };

  // DNS Record Handlers
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${id}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record_name: recName,
          record_type: recType,
          value: recValue,
          ttl: recTTL,
          routing_policy: recRouting,
        }),
      });
      if (!res.ok) {
        let errMsg = "Failed to create DNS record";
        try {
          const data = await res.json();
          if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {}
        throw new Error(errMsg);
      }
      setIsCreateRecordOpen(false);
      triggerToast("DNS record created successfully");
      setRecName("");
      setRecValue("");
      setRecTTL(300);
      setRecRouting("Simple");
      fetchRecords();
      fetchZoneDetails();
    } catch (err: any) {
      triggerToast(err.message || "Error creating DNS record", "error");
    }
  };

  const handleEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${id}/records/${editRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record_name: recName,
          record_type: recType,
          value: recValue,
          ttl: recTTL,
          routing_policy: recRouting,
        }),
      });
      if (!res.ok) {
        let errMsg = "Failed to update DNS record";
        try {
          const data = await res.json();
          if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {}
        throw new Error(errMsg);
      }
      setEditRecord(null);
      triggerToast("DNS record updated successfully");
      setRecName("");
      setRecValue("");
      setRecTTL(300);
      setRecRouting("Simple");
      fetchRecords();
    } catch (err: any) {
      triggerToast(err.message || "Error updating DNS record", "error");
    }
  };

  const handleDeleteRecord = async () => {
    if (!deleteRecordId) return;
    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${id}/records/${deleteRecordId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let errMsg = "Failed to delete DNS record";
        try {
          const data = await res.json();
          if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {}
        throw new Error(errMsg);
      }
      setDeleteRecordId(null);
      triggerToast("DNS record deleted successfully");
      fetchRecords();
      fetchZoneDetails();
    } catch (err: any) {
      triggerToast(err.message || "Error deleting DNS record", "error");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${id}/records/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record_ids: selectedRecordIds }),
      });
      if (!res.ok) throw new Error("Failed to bulk delete DNS records");
      setIsBulkDeleting(false);
      setSelectedRecordIds([]);
      triggerToast("Selected DNS records deleted successfully");
      fetchRecords();
      fetchZoneDetails();
    } catch (err: any) {
      triggerToast(err.message || "Error during bulk delete", "error");
    }
  };

  // Export handlers
  const handleExportJson = async () => {
    setIsExportOpen(false);
    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${id}/export/json`);
      if (!res.ok) throw new Error("Failed to export hosted zone details");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${zone?.domain_name || "zone"}-export.json`;
      a.click();
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const handleExportBind = async () => {
    setIsExportOpen(false);
    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${id}/export/bind`);
      if (!res.ok) throw new Error("Failed to export hosted zone in BIND format");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${zone?.domain_name || "zone"}.zone`;
      a.click();
    } catch (err: any) {
      triggerToast(err.message, "error");
    }
  };

  const startEditRecord = (record: DNSRecord) => {
    setEditRecord(record);
    setRecName(record.record_name);
    setRecType(record.record_type);
    setRecValue(record.value);
    setRecTTL(record.ttl);
    setRecRouting(record.routing_policy);
  };

  // Checkbox toggle helpers
  const handleSelectRecord = (recordId: number) => {
    setSelectedRecordIds((prev) =>
      prev.includes(recordId) ? prev.filter((rid) => rid !== recordId) : [...prev, recordId]
    );
  };

  const handleSelectAllRecords = () => {
    if (selectedRecordIds.length === records.length) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(records.map((r) => r.id));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading hosted zone details...</div>;
  }

  if (error || !zone) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-600 font-medium">Error: {error || "Zone not found"}</div>
        <Link href="/hosted-zones" className="text-[#0066cc] hover:underline text-sm">
          Back to Hosted zones
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded shadow-lg text-white text-sm font-medium ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 space-x-2">
        <Link href="/" className="hover:underline">Route 53</Link>
        <span>&gt;</span>
        <Link href="/hosted-zones" className="hover:underline">Hosted zones</Link>
        <span>&gt;</span>
        <span className="font-semibold text-gray-700">{zone.domain_name}</span>
      </nav>

      {/* Title Header */}
      <div className="flex justify-between items-start border-b border-gray-200 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">{zone.domain_name}</h1>
          <div className="flex items-center space-x-4 text-xs text-gray-500 font-mono">
            <span>Hosted zone ID: {zone.id}</span>
            <span>Type: <span className="capitalize">{zone.zone_type}</span></span>
            <span>Records: {zone.record_count}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 select-none">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded shadow-xs flex items-center space-x-1"
            >
              <span>Export zone</span>
              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-50 text-sm py-1">
                <button
                  onClick={handleExportJson}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Export as JSON
                </button>
                <button
                  onClick={handleExportBind}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Export as BIND format
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded shadow-xs"
          >
            Edit hosted zone
          </button>
          <button
            onClick={() => setIsDeleting(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded shadow-xs"
          >
            Delete hosted zone
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 select-none">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("records")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "records"
                ? "border-[#ff9900] text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Records
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "details"
                ? "border-[#ff9900] text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Hosted zone details
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-6 min-h-[300px]">
        {activeTab === "records" ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center select-none">
              <h2 className="text-lg font-semibold text-gray-900">Records ({zone.record_count})</h2>
              <div className="flex space-x-3">
                {selectedRecordIds.length > 0 && (
                  <button
                    onClick={() => setIsBulkDeleting(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded shadow-sm transition-colors"
                  >
                    Delete selected ({selectedRecordIds.length})
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsCreateRecordOpen(true);
                    setEditRecord(null);
                    setRecName("");
                    setRecValue("");
                    setRecTTL(300);
                    setRecRouting("Simple");
                  }}
                  className="px-4 py-2 bg-[#ff9900] hover:bg-[#e47911] text-white text-sm font-semibold rounded shadow-sm transition-colors"
                >
                  Create record
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 border border-gray-200 rounded">
              <input
                type="text"
                placeholder="Search by name or value"
                value={recSearch}
                onChange={(e) => {
                  setRecSearch(e.target.value);
                  setRecPage(1);
                }}
                className="max-w-xs block w-full px-3 py-1.5 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm"
              />
              <select
                value={recTypeFilter}
                onChange={(e) => {
                  setRecTypeFilter(e.target.value);
                  setRecPage(1);
                }}
                className="block w-40 px-3 py-1.5 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm bg-white"
              >
                <option value="">All Record Types</option>
                {RECORD_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* DNS Records Table */}
            {recordsLoading ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading DNS records...</div>
            ) : recordsError ? (
              <div className="p-8 text-center text-sm text-red-600">Error: {recordsError}</div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded">
                No DNS records found.
              </div>
            ) : (
              <div className="border border-gray-200 rounded overflow-hidden shadow-xs">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 select-none">
                    <tr>
                      <th className="px-6 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          checked={selectedRecordIds.length === records.length}
                          onChange={handleSelectAllRecords}
                          className="h-4 w-4 text-[#e47911] focus:ring-[#e47911] border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Record Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Routing Policy</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">TTL (Seconds)</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 font-mono text-xs">
                    {records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRecordIds.includes(rec.id)}
                            onChange={() => handleSelectRecord(rec.id)}
                            className="h-4 w-4 text-[#e47911] focus:ring-[#e47911] border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{rec.record_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                          <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-300 text-gray-800">{rec.record_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-sans capitalize">{rec.routing_policy}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={rec.value}>{rec.value}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-sans">{rec.ttl}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-sans font-medium space-x-3">
                          <button
                            onClick={() => startEditRecord(rec)}
                            className="text-[#0066cc] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteRecordId(rec.id)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Records Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between font-sans select-none">
                  <button
                    onClick={() => setRecPage((p) => Math.max(p - 1, 1))}
                    disabled={recPage === 1}
                    className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">Page {recPage}</span>
                  <button
                    onClick={() => setRecPage((p) => p + 1)}
                    disabled={records.length < 10}
                    className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Hosted zone details</h2>
            <div className="grid grid-cols-2 gap-6 max-w-2xl">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Domain Name</h3>
                <p className="text-sm text-gray-900 mt-1">{zone.domain_name}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Hosted Zone ID</h3>
                <p className="text-sm text-gray-900 mt-1 font-mono">{zone.id}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</h3>
                <p className="text-sm text-gray-900 mt-1 capitalize">{zone.zone_type}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Record Count</h3>
                <p className="text-sm text-gray-900 mt-1">{zone.record_count}</p>
              </div>
              <div className="col-span-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</h3>
                <p className="text-sm text-gray-900 mt-1">{zone.description || "No description provided."}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Created At</h3>
                <p className="text-sm text-gray-900 mt-1">{new Date(zone.created_at).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Modified At</h3>
                <p className="text-sm text-gray-900 mt-1">{new Date(zone.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Record Modal */}
      {(isCreateRecordOpen || editRecord) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded border border-gray-300 shadow-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editRecord ? "Edit DNS record" : "Create DNS record"}
            </h2>
            <form onSubmit={editRecord ? handleEditRecord : handleCreateRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Record name</label>
                <div className="flex items-center mt-1">
                  <input
                    type="text"
                    required
                    value={recName}
                    onChange={(e) => setRecName(e.target.value)}
                    placeholder="www"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm"
                  />
                  <span className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r text-gray-500 text-sm font-mono">
                    .{zone.domain_name}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Record type</label>
                <select
                  value={recType}
                  onChange={(e) => setRecType(e.target.value as DNSRecord["record_type"])}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm bg-white"
                >
                  {RECORD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Value (IP or Domain)</label>
                <textarea
                  required
                  value={recValue}
                  onChange={(e) => setRecValue(e.target.value)}
                  placeholder={recType === "A" ? "192.0.2.1" : "example.com"}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm font-mono"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">TTL (Seconds)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={recTTL}
                    onChange={(e) => setRecTTL(parseInt(e.target.value) || 300)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Routing policy</label>
                  <select
                    value={recRouting}
                    onChange={(e) => setRecRouting(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm bg-white"
                  >
                    <option value="Simple">Simple routing</option>
                    <option value="Weighted">Weighted</option>
                    <option value="Latency">Latency</option>
                    <option value="Failover">Failover</option>
                    <option value="Geolocation">Geolocation</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateRecordOpen(false);
                    setEditRecord(null);
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff9900] hover:bg-[#e47911] text-white text-sm font-semibold rounded shadow-sm"
                >
                  {editRecord ? "Save changes" : "Create record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      {deleteRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded border border-gray-300 shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Delete DNS record?</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete this DNS record? This action will immediately affect internet routing.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteRecordId(null)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecord}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded border border-gray-300 shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Delete selected DNS records?</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete the {selectedRecordIds.length} selected DNS records? This action cannot be undone and will affect internet routing.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsBulkDeleting(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded shadow-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded border border-gray-300 shadow-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Edit hosted zone</h2>
            <form onSubmit={handleEditZone} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Domain name</label>
                <input
                  type="text"
                  required
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Type</label>
                <select
                  value={zoneType}
                  onChange={(e) => setZoneType(e.target.value as "public" | "private")}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm"
                >
                  <option value="public">Public hosted zone</option>
                  <option value="private">Private hosted zone</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Description (Optional)</label>
                <textarea
                  value={zoneDesc}
                  onChange={(e) => setZoneDesc(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff9900] hover:bg-[#e47911] text-white text-sm font-semibold rounded shadow-sm"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Zone Modal */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded border border-gray-300 shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Delete hosted zone?</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to permanently delete this hosted zone? All configuration will be lost.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteZone}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
