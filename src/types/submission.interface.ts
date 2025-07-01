import { Document, Types } from 'mongoose';

export interface IAns {
  type?: number;
  text?: string;
  value?: string;
  no?: number;
}

export interface IQuestionairItem {
  question: Types.ObjectId;
  ans: IAns[];
}

export interface ISubmission extends Document {
  subplan: Types.ObjectId;
  section: Types.ObjectId;
  questionair: IQuestionairItem[];
  user: Types.ObjectId;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}