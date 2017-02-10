/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

//http://www.360doc.com/content/13/0715/17/11253639_300171772.shtml //第三方登陆
var Promise = require('bluebird'),
  _ = require('lodash');
var datetime = require('../services/datetime');
module.exports = {

  signUp: function (req, res) {
    UserUtilService.signUp(req)
      .then(function (user) {
        RedisService.setUserInfo(user.username);
        return res.json(200, user);
      }).catch(function (err) {
        return res.json(200, err);
      });
  },

  checkExsit: function (req, res) {
    var propertyName = req.param('property');
    if (null === propertyName || undefined === propertyName) {
      res.json(200, {message: "empty not allowed"});
    } else if ("username" === propertyName) {
      var query = {username: req.param('username') || ''};
    } else if ("email" === propertyName) {
      var query = {email: req.param('email') || ''}
    } else {
      res.json(200, {message: "unknown property name"});
    }

    User.checkExsit(query)
      .then(function (msg) {
        return res.json(200, {message: msg});
      })
      .catch(function (err) {
        return res.json(401, {err: err});
      });
  },

  sendSmsCode: function (req, res) {
    var query = {
      phone: req.param('phone') || ""
    };
    console.log(query);
    UserUtilService.sendSmsCode(query).then(function (data) {
      console.log(data);
      return res.json(200, {'message': 'sms code already send'});
    }).catch(function (error) {
      console.log(error);
      return res.json(400, error);
    });
  },

  logIn: function (req, res) {
    UserUtilService.logIn(req)
      .then(function (user) {
        return res.json(200, user);
      })
      .catch(function (err) {
        return res.json(200, err);
      });
  },

  updateNickname: function (req, res) {
    var nickname = req.body.nickname;
    if (undefined === nickname) res.json(401, {err: 'need nickname'});
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          User.update({username: username}, {nickname: nickname})
            .then(function (user) {
              RedisService.setUserInfo(user.username);
              res.json(200, {message: 'update nickname ok'});
            });
        }
      });
  },

  addContact: function (req, res) {
    var contactName = req.body.contact_name;
    var contactNumber = req.body.contact_number;

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          User.findOne({username: username})
            .then(function (user) {
              if (user != undefined) {
                Contact.create({name: contactName, phone: contactNumber})
                  .then(function (contact) {
                    //user.contacts.add({id: contact.id});
                    user.contacts.add(contact.id);
                    user.save();
                    RedisService.setUserInfo(user.username);
                    res.json(200, {message: 'add contact ok'});
                  })
                  .fail(function (err) {
                    res.json(401, {err: 'create contact fail, maybe contact number exist'});
                  });
              } else {
                res.json(401, {message: 'not this user'});
              }
            })
            .fail(function (err) {
              res.json(401, {err: 'add contact fail'});
            });
        }
      });
  },

  deleteContact: function (req, res) {
    var contactNumber = req.body.contact_number;

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          User.findOne({username: username})
            .then(function (user) {
              if (user != undefined) {
                Contact.findOne({phone: contactNumber})
                  .then(function (contact) {
                    if (contact != undefined) {
                      user.contacts.remove(contact.id);
                      user.save(function (err) {
                        if (err) {
                          res.json(400, {err: err});
                        } else {
                          RedisService.setUserInfo(user.username);
                          contact.destroy();
                        }
                      });
                      res.json(200, {message: 'remove contact ok'});
                    } else {
                      res.json(401, {err: 'not this contact number'});
                    }
                  })
                  .fail(function (err) {
                    res.json(401, {err: 'find contact fail, check your number'});
                  });
              } else {
                res.json(401, {message: 'not this user'});
              }
            })
            .fail(function (err) {
              res.json(401, {err: 'remove contact fail'});
            });
        }
      });
  },

  getUserInfo: function (req, res) {
    var startTime = new Date();
    sails.log.debug("----------> request info: ",'获取列表页:'+req.url);
    UserUtilService.currentUser(req)
      .then(function (username) {
          sails.log.debug("----------> request username: ",username);
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          var startTimem = new Date();
          User.findOne({username: username})
            .populate('contacts')
            .populate('smartgates')
            .then(function (user) {
                var endTimem = new Date();
                var timeDiffm = endTimem-startTimem;
                sails.log.debug("----------> resopnsemongo info: ",username+'  '+'timeDiffm:'+timeDiffm+' resInfo: '+ JSON.stringify(user).length);
              var result = {
                username: user.username,
                email: user.email,
                phone: user.mobilePhoneNumber,
                nickname: user.nickname,
                contacts: user.contacts
              };
              result.smartgates = [];

              Promise.map(user.smartgates, function (smartgate) {
                return new Promise(function (resolve, reject) {
                    var startTimer = new Date();
                  RedisService.getLatestSmartGateData(smartgate.sn)
                    .then(function (data) {
                      result.smartgates.push(data);
                      resolve();
                        var endTimer = new Date();
                        var timeDiffr = endTimer-startTimer;
                        sails.log.debug("----------> resopnseredis-getLatestSmartGateData1 info: ",username+'  '+'timeDiffr:'+timeDiffr+' resInfo: '+ JSON.stringify(data));
                    });
                });
              }).then(function () {
                result.smartgates = _.sortBy(result.smartgates, 'smartgate.dev_name');
                res.json(200, result);
                var endTime = new Date();
                var timeDiff = endTime-startTime;
                sails.log.debug("----------> resopnse info: ",username+'  '+'timeDiff:'+timeDiff+' resInfo: '+ JSON.stringify(result).length);
              });
            })
            .fail(function (err) {
              res.json(401, {err: 'error happen'});
            });
        }
      });
  },

  getUser: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          User.findOne({username: username})
            .populate('contacts')
            .then(function (user) {
              var result = {
                username: user.username,
                phone: user.mobilePhoneNumber,
                nickname: user.nickname,
                contacts: user.contacts
              };
              res.json(200, result);
            })
            .fail(function (err) {
              res.json(401, {err: 'error happen'});
            });
        }

      }
    )
    ;
  },

  sendResetEmail: function (req, res) {
    var email = req.param('email') || '';
    UserUtilService.sendResetEmail(email)
      .then(function (info) {
        return res.json(200, info);
      })
      .catch(function (error) {
        return res.json(200, error);
      });
  }
  ,

  signUpWithPhone: function (req, res) {
    var query = {
      username: req.body.username || req.body.phone,
      password: req.body.password || "",
      phone: req.body.phone || "",
      smsCode: req.body.sms_code || ""
    };
    UserUtilService.signUpWithPhone(query)
      .then(function (user) {
        return User.create(user)
          .then(function (localUser) {
            RedisService.setUserInfo(user.username);
            var result = {
              result: 'OK',
              username: user.username,
              phone: user.mobilePhoneNumber,
              session_token: user.sessionToken
            };
            return res.json(200, result);
          });
      })
      .fail(function (err) {
        var result = {
          result: 'Failed',
          msg: err
        };
        return res.json(200, result);
      })
      .catch(function (error) {
        var result = {
          result: 'Failed',
          msg: error
        };
        return res.json(200, result);
      });
  }
  ,

  signUpWithThird: function (req, res) {
    var query = {
      username: req.body.username || "",
      password: req.body.password || "",
      type: req.body.type || "",
      open_id: req.body.open_id || "",
      access_token: req.body.access_token || ""
    };

    UserUtilService.signUpWithThird(query)
      .then(function (user) {

        User.checkValid(user)
          .then(function (validUser) {
            var existQuery = {
              username: query.username
            };
            User.checkExsit(existQuery)
              .then(function (isExist) {
                if ("exist" !== isExist) {
                  user.role = 'user';
                  User.create(user)
                    .then(function (user) {
                      RedisService.setUserInfo(user.username);
                      return res.json(200, user);
                    })
                    .fail(function (err) {
                      return res.json(200, {err: err});
                    });
                } else {
                  res.json(200, {err: '用户名或邮箱已经存在！'})
                }
              })
          }, function (validError) {
            res.json(200, {err: validError});
          })
      }).catch(function (error) {
        return res.json(200, error);
      });
  }
  ,

  logInWithThird: function (req, res) {
    var query = {
      type: req.body.type || "",
      open_id: req.body.open_id || ""
    };

    var login = function (user) {
      if (user === undefined) res.json({err: 'not this user'});

      var localUser = {
        sessionToken: sailsTokenAuth.generateToken({username: user.username, createdAt: new Date()})
      };

      return User.update({username: user.username}, localUser)
        .then(function (updateUser) {
          var result = {
            username: user.username,
            session_token: user.sessionToken
          };

          return res.json(200, result);
        });
    };

    if (query.type == 'qq') {
      User.findOne({qq_open_id: query.open_id})
        .then(function (user) {
          return login(user);
        });
    } else if (query.type == 'weixin') {
      User.findOne({weixin_open_id: query.open_id})
        .then(function (user) {
          return login(user);
        });
    } else if (query.type == 'sina') {
      User.findOne({sina_open_id: query.open_id})
        .then(function (user) {
          return login(user);
        });
    }

  }
  ,

  resetPassword: function (req, res) {

    UserUtilService.resetPassword(req)
      .then(function (info) {
        return res.json(200, info);
      })
      .catch(function (err) {
        return res.json(200, err);
      });

    // sailsTokenAuth.decode(token).then(function(info){
    //   User.findOne({email: info.email}).then(function(user){
    //     User.hashPassword(ps1, function(err, hash) {
    //       if (err) res.json(400, {err: 'update password error'});

    //       //console.log('--------------new hash:', hash);
    //       user.password = hash;
    //       user.save(function(err) {
    //         if (err) return res.json(200, err);
    //         //return res.json(200, user);
    //         return res.json(200, {message: 'ok'});
    //       });
    //     });

    //   });
    // });


  }
  ,

  changePassword: function (req, res) {
    var query = {
      username: req.body.username || "",
      password: req.body.password || "",
      passwordNew: req.body.password_new || ""
    };

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          UserUtilService.changePasswordByUserName(query)
            .then(function (data) {
              if (data.err != null) return res.json(400, 'can not changepassword');

              return User.findOne({username: query.username})
                .then(function (user) {
                  User.validPassword(query.password, user, function (err, valid) {
                    if (err) return res.json(403, {err: 'err password, forbidden'});

                    if (!valid) {
                      return res.json(401, {err: 'invalid username or password'});
                    } else {
                      User.hashPassword(query.passwordNew, function (err, hash) {
                        if (err) res.json(400, {err: 'update password error'});
                        user.password = hash;
                        user.save(function (err) {
                          if (err) return res.json(400, err);
                          RedisService.setUserInfo(user.username);
                          return res.json(200, {message: 'update password success'});
                        });
                      });
                    }
                  });
                });
            })
            .fail(function (err) {
              return res.json(400, err);
            })
            .catch(function (error) {
              return res.json(400, error);
            });
        }
      });
  }
  ,

  addSmartGate: function (req, res) {
    var sn = req.body.sn;
    if (sn === undefined || null === sn) res.json(401, {err: 'need dev_uuid'});

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          SmartGate.findOne()
            .where({sn: sn})
            .then(function (smartgate) {
              if (undefined !== smartgate && smartgate.owner !== undefined && smartgate.owner !== 'unknown') {
                var result = {};
                result.result = 'Failed';
                result.msg = 'The smartgate has been assigned to some user, please delete it first.';
                res.json(sails.config.errorcode.E504.code, result);
              } else if (undefined !== smartgate) {
                UserUtilService.assignSmartGate('add', smartgate.sn, username)
                  .then(function (result) {
                    res.json(200, result);
                  });
              } else {
                var result = {};
                result.result = 'Failed';
                result.msg = sails.config.errorcode.E504.detail;
                res.json(sails.config.errorcode.E504.code, result);
              }
            })
            .catch(function (e) {
              sails.log.error('add smartgate error: ' + e.stack);
            });
        }
      });
  }
  ,

  rmSmartGate: function (req, res) {
    var sn = req.params['id'];
    if (sn === undefined || null === sn) res.json(401, {err: 'need dev_uuid'});

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          SmartGate.findOne()
            .where({sn: sn, owner: username})
            .then(function (smartgate) {
              if (undefined !== smartgate) {
                UserUtilService.assignSmartGate('delete', sn, username)
                  .then(function (result) {
                    res.json(200, result);
                  });
              } else {
                var result = {};
                result.result = 'Failed';
                result.msg = 'Can not find the smartgate or the smartgate does not belong to you.';
                res.json(200, result);
              }
            })
            .catch(function (e) {
              sails.log.error('delete smartgate error: ' + e.stack);
            });
        }
      });
  }
  ,

  getSmartGateByUser: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          RedisService.getSmartGateByUser(username)
            .then(function (result) {
              res.json(200, result);
            }).catch(function (e) {
              sails.log.error('get user\'s smartgates error: ' + e.stack);
            })
        }
      });
  },

  getSmartGateByWebUser: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          RedisService.getUserInfo(username)
            .then(function (info) {
              if (info.role !== 'superadmin') {
                RedisService.getSmartGateByUser(username)
                  .then(function (result) {
                    res.json(200, result);
                  }).catch(function (e) {
                    sails.log.error('get user\'s smartgates error: ' + e.stack);
                  })
              } else {
                RedisService.getAllSmartGate()
                  .then(function (result) {
                    res.json(200, result);
                  }).catch(function (e) {
                    sails.log.error('get user\'s smartgates error: ' + e.stack);
                  })
              }
            });
        }
      });
  },

  getSmartGateSnsByUser: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          RedisService.getSmartGateSnsByUser(username)
            .then(function (result) {
              res.json(200, result);
            }).catch(function (e) {
              sails.log.error('get user\'s smartgates error: ' + e.stack);
            })
        }
      });
  },

  setUserInstallationId: function (req, res) {
    var result = {};
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          var installationId = req.body.installationId;
          if (null === installationId || undefined === installationId) {
            result.result = 'Failed';
            result.msg = '获取InstallationId失败!';
            res.json(200, result);
          }
          RedisService.setUserInstallationId(username, installationId)
            .then(function (message) {
              result.result = 'OK';
              if ('Failed' === message)
                result.msg = '服务器发生未知错误.'
              else
                result.msg = '';
              res.json(200, result);
            })
        }
      });
  },

  getVisitors: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          OwnerVisitor.find({owner: username})
            .then(function (ownerVisitors) {
              var visitors = [];
              _.forEach(ownerVisitors, function (ownerVisitor) {
                visitors.push(ownerVisitor.visitor);
              })
              result.visitors = visitors;
              result.result = 'OK';
              res.json(200, result);
            })
            .fail(function (err) {
              res.json(200, result);
            })
        }
      });
  },

  bindVisitor: function (req, res) {
    var result = {};
    result.result = 'Failed';
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          var visitorId = req.body.visitorId;
          if (null === visitorId || undefined == visitorId) {
            result.msg = '请提供访客用户名';
            res.json(200, result);
          }
          User.findOne(visitorId)
            .then(function (user) {
              if (null === user || undefined === user) {
                result.msg = '访客ID不合法';
                res.json(200, result);
              } else {
                OwnerVisitor.checkExist(username, visitorId)
                  .then(function (isExist) {
                    if (isExist) {
                      result.msg = '该用户已经是您的授权访客';
                      res.json(200, result);
                    } else {
                      OwnerVisitor.create({owner: username, visitor: visitorId})
                        .then(function (newOwnerVisitor) {
                          if (null === newOwnerVisitor || undefined === newOwnerVisitor) {
                            result.msg = '发生未知错误，请与管理员联系';
                          } else {
                            result.result = 'OK';
                            result.msg = '授权访客成功';
                          }
                          res.json(200, result);
                        })
                    }
                  })
              }
            })
        }
      });
  },

  unbindVisitor: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          var visitorId = req.param('visitorId');
          if (null === visitorId || undefined == visitorId) {
            result.msg = '请提供访客用户名';
            res.json(200, result);
          }
          User.findOne(visitorId)
            .then(function (user) {
              if (null === user || undefined === user) {
                result.msg = '访客ID不合法';
                res.json(200, result);
              } else {
                OwnerVisitor.checkExist(username, visitorId)
                  .then(function (isExist) {
                    if (isExist) {
                      OwnerVisitor.destroy()
                        .where({owner: username, visitor: visitorId})
                        .then(function (record) {
                          result.result = 'OK';
                          result.msg = '解除授权访客成功';
                          res.json(200, result);
                        })
                    } else {
                      result.msg = '该访客不属于您';
                      res.json(200, result);
                    }
                  })
              }
            })
        }
      });
  },

  getVisiableSmartGates: function (req, res) {
    var result = {};
    result.result = 'Failed';

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null == username) {
          res.json(401, {err: '请先登录'});
        } else {
          OwnerVisitor.find({visitor: username})
            .then(function (ownerVisitors) {
              result.smartgates = [];
              if (null === ownerVisitors || undefined === ownerVisitors) {
                result.result = 'OK';
                res.json(200, result);
              } else {
                Promise.map(ownerVisitors, function (ownerVisitor) {
                  return new Promise(function (resolve, reject) {
                    RedisService.getSmartGateByUser(ownerVisitor.owner)
                      .then(function (smartgates) {
                        result.smartgates = _.union(result.smartgates, smartgates);
                        resolve();
                      })
                  })
                }).then(function () {
                  result.result = 'OK';
                  res.json(200, result);
                })
              }
            })
        }
      });
  },


  test: function (req, res) {
  },

  test1: function (req, res) {
  },

  test2: function (req, res) {
  }

}
;

