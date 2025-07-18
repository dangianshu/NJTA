import mongoose, { Schema } from 'mongoose'
import { ISubmissionPlan } from '../types/submissionPlan.interface'

const SubmissionPlanSchema = new Schema<ISubmissionPlan>(
  {
    title: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: false,
    },
    reSubmissionDate: {
      type: Date,
      required: false,
    },
    evaluationStartDate: {
      type: Date,
      required: false,
    },
    evaluationEndDate: {
      type: Date, 
      required: false,
    },
    regularSubmissionStartDate: {
      type: Date,
      required: false,
    },
    regularSubmissionEndDate: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
)

SubmissionPlanSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'subplan',
})

const SubmissionPlan = mongoose.model<ISubmissionPlan>('SubmissionPlan', SubmissionPlanSchema)
export default SubmissionPlan
