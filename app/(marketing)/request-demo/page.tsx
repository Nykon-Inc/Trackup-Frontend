import type { Metadata } from "next";
import { DemoForm } from "./demo-form";

export const metadata: Metadata = {
  title: "Request a Demo",
  description: "Request a personalized Watchtower demo and discover a clearer way to manage workforce performance.",
  alternates: { canonical: "/request-demo" },
};

export default function RequestDemoPage() {
  return <DemoForm />;
}
