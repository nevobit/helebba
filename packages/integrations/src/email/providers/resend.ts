import { Resend } from "resend";
import type { EmailProvider, SendParams } from "../types";

export const createResendProvider = (opts: { apiKey: string; defaultFrom: string; defaultReplyTo?: string }): EmailProvider => {
    const client = new Resend(opts.apiKey);

    return {
        send: async ({ to, cc, bcc, attachments, subject, html, text, from, replyTo }: SendParams) => {
            const effectiveReplyTo = replyTo ?? opts.defaultReplyTo;
            const res = await client.emails.send({
                from: from ?? opts.defaultFrom,
                to,
                ...(cc ? { cc } : {}),
                ...(bcc ? { bcc } : {}),
                ...(attachments ? { attachments } : {}),
                subject,
                html,
                text,
                ...(effectiveReplyTo ? { replyTo: effectiveReplyTo } : {}),
            });
            if (res.error) throw res.error;
            return { id: res.data?.id ?? "" };
        },
    };
};
