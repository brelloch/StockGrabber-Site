'use strict';

(function() {
  // Portfolios Controller Spec
  describe('MEAN controllers', function() {
    describe('PortfoliosController', function() {
      // The $resource service augments the response object with methods for updating and deleting the resource.
      // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
      // the responses exactly. To solve the problem, we use a newly-defined toEqualData Jasmine matcher.
      // When the toEqualData matcher compares two objects, it takes only object properties into
      // account and ignores methods.
      beforeEach(function() {
        jasmine.addMatchers({
          toEqualData: function() {
            return {
              compare: function(actual, expected) {
                return {
                  pass: angular.equals(actual, expected)
                };
              }
            };
          }
        });
      });

      beforeEach(function() {
        module('mean');
        module('mean.system');
        module('mean.portfolios');
      });

      // Initialize the controller and a mock scope
      var PortfoliosController,
        scope,
        $httpBackend,
        $stateParams,
        $location;

      // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
      // This allows us to inject a service but then attach it to a variable
      // with the same name as the service.
      beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {

        scope = $rootScope.$new();

        PortfoliosController = $controller('PortfoliosController', {
          $scope: scope
        });

        $stateParams = _$stateParams_;

        $httpBackend = _$httpBackend_;

        $location = _$location_;

      }));

      it('$scope.find() should create an array with at least one portfolio object ' +
        'fetched from XHR', function() {

          // test expected GET request
          $httpBackend.expectGET('portfolios').respond([{
            title: 'An Portfolio about MEAN',
            content: 'MEAN rocks!'
          }]);

          // run controller
          scope.find();
          $httpBackend.flush();

          // test scope value
          expect(scope.portfolios).toEqualData([{
            title: 'An Portfolio about MEAN',
            content: 'MEAN rocks!'
          }]);

        });

      it('$scope.findOne() should create an array with one portfolio object fetched ' +
        'from XHR using a portfolioId URL parameter', function() {
          // fixture URL parament
          $stateParams.portfolioId = '525a8422f6d0f87f0e407a33';

          // fixture response object
          var testPortfolioData = function() {
            return {
              title: 'An Portfolio about MEAN',
              content: 'MEAN rocks!'
            };
          };

          // test expected GET request with response object
          $httpBackend.expectGET(/portfolios\/([0-9a-fA-F]{24})$/).respond(testPortfolioData());

          // run controller
          scope.findOne();
          $httpBackend.flush();

          // test scope value
          expect(scope.portfolio).toEqualData(testPortfolioData());

        });

      it('$scope.create() with valid form data should send a POST request ' +
        'with the form input values and then ' +
        'locate to new object URL', function() {

          // fixture expected POST data
          var postPortfolioData = function() {
            return {
              title: 'An Portfolio about MEAN',
              content: 'MEAN rocks!'
            };
          };

          // fixture expected response data
          var responsePortfolioData = function() {
            return {
              _id: '525cf20451979dea2c000001',
              title: 'An Portfolio about MEAN',
              content: 'MEAN rocks!'
            };
          };

          // fixture mock form input values
          scope.title = 'An Portfolio about MEAN';
          scope.content = 'MEAN rocks!';

          // test post request is sent
          $httpBackend.expectPOST('portfolios', postPortfolioData()).respond(responsePortfolioData());

          // Run controller
          scope.create(true);
          $httpBackend.flush();

          // test form input(s) are reset
          expect(scope.title).toEqual('');
          expect(scope.content).toEqual('');

          // test URL location to new object
          expect($location.path()).toBe('/portfolios/' + responsePortfolioData()._id);
        });

      it('$scope.update(true) should update a valid portfolio', inject(function(Portfolios) {

        // fixture rideshare
        var putPortfolioData = function() {
          return {
            _id: '525a8422f6d0f87f0e407a33',
            title: 'An Portfolio about MEAN',
            to: 'MEAN is great!'
          };
        };

        // mock portfolio object from form
        var portfolio = new Portfolios(putPortfolioData());

        // mock portfolio in scope
        scope.portfolio = portfolio;

        // test PUT happens correctly
        $httpBackend.expectPUT(/portfolios\/([0-9a-fA-F]{24})$/).respond();

        // testing the body data is out for now until an idea for testing the dynamic updated array value is figured out
        //$httpBackend.expectPUT(/portfolios\/([0-9a-fA-F]{24})$/, putPortfolioData()).respond();
        /*
                Error: Expected PUT /portfolios\/([0-9a-fA-F]{24})$/ with different data
                EXPECTED: {"_id":"525a8422f6d0f87f0e407a33","title":"An Portfolio about MEAN","to":"MEAN is great!"}
                GOT:      {"_id":"525a8422f6d0f87f0e407a33","title":"An Portfolio about MEAN","to":"MEAN is great!","updated":[1383534772975]}
                */

        // run controller
        scope.update(true);
        $httpBackend.flush();

        // test URL location to new object
        expect($location.path()).toBe('/portfolios/' + putPortfolioData()._id);

      }));

      it('$scope.remove() should send a DELETE request with a valid portfolioId ' +
        'and remove the portfolio from the scope', inject(function(Portfolios) {

          // fixture rideshare
          var portfolio = new Portfolios({
            _id: '525a8422f6d0f87f0e407a33'
          });

          // mock rideshares in scope
          scope.portfolios = [];
          scope.portfolios.push(portfolio);

          // test expected rideshare DELETE request
          $httpBackend.expectDELETE(/portfolios\/([0-9a-fA-F]{24})$/).respond(204);

          // run controller
          scope.remove(portfolio);
          $httpBackend.flush();

          // test after successful delete URL location portfolios list
          //expect($location.path()).toBe('/portfolios');
          expect(scope.portfolios.length).toBe(0);

        }));
    });
  });
}());
