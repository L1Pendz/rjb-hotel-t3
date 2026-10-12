import { env } from "~/env";

// creates a Xendit payment page and returns its link
export async function createInvoice(
  confirmationCode: string,
  amount: number,
  description: string,
) {
  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      // Xendit uses the secret key as the username with an empty password
      Authorization: `Basic ${Buffer.from(`${env.XENDIT_SECRET_KEY}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: confirmationCode, // the webhook uses this to find the booking
      amount,
      currency: "PHP",
      description,
      invoice_duration: 900, // unpaid after 15 minutes = expired
      success_redirect_url: `${env.APP_URL}/booking/${confirmationCode}`,
      failure_redirect_url: `${env.APP_URL}/booking/${confirmationCode}?payment=failed`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Xendit error: ${await response.text()}`);
  }

  const invoice = (await response.json()) as { invoice_url: string };
  return invoice.invoice_url;
}
