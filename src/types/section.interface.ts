import mongoose, { Document } from 'mongoose';


export interface ISection extends Document {
  no: number;
  subplan: mongoose.Types.ObjectId;
  title: string;
  role: string[];
}