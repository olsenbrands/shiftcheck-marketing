#!/usr/bin/env node
/**
 * Create Brevo Email Templates
 * Creates all 7 email templates for ShiftCheck in Brevo
 *
 * Usage: npx ts-node scripts/create-brevo-templates.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/templates';

// ShiftCheck branding colors
const BRAND_COLOR = '#10b981';
const BRAND_DARK = '#059669';

// Common email styles
const commonStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f3f4f6;
    margin: 0;
    padding: 20px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .header {
    background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_DARK} 100%);
    padding: 30px;
    text-align: center;
  }
  .logo {
    font-size: 28px;
    font-weight: bold;
    color: white;
    margin: 0;
  }
  .tagline {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    margin-top: 5px;
  }
  .content {
    padding: 30px;
    color: #374151;
    line-height: 1.7;
  }
  .content h2 {
    color: #111827;
    margin-top: 0;
  }
  .button {
    display: inline-block;
    background-color: ${BRAND_COLOR};
    color: white !important;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    margin: 20px 0;
    transition: background-color 0.2s;
  }
  .button:hover {
    background-color: ${BRAND_DARK};
  }
  .button-secondary {
    background-color: #6b7280;
  }
  .info-box {
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 16px;
    margin: 20px 0;
  }
  .warning-box {
    background-color: #fef3c7;
    border: 1px solid #fde68a;
    border-radius: 8px;
    padding: 16px;
    margin: 20px 0;
  }
  .error-box {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 16px;
    margin: 20px 0;
  }
  .footer {
    background-color: #f9fafb;
    padding: 20px 30px;
    text-align: center;
    font-size: 13px;
    color: #6b7280;
    border-top: 1px solid #e5e7eb;
  }
  .footer a {
    color: ${BRAND_COLOR};
    text-decoration: none;
  }
  .divider {
    height: 1px;
    background-color: #e5e7eb;
    margin: 20px 0;
  }
  ul {
    padding-left: 20px;
  }
  li {
    margin-bottom: 8px;
  }
`;

// Template definitions
interface TemplateDefinition {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
}

const templates: TemplateDefinition[] = [
  // Template 1: Welcome Email
  {
    id: 1,
    name: 'Welcome to ShiftCheck',
    subject: 'Welcome to ShiftCheck - Get Started!',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">ShiftCheck</h1>
      <p class="tagline">Restaurant Task Verification</p>
    </div>
    <div class="content">
      <h2>Welcome aboard, {{ params.firstName }}!</h2>
      <p>Thank you for joining ShiftCheck. We're excited to help you streamline your restaurant task management and verification process.</p>

      <div class="info-box">
        <strong>Your Plan:</strong> {{ params.planName }}<br>
        <strong>Account:</strong> {{ params.firstName }} {{ params.lastName }}
      </div>

      <p>Here's what you can do next:</p>
      <ul>
        <li><strong>Download the app</strong> - Get ShiftCheck on your mobile device</li>
        <li><strong>Set up your restaurants</strong> - Configure tasks and checklists</li>
        <li><strong>Invite your managers</strong> - Add your team members</li>
      </ul>

      <center>
        <a href="{{ params.dashboardLink }}" class="button">Go to Dashboard</a>
      </center>

      <p>Need help getting started? Check out our <a href="https://shiftcheck.app/help">help center</a> or reply to this email.</p>
    </div>
    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:{{ params.supportEmail }}">{{ params.supportEmail }}</a></p>
      <p>ShiftCheck &bull; Restaurant Task Verification</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  },

  // Template 2: Subscription Confirmed
  {
    id: 2,
    name: 'Subscription Confirmed',
    subject: 'Your ShiftCheck Subscription is Confirmed',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">ShiftCheck</h1>
      <p class="tagline">Restaurant Task Verification</p>
    </div>
    <div class="content">
      <h2>Subscription Confirmed!</h2>
      <p>Hi {{ params.firstName }},</p>
      <p>Great news! Your ShiftCheck subscription is now active. Here are your subscription details:</p>

      <div class="info-box">
        <strong>Plan:</strong> {{ params.planName }}<br>
        <strong>Restaurants:</strong> {{ params.restaurantCount }} active<br>
        <strong>Next Renewal:</strong> {{ params.renewalDate }}
      </div>

      <p>Your restaurants are now activated and ready to use. Your team can start logging tasks immediately.</p>

      <center>
        <a href="{{ params.dashboardLink }}" class="button">View Your Dashboard</a>
      </center>

      <p>Thank you for choosing ShiftCheck to manage your restaurant operations!</p>
    </div>
    <div class="footer">
      <p>Need to manage your subscription? <a href="{{ params.dashboardLink }}">Visit your account</a></p>
      <p>Questions? Contact us at <a href="mailto:{{ params.supportEmail }}">{{ params.supportEmail }}</a></p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  },

  // Template 3: Trial Ending (7 days)
  {
    id: 3,
    name: 'Trial Expiring Soon',
    subject: 'Your ShiftCheck Trial Ends in 7 Days',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">ShiftCheck</h1>
      <p class="tagline">Restaurant Task Verification</p>
    </div>
    <div class="content">
      <h2>Your Trial is Ending Soon</h2>
      <p>Hi {{ params.firstName }},</p>
      <p>Just a heads up - your ShiftCheck trial will expire on <strong>{{ params.trialEndDate }}</strong>.</p>

      <div class="warning-box">
        <strong>What happens when your trial ends?</strong>
        <ul style="margin-bottom: 0;">
          <li>Your restaurants will be deactivated</li>
          <li>Managers won't be able to log tasks</li>
          <li>Your data will be preserved for 30 days</li>
        </ul>
      </div>

      <p>Don't lose access to your task verification data! Upgrade now to keep your restaurants running smoothly.</p>

      <center>
        <a href="{{ params.upgradeLinkGrow }}" class="button">Upgrade to Grow - $99/mo</a>
        <br><br>
        <a href="{{ params.upgradeLinkExpand }}" class="button button-secondary">View All Plans</a>
      </center>

      <p>Have questions about our plans? We're happy to help you choose the right option for your business.</p>
    </div>
    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:{{ params.supportEmail }}">{{ params.supportEmail }}</a></p>
      <p>ShiftCheck &bull; Restaurant Task Verification</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  },

  // Template 4: Trial Expired
  {
    id: 4,
    name: 'Trial Expired',
    subject: 'Your ShiftCheck Trial Has Ended',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">ShiftCheck</h1>
      <p class="tagline">Restaurant Task Verification</p>
    </div>
    <div class="content">
      <h2>Your Trial Has Ended</h2>
      <p>Hi {{ params.firstName }},</p>
      <p>Your ShiftCheck free trial has now expired. Your restaurants have been deactivated, but don't worry - all your data is safe and will be preserved for 30 days.</p>

      <div class="error-box">
        <strong>Your current status:</strong>
        <ul style="margin-bottom: 0;">
          <li>Restaurants: Deactivated</li>
          <li>Task logging: Paused</li>
          <li>Data retention: 30 days remaining</li>
        </ul>
      </div>

      <p>Ready to continue using ShiftCheck? Upgrade now to reactivate your restaurants instantly.</p>

      <center>
        <a href="{{ params.dashboardLink }}" class="button">Upgrade Now</a>
      </center>

      <p>We'd love to have you back! If you have any questions or feedback about your trial experience, please let us know.</p>
    </div>
    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:{{ params.supportEmail }}">{{ params.supportEmail }}</a></p>
      <p>ShiftCheck &bull; Restaurant Task Verification</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  },

  // Template 5: Payment Failed
  {
    id: 5,
    name: 'Payment Failed',
    subject: 'Payment Failed - Action Required',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">ShiftCheck</h1>
      <p class="tagline">Restaurant Task Verification</p>
    </div>
    <div class="content">
      <h2>Payment Failed - Action Required</h2>
      <p>Hi {{ params.firstName }},</p>
      <p>We were unable to process your payment of <strong>{{ params.amount }}</strong> for your ShiftCheck subscription.</p>

      <div class="error-box">
        <strong>What this means:</strong>
        <ul style="margin-bottom: 0;">
          <li>Your subscription is currently past due</li>
          <li>Service may be interrupted if not resolved</li>
          <li>Please update your payment method</li>
        </ul>
      </div>

      <p>To avoid any service interruption, please update your payment information as soon as possible.</p>

      <center>
        <a href="{{ params.paymentPortalLink }}" class="button">Update Payment Method</a>
      </center>

      <p>Common reasons for payment failure:</p>
      <ul>
        <li>Expired credit card</li>
        <li>Insufficient funds</li>
        <li>Card declined by bank</li>
      </ul>

      <p>If you believe this is an error or need assistance, please contact us immediately.</p>
    </div>
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:{{ params.supportEmail }}">{{ params.supportEmail }}</a></p>
      <p>ShiftCheck &bull; Restaurant Task Verification</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  },

  // Template 6: Subscription Cancelled
  {
    id: 6,
    name: 'Subscription Cancelled',
    subject: 'Your ShiftCheck Subscription Has Been Cancelled',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">ShiftCheck</h1>
      <p class="tagline">Restaurant Task Verification</p>
    </div>
    <div class="content">
      <h2>Subscription Cancelled</h2>
      <p>Hi {{ params.firstName }},</p>
      <p>Your ShiftCheck subscription has been cancelled as of <strong>{{ params.cancellationDate }}</strong>.</p>

      <div class="info-box">
        <strong>What happens now:</strong>
        <ul style="margin-bottom: 0;">
          <li>Your restaurants have been deactivated</li>
          <li>Your data will be retained for 30 days</li>
          <li>You can reactivate anytime during this period</li>
        </ul>
      </div>

      <p>We're sorry to see you go. If you cancelled by mistake or would like to reactivate your account, you can do so from your dashboard.</p>

      <center>
        <a href="https://shiftcheck.app/signup" class="button">Reactivate Account</a>
      </center>

      <div class="divider"></div>

      <p><strong>We'd love your feedback!</strong></p>
      <p>If you have a moment, please let us know why you decided to cancel. Your feedback helps us improve ShiftCheck for everyone.</p>
    </div>
    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:{{ params.supportEmail }}">{{ params.supportEmail }}</a></p>
      <p>ShiftCheck &bull; Restaurant Task Verification</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  },

  // Template 7: Password Reset
  {
    id: 7,
    name: 'Password Reset',
    subject: 'Reset Your ShiftCheck Password',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">ShiftCheck</h1>
      <p class="tagline">Restaurant Task Verification</p>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>We received a request to reset your ShiftCheck password. Click the button below to create a new password:</p>

      <center>
        <a href="{{ params.resetLink }}" class="button">Reset Password</a>
      </center>

      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-size: 14px;">
        {{ params.resetLink }}
      </p>

      <div class="warning-box">
        <strong>Important:</strong> This link will expire in <strong>{{ params.expiryHours }} hours</strong>.
      </div>

      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

      <p>For security reasons, never share this link with anyone.</p>
    </div>
    <div class="footer">
      <p>Didn't request this? Contact us at <a href="mailto:{{ params.supportEmail }}">{{ params.supportEmail }}</a></p>
      <p>ShiftCheck &bull; Restaurant Task Verification</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  },

  // Template 8: Email Verification
  {
    id: 8,
    name: 'Email Verification',
    subject: 'Verify Your ShiftCheck Email',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${commonStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">ShiftCheck</h1>
      <p class="tagline">Restaurant Task Verification</p>
    </div>
    <div class="content">
      <h2>Verify Your Email</h2>
      <p>Hi {{ params.email }},</p>
      <p>Thank you for signing up for ShiftCheck! To complete your registration, please verify your email address by clicking the button below:</p>

      <center>
        <a href="{{ params.verificationLink }}" class="button">Verify Email</a>
      </center>

      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-size: 14px;">
        {{ params.verificationLink }}
      </p>

      <div class="warning-box">
        <strong>Important:</strong> This link will expire in <strong>{{ params.expiryHours }} hours</strong>.
      </div>

      <p>If you didn't create this account, please ignore this email or contact us at <a href="mailto:{{ params.supportEmail }}">{{ params.supportEmail }}</a>.</p>
    </div>
    <div class="footer">
      <p>Questions? Contact us at <a href="mailto:{{ params.supportEmail }}">{{ params.supportEmail }}</a></p>
      <p>ShiftCheck &bull; Restaurant Task Verification</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  },
];

interface BrevoError {
  code?: string;
  message?: string;
}

// Sender configuration (must match Brevo verified sender)
const SENDER_NAME = 'ShiftCheck';
const SENDER_EMAIL = 'jordan@olsenbrands.com';

async function createOrUpdateTemplate(template: TemplateDefinition): Promise<boolean> {
  const updatePayload = {
    name: template.name,
    subject: template.subject,
    htmlContent: template.htmlContent,
    isActive: true,
  };

  const createPayload = {
    ...updatePayload,
    sender: {
      name: SENDER_NAME,
      email: SENDER_EMAIL,
    },
    templateName: template.name,
  };

  try {
    // First, try to update existing template
    const updateResponse = await fetch(`${BREVO_API_URL}/${template.id}`, {
      method: 'PUT',
      headers: {
        'api-key': brevoApiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    if (updateResponse.ok) {
      console.log(`✅ Template #${template.id}: "${template.name}" - Updated`);
      return true;
    }

    // If update fails (template doesn't exist), create it
    const createResponse = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    const createData = await createResponse.json() as { id?: number } & BrevoError;

    if (createResponse.ok) {
      console.log(`✅ Template #${createData.id || template.id}: "${template.name}" - Created`);
      if (createData.id && createData.id !== template.id) {
        console.log(`   ⚠️  Note: Brevo assigned ID ${createData.id} (expected ${template.id})`);
      }
      return true;
    }

    console.error(`❌ Template #${template.id}: "${template.name}" - Failed`);
    console.error(`   Error: ${createData.message || 'Unknown error'}`);
    return false;

  } catch (error) {
    console.error(`❌ Template #${template.id}: "${template.name}" - Error`);
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        ShiftCheck - Brevo Email Template Setup             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Creating 8 email templates in Brevo...\n');

  let successCount = 0;
  let failCount = 0;

  for (const template of templates) {
    const success = await createOrUpdateTemplate(template);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`Results: ${successCount} succeeded, ${failCount} failed`);
  console.log('════════════════════════════════════════════════════════════\n');

  if (failCount === 0) {
    console.log('✅ All templates created successfully!\n');
    console.log('📝 Template ID Reference:');
    console.log('   1 - Welcome to ShiftCheck');
    console.log('   2 - Subscription Confirmed');
    console.log('   3 - Trial Expiring Soon');
    console.log('   4 - Trial Expired');
    console.log('   5 - Payment Failed');
    console.log('   6 - Subscription Cancelled');
    console.log('   7 - Password Reset');
    console.log('   8 - Email Verification');
    console.log('');
    console.log('📌 .env.local configuration:');
    console.log('   BREVO_TEMPLATE_WELCOME=1');
    console.log('   BREVO_TEMPLATE_SUBSCRIPTION_CONFIRMED=2');
    console.log('   BREVO_TEMPLATE_TRIAL_ENDING=3');
    console.log('   BREVO_TEMPLATE_TRIAL_EXPIRED=4');
    console.log('   BREVO_TEMPLATE_PAYMENT_FAILED=5');
    console.log('   BREVO_TEMPLATE_SUBSCRIPTION_CANCELLED=6');
    console.log('   BREVO_TEMPLATE_PASSWORD_RESET=7');
    console.log('   BREVO_TEMPLATE_EMAIL_VERIFICATION=8');
  } else {
    console.log('⚠️  Some templates failed. Check the errors above.');
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
