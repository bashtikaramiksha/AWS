"use client";

import { useEffect, useState, useCallback } from "react";
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function HostedZonesPage() {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editZone, setEditZone] = useState<HostedZone | null>(null);
  const [deleteZoneId, setDeleteZoneId] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<HostedZone | null>(null);

  // Form Fields
  const [domainName, setDomainName] = useState("");
  const [zoneType, setZoneType] = useState<"public" | "private">("public");
  const [description, setDescription] = useState("");

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/hosted-zones?search=${search}&page=${page}&limit=10`);
      if (!res.ok) {
        let errMsg = "Failed to load hosted zones from backend";
        try {
          const data = await res.json();
          if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      setZones(data);
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(`Unable to connect to backend at ${API_BASE}. Make sure the server is running.`);
      } else {
        setError(err.message || "Failed to fetch");
      }
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName) return;

    try {
      const res = await fetch(`${API_BASE}/hosted-zones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain_name: domainName,
          zone_type: zoneType,
          description: description || null,
        }),
      });
      if (!res.ok) {
        let errMsg = "Failed to create hosted zone";
        try {
          const data = await res.json();
          if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {}
        throw new Error(errMsg);
      }
      triggerToast("Hosted zone created successfully");
      setIsCreateOpen(false);
      setDomainName("");
      setDescription("");
      fetchZones();
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        triggerToast(`Unable to connect to backend at ${API_BASE}. Make sure the server is running.`, "error");
      } else {
        triggerToast(err.message || "Error creating zone", "error");
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editZone) return;

    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${editZone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain_name: domainName,
          zone_type: zoneType,
          description: description || null,
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
      triggerToast("Hosted zone updated successfully");
      setEditZone(null);
      setDomainName("");
      setDescription("");
      fetchZones();
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        triggerToast(`Unable to connect to backend at ${API_BASE}. Make sure the server is running.`, "error");
      } else {
        triggerToast(err.message || "Error updating zone", "error");
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteZoneId) return;

    try {
      const res = await fetch(`${API_BASE}/hosted-zones/${deleteZoneId}`, { method: "DELETE" });
      if (!res.ok) {
        let errMsg = "Failed to delete hosted zone";
        try {
          const data = await res.json();
          if (data?.detail) errMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } catch {}
        throw new Error(errMsg);
      }
      triggerToast("Hosted zone deleted successfully");
      setDeleteZoneId(null);
      fetchZones();
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        triggerToast(`Unable to connect to backend at ${API_BASE}. Make sure the server is running.`, "error");
      } else {
        triggerToast(err.message || "Error deleting zone", "error");
      }
    }
  };

  const startEdit = (zone: HostedZone) => {
    setEditZone(zone);
    setDomainName(zone.domain_name);
    setZoneType(zone.zone_type);
    setDescription(zone.description || "");
  };

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

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hosted zones</h1>
          <p className="text-sm text-gray-500">Manage DNS routing configurations for your domain names.</p>
        </div>
        <button
          onClick={() => {
            setIsCreateOpen(true);
            setEditZone(null);
            setDomainName("");
            setDescription("");
          }}
          className="px-4 py-2 bg-[#ff9900] hover:bg-[#e47911] text-white text-sm font-medium rounded transition-colors shadow-sm"
        >
          Create hosted zone
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <input
            type="text"
            placeholder="Filter hosted zones by domain name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-md block w-full px-3 py-1.5 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm"
          />
        </div>

        {/* Content States */}
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading hosted zones...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">Error: {error}</div>
        ) : zones.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="text-gray-400 text-lg">No hosted zones to display</div>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Create a hosted zone to start routing internet traffic to your resources.
            </p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Domain Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Record Count</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/hosted-zones/${zone.id}`}
                        className="text-[#0066cc] hover:underline font-medium text-left"
                      >
                        {zone.domain_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{zone.zone_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.record_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{zone.description || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(zone.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link
                        href={`/hosted-zones/${zone.id}`}
                        className="text-[#0066cc] hover:underline"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => startEdit(zone)}
                        className="text-[#0066cc] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteZoneId(zone.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-xs"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={zones.length < 10}
                className="px-3 py-1 bg-white border border-gray-300 text-sm font-medium rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-xs"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      {(isCreateOpen || editZone) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded border border-gray-300 shadow-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editZone ? "Edit hosted zone" : "Create hosted zone"}
            </h2>
            <form onSubmit={editZone ? handleEdit : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Domain name</label>
                <input
                  type="text"
                  required
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  placeholder="example.com"
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-[#e47911] focus:border-[#e47911] text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditZone(null);
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff9900] hover:bg-[#e47911] text-white text-sm font-semibold rounded shadow-sm"
                >
                  {editZone ? "Save changes" : "Create zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteZoneId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded border border-gray-300 shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Delete hosted zone?</h2>
            <p className="text-sm text-gray-600">
              This action cannot be undone. All DNS routing configuration for this zone will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteZoneId(null)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hosted Zone Details Drawer/Modal */}
      {selectedZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40">
          <div className="bg-white h-full max-w-lg w-full p-6 space-y-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedZone.domain_name}</h2>
                  <p className="text-xs text-gray-500 font-mono">ID: {selectedZone.id}</p>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Zone Type</h3>
                  <p className="text-sm text-gray-900 mt-1 capitalize">{selectedZone.zone_type}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Description</h3>
                  <p className="text-sm text-gray-900 mt-1">{selectedZone.description || "No description provided."}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Record Count</h3>
                  <p className="text-sm text-gray-900 mt-1">2 (Default NS, SOA)</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Created Date</h3>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selectedZone.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Last Modified Date</h3>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selectedZone.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedZone(null)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded text-center border border-gray-300"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
