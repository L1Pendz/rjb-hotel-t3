import { InfoBar } from "~/components/catalog/InfoBar";
import { RoomList } from "~/components/catalog/RoomList";

export default function CatalogPage() {
  return (
    <div className="flex-col">
      <div className="relative mt-5 h-64 overflow-hidden sm:h-80">
        <img className="absolute inset-0" src="/rooms/default.jpg" alt="Default Room" />
        <div className="absolute right-0 bottom-0 left-0 p-5 pb-16 text-white sm:p-8 sm:pb-16">
          <p className="text-xs font-semibold tracking-widest text-orange-300">
            BOUTIQUE STAYS · ILOILO CITY
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Find your best stay</h1>
          <p className="mt-1 max-w-md text-sm text-gray-200">
            Pick your dates to see what&apos;s vacant, then book your stay, hassle free!
          </p>
        </div>
      </div>

      {/* Pulled up over the photo's bottom edge. The form's own top margin is
          part of what the negative margin cancels. */}
      <div className="relative z-10 -mt-14 px-3 sm:px-8">
        <InfoBar />
      </div>

      <RoomList />
    </div>
  );
};
