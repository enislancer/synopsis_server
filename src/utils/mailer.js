
var async = require('async');
var config = require('../config/config');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const AWS = require('aws-sdk');

// const transporter = nodemailer.createTransport({
//   SES: new AWS.SES({ apiVersion: "2010-12-01" }),
// });

AWS.config.update({
  region: "us-east-2",
  //accessKeyId: "AKIAY6MOESSDQHUHH6BO",
  //secretAccessKey: "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",
  //accessKeyId: 'AKIAJPH5OEC3JDFW5CSA',
  //secretAccessKey: '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'
  accessKeyId: config.aws_access_key_id,
  secretAccessKey: config.aws_secret_access_key
});


function sendEmail(obj) {
  var params = {
    Destination: {
      ToAddresses: [obj.to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: obj.message,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: obj.subject,
      },
    },
    Source: "info@imgn.co" /* required */,
  };

  return new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(params).promise();
}


/*var email_transporter = nodemailer.createTransport(smtpTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,   
  service: config.mailer_provider,
  //host: config.mailer_host,
  auth: { user: config.mailer_params.user, pass: config.mailer_params.pass }
}));*/

/*var email_transporter = nodemailer.createTransport({
  service: config.mailer_provider,
  //host: config.mailer_host,
  //secureConnection : false,
  //port: 587,
  auth: { user: config.mailer_params.user, pass: config.mailer_params.pass }
});*/

/*var email_transporter = nodemailer.createTransport(smtpTransport({
  service: config.mailer_provider,
  host: config.mailer_host,
  //port: 587,
  secure:false,
  secureConnection : false,
  auth: { user: config.mailer_params.user, pass: config.mailer_params.pass }
}))*/

/*var mailOptions = {
  from: 'ring.dudu@gmail.com',
  to: 'davidring8@gmail.com',
  subject: 'Test Subject',
  //html: '<html></html>',
  text: 'Test Text'
}

// send mail with defined transport object
email_transporter.sendMail(mailOptions, function(err, body){
  if (err) {
    console.log('err:',err)
  } else {
    console.log('body:',body)
  }
});*/

module.exports = {

  send_mail: function (to, subject, text, html, cb) {


    try {

      var mailOptions = {
          from: config.mailer_params.user,
          to: to,
          //from: 'info@imgn.co',
          //to: 'ring.dudu@gmail.com',
          subject: subject,
          html: html,
          text: text
      }

      sendEmail({
        to:to,
        subject: subject,
        message: html,
      
      });
    } catch (error) {
      return cb(error);
    }

    return cb(null, null);
    
    email_transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        cb(error);
      } else {
        console.log('Email sent: ' + info.response);
        cb(null, info.response);
      }
    });

    // send mail with defined transport object
    //email_transporter.sendMail(mailOptions, cb);
  
    /*email_transporter.sendMail({
      from: 'admin@colu.com',
      to: 'david@colu.com',
      subject: 'hello',
      //html: '<b>hello world!</b>',
      text: 'hello world!'
    });*/
  },
  
  send_mail_ex: function (email_to, subject, text, html, image, bynaric_image, video, callback) {

    console.log('email_to:',email_to)
    console.log('subject:',subject)
    console.log('text:',text)
    console.log('image:',image)
    console.log('bynaric_image:',bynaric_image)
    console.log('video:',video)
    
    var image_html = "";
    var attachments = []/*{
        filename: 'deepnen.mp4',
        //content: `${bynaric_image}`,
        content: `${video}`,
        //encoding: 'base64',
        //contentType:  'image/jpeg',
        cid: 'myimagecid'
      }]*/
    //console.log('video:',video)
    if (image.length > 3) {
      image_html = `<img src=${image} width="400" />`
    } else {
      if (bynaric_image.length > 3) {
        image_html = `'<p align="center"><img src="${bynaric_image}" width="400" /></p>'`
        //image_html = `'<p align="center"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2w48ydSqKnPA81Xxyd-BocnddklS7Ka1sF8WTrcW6-Ft6caM5" width="400" /></p>'`
        //image_html = `<p align="center"><img src='cid:myimagecid' width="400" /></p>`
      } else {
        if (video.length > 3) {
          image_html = `<video width="400" controls><source src="${video}" type="video/mp4"></video>`
          //image_html = `<video width="400" controls><source src="https://res.cloudinary.com/deepnen/video/upload/v1546368139/videos/The_two_talking_cats.mp4" type="video/mp4"></video>`
          //image_html = `<video width="400" src="${video}" controls />`
          //image_html = `<video controls width="250"><source src="${video}" type="video/mp4"></video>`

          console.log('image_html:',image_html)
          /*attachments = [
            {
              fileName: 'vtn4t2cv89zs8iancmgy.mp4',
              streamSource: video
            }
          ]*/
        }
      }
    }

    image_html += html;

    /*var html;
    if (user.is_new == true) {
      html = mail_vars.email_header+"<p>"+user.name+",</p><p>You have been added to the Rivver platform for "+gp.company+", log on using the following credentials:</p><p>Email: "+user.email+"<br>Password: "+user.password_real+"</p><a style=\""+mail_vars.email_button_style+"\" href=\""+mail_vars.site_url+"/\">Go to Rivver</a>"+mail_vars.email_footer;
    } else {
      html = mail_vars.email_header+"<p>"+user.name+",</p><p>You have been added to the Rivver platform for "+gp.company+", log on to continue.</p><a style=\""+mail_vars.email_button_style+"\" href=\""+mail_vars.site_url+"/\">Go to Rivver</a>"+mail_vars.email_footer;
    }*/

    //console.log('image:',image)
    //console.log('bynaric_image:',bynaric_image)
    //console.log('video:',video)
    
    var mailOptions = {
      from: config.mailer_params.user,
      to: email_to,
      subject: subject,
      text: '',//text,
      html: image_html,
      //html: '<h1>Hello World</h1>',
      attachments: attachments
      //encoding: 'base64',
      //textEncoding: 'base64'
    }

    //console.log('mailOptions:',mailOptions)
    email_transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        callback(error);
      } else {
        console.log('Email sent: ' + info.response);
        callback(null, info.response);
      }
    });
  }
}

/*var email_transporter = nodemailer.createTransport({
  service: mail_vars.service,
  auth: {
      user: mail_vars.user,
      pass: mail_vars.pass
  }
});

let html = "";

var subject = "You have been added to "+gp.company;
if (user.is_new == true){
  html = mail_vars.email_header+"<p>"+user.name+",</p><p>You have been added to the Rivver platform for "+gp.company+", log on using the following credentials:</p><p>Email: "+user.email+"<br>Password: "+user.password_real+"</p><a style=\""+mail_vars.email_button_style+"\" href=\""+mail_vars.site_url+"/\">Go to Rivver</a>"+mail_vars.email_footer;
} else {
  html = mail_vars.email_header+"<p>"+user.name+",</p><p>You have been added to the Rivver platform for "+gp.company+", log on to continue.</p><a style=\""+mail_vars.email_button_style+"\" href=\""+mail_vars.site_url+"/\">Go to Rivver</a>"+mail_vars.email_footer;
}
var to = user.email;

var mailOptions = {
  from: 'hello@rivver.com',
  to: to,
  subject: subject,
  html: html
};

email_transporter.sendMail(mailOptions, function(error, info){
  if (error) {
      console.log(error);
  } else {
      console.log('Email sent: ' + info.response);
  }
});*/
