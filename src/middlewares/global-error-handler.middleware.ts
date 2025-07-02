import { NextFunction, Request, RequestHandler, Response } from 'express'
import { CustomError } from '../types/types'

export const apiHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
    async (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };

export const globalErrorHandler = (err: CustomError, req: Request , res: Response, next:NextFunction) => {

  const statusCode = err.statusCode || 500
  const errorResponse = {
    message: err.message || 'Internal Server Error',
    status: statusCode,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  }

  if (statusCode == 500) {
    console.log(err.stack)
    const ruler = '-'.repeat(110)
    const date = new Date(Date.now())
    const errorMessage = `Error occurred at: ${req.path}\n Time:${date.toISOString()}\nMessage: ${err.message}\nStack: ${err.stack}\n${ruler}\n\n`
    console.error(errorMessage)
  }

  res.status(statusCode).json(errorResponse)
  next()
}
