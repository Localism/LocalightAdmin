angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  //Selected items for payouts
  $scope.selectedItems = {};
  $scope.selectedItemsLength = 0;
  $scope.getSelectedItems = function(clear){
      if(clear){
          for (var member in $scope.selectedItems) delete $scope.selectedItems[member];
      }
      $scope.selectedItemsLength = 0;
      var keys = Object.keys($scope.selectedItems);
      for(var i=0;i<keys.length;i++){
          if($scope.selectedItems[keys[i]]){
              $scope.selectedItemsLength++;
          }
      }
  }

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('TransactionsCtrl', function($scope, $state, $resource, $location, Transactions, Payout) {

    $scope.filterOptions = {};
    $scope.getTransactions = function(){
        var unpaid;
        if($scope.filterOptions.unpaid == true) unpaid = "false";
        $scope.getSelectedItems(true);
        $scope.transactions = Transactions.query({
            paidOut: unpaid,
            created_after: $scope.filterOptions.startDate,
            created_before: $scope.filterOptions.endDate
        });
    }

    $scope.datepickerFrom = {
     titleLabel: 'Title',  //Optional
     todayLabel: 'Today',  //Optional
     closeLabel: 'Close',  //Optional
     setLabel: 'Set',  //Optional
     setButtonType : 'button-assertive',  //Optional
     todayButtonType : 'button-assertive',  //Optional
     closeButtonType : 'button-assertive',  //Optional
     inputDate: new Date(),  //Optional
     mondayFirst: true,  //Optional
     disabledDates: [], //Optional
     weekDaysList: [], //Optional
     monthList: [], //Optional
     templateType: 'popup', //Optional
     showTodayButton: 'true', //Optional
     modalHeaderColor: 'bar-positive', //Optional
     modalFooterColor: 'bar-positive', //Optional
     from: new Date(2012, 8, 2), //Optional
     to: new Date(2018, 8, 25),  //Optional
     callback: function (val) {  //Mandatory
       datepickerFromSelect(val);
     },
     dateFormat: 'dd-MM-yyyy', //Optional
     closeOnSelect: false, //Optional
    };

    var datepickerFromSelect = function (val) {
      if (typeof(val) === 'undefined') {
        console.log('No date selected');
      } else {
        $scope.filterOptions.startDate = val;
        $scope.getTransactions();
      }
    };

    $scope.datepickerTo = {
      titleLabel: 'Title',  //Optional
      todayLabel: 'Today',  //Optional
      closeLabel: 'Close',  //Optional
      setLabel: 'Set',  //Optional
      setButtonType : 'button-assertive',  //Optional
      todayButtonType : 'button-assertive',  //Optional
      closeButtonType : 'button-assertive',  //Optional
      inputDate: new Date(),  //Optional
      mondayFirst: true,  //Optional
      disabledDates: [], //Optional
      weekDaysList: [], //Optional
      monthList: [], //Optional
      templateType: 'popup', //Optional
      showTodayButton: 'true', //Optional
      modalHeaderColor: 'bar-positive', //Optional
      modalFooterColor: 'bar-positive', //Optional
      from: new Date(2012, 8, 2), //Optional
      to: new Date(2018, 8, 25),  //Optional
      callback: function (val) {  //Mandatory
        datepickerToSelect(val);
      },
      dateFormat: 'dd-MM-yyyy', //Optional
      closeOnSelect: false, //Optional
    };

    var datepickerToSelect = function (val) {
       if (typeof(val) === 'undefined') {
         console.log('No date selected');
       } else {
           $scope.filterOptions.endDate = val;
           $scope.getTransactions();
       }
     };


     $scope.selectAll = function(){
        for(var i=0;i<$scope.transactions.length;i++){
            $scope.selectedItems[$scope.transactions[i]._id] = true;
        }
        $scope.getSelectedItems();
     }
     $scope.isPaid = function(paidOut){
         return paidOut;
     }

     $scope.initiatePayout = function(){
         var payout = [];
         for(var i=0;i<$scope.transactions.length;i++){
             if($scope.selectedItems[$scope.transactions[i]._id]){
                 payout.push($scope.transactions[i]._id);
             }
         }

         var payload = {
             transactions: payout,
             method: "check"
         }

        Payout.create(payload, function(payout){
            console.log(payout);
            $state.go('app.payout', {payoutId: payout._id});
        }, function(err){
            //Error
        });

         //Should empty the selected Items array here
     }
     $scope.goToTransaction = function(transactionId){
         $state.go('app.transaction', {transactionId: transactionId});
     }
})

.controller('TransactionCtrl', function($scope, $stateParams, Transactions) {
    $scope.transaction = Transactions.get({
        id: $stateParams.transactionId
    }, function(result){
        console.log(result);
    })
})



.controller('PayoutsCtrl', function($scope, $state, $resource, $location, Transactions, Payout) {
    $scope.goToPayout = function(payoutId){
        $state.go('app.payout', {payoutId: payoutId});
    }
    $scope.payouts = Payout.query();
    console.log($scope.payouts);

})

.controller('PayoutCtrl', function($scope, $state, $stateParams, $resource, $location, Transactions, Payout) {
    $scope.goToTransaction = function(transactionId){
        $state.go('app.transaction', {transactionId: transactionId});
    }
    $scope.groups = [];
    $scope.toggleGroup = function(group) {
        group.show = !group.show;
    };
    $scope.isGroupShown = function(group) {
        return group.show;
    };
    $scope.payout = Payout.get({
        id: $stateParams.payoutId
    }, function(payout){
        for (var i=0; i<payout.locations.length; i++) {
            $scope.groups[i] = {
                name: payout.locations[i].location.name + " - $" + payout.locations[i].amount,
                items: [],
                show: false
            }
            for(var j=0; j<payout.transactions.length; j++){
                if(payout.transactions[j].locationId._id == payout.locations[i].location._id){
                    $scope.groups[i].items.push({
                        title: "Transaction for $" + payout.transactions[j].amount + " on " + payout.transactions[j].created,
                        id: payout.transactions[j]._id
                    });
                }
            }
        }
    });

});
