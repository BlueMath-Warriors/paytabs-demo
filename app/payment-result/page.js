"use client"

import { useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const [showRaw, setShowRaw] = useState(false)

  // Compute all values from searchParams using useMemo (no useEffect needed)
  const { result, allParams } = useMemo(() => {
    // Collect all URL parameters for debugging
    const params = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    // Parse PayTabs return parameters (different possible field names)
    const tranRef = searchParams.get("tranRef") || searchParams.get("tran_ref") || searchParams.get("transaction_ref")
    const cartId = searchParams.get("cartId") || searchParams.get("cart_id")
    const respStatus = searchParams.get("respStatus") || searchParams.get("payment_result") || searchParams.get("result")
    const respCode = searchParams.get("respCode") || searchParams.get("response_code") || searchParams.get("code")
    const respMessage = searchParams.get("respMessage") || searchParams.get("response_message") || searchParams.get("message")
    const acquirerMessage = searchParams.get("acquirerMessage") || searchParams.get("aquirerMessage") || searchParams.get("acquirer_message")
    const customerEmail = searchParams.get("customerEmail") || searchParams.get("customer_email")
    const cartAmount = searchParams.get("cartAmount") || searchParams.get("cart_amount") || searchParams.get("amount")
    const cartCurrency = searchParams.get("cartCurrency") || searchParams.get("cart_currency") || searchParams.get("currency")
    const noParams = searchParams.get("no_params")
    const processingError = searchParams.get("error")

    // Determine payment status
    let status = "unknown"
    let icon = "clock"

    if (respStatus === "A" || respCode === "0" || respCode === "00") {
      status = "approved"
      icon = "check"
    } else if (respStatus === "D" || respStatus === "E" || (respCode && parseInt(respCode) > 0)) {
      status = "declined"
      icon = "x"
    } else if (respStatus === "P" || respStatus === "H") {
      status = "pending"
    }

    if (status === "unknown" && (tranRef || Object.keys(params).length > 1)) {
      if (respMessage?.toLowerCase().includes("success") || respMessage?.toLowerCase().includes("approved") || respMessage?.toLowerCase().includes("authorised")) {
        status = "approved"
        icon = "check"
      }
    }

    if (processingError) {
      status = "error"
      icon = "x"
    }

    if (noParams === "true" && Object.keys(params).length <= 1) {
      status = "no_data"
    }

    return {
      result: {
        tranRef,
        cartId,
        respStatus,
        respCode,
        respMessage,
        acquirerMessage,
        customerEmail,
        cartAmount,
        cartCurrency,
        status,
        icon,
      },
      allParams: params
    }
  }, [searchParams])

  // Status-based styling
  const getStatusStyles = () => {
    switch (result.status) {
      case "approved":
        return {
          gradient: "from-emerald-500 to-teal-600",
          iconBg: "bg-emerald-500",
          cardBg: "bg-gradient-to-br from-emerald-50 to-teal-50",
          border: "border-emerald-300",
          text: "text-emerald-700",
          glow: "shadow-emerald-500/20"
        }
      case "declined":
      case "error":
        return {
          gradient: "from-red-500 to-rose-600",
          iconBg: "bg-red-500",
          cardBg: "bg-gradient-to-br from-red-50 to-rose-50",
          border: "border-red-300",
          text: "text-red-700",
          glow: "shadow-red-500/20"
        }
      case "pending":
        return {
          gradient: "from-amber-500 to-orange-600",
          iconBg: "bg-amber-500",
          cardBg: "bg-gradient-to-br from-amber-50 to-orange-50",
          border: "border-amber-300",
          text: "text-amber-700",
          glow: "shadow-amber-500/20"
        }
      default:
        return {
          gradient: "from-slate-500 to-zinc-600",
          iconBg: "bg-slate-500",
          cardBg: "bg-gradient-to-br from-slate-50 to-zinc-50",
          border: "border-slate-300",
          text: "text-slate-700",
          glow: "shadow-slate-500/20"
        }
    }
  }

  const styles = getStatusStyles()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-3">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <span className="text-purple-200 text-sm font-medium">PayTabs Demo</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Payment Result</h1>
        </div>

        {/* Status Card */}
        <div className={`p-6 rounded-2xl border-2 ${styles.cardBg} ${styles.border} mb-6 shadow-2xl ${styles.glow}`}>
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${styles.gradient} shadow-lg`}>
              {result.icon === "check" && (
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {result.icon === "x" && (
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {result.icon === "clock" && (
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {result.status === "no_data" && (
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${styles.text}`}>
                {result.status === "approved" && "Payment Successful!"}
                {result.status === "declined" && "Payment Declined"}
                {result.status === "pending" && "Payment Pending"}
                {result.status === "error" && "Processing Error"}
                {result.status === "no_data" && "No Payment Data"}
                {result.status === "unknown" && "Payment Status Unknown"}
              </h2>
              {result.respMessage && (
                <p className="text-slate-600 mt-1">{result.respMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-2xl mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Transaction Details</h3>
          </div>
          
          <div className="space-y-1">
            {result.tranRef && (
              <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Reference</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-lg">{result.tranRef}</span>
              </div>
            )}
            {result.cartId && (
              <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-slate-50 to-purple-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Cart ID</span>
                <span className="font-mono font-semibold text-purple-700">{result.cartId}</span>
              </div>
            )}
            {result.cartAmount && (
              <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Amount</span>
                <span className="font-bold text-emerald-700 text-lg">{result.cartCurrency} {result.cartAmount}</span>
              </div>
            )}
            {result.respCode && (
              <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-slate-50 to-amber-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Response Code</span>
                <span className="font-mono font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-lg">{result.respCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Raw Parameters Toggle */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl mb-6 overflow-hidden">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <span className="flex items-center gap-2 text-slate-600 font-medium">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Raw Parameters
            </span>
            <svg className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showRaw ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showRaw && (
            <div className="px-6 pb-6">
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto text-sm font-mono">
                {JSON.stringify(allParams, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link
          href="/dashboard/paylinks"
          className="block w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl text-center cursor-pointer transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-[1.02]"
        >
          Back to Dashboard
        </Link>

        {/* Footer */}
        <p className="text-center text-purple-300/60 text-sm mt-6">
          Powered by PayTabs Integration Demo
        </p>
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-purple-200">Loading...</p>
        </div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  )
}
