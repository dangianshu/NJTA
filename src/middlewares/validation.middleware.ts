import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { responseData } from '../helper/response';
import { statusCode } from '../utils/statusCode';

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return responseData({
        res,
        statusCode: statusCode.BAD_REQUEST,
        success: 0,
        error: error.details[0].message,
      });
    }
    
    next();
  };
};
