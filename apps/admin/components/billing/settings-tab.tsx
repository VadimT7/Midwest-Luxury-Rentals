'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Save, 
  Loader2, 
  AlertCircle,
  Globe,
  Mail,
  FileText,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BillingSettings {
  taxId?: string;
  taxIdType?: string;
  billingEmail?: string;
  statementDescriptor?: string;
  supportEmail?: string;
  country?: string;
  currency?: string;
  autoTax?: boolean;
  invoicePrefix?: string;
  invoiceFooter?: string;
}

export default function SettingsTab() {
  const [settings, setSettings] = useState<BillingSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/billing/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/billing/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('Settings saved successfully');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof BillingSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tax Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Tax Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure tax settings for SaaS subscriptions and bookings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="taxIdType">Tax ID Type</Label>
              <Select
                value={settings.taxIdType || ''}
                onValueChange={(value) => handleInputChange('taxIdType', value)}
              >
                <SelectTrigger id="taxIdType">
                  <SelectValue placeholder="Select tax ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu_vat">EU VAT</SelectItem>
                  <SelectItem value="us_ein">US EIN</SelectItem>
                  <SelectItem value="ca_bn">Canadian BN</SelectItem>
                  <SelectItem value="au_abn">Australian ABN</SelectItem>
                  <SelectItem value="gb_vat">UK VAT</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID Number</Label>
              <Input
                id="taxId"
                value={settings.taxId || ''}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="Enter your tax ID"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="autoTax"
              checked={settings.autoTax || false}
              onCheckedChange={(checked) => handleInputChange('autoTax', checked)}
            />
            <Label htmlFor="autoTax" className="cursor-pointer">
              Enable automatic tax calculation (Stripe Tax)
            </Label>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Automatic tax calculation requires Stripe Tax to be enabled in your Stripe account.
              Additional fees may apply.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Billing Information</CardTitle>
          </div>
          <CardDescription>
            Contact details for billing and support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billingEmail">Billing Email</Label>
            <Input
              id="billingEmail"
              type="email"
              value={settings.billingEmail || ''}
              onChange={(e) => handleInputChange('billingEmail', e.target.value)}
              placeholder="billing@example.com"
            />
            <p className="text-xs text-muted-foreground">
              Receives subscription invoices and payment notifications
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={settings.supportEmail || ''}
              onChange={(e) => handleInputChange('supportEmail', e.target.value)}
              placeholder="support@example.com"
            />
            <p className="text-xs text-muted-foreground">
              Displayed on customer receipts for support inquiries
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statement Descriptors */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Statement Descriptors</CardTitle>
          </div>
          <CardDescription>
            Customize how charges appear on customer statements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="statementDescriptor">Statement Descriptor</Label>
            <Input
              id="statementDescriptor"
              value={settings.statementDescriptor || ''}
              onChange={(e) => handleInputChange('statementDescriptor', e.target.value)}
              placeholder="FLYRENTALS"
              maxLength={22}
            />
            <p className="text-xs text-muted-foreground">
              Appears on customer's bank statement (max 22 characters, no special characters)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
            <Input
              id="invoicePrefix"
              value={settings.invoicePrefix || ''}
              onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
              placeholder="FLY-"
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Prefix for invoice numbers (e.g., FLY-2024-0001)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Regional Settings</CardTitle>
          </div>
          <CardDescription>
            Location and currency preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={settings.country || 'US'}
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger id="country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="ES">Spain</SelectItem>
                  <SelectItem value="IT">Italy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={settings.currency || 'USD'}
                onValueChange={(value) => handleInputChange('currency', value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Currency changes only apply to new bookings. Existing bookings keep their original currency.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Invoice Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Customization</CardTitle>
          <CardDescription>
            Add custom text to invoices and receipts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
            <textarea
              id="invoiceFooter"
              className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
              value={settings.invoiceFooter || ''}
              onChange={(e) => handleInputChange('invoiceFooter', e.target.value)}
              placeholder="Thank you for your business! For questions, contact support@example.com"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Appears at the bottom of all invoices (max 500 characters)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          disabled={saving}
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


