import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Disable body parsing to get raw body for signature verification
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Verify PayTabs webhook signature
 * @param {string} payload - Raw request body as string
 * @param {string} signature - Signature from header
 * @param {string} serverKey - PayTabs server key
 * @returns {boolean} - True if signature is valid
 */
function verifySignature(payload, signature, serverKey) {
  try {
    // Calculate HMAC SHA256 hash of the payload
    const hash = crypto
      .createHmac("sha256", serverKey)
      .update(payload)
      .digest("hex")

    // Compare with signature (case-insensitive)
    return hash.toLowerCase() === signature.toLowerCase()
  } catch (error) {
    console.error("Signature verification error:", error)
    return false
  }
}

export async function POST(request, { params }) {
  console.log("=== WEBHOOK RECEIVED ===")
  console.log("Time:", new Date().toISOString())
  
  try {
    const { userId } = await params
    console.log("User ID:", userId)

    if (!userId) {
      console.log("ERROR: No user ID provided")
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Get raw body as text for signature verification
    const rawBody = await request.text()
    console.log("Raw body:", rawBody)
    
    // Get signature from header
    const signature = request.headers.get("signature") || request.headers.get("Signature")

    if (!signature) {
      // Log webhook without signature (still log it)
      const payload = JSON.parse(rawBody)
      
      await prisma.webhookLog.create({
        data: {
          userId,
          payload,
          verified: false,
          transactionId: payload.tran_ref || null,
          status: payload.payment_result?.response_status || null,
        },
      })

      return NextResponse.json(
        { error: "Missing signature header" },
        { status: 400 }
      )
    }

    // Parse payload
    const payload = JSON.parse(rawBody)

    // Get user's credentials to verify signature
    // We need to find which credential was used for this transaction
    // For now, we'll try all credentials or use the first one
    const credentials = await prisma.credential.findMany({
      where: { userId },
    })

    if (credentials.length === 0) {
      return NextResponse.json(
        { error: "No credentials found for user" },
        { status: 404 }
      )
    }

    // Try to verify with each credential's server key
    let verified = false
    let usedCredential = null

    for (const credential of credentials) {
      if (verifySignature(rawBody, signature, credential.serverKey)) {
        verified = true
        usedCredential = credential
        break
      }
    }

    // Log the webhook
    console.log("Saving webhook log to database...")
    const webhookLog = await prisma.webhookLog.create({
      data: {
        userId,
        payload,
        verified,
        transactionId: payload.tran_ref || payload.cart_id || null,
        status: payload.payment_result?.response_status || payload.payment_result?.response_message || null,
      },
    })
    console.log("Webhook log saved:", webhookLog.id)

    if (!verified) {
      console.warn("Webhook signature verification failed for user:", userId)
      // Still return 200 to PayTabs to prevent retries
      // but we've logged it as unverified
    }

    return NextResponse.json({
      success: true,
      verified,
      message: verified ? "Webhook received and verified" : "Webhook received but signature verification failed",
    })
  } catch (error) {
    console.error("Webhook processing error:", error)
    
    // Try to log the error (if we have userId)
    try {
      const { userId } = await params
      if (userId) {
        await prisma.webhookLog.create({
          data: {
            userId,
            payload: { error: error.message },
            verified: false,
          },
        })
      }
    } catch (logError) {
      console.error("Failed to log webhook error:", logError)
    }

    // Return 200 to prevent PayTabs from retrying
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 200 }
    )
  }
}

// PayTabs might also send GET requests for webhook verification
export async function GET(request, { params }) {
  const { userId } = await params
  console.log("=== WEBHOOK GET REQUEST ===")
  console.log("User ID:", userId)
  return NextResponse.json({ message: "Webhook endpoint is active", userId })
}
