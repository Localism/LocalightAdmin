'use strict';

/**
 * @ngdoc service
 * @name angularLocalightApp.locations
 * @description
 * # locations
 * Service in the angularLocalightApp.
 */

//Get all the giftcards, or create one
angular.module('starter.services', ['ngResource'])
  .factory('Accounts', ['$resource', function($resource) {

    return $resource('http://dev.localight.com:3001/admins/:id', {
      id: '@id'
    }, {
      join: {
        method: 'POST',
        params: {
          id: 'join'
        },
        isArray: false
      },
      login: {
        method: 'POST',
        params: {
          id: 'login'
        },
        isArray: false
      }
    });
  }])
  .factory('Transactions', ['$resource', function($resource) {

    return $resource('http://dev.localight.com:3001/transactions/:id', {
      id: '@id'
    }, {
      query: {
        method: 'GET',
        params: {
          id: ''
        },
        isArray: true
      },
      get: {
        method: 'GET',
        params: {
          id: '@id'
        },
        isArray: false
      }
    });
  }])
  .factory('Payout', ['$resource', function($resource) {

    return $resource('http://dev.localight.com:3001/transactions/payouts/:id', {
      id: '@id'
    }, {
      create: {
        method: 'POST',
        params: {
          id: ''
        },
        isArray: false
      },
      query: {
        method: 'GET',
        params: {
          id: ''
        },
        isArray: true
      },
      get: {
        method: 'GET',
        params: {
          id: '@id'
        },
        isArray: false
      }
    });
  }])
  .factory('Users', ['$resource', function($resource) {

    return $resource('http://dev.localight.com:3001/transactions/:id', {
      id: '@id'
    }, {
      query: {
        method: 'GET',
        params: {
          id: ''
        },
        isArray: true
      },
      get: {
        method: 'GET',
        params: {
          id: '@id'
        },
        isArray: false
      }
    });
  }])
  .factory('Promos', ['$resource', function($resource) {

    return $resource('http://dev.localight.com:3001/transactions/:id', {
      id: '@id'
    }, {
      query: {
        method: 'GET',
        params: {
          id: ''
        },
        isArray: true
      },
      get: {
        method: 'GET',
        params: {
          id: '@id'
        },
        isArray: false
      }
    });
  }]);
