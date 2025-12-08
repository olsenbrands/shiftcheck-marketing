/**
 * Get Stripe Invoices
 * ShiftCheck Marketing Website
 *
 * Fetches billing history (invoices) for a customer.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

interface GetInvoicesRequest {
  customerId: string;
  limit?: number;
}

export interface InvoiceData {
  id: string;
  number: string | null;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  created: number;
  period_start: number;
  period_end: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId, limit = 10 } = req.body as GetInvoicesRequest;

  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required' });
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: Math.min(limit, 100),
    });

    const invoiceData: InvoiceData[] = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      created: invoice.created,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
    }));

    return res.status(200).json({ invoices: invoiceData });
  } catch (error) {
    console.error('Error fetching invoices:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}
