export interface BaseEmailTemplateData {
  companyName: string;
  productName: string;
  supportEmail: string;
}

export interface SignInOtpEmailData extends BaseEmailTemplateData {
  otp: string;
}

export type EmailTemplateRegistry = {
  'sign-in-otp': SignInOtpEmailData;
};

export type EmailTemplateName = keyof EmailTemplateRegistry;

export type EmailTemplateData<T extends EmailTemplateName> =
  EmailTemplateRegistry[T];

export interface EmailSendArgs<T extends EmailTemplateName> {
  to: string;
  templateName: T;
  templateData: EmailTemplateData<T>;
}

export interface EmailTemplateMeta {
  subject: string;
  htmlFile: string;
  textFile: string;
  previewText?: string;
  category?: string;
}

export const EMAIL_TEMPLATE_META: Record<EmailTemplateName, EmailTemplateMeta> =
  {
    'sign-in-otp': {
      subject: 'Your Sign-In Code',
      htmlFile: 'sign-in-otp.html',
      textFile: 'sign-in-otp.txt',
    },
  };

export interface RenderedEmailTemplate {
  html: string;
  text: string;
  subject: string;
}
