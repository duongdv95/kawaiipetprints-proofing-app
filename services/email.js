const aws              = require("aws-sdk")
const awsconfig        = require("../awsconfig")
const nodemailer       = require('nodemailer');
aws.config.update(awsconfig)

async function sendEmail({ order_id, orderInfo }) {
    let transporter = nodemailer.createTransport({
        SES: new aws.SES({
            apiVersion: '2010-12-01'
        })
    });
    
    const { order_number, email, first_name } = orderInfo.items

    let notifyAdmin = await transporter.sendMail({
        from: '"Kawaii Pet Prints 🐶" <kawaiipetprints@gmail.com>',
        to: "danielvanduong@gmail.com", 
        subject: `Order number ${ order_number } has just been approved.`, 
        text: `Order number ${ order_number } & order id ${ order_id } has just been approved.`,
        html: `<b>Order number ${ order_number } has just been approved. Please fulfill the customer's order through printify.</b>`
    });
    let notifyCustomer = await transporter.sendMail({
        from: '"Kawaii Pet Prints 🐶" <kawaiipetprints@gmail.com>',
        to: `${email}`, 
        subject: `Order number ${ order_number } has just been approved.`, 
        text: `Order number ${ order_number } & order id ${ order_id } has just been approved.`,
        html: `Hi ${first_name},
        Thanks for approving your proof(s). We're excited to get started on your order ${order_number}. You'll receive another email once
        the item is shipped.
        
        If you have any questions, reply to this email.
        
        Thank you,
        Kawaii Pet Prints`
    });
    console.log("Message sent: %s", notifyAdmin.messageId);
    console.log("Message sent: %s", notifyCustomer.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

module.exports = {
    sendEmail
}