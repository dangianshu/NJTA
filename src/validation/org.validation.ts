import Joi from 'joi'

const answerSchema = Joi.object({
  type: Joi.number().optional().default(1),
  text: Joi.string().optional().allow(''),
  value: Joi.string().optional().allow(''),
  no: Joi.number().optional(),
})

const questionSchema = Joi.object({
  _id: Joi.string().required(),
  no: Joi.string().required(),
  optional: Joi.boolean().optional(),
  options: Joi.array().items(Joi.string()).optional(),
  qtype: Joi.string().required(),
  question: Joi.string().required(),
  role: Joi.array().items(Joi.string()).optional(),
  section: Joi.string().required(),
  subQuestions: Joi.array().optional(),
  ans: Joi.array().items(answerSchema).optional().default([]),
})

const sectionSchema = Joi.object({
  _id: Joi.string().required(),
  no: Joi.number().required(),
  subplan: Joi.string().required(),
  role: Joi.array().items(Joi.string()).optional(),
  title: Joi.string().required(),
  questions: Joi.array().items(questionSchema).required(),
  status: Joi.string().optional(),
})

export const submitSurveyValidation = Joi.object({
  sections: Joi.array().items(sectionSchema).min(1).required(),
  plan: Joi.string().required(),
  status: Joi.string().required(),
})
