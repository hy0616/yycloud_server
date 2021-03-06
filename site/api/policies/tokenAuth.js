/**
 * Created by xieyiming on 14-12-11.
 */

// for JWT(json web token auth)

module.exports = function(req, res, next) {
  var token;
  //console.log('---------', req.headers);

  if(req.isSocket){
    token = req.body.token;
    sails.log.info("is socket connect token: ", token);
//    sails.log.info("socket: ", req.socket);

    sailsTokenAuth.verifyToken(token, function(err, token) {
      if (err) return res.json(401, {err: 'The token is not valid'});

      req.token = token.sid; // todo: to think better idea
      return next();
    });
//    return res.json(401, {err: 'This socket is not Authorized'});
  } else if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0],
        credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
      sailsTokenAuth.verifyToken(token, function(err, token) {
        if (err) return res.json(401, {err: 'The token is not valid'});
        req.token = token.sid; // todo: to think better idea
        return next();
      });

    } else {
      return res.json(401, {err: 'Format is Authorization: Bearer [token]'});
    }
  } else if (req.headers && req.headers.token) {
    var token = req.headers.token;

    sailsTokenAuth.verifyToken(token, function(err, token) {
      if (err) return res.json(401, {err: 'The token is not valid'});
      req.token = token.sid; // todo: to think better idea
      return next();
    });
  } else if (req.param('token')) {
    token = req.param('token');
    // We delete the token from param to not mess with blueprints
    delete req.query.token;

    sailsTokenAuth.verifyToken(token, function(err, token) {
      if (err) return res.json(401, {err: 'The token is not valid'});

      req.token = token.sid; // todo: to think better idea
      return next();
    });

  } else {
    sails.log.error("No Authorization header was found");
    return res.json(401, {err: 'No Authorization header was found'});
  }

//  sailsTokenAuth.verifyToken(token, function(err, token) {
//    if (err) return res.json(401, {err: 'The token is not valid'});
//
//    req.token = token;
//
//    next();
//  });
  

};

