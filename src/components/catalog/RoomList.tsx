"use client";

import { useSearchParams } from "next/navigation";

import { api } from "~/trpc/react";
import { checkoutHref, parseSearch } from "~/lib/search";
import { RoomCard } from "./RoomCard";

// The catalog grid. The search lives in the URL rather than in state, so a
// search can be shared or reloaded and the back button walks through previous
// searches — see search.ts.
export const RoomList: React.FC = () => {
  const searchParams = useSearchParams();
  const query = parseSearch(searchParams);

  // refetches by itself whenever the dates or guests in the URL change
  const { data: rooms, isLoading, error } = api.room.getAll.useQuery(query);

  // Card-shaped placeholders, so the grid does not jump when the rooms land.
  if (isLoading)
    return (
      <div
        aria-label="Loading rooms"
        className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex aspect-6/5 animate-pulse flex-col">
            <div className="h-1/2 bg-gray-300" />
            <div className="flex-1 space-y-3 bg-gray-200 p-3">
              <div className="h-5 w-2/3 bg-gray-300" />
              <div className="h-3 w-1/4 bg-gray-300" />
              <div className="h-6 w-1/2 bg-gray-300" />
            </div>
          </div>
        ))}
      </div>
    );

  if (error)
    return (
      <p role="alert" className="py-10 text-orange-700">
        Error: {error.message}
      </p>
    );

  if (!rooms || rooms.length === 0)
    return (
      <p className="py-10 text-gray-500">
        {query.checkIn && query.checkOut
          ? "No rooms free for those dates. Try shortening your stay or lowering the guest count."
          : "No rooms have been added yet."}
      </p>
    );

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} href={checkoutHref(room.id, query)} />
      ))}
    </div>
  );
};
