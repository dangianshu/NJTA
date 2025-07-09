import { Document, Types } from 'mongoose';
import { IAnswerData } from './question.interface';

export interface IAns {
  type?: number;
  text?: string;
  value?: string;
  no?: number;
}

export interface IQuestionairItem {
  question: Types.ObjectId;
  ans: IAns[];
    subQuestions?: {
    question: string | Types.ObjectId;
    ans: IAnswerData[];
  }[];
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