export enum EmailProvider {
  RESEND = 'resend',
  AWS_SES = 'aws_ses',
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  provider: EmailProvider;
}

export type EmailPayload = Omit<SendEmailOptions, 'provider'>;

export interface BaseEmailData {
  companyName: string;
  productName: string;
  supportEmail: string;
}

export interface SignInOtpEmailData extends BaseEmailData {
  otp: string;
}

export interface EmailVerificationData extends BaseEmailData {
  verificationUrl: string;
}

export interface PasswordResetData extends BaseEmailData {
  resetUrl: string;
}

export type EmailTemplateRegistry = {
  'sign-in-otp': SignInOtpEmailData;
  'email-verification': EmailVerificationData;
  'password-reset': PasswordResetData;
};

export type EmailTemplateName = keyof EmailTemplateRegistry;

export type EmailTemplateData<T extends EmailTemplateName> =
  EmailTemplateRegistry[T];

export interface SendEmailArgs<T extends EmailTemplateName> {
  to: string;
  templateName: T;
  templateData: EmailTemplateData<T>;
  provider: EmailProvider;
}

export interface EmailTemplateMeta {
  subject: string;
  htmlFile: string;
  textFile: string;
}

export const EMAIL_TEMPLATE_META: Record<EmailTemplateName, EmailTemplateMeta> =
  {
    'sign-in-otp': {
      subject: 'Your Sign-In Code',
      htmlFile: 'sign-in-otp.html',
      textFile: 'sign-in-otp.txt',
    },
    'email-verification': {
      subject: 'Verify Your Email Address',
      htmlFile: 'email-verification.html',
      textFile: 'email-verification.txt',
    },
    'password-reset': {
      subject: 'Set Your Password',
      htmlFile: 'password-reset.html',
      textFile: 'password-reset.txt',
    },
  };

export interface RenderedEmail {
  html: string;
  text: string;
  subject: string;
}
