import Joi from 'joi'

export const updatePlanValidation = Joi.object({
  reSubmissionDate: Joi.date().optional().messages({
    'any.required': 'reSubmissionDate is required',
    'date.base': 'reSubmissionDate must be a valid date',
  }),
  evaluationStartDate: Joi.date().optional().messages({
    'any.required': 'evaluationStartDate is required',
    'date.base': 'evaluationStartDate must be a valid date',
  }),
  evaluationEndDate: Joi.date().optional().messages({
    'any.required': 'evaluationEndDate is required',
    'date.base': 'evaluationEndDate must be a valid date',
  }),
  regularSubmissionStartDate: Joi.date().optional().messages({
    'any.required': 'regularSubmissionStartDate is required',
    'date.base': 'regularSubmissionStartDate must be a valid date',
  }),
  regularSubmissionEndDate: Joi.date().optional().messages({
    'any.required': 'regularSubmissionEndDate is required',
    'date.base': 'regularSubmissionEndDate must be a valid date',
  }),
})
