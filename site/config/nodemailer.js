/**
 * Created by xieyiming on 14-12-4.
 */

module.exports.nodemailer = {
//  usessl: true,
  port: 465,
  from: 'yycloud-service@yunyangdata.com',
  host: 'smtp.ym.163.com',
  user: "yycloud-service@yunyangdata.com",
  pass: "yycloudServiceYY2016",

  prepend_subject: "密码重置邮件."
};

