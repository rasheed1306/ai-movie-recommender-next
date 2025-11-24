import React from "react";

// This layout file is necessary for the intercepting route to work correctly.
// It ensures that both the form page and the intercepted modal share the same layout context.
export default function JoinPartyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
