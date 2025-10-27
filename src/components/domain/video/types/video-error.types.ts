/**
 * Video error types and handling utilities
 */

export enum VideoErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  STREAM_UNAVAILABLE = 'STREAM_UNAVAILABLE',
  FORMAT_UNSUPPORTED = 'FORMAT_UNSUPPORTED',
  TIMEOUT = 'TIMEOUT',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN = 'UNKNOWN',
}

export interface VideoError {
  type: VideoErrorType;
  title: string;
  message: string;
  suggestion: string;
  canRetry: boolean;
  retryDelay?: number;
}

export interface RetryState {
  attempt: number;
  maxAttempts: number;
  baseDelay: number;
  isRetrying: boolean;
}

/**
 * Get user-friendly error information based on error type and details
 */
export function getVideoErrorInfo(error: any, retryAttempt: number = 0): VideoError {
  const errorMessage = error?.message || error || '';
  const errorCode = error?.code || '';

  // Network-related errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorCode === 'NETWORK_FAILURE') {
    return {
      type: VideoErrorType.NETWORK_ERROR,
      title: 'Connection Issue',
      message: 'Unable to connect to the video stream',
      suggestion: 'Check your internet connection and try again',
      canRetry: true,
      retryDelay: Math.min(1000 * Math.pow(2, retryAttempt), 30000), // Exponential backoff, max 30s
    };
  }

  // Stream unavailable
  if (errorMessage.includes('404') || errorMessage.includes('not found') || errorCode === 'SOURCE_ERROR') {
    return {
      type: VideoErrorType.STREAM_UNAVAILABLE,
      title: 'Stream Unavailable',
      message: 'This channel is currently offline',
      suggestion: 'Try a different channel or check back later',
      canRetry: retryAttempt < 2, // Only retry a couple times for stream issues
      retryDelay: 5000,
    };
  }

  // Format/codec issues
  if (errorMessage.includes('format') || errorMessage.includes('codec') || errorCode === 'DECODER_ERROR') {
    return {
      type: VideoErrorType.FORMAT_UNSUPPORTED,
      title: 'Playback Issue',
      message: 'This video format is not supported',
      suggestion: 'Try a different channel or contact support',
      canRetry: false,
    };
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorCode === 'TIMEOUT') {
    return {
      type: VideoErrorType.TIMEOUT,
      title: 'Loading Timeout',
      message: 'The stream is taking too long to load',
      suggestion: 'Check your connection speed and try again',
      canRetry: true,
      retryDelay: Math.min(2000 * Math.pow(1.5, retryAttempt), 15000),
    };
  }

  // Permission errors
  if (errorMessage.includes('permission') || errorCode === 'PERMISSION_DENIED') {
    return {
      type: VideoErrorType.PERMISSION_DENIED,
      title: 'Access Denied',
      message: 'Cannot access this video stream',
      suggestion: 'Check your subscription or try a different channel',
      canRetry: false,
    };
  }

  // Default unknown error
  return {
    type: VideoErrorType.UNKNOWN,
    title: 'Playback Error',
    message: 'Something went wrong while playing this channel',
    suggestion: 'Try again or contact support if the issue persists',
    canRetry: true,
    retryDelay: Math.min(3000 * Math.pow(2, retryAttempt), 20000),
  };
}

/**
 * Calculate exponential backoff delay
 */
export function calculateRetryDelay(attempt: number, baseDelay: number = 1000, maxDelay: number = 30000): number {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay + Math.random() * 1000, maxDelay); // Add jitter
}

/**
 * Check if error is retryable
 */
export function isRetryableError(errorType: VideoErrorType): boolean {
  return ![VideoErrorType.FORMAT_UNSUPPORTED, VideoErrorType.PERMISSION_DENIED].includes(errorType);
}