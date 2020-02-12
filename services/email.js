const aws              = require("aws-sdk")
const awsconfig        = require("../awsconfig")
const nodemailer       = require('nodemailer');
aws.config.update(awsconfig)

async function sendEmail({ order_id, order_number }) {
    let transporter = nodemailer.createTransport({
        SES: new aws.SES({
            apiVersion: '2010-12-01'
        })
    });

    let info = await transporter.sendMail({
        from: '"Kawaii Pet Prints 🐶" <kawaiipetprints@gmail.com>',
        to: "danielvanduong@gmail.com", 
        subject: `Order number ${ order_number } has just been approved.`, 
        text: `Order number ${ order_number } & order id ${ order_id } has just been approved.`,
        html: `<b>Order number ${ order_number } has just been approved. Please fulfill the customer's order through printify.</b>`
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

module.exports = {
    sendEmail
}