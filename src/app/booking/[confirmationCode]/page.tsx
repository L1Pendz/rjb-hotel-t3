"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { StayDetails } from "~/components/booking/StayDetails";
import { nights } from "~/lib/dates";
import { formatPeso } from "~/lib/money";
import { typeLabel, type RoomType } from "~/types/index";
import { api } from "~/trpc/react";

// The current reservation API stores booking and room details, but not folio
// charges or payment records. Keep this page limited to data it can verify.
export default function ConfirmationPage() {
  const { confirmationCode } = useParams<{ confirmationCode: string }>();
  const searchParams = useSearchParams();
  const [revealed, setRevealed] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const utils = api.useUtils();

  const reservationQuery = api.reservation.getByCode.useQuery(
    { code: confirmationCode },
    { enabled: Boolean(confirmationCode) },
  );

  const cancelReservation = api.reservation.cancel.useMutation({
    onSuccess: async () => {
      await utils.reservation.getByCode.invalidate({
        code: confirmationCode,
      });
    },
  });

  if (reservationQuery.isLoading)
    return <p className="py-10 text-gray-500">Loading booking...</p>;

  if (reservationQuery.error || !reservationQuery.data)
    return (
      <p role="alert" className="py-10 text-orange-700">
        {reservationQuery.error?.message ?? "No booking matches that code."}
      </p>
    );

  const reservation = reservationQuery.data;
  const checkIn = reservation.checkIn.toISOString().slice(0, 10);
  const checkOut = reservation.checkOut.toISOString().slice(0, 10);
  const stayNights = nights(checkIn, checkOut);
  const cancellable =
    reservation.status === "PENDING" || reservation.status === "CONFIRMED";
  const paymentFailed = searchParams.get("payment") === "failed";

  const cancel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const guestName = String(
      new FormData(event.currentTarget).get("guestName") ?? "",
    );

    setCancelError("");
    try {
      await cancelReservation.mutateAsync({
        code: reservation.confirmationCode,
        guestName,
      });
    } catch (caught) {
      setCancelError(
        caught instanceof Error ? caught.message : "Failed to cancel booking.",
      );
    }
  };

  return (
    <div className="flex-col">
      <div className="relative border-b-2 py-5">
        <p className="text-xs font-medium text-orange-500">
          {reservation.status === "CANCELLED"
            ? "CANCELLED"
            : reservation.status === "PENDING"
              ? "AWAITING PAYMENT"
              : reservation.status === "CONFIRMED"
                ? "RESERVATION CONFIRMED"
                : reservation.status.replaceAll("_", " ")}
        </p>
        <h1 className="text-4xl font-bold">
          {reservation.status === "CANCELLED"
            ? "This reservation was cancelled"
            : reservation.status === "PENDING"
              ? "Your room is held"
              : reservation.status === "CONFIRMED"
                ? "You are booked"
                : "Your booking"}
        </h1>
        <Link
          href="/"
          className="absolute right-0 bottom-0 mb-5 font-bold tracking-tighter text-orange-500 hover:text-orange-300"
        >
          {"<"} Back to rooms
        </Link>
      </div>

      {paymentFailed ? (
        <p role="alert" className="my-5 text-sm text-orange-700">
          Payment was not completed. Check the booking status below or contact
          the front desk for help.
        </p>
      ) : null}

      <div className="my-5 flex flex-col gap-8 lg:flex-row">
        <div className="flex-2 flex-col">
          <StayDetails
            checkIn={checkIn}
            checkOut={checkOut}
            nights={stayNights}
          />

          <div className="mt-5 flex-col">
            <p className="text-xl font-bold">Guest details</p>
            <div className="mt-3 flex-col divide-y-2 divide-gray-400 border-2 border-gray-400">
              <div className="flex justify-between p-3">
                <span className="text-xs text-gray-500">Name</span>
                <span className="text-sm font-bold">
                  {reservation.guestName}
                </span>
              </div>
              <div className="flex justify-between p-3">
                <span className="text-xs text-gray-500">Guests</span>
                <span className="text-sm font-bold">
                  {reservation.guestCount}
                </span>
              </div>
            </div>
          </div>

          {cancellable ? (
            <div className="mt-5 flex-col border-t-2 pt-5">
              <p className="text-xl font-bold">Cancel this booking</p>
              <p className="my-2 max-w-lg text-xs text-gray-500">
                Confirm the name the booking is under. Cancelling releases the
                room. Contact the front desk about any payment already made.
              </p>
              <form onSubmit={cancel} className="mt-2 flex w-full max-w-md">
                <input
                  name="guestName"
                  required
                  placeholder="Full name on the reservation"
                  className="flex-1 border-2 border-gray-400 bg-gray-200 p-3 text-sm"
                />
                <button
                  type="submit"
                  disabled={cancelReservation.isPending}
                  className="bg-gray-700 px-5 text-sm font-bold tracking-wider text-white disabled:bg-gray-400"
                >
                  {cancelReservation.isPending ? "Cancelling..." : "Cancel"}
                </button>
              </form>
              {cancelError ? (
                <p role="alert" className="mt-2 text-sm text-orange-700">
                  {cancelError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex-1">
          <div className="mt-5 flex-col divide-y-2 divide-black bg-gray-200 p-3">
            <div className="flex flex-col pb-5">
              <p className="text-xs font-semibold tracking-widest text-orange-500">
                CONFIRMATION CODE
              </p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold tracking-tight">
                  {revealed
                    ? reservation.confirmationCode
                    : `${reservation.confirmationCode.slice(0, 4)}••••`}
                </p>
                <button
                  type="button"
                  onClick={() => setRevealed((shown) => !shown)}
                  aria-label={revealed ? "Hide the code" : "Show the code"}
                  className="text-gray-500 hover:text-orange-500"
                >
                  {revealed ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col py-5">
              <p className="text-xs font-semibold text-orange-500">
                {typeLabel(reservation.room.type as RoomType).toUpperCase()} |
                ROOM {reservation.room.number}
              </p>
              <p className="text-2xl font-bold">{reservation.room.name}</p>
              <p className="text-xs text-gray-500">
                {formatPeso(String(reservation.room.nightlyRate))} x{" "}
                {stayNights} {stayNights === 1 ? "night" : "nights"}
              </p>
            </div>

            <div className="flex items-center justify-between py-5">
              <span className="text-sm">Booking total</span>
              <span className="text-xl font-bold">
                {formatPeso(String(reservation.totalAmount))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
