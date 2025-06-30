import { Document } from 'mongoose';

export interface ISubmission extends Document {
  _id: string;
  status: string;
  submitted: boolean;
  subplan: string;
  pdfLink?: string;
  submissionDate?: Date;
  userId: string;
}

export interface ISubmissionPlan extends Document {
  title: string;
  dueDate?: Date
  regularSubmissionOpen?: Date;
  regularSubmissionClose?: Date;
  evaluationOpenDate?: Date;
  evaluationCloseDate?: Date;
  reSubmissionDate?: Date;
  sections?: [];
}