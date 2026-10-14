import { Logo } from "./Logo";
import { NavLink } from "./NavLink";

export const GuestNavbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between border-b bg-white px-4 py-2 sm:px-8 text-black">
      <Logo />

      <div className="flex gap-6 text-sm">
        <NavLink href="/">Suites</NavLink>

        <NavLink href="/find-booking">Manage booking</NavLink>
      </div>
    </nav>
  );
};

