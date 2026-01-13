import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    
    // Log all headers
    const headers = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    console.log("Headers:", JSON.stringify(headers, null, 2))
    
    // PayTabs sends data as form-urlencoded or JSON
    const contentType = request.headers.get("content-type") || ""
    console.log("Content-Type:", contentType)
    
    let data = {}
    
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData()
      formData.forEach((value, key) => {
        data[key] = value
      })
    } else if (contentType.includes("application/json")) {
      data = await request.json()
    } else {
      // Try to parse as text and then as form data
      const text = await request.text()
      console.log("Raw body text:", text)
      const params = new URLSearchParams(text)
      params.forEach((value, key) => {
        data[key] = value
      })
    }

    console.log("Parsed PayTabs Return Data:", JSON.stringify(data, null, 2))

    // Build redirect URL with all parameters
    // Use standalone payment-result page (no auth required)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const redirectUrl = new URL("/payment-result", baseUrl)
    
    // Add all received parameters to the redirect URL
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        redirectUrl.searchParams.set(key, String(value))
      }
    })

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error("Payment return error:", error)
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    return NextResponse.redirect(`${baseUrl}/payment-result?error=processing_failed`)
  }
}

// Also handle GET requests (in case PayTabs uses GET)
export async function GET(request) {
  console.log("=== PayTabs GET Return ===")
  console.log("Full URL:", request.url)
  
  const { searchParams } = new URL(request.url)
  
  // Log all query params
  const params = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  console.log("Query params received:", JSON.stringify(params, null, 2))
  
  // Use standalone payment-result page (no auth required)
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const redirectUrl = new URL("/payment-result", baseUrl)
  
  // Forward all query parameters
  searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value)
  })
  
  // If no params received, add a flag
  if (searchParams.size === 0) {
    redirectUrl.searchParams.set("no_params", "true")
  }
  
  console.log("Redirecting to:", redirectUrl.toString())
  
  return NextResponse.redirect(redirectUrl.toString())
}
