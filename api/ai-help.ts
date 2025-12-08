/**
 * AI Help API Endpoint
 * ShiftCheck Marketing Website
 *
 * Provides AI-powered assistance for sign-up questions using Groq API.
 * Model: Llama 3.3 70B Versatile
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Model configuration
const MODEL = 'llama-3.3-70b-versatile';

// ShiftCheck knowledge base for the AI
const SHIFTCHECK_KNOWLEDGE = `
# ShiftCheck - Restaurant Task Verification App

## What is ShiftCheck?
ShiftCheck is a mobile app that helps restaurant owners verify that daily tasks (cleaning, food prep, safety checks) are being completed by their managers. Managers submit photo and video evidence of completed tasks, and owners can review them from anywhere.

## Key Features
- **Task Verification**: Managers submit photo/video proof of completed tasks
- **Real-time Monitoring**: Owners see task completion status in real-time
- **Multi-Restaurant Support**: Manage multiple locations from one account
- **Customizable Checklists**: Create task lists specific to each restaurant
- **Manager Accountability**: Track who completed what and when
- **Photo/Video Evidence**: Visual proof that tasks are done correctly

## Pricing Plans
1. **Free Starter** - $0/month
   - 1 restaurant
   - Basic task verification
   - Great for trying out ShiftCheck

2. **Grow** - $99/month per restaurant
   - Unlimited restaurants
   - Full features
   - Priority support
   - Best for growing businesses

3. **Expand** - $99/month per restaurant
   - Same as Grow
   - Volume discounts available for 4+ restaurants
   - Dedicated account manager for large accounts

## Free Trial
- All paid plans include a 14-day free trial
- No credit card required to start
- Full access to all features during trial
- Can cancel anytime

## Sign-Up Process (7 Steps)
1. **Email Verification**: Enter and verify your email address
2. **Login**: Create password and sign in
3. **Owner Profile**: Enter your name, phone, and billing address
4. **Restaurant Setup**: Add your restaurants and assign managers
5. **Plan Selection**: Choose Free Starter, Grow, or Expand
6. **Payment**: Enter payment details (skip for Free Starter)
7. **Complete**: Download the app and start using ShiftCheck

## Manager Setup
- Managers are added per restaurant
- Each manager needs a name and phone number
- Managers receive SMS invitations to download the app
- "Owner Managed" option if owner also manages a location

## Referral Program
- Get 10% off your next month for each friend who signs up
- Friends get 10% off their first month
- Referral rewards stack (multiple referrals = multiple discounts)

## Payment & Billing
- Secure payment processing via Stripe
- Monthly billing cycle
- Can upgrade/downgrade anytime
- Prorated charges for mid-cycle changes

## Support
- Email: support@shiftcheck.app
- AI-powered help chat during sign-up
- Response within 24 hours
`;

// System prompt for the AI
const SYSTEM_PROMPT = `You are ShiftCheck's helpful AI assistant. Your role is to help users during the sign-up process by answering questions about plans, pricing, features, and the sign-up steps.

${SHIFTCHECK_KNOWLEDGE}

## Response Guidelines
1. Be friendly, helpful, and concise (2-4 sentences max)
2. Use simple, clear language
3. If asked about something outside ShiftCheck, politely redirect
4. For technical issues or account-specific questions, suggest contacting support
5. Always be encouraging about the sign-up process
6. If you're unsure, say so and recommend emailing support@shiftcheck.app
7. Never make up features or pricing - stick to the knowledge provided
8. Use bullet points sparingly and only when listing multiple items

## Context Awareness
When the user is on a specific sign-up step, be aware of their context and provide relevant help. If they seem stuck, offer guidance for that specific step.

## Escalation
If the user seems frustrated, asks complex billing questions, or has technical issues, suggest emailing support@shiftcheck.app for personalized help.`;

interface MessageHistory {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  context?: {
    step: string;
    stepNumber: number;
    description: string;
  } | null;
  messageHistory?: MessageHistory[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for API key
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY not configured');
    return res.status(500).json({ error: 'AI service not configured' });
  }

  const { message, context, messageHistory = [] } = req.body as RequestBody;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Trim message
  const userMessage = message.trim();
  if (userMessage.length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  // Limit message length to prevent abuse
  const MAX_MESSAGE_LENGTH = 1000;
  if (userMessage.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`,
    });
  }

  // Validate message history length
  if (messageHistory.length > 20) {
    return res.status(400).json({
      error: 'Message history too long. Maximum 20 messages allowed.',
    });
  }

  // Rate limiting could be added here

  try {
    // Build context message
    let contextMessage = '';
    if (context) {
      contextMessage = `\n\n[User Context: Currently on Step ${context.stepNumber} - ${context.description}]`;
    }

    // Build message history for context
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + contextMessage,
      },
    ];

    // Add recent message history (limited to last 6 messages)
    const recentHistory = messageHistory.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    console.log('[ai-help] Processing message:', userMessage);
    if (context) {
      console.log('[ai-help] Context:', context.step);
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 300,
      top_p: 0.9,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('Empty response from Groq');
    }

    console.log('[ai-help] Response generated successfully');

    // Determine if we should suggest email escalation
    const suggestEmail = shouldSuggestEmail(userMessage, responseText);

    return res.status(200).json({
      response: responseText,
      suggestEmail,
    });
  } catch (error) {
    console.error('[ai-help] Error:', error);

    // Return a graceful fallback response
    const fallbackResponse = getFallbackResponse(userMessage, context);

    return res.status(200).json({
      response: fallbackResponse,
      suggestEmail: true,
    });
  }
}

/**
 * Determine if we should suggest email support
 */
function shouldSuggestEmail(userMessage: string, response: string): boolean {
  const triggerWords = [
    'refund',
    'cancel',
    'billing issue',
    'charged',
    'not working',
    'error',
    'bug',
    'account locked',
    'delete account',
    'frustrated',
    'angry',
    'terrible',
  ];

  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = response.toLowerCase();

  // Check if message contains trigger words
  if (triggerWords.some((word) => lowerMessage.includes(word))) {
    return true;
  }

  // Check if response mentions support
  if (
    lowerResponse.includes('support@shiftcheck.app') ||
    lowerResponse.includes('contact support') ||
    lowerResponse.includes('reach out')
  ) {
    return true;
  }

  return false;
}

/**
 * Provide a fallback response if AI fails
 */
function getFallbackResponse(
  userMessage: string,
  context?: { step: string; stepNumber: number } | null
): string {
  const lowerMessage = userMessage.toLowerCase();

  // Common questions with fallback answers
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "ShiftCheck offers three plans: Free Starter ($0/month for 1 restaurant), Grow ($99/month per restaurant), and Expand ($99/month per restaurant with volume discounts). All paid plans include a 14-day free trial!";
  }

  if (lowerMessage.includes('trial') || lowerMessage.includes('free')) {
    return "Yes! All paid plans include a 14-day free trial with full access to all features. No credit card required to start the Free Starter plan.";
  }

  if (lowerMessage.includes('cancel')) {
    return "You can cancel your subscription anytime from your account settings. If you need help with cancellation, please email support@shiftcheck.app.";
  }

  if (context) {
    return `I'm having a bit of trouble understanding your question. You're currently on Step ${context.stepNumber} of the sign-up process. If you're stuck, please email support@shiftcheck.app and we'll help you right away!`;
  }

  return "I'm sorry, I'm having trouble processing your request right now. Please email support@shiftcheck.app and our team will help you within 24 hours!";
}
