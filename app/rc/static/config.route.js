/**
 * Created by shmily on 2017/1/11.
 */

app.config(['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'JS_REQUIRES',
    function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, JS_REQUIRES){
        app.controller = $controllerProvider.register;
        app.directive = $compileProvider.directive;
        app.filter = $filterProvider.register;
        app.factory = $provide.factory;
        app.service = $provide.service;
        app.constant = $provide.constant;
        app.value = $provide.value;

         // LAZY MODULES
        $ocLazyLoadProvider.config({
            debug: false,
            modules: JS_REQUIRES
        });

        $urlRouterProvider.otherwise("/app/overview");
         $stateProvider.state('app',{
            url: "/app",
            templateUrl: 'main_v2.html',
            controller : 'MainController',
            resolve : LoadModules(['app','app.user']),
            ncyBreadcrumb: {
                label: '天玑科技'
            }
         }).state('login',{
            url: "/login",
            templateUrl: 'login.html',
             controller : 'loginController',
             resolve : LoadModules(['login'])
         }).state('app.overview',{
            url : '/overview',
            templateUrl : 'reconsitution/views/overview.html',
            //controller : 'DFDDFDFCongtrl',
            resolve : LoadModules(['app.overview'])
        });
    }]
);



angular.module('infrastructure', []).config(['$stateProvider',function ($stateProvider) {
    $stateProvider.state('app.room',{
            url : '/room',
            templateUrl : 'reconsitution/views/room.html',
            controller : 'roomController',
            resolve : LoadModules(['app.room'])
        }).state('app.cabinet',{
            url : '/cabinet',
            templateUrl : 'reconsitution/views/cabinet.html',
            controller : 'cabinetController',
            resolve : LoadModules(['app.cabinet'])
        });
}]);

angular.module('ComputerResource',[]).config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('app.host',{

        url : '/host',
        templateUrl : 'reconsitution/views/admin_host.html',
        controller : 'hostController',
        resolve : LoadModules(['app.host'])
    }).state('app.hostDetail',{
        url : '/host/:detailId',
        //templateUrl : 'reconsitution/host_details.html',
        templateProvider : ['$http','$q','$stateParams',function ($http,$q,$stateParams) {
            var defer = $q.defer();
            $http.get('../app/host/'+$stateParams.detailId,{
                headers : {
                    'Content-type':'text/html'
                }
            }).success(function (html) {
                defer.resolve(angular.element(html).filter('div#load_content').html());
            }).error(function (msg) {
                defer.reject(msg);
            });
            return defer.promise;
        }],
        controller : 'hostDetailController',
        resolve : LoadModules(['app.hostDetail'])
    }).state('app.server',{
        url : '/server',
        //templateUrl : 'fictitious/server/server.html',
        templateProvider : function ($http,$q) {
            var defer = $q.defer();
            $http.get('../app/server',{
                headers : {
                    'Content-type':'text/html'
                }
            }).success(function (html) {
                defer.resolve(angular.element(html).find('#fictitious_server').html());
            }).error(function (msg) {
                defer.reject(msg);
            });
            return defer.promise;
        },
        controller : 'serverController',
        resolve : LoadModules(['app.server'])
    }).state('app.image',{
        url : '/image',
        templateUrl : 'reconsitution/views/image.html',
        controller : 'imageController',
        resolve : LoadModules(['app.image'])
    }).state('app.keypair',{
        url : '/keypair',
        templateUrl : 'reconsitution/views/keypair.html',
        controller : 'keypairController',
        resolve : LoadModules(['app.keypair'])
    }).state('app.aggregate',{
        url : '/aggregate',
        templateUrl : 'reconsitution/views/aggregate.html',
        resolve : LoadModules(['app.aggregate'])
    });
}]);

angular.module('StorageResource',[]).config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('app.storage',{
        url : '/storage',
        templateUrl : 'reconsitution/views/storage/storage.html',
        controller : 'StorageController',
        resolve : LoadModules(['app.storage'])
    }).state('app.volumeType',{
        url : '/volumeType',
        templateUrl : 'reconsitution/views/storage/volumeType.html',
        resolve : LoadModules(['app.volumeType'])
    }).state('app.volume',{
        url : '/volume',
        //templateUrl : 'reconsitution/storage/volume.html',
        templateProvider : ['$http','$q','$stateParams',function ($http,$q,$stateParams) {
            var defer = $q.defer();
            $http.get('../app/volume',{
                headers : {
                    'Content-type':'text/html'
                }
            }).success(function (html) {
                defer.resolve(angular.element(html).filter('div#load_content').html());
            }).error(function (msg) {
                defer.reject(msg);
            });
            return defer.promise;
        }],
        controller : 'VolumeController',
        resolve : LoadModules(['app.volume'])
    });
}]);

angular.module('NetworkResource',[]).config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('app.network',{
        url : '/network',
        templateUrl : 'reconsitution/views/network/network.html',
        controller : 'NetworkController',
        resolve : LoadModules(['app.network'])
    }).state('app.router',{
        url : '/router',
        templateUrl : 'reconsitution/views/network/router.html',
        controller : 'RouterController',
        resolve : LoadModules(['app.router'])
    }).state('app.security',{
        url : '/security',
        templateUrl : 'reconsitution/views/network/security.html',
        controller : 'SecurityController',
        resolve : LoadModules(['app.security'])
    }).state('app.topo2',{
        url : '/topo',
        templateUrl : 'reconsitution/views/network/topo.html',
        controller : 'Topo2Controller',
        resolve : LoadModules(['app.topo2'])
    }).state('app.network_qos',{
        url : '/network_qos',
        templateUrl : 'reconsitution/views/network/network_qos.html',
        resolve : LoadModules(['app.network_qos'])
    }).state('app.loadbalancers',{
        url : '/loadbalancers',
        templateUrl : 'reconsitution/views/network/loadbalancers.html',
        resolve : LoadModules(['app.loadbalancers'])
    });
}]);

angular.module('Manager',[]).config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('app.tag',{
        url : '/tag',
        templateUrl : 'reconsitution/views/tag.html',
        controller : 'TagController',
        resolve : LoadModules(['app.tag'])
    }).state('app.alarm',{
        url : '/alarm',
        templateUrl : 'reconsitution/views/alarm.html',
        controller : 'AlarmController',
        resolve : LoadModules(['app.alarm'])
    }).state('app.process',{
        url : '/process',
        templateUrl : 'reconsitution/views/process.html',
        controller : 'ProcessController',
        resolve : LoadModules(['app.process'])
    }).state('app.request',{
        url : '/request',
        templateUrl : 'reconsitution/views/request.html',
        controller : 'RequestController',
        resolve : LoadModules(['app.request'])
    }).state('app.flavor',{
        url : '/flavor',
        templateUrl : 'reconsitution/views/flavor.html',
        resolve : LoadModules(['app.flavor'])
    });
}]);

var cfgModule =  angular.module('Configuration',[]).config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('app.user',{
        url : '/user',
        templateUrl : 'reconsitution/business/profile/user/user.html',
        controller : 'UserController',
        resolve : LoadModules(['app.user','app.department','app.roles'],'user'),
        ncyBreadcrumb: {
            label: '用户管理'
        }
    }).state('app.department',{
        url : '/department',
        templateUrl : 'reconsitution/business/profile/department/department.html',
        controller : 'DepartmentController',
        resolve : LoadModules(['app.department']),
        ncyBreadcrumb: {
            label: '部门管理'
        }
    }).state('app.roles',{
        url : '/roles',
        templateUrl : 'reconsitution/business/profile/role/roles.html',
        controller : 'RolesController',
        resolve : LoadModules(['app.roles']),
        ncyBreadcrumb: {
            label: '角色管理'
        }
    })
}]);

angular.module('IXpenselt',[]).config(['$stateProvider', function ($stateProvider) {
     $stateProvider.state('app.bill_overview',{
        url : '/bill_overview',
        templateUrl : 'reconsitution/views/bill/overview.html',
        controller : 'Bill_overviewController',
        resolve : LoadModules(['app.bill_overview'])
    }).state('app.bill_record',{
         url : '/bill_record',
         templateUrl : 'reconsitution/views/bill/record.html',
         controller : 'Bill_recordController',
         resolve : LoadModules(['app.bill_record'])
     }).state('app.bill_policy',{
         url : '/bill_policy',
         templateUrl : 'reconsitution/views/bill/policy.html',
         controller : 'Bill_policyController',
         resolve : LoadModules(['app.bill_policy'])
     })
}]);

function LoadModules(js_list,nodeName){
    return{
        PermitStats : ['PermissionVerifyService',function (PermissionVerifyService) {
            if(!nodeName){
                return {};
            }else{
                return PermissionVerifyService.batchPermit(nodeName);
            }
        }],
        load: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(js_list);
        }]
    };
}

function LoadHtml(html){
    return html + "?v=" + global_version;
}

var _JS_REQUIRES = [{
    name : 'app',
    files : [
        'reconsitution/controller/main.js',
        'reconsitution/globalService/originApp.js',
        'reconsitution/globalService/ng-table-extra.service.js'
    ]
},{
    name : 'login',
    files : [
        'plugin/jquery/jquery.validate.min.js',
        'reconsitution/controller/login.js'
    ]
},{
    name: 'app.overview',
    files: [
        'reconsitution/controller/overview.js',
        'plugin/underscore/underscore.js',
        'plugin/echarts3/echarts.min.js',
        'stylesheets/overview.css'
    ]
    },{
    name : 'app.cabinet',
    files : [
        'reconsitution/controller/cabinet.js'
    ]
},{
    name : 'app.room',
    files : [
        'reconsitution/controller/room.js',
        'plugin/echarts3/echarts.min.js',
        'plugin/echarts3/china.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js',
        'plugin/widget/css/common.css',
        ''
    ]
},{
    name : 'app.host',
    files : [
        'reconsitution/controller/admin_host.js'
    ]
},{
    name : 'app.hostDetail',
    files : [
        'reconsitution/controller/host_details.js',
        'plugin/echarts3/echarts.min.js',
        'reconsitution/businessService/host_detail.service.js'
    ]
},{
    name : 'app.server',
    files : [
        'reconsitution/controller/server.js',
        'reconsitution/businessService/server.service.js',
        'stylesheets/server.css',
        'plugin/jstree/jstree.min.js',
        'plugin/is-loading/jquery.isloading.min.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js'
    ]
},{
    name : 'app.image',
    files : [
        'plugin/file-uploader/js/vendor/jquery.ui.widget.js',
        'plugin/file-uploader/js/jquery.iframe-transport.js',
        'plugin/file-uploader/js/jquery.fileupload.js',
        'plugin/is-loading/jquery.isloading.min.js',
        'reconsitution/controller/image.js'
    ]
},{
    name : 'app.keypair',
    files : [
        'plugin/filesaver/FileSaver.js',
        'reconsitution/controller/keypair.js',
        'plugin/underscore/underscore.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js'
    ]
},{
    name : 'app.aggregate',
    files : [
        'reconsitution/controller/aggregate.js',
        'javascripts/function.js',
        'stylesheets/aggregate.css'
    ]
},{
    name : 'app.storage',
    files : [
        'reconsitution/controller/storage/storage.js',
        'plugin/echarts3/echarts.min.js'
    ]
},{
    name : 'app.volumeType',
    files : [
        'reconsitution/controller/storage/volumeType.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js'
    ]
},{
    name : 'app.volume',
    files : [
        'reconsitution/controller/storage/volume.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js'
    ]
},{
    name : 'app.network',
    files : [
        'reconsitution/controller/network/network.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js'
    ]
},{
    name : 'app.router',
    files : [
        'reconsitution/controller/network/router.js'
    ]
},{
    name : 'app.security',
    files : [
        'plugin/bootstrap/js/bootstrap-slider.min.js',
        'reconsitution/controller/network/security.js'
    ]
},{
    name : 'app.topo2',
    files : [
        'reconsitution/controller/network/topo2.js',
        'plugin/networktopology/angular.min.js',
        'plugin/networktopology/horizon2.js',
        'plugin/networktopology/hogan.js',
        'plugin/networktopology/d3.js',
        'plugin/networktopology/horizon.networktopology2.js'
    ]
},{
    name : 'app.network_qos',
    files : [
        'reconsitution/controller/network/network_qos.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js'
    ]
},{
    name : 'app.loadbalancers',
    files : [
        'reconsitution/controller/network/loadbalancers.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js',
        'https://cdn.bootcss.com/FileSaver.js/2014-11-29/FileSaver.js'

    ]
},{
    name : 'app.tag',
    files : [
        'reconsitution/controller/tag.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js'
    ]
},{
    name : 'app.alarm',
    files : [
        'plugin/bootstrap/js/bootstrap-slider.min.js',
        'plugin/datetimepicker/js/bootstrap-datetimepicker.min.js',
        'plugin/datetimepicker/js/locales/bootstrap-datetimepicker.zh-CN.js',
        'reconsitution/controller/alarm.js'
    ]
},{
    name : 'app.process',
    files : [
        'plugin/bootstrap/js/bootstrap-slider.min.js',
        'reconsitution/controller/process.js',
        'plugin/datetimepicker/js/bootstrap-datetimepicker.min.js',
        'plugin/datetimepicker/js/locales/bootstrap-datetimepicker.zh-CN.js'
    ]
},{
    name : 'app.request',
    files : [
        'plugin/bootstrap/js/bootstrap-slider.min.js',
        'plugin/datetimepicker/js/bootstrap-datetimepicker.min.js',
        'plugin/datetimepicker/js/locales/bootstrap-datetimepicker.zh-CN.js',
        'reconsitution/controller/request.js'
    ]
},{
    name : 'app.flavor',
    files : [
        'reconsitution/controller/flavor.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js'
    ]
},{
    name : 'app.user',
    files : [
        'reconsitution/business/profile/user/user.controller.js',
        'reconsitution/business/profile/user/user.service.js',
        'reconsitution/business/profile/user/user.other.js'
    ]
},{
    name : 'app.department',
    files : [
        'reconsitution/business/profile/department/department.controller.js',
        'reconsitution/business/profile/department/department.service.js'
    ]
},{
    name : 'app.roles',
    files : [
        'reconsitution/business/profile/role/roles.controller.js',
        'reconsitution/business/profile/role/roles.service.js'
    ]
},{
    name : 'app.bill_overview',
    files : [
        'plugin/echarts3/echarts.min.js',
        'plugin/datetimepicker/js/bootstrap-datetimepicker.min.js',
        'plugin/datetimepicker/js/locales/bootstrap-datetimepicker.zh-CN.js',
        'reconsitution/controller/bill_overview.js'
    ]
},{
    name : 'app.bill_record',
    files : [
        'plugin/datetimepicker/js/bootstrap-datetimepicker.min.js',
        'plugin/datetimepicker/js/locales/bootstrap-datetimepicker.zh-CN.js',
        'reconsitution/controller/bill_record.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js'
    ]
},{
    name : 'app.bill_policy',
    files : [
        'reconsitution/controller/bill_policy.js',
        'plugin/bootstrap/js/jqBootstrapValidation.js'
    ]
}];

var global_version = '1.0.0';

for(var i=0;i<_JS_REQUIRES.length;i++){
    for(var j=0;j<_JS_REQUIRES[i].files.length;j++){
        _JS_REQUIRES[i].files[j] += "?v=" + global_version;
    }
}

app.constant('JS_REQUIRES',_JS_REQUIRES);