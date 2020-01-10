psslai
.controller('TransactionCtrl', ['createModal', 'helper','$timeout','$scope','$rootScope','$window','$state', '$http', 'growlService','processExcelFile','NgTableParams','modalService',
function (createModal, helper, $timeout, $scope,$rootScope,$window,$state, $http, growlService, processExcelFile, NgTableParams, modalService) {
    $scope.form              = {};
    $scope.inventory         = {};
    $scope.unit_list         = [];
    $scope.transaction       = {};
    $scope.transaction.cart_list = [];
    $scope.transaction.total_price = "0.00";
    $scope.transaction.customer = "";

    $scope.OnInit = function(){
        $scope.getUnitList();
        $scope.getCategoryList();
        $scope.getBrandList();
        $scope.getCustomerList();

    }

    $scope.getUnitList = function(){
        $http({
            method  : 'POST',
            headers: {
                'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            url:  baseUrl + '/inventory/getUnitList',
            data  :   JSON.stringify({

            })

        }).then(function successCallback(response) {
            $scope.unit_list = response.data.devMessage;
        }, function errorCallback(response){
        });
    }

    $scope.getCategoryList = function(){
        $http({
            method  : 'POST',
            headers: {
                'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            url:  baseUrl + '/inventory/getCategoryList',
            data  :   JSON.stringify({

            })

        }).then(function successCallback(response) {
            $scope.category_list = response.data.devMessage;
        }, function errorCallback(response){
        });
    }

    $scope.getBrandList = function(){
        $http({
            method  : 'POST',
            headers: {
                'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            url:  baseUrl + '/inventory/getBrandList',
            data  :   JSON.stringify({

            })

        }).then(function successCallback(response) {
            $scope.brand_list = response.data.devMessage;
        }, function errorCallback(response){
        });
    }

    $scope.getInventory = function(){
        $scope.inventoryTable = new NgTableParams({
            sorting : {
                id    :   'desc',    // Column name and sort type
            },
            page    :   1,          // Page number
            count   :   10,         // Record count per page
            },{
                total   :   0,      //  Initial total record count
                getData : function($defer, params) {
                    var page   =    params.page();
                    var count  =    params.count();

                    $http({
                        method  : 'POST',
                        headers: {
                            'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        url:  baseUrl + '/inventory/getInventory',
                        data  :   JSON.stringify({
                            page       : page,
                            count      : count,
                            search     : $scope.inventory_search,
                            orderBy    : params.orderBy()[0]
                        })

                    }).then(function successCallback(response) {
                        $scope.inventoryList = response.data.devMessage.inventoryList == null ? [] : response.data.devMessage.inventoryList;
                        $scope.inventoryTable.total(response.data.total);
                        $defer.resolve($scope.inventoryList);

                        if ($scope.inventoryList == null || $scope.inventoryList.length <= 0) {
                          if($scope.inventoryTable.page() > 1){
                            $scope.lastData = $scope.inventoryTable.page() - 1;
                            $rootScope.customPager($scope, 'inventoryTable', true);
                          }
                        }
                        else {
                          $rootScope.customPager($scope, 'inventoryTable');
                        }
                    }, function errorCallback(response){
                    });
                }
            });
    }

    $scope.pushToArray = function(data){

        if($scope.transaction.cart_list.length==0){
            var tmp = {
                key             : data.key,
                item_name       : data.item_name,
                brand_name      : data.brand_name,
                category_name   : data.category_name,
                price           : data.price,
                qty             : 1,
                total_price     : data.price
            }
            $scope.transaction.cart_list.push(tmp);
        }
        else{
            var updStatus = false;
            angular.forEach($scope.transaction.cart_list,function(e){

                if(parseInt(e.key) == parseInt(data.key)){
                    var tmpComputeTotalPrice = parseFloat(e.price) * (parseInt(e.qty + 1));
                    e.total_price    = tmpComputeTotalPrice.toFixed(2);
                    e.qty            = parseInt(e.qty) + 1;

                    $scope.getCartList();

                    updStatus = true;
                }
            });

            if(updStatus==false){
                var tmp = {
                    key             : data.key,
                    item_name       : data.item_name,
                    brand_name      : data.brand_name,
                    category_name   : data.category_name,
                    price           : data.price,
                    qty             : 1,
                    total_price     : data.price
                }
                $scope.transaction.cart_list.push(tmp);
            }
        }

        $scope.getCartList();

        // console.log("count",$scope.transaction.cart_list.length)

        // console.log("transList",$scope.transaction.cart_list)
    }

    $scope.getCartList = function(){
        $scope.computeTotalPriceOnCart();
        $scope.cartTable = new NgTableParams({
            sorting : {
                id    :   'desc',    // Column name and sort type
            },
            page    :   1,          // Page number
            count   :   10,         // Record count per page
            },{
                total   :   0,      //  Initial total record count
                getData : function($defer, params) {
                    var page   =    params.page();
                    var count  =    params.count();

                    $defer.resolve($scope.transaction.cart_list);

                    if ($scope.transaction.cart_list == null || $scope.transaction.cart_list.length <= 0) {
                        if($scope.cartTable.page() > 1){
                        $scope.lastData = $scope.cartTable.page() - 1;
                        $rootScope.customPager($scope, 'cartTable', true);
                        }
                    }
                    else {
                        $rootScope.customPager($scope, 'cartTable');
                    }

                }
            });
    }

    $scope.computeTotalPriceOnCart = function(){
        var tmpComputeTotalPrice = 0;
        angular.forEach($scope.transaction.cart_list,function(e){
            tmpComputeTotalPrice = parseFloat(tmpComputeTotalPrice) + parseFloat(e.total_price);
        });
        $scope.transaction.total_price = tmpComputeTotalPrice.toFixed(2);
    }

    $scope.transactSales = function(){
        if($scope.transaction.cart_list.length==0){
            growlService.growl("There's no record in cart","warning");

            return;
        }

        var created_by = "";
        if(localStorage.getItem("currentUser")){
            created_by = JSON.parse(localStorage.getItem("currentUser"));
        }

        var id_customer = $scope.transaction.customer  == "" ? null : $scope.transaction.customer;
        var total_price = $scope.transaction.total_price;

        $http({
            method  : 'POST',
            headers: {
                'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            url:  baseUrl + '/transaction/saveToSalesTbl',
            data  :   JSON.stringify({
                id_customer     : id_customer,
                total_price     : total_price,
                created_by      : created_by.user_id,
                salesDetails    : $scope.transaction.cart_list
            })

        }).then(function successCallback(response) {
            growlService.growl("Transaction Complete.","success");
            $scope.getInventory();
            $scope.transaction.cart_list = [];

        }, function errorCallback(response){

        });


    }

    $scope.getCustomerList = function(){
        $http({
            method  : 'POST',
            headers: {
                'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            url:  baseUrl + '/transaction/getCustomerList',
            data  :   JSON.stringify({

            })

        }).then(function successCallback(response) {
            $scope.customer_list = response.data.devMessage;
        }, function errorCallback(response){
        });
    }
}])
