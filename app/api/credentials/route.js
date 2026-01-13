import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const credentials = await prisma.credential.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        profileId: true,
        region: true,
        createdAt: true,
        // Don't send serverKey for security
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(credentials)
  } catch (error) {
    console.error("Get credentials error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, profileId, serverKey, region } = await request.json()

    if (!name || !profileId || !serverKey) {
      return NextResponse.json(
        { error: "Name, Profile ID, and Server Key are required" },
        { status: 400 }
      )
    }

    const credential = await prisma.credential.create({
      data: {
        name,
        profileId,
        serverKey, // In production, encrypt this
        region: region || "global",
        userId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        profileId: true,
        region: true,
        createdAt: true,
      }
    })

    return NextResponse.json(credential, { status: 201 })
  } catch (error) {
    console.error("Create credential error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Credential ID is required" },
        { status: 400 }
      )
    }

    // Verify the credential belongs to the user
    const credential = await prisma.credential.findUnique({
      where: { id },
    })

    if (!credential || credential.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      )
    }

    await prisma.credential.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Credential deleted successfully" })
  } catch (error) {
    console.error("Delete credential error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
