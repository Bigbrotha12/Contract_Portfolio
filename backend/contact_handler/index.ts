

exports.handler = async (event) => {
    // Receive message to check with [name], [email], [subject], and [message] to send to my inbox.
    let { name, email, subject, message } = validateInputs(event.body);
    if (!name || !email || !subject || !message) {
        return { statusCode: 400, headers: {}, body: 'Invalid input parameters.' };
    }

    // Prepare e-mail template
    
    
    // Send e-mail to inbox

};

function validateInputs(queryString) {
    // Validate Transaction Hash,  and chain ID
    let { name, email, subject, message } = queryString;
    if (/^0x([A-Fa-f0-9]{64})$/.test(name) && /[0-9]*/.test(email)) {
        return { name, email, subject, message };
    } else {
        return { txHash: null, chainId: null };
    }
}


