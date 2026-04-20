/**
 * Custom error classes for LiteAPI operations.
 * These help distinguish between different failure modes in the UI.
 */

export class LiteAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string,
    public readonly raw?: unknown
  ) {
    super(message)
    this.name = 'LiteAPIError'
  }
}

export class LiteAPIAuthError extends LiteAPIError {
  constructor(message = 'LiteAPI authentication failed') {
    super(message, 401, 'AUTH_FAILED')
    this.name = 'LiteAPIAuthError'
  }
}

export class LiteAPIRateLimitError extends LiteAPIError {
  constructor(message = 'LiteAPI rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT')
    this.name = 'LiteAPIRateLimitError'
  }
}

export class LiteAPIValidationError extends LiteAPIError {
  constructor(message: string, public readonly zodError?: unknown) {
    super(message, 400, 'VALIDATION')
    this.name = 'LiteAPIValidationError'
  }
}

export class LiteAPINotFoundError extends LiteAPIError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'LiteAPINotFoundError'
  }
}