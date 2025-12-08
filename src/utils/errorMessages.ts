/**
 * Error Message Utilities
 * ShiftCheck Marketing Website
 *
 * Centralizes user-friendly error messages for:
 * - Stripe payment errors
 * - Supabase authentication errors
 * - Brevo email service errors
 * - Network/transient errors
 */

// ============================================================================
// Types
// ============================================================================

export interface ErrorDetails {
  message: string;
  action?: string;
  retryable: boolean;
}

// ============================================================================
// Stripe Error Messages
// ============================================================================

/**
 * Stripe error codes to user-friendly messages
 * Reference: https://stripe.com/docs/error-codes
 */
const STRIPE_ERROR_MESSAGES: Record<string, ErrorDetails> = {
  // Card errors
  card_declined: {
    message: 'Your card was declined. Please try a different payment method.',
    action: 'Try a different card or contact your bank.',
    retryable: true,
  },
  insufficient_funds: {
    message: 'Your card has insufficient funds.',
    action: 'Please use a different card or add funds to your account.',
    retryable: true,
  },
  expired_card: {
    message: 'Your card has expired.',
    action: 'Please use a different card.',
    retryable: true,
  },
  incorrect_cvc: {
    message: 'The security code (CVC) is incorrect.',
    action: 'Please check your card details and try again.',
    retryable: true,
  },
  incorrect_number: {
    message: 'The card number is incorrect.',
    action: 'Please check your card number and try again.',
    retryable: true,
  },
  invalid_cvc: {
    message: 'The security code is invalid.',
    action: 'Please enter a valid CVC.',
    retryable: true,
  },
  invalid_expiry_month: {
    message: 'The expiration month is invalid.',
    action: 'Please check your card expiration date.',
    retryable: true,
  },
  invalid_expiry_year: {
    message: 'The expiration year is invalid.',
    action: 'Please check your card expiration date.',
    retryable: true,
  },
  invalid_number: {
    message: 'The card number is not valid.',
    action: 'Please check your card number.',
    retryable: true,
  },
  processing_error: {
    message: 'An error occurred while processing your card.',
    action: 'Please try again in a few moments.',
    retryable: true,
  },
  rate_limit: {
    message: 'Too many requests. Please wait a moment.',
    action: 'Please wait a few seconds and try again.',
    retryable: true,
  },

  // 3D Secure errors
  authentication_required: {
    message: 'Additional authentication is required.',
    action: 'Please complete the authentication process.',
    retryable: true,
  },

  // Generic card errors
  generic_decline: {
    message: 'Your card was declined.',
    action: 'Please contact your bank or try a different card.',
    retryable: true,
  },
  do_not_honor: {
    message: 'Your bank declined the transaction.',
    action: 'Please contact your bank for more information.',
    retryable: true,
  },
  lost_card: {
    message: 'This card has been reported lost.',
    action: 'Please use a different payment method.',
    retryable: false,
  },
  stolen_card: {
    message: 'This card has been reported stolen.',
    action: 'Please use a different payment method.',
    retryable: false,
  },
  fraudulent: {
    message: 'This transaction was flagged as potentially fraudulent.',
    action: 'Please contact support if you believe this is an error.',
    retryable: false,
  },

  // API errors
  api_connection_error: {
    message: 'Unable to connect to payment service.',
    action: 'Please check your internet connection and try again.',
    retryable: true,
  },
  api_error: {
    message: 'Payment service temporarily unavailable.',
    action: 'Please try again in a few moments.',
    retryable: true,
  },
  idempotency_error: {
    message: 'This payment has already been processed.',
    action: 'Please check your email for confirmation.',
    retryable: false,
  },
};

/**
 * Get user-friendly message for Stripe error
 */
export function getStripeErrorMessage(
  errorCode?: string,
  declineCode?: string,
  fallbackMessage?: string
): ErrorDetails {
  // Check decline code first (more specific)
  if (declineCode && STRIPE_ERROR_MESSAGES[declineCode]) {
    return STRIPE_ERROR_MESSAGES[declineCode];
  }

  // Check error code
  if (errorCode && STRIPE_ERROR_MESSAGES[errorCode]) {
    return STRIPE_ERROR_MESSAGES[errorCode];
  }

  // Default fallback
  return {
    message: fallbackMessage || 'Payment failed. Please try again.',
    action: 'If the problem persists, try a different payment method.',
    retryable: true,
  };
}

// ============================================================================
// Supabase Auth Error Messages
// ============================================================================

/**
 * Supabase Auth error messages
 * Reference: https://supabase.com/docs/reference/javascript/auth-error-codes
 */
const SUPABASE_AUTH_ERRORS: Record<string, ErrorDetails> = {
  // Sign up errors
  user_already_exists: {
    message: 'An account with this email already exists.',
    action: 'Please sign in instead, or use a different email.',
    retryable: false,
  },
  email_exists: {
    message: 'This email is already registered.',
    action: 'Please sign in or use a different email address.',
    retryable: false,
  },
  signup_disabled: {
    message: 'New registrations are temporarily disabled.',
    action: 'Please try again later or contact support.',
    retryable: true,
  },
  weak_password: {
    message: 'Password is too weak.',
    action: 'Please use at least 8 characters with letters and numbers.',
    retryable: true,
  },

  // Sign in errors
  invalid_credentials: {
    message: 'Invalid email or password.',
    action: 'Please check your credentials and try again.',
    retryable: true,
  },
  invalid_login_credentials: {
    message: 'Invalid email or password.',
    action: 'Please check your credentials and try again.',
    retryable: true,
  },
  email_not_confirmed: {
    message: 'Please verify your email before signing in.',
    action: 'Check your inbox for the verification link.',
    retryable: false,
  },
  user_not_found: {
    message: 'No account found with this email.',
    action: 'Please check your email or create a new account.',
    retryable: false,
  },

  // Session/token errors
  session_not_found: {
    message: 'Your session has expired.',
    action: 'Please sign in again.',
    retryable: true,
  },
  refresh_token_not_found: {
    message: 'Your session has expired.',
    action: 'Please sign in again.',
    retryable: true,
  },
  invalid_refresh_token: {
    message: 'Your session is no longer valid.',
    action: 'Please sign in again.',
    retryable: true,
  },

  // Rate limiting
  over_request_rate_limit: {
    message: 'Too many attempts. Please wait before trying again.',
    action: 'Wait a few minutes and try again.',
    retryable: true,
  },
  over_email_send_rate_limit: {
    message: 'Too many email requests. Please wait before trying again.',
    action: 'Wait a few minutes before requesting another email.',
    retryable: true,
  },

  // OAuth errors
  provider_disabled: {
    message: 'This sign-in method is not available.',
    action: 'Please use email and password to sign in.',
    retryable: false,
  },

  // Password reset errors
  same_password: {
    message: 'New password must be different from your current password.',
    action: 'Please choose a different password.',
    retryable: true,
  },

  // Generic errors
  unexpected_failure: {
    message: 'An unexpected error occurred.',
    action: 'Please try again. If the problem persists, contact support.',
    retryable: true,
  },
};

/**
 * Get user-friendly message for Supabase auth error
 */
export function getSupabaseAuthErrorMessage(
  error: { message?: string; code?: string; status?: number } | null
): ErrorDetails {
  if (!error) {
    return {
      message: 'An unexpected error occurred.',
      action: 'Please try again.',
      retryable: true,
    };
  }

  // Check for specific error codes
  if (error.code && SUPABASE_AUTH_ERRORS[error.code]) {
    return SUPABASE_AUTH_ERRORS[error.code];
  }

  // Check for common error message patterns
  const message = error.message?.toLowerCase() || '';

  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return SUPABASE_AUTH_ERRORS.invalid_credentials;
  }

  if (message.includes('user already registered') || message.includes('already exists')) {
    return SUPABASE_AUTH_ERRORS.user_already_exists;
  }

  if (message.includes('email not confirmed')) {
    return SUPABASE_AUTH_ERRORS.email_not_confirmed;
  }

  if (message.includes('rate limit') || message.includes('too many')) {
    return SUPABASE_AUTH_ERRORS.over_request_rate_limit;
  }

  if (message.includes('weak password') || message.includes('password')) {
    if (message.includes('same')) {
      return SUPABASE_AUTH_ERRORS.same_password;
    }
    return SUPABASE_AUTH_ERRORS.weak_password;
  }

  if (message.includes('session') || message.includes('token')) {
    return SUPABASE_AUTH_ERRORS.session_not_found;
  }

  // Default fallback
  return {
    message: error.message || 'Authentication failed.',
    action: 'Please try again. If the problem persists, contact support.',
    retryable: true,
  };
}

// ============================================================================
// Brevo Email Error Messages
// ============================================================================

/**
 * Brevo API error messages
 */
const BREVO_ERROR_MESSAGES: Record<string, ErrorDetails> = {
  invalid_parameter: {
    message: 'Invalid email address format.',
    action: 'Please check your email address and try again.',
    retryable: true,
  },
  missing_parameter: {
    message: 'Email address is required.',
    action: 'Please enter your email address.',
    retryable: true,
  },
  unauthorized: {
    message: 'Email service configuration error.',
    action: 'Please contact support.',
    retryable: false,
  },
  account_under_validation: {
    message: 'Email service is being configured.',
    action: 'Please try again in a few minutes.',
    retryable: true,
  },
  permission_denied: {
    message: 'Unable to send email at this time.',
    action: 'Please try again later or contact support.',
    retryable: true,
  },
  document_not_found: {
    message: 'Email template not found.',
    action: 'Please contact support.',
    retryable: false,
  },
  method_not_allowed: {
    message: 'Unable to process email request.',
    action: 'Please try again.',
    retryable: true,
  },
  not_enough_credits: {
    message: 'Email service temporarily unavailable.',
    action: 'Please try again later.',
    retryable: true,
  },
  rate_limit_exceeded: {
    message: 'Too many email requests. Please wait.',
    action: 'Wait a few minutes before requesting another email.',
    retryable: true,
  },
};

/**
 * Get user-friendly message for Brevo email error
 */
export function getBrevoErrorMessage(
  statusCode?: number,
  errorCode?: string,
  errorMessage?: string
): ErrorDetails {
  // Check specific error code
  if (errorCode && BREVO_ERROR_MESSAGES[errorCode]) {
    return BREVO_ERROR_MESSAGES[errorCode];
  }

  // Check status codes
  if (statusCode) {
    switch (statusCode) {
      case 400:
        return BREVO_ERROR_MESSAGES.invalid_parameter;
      case 401:
        return BREVO_ERROR_MESSAGES.unauthorized;
      case 403:
        return BREVO_ERROR_MESSAGES.permission_denied;
      case 404:
        return BREVO_ERROR_MESSAGES.document_not_found;
      case 405:
        return BREVO_ERROR_MESSAGES.method_not_allowed;
      case 429:
        return BREVO_ERROR_MESSAGES.rate_limit_exceeded;
      case 500:
      case 502:
      case 503:
        return {
          message: 'Email service temporarily unavailable.',
          action: 'Please try again in a few moments.',
          retryable: true,
        };
    }
  }

  // Default fallback
  return {
    message: errorMessage || 'Failed to send email.',
    action: 'Please try again. If the problem persists, contact support.',
    retryable: true,
  };
}

// ============================================================================
// Network/Transient Error Messages
// ============================================================================

/**
 * Get user-friendly message for network errors
 */
export function getNetworkErrorMessage(error?: Error | unknown): ErrorDetails {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  if (message.includes('network') || message.includes('fetch')) {
    return {
      message: 'Unable to connect. Please check your internet connection.',
      action: 'Check your connection and try again.',
      retryable: true,
    };
  }

  if (message.includes('timeout')) {
    return {
      message: 'Request timed out.',
      action: 'Please try again.',
      retryable: true,
    };
  }

  if (message.includes('abort')) {
    return {
      message: 'Request was cancelled.',
      action: 'Please try again.',
      retryable: true,
    };
  }

  return {
    message: 'An unexpected error occurred.',
    action: 'Please try again. If the problem persists, contact support.',
    retryable: true,
  };
}

// ============================================================================
// Verification Link Error Messages
// ============================================================================

/**
 * Get user-friendly message for verification link errors
 */
export function getVerificationErrorMessage(errorType: string): ErrorDetails {
  switch (errorType) {
    case 'expired':
    case 'Token has expired':
      return {
        message: 'This verification link has expired.',
        action: 'Please request a new verification email.',
        retryable: true,
      };
    case 'invalid':
    case 'Invalid token format':
    case 'Invalid token signature':
      return {
        message: 'This verification link is invalid.',
        action: 'Please request a new verification email.',
        retryable: true,
      };
    case 'used':
      return {
        message: 'This verification link has already been used.',
        action: 'You can sign in to your account.',
        retryable: false,
      };
    default:
      return {
        message: 'Unable to verify your email.',
        action: 'Please request a new verification email.',
        retryable: true,
      };
  }
}

// ============================================================================
// Duplicate Email Error Messages
// ============================================================================

/**
 * Get user-friendly message for duplicate email attempts
 */
export function getDuplicateEmailMessage(): ErrorDetails {
  return {
    message: 'An account with this email already exists.',
    action: 'Please sign in instead, or use "Forgot Password" to recover your account.',
    retryable: false,
  };
}

// ============================================================================
// Generic Error Handler
// ============================================================================

/**
 * Parse and return user-friendly error message from any error type
 */
export function parseError(error: unknown): ErrorDetails {
  // Handle null/undefined
  if (!error) {
    return getNetworkErrorMessage();
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return getNetworkErrorMessage(error);
    }

    return {
      message: error.message,
      retryable: true,
    };
  }

  // Handle error objects with message property
  if (typeof error === 'object' && 'message' in error) {
    return {
      message: String((error as { message: unknown }).message),
      retryable: true,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      message: error,
      retryable: true,
    };
  }

  // Fallback
  return getNetworkErrorMessage();
}
