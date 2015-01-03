'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Portfolio = mongoose.model('Portfolio'),
  Stock = mongoose.model('Stock'),
  _ = require('lodash');


/**
 * Find portfolio by id
 */
exports.portfolio = function(req, res, next, id) {
  Portfolio.load(id, function(err, portfolio) {
    if (err) return next(err);
    if (!portfolio) return next(new Error('Failed to load portfolio ' + id));
    req.portfolio = portfolio;
    next();
  });
};

/**
 * Create an portfolio
 */
exports.create = function(req, res) {
  var portfolio = new Portfolio(req.body);
  portfolio.user = req.user;
  portfolio.stale = true;
  var stocks = portfolio.content.split(',');
  stocks = stocks.filter(function(elem, pos) {
    return stocks.indexOf(elem) === pos;
  });
  for (var i = 0; i < stocks.length; i += 1) {
    var stock = new Stock();
    stock.Symbol = stocks[i];
    portfolio.stocks.push(stock);
  }

  portfolio.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: err
      });
    }
    res.json(portfolio);

  });
};

/**
 * Update an portfolio
 */
exports.update = function(req, res) {
  var portfolio = req.portfolio;
  portfolio = _.extend(portfolio, req.body);

  if (portfolio.stockUpdated) {
    console.log('stock update: ' + portfolio.stockUpdated);
  } else {
    portfolio.stale = true;
    portfolio.stocks = [];
    var stocks = portfolio.content.split(',');
    stocks = stocks.filter(function(elem, pos) {
      return stocks.indexOf(elem) === pos;
    });
    for (var i = 0; i < stocks.length; i += 1) {
      var stock = new Stock();
      stock.Symbol = stocks[i];
      portfolio.stocks.push(stock);
    }
  }

  portfolio.save(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot update the portfolio'
      });
    }
    res.json(portfolio);

  });
};

/**
 * Delete an portfolio
 */
exports.destroy = function(req, res) {
  var portfolio = req.portfolio;

  portfolio.remove(function(err) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot delete the portfolio'
      });
    }
    res.json(portfolio);

  });
};

/**
 * Show an portfolio
 */
exports.show = function(req, res) {
  res.json(req.portfolio);
};

/**
 * List of Portfolios
 */
exports.all = function(req, res) {
  Portfolio.find().sort('-created').populate('user', 'name username').exec(function(err, portfolios) {
    if (err) {
      return res.status(500).json({
        error: 'Cannot list the portfolios'
      });
    }
    res.json(portfolios);

  });
};
