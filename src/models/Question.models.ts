import mongoose, { Schema } from 'mongoose'
import { IQuestion } from '../types/question.interface'

const QuestionSchema = new Schema<IQuestion>(
  {
    no: {
      type: String,
      required: true,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: 'Section',
      required: false,
    },
    question: {
      type: String,
      required: true,
    },
    qtype: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    optional: {
      type: Boolean,
      default: false,
    },
    subQuestions: [
      {
        question: {
          type: String,
          required: true,
        },
        qtype: {
          type: String,
          required: true,
        },
        no: {
          type: Number,
          required: true,
        },
        options: {
          type: [String],
          default: [],
        },
      },
    ],
    role: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const Question = mongoose.model<IQuestion>('Question', QuestionSchema)
export default Question
