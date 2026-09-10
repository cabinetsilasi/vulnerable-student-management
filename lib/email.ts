import nodemailer from "nodemailer"
import { SCHOOL_INFO, SchoolInfo } from "./store"

const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
})

export interface EmailInviteParams {
  toEmail: string
  teacherName: string
  className: string
  pin: string
  tokenLink: string
  customSubject?: string
  customBody?: string
  schoolInfo?: SchoolInfo
}

export async function sendTeacherInvite(params: EmailInviteParams): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const { toEmail, teacherName, className, pin, tokenLink, customSubject, customBody, schoolInfo } = params
  const info = schoolInfo || SCHOOL_INFO

  const defaultSubject = `Fișă de identificare elevi vulnerabili ${info.anScolar} - ${className} (${info.unitate})`

  const subject = customSubject || defaultSubject

  const defaultBodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0;">${info.unitate}</h2>
        <p style="color: #0d9488; margin: 4px 0 0 0; font-weight: bold;">Cabinet Școlar de Asistență Psihopedagogică</p>
      </div>

      <p>Stimate/Stimat profesor diriginte <strong>${teacherName}</strong>,</p>

      <p>Vă rugăm să completați <strong>Fișa de identificare a elevilor din categorii vulnerabile</strong> pentru <strong>${className}</strong> aferentă anului școlar ${info.anScolar}.</p>

      <div style="background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0 0 8px 0;"><strong>Acces rapid în portal fără parolă:</strong></p>
        <p style="margin: 4px 0;">🔑 Cod PIN unic: <span style="font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #0d9488; background: #e6fffa; padding: 2px 8px; border-radius: 4px;">${pin}</span></p>
      </div>

      <div style="text-align: center; margin: 28px 0;">
        <a href="${tokenLink}" style="background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Deschide Formularul Dirigintelui</a>
      </div>

      <p style="font-size: 13px; color: #64748b;">Dacă butonul de mai sus nu funcționează, copiați și deschideți următorul link în browser:<br/>
      <a href="${tokenLink}" style="color: #0d9488;">${tokenLink}</a></p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        Consilier școlar: ${info.consilier}<br/>
        Mesaj transmis automat prin Cabinetul de Asistență Psihopedagogică.
      </p>
    </div>
  `

  const bodyHtml = customBody
    ? customBody
        .replace(/{NUME_DIRIGINTE}/g, teacherName)
        .replace(/{CLASA}/g, className)
        .replace(/{PIN}/g, pin)
        .replace(/{LINK_DIRECT}/g, tokenLink)
        .replace(/{SCOALA}/g, info.unitate)
    : defaultBodyHtml

  if (smtpUser && smtpPass) {
    try {
      await transporter.sendMail({
        from: `"Cabinet Consiliere" <${smtpUser}>`,
        to: toEmail,
        subject: subject,
        html: bodyHtml,
      })
      return { success: true }
    } catch (e: any) {
      console.error("Nodemailer API Error:", e)
      return { success: false, error: e.message || "Eroare la trimiterea emailului prin SMTP" }
    }
  } else {
    // Simulated success mode
    console.log(`[SIMULARE EMAIL TRIMITERE] Către: ${toEmail} | Subiect: ${subject} | PIN: ${pin} | Link: ${tokenLink}`)
    return { success: true, simulated: true }
  }
}
