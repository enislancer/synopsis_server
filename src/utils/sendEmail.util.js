import fs from 'fs';
import path from 'path';
import AWS from 'aws-sdk';
import hogan from 'hogan.js';

var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('../config/config');

var smtpTransport = nodemailer.createTransport(smtpTransport({
	service: config.mailer_provider,
	host: config.mailer_host,
	auth: config.mailer_params
}));
  
/*const Verifier = require("email-verifier");
let verifier = new Verifier("your_whoisapi_username", "your_whoisapi_password");
verifier.verify("r@rdegges.com", (err, data) => {
  if (err) throw err;
  console.log(data);
});*/

// Set the region
AWS.config.update({
	region: 'us-east-1',
	accessKeyId: 'AKIAY6MOESSDQHUHH6BO',
	secretAccessKey: '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'
});

// const client = ses.createClient({ key: 'AKIAY6MOESSDQHUHH6BO', secret: '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' });
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey('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');

function sendEmail(req, res, to, from, subject, templateName, verify_email_token, link/*, altText, cc, bcc*/, callback) {

	//host=req.get('host');
	//var host = 'localhost:3000/imgn/api/v1'
	//link="http://"+host+"/verify?verify_email_token="+verify_email_token;
	
    var mailOptions = {
        from: from,
        to: to,
        subject: "Please confirm your Email account",
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>",
        text: ''
    }
	

	console.log(mailOptions);
	

	smtpTransport.sendMail(mailOptions, callback);
	return;
	
	smtpTransport.sendMail(mailOptions, function(error, response){
			if(error){
    		//console.log(error);
        	//res.end("error");
			callback(error);
     	}else{
        	//console.log("Message sent: " + response.message);
        	//res.end("sent");
			callback(null, response.message);
		}
	});


    // send mail with defined transport object
    email_transporter.sendMail(mailOptions, cb);

	return;

	var template = fs.readFileSync(path.join(__dirname, `../public/email-templates/${templateName}.html`), {
		encoding: 'utf-8'
	});

	var compiledTemplate = hogan.compile(template);

	var params = {
		Destination: {
			CcAddresses: [
				// from
			],
			ToAddresses: [
				to
			]
		},
		Message: {
			/* required */
			Body: {
				/* required */
				Html: {
					Charset: 'UTF-8',
					Data: compiledTemplate.render(templateParams)
				}
			},
			Subject: {
				Charset: 'UTF-8',
				Data: subject
			}
		},
		//Source: 'ring.dudu@gmail.com'//'info@imgn.co' /* required */
		Source: 'info@yourtraffix.co' /* required */
	};

	// Create the promise and SES service object
	return new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
}

// function sendEmail(to, from, subject, template, templateParams, cc, bcc) {
// 	var template = fs.readFileSync(path.join(__dirname, `../public/email-templates/${template}.html`), {
// 		encoding: 'utf-8'
// 	});

// 	var compiledTemplate = hogan.compile(template);

// 	console.log(templateParams);

// 	const msg = {
// 		to: to,
// 		from: from,
// 		fromname: 'Imgn',
// 		subject: subject,
// 		html: compiledTemplate.render(templateParams)
// 	};

// 	return sgMail.send(msg);
// }
export default sendEmail;
