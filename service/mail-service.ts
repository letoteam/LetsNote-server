const nodemailer = require('nodemailer');

class MailService {
  transporter: any;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  async sendActivationMail(to: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'NotesApp account activation',
      text: '',
      html: `
                    <div>
                        <h1>Your activation link: </h1>
                        <a href="${link}">${link}</a>
                    </div>
                `,
    });
  }

  async sendRecoveryMail(to: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_HOST,
      to,
      subject: 'NotesApp password recovery',
      text: '',
      html: `
                    <div>
                        <h1>Your reset-password link:</h1>
                        <a href="${link}"}/login">Reset Password</a>
                    </div>
                `,
    });
  }
}

export default MailService;
