import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPayLink } from "@/lib/paytabs"

export async function POST(request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { credentialId, cartId, cartCurrency, cartAmount, cartDescription } = await request.json()

    if (!credentialId || !cartId || !cartCurrency || !cartAmount || !cartDescription) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    // Get the credential with region
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
    })

    if (!credential || credential.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      )
    }

    // Construct URLs
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const callbackUrl = `${baseUrl}/api/webhook/${session.user.id}`
    // Use API route to handle POST response from PayTabs
    const returnUrl = `${baseUrl}/api/payment-return`

    // Create PayLink via PayTabs API with region
    const payLinkResponse = await createPayLink({
      profileId: credential.profileId,
      serverKey: credential.serverKey,
      region: credential.region || "global",
      cartId,
      cartCurrency,
      cartAmount: parseFloat(cartAmount),
      cartDescription,
      callback: callbackUrl,
      returnUrl: returnUrl,
    })

    return NextResponse.json({
      success: true,
      payLink: payLinkResponse,
      message: "PayLink created successfully",
    })
  } catch (error) {
    console.error("Create PayLink error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create PayLink" },
      { status: 500 }
    )
  }
}
