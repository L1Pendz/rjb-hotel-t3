export const GuestDetails: React.FC = () => {
  return (
    <div className="mt-5 flex flex-col border-2 border-gray-400 p-5">
      <p className="text-xl font-bold">Guest details</p>
      <label htmlFor="full-name" className="text-s mt-2 text-gray-500">
        Full name to be used for reservation
      </label>
      {/* `name` is what puts this in the FormData the checkout page reads.
          Without it the field is not submitted at all. */}
      <input
        className="w-full border-2 border-gray-400 bg-white p-2 outline-none focus:border-orange-500 mt-1
        sm:w-3/4"
        type="text"
        id="full-name"
        name="guestName"
        required
        maxLength={120}
        placeholder="e.g. Sherwin Sid S. Sañol"
      />
      <p className="my-2 max-w-sm text-xs mt-3 text-gray-500">
        The reservation is held under this name. Enter it exactly as it appears
        on the ID presented at check-in.
      </p>
    </div>
  );
};
