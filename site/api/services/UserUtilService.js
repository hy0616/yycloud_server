/**
 * Created by xieyiming on 15-3-11.
 */


var Q = require('q'),
  AV = require('avoscloud-sdk').AV,
  Promise = require('bluebird'),
  is = require("is_js"),
  s = require("underscore.string"),
  datetime = require('./datetime');

var leancloud_config = sails.config.leancloud_config;

AV.initialize(leancloud_config.app_id, leancloud_config.app_key);      //yuncloud@yunyangdata.com


var parseMongoError = function (error) {

  var errObj = is.object(error) ? error.toJSON() : {};
  var errMsgs = [];

  var makeErrorReadable = {
    "E_VALIDATION": function () {
      _.forEach(_.keys(errObj.invalidAttributes), function (errAttr) {
        errMsgs.push(errAttr + " is required.");
      });
      sails.log.debug("errMsgs: ", errMsgs);

      return {err: errMsgs};
    },

    "E_UNKNOWN": function () {
      if (!_.has(errObj.raw) && 11000 != errObj.raw.code) {
        return {err: "database unknow error"};
      }
      sails.log.debug("get 11000 error: ", errObj.raw.err);
      errMsgs.push(s.trim(errObj.raw.err.split("dup key: { :")[1], " }\"") + " is already token.");

      sails.log.debug("return errMsg: ", errMsgs);
      return {err: errMsgs};
    }
  };

  return makeErrorReadable[errObj.error]();
};

module.exports = {
  currentUser: function (req) {
    return new Promise(function (resolve, reject) {
      if (req.headers && req.headers.authorization) {

        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
          var scheme = parts[0],
            credentials = parts[1];

          if (/^Bearer$/i.test(scheme)) {
            token = credentials;
          }

          sailsTokenAuth.verifyToken(token, function (err, token) {
            if (err)
              resolve(null);
            else
              resolve(token.username);
          });
        }
        ;
      } else {
        resolve(null);
      }
    });
  },

  signUpWithThird: function (query) {
    var deferred = Q.defer();

    if (query.type != 'qq' && query.type != 'weixin' && query.type != 'sina') {
      deferred.reject({err: 'type not support'});
    } else {

      //return after verify
      var localUser = {
        username: query.username,
        password: query.password,
        sessionToken: sailsTokenAuth.generateToken({username: query.username, createdAt: new Date()})
      };

      localUser[query.type + '_open_id'] = query.open_id;
    }

    deferred.resolve(localUser);

    return deferred.promise;
  },

  resetPassword: function (req) {
    var token = req.body.token || "";
    var ps1 = req.body.ps1 || "";
    var ps2 = req.body.ps2 || "";

    return new Promise(function (resolve, reject) {
      if (is.empty(token)) {
        reject({err: "token invalid"});
      }
      if (is.empty(ps1) || is.empty(ps2)) {
        reject({err: "password is empty."});
      }
      if (ps1 != ps2) {
        reject({err: "password is not equal."});
      }

      sailsTokenAuth.decode(token).then(function (info) {
        User.findOne({email: info.email}).then(function (user) {
          User.hashPassword(ps1, function (err, hash) {
            if (err) reject({err: 'update password error'});

            user.password = hash;
            user.save(function (err) {
              if (err) reject({err: err});
              //return res.json(200, user);
              RedisService.setUserInfo(user.username);
              resolve({message: 'ok'});
            });
          });

        });
      });

    });
  },

  sendResetEmail: function (email) {
    var email = req.body.email || "";

    return new Promise(function (resolve, reject) {
      sailsTokenAuth.encode({email: email}).then(function (token) {

        console.log("encode token: ", token);
        var href = 'href=' + '"http://yycloud.yunyangdata.com/reset?token=' + token + '"';

        Emailer.send({
          to: email,
          subject: "云洋监测密码重置邮件",
          messageHtml: '<h2>我们是云洋监测账号团队：</h2><br><a ' + href + ' style="padding:10px 20px;border-radius:5px;color:white;background-color:rgb(99, 171, 240)" >请点我修改重置密码</a>'

        }, function (err, ret) {
          if (err) reject({err: err});
          resolve({message: "ok"});
        });
      });
    });
  },

  signUp: function (req) {

    var query = {
      username: req.body.username || "",
      password: req.body.password || "",
      email: req.body.email || "",
      mobilePhoneNumber: req.body.phone || "",
      sessionToken: sailsTokenAuth.generateToken({username: req.body.username, createdAt: new Date()}),
      session_token: sailsTokenAuth.generateToken({username: req.body.username, createdAt: new Date()})
    };

    return new Promise(function (resolve, reject) {
      User.checkValid(query)
        .then(function (user) {
          var existQuery = {
            username: user.username
          };
          User.checkExsit(existQuery)
            .then(function (isExist) {
              if ("exist" !== isExist) {
                //create local user database
                user.role = 'user';         //default to be 'user'
                return User.create(user);
              } else {
                return {err: '用户名或邮箱已经存在！'};
              }
            }).then(function (user) {
              // var AVUser = new AV.User();

              // AVUser.set("username", user.username);
              // AVUser.set("password", "fakepassword");

              // // AVUser.set();
              // if( is.not.empty(user.mobilePhoneNumber) ) { AVUser.setMobilePhoneNumber( user.mobilePhoneNumber); }
              // if( is.not.empty(user.email) ) { AVUser.set("email", user.email); }

              // AVUser.signUp(null, {
              //   success: function(avuser) {
              //     // Hooray! Let them use the app now.
              //     sails.log.debug("AVUser ok: ", avuser);
              //     resolve(user);

              //   },
              //   error: function(avuser, error) {
              //     sails.log.error("AVOS Error: " + error.code + " " + error.message);
              //     reject({err:"server error"});
              //   }

              // });

              console.log(user);
              return resolve(user);
            })
        })
        .catch(function (err) {
          //sails.log.debug("parseMongoError err: ",  parseMongoError(err));
          //sails.log.debug("err: ", is.json(err));
          is.json(err) ? reject(parseMongoError(err)) : reject({err: err});
        });
    });
  },

  logIn: function (req) {
    var query = {
      username: req.body.username || "",
      password: req.body.password || "",
      email: req.body.email || "",
      installationId:req.body.installationId
    };

    var login_query = _.omit(_.pick(query, "username", "email"), is.empty);

    return new Promise(function (resolve, reject) {
      if (is.all.empty(login_query)) return reject({message: "username is empty."});
      if (is.not.alphaNumeric(login_query.username)) return reject({message: "username format error."});

      User.findOne(login_query).then(function (user) {
        if (is.undefined(user)) return reject({message: "user not found."});

        User.validPassword(query.password, user, function (err, valid) {
          if (err) return reject({message: "password not match"});
          user.session_token = user.sessionToken;
          user.phone = user.mobilePhoneNumber;
          sails.log.debug("----------> debug user: ", user);

          is.truthy(valid) ? resolve(user) : reject({message: "password not match."});
        });
      });
    });

  },

  sendSmsCode: function (query) {
    var deferred = Q.defer();
    console.log("sendSmsCode to: ", query.phone);

    AV.Cloud.requestSmsCode(query.phone).then(function () {
      return deferred.resolve({status: "smsCode already send"});
    }, function (err) {

      return deferred.reject(err);
    });

    return deferred.promise;
  },

  signUpWithPhone: function (query) {
    var deferred = Q.defer();

    smsService.verifyCode(query.phone, query.smsCode).then(function () {
      //验证成功
      var localUser = {
        username: query.username,
        password: query.password,
        mobilePhoneNumber: query.phone,
        mobilePhoneVerified: true,
        sessionToken: sailsTokenAuth.generateToken({username: query.username, createdAt: new Date()}),
        session_token: sailsTokenAuth.generateToken({username: query.username, createdAt: new Date()})
      };
      return deferred.resolve(localUser);

    }, function (err) {
      return deferred.reject("验证码错误");
    });

    return deferred.promise;
  },

  changePasswordByUserName: function (query) {
    var deferred = Q.defer();

    deferred.resolve({err: null, msg: "updatePassword done"});
    /*
     var user = AV.User.logIn(query.username, query.password, {
     success: function(user) {
     user.updatePassword(query.password, query.passwordNew,{
     success: function(){
     return deferred.resolve({err: null, msg: "updatePassword done"})
     },
     error: function(err){
     return deferred.reject({err: err});
     }
     });
     },

     error: function (user, error) {
     return deferred.reject(error);
     }

     })
     */
    return deferred.promise;
  },

  assignSmartGate: function (action, smartGateSn, username) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'user_assign_smartgate',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        action: action,
        smartgate_sn: smartGateSn,
        owner: username
      }

      HttpClient.createHttpClient(req_data).then(function (result) {
        resolve(result);
      });
    });
  }
};

