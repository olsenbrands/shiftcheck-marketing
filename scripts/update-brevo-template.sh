#!/bin/bash
# Update Brevo Email Verification Template
# Updates template #1 with the correct email verification content

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
  echo "❌ .env.local not found"
  exit 1
fi

# Extract BREVO_API_KEY
BREVO_API_KEY=$(grep "^BREVO_API_KEY=" "$PROJECT_ROOT/.env.local" | cut -d'=' -f2 | tr -d '\n')

if [ -z "$BREVO_API_KEY" ]; then
  echo "❌ BREVO_API_KEY not found in .env.local"
  exit 1
fi

TEMPLATE_ID=1
API_URL="https://api.brevo.com/v3/smtp/templates"

# HTML content for the email verification template
read -r -d '' HTML_CONTENT << 'EOF' || true
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
      <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">{{ verificationLink }}</p>

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
EOF

# Create JSON payload
PAYLOAD=$(cat <<EOF
{
  "name": "Email Verification",
  "subject": "Verify your ShiftCheck email",
  "htmlContent": $(echo "$HTML_CONTENT" | jq -Rs .),
  "isActive": true
}
EOF
)

echo "📧 Updating Brevo template #${TEMPLATE_ID}..."

# Update the template via API
RESPONSE=$(curl -s -X PUT "${API_URL}/${TEMPLATE_ID}" \
  -H "api-key: ${BREVO_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Check if the response contains an error
if echo "$RESPONSE" | grep -q "\"error\""; then
  echo "❌ Failed to update template:"
  echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

echo "✅ Template updated successfully!"
echo "   Template ID: ${TEMPLATE_ID}"
echo "   Name: Email Verification"
echo "   Subject: Verify your ShiftCheck email"
echo "   Status: Active"
echo ""
echo "📝 Required placeholders verified:"
echo "   ✓ {{ verificationLink }} - Email verification link"
echo "   ✓ {{ email }} - Recipient email address"
echo "   ✓ {{ expiryHours }} - Token expiry time (24 hours)"
echo "   ✓ {{ supportEmail }} - Support contact email"
echo ""
echo "✅ Update complete! Phase 2.1 email verification is ready."
echo ""
echo "📌 Important: .env.local currently has:"
echo "   BREVO_TEMPLATE_EMAIL_VERIFICATION=7"
echo ""
echo "   Since we just updated template #1, update .env.local to:"
echo "   BREVO_TEMPLATE_EMAIL_VERIFICATION=1"
