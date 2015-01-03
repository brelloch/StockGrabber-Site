'use strict';

//Portfolios service used for portfolios REST endpoint
angular.module('mean.portfolios').factory('Portfolios', ['$resource',
  function($resource) {
    return $resource('portfolios/:portfolioId', {
      portfolioId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
