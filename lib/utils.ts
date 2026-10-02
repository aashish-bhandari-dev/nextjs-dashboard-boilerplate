export { cn } from "cn";

/**
 * Normalizes and extracts user-friendly error messages from API and network errors.
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred',
): string {
  if (!error) return fallbackMessage;

  if (typeof error === 'string') return error;

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;

    // Nested API response message (e.g. Axios or structured error payload)
    const response = err.response as Record<string, unknown> | undefined;
    const responseData = response?.data as Record<string, unknown> | undefined;

    if (responseData?.message) {
      return Array.isArray(responseData.message)
        ? responseData.message.join(', ')
        : String(responseData.message);
    }

    // Backend ApiError with error.message
    const nestedError = responseData?.error as Record<string, unknown> | undefined;
    if (nestedError?.message) {
      return String(nestedError.message);
    }

    // Backend ApiError array
    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      const first = responseData.errors[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object' && 'message' in first) {
        return String((first as { message: unknown }).message);
      }
    }

    // Error message property
    if ('message' in err && typeof err.message === 'string') {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.message) return String(parsed.message);
      } catch {
        // Not a JSON string
      }
      return err.message;
    }
  }

  return fallbackMessage;
}
