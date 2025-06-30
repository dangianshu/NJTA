import Joi from 'joi'

export const creationInvitaionValidation = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  code: Joi.string().required().messages({
    'string.empty': 'Code is required',
    'any.required': 'Code is required',
  }),
  contact: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Contact is required',
    'string.min': 'Contact must be at least 2 characters',
    'string.max': 'Contact must not exceed 100 characters',
    'any.required': 'Contact is required',
  }),
  redirectUrl: Joi.string().uri().required().messages({
    'string.empty': 'Redirect URL is required',
    'string.uri': 'Please provide a valid URL',
    'any.required': 'Redirect URL is required',
  }),
  
})

export const updateUserValidation = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required',
  }),
  contact: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Contact is required',
    'string.min': 'Contact must be at least 2 characters',
    'string.max': 'Contact must not exceed 100 characters',
    'any.required': 'Contact is required',
  }),
})
