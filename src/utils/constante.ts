export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EVALUATOR = 'evaluator',
}

export enum SubmissionStatus {
  COMPLETED = 'completed',
  INPROGRESS = 'inprogress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEED_IMPROVEMENT = 'needImprovement',
  SUBMITTED = 'submitted',
  NI_SUBMITTED = 'NISubmitted',
}