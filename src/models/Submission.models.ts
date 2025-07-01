import mongoose, { Schema } from 'mongoose';
import { ISubmission } from '../types/submission.interface';
import { SubmissionStatus } from '../utils/constante';

const AnsSchema = new Schema(
  {
    type: { type: Number, default: 1 }, // 1: primary, 2: secondary
    text: String,
    value: String,
    no: Number,
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    subplan: {
      type: Schema.Types.ObjectId,
      ref: 'SubmissionPlan',
      required: true,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    questionair: [
      {
        question: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
        },
        ans: [AnsSchema],
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      default: SubmissionStatus.INPROGRESS,
      enum: Object.values(SubmissionStatus),
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
export default Submission;