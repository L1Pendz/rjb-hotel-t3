import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const roomRouter = createTRPCRouter({
  // rooms that fit the guests, and if dates are given, are free on those dates
  getAll: publicProcedure
    .input(
      z.object({
        checkIn: z.string().date().optional(),
        checkOut: z.string().date().optional(),
        guests: z.number().int().min(1).default(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.room.findMany({
        where: {
          capacity: { gte: input.guests },
          // leave out rooms with a booking that overlaps the chosen dates
          reservations:
            input.checkIn && input.checkOut
              ? {
                  none: {
                    status: { not: "CANCELLED" },
                    checkIn: { lt: new Date(input.checkOut) },
                    checkOut: { gt: new Date(input.checkIn) },
                  },
                }
              : undefined,
        },
        orderBy: { number: "asc" },
      });
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const room = await ctx.db.room.findUnique({ where: { id: input.id } });

      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Room not found." });
      }

      return room;
    }),
});
