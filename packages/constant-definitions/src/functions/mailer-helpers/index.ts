import { MonoContext } from '../../../../kernel/src';

const MAILER_KEY = `mailer`;

export type Mailer = {
    send: (p: {
        to: string | string[];
        cc?: string | string[];
        bcc?: string | string[];
        attachments?: Array<{ content: Buffer | string; contentType?: string; filename: string }>;
        subject: string;
        html: string;
        text?: string;
        from?: string;
        replyTo?: string;
    }) => Promise<{
        id: string;
    }>;
    sendTemplate: <T extends {
        name: unknown;
        props: unknown;
    }>(p: {
        to: string | string[];
        cc?: string | string[];
        bcc?: string | string[];
        attachments?: Array<{ content: Buffer | string; contentType?: string; filename: string }>;
        template: T;
        from?: string;
        replyTo?: string;
    }) => Promise<unknown>;
};

export const setMailer = (mailer: Mailer): void => {
    MonoContext.setState({
        [MAILER_KEY]: mailer,
    });
};

export const getMailer = () => {
    const mailer = MonoContext.getState()[MAILER_KEY] as Mailer | undefined;

    if (!mailer) {
        throw new Error('Mailer is not configured');
    }

    return mailer;
};
