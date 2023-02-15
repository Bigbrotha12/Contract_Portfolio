const mailerProvider = require('sendmail');
const dotenv = require('dotenv').config();

exports.handler = async (event) => {
    // Receive message to check with [name], [email], [subject], and [message] to send to my inbox.
    let { name, email, subject, message } = validateInputs(event.body);
    if (!name || !email || !subject || !message) {
        return { statusCode: 400, headers: {}, body: 'Invalid input parameters.' };
    }

    // Prepare e-mail template
    let mailer = mailerProvider({});
    let content =
        "<div><p>from: " + name + "</p><br>" +
        "<p>at: " + email + "</p>" +
        "<p>message: " + message + "</p></div>";
    let emailTemplate = {
        from: 'no-reply@rafaelmendoza.net',
        to: process.env.RECIPIENT_EMAIL,
        subject: subject,
        html: "Received new message! \n" + content,
    }
    
    // Send e-mail to inbox
    mailer(emailTemplate, (error, reply) => {
        console.log(error);
        console.log(reply);
    });
};

//(async () => await exports.handler({body: {name: "test", email: "test", subject: "test sub", message: "test ms"}}))();

function validateInputs(queryString) {
    // Validate Transaction Hash,  and chain ID
    let { name, email, subject, message } = queryString;
   
    return { name, email, subject, message };
}
