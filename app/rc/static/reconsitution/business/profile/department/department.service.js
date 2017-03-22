/**
 * Created by shmily on 2017/3/14.
 */
app.factory('DepartmentService',['$http','DepartmentUrlSetting','UtilService',function ($http,DepartmentUrlSetting,UtilService) {
    var getDepartments = function(params){
        return $http.get(DepartmentUrlSetting.getDepartments,{
             token : true,
             errorAlert : true,
             params : params,
             effective : 'departments',
             title : '获取部门列表'
        });
    };

    var postDepartments  = function (params) {
        return $http.post(DepartmentUrlSetting.postDepartments,params,{
            token : true,
            title : '创建部门',
            successAlert : true,
            errorAlert : true
        })
    };

    var putDepartments = function (params) {
        var url = UtilService.getFullUrlByRestfulAndParams(DepartmentUrlSetting.putDepartments,params);
        return $http.put(url,params,{
            token : true,
            title : '编辑部门',
            successAlert : true,
            errorAlert : true
        })
    };

    var deleteDepartments = function (departmentId) {
        return $http.delete(DepartmentUrlSetting.deleteDepartments+departmentId,{
            token : true,
            title : '删除部门',
            successAlert : true,
            errorAlert : true
        })
    };

    var getQuota = function (params) {
        return $http.get(DepartmentUrlSetting.getQuota+params.department_id,{
            token : true,
            errorAlert: true,
            title : '获取部门资源配额'
        })
    };

    var putQuota = function (params) {
        return $http.put(DepartmentUrlSetting.putQuota+params.department_id,params,{
            token : true,
            errorAlert : true,
            successAlert : true,
            title : '修改部门资源配额'
        })
    };

    return {
        getDepartments : getDepartments,
        postDepartments : postDepartments,
        putDepartments : putDepartments,
        deleteDepartments : deleteDepartments,
        getQuota :getQuota,
        putQuota : putQuota
    }
}]);

app.factory('DepartmentUrlSetting',[function () {

    return {
        getDepartments : project_url + "/departments",
        postDepartments : project_url + '/departments',
        putDepartments : project_url + '/departments/{departmentId}',
        deleteDepartments : project_url + '/departments/',
        getQuota : project_url + "/quota/",
        putQuota : project_url + '/quota/'
    }
}]);