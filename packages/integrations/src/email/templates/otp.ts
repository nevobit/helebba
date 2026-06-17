const currentYear = new Date().getFullYear();

const getEmailAssetUrl = (path: string) => {
  const baseUrl =
    process.env.EMAIL_ASSETS_BASE_URL ?? process.env.PUBLIC_APP_URL ?? 'https://app.helebba.com/';

  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export const otpTemplate = (verificationCode: string) => `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Código de acceso de Helebba</title>
  </head>
  <body style="margin:0; padding:0; width:100%; background:#ffffff; font-family:Arial, Helvetica, sans-serif; color:#24262d;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      Tu código de acceso de Helebba es ${verificationCode}. Expira en 30 minutos.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background:#ffffff; border-collapse:collapse;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="520" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:520px; border-collapse:collapse;">
            <tr>
              <td style="padding:0 0 22px 0;">
                <img src="${getEmailAssetUrl('/images/logos/logo.svg')}" width="112" height="22" alt="Helebba" style="display:block; width:142px; height:auto; border:0; outline:none; text-decoration:none;">
              </td>
            </tr>

            <tr>
              <td style="background:#ffffff; border-radius:12px; padding:36px 32px;">
                <h1 style="margin:0 0 16px 0; font-size:24px; line-height:32px; font-weight:700; color:#111827;">
                  Inicia sesión en Helebba
                </h1>

                <p style="margin:0; font-size:15px; line-height:24px; color:#4b5563;">
                  Ingresa este código en la aplicación para continuar de forma segura. El código expirará en 30 minutos.
                </p>

                <div style="margin:28px 0 4px 0; padding:18px 20px; border-radius:10px; text-align:center;">
                  <span style="font-size:34px; line-height:42px; font-weight:700; letter-spacing:6px; color:#111827; font-family:Arial, Helvetica, sans-serif;">
                    ${verificationCode}
                  </span>
                </div>

                <p style="margin:16px 0 0 0; font-size:13px; line-height:20px; color:#6b7280;">
                  Si no solicitaste este código, puedes ignorar este correo.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:26px 8px 0 8px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 8px;">
                      <a href="https://instagram.com/helebbasoftware" style="font-size:12px; line-height:18px; color:#6b7280; text-decoration:none;">Instagram</a>
                    </td>
                    <td style="padding:0 8px;">
                      <a href="https://youtube.com/helebbasoftware" style="font-size:12px; line-height:18px; color:#6b7280; text-decoration:none;">YouTube</a>
                    </td>
                    <td style="padding:0 8px;">
                      <a href="https://linkedin.com/company/helebbasoftware" style="font-size:12px; line-height:18px; color:#6b7280; text-decoration:none;">LinkedIn</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:22px 8px 0 8px;">
                <p style="margin:0; max-width:440px; font-size:12px; line-height:19px; color:#6b7280;">
                  Helebba nunca enviará un correo solicitando que reveles o verifiques contraseñas, tarjetas de crédito o datos bancarios.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:14px 8px 0 8px;">
                <p style="margin:0; max-width:440px; font-size:12px; line-height:19px; color:#6b7280;">
                  Por favor no reenvíes ni compartas este correo, ya que está destinado únicamente para ti.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:18px 8px 0 8px;">
                <p style="margin:0; font-size:12px; line-height:18px; color:#9ca3af;">
                  Helebba, Inc. © ${currentYear}. Todos los derechos reservados.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
