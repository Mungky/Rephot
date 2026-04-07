export const PRICING_CHECKOUT_STORAGE_KEY = 'rephot_pricing_checkout';

export type PricingPlan = 'starter' | 'creator' | 'studio';

export type PendingPricingCheckout = {
  plan: PricingPlan;
  currency: 'USD' | 'IDR';
};

export function getPackageIdForPlan(plan: PricingPlan): string | null {
  const envMap: Record<PricingPlan, string | undefined> = {
    starter: process.env.NEXT_PUBLIC_TOKEN_PACKAGE_STARTER_ID,
    creator: process.env.NEXT_PUBLIC_TOKEN_PACKAGE_CREATOR_ID,
    studio: process.env.NEXT_PUBLIC_TOKEN_PACKAGE_STUDIO_ID,
  };
  const v = envMap[plan]?.trim();
  return v && v.length > 0 ? v : null;
}
