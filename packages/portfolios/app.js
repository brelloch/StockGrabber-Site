'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Portfolios = new Module('portfolios');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Portfolios.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Portfolios.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Portfolios.menus.add({
    'roles': ['authenticated'],
    'title': 'Portfolios',
    'link': 'all portfolios'
  });

  Portfolios.menus.add({
    'roles': ['authenticated'],
    'title': 'Create New Portfolio',
    'link': 'create portfolio'
  });
  

  //Portfolios.aggregateAsset('js','/packages/system/public/services/menus.js', {group:'footer', absolute:true, weight:-9999});
  //Portfolios.aggregateAsset('js', 'test.js', {group: 'footer', weight: -1});

  /*
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Portfolios.settings({'someSetting':'some value'},function (err, settings) {
      //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Portfolios.settings({'anotherSettings':'some value'});

    // Get settings. Retrieves latest saved settings
    Portfolios.settings(function (err, settings) {
      //you now have the settings object
    });
    */
  Portfolios.aggregateAsset('css', 'portfolios.css');

  return Portfolios;
});
