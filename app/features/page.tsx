import { FeaturesOverview } from "@/components/features/FeaturePage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "RetireShield Features — Safety Score, Monitoring, AI Coach",
  description: "Explore RetireShield features for retirement risk scoring, monthly monitoring, AI coaching, scam protection, Medicare, and Social Security education.",
  path: "/features",
});


export default function FeaturesPage() {
  return <FeaturesOverview />;
}
