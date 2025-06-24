import Joi from 'joi';

export const registerValidation = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 50 characters'
  }),
  
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address'
  }),
  
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password should be at least 6 characters',
      'string.pattern.base': 'Password should contain at least 1 uppercase character and 1 special character'
    }),
  
  contactName: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Contact name is required',
    'string.min': 'Contact name must be at least 2 characters',
    'string.max': 'Contact name must not exceed 50 characters'
  }),
  
  code: Joi.string().required().messages({
    'string.empty': 'Organization/Evaluator ID is required'
  })
});

export const loginValidation = Joi.object({
  code: Joi.string().required().messages({
    'string.empty': 'Organization/Evaluator ID is required'
  }),
  
  password: Joi.string().required().messages({
    'string.empty': 'Password is required'
  })
});
