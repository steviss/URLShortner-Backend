import { config } from '../_constants';

export const createVerifyEmail = (to: string, verifyKey: string) => {
    return `

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB">
<head>
<link rel="preconnect" href="https://fonts.gstatic.com">
 <link href="https://fonts.googleapis.com/css2?family=Roboto&family=Titillium+Web:wght@600&display=swap" rel="stylesheet"> 

  <style type="text/css">
	  a { will-change: background-color; transition: background-color 0.4s ease-in-out; }
    a[x-apple-data-detectors] {color: inherit !important;}
	  a:hover { background-color: #ff893b !important; }
  </style>

</head>
<body style="margin: 0; padding: 0;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding: 24px 0 32px 0;">

<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #cccccc;">
  <tr>
    <td align="center" bgcolor="#ff893b" style="padding: 48px 0 32px 0;">
      <img src="https://codepen.steviss.dev/assets/dypMVOB/email_header.png" alt="Welcome mat." width="300" height="240" style="display: block;" />
    </td>
  </tr>
  <tr>
    <td bgcolor="#ffffff" style="padding: 48px 32px 48px 32px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="color: #232323; font-weight: 600; font-family: 'Titillium Web', Verdana, sans-serif;">
            <h1 style="font-size: 24px; margin: 0; text-align: center;">Welcome to ${config.__APP_NAME__}!</h1>
          </td>
        </tr>
			<tr>
          <td style="padding: 32px 0 32px 0;text-align: center; color: #232323; font-weight: 600; font-family: 'Titillium Web', Verdana, sans-serif;">
            <h2 style="display: inline-block; font-size: 16px; margin: 0; padding: 8px 16px; border:1px dashed #7c7c7c; border-radius: 4px; text-align: center; color: #153643; background-color: #fff7f2;">${to}</h2>
          </td>
        </tr>
        <tr>
          <td style="color: #153643;padding: 24px 0; font-family: 'Roboto', Arial, sans-serif; font-size: 16px; line-height: 24px;">
            <p style="margin: 0; text-align: center;">Please verify your e-mail to unlock your account! </p>
          </td>
        </tr>
        <tr>
          <td style="line-height: 24px; padding: 24px 0 32px 0; text-align: center;">
                  <a href="${
                      config.__PROD__ ? config.__DOMAIN__ : config.__DEV_DOMAIN__
                  }/verify/${verifyKey}" style="text-decoration: none; color: white; border: 1px solid #d1d1d1; background-color: #ff4b1f; padding: 12px 16px; border-radius: 4px; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25); text-align: center; font-family: 'Titillium Web', Verdana, sans-serif; font-weight: bold">Verify here.
                  </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td bgcolor="#ff4b1f" style="padding: 30px 30px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        <tr>
          <td style="color: #ffffff; font-family: 'Roboto', Arial, sans-serif; font-size: 14px;">
            <p style="margin: 0;">Created by: &reg;
           <a href="#" style="color: #ffffff;">steviss.dev</a></p>
          </td>
          <td align="right">
            <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td>
                  <a href="https://github.com/steviss">
                    <img src="https://codepen.steviss.dev/assets/dypMVOB/github_fontawesome_6.png" alt="Github" width="38" height="38" style="display: block;" border="0" />
                  </a>
                </td>
                <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
