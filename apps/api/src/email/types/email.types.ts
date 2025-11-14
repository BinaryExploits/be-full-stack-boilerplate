export type VerificationEmailArgs = {
  to: string;
  otp: string;
  type: 'sign-in';
};

/**
 * Data to be injected in the sign-in OTP email template
 */
export interface SignInOtpTemplateData {
  otp: string;
  companyName: string;
  productName: string;
  supportEmail: string;
}

/**
 * Registry of all available email templates
 * Maps template names to their required data types
 */
export interface EmailTemplateRegistry {
  'sign-in-otp': SignInOtpTemplateData;
}

/**
 * Union type of all available template names
 */
export type EmailTemplateName = keyof EmailTemplateRegistry;

/**
 * Get template data type for a given template name
 * Usage: TemplateData<'sign-in-otp'> returns SignInOtpTemplateData
 */
export type TemplateData<T extends EmailTemplateName> =
  EmailTemplateRegistry[T];

// ============================================================================
// Template Metadata
// ============================================================================

/**
 * Metadata for each email template including subject and file names
 */
export interface TemplateMetadata {
  subject: string;
  htmlFile: string;
  textFile: string;
}

/**
 * Template metadata registry
 * Defines the subject line and file locations for each template
 */
export const TEMPLATE_METADATA: Record<EmailTemplateName, TemplateMetadata> = {
  'sign-in-otp': {
    subject: 'Your Sign-In Code',
    htmlFile: 'sign-in-otp.html',
    textFile: 'sign-in-otp.txt',
  },
  // Add metadata for other templates here
};

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Type-safe email args
 * Ensures that the data matches the template's required data type
 */
export interface TypedEmailArgs<T extends EmailTemplateName> {
  to: string;
  templateName: T;
  data: TemplateData<T>;
}

/**
 * Result of loading a template - includes both HTML and text versions
 */
export interface LoadedTemplate {
  html: string;
  text: string;
  subject: string;
}
