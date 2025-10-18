'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GetPaidTab from '@/components/billing/get-paid-tab';
import PlanTab from '@/components/billing/plan-tab';
import { 
  Wallet, 
  CreditCard,
} from 'lucide-react';

// Keep imports for hidden tabs (for future use)
import OverviewTab from '@/components/billing/overview-tab';
import PayoutsTab from '@/components/billing/payouts-tab';
import SubscriptionsTab from '@/components/billing/subscriptions-tab';
import BookingFeesTab from '@/components/billing/booking-fees-tab';
import DepositsTab from '@/components/billing/deposits-tab';
import InvoicesTab from '@/components/billing/invoices-tab';
import SettingsTab from '@/components/billing/settings-tab';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('get-paid');

  // Read tab from URL parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && (tabParam === 'get-paid' || tabParam === 'plan')) {
      setActiveTab(tabParam);
    }
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Payouts</h1>
        <p className="text-muted-foreground mt-2">
          Connect your Stripe account and choose your plan
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="get-paid" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>Get Paid</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Plan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="get-paid" className="space-y-6">
          <GetPaidTab />
        </TabsContent>

        <TabsContent value="plan" className="space-y-6">
          <PlanTab />
        </TabsContent>

        {/* Hidden tabs - kept for future use but not rendered in UI */}
        {false && (
          <>
            <TabsContent value="overview" className="space-y-6">
              <OverviewTab />
            </TabsContent>
            <TabsContent value="payouts" className="space-y-6">
              <PayoutsTab />
            </TabsContent>
            <TabsContent value="subscriptions" className="space-y-6">
              <SubscriptionsTab />
            </TabsContent>
            <TabsContent value="fees" className="space-y-6">
              <BookingFeesTab />
            </TabsContent>
            <TabsContent value="deposits" className="space-y-6">
              <DepositsTab />
            </TabsContent>
            <TabsContent value="invoices" className="space-y-6">
              <InvoicesTab />
            </TabsContent>
            <TabsContent value="settings" className="space-y-6">
              <SettingsTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
