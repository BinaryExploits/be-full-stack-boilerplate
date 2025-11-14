export type BaseEmail = {
  from: string;
  to: string;
  subject: string;
  type: 'sign-in' | 'email-verification' | 'forget-password';
};

export type OTPEmail<T extends BaseEmail> = T & {
  otp: string;
};
