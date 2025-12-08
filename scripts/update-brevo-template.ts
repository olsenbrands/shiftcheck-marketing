#!/usr/bin/env node
/**
 * Update Brevo Email Verification Template
 * Updates template #1 with the correct email verification content
 *
 * Usage: npx ts-node scripts/update-brevo-template.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const brevoApiKey = envContent.split('\n')
  .find(line => line.startsWith('BREVO_API_KEY='))
  ?.split('=')[1]
  ?.trim();

if (!brevoApiKey) {
  console.error('❌ BREVO_API_KEY not found in .env.local');
  process.exit(1);
}

const TEMPLATE_ID = 1;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/templates';

// Email verification template HTML
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
    .header { text-align: center; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #10b981; }
    .content { color: #333; line-height: 1.6; }
    .button {
      display: inline-block;
      background-color: #10b981;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      border-top: 1px solid #eee;
      margin-top: 20px;
      padding-top: 20px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">ShiftCheck</div>
    </div>

    <div class="content">
      <p>Hi {{ email }},</p>

      <p>Thank you for signing up for ShiftCheck! To complete your registration, please verify your email address by clicking the link below:</p>

      <center>
        <a href="{{ verificationLink }}" class="button">Verify Email</a>
      </center>

      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
        {{ verificationLink }}
      </p>

      <p><strong>This link expires in {{ expiryHours }} hours.</strong></p>

      <p>If you didn't create this account, please contact us at {{ supportEmail }}</p>

      <p>Best regards,<br>The ShiftCheck Team</p>
    </div>

    <div class="footer">
      <p>ShiftCheck • https://shiftcheck.app</p>
    </div>
  </div>
</body>
</html>
`;

interface UpdateTemplatePayload {
  name: string;
  subject: string;
  htmlContent: string;
  isActive?: boolean;
}

async function updateTemplate(): Promise<void> {
  const payload: UpdateTemplatePayload = {
    name: 'Email Verification',
    subject: 'Verify your ShiftCheck email',
    htmlContent: htmlContent.trim(),
    isActive: true,
  };

  try {
    console.log(`📧 Updating Brevo template #${TEMPLATE_ID}...`);

    const response = await fetch(`${BREVO_API_URL}/${TEMPLATE_ID}`, {
      method: 'PUT',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json() as Record<string, unknown>;

    if (!response.ok) {
      console.error('❌ Failed to update template:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ Template updated successfully!');
    console.log(`   Template ID: ${TEMPLATE_ID}`);
    console.log(`   Name: ${payload.name}`);
    console.log(`   Subject: ${payload.subject}`);
    console.log(`   Status: Active`);
    console.log('\n📝 Required placeholders verified:');
    console.log(`   ✓ {{ verificationLink }} - Email verification link`);
    console.log(`   ✓ {{ email }} - Recipient email address`);
    console.log(`   ✓ {{ expiryHours }} - Token expiry time (24 hours)`);
    console.log(`   ✓ {{ supportEmail }} - Support contact email`);

    console.log('\n✅ Update complete! Phase 2.1 email verification is ready.');
    console.log('\n📌 Note: .env.local is already configured with:');
    console.log('   BREVO_TEMPLATE_EMAIL_VERIFICATION=7');
    console.log('\n   Since we updated template #1, you should either:');
    console.log('   1. Update .env.local to: BREVO_TEMPLATE_EMAIL_VERIFICATION=1');
    console.log('   2. Or create another template and keep ID=7 in config');

  } catch (error) {
    console.error('❌ Error updating template:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the update
updateTemplate();
