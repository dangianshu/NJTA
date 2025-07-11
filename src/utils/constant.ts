export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EVALUATOR = 'evaluator',
}

export enum SubmissionStatus {
  IN_PROGRESS = 'in-progress',
  SUBMISSION_CLOSED = 'submission-closed',
  NEEDS_IMPROVEMENT = 'needs-improvement',
  REJECTED = 'rejected',
  APPROVED = 'approved',
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  COMPLETE = 'complete',
  INCOMPLETE = 'incomplete',
  NOT_STARTED = 'not-started',
  CORRECTION_REQUIRED = 'correction-required',
  REVIEW_IN_PROGRESS = 'review-in-progress',
  REVIEW_COMPLETED = 'review-completed',
}
