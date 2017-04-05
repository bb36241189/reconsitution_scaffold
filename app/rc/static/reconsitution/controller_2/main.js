/**
 * Created by shmily on 2017/2/17.
 */

app.controller('MainController',['$scope','$http','$timeout','$state','_BocModal','UserService','MainClassFactory','MenuHref','MenuIcon',
   function ($scope,$http,$timeout,$state,_BocModal,UserService,MainClassFactory,MenuHref,MenuIcon) {
    var initData = function () {
        $scope.data = {
            permission : null,
            showModal : false,
            menuHref : MenuHref,
            MenuIcon : MenuIcon
        };
        UserService.getMenu().then(function (e) {
            $scope.data.permission = e.data.permission;
        });
    };
    var initAction = function (){
        //$scope.showModal = function (config) {
        //    _BocModal.open(config);
        //    $scope.data.showModal = true;
        //};
        $scope.action = {
            logout : function () {
                UserService.logout().then(function () {
                    $state.go('login');
                    $.cookie("user_id", '');
                    $.cookie("user_name", '');
                    $.cookie("token_id", '');
                    $.cookie("user_id", '',{ path: '/rc' });
                    $.cookie("user_name", '',{ path: '/rc' });
                    $.cookie("token_id", '',{ path: '/rc' });
                });
            }
        };
        $scope.showModal = function () {
            $scope.data.showModal = true;
        };
        $scope.closeModal = function () {
            $scope.data.showModal = false;
        };
    };
    var initEvent = function () {
        $scope.event = {
        };
    };
    initData();
    initAction();
    initEvent();

    //滚动条初始化
    var scroll = new MainClassFactory.CustomScroll();
    $scope.scoller = scroll;
    $scope.$on('$stateChangeSuccess', function () {
        scroll.reload();
        //$timeout(function () {
        //    $('.modal.fade').on('show.bs.modal', function (e) {
        //         //$scope.scoller.reload();
        //        //new MainClassFactory.CustomScroll(e.target).reload();
        //        //$(e.target).mCustomScrollbar({
        //        //    scrollInertia:400,
        //        //    theme:'default-thin'
        //        //});
        //    });
        //    $('.modal.fade').on('hide.bs.modal', function () {
        //        //$scope.scoller.reload();
        //    });
        //});
    });
    scroll.load();
}]);

app.factory('MainClassFactory',[function () {
    var CustomScroll;
    (CustomScroll = function(ele){
        var _this = this;_this.ele=ele?ele:window.document;
        //加載
        _this.load = function(){
            $(_this.ele).find(".scroll").mCustomScrollbar({
                scrollInertia:400,
                theme:'default-thin'
            });
            $(_this.ele).find(".scroll-x").mCustomScrollbar({
                scrollInertia:400,
                theme:'default-thin',
                axis:'x'
            });
            $(_this.ele).find(".scroll-xy").mCustomScrollbar({
                scrollInertia:400,
                theme:'default-thin',
                axis:'xy'
            });
        };

        //卸載
        _this.download = function(){
            $(_this.ele).find(".scroll").mCustomScrollbar("destroy");
            $(_this.ele).find(".scroll-x").mCustomScrollbar("destroy");
            $(_this.ele).find(".scroll-xy").mCustomScrollbar("destroy");
        };

        // 刷新滚动条状态
        _this.update = function(){
            $(_this.ele).find(".scroll").mCustomScrollbar("update");
            $(_this.ele).find(".scroll-x").mCustomScrollbar("update");
            $(_this.ele).find(".scroll-xy").mCustomScrollbar("update");
        };

        //重新加載
        _this.reload = function(){
            _this.download();
            _this.load();
        };
    });
    return {
        CustomScroll : CustomScroll
    }
}]);

app.directive('subMenuOpen',['$timeout',function ($timeout) {
    return {
        restrict : 'A',
        link : function (scope,ele) {
            var timePromise,openStatus = false;
            $(ele).mouseenter(function (e) {
                !openStatus?$(ele).next().css({
                    display : 'block',
                    opacity : 1
                }):'';
                openStatus = true;
            });
            $(ele).mouseleave(function (e) {
                openStatus?timePromise = $timeout(function () {
                    $(ele).next().css({
                        display : 'none',
                        opacity : 0
                    });
                    openStatus = false;
                },50):'';
            });
            $(ele).next().mouseenter(function (e) {
                $timeout.cancel(timePromise);
            });
            $(ele).next().mouseleave(function (e) {
                openStatus?$(ele).next().css({
                    display : 'none',
                    opacity : 0
                }):'';
                openStatus = false;
            });
        }
    }
}]);

app.factory('MenuHref',[function () {
    return {
        'dashboard' : 'index.html#/app/overview',
        'room' : 'index.html#/app/room',
        'cabinet' : 'index.html#/app/cabinet',
        'host' : 'index.html#/app/host',
        'server' : 'index.html#/app/server',
        'image' : 'index.html#/app/image',
        'keypaire' : 'index.html#/app/keypair',
        'aggregate' : 'index.html#/app/aggregate',
        'storage' : 'index.html#/app/storage',
        'volume_type' : 'index.html#/app/volumeType',
        'volume' : 'index.html#/app/volume',
        'volume_qos' : '',
        'network' : 'index.html#/app/network',
        'router' : 'index.html#/app/router',
        'security' : 'index.html#/app/security',
        'network_topology' : 'index.html#/app/topo',
        'network_qos' : 'index.html#/app/network_qos',
        'loadbalancers': 'index.html#/app/loadbalancers',
        'floatingip' : '',
        'tag' : 'index.html#/app/tag',
        'alarm' : 'index.html#/app/alarm',
        'process' : 'index.html#/app/process',
        'request' : 'index.html#/app/request',
        'user' : 'index.html#/app/user',
        'department' : 'index.html#/app/department',
        'role' : 'index.html#/app/roles',
        'flavor' : 'index.html#/app/flavor',
        'bill_overview' : 'index.html#/app/bill_overview',
        'bill_rcord' : 'index.html#/app/bill_record',
        'bill_policy' : 'index.html#/app/bill_policy'

    }
}]);

app.constant('MenuIcon',{
    'dashboard' : 'images/navigation/icon/home.png',
    'infrastructure' : 'images/navigation/icon/infrastructure.png',
    'compute' : 'images/navigation/icon/computing_resource.png',
    'cinder' : 'images/navigation/icon/storage_resource.png',
    'neutron' : 'images/navigation/icon/network_resource.png',
    'manager':'images/navigation/icon/manage.png',
    'configuration' : 'images/navigation/icon/setting.png',
    'bill' : 'images/navigation/icon/bill.png'
});