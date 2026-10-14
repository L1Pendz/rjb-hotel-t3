import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createInvoice } from "~/server/xendit";
import { VAT_PERCENT } from "~/lib/pricing";

export const reservationRouter = createTRPCRouter({
  // books a room and returns the Xendit page where the guest pays
  create: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        guestName: z.string().trim().min(1, "Guest name is required."),
        guestCount: z.number().int().min(1, "At least 1 guest is required."),
        checkIn: z.string().date("Invalid check-in date."),
        checkOut: z.string().date("Invalid check-out date."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const checkIn = new Date(input.checkIn);
      const checkOut = new Date(input.checkOut);
      const nights = (checkOut.getTime() - checkIn.getTime()) / 86400000;

      if (nights < 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Check-out must be after check-in.",
        });
      }

      const room = await ctx.db.room.findUnique({
        where: { id: input.roomId },
      });

      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found." });
      }

      if (input.guestCount > room.capacity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `This room only fits ${room.capacity} guests.`,
        });
      }

      // stop double booking: any booking that overlaps these dates
      const overlap = await ctx.db.reservation.findFirst({
        where: {
          roomId: room.id,
          status: { not: "CANCELLED" },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      });

      if (overlap) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This room is already booked for those dates.",
        });
      }

      const confirmationCode = `IKX-${Math.floor(1000 + Math.random() * 9000)}`;
      // same math as the checkout page: room charge plus 12% VAT
      const roomTotal = room.nightlyRate * nights;
      const totalAmount =
        roomTotal + Math.round((roomTotal * VAT_PERCENT) / 100);

      // create the payment page first, so a failed payment setup saves nothing
      const invoiceUrl = await createInvoice(
        confirmationCode,
        totalAmount,
        `${room.name}, ${nights} night(s)`,
      );

      await ctx.db.reservation.create({
        data: {
          confirmationCode,
          guestName: input.guestName,
          guestCount: input.guestCount,
          checkIn,
          checkOut,
          totalAmount,
          roomId: room.id,
        },
      });

      return { invoiceUrl, confirmationCode };
    }),

  getByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const reservation = await ctx.db.reservation.findUnique({
        where: { confirmationCode: input.code },
        include: { room: true },
      });

      if (!reservation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reservation not found.",
        });
      }

      return reservation;
    }),

  // the guest name is asked again so a guessed code alone can't cancel
  cancel: publicProcedure
    .input(
      z.object({
        code: z.string(),
        guestName: z.string().trim().min(1, "Guest name is required."),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.db.reservation.findUnique({
        where: { confirmationCode: input.code },
      });

      // same message for a wrong code or a wrong name
      if (
        reservation?.guestName.toLowerCase() !== input.guestName.toLowerCase()
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No booking matches that code and name.",
        });
      }

      if (reservation.status === "CANCELLED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This booking is already cancelled.",
        });
      }

      await ctx.db.reservation.update({
        where: { id: reservation.id },
        data: { status: "CANCELLED" },
      });

      return { success: true };
    }),
});
