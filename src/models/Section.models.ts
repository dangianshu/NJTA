import mongoose, { Schema } from 'mongoose'
import { ISection } from '../types/section.interface'

const SectionSchema = new Schema<ISection>(
  {
    no: {
      type: Number,
      default: 1,
    },
    subplan: {
      type: Schema.Types.ObjectId,
      ref: 'SubmissionPlan',
    },
    title: {
      type: String,
    },
    role: {
      type: [String],
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
)

SectionSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'section',
})

const Section = mongoose.model<ISection>('Section', SectionSchema)
export default Section
