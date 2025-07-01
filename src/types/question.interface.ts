import mongoose, { Document } from 'mongoose';


export interface IQuestion extends Document {
  no: string;
  section: mongoose.Types.ObjectId;
  question: string;
  qtype: string;
  options: string[];
  optional: boolean;
  subQuestions: mongoose.Types.ObjectId[]; // or string[] if subQuestions are embedded
  role: string[];
}