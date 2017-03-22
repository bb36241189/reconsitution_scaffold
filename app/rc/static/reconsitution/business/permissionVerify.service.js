/**
 * Created by shmily on 2017/3/16.
 */

app.factory('PermissionVerifyService',['$q','UserService','RolesClassFactory','TreeNodeUtil',function ($q,UserService,RolesClassFactory,TreeNodeUtil) {
    var PermissionClass;
    (PermissionClass = function () {
        this.__permissionTree  = null;
        this.__permissionTimestap = null;
        this.__permisstionOvertime = 60;//ms
    }).prototype = {
        /**
         * 判断是否有权限
         * @param permName
         * @returns {*}
         */
        isPermit : function (permName) {
            var ret = false,defer = $q.defer(),self = this;
            this.getPermisstion().then(function () {
                TreeNodeUtil.traverseNode(self.__permissionTree, function (node) {
                    if(node.name == permName){
                        ret = true;
                    }
                });
                return ret;
            }).then(function (prevRet) {
                defer.resolve(prevRet);
            });
            return defer.promise;
        },
        /**
         * public
         * 批量查看
         * @param nodeName
         * @returns {*}
         */
        batchPermit : function (nodeName) {
            var retObj = {},promiseList = [],defer = $q.defer(),
                treeNode,self = this;
            this.isPermit(nodeName).then(function (hasPermit) {
                if(hasPermit){
                    treeNode = self.__permissionTree.getTreeNodeByName(nodeName);
                    TreeNodeUtil.traverseNode(treeNode, function (cnode) {
                        promiseList.push(self.isPermit(cnode.name).then(function (ret) {
                            retObj[cnode.name] = ret;
                        }));
                    });
                    $q.all(promiseList).then(function () {
                        defer.resolve(retObj);
                    }, function (error) {
                        defer.reject(error);
                    });
                }else{
                    defer.resolve({});
                }
            });

            return defer.promise;
        },
        /**
         * private 私有方法，远程获取权限
         * @returns {*}
         * @private
         */
        __getPermisstionRemote : function () {
            var defer = $q.defer(),self = this;
            UserService.getMenu().then(function (e) {
                self.__permissionTree = new RolesClassFactory.Tree(e.data.permission);
                defer.resolve(self.__permissionTree);
                self.putTimestap();
            }, function (error) {
                defer.reject(error);
            });
            return defer.promise;
        },
        /**
         * public
         * 获取权限
         * @returns {*}
         */
        getPermisstion : function () {
            var defer = $q.defer();
            if(this.__permissionTree && !this.isOvertime()){
                defer.resolve(this.__permissionTree);
            }else{
                this.__getPermisstionRemote().then(function (data) {
                    defer.resolve(data);
                }, function (error) {
                    defer.reject(error);
                });
            }
            return defer.promise;
        },
        /**
         * 时间戳
         */
        putTimestap : function () {
            this.__permissionTimestap = new Date().getTime();
        },
        /**
         * 判断是否过期
         * @returns {boolean}
         */
        isOvertime : function () {
            return new Date().getTime() - this.__permissionTimestap > this.__permisstionOvertime;
        }
    };
    return new PermissionClass();
}]);