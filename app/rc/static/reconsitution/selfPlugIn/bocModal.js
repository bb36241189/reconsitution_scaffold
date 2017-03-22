/**
 * Created by shmily on 2017/3/17.
 */

var bocModal = angular.module('bocModal',[]);
bocModal.config(['$provide',function ($provide) {
    bocModal.factory = $provide.factory;
}]);

bocModal.factory('_BocModal',['$compile','$rootScope',function ($compile,$rootScope) {
    var __handleInject = function (resolve) {
        var key;
        for(key in resolve){
            (function(k,obj){
                bocModal.factory(k, [function () {
                    return obj[k];
                }])
            })(key,resolve);
        }
    };

    var open = function (config) {
        var templateUrl = config.templateUrl,
            controller = config.controller,
            resolve = config.resolve,
            resultTemplate = '';
        __handleInject(resolve);
        resultTemplate = '<div ng-include="\''+templateUrl+'\'" ng-controller="'+controller+'"></div>';
        var compileFn = $compile(resultTemplate);
                // 传入scope，得到编译好的dom对象(已封装为jqlite对象)
                // 也可以用$scope.$new()创建继承的作用域
                var $dom = compileFn($rootScope.$new());
        $('#modal-template').html(resultTemplate);
    };
    return {
        open : open
    };
}]);