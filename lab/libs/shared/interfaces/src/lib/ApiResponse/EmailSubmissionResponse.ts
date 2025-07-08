export interface EmailSubmissionResponse {
  email: string | [string];
  message?: string;
  success: boolean;
}
