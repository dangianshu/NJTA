import mongoose, { Schema } from 'mongoose'
import { IUser } from '../types/user.interface'
import { UserRole, SubmissionStatus } from '../utils/constant'

const submissionSchema = new Schema({
  status: {
    type: String,
    default: SubmissionStatus.DRAFT,
    enum: Object.values(SubmissionStatus),
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
  },
})

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    contact: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
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
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    submission: [submissionSchema],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    hashString: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', UserSchema)
export default User
