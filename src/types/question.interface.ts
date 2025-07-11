import mongoose, { Document } from 'mongoose'

export interface IQuestion extends Document {
  no: string
  section: mongoose.Types.ObjectId
  question: string
  qtype: string
  options: string[]
  optional: boolean
  subQuestions: mongoose.Types.ObjectId[] // or string[] if subQuestions are embedded
  role: string[]
}

export interface IAnswerData {
  type: number
  text: string
  value: string
  no: number
}

export interface ISubmitQuestionData {
  userId: string
  section: string
  plan: string
  question: string
  ans: IAnswerData[]
  role: string
}

export interface IDashboardData {
  plans: any[]
  user: {
    name: string
    email: string
    code: string
    role: string
    id: string
  }
  submissions: any[]
}

export interface IDashboardPaginatedResponse {
  plans: any[]
  pagination: {
    limit: number
    page: number
    total: number
  }
}

export interface ISurveyData {
  sections: any[]
  selectedSection: any
  nextSection: any
  plan: any
  role: string
  prevSectionLink: any
  statusCompleted: boolean
  user: {
    name: string
  }
}

export interface ISubmitSurveyData {
  sections: ISubmitSurveySection[]
  plan: string
  status: string
}

export interface ISubmitSurveySection {
  _id: string
  no: number
  subplan: string
  role: string[]
  title: string
  questions: {
    _id: string
    no: string
    optional: boolean
    options: string[]
    qtype: string
    question: string
    role: string[]
    section: string
    subQuestions: any[]
    ans: IAnswerData[]
  }[]
  status: string
}

export interface ISubmitSurveyPayload {
  sections: ISubmitSurveySection[]
  plan: string
  status: string
}

export interface ISubmissionViewData {
  sections: any[]
  allQuestions: any[]
  previews: any[]
  plan: string
  planTitle: string
  statusCompleted: boolean
  showSubmit: boolean
  user: {
    name: string
    code: string
    id: string
  }
}
