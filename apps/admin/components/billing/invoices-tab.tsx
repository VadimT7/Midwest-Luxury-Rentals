'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Loader2, 
  Receipt,
  ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  pdfUrl?: string;
  type: 'subscription' | 'booking';
}

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/billing/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string, pdfUrl?: string) => {
    if (!pdfUrl) {
      toast.error('PDF not available');
      return;
    }

    setDownloading(invoiceId);
    try {
      // In production, this would download the PDF from Stripe
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloading(null);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      open: 'bg-blue-100 text-blue-800',
      draft: 'bg-gray-100 text-gray-800',
      void: 'bg-red-100 text-red-800',
      uncollectible: 'bg-amber-100 text-amber-800',
    };
    return <Badge className={colors[status] || ''}>{status}</Badge>;
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
      {/* Invoice Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">SaaS Invoices</CardTitle>
            </div>
            <CardDescription>
              Monthly subscription charges for your plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Invoices are generated monthly for your subscription plan. Download PDFs for your records.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Booking Receipts</CardTitle>
            </div>
            <CardDescription>
              Customer receipts for rental bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receipts are automatically sent to customers. Access them here for support or accounting.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Invoices & Receipts</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchInvoices}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No invoices yet. They'll appear here once you have active subscriptions or bookings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">
                        {invoice.number}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invoice.type === 'subscription' ? 'SaaS' : 'Booking'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadInvoice(invoice.id, invoice.pdfUrl)}
                          disabled={downloading === invoice.id}
                        >
                          {downloading === invoice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tax Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">SaaS Invoices:</strong> Include applicable taxes based on your location.
            Update your tax ID in Settings to ensure correct invoicing.
          </p>
          <p>
            <strong className="text-foreground">Booking Receipts:</strong> Show the breakdown of fees, taxes, and net
            payout amounts. Platform fees are automatically calculated.
          </p>
          <p>
            <strong className="text-foreground">Export:</strong> Download all invoices for a period from your{' '}
            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
              <a href="#" onClick={(e) => { e.preventDefault(); toast('Opening Stripe dashboard...'); }}>
                Stripe Dashboard <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
