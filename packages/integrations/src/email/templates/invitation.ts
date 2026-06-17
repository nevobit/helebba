const currentYear = new Date().getFullYear();

const getEmailAssetUrl = (path: string) => {
  const baseUrl =
    process.env.EMAIL_ASSETS_BASE_URL ?? process.env.PUBLIC_APP_URL ?? 'https://app.helebba.com/';

  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

type InvitationTemplateProps = {
  inviteUrl: string;
  inviterName: string;
  organizationName: string;
};

export const invitationTemplate = ({
  inviteUrl,
  inviterName,
  organizationName,
}: InvitationTemplateProps) => `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Te han invitado a unirte a Helebba</title>
  </head>
  <body style="margin:0; padding:0; width:100%; background:#f5f7fb; font-family:Arial, Helvetica, sans-serif; color:#344054;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      ${inviterName} te ha invitado a formar parte de su equipo ${organizationName} en Helebba.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background:#f5f7fb; border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:22px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:600px; background:#ffffff; border-collapse:collapse;">
            <tr>
              <td style="padding:34px 42px 24px 42px;">
                <img src="${getEmailAssetUrl('/images/logos/logo.svg')}" width="120" alt="Helebba" style="display:block; width:120px; height:auto; border:0; outline:none; text-decoration:none;">
              </td>
            </tr>

            <tr>
              <td style="padding:0 42px;">
                <div style="height:1px; line-height:1px; background:#e5e7eb;">&nbsp;</div>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 42px 12px 42px;">
                <p style="margin:0 0 16px 0; font-size:16px; line-height:24px; color:#59637f;">
                  Hola,
                </p>

                <p style="margin:0 0 14px 0; font-size:14px; line-height:25px; color:#59637f; font-weight:400;">
                  ${inviterName} te ha invitado a formar parte de su equipo ${organizationName} en Helebba.
                </p>

                <p style="margin:0 0 16px 0; font-size:14px; line-height:25px; color:#59637f; font-weight:400;">
                  Descubre la mejor manera de agilizar tus tareas con un software de gestión todo-en-uno con el que podrás trabajar de un modo más ágil y colaborativo.
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="border-radius:10px; background:#2563d9;">
                      <a href="${inviteUrl}" target="_blank" rel="noreferrer" style="display:inline-block; padding:12px 22px; color:#ffffff; font-size:14px; line-height:20px; font-weight:400; text-decoration:none;">
                        Únete al equipo
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:16px 0 0 0; font-size:14px; line-height:24px; color:#59637f;">
                  Un saludo,<br>
                  <strong>El equipo de Helebba</strong>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 42px 0 42px;">
                <div style="height:1px; line-height:1px; background:#e5e7eb;">&nbsp;</div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:26px 42px 8px 42px;">
                <a href="mailto:soporte@helebba.com" style="font-size:14px; line-height:20px; color:#8a93a3; text-decoration:none;">Contactar soporte</a>
                <span style="padding:0 8px; color:#c0c6d1;">·</span>
                <a href="https://helebba.com" style="font-size:14px; line-height:20px; color:#8a93a3; text-decoration:none;">Academy</a>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:8px 42px 34px 42px;">
                <p style="margin:0; font-size:12px; line-height:20px; color:#a6adba;">
                  © ${currentYear} Helebba
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
