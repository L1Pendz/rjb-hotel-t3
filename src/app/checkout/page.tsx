"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { BookingCard } from "~/components/checkout/BookingCard";
import { GuestDetails } from "~/components/checkout/GuestDetails";
import { StayDetails } from "~/components/booking/StayDetails";
import { addDays, nights, today } from "~/lib/dates";
import { quoteStay } from "~/lib/pricing";
import { parseSearch, toSearchParams } from "~/lib/search";
import { api } from "~/trpc/react";

// Review and confirm. Submitting holds the room and opens Xendit's hosted
// checkout — the card is entered on their page and never reaches this app.
export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  const roomId = searchParams.get("room") ?? "";
  const roomQuery = api.room.getById.useQuery(
    { id: roomId },
    { enabled: Boolean(roomId) },
  );
  const createReservation = api.reservation.create.useMutation();

  // The catalog can be browsed without dates, so default to one night starting
  // today. The same dates go into the request, which is why the page and the
  // reservation cannot disagree about the stay.
  const query = parseSearch(searchParams);
  const checkIn = query.checkIn ?? today();
  const checkOut = query.checkOut ?? addDays(checkIn, 1);

  // Back to the catalog with the same search still in the URL, so changing the
  // dates starts from what the guest already picked. The parsed query, not the
  // tonight default above: a guest who browsed without dates goes back to every
  // room, not a search they never ran.
  const backHref = `/?${toSearchParams(query)}`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    setError("");

    try {
      const { invoiceUrl } = await createReservation.mutateAsync({
        roomId,
        guestName: (data.get("guestName") as string | null) ?? "",
        guestCount: query.guests,
        checkIn,
        checkOut,
      });

      // Off to Xendit's hosted page. A full navigation rather than a router
      // push, since it is a different origin. assign() rather than setting
      // location.href — the same thing, but a call instead of writing to a
      // binding React's immutability rule guards.
      window.location.assign(invoiceUrl);
    } catch (caught) {
      setError((caught as Error).message);
    }
  };

  if (!roomId)
    return (
      <p role="alert" className="py-10 text-orange-700">
        No room chosen
      </p>
    );

  if (roomQuery.isLoading)
    return <p className="py-10 text-gray-500">Loading room...</p>;

  if (roomQuery.error || !roomQuery.data)
    return (
      <p role="alert" className="py-10 text-orange-700">
        {roomQuery.error?.message ?? "That room is no longer listed."}
      </p>
    );

  const room = roomQuery.data;

  // Display only. The API recomputes this from the stored rate before it writes
  // anything or asks Xendit for an amount.
  const quote = quoteStay(String(room.nightlyRate), nights(checkIn, checkOut));

  return (
    <div className="flex-col">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 py-5">
        <div>
          <p className="text-xs font-medium text-orange-500">
            RESERVATION CHECKOUT
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Review &amp; Confirm
          </h1>
        </div>
        <Link
          href={backHref}
          className="font-bold tracking-tighter text-orange-500 hover:text-orange-300"
        >
          {"<"} Back to rooms
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex-2 flex-col">
            <StayDetails
              checkIn={checkIn}
              checkOut={checkOut}
              nights={quote.nights}
              guests={query.guests}
              changeHref={`${backHref}#stay-search`}
            />
            <GuestDetails />
          </div>
          <div className="flex-1 lg:sticky lg:top-4">
            <BookingCard
              room={room}
              quote={quote}
              pending={createReservation.isPending}
            />
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mb-8 border-2 border-orange-500 bg-orange-50 p-3 text-sm text-orange-700"
          >
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}
