import { Document, Types } from 'mongoose'
import { IAnswerData } from './question.interface'

export interface IAns {
  type?: number
  text?: string
  value?: string
  no?: number
}

export interface IQuestionairItem {
  question: Types.ObjectId
  ans: IAns[]
  comment?: string
  needImprovement?: boolean
  subQuestions?: {
    question: string | Types.ObjectId
    ans: IAnswerData[]
    comment?: string
    needImprovement?: boolean
  }[]
}

export interface ISubmission extends Document {
  subplan: Types.ObjectId
  section: Types.ObjectId
  questionair: IQuestionairItem[]
  user: Types.ObjectId
  status: string
  createdAt?: Date
  updatedAt?: Date
}

export interface IAddFeedbackRequest {
  submissionId: string
  questionId: string
  isSubQuestion: boolean
  comment: string
  needImprovement: boolean
}
