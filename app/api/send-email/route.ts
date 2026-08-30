import { NextRequest, NextResponse } from "next/server"
import { sendTeacherInvite } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { toEmail, teacherName, className, pin, tokenLink, customSubject, customBody } = body

    if (!toEmail || !teacherName || !className || !pin || !tokenLink) {
      return NextResponse.json({ error: "Lipsesc parametri obligatorii pentru trimitere email" }, { status: 400 })
    }

    const result = await sendTeacherInvite({
      toEmail,
      teacherName,
      className,
      pin,
      tokenLink,
      customSubject,
      customBody,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Eroare internă server" }, { status: 500 })
  }
}
