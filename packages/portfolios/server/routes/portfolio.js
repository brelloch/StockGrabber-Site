'use strict';

var portfolios = require('../controllers/portfolios');

// Portfolio authorization helpers
var hasAuthorization = function(req, res, next) {
  if (!req.user.isAdmin && req.portfolio.user.id !== req.user.id) {
    return res.status(401).send('User is not authorized');
  }
  next();
};

module.exports = function(Portfolios, app, auth) {

  app.route('/portfolios')
    .get(portfolios.all)
    .post(auth.requiresLogin, portfolios.create);
  app.route('/portfolios/:portfolioId')
    .get(auth.isMongoId, portfolios.show)
    .put(auth.isMongoId, auth.requiresLogin, hasAuthorization, portfolios.update)
    .delete(auth.isMongoId, auth.requiresLogin, hasAuthorization, portfolios.destroy);

  // Finish with setting up the portfolioId param
  app.param('portfolioId', portfolios.portfolio);
};
