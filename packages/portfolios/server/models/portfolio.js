'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var StockSchema = new Schema({
  Symbol: {
    type: String,
    required: true,
    trim: true
  },
  CompanyName: {
    type: String,
    trim: true
  },
  LastPrice: {
    type: Number,
    trim: true
  },
  LastTradeDate: {
    type: String,
    trim: true
  },
  LastTradeTime: {
    type: String,
    trim: true
  },
  Change: {
    type: Number,
    trim: true
  },
  PercentChange: {
    type: String,
    trim: true
  },
  Volume: {
    type: Number,
    trim: true
  },
  AverageDailyVol: {
    type: Number,
    trim: true
  },
  Bid: {
    type: Number,
    trim: true
  },
  Ask: {
    type: Number,
    trim: true
  },
  PreviousClose: {
    type: Number,
    trim: true
  },
  TodaysOpen: {
    type: Number,
    trim: true
  },
  DaysRange: {
    type: String,
    trim: true
  },
  FiftyTwoWeekRange: {
    type: String,
    trim: true
  },
  EarningsPerShare: {
    type: Number,
    trim: true
  },
  PERatio: {
    type: Number,
    trim: true
  },
  DividendPayDate: {
    type: String,
    trim: true
  },
  DividendPerShare: {
    type: Number,
    trim: true
  },
  DividendYield: {
    type: Number,
    trim: true
  },
  MarketCapitalization: {
    type: String,
    trim: true
  },
  StockExchange: {
    type: String,
    trim: true
  },
  ShortRatio: {
    type: Number,
    trim: true
  },
  OneYrTargetPrice: {
    type: Number,
    trim: true
  },
  EPSEstCurrentYr: {
    type: Number,
    trim: true
  },
  EPSEstNextYear: {
    type: Number,
    trim: true
  },
  EPSEstNextQuarter: {
    type: Number,
    trim: true
  },
  PriceEPSEstCurrentYr: {
    type: Number,
    trim: true
  },
  PriceEPSEstNextYr: {
    type: Number,
    trim: true
  },
  PEGRatio: {
    type: Number,
    trim: true
  },
  PerfMnth: {
    type: Number,
    trim: true
  },
  Perf: {
    type: Number,
    trim: true
  },
  BookValue: {
    type: Number,
    trim: true
  },
  PriceBook: {
    type: Number,
    trim: true
  },
  PriceSales: {
    type: Number,
    trim: true
  },
  EBITDA: {
    type: String,
    trim: true
  },
  FiftyDayMovingAvg: {
    type: Number,
    trim: true
  },
  TwoHundredDayMovingAvg: {
    type: Number,
    trim: true
  },
  MeanRecommendation: {
    type: Number,
    trim: true
  },
  NoOfBrokers: {
    type: Number,
    trim: true
  },
  TheStreetRating: {
    type: String,
    trim: true
  },
  NavellierFundamentalGrade: {
    type: String,
    trim: true
  },
  NavellierSalesGrowth: {
    type: String,
    trim: true
  },
  NavellierOperatingMarginGrowth: {
    type: String,
    trim: true
  },
  NavellierEarningsGrowth: {
    type: String,
    trim: true
  },
  NavellierEarningsMomentum: {
    type: String,
    trim: true
  },
  NavellierEarningsSurprises: {
    type: String,
    trim: true
  },
  NavellierAnalystEarningsRevisions: {
    type: String,
    trim: true
  },
  NavellierCashFlow: {
    type: String,
    trim: true
  },
  NavellierReturnOnEquity: {
    type: String,
    trim: true
  },
  NavellierQuantitativeGrade: {
    type: String,
    trim: true
  },
  NavellierTotalGrade: {
    type: String,
    trim: true
  },
  ZacksRating: {
    type: Number,
    trim: true
  },
  StockSelectorRating: {
    type: Number,
    trim: true
  },
  NavellierRisk: {
    type: String,
    trim: true
  },
  MorningstarRating: {
    type: Number,
    trim: true
  },
  MorningstarFairValueEstimate: {
    type: Number,
    trim: true
  },
  MorningstarUncertainty: {
    type: String,
    trim: true
  },
  MorningstarConsiderBuy: {
    type: Number,
    trim: true
  },
  MorningstarConsiderSell: {
    type: Number,
    trim: true
  },
  MorningstarEconomicMoat: {
    type: String,
    trim: true
  },
  MorningstarCreditRating: {
    type: String,
    trim: true
  },
  MorningstarStewardshipRating: {
    type: String,
    trim: true
  },
  CompRating: {
    type: Number,
    trim: true
  },
  EPSRating: {
    type: Number,
    trim: true
  },
  RSRating: {
    type: Number,
    trim: true
  },
  IndGrpRelativeStrength: {
    type: String,
    trim: true
  },
  SMRRating: {
    type: String,
    trim: true
  },
  AccDisRating: {
    type: String,
    trim: true
  },
  SponRating: {
    type: String,
    trim: true
  },
  hidden: {
    type: Boolean,
    default: false
  },
  CompDesc: {
    type: String,
    trim: true
  }
});

/**
 * Portfolio Schema
 */
var PortfolioSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  stale: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  stocks: [StockSchema],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});



/**
 * Validations
 */
PortfolioSchema.path('title').validate(function(title) {
  return !!title;
}, 'Title cannot be blank');

PortfolioSchema.path('content').validate(function(content) {
  return !!content;
}, 'Content cannot be blank');

/**
 * Statics
 */
PortfolioSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Portfolio', PortfolioSchema);
mongoose.model('Stock', StockSchema);
