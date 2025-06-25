import { IPagination } from "./common.interface";
import { IUser } from "./user.interface";

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  contact: string;
  code: string;
}
export interface ILoginRequest {
  code: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: {
    user?: IUser;
    token?: string;
  };
}

export interface IRegisterRequest {                                                 
  name: string;
  email: string;
  password: string;
  password2: string;
  contactName: string;
  code: string;
}

export interface IinvaiteRequest {
  name: string;
  email: string;
  contact: string;
  code: string;
}  

export interface IUserPaginatedResponse {
  users: IUser[];
  pagination: IPagination
}

export interface IServiceResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
