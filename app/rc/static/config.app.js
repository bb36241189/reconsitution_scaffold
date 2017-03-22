/**
 * Created by shmily on 2017/1/11.
 */

var app = angular.module('ResourceCenter',[
    'ui.router',
    'infrastructure',
    'ComputerResource',
    'StorageResource',
    'NetworkResource',
    'Manager',
    'Configuration',
    'IXpenselt',
    'oc.lazyLoad',
    'ngCookies',
    "ui.bootstrap",
    "ngTable",
    "ivpusic.cookie",
    'bocModal',
    'ncy-angular-breadcrumb'
]);

app.config(["$interpolateProvider",'$httpProvider',function($interpolateProvider,$httpProvider){
    $interpolateProvider.startSymbol('//');
    $interpolateProvider.endSymbol('//');
    $httpProvider.interceptors.push('HttpInterceptor');
    $httpProvider.interceptors.push('SessionInterceptor');

   // $httpProvider.defaults.transformRequest = function(obj){
   //  var str = [],p;
   //  for(p in obj){
   //    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
   //  }
   //  return str.join("&");
   //};
   //
   //$httpProvider.defaults.headers.post = {
   //     'Content-Type': 'application/x-www-form-urlencoded'
   //}
}]);

app.run(['$rootScope','$cookies','$state','OriginApp',function ($rootScope,$cookies,$state,OriginApp) {
    $rootScope.static_url = function (str) {
        return str + '?v=12345';
    };
    $rootScope.version = '1.0.0';
    $rootScope.user = {};
    $rootScope.user.username = $cookies.get('user_name');
    $rootScope.user.role = $cookies.get('role');
    if(!$rootScope.user.role){
        $state.go('login');
    }
    OriginApp.init();
}]);

//(\s)*(\{\{)(\s)*(static_url)(\()(\")       (\")(\s)*(\))(\s)*(\}\})
