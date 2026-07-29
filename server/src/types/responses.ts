export interface SuccessResponsePayload<TData = unknown> {
  success: true;
  message: string;
  data?: TData;
}
