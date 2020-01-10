psslai
.controller('SettingsModuleCtrl', ['createModal', 'helper','$timeout','$scope','$rootScope','$window','$state', '$http', 'growlService','processExcelFile','NgTableParams','modalService',
function (createModal, helper, $timeout, $scope,$rootScope,$window,$state, $http, growlService, processExcelFile, NgTableParams, modalService) {

}])

.controller('CategoryCtrl', ['createModal', 'helper','$timeout','$scope','$rootScope','$window','$state', '$http', 'growlService','processExcelFile','NgTableParams','modalService',
function (createModal, helper, $timeout, $scope,$rootScope,$window,$state, $http, growlService, processExcelFile, NgTableParams, modalService) {
    $scope.form             = {};
    $scope.category         = {};
    
    $scope.open = function(template) {
        modalService.modalInstances(true, 'lg', true, true, 'addModule',$scope);
    };

    $scope.getModules = function(){
        $scope.modulesTable  = new NgTableParams({
            sorting : {
                fullName    :   'asc'   // Column name and sort type
            },
                page    :   1,          // Page number
                count   :   100,         // Record count per page
         },{
            total   :   0,              //  Initial total record count
            getData : function($defer, params) {
                var page   =    params.page();
                var count  =    params.count();

                $http({
                    method  : 'POST',
                    url: baseUrl + '/settings/getModules',
                    headers: {
                        'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    data    :  JSON.stringify({
                        page         : page,
                        count        : count
                        // search       : $scope.servestat_search
                    })
                })
                .then(function successCallback(response) {
                    $scope.modulesList = response.data.devMessage;
                    $scope.modulesTable.total(response.data.totalItems);
                    $defer.resolve($scope.modulesList);

                    if (response.data.devMessage == null || response.data.devMessage.length <= 0) {
                      if($scope.modulesTable.page() > 1){
                        $scope.lastData = $scope.modulesTable.page() - 1;
                        $rootScope.customPager($scope, 'modulesTable', true);
                      }
                    }
                    else {
                      $rootScope.customPager($scope, 'modulesTable');
                    }
                },function errorCallback(response){

                });
            }
        });
    }

    $scope.getCategory = function(){
        $scope.categoryTable = new NgTableParams({
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
                        url:  baseUrl + '/settings/getCategory',
                        data  :   JSON.stringify({
                            page       : page,
                            count      : count,
                            search     : $scope.category_search,
                            orderBy    : params.orderBy()[0]
                        })

                    }).then(function successCallback(response) {
                        $scope.categoryList = response.data.devMessage.categoryList == null ? [] : response.data.devMessage.categoryList;
                        $scope.categoryTable.total(response.data.total);
                        $defer.resolve($scope.categoryList);

                        if ($scope.categoryList == null || $scope.categoryList.length <= 0) {
                          if($scope.categoryTable.page() > 1){
                            $scope.lastData = $scope.categoryTable.page() - 1;
                            $rootScope.customPager($scope, 'categoryTable', true);
                          }
                        }
                        else {
                          $rootScope.customPager($scope, 'categoryTable');
                        }
                    }, function errorCallback(response){
                    });
                }
            });
    }

    $scope.addCategoryForm = function (template) {
        $scope.category = {};
        createModal.modalInstances(true, 'm', 'static', false, $scope.modalContent, 'addCategoryForm', $scope);
        // $scope.form.list = [];
    };

    $scope.addNewCategory = function(){
        var created_by = "";
        if(localStorage.getItem("currentUser")){
            created_by = JSON.parse(localStorage.getItem("currentUser"));
        }

        if($scope.category.category_name == ""){
            swal("Oops","Required Field(s) Missing","warning");
        }
        else{
            console.log(created_by.user_id)
            $http({
                method: "POST",
                url: baseUrl + "/settings/addNewCategory",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: {
                    category_name     : $scope.category.category_name,
                    created_by        : created_by.user_id
                }
            })
            .then(function sucessCallback(response) {
                if(response.data.statusCode == 200){
                    growlService.growl("Record Saved","success");
                    $scope.cancel();
                    $scope.getCategory();
                }
            }, function errorCallback(response) {

            });
        }
    }

    $scope.onDeleteCategory = function (key) {
        swal({
            title: "Are you sure?",
            text: "You're about to delete this record. There's no other way to retrieve this after deleting.",
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: "Yes, Delete It!",
            confirmButtonClass: "btn-success",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function(onConfirm) {
            if(onConfirm){
                // $state.go('login');
                $http({
                        method: "POST",
                        url: baseUrl + "/settings/deleteSpecificCategory",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        data: {
                            key: parseInt(key),
                        }
                    })
                    .then(function successCallback(response) {
                        growlService.growl("Record(s) successfully deleted","success");
                        // setTimeout(function () {
                        //     swal({
                        //         title: "Record has been successfully deleted.",
                        //         type: "success",
                        //         confirmButtonClass: "btn-success",
                        //         confirmButtonText: "OK",
                        //         closeOnConfirm: true
                        //     });
                        // }, 100);

                        $scope.getCategory();

                    },function errorCallback(response){
                        setTimeout(function () {
                            swal({
                                title: response.data.devMessage.devMessage,
                                type: "warning",
                                confirmButtonClass: "btn-success",
                                confirmButtonText: "OK",
                                closeOnConfirm: true
                            });
                        }, 100);
                        //console.log(response.data.devMessage.devMessage);
                        //prompt.error(response.data.devMessage.devMessage);

                    });
            }
        });


    }

    $scope.editCategoryForm = function (data) {
        $scope.category.edit_category_name = data.category_name;
        $scope.category.edit_key           = data.key;
        createModal.modalInstances(true, 'm', 'static', false, $scope.modalContent, 'editCategoryForm', $scope);
        // $scope.form.list = [];
    };

    $scope.updateCategory = function(){
        if($scope.category.edit_category_name == ""){
            swal("Oops","Required Field(s) Missing","warning");
        }
        else{
            $http({
                method: "POST",
                url: baseUrl + "/settings/updateCategory",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: {
                    key           : parseInt($scope.category.edit_key),
                    category_name : $scope.category.edit_category_name
                }
            })
            .then(function successCallback(response) {
                growlService.growl("Record(s) successfully updated","success");
                $scope.cancel();

                $scope.getCategory();

            },function errorCallback(response){
                setTimeout(function () {
                    swal({
                        title: response.data.devMessage.devMessage,
                        type: "warning",
                        confirmButtonClass: "btn-success",
                        confirmButtonText: "OK",
                        closeOnConfirm: true
                    });
                }, 100);
                //console.log(response.data.devMessage.devMessage);
                //prompt.error(response.data.devMessage.devMessage);

            });
        }
    }
}])

.controller('BrandCtrl', ['createModal', 'helper','$timeout','$scope','$rootScope','$window','$state', '$http', 'growlService','processExcelFile','NgTableParams','modalService',
function (createModal, helper, $timeout, $scope,$rootScope,$window,$state, $http, growlService, processExcelFile, NgTableParams, modalService) {
    $scope.form             = {};
    $scope.brand         = {};
    
    $scope.open = function(template) {
        modalService.modalInstances(true, 'lg', true, true, 'addModule',$scope);
    };

    $scope.getModules = function(){
        $scope.modulesTable  = new NgTableParams({
            sorting : {
                fullName    :   'asc'   // Column name and sort type
            },
                page    :   1,          // Page number
                count   :   100,         // Record count per page
         },{
            total   :   0,              //  Initial total record count
            getData : function($defer, params) {
                var page   =    params.page();
                var count  =    params.count();

                $http({
                    method  : 'POST',
                    url: baseUrl + '/settings/getModules',
                    headers: {
                        'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    data    :  JSON.stringify({
                        page         : page,
                        count        : count
                        // search       : $scope.servestat_search
                    })
                })
                .then(function successCallback(response) {
                    $scope.modulesList = response.data.devMessage;
                    $scope.modulesTable.total(response.data.totalItems);
                    $defer.resolve($scope.modulesList);

                    if (response.data.devMessage == null || response.data.devMessage.length <= 0) {
                      if($scope.modulesTable.page() > 1){
                        $scope.lastData = $scope.modulesTable.page() - 1;
                        $rootScope.customPager($scope, 'modulesTable', true);
                      }
                    }
                    else {
                      $rootScope.customPager($scope, 'modulesTable');
                    }
                },function errorCallback(response){

                });
            }
        });
    }

    $scope.getBrand = function(){
        $scope.brandTable = new NgTableParams({
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
                        url:  baseUrl + '/settings/getBrand',
                        data  :   JSON.stringify({
                            page       : page,
                            count      : count,
                            search     : $scope.brand_search,
                            orderBy    : params.orderBy()[0]
                        })

                    }).then(function successCallback(response) {
                        $scope.brandList = response.data.devMessage.brandList == null ? [] : response.data.devMessage.brandList;
                        $scope.brandTable.total(response.data.total);
                        $defer.resolve($scope.brandList);

                        if ($scope.brandList == null || $scope.brandList.length <= 0) {
                          if($scope.brandTable.page() > 1){
                            $scope.lastData = $scope.brandTable.page() - 1;
                            $rootScope.customPager($scope, 'brandTable', true);
                          }
                        }
                        else {
                          $rootScope.customPager($scope, 'brandTable');
                        }
                    }, function errorCallback(response){
                    });
                }
            });
    }

    $scope.addBrandForm = function (template) {
        $scope.brand = {};
        createModal.modalInstances(true, 'm', 'static', false, $scope.modalContent, 'addBrandForm', $scope);
        // $scope.form.list = [];
    };

    $scope.addNewBrand = function(){
        var created_by = "";
        if(localStorage.getItem("currentUser")){
            created_by = JSON.parse(localStorage.getItem("currentUser"));
        }

        if($scope.brand.brand_name == ""){
            swal("Oops","Required Field(s) Missing","warning");
        }
        else{
            console.log(created_by.user_id)
            $http({
                method: "POST",
                url: baseUrl + "/settings/addNewBrand",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: {
                    brand_name        : $scope.brand.brand_name,
                    created_by        : created_by.user_id
                }
            })
            .then(function sucessCallback(response) {
                if(response.data.statusCode == 200){
                    growlService.growl("Record Saved","success");
                    $scope.cancel();
                    $scope.getBrand();
                }
            }, function errorCallback(response) {

            });
        }
    }

    $scope.onDeleteBrand = function (key) {
        swal({
            title: "Are you sure?",
            text: "You're about to delete this record. There's no other way to retrieve this after deleting.",
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: "Yes, Delete It!",
            confirmButtonClass: "btn-success",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function(onConfirm) {
            if(onConfirm){
                // $state.go('login');
                $http({
                        method: "POST",
                        url: baseUrl + "/settings/deleteSpecificBrand",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        data: {
                            key: parseInt(key),
                        }
                    })
                    .then(function successCallback(response) {
                        growlService.growl("Record(s) successfully deleted","success");
                        // setTimeout(function () {
                        //     swal({
                        //         title: "Record has been successfully deleted.",
                        //         type: "success",
                        //         confirmButtonClass: "btn-success",
                        //         confirmButtonText: "OK",
                        //         closeOnConfirm: true
                        //     });
                        // }, 100);

                        $scope.getBrand();

                    },function errorCallback(response){
                        setTimeout(function () {
                            swal({
                                title: response.data.devMessage.devMessage,
                                type: "warning",
                                confirmButtonClass: "btn-success",
                                confirmButtonText: "OK",
                                closeOnConfirm: true
                            });
                        }, 100);
                        //console.log(response.data.devMessage.devMessage);
                        //prompt.error(response.data.devMessage.devMessage);

                    });
            }
        });


    }

    $scope.editBrandForm = function (data) {
        $scope.brand.edit_brand_name = data.brand_name;
        $scope.brand.edit_key           = data.key;
        createModal.modalInstances(true, 'm', 'static', false, $scope.modalContent, 'editBrandForm', $scope);
        // $scope.form.list = [];
    };

    $scope.updateBrand = function(){
        if($scope.brand.edit_brand_name == ""){
            swal("Oops","Required Field(s) Missing","warning");
        }
        else{
            $http({
                method: "POST",
                url: baseUrl + "/settings/updateBrand",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: {
                    key           : parseInt($scope.brand.edit_key),
                    brand_name    : $scope.brand.edit_brand_name
                }
            })
            .then(function successCallback(response) {
                growlService.growl("Record(s) successfully updated","success");
                $scope.cancel();

                $scope.getBrand();

            },function errorCallback(response){
                setTimeout(function () {
                    swal({
                        title: response.data.devMessage.devMessage,
                        type: "warning",
                        confirmButtonClass: "btn-success",
                        confirmButtonText: "OK",
                        closeOnConfirm: true
                    });
                }, 100);
                //console.log(response.data.devMessage.devMessage);
                //prompt.error(response.data.devMessage.devMessage);

            });
        }
    }
}])

.controller('CustomerCtrl', ['createModal', 'helper','$timeout','$scope','$rootScope','$window','$state', '$http', 'growlService','processExcelFile','NgTableParams','modalService',
function (createModal, helper, $timeout, $scope,$rootScope,$window,$state, $http, growlService, processExcelFile, NgTableParams, modalService) {
    $scope.form             = {};
    $scope.customer         = {};
    
    $scope.open = function(template) {
        modalService.modalInstances(true, 'lg', true, true, 'addModule',$scope);
    };

    $scope.getModules = function(){
        $scope.modulesTable  = new NgTableParams({
            sorting : {
                fullName    :   'asc'   // Column name and sort type
            },
                page    :   1,          // Page number
                count   :   100,         // Record count per page
         },{
            total   :   0,              //  Initial total record count
            getData : function($defer, params) {
                var page   =    params.page();
                var count  =    params.count();

                $http({
                    method  : 'POST',
                    url: baseUrl + '/settings/getModules',
                    headers: {
                        'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    data    :  JSON.stringify({
                        page         : page,
                        count        : count
                        // search       : $scope.servestat_search
                    })
                })
                .then(function successCallback(response) {
                    $scope.modulesList = response.data.devMessage;
                    $scope.modulesTable.total(response.data.totalItems);
                    $defer.resolve($scope.modulesList);

                    if (response.data.devMessage == null || response.data.devMessage.length <= 0) {
                      if($scope.modulesTable.page() > 1){
                        $scope.lastData = $scope.modulesTable.page() - 1;
                        $rootScope.customPager($scope, 'modulesTable', true);
                      }
                    }
                    else {
                      $rootScope.customPager($scope, 'modulesTable');
                    }
                },function errorCallback(response){

                });
            }
        });
    }

    $scope.getCustomer = function(){
        $scope.customerTable = new NgTableParams({
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
                        url:  baseUrl + '/settings/getCustomer',
                        data  :   JSON.stringify({
                            page       : page,
                            count      : count,
                            search     : $scope.customer_search,
                            orderBy    : params.orderBy()[0]
                        })

                    }).then(function successCallback(response) {
                        $scope.customerList = response.data.devMessage.customerList == null ? [] : response.data.devMessage.customerList;
                        $scope.customerTable.total(response.data.total);
                        $defer.resolve($scope.customerList);

                        if ($scope.customerList == null || $scope.customerList.length <= 0) {
                          if($scope.customerTable.page() > 1){
                            $scope.lastData = $scope.customerTable.page() - 1;
                            $rootScope.customPager($scope, 'customerTable', true);
                          }
                        }
                        else {
                          $rootScope.customPager($scope, 'customerTable');
                        }
                    }, function errorCallback(response){
                    });
                }
            });
    }

    $scope.addCustomerForm = function (template) {
        $scope.customer = {};
        createModal.modalInstances(true, 'm', 'static', false, $scope.modalContent, 'addCustomerForm', $scope);
        // $scope.form.list = [];
    };

    $scope.addNewCustomer = function(){
        var created_by = "";
        if(localStorage.getItem("currentUser")){
            created_by = JSON.parse(localStorage.getItem("currentUser"));
        }

        if($scope.customer.f_name == "" || $scope.customer.l_name == ""){
            swal("Oops","Required Field(s) Missing","warning");
        }
        else{
            $http({
                method: "POST",
                url: baseUrl + "/settings/addNewCustomer",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: {
                    fname           : $scope.customer.f_name,
                    lname           : $scope.customer.l_name,
                    mname           : $scope.customer.m_name,
                    created_by      : created_by.user_id
                }
            })
            .then(function sucessCallback(response) {
                if(response.data.statusCode == 200){
                    growlService.growl("Record Saved","success");
                    $scope.cancel();
                    $scope.getCustomer();
                }
            }, function errorCallback(response) {

            });
        }
    }

    $scope.onDeleteCustomer = function (key) {
        swal({
            title: "Are you sure?",
            text: "You're about to delete this record. There's no other way to retrieve this after deleting.",
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: "Yes, Delete It!",
            confirmButtonClass: "btn-success",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function(onConfirm) {
            if(onConfirm){
                // $state.go('login');
                $http({
                        method: "POST",
                        url: baseUrl + "/settings/deleteSpecificCustomer",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        data: {
                            key: parseInt(key),
                        }
                    })
                    .then(function successCallback(response) {
                        growlService.growl("Record(s) successfully deleted","success");
                        // setTimeout(function () {
                        //     swal({
                        //         title: "Record has been successfully deleted.",
                        //         type: "success",
                        //         confirmButtonClass: "btn-success",
                        //         confirmButtonText: "OK",
                        //         closeOnConfirm: true
                        //     });
                        // }, 100);

                        $scope.getCustomer();

                    },function errorCallback(response){
                        setTimeout(function () {
                            swal({
                                title: response.data.devMessage.devMessage,
                                type: "warning",
                                confirmButtonClass: "btn-success",
                                confirmButtonText: "OK",
                                closeOnConfirm: true
                            });
                        }, 100);
                        //console.log(response.data.devMessage.devMessage);
                        //prompt.error(response.data.devMessage.devMessage);

                    });
            }
        });


    }

    $scope.editCustomerForm = function (data) {
        $scope.customer.edit_f_name = data.fname;
        $scope.customer.edit_m_name = data.mname;
        $scope.customer.edit_l_name = data.lname;

        $scope.customer.edit_key           = data.key;
        createModal.modalInstances(true, 'm', 'static', false, $scope.modalContent, 'editCustomerForm', $scope);
        // $scope.form.list = [];
    };

    $scope.updateCustomer = function(){
        if($scope.customer.edit_f_name == "" || $scope.customer.edit_l_name == ""){
            swal("Oops","Required Field(s) Missing","warning");
        }
        else{
            $http({
                method: "POST",
                url: baseUrl + "/settings/updateCustomer",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: {
                    key           : parseInt($scope.customer.edit_key),
                    fname         : $scope.customer.edit_f_name,
                    mname         : $scope.customer.edit_m_name,
                    lname         : $scope.customer.edit_l_name
                }
            })
            .then(function successCallback(response) {
                growlService.growl("Record(s) successfully updated","success");
                $scope.cancel();

                $scope.getCustomer();

            },function errorCallback(response){
                setTimeout(function () {
                    swal({
                        title: response.data.devMessage.devMessage,
                        type: "warning",
                        confirmButtonClass: "btn-success",
                        confirmButtonText: "OK",
                        closeOnConfirm: true
                    });
                }, 100);
                //console.log(response.data.devMessage.devMessage);
                //prompt.error(response.data.devMessage.devMessage);

            });
        }
    }
}])

.controller('UnitCtrl', ['createModal', 'helper','$timeout','$scope','$rootScope','$window','$state', '$http', 'growlService','processExcelFile','NgTableParams','modalService',
function (createModal, helper, $timeout, $scope,$rootScope,$window,$state, $http, growlService, processExcelFile, NgTableParams, modalService) {
    $scope.form             = {};
    $scope.unit         = {};
    
    $scope.addUnitForm = function (template) {
        $scope.unit = {};
        createModal.modalInstances(true, 'm', 'static', false, $scope.modalContent, 'addUnitForm', $scope);
        // $scope.form.list = [];
    };

    $scope.addNewUnit = function(){
        var created_by = "";
        if(localStorage.getItem("currentUser")){
            created_by = JSON.parse(localStorage.getItem("currentUser"));
        }

        if($scope.unit.unit_name == ""){
            swal("Oops","Required Field(s) Missing","warning");
        }
        else{
            $http({
                method: "POST",
                url: baseUrl + "/settings/addNewUnit",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: {
                    unit_name        : $scope.unit.unit_name,
                    created_by        : created_by.user_id
                }
            })
            .then(function sucessCallback(response) {
                if(response.data.statusCode == 200){
                    growlService.growl("Record Saved","success");
                    $scope.cancel();
                    $scope.getUnit();
                }
            }, function errorCallback(response) {

            });
        }
    }

    $scope.getModules = function(){
        $scope.modulesTable  = new NgTableParams({
            sorting : {
                fullName    :   'asc'   // Column name and sort type
            },
                page    :   1,          // Page number
                count   :   100,         // Record count per page
         },{
            total   :   0,              //  Initial total record count
            getData : function($defer, params) {
                var page   =    params.page();
                var count  =    params.count();

                $http({
                    method  : 'POST',
                    url: baseUrl + '/settings/getModules',
                    headers: {
                        'Content-Type'  : 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    data    :  JSON.stringify({
                        page         : page,
                        count        : count
                        // search       : $scope.servestat_search
                    })
                })
                .then(function successCallback(response) {
                    $scope.modulesList = response.data.devMessage;
                    $scope.modulesTable.total(response.data.totalItems);
                    $defer.resolve($scope.modulesList);

                    if (response.data.devMessage == null || response.data.devMessage.length <= 0) {
                      if($scope.modulesTable.page() > 1){
                        $scope.lastData = $scope.modulesTable.page() - 1;
                        $rootScope.customPager($scope, 'modulesTable', true);
                      }
                    }
                    else {
                      $rootScope.customPager($scope, 'modulesTable');
                    }
                },function errorCallback(response){

                });
            }
        });
    }

    $scope.getUnit = function(){
        $scope.unitTable = new NgTableParams({
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
                        url:  baseUrl + '/settings/getUnit',
                        data  :   JSON.stringify({
                            page       : page,
                            count      : count,
                            search     : $scope.unit_search,
                            orderBy    : params.orderBy()[0]
                        })

                    }).then(function successCallback(response) {
                        $scope.unitList = response.data.devMessage.unitList == null ? [] : response.data.devMessage.unitList;
                        $scope.unitTable.total(response.data.total);
                        $defer.resolve($scope.unitList);

                        if ($scope.unitList == null || $scope.unitList.length <= 0) {
                          if($scope.unitTable.page() > 1){
                            $scope.lastData = $scope.unitTable.page() - 1;
                            $rootScope.customPager($scope, 'unitTable', true);
                          }
                        }
                        else {
                          $rootScope.customPager($scope, 'unitTable');
                        }
                    }, function errorCallback(response){
                    });
                }
            });
    }

    $scope.onDeleteUnit= function (key) {
        swal({
            title: "Are you sure?",
            text: "You're about to delete this record. There's no other way to retrieve this after deleting.",
            type: "warning",
            showConfirmButton: true,
            confirmButtonText: "Yes, Delete It!",
            confirmButtonClass: "btn-success",
            showCancelButton: true,
            cancelButtonText: "Cancel",
            closeOnConfirm: true,
            closeOnCancel: true
        },
        function(onConfirm) {
            if(onConfirm){
                // $state.go('login');
                $http({
                        method: "POST",
                        url: baseUrl + "/settings/deleteSpecificUnit",
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                        },
                        data: {
                            key: parseInt(key),
                        }
                    })
                    .then(function successCallback(response) {
                        growlService.growl("Record(s) successfully deleted","success");
                        // setTimeout(function () {
                        //     swal({
                        //         title: "Record has been successfully deleted.",
                        //         type: "success",
                        //         confirmButtonClass: "btn-success",
                        //         confirmButtonText: "OK",
                        //         closeOnConfirm: true
                        //     });
                        // }, 100);

                        $scope.getUnit();

                    },function errorCallback(response){
                        setTimeout(function () {
                            swal({
                                title: response.data.devMessage.devMessage,
                                type: "warning",
                                confirmButtonClass: "btn-success",
                                confirmButtonText: "OK",
                                closeOnConfirm: true
                            });
                        }, 100);
                        //console.log(response.data.devMessage.devMessage);
                        //prompt.error(response.data.devMessage.devMessage);

                    });
            }
        });


    }

    $scope.editUnitForm = function (data) {
        $scope.unit.edit_unit_name      = data.unit_name;
        $scope.unit.edit_key           = data.key;
        createModal.modalInstances(true, 'm', 'static', false, $scope.modalContent, 'editUnitForm', $scope);
        // $scope.form.list = [];
    };

    $scope.updateUnit = function(){
        if($scope.unit.edit_unit_name == ""){
            swal("Oops","Required Field(s) Missing","warning");
        }
        else{
            $http({
                method: "POST",
                url: baseUrl + "/settings/updateUnit",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: {
                    key           : parseInt($scope.unit.edit_key),
                    unit_name     : $scope.unit.edit_unit_name
                }
            })
            .then(function successCallback(response) {
                growlService.growl("Record(s) successfully updated","success");
                $scope.cancel();

                $scope.getUnit();

            },function errorCallback(response){
                setTimeout(function () {
                    swal({
                        title: response.data.devMessage.devMessage,
                        type: "warning",
                        confirmButtonClass: "btn-success",
                        confirmButtonText: "OK",
                        closeOnConfirm: true
                    });
                }, 100);
                //console.log(response.data.devMessage.devMessage);
                //prompt.error(response.data.devMessage.devMessage);

            });
        }
    }
}])

.controller('ModalInstanceCtrl', ['$rootScope', '$scope', '$uibModalInstance', 'content',function ($rootScope, $scope, $uibModalInstance, content) {
    $rootScope.modalContent = content;

    $rootScope.ok = function () {
      $uibModalInstance.close();
    };

    $rootScope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
}])

