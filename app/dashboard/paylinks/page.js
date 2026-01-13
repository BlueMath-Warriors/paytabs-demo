"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PayLinksPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [payLinkResult, setPayLinkResult] = useState(null)
  const [formData, setFormData] = useState({
    credentialId: "",
    cartId: "",
    cartCurrency: "PKR",
    cartAmount: "",
    cartDescription: "",
  })

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      const response = await fetch("/api/credentials")
      if (response.ok) {
        const data = await response.json()
        setCredentials(data)
        if (data.length > 0 && !formData.credentialId) {
          setFormData({ ...formData, credentialId: data[0].id })
        }
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
    setPayLinkResult(null)
    setSubmitting(true)

    try {
      const response = await fetch("/api/paylinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create PayLink")
        setSubmitting(false)
        return
      }

      // Store the full result
      setPayLinkResult(data)

      // Reset form
      setFormData({
        credentialId: credentials.length > 0 ? credentials[0].id : "",
        cartId: "",
        cartCurrency: "PKR",
        cartAmount: "",
        cartDescription: "",
      })

      setSubmitting(false)
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">
          Create PayLink
        </h1>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 text-center">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            You need to add PayTabs API credentials first before creating a PayLink.
          </p>
          <button
            onClick={() => router.push("/dashboard/credentials")}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            Add Credentials
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">
        Create PayLink
      </h1>

      {/* Success Result Card - Simple & Clean */}
      {payLinkResult && payLinkResult.payLink?.redirect_url && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium text-green-800 dark:text-green-200">PayLink Created!</span>
            </div>
            <button
              onClick={() => setPayLinkResult(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
            <input
              type="text"
              readOnly
              value={payLinkResult.payLink.redirect_url}
              className="flex-1 bg-transparent text-sm font-mono text-zinc-700 dark:text-zinc-300 outline-none truncate"
            />
            <button
              onClick={() => copyToClipboard(payLinkResult.payLink.redirect_url)}
              className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded cursor-pointer transition-colors"
            >
              Copy
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <a
              href={payLinkResult.payLink.redirect_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setPayLinkResult(null)}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded text-center cursor-pointer transition-colors"
            >
              Open Payment Page →
            </a>
            <button
              onClick={() => setPayLinkResult(null)}
              className="py-2 px-3 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm rounded cursor-pointer transition-colors"
            >
              Create Another
            </button>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 max-w-2xl">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="credentialId" className="block text-sm font-medium mb-2 text-black dark:text-zinc-300">
              Select Credential
            </label>
            <select
              id="credentialId"
              value={formData.credentialId}
              onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 cursor-pointer transition-all"
            >
              {credentials.map((cred) => (
                <option key={cred.id} value={cred.id}>
                  {cred.name} ({cred.region?.toUpperCase() || 'GLOBAL'}) - Profile: {cred.profileId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cartId" className="block text-sm font-medium mb-2 text-black dark:text-zinc-300">
              Cart ID (Unique identifier)
            </label>
            <input
              id="cartId"
              type="text"
              value={formData.cartId}
              onChange={(e) => setFormData({ ...formData, cartId: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 transition-all"
              placeholder="ORDER-12345"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cartCurrency" className="block text-sm font-medium mb-2 text-black dark:text-zinc-300">
                Currency
              </label>
              <select
                id="cartCurrency"
                value={formData.cartCurrency}
                onChange={(e) => setFormData({ ...formData, cartCurrency: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 cursor-pointer transition-all"
              >
                <option value="PKR">PKR - Pakistani Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="AED">AED - UAE Dirham</option>
                <option value="SAR">SAR - Saudi Riyal</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="EGP">EGP - Egyptian Pound</option>
                <option value="OMR">OMR - Omani Rial</option>
                <option value="JOD">JOD - Jordanian Dinar</option>
                <option value="BHD">BHD - Bahraini Dinar</option>
                <option value="KWD">KWD - Kuwaiti Dinar</option>
                <option value="QAR">QAR - Qatari Riyal</option>
              </select>
            </div>

            <div>
              <label htmlFor="cartAmount" className="block text-sm font-medium mb-2 text-black dark:text-zinc-300">
                Amount
              </label>
              <input
                id="cartAmount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.cartAmount}
                onChange={(e) => setFormData({ ...formData, cartAmount: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 transition-all"
                placeholder="100.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cartDescription" className="block text-sm font-medium mb-2 text-black dark:text-zinc-300">
              Description
            </label>
            <textarea
              id="cartDescription"
              value={formData.cartDescription}
              onChange={(e) => setFormData({ ...formData, cartDescription: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 transition-all resize-none"
              placeholder="Payment for order #12345"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating PayLink...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Create PayLink
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
