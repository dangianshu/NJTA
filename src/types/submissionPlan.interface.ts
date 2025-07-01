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
  _id: string;
  title: string;
  dueDate?: Date;
  regularSubmissionStartDate?: Date;
  regularSubmissionEndDate?: Date;
  evaluationStartDate?: Date;
  evaluationEndDate?: Date;
  reSubmissionDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  _v?: number;
}

export interface ISubmissionResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: {
    submissionPlans?: ISubmissionPlan[];
  };
}