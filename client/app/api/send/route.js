import { EmailTemplate } from "../../_components/email-template";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  const body = await req.json();
  
  // If Resend is not configured, return a warning
  if (!resend) {
    return Response.json({ 
      warning: "Email service not configured. Please set RESEND_API_KEY environment variable." 
    }, { status: 200 });
  }
  
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [body.email],
      subject: "Your Courses Are Ready for Download 🎓",
      react: EmailTemplate(),
    });

    return Response.json(data);
  } catch (error) {
    return Response.json({ error });
  }
}
