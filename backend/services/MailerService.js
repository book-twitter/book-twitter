const mailer = require('nodemailer');
const env = require('dotenv').config().parsed;

//Setup email transporter
const transporter = mailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: true,
    auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD,
    },
    dkim: {
        domainName: env.SMTP_HOST,
        keySelector: 'mail',
        privateKey: env.SMTP_DKIM_KEY
    },
    tls: {
        rejectUnauthorized: false
    }
});

async function sendMail(to, subject, text, html) {
    const mailOptions = {
        from: env.SMTP_FROM,
        to: to,
        subject: subject,
        text: text ? text : null,
        html: html ? html : null
    };

    //Send email
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) return {success: false, result: err};

        return {success: true, result: info};
    });    
}

module.exports = {
    sendMail
}