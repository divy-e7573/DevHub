export type ErrorDetails =
  | Record<string, unknown>
  | Array<Record<string, unknown>>
  | null;

export interface ErrorResponsePayload {
  success: false;
  message: string;
  error: {
    code: string;
    details: ErrorDetails;
  };
}

export interface NormalizedError {
  statusCode: number;
  message: string;
  code: string;
  details: ErrorDetails;
}
