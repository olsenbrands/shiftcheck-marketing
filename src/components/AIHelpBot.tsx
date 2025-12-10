/**
 * AI Help Bot Component
 * ShiftCheck Marketing Website
 *
 * Floating chat widget that provides AI-powered help during sign-up.
 * Uses Groq API for intelligent responses about plans, pricing, and features.
 */

import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Mail,
  ChevronDown,
  Bot,
  User,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SignUpContext {
  step: string;
  stepNumber: number;
  description: string;
}

// Map routes to sign-up context
function getSignUpContext(pathname: string): SignUpContext | null {
  const contextMap: Record<string, SignUpContext> = {
    '/auth/verify-email': {
      step: 'email_verification',
      stepNumber: 1,
      description: 'Email Verification - User is verifying their email address',
    },
    '/auth/login': {
      step: 'login',
      stepNumber: 2,
      description: 'Login - User is signing in to their account',
    },
    '/signup/profile': {
      step: 'profile',
      stepNumber: 3,
      description: 'Owner Profile - User is entering personal and billing information',
    },
    '/signup/restaurants': {
      step: 'restaurants',
      stepNumber: 4,
      description: 'Restaurant Setup - User is adding their restaurants and managers',
    },
    '/signup/plan': {
      step: 'plan_selection',
      stepNumber: 5,
      description: 'Plan Selection - User is choosing a subscription plan (Free Starter, Grow, or Expand)',
    },
    '/signup/payment': {
      step: 'payment',
      stepNumber: 6,
      description: 'Payment - User is entering payment information for their subscription',
    },
    '/signup/complete': {
      step: 'complete',
      stepNumber: 7,
      description: 'Sign-up Complete - User has finished the sign-up process',
    },
  };

  return contextMap[pathname] || null;
}

// Quick action suggestions based on context
function getQuickActions(context: SignUpContext | null): string[] {
  if (!context) {
    return [
      'What is ShiftCheck?',
      'How much does it cost?',
      'Is there a free trial?',
    ];
  }

  const actionMap: Record<string, string[]> = {
    email_verification: [
      "I didn't receive the email",
      'Can I use a different email?',
      'How long does verification take?',
    ],
    login: [
      'I forgot my password',
      "I don't have an account",
      'Having trouble signing in',
    ],
    profile: [
      'Why do you need my phone?',
      'Can I change my info later?',
      'What is a referral code?',
    ],
    restaurants: [
      'How do I add managers?',
      'Can I add more restaurants later?',
      'What is "Owner Managed"?',
    ],
    plan_selection: [
      'What plan is best for me?',
      "What's the difference between plans?",
      'Can I upgrade later?',
    ],
    payment: [
      'Is my payment secure?',
      'When will I be charged?',
      'What payment methods accepted?',
    ],
    complete: [
      'How do I download the app?',
      'How do I invite my team?',
      'Where do I go from here?',
    ],
  };

  return actionMap[context.step] || [];
}

export default function AIHelpBot() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailOption, setShowEmailOption] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const context = getSignUpContext(location.pathname);
  const quickActions = getQuickActions(context);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Add welcome message when chat first opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: context
          ? `Hi! I'm here to help you with the sign-up process. You're currently on step ${context.stepNumber}: ${context.step.replace('_', ' ')}. How can I assist you?`
          : "Hi! I'm ShiftCheck's AI assistant. I can help you with questions about our plans, pricing, features, and the sign-up process. What would you like to know?",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, context]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowEmailOption(false);

    try {
      const response = await fetch('/api/ai-help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          context: context
            ? {
                step: context.step,
                stepNumber: context.stepNumber,
                description: context.description,
              }
            : null,
          messageHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Show email option if response suggests it
      if (data.suggestEmail) {
        setShowEmailOption(true);
      }
    } catch (error) {
      console.error('AI Help error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          "I'm sorry, I encountered an issue. Please try again or contact us at support@shiftcheck.app for help.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setShowEmailOption(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent('ShiftCheck Sign-Up Help');
    const body = encodeURIComponent(
      `Hi ShiftCheck Support,\n\nI need help with: \n\n[Please describe your issue here]\n\nSign-up step: ${context?.step || 'Unknown'}\n`
    );
    window.open(`mailto:support@shiftcheck.app?subject=${subject}&body=${body}`);
  };

  // Don't render on non-signup pages
  if (!location.pathname.startsWith('/signup') &&
      !location.pathname.startsWith('/auth') &&
      location.pathname !== '/') {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-primary-500 hover:bg-primary-600'
        }`}
        aria-label={isOpen ? 'Close help chat' : 'Open help chat'}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Tooltip (shown when closed) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-24 z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg animate-pulse">
          Need help?
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900" />
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="h-6 w-6 text-white mr-2" />
              <div>
                <h3 className="font-semibold text-white">ShiftCheck Help</h3>
                <p className="text-xs text-primary-100">AI-powered assistance</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80 min-h-48 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' && (
                      <Bot className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'user' && (
                      <User className="h-4 w-4 text-primary-200 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-primary-500 animate-spin" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && quickActions.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(action)}
                    disabled={isLoading}
                    className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors disabled:opacity-50"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email Support Option */}
          {showEmailOption && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-100">
              <button
                onClick={handleEmailSupport}
                className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800"
              >
                <Mail className="h-4 w-4" />
                <span>Need more help? Email our support team</span>
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by AI &bull;{' '}
              <button
                onClick={handleEmailSupport}
                className="text-primary-500 hover:underline"
              >
                Email support
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
