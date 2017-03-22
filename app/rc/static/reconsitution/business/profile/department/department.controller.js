/**
 * Created by shmily on 2017/3/13.
 */

app.controller('DepartmentController',['$scope','$q','$uibModal','DepartmentService','NgTableParams','NgTableExtraService',function ($scope,$q,$uibModal,DepartmentService,NgTableParams,NgTableExtraService) {

    function reject(msg){
        console.log(msg);
    }

    var initData = function () {
        $scope.data = {
            departments : null,
            search_department_name : '',
            dmTable : new NgTableParams(
            {
                count : 5
            },{
                counts: [5, 10, 25,50,100],
                getData : function (params) {
                    //var defer= $q.defer();
                    //DepartmentService.getDepartments().then(function (e) {
                    //    defer.resolve(e.data.departments);
                    //}, function (error) {
                    //    defer.reject(error);
                    //});
                    //return defer.promise;
                    return NgTableExtraService.getData(params,DepartmentService.getDepartments({name : $scope.data.search_department_name}));
                }
            })
        };
    };
    var initEvent = function () {

    };
    var initAction = function () {
        $scope.action = {
            edit : function (dm,size) {
                var modalInstance = $uibModal.open({
                    templateUrl : 'editDepartmennt.html',
                    controller : 'editDepartmentCtrl',
                    size : size,
                    backdrop:'static',
                    resolve : {
                        dmTable: function(){
                            return $scope.dmTable;
                        },
                        dm : dm
                    }
                });
                modalInstance.result.then(function(list) {
                    $scope.data.dmTable.reload();
                }, function() {

                });
            },
            del : function (dm) {
                DepartmentService.deleteDepartments(dm.id).then(function (e) {
                    $scope.data.dmTable.reload();
                })
            },
            refresh : function () {
                $scope.data.dmTable.reload();
            },
            create : function(size) {
                var modalInstance = $uibModal.open({
                    templateUrl : 'createDepartmennt.html',
                    controller : 'createDepartmentCtrl',
                    size : size,
                    backdrop:'static',
                    resolve : {
                        dmTable: function(){
                            return $scope.dmTable;
                        }
                    }
                });
                modalInstance.result.then(function(list) {
                    $scope.data.dmTable.reload();
                }, function() {

                });
            },
            showQuota : function (dm,size) {
                var modalInstance = $uibModal.open({
                    templateUrl : 'departmentQuota.html',
                    controller : 'ChangeQuotaCtrl',
                    size : size,
                    backdrop:'static',
                    resolve : {
                        dm: function(){
                            return dm;
                        }
                    }
                });
                modalInstance.result.then(function(list) {
                    $scope.data.dmTable.reload();
                }, function() {

                });
            }
        };
    };
    var main = function () {
        initData();
        initEvent();
        initAction();
    };
    main();
}]);
app.controller('createDepartmentCtrl',['$scope','DepartmentService','$uibModalInstance','dmTable',function ($scope,DepartmentService,$uibModalInstance,dmTable) {
    var initData = function () {
        $scope.data = {
            name : '',
            description : ''
        }
    };
    var initAction = function () {
        $scope.action = {
            save: function (form) {
                if(form.$valid){
                    DepartmentService.postDepartments($scope.data).then(function () {
                        $uibModalInstance.close();
                        dmTable.reload();
                    });
                }
            },
            cancel : function () {
                $uibModalInstance.dismiss('cancel');
            }
        };
    };

    initData();
    initAction();
}]);
app.controller('editDepartmentCtrl',['$scope','$uibModalInstance','DepartmentService','dm',function ($scope,$uibModalInstance,DepartmentService,dm) {
    var initData = function () {
        $scope.data = {
            name : dm.name,
            description : dm.description,
            departmentId : dm.id
        }
    };
    var initAction = function () {
        $scope.action = {
            save: function (form) {
                if(form.$valid){
                    DepartmentService.putDepartments($scope.data).then(function () {
                        $uibModalInstance.close();
                    });
                }
            },
            cancel : function () {
                $uibModalInstance.dismiss('cancel');
            }
        };
    };

    initData();
    initAction();
}]);
app.controller('ChangeQuotaCtrl',['$scope','DepartmentService','$uibModalInstance','dm',function ($scope,DepartmentService,$uibModalInstance,dm) {
    $scope.__initData = function () {
        $scope.data = {
            quota : null
        }
    };
    $scope.__initAction = function () {
        $scope.action = {
            cancel : function () {
                $uibModalInstance.dismiss('cancel');
            },
            save : function () {
                DepartmentService.putQuota(angular.extend({department_id : dm.id},$scope.data.quota)).then(function (e) {
                    $uibModalInstance.close();
                });
            }
        }
    };
    $scope.__stepGetQuota = function () {
        DepartmentService.getQuota({
            department_id : dm.id
        }).then(function (e) {
            $scope.data.quota = e.data.quota;
        });
    };
    $scope.__initData();
    $scope.__initAction();
    $scope.__stepGetQuota();

}]);