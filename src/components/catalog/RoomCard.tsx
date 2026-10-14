import Link from "next/link";
import { UserRound } from "lucide-react";
import { MoveRight } from "lucide-react";

import { formatPeso } from "~/lib/money";
import { typeLabel, type RoomType } from "~/types/index";
import type { RouterOutputs } from "~/trpc/react";

interface RoomCardProps {
  room: RouterOutputs["room"]["getAll"][number];
  href: string;
}

// One room on the catalog. The backend already left out booked rooms.
export const RoomCard: React.FC<RoomCardProps> = ({ room, href }) => {
  return (
    <div className="relative flex aspect-6/5 w-full flex-col">
      <div className="absolute top-0 left-0 bg-orange-500 p-2 text-xs font-semibold tracking-widest text-white">
        {typeLabel(room.type as RoomType)}
      </div>

      <div className="h-1/2 overflow-hidden">
        <img
          className="h-full w-full object-cover"
          src={room.imageUrl ?? "/rooms/default.jpg"}
          alt={room.name}
        />
      </div>

      <div className="flex-col space-y-2 bg-gray-200 p-3">
        {/* The number tells apart two rooms that share a name, like the
            Courtyard Deluxes. */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold">{room.name}</span>
          <span className="text-xs whitespace-nowrap text-gray-500">
            Room {room.number}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <UserRound className="size-3" />
          <span className="text-xs text-gray-500">{room.capacity} people</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {room.amenities.map((amenity) => (
            <span key={amenity} className="bg-white px-2 py-1 text-xs">
              {amenity}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t-2">
          <div>
            <p className="text-xl font-bold">{formatPeso(String(room.nightlyRate))}</p>
            <p className="text-xs text-gray-500">per night</p>
          </div>
          <Link
            href={href}
            className="flex items-center gap-1 bg-orange-500 p-2 text-xs font-semibold tracking-widest text-white"
          >
            <span>Book Now</span>
            <MoveRight className="size-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
