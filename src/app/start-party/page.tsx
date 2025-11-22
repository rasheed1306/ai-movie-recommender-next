import { Metadata } from "next";
import { StartPartyForm } from "@/components/StartPartyForm";

export const metadata: Metadata = {
  title: "Start a Watch Party - MovieMatch",
  description: "Create your own movie watch party and invite friends to join you.",
  openGraph: {
    title: "Start a Watch Party - MovieMatch",
    description: "Create your own movie watch party and invite friends.",
  },
};

export default function StartPartyPage() {
  return <StartPartyForm />;
}
