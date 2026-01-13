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
    let statusColor = "text-amber-600 dark:text-amber-400"
    let bgColor = "bg-amber-50 dark:bg-amber-900/20"
    let borderColor = "border-amber-200 dark:border-amber-800"
    let icon = "clock"

    if (respStatus === "A" || respCode === "0" || respCode === "00") {
      status = "approved"
      statusColor = "text-emerald-600 dark:text-emerald-400"
      bgColor = "bg-emerald-50 dark:bg-emerald-900/20"
      borderColor = "border-emerald-200 dark:border-emerald-800"
      icon = "check"
    } else if (respStatus === "D" || respStatus === "E" || (respCode && parseInt(respCode) > 0)) {
      status = "declined"
      statusColor = "text-red-600 dark:text-red-400"
      bgColor = "bg-red-50 dark:bg-red-900/20"
      borderColor = "border-red-200 dark:border-red-800"
      icon = "x"
    } else if (respStatus === "P" || respStatus === "H") {
      status = "pending"
    }

    if (status === "unknown" && (tranRef || Object.keys(params).length > 1)) {
      if (respMessage?.toLowerCase().includes("success") || respMessage?.toLowerCase().includes("approved") || respMessage?.toLowerCase().includes("authorised")) {
        status = "approved"
        statusColor = "text-emerald-600 dark:text-emerald-400"
        bgColor = "bg-emerald-50 dark:bg-emerald-900/20"
        borderColor = "border-emerald-200 dark:border-emerald-800"
        icon = "check"
      }
    }

    if (processingError) {
      status = "error"
      statusColor = "text-red-600 dark:text-red-400"
      bgColor = "bg-red-50 dark:bg-red-900/20"
      borderColor = "border-red-200 dark:border-red-800"
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
        statusColor,
        bgColor,
        borderColor,
        icon,
      },
      allParams: params
    }
  }, [searchParams])

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">
        Payment Result
      </h1>

      {/* Status Card */}
      <div className={`p-6 rounded-lg border-2 ${result.bgColor} ${result.borderColor} mb-6`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
            result.status === "approved" ? "bg-emerald-500" :
            result.status === "declined" || result.status === "error" ? "bg-red-500" :
            result.status === "no_data" ? "bg-zinc-500" :
            "bg-amber-500"
          }`}>
            {result.icon === "check" && (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {result.icon === "x" && (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {result.icon === "clock" && (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {result.status === "no_data" && (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${result.statusColor}`}>
              {result.status === "approved" && "Payment Successful!"}
              {result.status === "declined" && "Payment Declined"}
              {result.status === "pending" && "Payment Pending"}
              {result.status === "error" && "Processing Error"}
              {result.status === "no_data" && "No Payment Data Received"}
              {result.status === "unknown" && "Payment Status Unknown"}
            </h2>
            {result.respMessage && (
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                {result.respMessage}
              </p>
            )}
            {result.status === "no_data" && (
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                PayTabs did not return any payment information. Check webhook logs for server-side notifications.
              </p>
            )}
          </div>
        </div>

        {result.acquirerMessage && (
          <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-medium">Bank Response:</span> {result.acquirerMessage}
            </p>
          </div>
        )}
      </div>

      {/* Transaction Details */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg mb-6">
        <h3 className="text-lg font-semibold mb-4 text-black dark:text-zinc-50 flex items-center gap-2">
          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Transaction Details
        </h3>
        
        <div className="space-y-3">
          {result.tranRef && (
            <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Transaction Reference</span>
              <span className="font-mono text-black dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                {result.tranRef}
              </span>
            </div>
          )}
          {result.cartId && (
            <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Cart ID</span>
              <span className="font-mono text-black dark:text-zinc-50">{result.cartId}</span>
            </div>
          )}
          {result.cartAmount && result.cartCurrency && (
            <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Amount</span>
              <span className="font-semibold text-black dark:text-zinc-50">
                {result.cartCurrency} {result.cartAmount}
              </span>
            </div>
          )}
          {result.respCode && (
            <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Response Code</span>
              <span className="font-mono text-black dark:text-zinc-50">{result.respCode}</span>
            </div>
          )}
          {result.customerEmail && (
            <div className="flex justify-between items-center py-2">
              <span className="text-zinc-500 dark:text-zinc-400">Customer Email</span>
              <span className="text-black dark:text-zinc-50">{result.customerEmail}</span>
            </div>
          )}
        </div>
      </div>

      {/* Raw Parameters (for debugging) */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg mb-6 overflow-hidden">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Raw URL Parameters
          </span>
          <svg className={`w-5 h-5 text-zinc-400 transition-transform ${showRaw ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showRaw && (
          <div className="px-6 pb-6">
            <pre className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg overflow-x-auto text-xs text-zinc-700 dark:text-zinc-300 font-mono">
              {JSON.stringify(allParams, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link
          href="/dashboard/paylinks"
          className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all text-center cursor-pointer shadow-sm hover:shadow-md"
        >
          Create Another Payment
        </Link>
        <Link
          href="/dashboard/webhooks"
          className="flex-1 py-3 px-4 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg transition-all text-center cursor-pointer"
        >
          View Webhook Logs
        </Link>
      </div>
    </div>
  )
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  )
}
