export interface EmailSubmissionResponse {
  email: string | [string];
  message?: string;
  status: number;
  success: boolean;
}
