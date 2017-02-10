/**
 * Created by xieyiming on 14-12-3.
 */


var nodemailer = require('nodemailer');

module.exports = {

  send: function(email, cb) {
    var transport = nodemailer.createTransport("SMTP", {
      host: "smtp.163.com",
      auth: {
        user: sails.config.nodemailer.user,
        pass: sails.config.nodemailer.pass
      }
    });

    var subject = null;


    subject = email.subject;

    var mailOptions = {
      from: sails.config.nodemailer.from,
      to: email.to,
      subject: subject,
      html: email.messageHtml
    };

    transport.sendMail(mailOptions, function(err, response){
      if(err) return cb(err);
      return cb(null, response);
    });
  }

};

