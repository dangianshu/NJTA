import { Response } from 'express'

export interface IPagination {
  limit: number
  page: number
  total?: number
}

export interface IQueryPagination {
  offset: number
  limit: number
}

export interface IResponseData<T> {
  res: Response
  statusCode: number
  success: number
  message?: string
  data?: T
  error?: string
  pagination?: IPagination
}

export interface IResponseAndCount<T> {
  rows: T
  count: number
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  name?: string; 
}

