export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  password2: string;
  contactName: string;
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
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    token?: string;
  };
}
