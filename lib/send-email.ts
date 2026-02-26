// lib/send-email.ts

export interface SendEmailOptions {
  subject: string;
  message: string;
  to: string;
  from?: string;
  name?: string;
}

export async function sendEmail({ subject, message, to, from = "noreply@meherfoods.com", name = "Meher Foods" }: SendEmailOptions) {
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: "9d176ff3-cf76-4bf7-89ae-f9fcda949156",
      subject,
      message,
      email: to,
      from_name: name,
      from_email: from
    })
  });
  if (!res.ok) {
    throw new Error("Failed to send email notification");
  }
  return res.json();
}
