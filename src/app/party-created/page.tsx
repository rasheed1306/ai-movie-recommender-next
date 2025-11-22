import { Metadata } from "next";
import { PartyCreatedContent } from "@/components/PartyCreatedContent";

export const metadata: Metadata = {
  title: "Party Created - MovieMatch",
  description: "Your watch party has been created! Share the code with your friends.",
  openGraph: {
    title: "Party Created - MovieMatch",
    description: "Your watch party is ready!",
  },
};

export default function PartyCreatedPage() {
  return <PartyCreatedContent />;
}
