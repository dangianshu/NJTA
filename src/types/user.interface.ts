import { ISubmission } from "./submission.interface";

export interface IUser extends Document {
  _id: string;
  name?: string;
  contact?: string;
  email?: string;
  password?: string;
  code?: string;
  date: Date;
  role: 'user' | 'admin';
  submission?: ISubmission[];
  isVerified: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  hashString?: string;
}