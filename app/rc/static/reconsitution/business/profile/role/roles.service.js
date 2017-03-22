/**
 * Created by shmily on 2017/3/14.
 */

app.factory('rolesService',['RoleUrlSetting','$http',function (RoleUrlSetting,$http) {
         /******************************角色信息相关***********************************/
        return {
            getRoles: function (data) {
                var url = RoleUrlSetting.getRoles;
                var req = {
                    method: "GET",
                    url: url,
                    params : data,
                    effective : 'roles',
                    title : '获取角色列表',
                    token : true,
                    errorAlert : true
                };
                return $http(req);
            },
            postRole: function (data) {
                var req = {
                    method: "POST",
                    url: RoleUrlSetting.postRole,
                    data: data,
                    title : '创建角色',
                    token : true,
                    successAlert : true,
                    errorAlert : true
                };
                return $http(req);
            },
            getRoleDetail: function (roleId, data) {
                var req = {
                    method: "GET",
                    url: RoleUrlSetting.getRoleDetail+roleId,
                    params : data,
                    title : '获取角色详情',
                    token : true,
                    errorAlert : true
                };
                return $http(req);
            },
            getPerAndMenus: function (data) {//获取菜单和权限
                var req = {
                    method: "GET",
                    url: RoleUrlSetting.getPerAndMenus,
                    params : data,
                    token : true,
                    successAlert : true,
                    errorAlert : true
                };
                return $http(req);
            },
            getPermission : function () {
              return $http.get(RoleUrlSetting.getPermission,{
                  title : '获取权限',
                  token : true,
                  errorAlert : true
              })
            },
            updateRole: function (data) {//修改角色
                var req = {
                    method: "PUT",
                    url: RoleUrlSetting.updateRole,
                    data: data,
                    title : '修改角色',
                    token : true,
                    successAlert : true,
                    errorAlert : true
                };
                return $http(req);
            },
            delRole: function (id) {//删除角色
                var req = {
                    method: "DELETE",
                    url: RoleUrlSetting.delRole+id,
                    title : '删除角色',
                    openConfirm : true,
                    token : true,
                    successAlert : true,
                    errorAlert : true
                };
                return $http(req);
            }
            /******************************部门信息相关***********************************/
            //getDeparts: function (data) {
            //    var params = getParms(data);
            //    var url = commonService.getServerAuthUrl("depart", params);
            //    var req = {
            //        method: "GET",
            //        url: url
            //    };
            //    return $http(req);
            //},
            //getDepartModalContent: function (data) {
            //    var url = commonService.getServerAuthUrl("depart", "");
            //    var req = {
            //        method: "POST",
            //        url: url,
            //        data: data
            //    };
            //    return $http(req);
            //},
            //editDepart: function (data) {
            //    var url = commonService.getServerAuthUrl("depart");
            //    var req = {
            //        method: "PUT",
            //        url: url,
            //        data: data
            //    };
            //    return $http(req);
            //},
            //deleteDepart: function (obj) {
            //    var url = commonService.getServerAuthUrl("depart");
            //    var req = {
            //        method: "DELETE",
            //        url: url,
            //        data: obj,
            //        headers: {
            //            'Content-Type': 'application/json'
            //        }
            //    };
            //    return $http(req);
            //}
        }

    }]);

 app.factory('RoleUrlSetting',[function () {
        var project_url = "/rc";
        return {
            getRoles: project_url + '/roles',
            postRole: project_url + '/role',
            getRoleDetail: project_url + '/role/',
            getPerAndMenus: project_url + '/role/load',
            updateRole: project_url + '/role',
            delRole: project_url + '/role/',
            getPermission : project_url + '/permission',
            /******************************部门信息相关***********************************/
            getDeparts: project_url + '/depart',
            getDepartModalContent: project_url + '/depart',
            editDepart: project_url + '/depart',
            deleteDepart: project_url + '/depart'
        }
    }]);