'use strict';

angular.module('mean.portfolios').controller('PortfoliosController', ['$scope', '$stateParams', '$location', '$filter',  'Global', 'Portfolios', 'ngTableParams',
  function($scope, $stateParams, $location, $filter, Global, Portfolios, ngTableParams) {
    $scope.global = Global;

    $scope.showHidden = false;

    $scope.hasAuthorization = function(portfolio) {
      if (!portfolio || !portfolio.user) return false;
      return $scope.global.isAdmin || portfolio.user._id === $scope.global.user._id;
    };

    $scope.create = function(isValid) {
      if (isValid) {
        var portfolio = new Portfolios({
          title: this.title,
          content: this.content
        });
        portfolio.$save(function(response) {
          $location.path('portfolios/' + response._id);
        });

        this.title = '';
        this.content = '';
      } else {
        $scope.submitted = true;
      }
    };

    $scope.remove = function(portfolio) {
      if (portfolio) {
        portfolio.$remove(function(response) {
          for (var i in $scope.portfolios) {
            if ($scope.portfolios[i] === portfolio) {
              $scope.portfolios.splice(i, 1);
            }
          }
          $location.path('portfolios');
        });
      } else {
        $scope.portfolio.$remove(function(response) {
          $location.path('portfolios');
        });
      }
    };

    $scope.update = function(isValid) {
      if (isValid) {
        var portfolio = $scope.portfolio;
        if (!portfolio.updated) {
          portfolio.updated = [];
        }
        portfolio.updated.push(new Date().getTime());

        portfolio.$update(function() {
          $location.path('portfolios/' + portfolio._id);
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.hideStock = function(stock) {
      for (var i = 0; i < $scope.portfolio.stocks.length; i+= 1) {
        if ($scope.portfolio.stocks[i].Symbol === stock.Symbol) {
          console.log($scope.portfolio.stocks[i].hidden);
          if ($scope.portfolio.stocks[i].hidden === true) {
            $scope.portfolio.stocks[i].hidden = false;
            stock.hidden = false;
          } else {
            $scope.portfolio.stocks[i].hidden = true;
            stock.hidden = true;
          }
        }
      }
      $scope.portfolio.stockUpdated = stock.Symbol;
      var portfolio = $scope.portfolio;

      portfolio.$update(function() {
        $location.path('portfolios/' + portfolio._id);
      });
    };

    $scope.find = function() {
      Portfolios.query(function(portfolios) {
        $scope.portfolios = portfolios;
      });
    };

    $scope.navellierLetterToVal = function(letter) {
      if (letter === 'A') {
        return 5;
      } else if (letter === 'B') {
        return 4;
      } else if (letter === 'C') {
        return 3;
      } else if (letter === 'D') {
        return 2;
      } else if (letter === 'F') {
        return 1;
      } else {
        return 0;
      }
    };

    $scope.idbLetterToVal = function(letter) {
      if (letter === 'A+') {
        return 100;
      } else if (letter === 'A') {
        return 90;
      } else if (letter === 'A-') {
        return 80;
      } else if (letter === 'B+') {
        return 70;
      } else if (letter === 'B') {
        return 60;
      } else if (letter === 'B-') {
        return 50;
      } else if (letter === 'C+') {
        return 40;
      } else if (letter === 'C') {
        return 30;
      } else if (letter === 'C-') {
        return 20;
      } else if (letter === 'D+') {
        return 10;
      } else if (letter === 'D') {
        return 0;
      } else if (letter === 'D-') {
        return -10;
      } else if (letter === 'E') {
        return -20;
      } else {
        return 0;
      }
    };

    $scope.topNavllierToNum = function(letter) {
      if (letter === 'A') {
        return 2;
      } else if (letter === 'B') {
        return 1;
      } else  {
        return 0;
      }
    };

    $scope.topStreetToNum = function(letter) {
      if (letter === 'A+') {
        return 10;
      } else if (letter === 'A') {
        return 9;
      } else if (letter === 'A-') {
        return 8;
      } else if (letter === 'B+') {
        return 6;
      } else if (letter === 'B') {
        return 5;
      } else if (letter === 'B-') {
        return 4;
      } else if (letter === 'C+') {
        return 2;
      } else if (letter === 'C') {
        return 1;
      } else if (letter === 'C-') {
        return 0;
      } else  {
        return 0;
      }
    };

    $scope.topMeanRecommendation = function (rating) {
      if (rating === 0) {
        return 0;
      } else if (rating < 1.5) {
        return 10;
      } else if (rating < 2) {
        return 7;
      } else if (rating < 2.5) {
        return 4;
      } else if (rating < 3) {
        return 1;
      } else {
        return 0;
      }
    };

    $scope.topZacks = function (rating) {
      if (rating === 1) {
        return 10;
      } else if (rating < 2) {
        return 7;
      } else if (rating < 3) {
        return 4;
      } else if (rating < 4) {
        return 1;
      } else {
        return 0;
      }
    };

    $scope.topMorningStarRisk = function (risk) {
      if (risk === 'Low') {
        return 2;
      } else if (risk === 'Medium') {
        return 1;
      } else {
        return 0;
      }
    };

    $scope.topMorningstarEconomicMoat = function (moat) {
      if (moat === 'Wide') {
        return 2;
      } else {
        return 0;
      }
    };

    $scope.topMorningstarStewardshipRating = function (rating) {
      if (rating === 'Exemplary') {
        return 2;
      } else if (rating === 'Standard') {
        return 1;
      } else {
        return 0;
      }
    };

    $scope.topPerf = function (perf) {
      if (perf === 1) {
        return 4;
      } else if (perf === 2) {
        return 2;
      } else {
        return 0;
      }
    };

    $scope.topStockSelectorRating = function (rating) {
      if (rating) {
        return (((7466-rating)/7466)*10);
      } else {
        return 0;
      }
    };

    $scope.topMorningstarRating = function (rating) {
      if (rating) {
        return rating;
      } else {
        return 0;
      }
    };

    $scope.findOne = function() {
      Portfolios.get({
        portfolioId: $stateParams.portfolioId
      }, function(portfolio) {
        $scope.portfolio = portfolio;

        for (var i = 0; i < portfolio.stocks.length; i+=1) {
          portfolio.stocks[i].Scr = $scope.navellierLetterToVal(portfolio.stocks[i].NavellierTotalGrade) +
                                    $scope.navellierLetterToVal(portfolio.stocks[i].NavellierQuantitativeGrade) +
                                    $scope.navellierLetterToVal(portfolio.stocks[i].NavellierFundamentalGrade) +
                                    $scope.navellierLetterToVal(portfolio.stocks[i].NavellierSalesGrowth) +
                                    $scope.navellierLetterToVal(portfolio.stocks[i].NavellierOperatingMarginGrowth) +
                                    $scope.navellierLetterToVal(portfolio.stocks[i].NavellierEarningsGrowth) +
                                    $scope.navellierLetterToVal(portfolio.stocks[i].NavellierEarningsMomentum) +
                                    $scope.navellierLetterToVal(portfolio.stocks[i].NavellierEarningsSurprises) +
                                    $scope.navellierLetterToVal(portfolio.stocks[i].NavellierAnalystEarningsRevisions) +
                                    $scope.navellierLetterToVal(portfolio.stocks[i].NavellierCashFlow) +
                                    $scope.navellierLetterToVal(portfolio.stocks[i].NavellierReturnOnEquity);

          portfolio.stocks[i].IBDRating = parseFloat($scope.idbLetterToVal(portfolio.stocks[i].IndGrpRelativeStrength)) +
                                          parseFloat($scope.idbLetterToVal(portfolio.stocks[i].SMRRating)) +
                                          parseFloat($scope.idbLetterToVal(portfolio.stocks[i].AccDisRating)) +
                                          parseFloat($scope.idbLetterToVal(portfolio.stocks[i].SponRating)) +
                                          parseFloat(portfolio.stocks[i].CompRating) +
                                          parseFloat(portfolio.stocks[i].EPSRating) +
                                          parseFloat(portfolio.stocks[i].RSRating);

          if (isNaN(portfolio.stocks[i].Scr)) portfolio.stocks[i].Scr = 0;
          if (isNaN(portfolio.stocks[i].IBDRating)) portfolio.stocks[i].IBDRating = 0;

          if (portfolio.stocks[i].OneYrTargetPrice === null) {
            portfolio.stocks[i].PercentBelow = '';
          } else {
            portfolio.stocks[i].PercentBelow = (((portfolio.stocks[i].LastPrice-portfolio.stocks[i].OneYrTargetPrice)/portfolio.stocks[i].OneYrTargetPrice));
            portfolio.stocks[i].PercentBelow = (portfolio.stocks[i].PercentBelow * -100).toFixed(2);
            portfolio.stocks[i].PercentBelow = parseFloat(portfolio.stocks[i].PercentBelow);
          }
          portfolio.stocks[i].FiveYear = 0;
          portfolio.stocks[i].SPRating = 0;

          portfolio.stocks[i].Top = portfolio.stocks[i].FiveYear +
                                    $scope.topNavllierToNum(portfolio.stocks[i].NavellierTotalGrade) +
                                    $scope.topNavllierToNum(portfolio.stocks[i].NavellierQuantitativeGrade) +
                                    $scope.topNavllierToNum(portfolio.stocks[i].NavellierFundamentalGrade) +
                                    $scope.topStreetToNum(portfolio.stocks[i].TheStreetRating) +
                                    $scope.topMeanRecommendation(portfolio.stocks[i].MeanRecommendation) +
                                    (portfolio.stocks[i].SPRating * 2) +
                                    $scope.topZacks(portfolio.stocks[i].ZacksRating) +
                                    $scope.topStockSelectorRating(portfolio.stocks[i].StockSelectorRating) +
                                    $scope.topMorningstarRating(portfolio.stocks[i].MorningstarRating) +
                                    $scope.topMorningStarRisk(portfolio.stocks[i].MorningstarUncertainty) +
                                    $scope.topMorningstarEconomicMoat(portfolio.stocks[i].MorningstarEconomicMoat) +
                                    $scope.topMorningstarStewardshipRating(portfolio.stocks[i].MorningstarStewardshipRating) +
                                    (portfolio.stocks[i].Scr/10) +
                                    $scope.topPerf(portfolio.stocks[i].PerfMnth) +
                                    $scope.topPerf(portfolio.stocks[i].Perf) +
                                    ((portfolio.stocks[i].IBDRating/100)*2);
          portfolio.stocks[i].Top = parseFloat(portfolio.stocks[i].Top.toFixed(2));
        }

        /* jshint ignore:start */
        $scope.tableParams = new ngTableParams({
          page: 1,            // show first page
          count: portfolio.stocks.length,          // count per page
          sorting: {
            MeanRecommendation: 'desc'     // initial sorting
          }
        }, {
          counts: [],
          total: portfolio.stocks.length, // length of data
          getData: function($defer, params) {
            // use build-in angular filter
            var orderedData = params.sorting() ? $filter('orderBy')($scope.portfolio.stocks, params.orderBy()) : $scope.portfolio.stocks;

            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          }
        });
        /* jshint ignore:end */
      });
    };
  }
]);
