import { env } from "~/env";
import { db } from "~/server/db";

// Xendit calls this when a guest pays, or when the payment page expires
export async function POST(req: Request) {
  // only Xendit knows this token, so this blocks fake calls
  if (req.headers.get("x-callback-token") !== env.XENDIT_CALLBACK_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoice = (await req.json()) as { external_id: string; status: string };

  if (invoice.status === "PAID") {
    await db.reservation.updateMany({
      where: { confirmationCode: invoice.external_id, status: "PENDING" },
      data: { status: "CONFIRMED" },
    });
  }

  if (invoice.status === "EXPIRED") {
    await db.reservation.updateMany({
      where: { confirmationCode: invoice.external_id, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
  }

  return Response.json({ received: true });
}
