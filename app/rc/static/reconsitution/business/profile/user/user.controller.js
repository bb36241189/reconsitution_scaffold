/**
 * Created by shmily on 2017/3/14.
 */

app.controller('UserController',['$scope','$q','$uibModal','NgTableParams','UserService','PermitStats','NgTableExtraService',
    function ($scope,$q,$uibModal,NgTableParams,UserService,PermitStats,NgTableExtraService) {
    var initData = function () {
        $scope.data = {
            search_user_name : '',
            userTable : new NgTableParams({
                sorting: {user_name:'desc'},
                count : 5
            },{
                counts: [5, 10, 25,50,100],
                getData : function (params) {
                    return NgTableExtraService.getData(params,UserService.getUsers({user_name : $scope.data.search_user_name}));
                }
            }),
            permitStatus : PermitStats
        };
    };
    var initAction = function () {
        $scope.action={
            create : function (size) {
                var modalInstance = $uibModal.open({
                    templateUrl : 'createUser.html',
                    controller : 'CreateUserCtrl',
                    size : size,
                    backdrop:'static',
                    resolve : {
                        userTable: function(){
                            return $scope.data.userTable;
                        }
                    }
                });
                modalInstance.result.then(function(list) {
                    $scope.data.userTable.reload();
                }, function() {

                });
            },
            changePwd : function (user,size) {
                var modalInstance = $uibModal.open({
                    templateUrl : 'changePwd.html',
                    controller : 'ChangePwdCtrl',
                    size : size,
                    backdrop:'static',
                    resolve : {
                        user: function(){
                            return user;
                        }
                    }
                });
            },
            del : function (user) {
                UserService.deleteUsers(user.id).then(function (e) {
                    $scope.data.userTable.reload();
                })
            },
            refresh : function () {
                $scope.data.userTable.reload();
            },
            edit : function (user,size) {
                var modalInstance = $uibModal.open({
                    templateUrl : 'editUser.html',
                    controller : 'EditUserCtrl',
                    size : size,
                    backdrop:'static',
                    resolve : {
                        userTable: function(){
                            return $scope.data.userTable;
                        },
                        user : function () {
                            return user;
                        }
                    }
                });
                modalInstance.result.then(function(list) {
                    $scope.data.userTable.reload();
                }, function() {

                });
            },
            userDetail : function (user,size) {
                var modalInstance = $uibModal.open({
                    templateUrl : 'userDetail.html',
                    controller : 'UserDetailCtrl',
                    size : size,
                    backdrop:'static',
                    resolve : {
                        user :user
                    }
                });
            }
        }
    };
    var initEvent = function () {
        $scope.event = {

        }
    };

    initData();
    initAction();
    initEvent();
}]);

app.controller('CreateUserCtrl',['$scope','$uibModalInstance','DepartmentService','UserService','rolesService','UtilService','userTable',
    function ($scope,$uibModalInstance,DepartmentService,UserService,rolesService,UtilService,userTable) {
    var initData = function () {
        $scope.data = {
            "user_name": "",
            "user_passwd": "",
            "email": "",
            "department_id": null,
            "role_id": null,
            __departments : null,
            __roles : null
        }
    };
    $scope._stepGetDepartments = function () {
        DepartmentService.getDepartments().then(function (e) {
            $scope.data.__departments = e.data;
        });
    };
    $scope._stepGetRoles = function () {
        rolesService.getRoles().then(function (e) {
            $scope.data.__roles = e.data;
        });
    };
    var initAction = function () {
        $scope.action = {
            save : function () {
                UserService.postUsers(UtilService.obj2Params($scope.data)).then(function (e) {
                    userTable.reload();
                     $uibModalInstance.close();
                })
            },
            cancel : function () {
                $uibModalInstance.dismiss('cancel');
            }
        }
    };
    var initEvent = function () {
        $scope.event = {

        }
    };
    initData();
    initAction();
    initEvent();
    $scope._stepGetDepartments();
    $scope._stepGetRoles();
}]);

app.controller('ChangePwdCtrl',['$scope','UserService',function ($scope,UserService) {
    this.initData = function () {
        $scope.data = {
            user_name : $scope.data.__activeUser.user_name,
            user_passwd : ''
        }
    };
    this.initAction = function () {
        $scope.action = {
            save : function () {

            }
        }
    };
    this.initData();
    this.initAction();
}]);

app.controller('EditUserCtrl',['$scope','$uibModalInstance','DepartmentService','UserService','rolesService','UtilService','userTable','user',
    function ($scope,$uibModalInstance,DepartmentService,UserService,rolesService,UtilService,userTable,user) {
    var initData = function () {
        $scope.data = {
            id : user.id,
            "user_name": user.user_name,
            "email": user.email,
            "department_id": user.department_id,
            "role_id": user.role_id,
            __departments : null,
            __roles : null
        }
    };
    $scope._stepGetDepartments = function () {
        DepartmentService.getDepartments().then(function (e) {
            $scope.data.__departments = e.data.departments;
        });
    };
    $scope._stepGetRoles = function () {
        rolesService.getRoles().then(function (e) {
            $scope.data.__roles = e.data.roles;
        });
    };
    var initAction = function () {
        $scope.action = {
            save : function () {
                UserService.putUsers(UtilService.obj2Params($scope.data)).then(function (e) {
                    userTable.reload();
                     $uibModalInstance.close();
                })
            },
            cancel : function () {
                $uibModalInstance.dismiss('cancel');
            }
        }
    };
    var initEvent = function () {
        $scope.event = {

        }
    };
    initData();
    initAction();
    initEvent();
    $scope._stepGetDepartments();
    $scope._stepGetRoles();
}]);

app.controller('UserDetailCtrl',['$scope','$uibModalInstance','DepartmentService','UserService','rolesService','user',function ($scope,$uibModalInstance,DepartmentService,UserService,rolesService,user) {
    var initData = function () {
        $scope.data = {
            user_name : user.user_name,
            email  : user.email,
            department_id : user.department_id,
            role_id : user.role_id,
            __departments : null,
            __roles : null
        }
    };
    $scope._stepGetDepartments = function () {
        DepartmentService.getDepartments().then(function (e) {
            $scope.data.__departments = e.data.departments;
        });
    };
    $scope._stepGetRoles = function () {
        rolesService.getRoles().then(function (e) {
            $scope.data.__roles = e.data.roles;
        });
    };
    var initAction = function () {
        $scope.action = {
            ok : function () {
                $uibModalInstance.close();
            },
            cancel : function () {
                $uibModalInstance.dismiss('cancel');
            }
        }
    };
    initData();
    initAction();
    $scope._stepGetDepartments();
    $scope._stepGetRoles();
}]);

app.controller('ChangePwdCtrl',['$scope','$uibModalInstance','UserService','user',function ($scope,$uibModalInstance,UserService,user) {
    var initData = function () {
        $scope.data = {
            user_name : user.user_name,
            original_passwd : '',
            new_passwd : '',
            re_new_passwd : ''
        }
    };
    var initAction = function () {
        $scope.action = {
            save : function () {
                UserService.changeUserPwd({
                    user_id : user.id,
                    user_name : $scope.data.user_name,
                    original_passwd : $scope.data.original_passwd,
                    new_passwd : $scope.data.new_passwd
                }).then(function (e) {
                    $uibModalInstance.close();
                })
            },
            cancel : function () {
                $uibModalInstance.dismiss('cancel');
            }
        }
    };
    initData();
    initAction();
}]);