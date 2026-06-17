import { invitationTemplate } from "./invitation";
import { otpTemplate } from "./otp";

export type RenderInput =
    | { name: "otp"; props: { verificationCode: string } }
    | {
        name: "invitation";
        props: {
            inviteUrl: string;
            inviterName: string;
            organizationName: string;
        };
    }
    ;

export const renderTemplate = (input: RenderInput) => {
    switch (input.name) {
        case "invitation": {
            const html = invitationTemplate(input.props);
            const text = `${input.props.inviterName} te ha invitado a formar parte de su equipo ${input.props.organizationName} en Helebba. Únete aquí: ${input.props.inviteUrl}`;
            return { subject: "Te han invitado a unirte a Helebba", html, text };
        }
        case "otp": {
            const html = otpTemplate(input.props.verificationCode);
            const text = `Tu código de acceso de Helebba es: ${input.props.verificationCode}. Expira en 30 minutos.`;
            return { subject: "Tu código de acceso de Helebba", html, text };
        }
        default:
            throw new Error("Unknown template");
    }
};
