import jwt, { SignOptions } from 'jsonwebtoken';
import { CONFIG } from '../config/env.config';
import { JWTPayload } from '../types/common.interface';

export const generateJWTToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, CONFIG.JWT_SECRET, {
    expiresIn: CONFIG.JWT_EXPIRE
  } as SignOptions);
};

export const verifyJWTToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
