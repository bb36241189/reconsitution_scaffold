/**
 * Created by shmily on 2017/3/14.
 */

app.factory('UserService',['$http','UserUrlSetting','UtilService',function ($http,UserUrlSetting,UtilService) {
    var getUsers = function (params) {
        return $http.get(UserUrlSetting.getUsers,{
            token : true,
            params : params,
            errorAlert : true,
            title : '获取用户列表'
        })
    };
    var postUsers = function(params){
        return $http.post(UserUrlSetting.postUsers,params,{
            token : true,
            errorAlert : true,
            successAlert : true,
            title : '创建用户'
        })
    };
    var deleteUsers = function (userId){
        return $http.delete(UserUrlSetting.deleteUsers+userId,{
            token : true,
            errorAlert : true,
            openConfirm : true,
            successAlert : true,
            title : '删除用户'
        })
    };
    var putUsers = function (params) {
        return $http.put(UserUrlSetting.putUsers,params,{
            token : true,
            errorAlert : true,
            successAlert : true,
            title : '编辑用户'
        })
    };
    var getUserIsUnique = function (params) {
        return $http.get(UserUrlSetting.getUserIsUnique,{
            params : params,
            token : true,
            errorAlert : true,
            title : '检查用户是否存才'
        })
    };
    var getMenu = function () {
        return $http.get(UserUrlSetting.getMenu,{
            token : true,
            errorAlert : true,
            title : '获取用户功能菜单'
        })
    };
    var getUserById = function (userId) {
        return $http.get(UserUrlSetting.getUserById+userId,{
            token : true,
            errorAlert : true,
            title : '查看用户信息'
        })
    };
    var changeUserPwd = function (params) {
        var url = UtilService.getFullUrlByRestfulAndParams(UserUrlSetting.changeUserPwd,params);
        return $http.post(url,params,{
            token : true,
            errorAlert : true,
            successAlert : true,
            title : '修改用户密码'
        })
    };
    return {
        getUsers : getUsers,
        postUsers : postUsers,
        putUsers : putUsers,
        deleteUsers : deleteUsers,
        getUserIsUnique : getUserIsUnique,
        getMenu : getMenu,
        getUserById : getUserById,
        changeUserPwd : changeUserPwd
    }
}]);

app.factory('UserUrlSetting',[function () {
    return {
        getUsers : project_url + '/users',
        postUsers : project_url + '/users',
        putUsers : project_url + '/users',
        deleteUsers : project_url + '/users/',
        getUserIsUnique : project_url + '/user',
        getMenu : project_url + '/menu',
        getUserById : project_url + '/users/',
        changeUserPwd : project_url + '/user/{user_id}/password'
    }
}]);