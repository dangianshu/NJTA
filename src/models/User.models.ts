import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/user.interface';


const submissionSchema = new Schema({
  status: {
    type: String,
    default: 'draft',
  },
  submitted: {
    type: Boolean,
    default: false,
  },
  subplan: {
    type: Schema.Types.ObjectId,
    ref: 'SubmissionPlan',
  },
  pdfLink: {
    type: String,
  },
  submissionDate: {
    type: Date,
  }
});

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: false,
    trim: true,
  },
  contact: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: false, 
    lowercase: true,
    trim: true,
    sparse: true,
  },
  password: {
    type: String,
    required: false,
    minlength: 6,
  },
  code: {
    type: String,
    sparse: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: 'user',
  },
  submission: [submissionSchema],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hashString: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Create sparse unique index for email
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

const User = mongoose.model("User", UserSchema);
export default User;