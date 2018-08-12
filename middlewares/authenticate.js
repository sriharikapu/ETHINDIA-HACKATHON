var expressJwt = require('express-jwt');
var authenticate = expressJwt({
    secret: 'secret',
    requestProperty: 'auth',
    getToken: function(req) {
      if (req.headers['x-auth-token']) {
        return req.headers['x-auth-token'];
      }
      return null;
    }
  });