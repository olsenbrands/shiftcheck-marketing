/**
 * Send Manager Invitation SMS
 * Marketing Website - Vercel Serverless Function
 *
 * Sends SMS to manager's phone with signup link.
 * Uses same Twilio credentials as shiftcheck-app.
 * Updates shared database so both dashboards stay in sync.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, message } = req.body;

    console.log('📱 Send Invitation SMS - Request received');
    console.log('   Phone:', phone);
    console.log('   Message length:', message?.length);

    // Validate inputs
    if (!phone || !message) {
      return res.status(400).json({ error: 'Phone and message are required' });
    }

    // Validate E.164 format (+1XXXXXXXXXX)
    if (!phone.startsWith('+1') || phone.length !== 12) {
      console.error('❌ Invalid phone format:', phone);
      return res.status(400).json({
        error: 'Phone must be in E.164 format (+1XXXXXXXXXX)',
        received: phone
      });
    }

    // Check Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // Debug logging
    console.log('📱 Twilio env check:');
    console.log('   TWILIO_ACCOUNT_SID:', accountSid ? `${accountSid.substring(0, 8)}...` : 'NOT SET');
    console.log('   TWILIO_AUTH_TOKEN:', authToken ? 'SET (hidden)' : 'NOT SET');
    console.log('   TWILIO_PHONE_NUMBER:', fromNumber || 'NOT SET');

    if (!accountSid || !authToken) {
      console.error('❌ Twilio credentials not configured');
      return res.status(500).json({
        error: 'SMS service not configured',
        details: 'Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN'
      });
    }

    if (!fromNumber) {
      console.error('❌ No Twilio phone number configured');
      return res.status(500).json({
        error: 'SMS service not configured',
        details: 'Missing TWILIO_PHONE_NUMBER'
      });
    }

    console.log('📱 Sending SMS via Twilio...');
    console.log('   To:', phone);
    console.log('   From:', fromNumber);

    // Build Twilio API request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append('To', phone);
    formData.append('Body', message);
    formData.append('From', fromNumber);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
      },
      body: formData.toString()
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('❌ Twilio API error:', twilioResult);
      return res.status(twilioResponse.status).json({
        error: 'Failed to send SMS',
        details: twilioResult.message || twilioResult.error_message,
        code: twilioResult.code || twilioResult.error_code
      });
    }

    console.log('✅ SMS sent successfully');
    console.log('   Message SID:', twilioResult.sid);
    console.log('   Status:', twilioResult.status);

    return res.status(200).json({
      success: true,
      messageSid: twilioResult.sid,
      status: twilioResult.status,
      to: twilioResult.to
    });

  } catch (error) {
    console.error('❌ Send invitation SMS error:', error);
    return res.status(500).json({
      error: 'Failed to send invitation SMS',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
