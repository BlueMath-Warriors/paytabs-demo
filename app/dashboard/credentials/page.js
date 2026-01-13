"use client"

import { useState, useEffect } from "react"

const REGIONS = [
  { value: "global", label: "Global", url: "merchant-global.paytabs.com" },
  { value: "saudi", label: "Saudi Arabia", url: "merchant.paytabs.sa" },
  { value: "uae", label: "UAE", url: "merchant.paytabs.ae" },
  { value: "egypt", label: "Egypt", url: "merchant-egypt.paytabs.com" },
  { value: "oman", label: "Oman", url: "merchant-oman.paytabs.com" },
  { value: "jordan", label: "Jordan", url: "merchant-jordan.paytabs.com" },
]

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    profileId: "",
    serverKey: "",
    region: "global",
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      const response = await fetch("/api/credentials")
      if (response.ok) {
        const data = await response.json()
        setCredentials(data)
      }
    } catch (err) {
      console.error("Error fetching credentials:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create credential")
        setSubmitting(false)
        return
      }

      // Reset form and refresh list
      setFormData({ name: "", profileId: "", serverKey: "", region: "global" })
      setShowForm(false)
      fetchCredentials()
      setSubmitting(false)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this credential?")) {
      return
    }

    try {
      const response = await fetch(`/api/credentials?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchCredentials()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete credential")
      }
    } catch (err) {
      alert("Something went wrong. Please try again.")
    }
  }

  const getRegionLabel = (regionValue) => {
    const region = REGIONS.find((r) => r.value === regionValue)
    return region ? region.label : regionValue
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          API Credentials
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
        >
          {showForm ? "Cancel" : "Add Credential"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
            Add PayTabs Credentials
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2 text-black dark:text-zinc-300">
                Name (e.g., `Production Key`, `Test Key`)
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 transition-all"
                placeholder="My Production Key"
              />
            </div>

            <div>
              <label htmlFor="region" className="block text-sm font-medium mb-2 text-black dark:text-zinc-300">
                PayTabs Region
              </label>
              <select
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 cursor-pointer transition-all"
              >
                {REGIONS.map((region) => (
                  <option key={region.value} value={region.value}>
                    {region.label} ({region.url})
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                Select the region based on your PayTabs merchant dashboard URL
              </p>
            </div>

            <div>
              <label htmlFor="profileId" className="block text-sm font-medium mb-2 text-black dark:text-zinc-300">
                Profile ID
              </label>
              <input
                id="profileId"
                type="text"
                value={formData.profileId}
                onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 transition-all"
                placeholder="987654"
              />
            </div>

            <div>
              <label htmlFor="serverKey" className="block text-sm font-medium mb-2 text-black dark:text-zinc-300">
                Server Key
              </label>
              <textarea
                id="serverKey"
                value={formData.serverKey}
                onChange={(e) => setFormData({ ...formData, serverKey: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 font-mono text-sm transition-all"
                placeholder="SKXXXXXXXXXXXXXXXXXXXXXXXX"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md"
            >
              {submitting ? "Adding..." : "Add Credential"}
            </button>
          </form>
        </div>
      )}

      {credentials.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            No credentials added yet. Add your PayTabs API credentials to get started.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            Add Your First Credential
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {credentials.map((credential) => (
            <div
              key={credential.id}
              className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                      {credential.name}
                    </h3>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {getRegionLabel(credential.region)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Profile ID: <span className="font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{credential.profileId}</span>
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                    Added: {new Date(credential.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(credential.id)}
                  className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
