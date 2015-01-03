'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module,
  favicon = require('serve-favicon'),
  express = require('express');

var SystemPackage = new Module('system');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
SystemPackage.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  SystemPackage.routes(app, auth, database);

  SystemPackage.aggregateAsset('css', 'common.css');

  // The middleware in config/express will run before this code

  // Set views path, template engine and default layout
  app.set('views', __dirname + '/server/views');

  // Setting the favicon and static folder
  app.use(favicon(__dirname + '/public/assets/img/favicon.ico'));

  // Adding robots and humans txt
  app.use(express.static(__dirname + '/public/assets/static'));

  return SystemPackage;
});

var request = require('request');
var yahooFinance = require('yahoo-finance');

var FIELDS = ['a', 'b', 'b2', 'b3', 'p', 'o','y', 'd', 'r1', 'q','c1', 'c', 'c6', 'k2', 'p2', 'd1', 'd2', 't1',
  'c8', 'c3', 'g', 'h', 'k1', 'l', 'l1', 't8', 'm5', 'm6', 'm7', 'm8', 'm3', 'm4','w1', 'w4', 'p1',
  'm', 'm2', 'g1', 'g3', 'g4', 'g5', 'g6','k', 'j', 'j5', 'k4', 'j6', 'k5', 'w','i', 'j1', 'j3', 'f6',
  'n', 'n4', 's1', 'x', 'j2','v', 'a5', 'b6', 'k3', 'a2','e', 'e7', 'e8', 'e9', 'b4', 'j4', 'p5',
  'p6', 'r', 'r2', 'r5', 'r6', 'r7', 's7','t7', 't6', 'i5', 'l2', 'l3', 'v1', 'v7', 's6', 'e1'];


var CronJob = require('cron').CronJob;
var job = new CronJob({
  cronTime: '1 * * * * *',
  onTick: function() {
    var mongoose = require('mongoose'),
    Portfolio = mongoose.model('Portfolio');
    //Stock = mongoose.model('Stock');
    Portfolio.find({stale:true}).sort('-created').populate('user', 'name username').exec(function(err, portfolios) {
      if (err) {
        console.log('Cannot list the portfolios');
      }

      for (var i = 0; i < portfolios.length; i += 1) {
        for (var x = 0; x < portfolios[i].stocks.length; x += 1) {
          (function (i,x) {
            portfolios[i].stale = false;

            yahooFinance.snapshot({
              fields: FIELDS,
              symbol: portfolios[i].stocks[x].Symbol
            }).then(function (snapshot) {
              portfolios[i].stocks[x].CompanyName = snapshot.name;
              portfolios[i].stocks[x].LastPrice = snapshot.lastTradePriceOnly;
              portfolios[i].stocks[x].LastTradeDate = snapshot.lastTradeDate;
              portfolios[i].stocks[x].LastTradeTime = snapshot.lastTradeTime;
              portfolios[i].stocks[x].Change = snapshot.changeRealtime;
              portfolios[i].stocks[x].PercentChange = snapshot.changePercentRealtime;
              portfolios[i].stocks[x].Volume = snapshot.volume;
              portfolios[i].stocks[x].AverageDailyVol = snapshot.averageDailyVolume;
              portfolios[i].stocks[x].Bid = snapshot.bidRealtime;
              portfolios[i].stocks[x].Ask = snapshot.askRealtime;
              portfolios[i].stocks[x].PreviousClose = snapshot.previousClose;
              portfolios[i].stocks[x].TodaysOpen = snapshot.open;
              portfolios[i].stocks[x].DaysRange = snapshot.daysRange;
              portfolios[i].stocks[x].FiftyTwoWeekRange = snapshot['52WeekRange'];
              portfolios[i].stocks[x].EarningsPerShare = snapshot.earningsPerShare;
              portfolios[i].stocks[x].PERatio = snapshot.peRatio;
              portfolios[i].stocks[x].DividendPayDate = snapshot.dividendPayDate;
              portfolios[i].stocks[x].DividendPerShare = snapshot.dividendPerShare;
              portfolios[i].stocks[x].DividendYield = snapshot.dividendYield;
              portfolios[i].stocks[x].MarketCapitalization = snapshot.marketCapitalization;
              portfolios[i].stocks[x].StockExchange = snapshot.stockExchange;
              portfolios[i].stocks[x].ShortRatio = snapshot.shortRatio;
              portfolios[i].stocks[x].OneYrTargetPrice = snapshot['1YrTargetPrice'];
              portfolios[i].stocks[x].EPSEstCurrentYr = snapshot.epsEstimateCurrentYear;
              portfolios[i].stocks[x].EPSEstNextYear = snapshot.epsEstimateNextYear;
              portfolios[i].stocks[x].EPSEstNextQuarter = snapshot.epsEstimateNextQuarter;
              portfolios[i].stocks[x].PriceEPSEstCurrentYr = snapshot.pricePerEpsEstimateCurrentYear;
              portfolios[i].stocks[x].PriceEPSEstNextYr = snapshot.pricePerEpsEstimateNextYear;
              portfolios[i].stocks[x].PEGRatio = snapshot.pegRatio;
              portfolios[i].stocks[x].BookValue = snapshot.bookValue;
              portfolios[i].stocks[x].PriceBook = snapshot.pricePerBook;
              portfolios[i].stocks[x].PriceSales = snapshot.pricePerSales;
              portfolios[i].stocks[x].EBITDA = snapshot.ebitda;
              portfolios[i].stocks[x].FiftyDayMovingAvg = snapshot['50DayMovingAverage'];
              portfolios[i].stocks[x].TwoHundredDayMovingAvg = snapshot['200DayMovingAverage'];

              portfolios[i].save();
            });

            request('http://finance.yahoo.com/q/ao?s='+portfolios[i].stocks[x].Symbol+'+Analyst+Opinion', function (error, response, body) {
              if (!error && response.statusCode === 200) {
                var lines = body.split('\n');
                for (var z = 0; z < lines.length; z+=1) {
                  if (lines[z].match(/Mean Recommendation \(this week\):<\/td><td class="yfnc_tabledata1">/)) {
                    var MeanRecommendation = lines[z];
                    var NoOfBrokers = lines[z];

                    MeanRecommendation = MeanRecommendation.replace(/.*Mean Recommendation \(this week\):<\/td><td class="yfnc_tabledata1">/,'');
                    MeanRecommendation = MeanRecommendation.replace(/<\/td>.*/,'');

                    NoOfBrokers = NoOfBrokers.replace(/.*No\. of Brokers:<\/td><td class="yfnc_tabledata1">/, '');
                    NoOfBrokers = NoOfBrokers.replace(/<\/td>.*/, '');

                    if (NoOfBrokers.match(/N\/A/)) {
                      NoOfBrokers = null;
                    }
                    if (MeanRecommendation.match(/N\/A/)) {
                      MeanRecommendation = null;
                    }

                    portfolios[i].stocks[x].MeanRecommendation = MeanRecommendation;
                    portfolios[i].stocks[x].NoOfBrokers = NoOfBrokers;

                    console.log('MeanRecommendation: ' + MeanRecommendation);
                    console.log('NoOfBrokers: ' + NoOfBrokers);

                    break;
                  }
                }
              }
              portfolios[i].save();
            });

            request('http://www.thestreet.com/quote/'+portfolios[i].stocks[x].Symbol+'/details/analyst-ratings.html', function (error, response, body) {
              if (!error && response.statusCode === 200) {
                var lines = body.split('\n');
                for (var z = 0; z < lines.length; z+=1) {
                  if (lines[z].match(/"LetterGradeRating":"/)) {
                    //console.log(i + ': ' + lines[z]);
                    var TheStreetRating = lines[z];

                    TheStreetRating = TheStreetRating.replace(/.*LetterGradeRating":"/,'');
                    TheStreetRating = TheStreetRating.replace(/"}]}.*/,'');

                    portfolios[i].stocks[x].TheStreetRating = TheStreetRating;

                    console.log('TheStreetRating: ' + TheStreetRating);

                    break;
                  }
                }
              }
              portfolios[i].save();
            });

            request('http://navelliergrowth.investorplace.com/portfolio-grader/stock-report.html?t=' + portfolios[i].stocks[x].Symbol, function (error, response, body) {
              if (!error && response.statusCode === 200) {
                var lines = body.split('\n');
                for (var z = 0; z < lines.length; z+=1) {
                  if (lines[z].match(/Volatility:<\/strong>/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierRisk = lines[z];

                    NavellierRisk = NavellierRisk.replace(/.*Volatility:<\/strong>\s*/,'');
                    NavellierRisk = NavellierRisk.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierRisk = NavellierRisk;

                    console.log('NavellierRisk: ' + NavellierRisk);
                  } else if (lines[z].match(/Fundamental Grade:/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierFundamentalGrade = lines[z+1];

                    NavellierFundamentalGrade = NavellierFundamentalGrade.replace(/.*"25%">/,'');
                    NavellierFundamentalGrade = NavellierFundamentalGrade.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierFundamentalGrade = NavellierFundamentalGrade;

                    console.log('NavellierFundamentalGrade: ' + NavellierFundamentalGrade);
                  } else if (lines[z].match(/Sales Growth:/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierSalesGrowth = lines[z+1];

                    NavellierSalesGrowth = NavellierSalesGrowth.replace(/.*<td>/,'');
                    NavellierSalesGrowth = NavellierSalesGrowth.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierSalesGrowth = NavellierSalesGrowth;

                    console.log('NavellierSalesGrowth: ' + NavellierSalesGrowth);
                  } else if (lines[z].match(/Operating Margin Growth:/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierOperatingMarginGrowth = lines[z+1];

                    NavellierOperatingMarginGrowth = NavellierOperatingMarginGrowth.replace(/.*<td>/,'');
                    NavellierOperatingMarginGrowth = NavellierOperatingMarginGrowth.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierOperatingMarginGrowth = NavellierOperatingMarginGrowth;

                    console.log('NavellierOperatingMarginGrowth: ' + NavellierOperatingMarginGrowth);
                  } else if (lines[z].match(/Earnings Growth:/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierEarningsGrowth = lines[z+1];

                    NavellierEarningsGrowth = NavellierEarningsGrowth.replace(/.*<td>/,'');
                    NavellierEarningsGrowth = NavellierEarningsGrowth.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierEarningsGrowth = NavellierEarningsGrowth;

                    console.log('NavellierEarningsGrowth: ' + NavellierEarningsGrowth);
                  } else if (lines[z].match(/Earnings Momentum:/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierEarningsMomentum = lines[z+1];

                    NavellierEarningsMomentum = NavellierEarningsMomentum.replace(/.*<td>/,'');
                    NavellierEarningsMomentum = NavellierEarningsMomentum.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierEarningsMomentum = NavellierEarningsMomentum;

                    console.log('NavellierEarningsMomentum: ' + NavellierEarningsMomentum);
                  } else if (lines[z].match(/Earnings Surprises:/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierEarningsSurprises = lines[z+1];

                    NavellierEarningsSurprises = NavellierEarningsSurprises.replace(/.*<td>/,'');
                    NavellierEarningsSurprises = NavellierEarningsSurprises.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierEarningsSurprises = NavellierEarningsSurprises;

                    console.log('NavellierEarningsSurprises: ' + NavellierEarningsSurprises);
                  } else if (lines[z].match(/Analyst Earnings Revisions:/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierAnalystEarningsRevisions = lines[z+1];

                    NavellierAnalystEarningsRevisions = NavellierAnalystEarningsRevisions.replace(/.*<td>/,'');
                    NavellierAnalystEarningsRevisions = NavellierAnalystEarningsRevisions.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierAnalystEarningsRevisions = NavellierAnalystEarningsRevisions;

                    console.log('NavellierAnalystEarningsRevisions: ' + NavellierAnalystEarningsRevisions);
                  } else if (lines[z].match(/Cash Flow:/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierCashFlow = lines[z+1];

                    NavellierCashFlow = NavellierCashFlow.replace(/.*<td>/,'');
                    NavellierCashFlow = NavellierCashFlow.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierCashFlow = NavellierCashFlow;

                    console.log('NavellierCashFlow: ' + NavellierCashFlow);
                  } else if (lines[z].match(/Return on Equity:/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierReturnOnEquity = lines[z+1];

                    NavellierReturnOnEquity = NavellierReturnOnEquity.replace(/.*<td>/,'');
                    NavellierReturnOnEquity = NavellierReturnOnEquity.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierReturnOnEquity = NavellierReturnOnEquity;

                    console.log('NavellierReturnOnEquity: ' + NavellierReturnOnEquity);
                  } else if (lines[z].match(/Quantitative Grade:/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierQuantitativeGrade = lines[z+1];

                    NavellierQuantitativeGrade = NavellierQuantitativeGrade.replace(/.*<td>/,'');
                    NavellierQuantitativeGrade = NavellierQuantitativeGrade.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierQuantitativeGrade = NavellierQuantitativeGrade;

                    console.log('NavellierQuantitativeGrade: ' + NavellierQuantitativeGrade);
                  } else if (lines[z].match(/Total Grade:<\/strong>/)) {
                    //console.log(i + ': ' + lines[z]);
                    var NavellierTotalGrade = lines[z];

                    NavellierTotalGrade = NavellierTotalGrade.replace(/.*Total Grade:<\/strong>\s*/,'');
                    NavellierTotalGrade = NavellierTotalGrade.replace(/<\/td>.*/,'');

                    portfolios[i].stocks[x].NavellierTotalGrade = NavellierTotalGrade;

                    console.log('NavellierTotalGrade: ' + NavellierTotalGrade);
                  }
                }
              }
              portfolios[i].save();
            });
            request('http://www.zacks.com/stock/quote/'+portfolios[i].stocks[x].Symbol+'?q='+portfolios[i].stocks[x].Symbol, function (error, response, body) {
              if (!error && response.statusCode === 200) {
                var lines = body.split('\n');
                for (var z = 0; z < lines.length; z+=1) {
                  if (lines[z].match(/<p>Zacks Rank : /)) {
                    //console.log(i + ': ' + lines[z]);
                    var ZacksRating = lines[z];

                    ZacksRating = ZacksRating.replace(/.*<p>Zacks Rank : /,'');
                    ZacksRating = ZacksRating.replace(/-.*/,'');
                    ZacksRating = ZacksRating.replace(/ .*/,'');

                    if (!(ZacksRating.match(/NA/) || ZacksRating.match(/N\/A/))) {
                      portfolios[i].stocks[x].ZacksRating = ZacksRating;
                    }

                    console.log('ZacksRating: ' + ZacksRating);

                    break;
                  }
                }
              }
              portfolios[i].save();
            });
            request('http://www.stockselector.com/ranking.asp?symbol='+portfolios[i].stocks[x].Symbol, function (error, response, body) {
              if (!error && response.statusCode === 200) {
                var lines = body.split('\n');
                for (var z = 0; z < lines.length; z+=1) {
                  if (lines[z].match(/overall rank of/)) {
                    //console.log(i + ': ' + lines[z]);
                    var StockSelectorRating = lines[z];

                    StockSelectorRating = StockSelectorRating.replace(/.*overall rank of <b>/,'');
                    StockSelectorRating = StockSelectorRating.replace(/\ out.*/,'');

                    portfolios[i].stocks[x].StockSelectorRating = StockSelectorRating;

                    console.log('StockSelectorRating: ' + StockSelectorRating);

                    break;
                  }
                }
              }
              portfolios[i].save();
            });

            request('http://quotes.morningstar.com/stock/'+portfolios[i].stocks[x].Symbol+'/s?t='+portfolios[i].stocks[x].Symbol, function (error, response, body) {
              if (!error && response.statusCode === 200) {
                var lines = body.split('\n');
                for (var z = 0; z < lines.length; z+=1) {
                  if (lines[z].match(/r_star/)) {
                    //console.log(i + ': ' + lines[z]);
                    var MorningstarRating = lines[z];

                    MorningstarRating = MorningstarRating.replace(/.*r_star/,'');
                    MorningstarRating = MorningstarRating.replace(/\'.*/,'');

                    if (MorningstarRating === 0 || MorningstarRating === '0') {
                      MorningstarRating = '';
                    }

                    portfolios[i].stocks[x].MorningstarRating = MorningstarRating;

                    console.log('MorningstarRating: ' + MorningstarRating);

                    break;
                  }
                }
              }
              portfolios[i].save();
            });

            request('http://performance.morningstar.com/Performance/stock/price-history.action?&t='+portfolios[i].stocks[x].Symbol+'&region=usa&culture=en-US&cur=&ops=clear&pd=1m&sd=&ed=&freq=m&pg=0&pgsz=20', function (error, response, body) {
              if (!error && response.statusCode === 200) {
                var lines = body.split('\n');
                var Month1 = '';
                var Month2 = '';
                for (var z = 0; z < lines.length; z+=1) {
                  if (lines[z].match(/row_lbl/)) {
                    var close = lines[z + 4];
                    close = close.replace(/.*<td align="right">/, '');
                    close = close.replace(/<\/td>.*/, '');

                    if (Month1 === '') {
                      Month1 = parseFloat(close);
                    } else {
                      Month2 = parseFloat(close);
                    }
                  }
                }

                if (Month1 !== '' && Month2 !== '') {
                  var change = Month1/Month2;

                  if (change <= 0.95) {
                    portfolios[i].stocks[x].PerfMnth = '3';
                  } else if (change >= 1.05) {
                    portfolios[i].stocks[x].PerfMnth = '1';
                  } else {
                    portfolios[i].stocks[x].PerfMnth = '2';
                  }
                  portfolios[i].save();
                }
              }
            });

            request('http://performance.morningstar.com/Performance/stock/price-history.action?&t='+portfolios[i].stocks[x].Symbol+'&region=usa&culture=en-US&cur=&ops=clear&pd=1y&sd=&ed=&freq=a&pg=0&pgsz=20', function (error, response, body) {
              if (!error && response.statusCode === 200) {
                var lines = body.split('\n');
                var Year1 = '';
                var Year2 = '';
                for (var z = 0; z < lines.length; z+=1) {
                  if (lines[z].match(/row_lbl/)) {
                    var close = lines[z + 4];
                    close = close.replace(/.*<td align="right">/, '');
                    close = close.replace(/<\/td>.*/, '');

                    if (Year1 === '') {
                      Year1 = parseFloat(close);
                    } else {
                      Year2 = parseFloat(close);
                    }
                  }
                }

                if (Year1 !== '' && Year2 !== '') {
                  var change = Year1/Year2;
                  if (change <= 1.3) {
                    portfolios[i].stocks[x].Perf = '3';
                  } else if (change >= 1.6) {
                    portfolios[i].stocks[x].Perf = '1';
                  } else {
                    portfolios[i].stocks[x].Perf = '2';
                  }
                  portfolios[i].save();
                }
              }
            });

            request('http://analysisreport.morningstar.com/stock/research?t='+portfolios[i].stocks[x].Symbol+'&region=USA&culture=en-US&productcode=MLE', function (error, response, body) {
              if (!error && response.statusCode === 200) {
                var lines = body.split('\n');
                for (var z = 0; z < lines.length; z+=1) {
                  if (lines[z].match(/c-take/)) {
                    //console.log(i + ': ' + lines[z]);
                    var MorningstarTakeUrl = lines[z];

                    MorningstarTakeUrl = MorningstarTakeUrl.replace(/.*analysisreport.morningstar.com/,'');
                    MorningstarTakeUrl = MorningstarTakeUrl.replace(/".*/,'');

                    MorningstarTakeUrl = 'http://analysisreport.morningstar.com' + MorningstarTakeUrl;

                    request(MorningstarTakeUrl, function (error, response, body) {
                      if (!error && response.statusCode === 200) {
                        var linesTake = body.split('\n');
                        for (var c = 0; c < linesTake.length; c+=1) {
                          if (linesTake[c].match(/^\s*Uncertainty/)) {
                            //console.log(i + ': ' + linesTake[c]);
                            var MorningstarFairValueEstimate = linesTake[c+6];
                            var MorningstarUncertainty = linesTake[c+7];

                            MorningstarFairValueEstimate = MorningstarFairValueEstimate.replace(/.*<td>/,'');
                            MorningstarFairValueEstimate = MorningstarFairValueEstimate.replace(/<span>.*/,'');
                            MorningstarUncertainty = MorningstarUncertainty.replace(/.*<td>/,'');
                            MorningstarUncertainty = MorningstarUncertainty.replace(/<\/td>.*/,'');

                            if (MorningstarFairValueEstimate.match(/&mdash;<\/td>/)) {
                              MorningstarFairValueEstimate = null;
                            }

                            portfolios[i].stocks[x].MorningstarFairValueEstimate = MorningstarFairValueEstimate;
                            portfolios[i].stocks[x].MorningstarUncertainty = MorningstarUncertainty;

                            console.log('MorningstarFairValueEstimate: ' + MorningstarFairValueEstimate);
                            console.log('MorningstarUncertainty: ' + MorningstarUncertainty);
                          } else if (linesTake[c].match(/^\s*Economic Moat/)) {
                            //console.log(i + ': ' + linesTake[c]);
                            var MorningstarConsiderBuy = linesTake[c+4];
                            var MorningstarConsiderSell = linesTake[c+5];
                            var MorningstarEconomicMoat = linesTake[c+6];

                            MorningstarConsiderBuy = MorningstarConsiderBuy.replace(/.*<td>/,'');
                            MorningstarConsiderBuy = MorningstarConsiderBuy.replace(/<span>.*/,'');
                            MorningstarConsiderSell = MorningstarConsiderSell.replace(/.*<td>/,'');
                            MorningstarConsiderSell = MorningstarConsiderSell.replace(/<span>.*/,'');
                            MorningstarEconomicMoat = MorningstarEconomicMoat.replace(/.*<td>/,'');
                            MorningstarEconomicMoat = MorningstarEconomicMoat.replace(/<\/td>.*/,'');

                            if (MorningstarConsiderBuy.match(/&mdash;<\/td>/)) {
                              MorningstarConsiderBuy = null;
                            }
                            if (MorningstarConsiderSell.match(/&mdash;<\/td>/)) {
                              MorningstarConsiderSell = null;
                            }

                            portfolios[i].stocks[x].MorningstarConsiderBuy = MorningstarConsiderBuy;
                            portfolios[i].stocks[x].MorningstarConsiderSell = MorningstarConsiderSell;
                            portfolios[i].stocks[x].MorningstarEconomicMoat = MorningstarEconomicMoat;

                            console.log('MorningstarConsiderBuy: ' + MorningstarConsiderBuy);
                            console.log('MorningstarConsiderSell: ' + MorningstarConsiderSell);
                            console.log('MorningstarEconomicMoat: ' + MorningstarEconomicMoat);
                          } else if (linesTake[c].match(/id="creditStewardship"/)) {
                            var MorningstarCreditRating = '';
                            var MorningstarStewardshipRating = '';
                            if (linesTake[c+1].match(/colspan="3"/)) {
                              MorningstarStewardshipRating = linesTake[c+1];

                              MorningstarStewardshipRating = MorningstarStewardshipRating.replace(/.*colspan="3">/,'');
                              MorningstarStewardshipRating = MorningstarStewardshipRating.replace(/<\/td>.*/,'');
                            } else {
                              MorningstarCreditRating = linesTake[c+1];
                              MorningstarStewardshipRating = linesTake[c+3];

                              MorningstarCreditRating = MorningstarCreditRating.replace(/.*creditRatingCnt">/,'');
                              MorningstarCreditRating = MorningstarCreditRating.replace(/<\/td>.*/,'');
                              MorningstarStewardshipRating = MorningstarStewardshipRating.replace(/.*<td>/,'');
                              MorningstarStewardshipRating = MorningstarStewardshipRating.replace(/<\/td>.*/,'');
                            }

                            portfolios[i].stocks[x].MorningstarCreditRating = MorningstarCreditRating;
                            portfolios[i].stocks[x].MorningstarStewardshipRating = MorningstarStewardshipRating;

                            console.log('MorningstarCreditRating: ' + MorningstarCreditRating);
                            console.log('MorningstarStewardshipRating: ' + MorningstarStewardshipRating);

                          }
                        }
                      }
                      portfolios[i].save();
                    });

                    break;
                  }
                }
              }
              portfolios[i].save();
            });

            request('http://research.investors.com/Services/SiteAjaxService.asmx/GetStockTables?sortcolumn1=comprating&sortcolumn2=&filter=&sortOrder1=DESC&&sortOrder2=DESC&search='+portfolios[i].stocks[x].Symbol, function (error, response, body) {
              if (!error && response.statusCode === 200) {
                var lines = body.split('\n');
                for (var z = 0; z < lines.length; z+=1) {
                  if (lines[z].match(/CompRating/)) {
                    var CompRating = lines[z];

                    CompRating = CompRating.replace(/.*<CompRating>/,'');
                    CompRating = CompRating.replace(/<\/CompRating>.*/,'');

                    portfolios[i].stocks[x].CompRating = CompRating;

                    console.log('CompRating: ' + CompRating);
                  } else if (lines[z].match(/EPSRank/)) {
                    var EPSRating = lines[z];

                    EPSRating = EPSRating.replace(/.*<EPSRank>/,'');
                    EPSRating = EPSRating.replace(/<\/EPSRank>.*/,'');

                    portfolios[i].stocks[x].EPSRating = EPSRating;

                    console.log('EPSRating: ' + EPSRating);
                  } else if (lines[z].match(/RelSt/)) {
                    var RSRating = lines[z];

                    RSRating = RSRating.replace(/.*<RelSt>/,'');
                    RSRating = RSRating.replace(/<\/RelSt>.*/,'');

                    portfolios[i].stocks[x].RSRating = RSRating;

                    console.log('RSRating: ' + RSRating);
                  } else if (lines[z].match(/GrpStr/)) {
                    var IndGrpRelativeStrength = lines[z];

                    IndGrpRelativeStrength = IndGrpRelativeStrength.replace(/.*<GrpStr>/,'');
                    IndGrpRelativeStrength = IndGrpRelativeStrength.replace(/<\/GrpStr>.*/,'');

                    portfolios[i].stocks[x].IndGrpRelativeStrength = IndGrpRelativeStrength;

                    console.log('IndGrpRelativeStrength: ' + IndGrpRelativeStrength);
                  } else if (lines[z].match(/Smr/)) {
                    var SMRRating = lines[z];

                    SMRRating = SMRRating.replace(/.*<Smr>/,'');
                    SMRRating = SMRRating.replace(/<\/Smr>.*/,'');

                    portfolios[i].stocks[x].SMRRating = SMRRating;

                    console.log('SMRRating: ' + SMRRating);
                  } else if (lines[z].match(/AccDis/)) {
                    var AccDisRating = lines[z];

                    AccDisRating = AccDisRating.replace(/.*<AccDis>/,'');
                    AccDisRating = AccDisRating.replace(/<\/AccDis>.*/,'');
                    AccDisRating = AccDisRating.replace(/<AccDis \/>.*/,'');

                    portfolios[i].stocks[x].AccDisRating = AccDisRating;

                    console.log('AccDisRating: ' + AccDisRating);
                  } else if (lines[z].match(/SponRating/)) {
                    var SponRating = lines[z];

                    SponRating = SponRating.replace(/.*<SponRating \/>/,'');
                    SponRating = SponRating.replace(/.*<SponRating>/,'');
                    SponRating = SponRating.replace(/<\/SponRating>.*/,'');

                    portfolios[i].stocks[x].SponRating = SponRating;

                    console.log('SponRating: ' + SponRating);
                  } else if (lines[z].match(/CompDesc/)) {
                    var CompDesc = lines[z];

                    CompDesc = CompDesc.replace(/.*<CompDesc>/,'');
                    CompDesc = CompDesc.replace(/<\/CompDesc>.*/,'');

                    portfolios[i].stocks[x].CompDesc = CompDesc;

                    console.log('CompDesc: ' + CompDesc);
                  }
                }
              }
              portfolios[i].save();
            });

          } (i,x));
        }

      }
    });
  },
  start: false
});
job.start();
