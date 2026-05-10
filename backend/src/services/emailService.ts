import sgMail from "@sendgrid/mail";

let sendGridConfigured = false;

const getSenderEmail = (): string => {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error("SENDGRID_FROM_EMAIL is not configured");
  }
  return fromEmail;
};

export const initializeEmailService = (): void => {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    console.warn("Email notifications disabled: SENDGRID_API_KEY is not configured.");
    sendGridConfigured = false;
    return;
  }

  sgMail.setApiKey(apiKey);
  sendGridConfigured = true;
};

export const isEmailServiceConfigured = (): boolean => sendGridConfigured;

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> => {
  if (!sendGridConfigured) {
    throw new Error("Email service is not configured");
  }

  await sgMail.send({
    to,
    from: getSenderEmail(),
    subject,
    text,
    html,
  });
};
