import Joi from 'joi'

export const registerValidation = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    // 'string.max': 'Name must not exceed 50 characters',
    'any.required': 'Name is required',
  }),

  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password should be at least 6 characters',
      'string.pattern.base':
        'Password should contain at least 1 uppercase character and 1 special character',
      'any.required': 'Password is required',
    }),

  contact: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Contact name is required',
    'string.min': 'Contact name must be at least 2 characters',
    'string.max': 'Contact name must not exceed 50 characters',
    'any.required': 'Contact name is required',
  }),

  code: Joi.string().required().messages({
    'string.empty': 'Organization/Evaluator ID is required',
    'any.required': 'Organization/Evaluator ID is required',
  }),
  redirectUrl: Joi.string().uri().required().messages({
    'string.empty': 'Redirect URL is required',
    'string.uri': 'Please provide a valid URL',
    'any.required': 'Redirect URL is required',
  }),
})

export const loginValidation = Joi.object({
  code: Joi.string().required().messages({
    'string.empty': 'Organization/Evaluator ID is required',
    'any.required': 'Organization/Evaluator ID is required',
  }),

  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
})

export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  redirectUrl: Joi.string().uri().required().messages({
    'string.empty': 'Redirect URL is required',
    'string.uri': 'Please provide a valid URL',
    'any.required': 'Redirect URL is required',
  }),
})

export const resetPasswordValidation = Joi.object({
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password should be at least 6 characters',
      'string.pattern.base':
        'Password should contain at least 1 uppercase character and 1 special character',
      'any.required': 'Password is required',
    }),
})
