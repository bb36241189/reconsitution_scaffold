

app .controller("RolesController", ["$rootScope","$scope",'$q', "$stateParams", "$uibModal", "rolesService", "SAlert",'NgTableExtraService', "NgTableParams", "$timeout",
    function($rootScope,$scope,$q, $stateParams, $uibModal, rolesService, SAlert,NgTableExtraService, NgTableParams, $timeout){


        function  reject(msg){
            console.log(msg);
        }

        $scope.initData = function () {
            $scope.data = {
                search_role_name : '',
                roleTable : new NgTableParams({
                    count : 5
                },
                {
                    counts: [5, 10, 25,50,100],
                    getData: function(params){
                        return NgTableExtraService.getData(params,rolesService.getRoles({
                            role_name : $scope.data.search_role_name
                        }));
                    }
                })
            }
        };
        $scope.initAction = function () {
            $scope.action = {
                create : function(size) {
                    var modalInstance = $uibModal.open({
                        templateUrl : 'createNewRoles.html',
                        controller : 'ModalInstanceCreateRoleCtrl',
                        size : size,
                        backdrop:'static',
                        resolve : {
                            list: function(){
                                return $scope;
                            }
                        }
                    });
                    modalInstance.result.then(function(list) {
                        $scope.data.roleTable.reload();
                    }, function() {

                    });
                },
                edit : function(roleId,roleType,size) {
                    var modalInstance = $uibModal.open({
                        templateUrl : 'editRole.html',
                        controller : 'ModalInstanceEditRoleCtrl',
                        size : size,
                        backdrop:'static',
                        resolve : {
                            list: function(){
                                return {
                                    roleId : roleId,
                                    roleType : roleType || 0
                                };
                            }
                        }
                    });
                    modalInstance.result.then(function(list) {
                        $scope.data.roleTable.reload();
                    }, function() {

                    });
                },
                refresh : function () {
                    $scope.data.roleTable.reload();
                },
                del : function(id,name){
                    var service = function(){
                        return rolesService.delRole(id).then(callback,reject);
                    };
                    var callback = function(e){
                        $scope.data.roleTable.reload();
                    };
                    service();
                }
            }
        };
        $scope.initAction();
        $scope.initData();
    }
]);


app.controller('ModalInstanceCreateRoleCtrl', ["$scope", "$uibModalInstance", "list", "rolesService","SAlert",'RolesClassFactory',
    function($scope, $uibModalInstance, list,rolesService,SAlert,RolesClassFactory) {
        $scope.currentStep = 1;
        $scope.form = {};
        $scope.ok = function() {
            $uibModalInstance.close();
        };
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.$on(
            "$destroy",
            function( event ) {

            }
        );
        $scope.roleChange = function (roleType) {
            getTree();
        };
        
        function getTree(){
            return rolesService.getPermission().then(renderTree,reject);
        }
        function renderTree(ret){
            $scope.orginTree = new RolesClassFactory.Tree(ret.data.permission);
            $scope.tree = $scope.orginTree.getFirstLevelNodes();
            $scope.select = {};
        }
        function reject(msg){
            console.log(msg);
        }
        getTree();

         //表单校验
        function  wizard(myForm) {
            for(var field in myForm){
                for(var field in myForm){
                    if (field[0] !== '$'){
                        if (!myForm[field].$valid) {
                            angular.element('.ng-invalid[name=' + myForm[field].$name + ']').focus();
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        $scope.create = function(myForm){
            if(wizard(myForm)){
                var data = angular.copy($scope.form);
                data.name = data.roleName;
                delete data.roleName;
                var permission = $scope.orginTree.getSelectedNodesSimple($scope.select);
                data.permission = permission;
                var service = function(){
                    return rolesService.postRole(data).then(callback,reject);
                };
                var callback = function(e){
                   $uibModalInstance.close();
                };
                service();
            }else{
                console.log('表单校验失败...');
            }
        };

}]);


app.controller('ModalInstanceEditRoleCtrl', ["$scope",'$q',"$uibModalInstance", "list", "rolesService","SAlert",'RolesClassFactory',
    function($scope,$q, $uibModalInstance, list,rolesService,SAlert,RolesClassFactory) {

        $scope.currentStep = 1;

        $scope.ok = function() {
            $uibModalInstance.close();
        };
        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };
        $scope.$on(
            "$destroy",
            function( event ) {

            }
        );
        $scope.roleChange = function (roleType) {
            getTree();
        };


        function requireRoleDetail(roleId){
            var defer = $q.defer();
            function stepGetRoleDetail(){
                rolesService.getRoleDetail(roleId).then(handleResult,reject);
            }
            function handleResult(e){
                if(!e.data.error) {
                    defer.resolve(e.data);
                }else{
                    defer.reject(e.data.error);
                }
            }
            stepGetRoleDetail();
            return defer.promise;
        }

        function reject(msg){
            console.log(msg);
        }
        $scope.form = {};
        function getTree(){
            var tree;
            stepGetPermission();
            function stepGetPermission(){
                return rolesService.getPermission().then(stepInitTreeWithData,reject);
            }

            function stepInitTreeWithData(e){
                tree = new RolesClassFactory.Tree(e.data.permission);
                stepGetRoleDetail();
            }

            function stepGetRoleDetail(){
                requireRoleDetail(list.roleId).then(function (data) {
                    stepSelectedTreeNode(new RolesClassFactory.TreeNode({child : data.permission}).children);
                    $scope.role = data;
                    $scope.select = {};
                    if(data){
                        $scope.roleName = data.name;
                        $scope.form.roleName = data.name;
                    }
                },reject)
            }

            function stepSelectedTreeNode(selectedNodes){
                tree.selectNodes(selectedNodes);
                $scope.orginTree = tree;
                $scope.tree = tree.getTreeWithSeletedStatus();
            }

        }
        getTree();
         //表单校验
        function  wizard(myForm) {
            for(var field in myForm){
                for(var field in myForm){
                    if (field[0] !== '$'){
                        if (!myForm[field].$valid) {
                            angular.element('.ng-invalid[name=' + myForm[field].$name + ']').focus();
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        $scope.update = function(myForm){
            if(wizard(myForm)){
                var data = angular.copy($scope.form);
                data.name = data.roleName;
                delete data.roleName;
                data.role_id = $scope.role.id;
                var permission = $scope.orginTree.getSelectedNodesSimple($scope.select);
                data.permission = permission;
                var service = function(){
                    return rolesService.updateRole(data).then(callback,reject);
                };
                var callback = function(e){
                   $uibModalInstance.close();
                };
                //SAlert.doServiceAndCallback("修改",service,callback);
                service();
            }else{
                console.log('表单校验失败...');
            }
        }
}]);

