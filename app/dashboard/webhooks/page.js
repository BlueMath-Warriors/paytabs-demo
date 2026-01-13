"use client";

import { useState, useEffect } from "react";

export default function WebhooksPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  useEffect(() => {
    fetchLogs();
    fetchWebhookUrl();
    // Refresh logs every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchWebhookUrl = async () => {
    try {
      // Fetch user info to get user ID
      const response = await fetch("/api/webhooks/user-id");
      if (response.ok) {
        const data = await response.json();
        const baseUrl =
          typeof window !== "undefined" ? window.location.origin : "";
        setWebhookUrl(`${baseUrl}/api/webhook/${data.userId}`);
      }
    } catch (err) {
      console.error("Error fetching webhook URL:", err);
    }
  };

  const fetchLogs = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const response = await fetch("/api/webhooks");
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Error fetching webhook logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status, verified) => {
    if (!status) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          No Status
        </span>
      );
    }

    const lowerStatus = status.toLowerCase();
    if (
      lowerStatus.includes("success") ||
      lowerStatus.includes("approved") ||
      lowerStatus === "a"
    ) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
          {status}
        </span>
      );
    }
    if (
      lowerStatus.includes("failed") ||
      lowerStatus.includes("declined") ||
      lowerStatus === "d"
    ) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
          {status}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-600 dark:text-zinc-400">
            Loading webhook logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
            Webhook Logs
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Auto-refreshes every 10 seconds
          </p>
        </div>
        <button
          onClick={() => fetchLogs(true)}
          disabled={refreshing}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium cursor-pointer flex items-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          {refreshing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}
          Refresh
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black dark:text-zinc-50 mb-2">
            No Webhook Logs Yet
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4 max-w-md mx-auto">
            Webhook notifications from PayTabs will appear here after a payment
            is processed. Make sure your application is publicly accessible for
            PayTabs to send webhooks.
          </p>
          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg text-left max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                Webhook URL
              </p>
              {webhookUrl && (
                <button
                  onClick={() => navigator.clipboard.writeText(webhookUrl)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Copy
                </button>
              )}
            </div>
            <code className="text-sm text-blue-600 dark:text-blue-400 break-all block">
              {webhookUrl || "Loading..."}
            </code>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() =>
                  setSelectedLog(selectedLog?.id === log.id ? null : log)
                }
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          log.verified
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {log.verified ? "✓ Verified" : "✗ Unverified"}
                      </span>
                      {log.status && getStatusBadge(log.status, log.verified)}
                    </div>

                    {log.transactionId && (
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
                        <span className="text-zinc-500 dark:text-zinc-400">
                          Transaction ID:
                        </span>{" "}
                        <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                          {log.transactionId}
                        </span>
                      </p>
                    )}

                    <p className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatDate(log.createdAt)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLog(selectedLog?.id === log.id ? null : log);
                    }}
                    className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    {selectedLog?.id === log.id ? (
                      <>
                        Hide Details
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        View Details
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {selectedLog?.id === log.id && (
                <div className="px-5 pb-5 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Payload Data
                      </h4>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            JSON.stringify(log.payload, null, 2)
                          )
                        }
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Copy JSON
                      </button>
                    </div>
                    <pre className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto text-xs text-zinc-700 dark:text-zinc-300 font-mono max-h-96">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Showing {logs.length} webhook log{logs.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
