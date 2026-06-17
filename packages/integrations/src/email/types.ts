export type EmailAddress = string;
export type EmailAttachment = {
    content: Buffer | string;
    contentType?: string;
    filename: string;
};

export type SendParams = {
    to: EmailAddress | EmailAddress[];
    cc?: EmailAddress | EmailAddress[];
    bcc?: EmailAddress | EmailAddress[];
    attachments?: EmailAttachment[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
};

export type EmailProvider = {
    send: (params: SendParams) => Promise<{ id: string }>;
};
