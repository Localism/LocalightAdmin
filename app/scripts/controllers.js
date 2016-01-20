angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, Accounts) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};
  // Form data for the register modal
  $scope.regData = {};

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

  $scope.formatDate = function(date){
      return new Date(date).toDateString("en-us", {year: "numeric", month: "short", day: "numeric"});
  }

  // Create the register modal that we will use later
  $ionicModal.fromTemplateUrl('templates/register.html', {
    scope: $scope
  }).then(function(register) {
    $scope.register = register;
  });

  // Triggered in the login modal to close it
  $scope.closeRegister = function() {
    $scope.register.hide();
  };

  // Open the login modal
  $scope.openRegister = function() {
    $scope.register.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doRegister = function() {
      if($scope.regData.password === $scope.regData.confirm){
          Accounts.join($scope.regData, function(data){
              localStorage.setItem("token", data.token);
              $scope.closeRegister();
          }, function(err){
              if(err.status == 401){
                  document.getElementById("kLabel").className += " error";
              } else {
                  console.log(err);
                  alert("There was an error. Please check the console.");
              }
          });
      } else {
          document.getElementById("confirmInput").value = "";
          document.getElementById("confirmInput").focus();
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
  }

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    Accounts.login($scope.loginData, function(data){
        localStorage.setItem("token", data.token);
        $scope.closeLogin();
    }, function(err){
        if(err.status == 401){
            document.getElementById("uLabel").className += " error";
            document.getElementById("pLabel").className += " error";
        } else {
            console.log(err);
            alert("There was an error. Please check the console.");
        }
    });
  }

  if(localStorage.token){
      $scope.loggedIn = localStorage.token;
  } else {
      $scope.loggedIn = false;
      $timeout(function(){
          $scope.login();
      }, 400);
  }
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
            created_before: $scope.filterOptions.endDate,
            sessionToken: $scope.loggedIn
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
            if(!$scope.transactions[i].paidOut){
                $scope.selectedItems[$scope.transactions[i]._id] = true;
            }
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
        id: $stateParams.transactionId,
        sessionToken: $scope.loggedIn
    }, function(result){
        console.log(result);
    });
})

.controller('PayoutsCtrl', function($scope, $state, $resource, $location, Transactions, Payout) {
    $scope.goToPayout = function(payoutId){
        $state.go('app.payout', {payoutId: payoutId});
    }
    $scope.payouts = Payout.query();
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

})

.controller('UserStatsCtrl', function($scope, Promos){

      //Initialization
      $scope.stats = [];
      $scope.getStats = function(){
          //exampleCode
        //   var unpaid;
        //   if($scope.filterOptions.unpaid == true) unpaid = "false";
        //   $scope.getSelectedItems(true);
        //   $scope.transactions = Transactions.query({
        //       paidOut: unpaid,
        //       created_after: $scope.filterOptions.startDate,
        //       created_before: $scope.filterOptions.endDate,
        //       sessionToken: $scope.loggedIn
        //   });
      }
      $scope.getStats();

      $scope.promoCodes= [];
      $scope.getPromos = function(){

          //Create our payload to query our promo codes
          var payload = {
              sessionToken: $scope.loggedIn
          };

          Promos.query(payload, function() {

          },
          //Error
          function() {
              
          })
      }
      $scope.getPromos();

      //Naviagation
      $scope.goToPromo = function(promoId){
          $state.go('app.promoStats', {promoId: promoId});
      }

      $scope.goToUsers = function(){
          $state.go('app.userStats');
      }

      //Graphing
      $scope.exampleData = [
        {
            "key": "Series 1",
            "values": [ [ 1025409600000 , 0] , [ 1028088000000 , -6.3382185140371] , [ 1030766400000 , -5.9507873460847] , [ 1033358400000 , -11.569146943813] , [ 1036040400000 , -5.4767332317425] , [ 1038632400000 , 0.50794682203014] , [ 1041310800000 , -5.5310285460542] , [ 1043989200000 , -5.7838296963382] , [ 1046408400000 , -7.3249341615649] , [ 1049086800000 , -6.7078630712489] , [ 1051675200000 , 0.44227126150934] , [ 1054353600000 , 7.2481659343222] , [ 1056945600000 , 9.2512381306992] , [ 1059624000000 , 11.341210982529] , [ 1062302400000 , 14.734820409020] , [ 1064894400000 , 12.387148007542] , [ 1067576400000 , 18.436471461827] , [ 1070168400000 , 19.830742266977] , [ 1072846800000 , 22.643205829887] , [ 1075525200000 , 26.743156781239] , [ 1078030800000 , 29.597478802228] , [ 1080709200000 , 30.831697585341] , [ 1083297600000 , 28.054068024708] , [ 1085976000000 , 29.294079423832] , [ 1088568000000 , 30.269264061274] , [ 1091246400000 , 24.934526898906] , [ 1093924800000 , 24.265982759406] , [ 1096516800000 , 27.217794897473] , [ 1099195200000 , 30.802601992077] , [ 1101790800000 , 36.331003758254] , [ 1104469200000 , 43.142498700060] , [ 1107147600000 , 40.558263931958] , [ 1109566800000 , 42.543622385800] , [ 1112245200000 , 41.683584710331] , [ 1114833600000 , 36.375367302328] , [ 1117512000000 , 40.719688980730] , [ 1120104000000 , 43.897963036919] , [ 1122782400000 , 49.797033975368] , [ 1125460800000 , 47.085993935989] , [ 1128052800000 , 46.601972859745] , [ 1130734800000 , 41.567784572762] , [ 1133326800000 , 47.296923737245] , [ 1136005200000 , 47.642969612080] , [ 1138683600000 , 50.781515820954] , [ 1141102800000 , 52.600229204305] , [ 1143781200000 , 55.599684490628] , [ 1146369600000 , 57.920388436633] , [ 1149048000000 , 53.503593218971] , [ 1151640000000 , 53.522973979964] , [ 1154318400000 , 49.846822298548] , [ 1156996800000 , 54.721341614650] , [ 1159588800000 , 58.186236223191] , [ 1162270800000 , 63.908065540997] , [ 1164862800000 , 69.767285129367] , [ 1167541200000 , 72.534013373592] , [ 1170219600000 , 77.991819436573] , [ 1172638800000 , 78.143584404990] , [ 1175313600000 , 83.702398665233] , [ 1177905600000 , 91.140859312418] , [ 1180584000000 , 98.590960607028] , [ 1183176000000 , 96.245634754228] , [ 1185854400000 , 92.326364432615] , [ 1188532800000 , 97.068765332230] , [ 1191124800000 , 105.81025556260] , [ 1193803200000 , 114.38348777791] , [ 1196398800000 , 103.59604949810] , [ 1199077200000 , 101.72488429307] , [ 1201755600000 , 89.840147735028] , [ 1204261200000 , 86.963597532664] , [ 1206936000000 , 84.075505208491] , [ 1209528000000 , 93.170105645831] , [ 1212206400000 , 103.62838083121] , [ 1214798400000 , 87.458241365091] , [ 1217476800000 , 85.808374141319] , [ 1220155200000 , 93.158054469193] , [ 1222747200000 , 65.973252382360] , [ 1225425600000 , 44.580686638224] , [ 1228021200000 , 36.418977140128] , [ 1230699600000 , 38.727678144761] , [ 1233378000000 , 36.692674173387] , [ 1235797200000 , 30.033022809480] , [ 1238472000000 , 36.707532162718] , [ 1241064000000 , 52.191457688389] , [ 1243742400000 , 56.357883979735] , [ 1246334400000 , 57.629002180305] , [ 1249012800000 , 66.650985790166] , [ 1251691200000 , 70.839243432186] , [ 1254283200000 , 78.731998491499] , [ 1256961600000 , 72.375528540349] , [ 1259557200000 , 81.738387881630] , [ 1262235600000 , 87.539792394232] , [ 1264914000000 , 84.320762662273] , [ 1267333200000 , 90.621278391889] , [ 1270008000000 , 102.47144881651] , [ 1272600000000 , 102.79320353429] , [ 1275278400000 , 90.529736050479] , [ 1277870400000 , 76.580859994531] , [ 1280548800000 , 86.548979376972] , [ 1283227200000 , 81.879653334089] , [ 1285819200000 , 101.72550015956] , [ 1288497600000 , 107.97964852260] , [ 1291093200000 , 106.16240630785] , [ 1293771600000 , 114.84268599533] , [ 1296450000000 , 121.60793322282] , [ 1298869200000 , 133.41437346605] , [ 1301544000000 , 125.46646042904] , [ 1304136000000 , 129.76784954301] , [ 1306814400000 , 128.15798861044] , [ 1309406400000 , 121.92388706072] , [ 1312084800000 , 116.70036100870] , [ 1314763200000 , 88.367701837033] , [ 1317355200000 , 59.159665765725] , [ 1320033600000 , 79.793568139753] , [ 1322629200000 , 75.903834028417] , [ 1325307600000 , 72.704218209157] , [ 1327986000000 , 84.936990804097] , [ 1330491600000 , 93.388148670744]]
        }];
})

.controller('RecentUsersCtrl', function($scope) {



})

.controller('UserByIdCtrl', function($scope) {



})

.controller('PromoCodesCtrl', function($scope) {



});
