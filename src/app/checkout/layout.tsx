import { Suspense } from "react";

// the checkout page reads the room and dates from the URL, which Next needs inside Suspense
export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
