/**
 * Created by shmily on 2017/2/17.
 */

app.controller('MainController',['$scope','$http','$timeout','_BocModal','UserService','MainClassFactory','MenuHref',
    function ($scope,$http,$timeout,_BocModal,UserService,MainClassFactory,MenuHref) {
    var initData = function () {
        $scope.data = {
            permission : null,
            showModal : false,
            menuHref : MenuHref
        };
        UserService.getMenu().then(function (e) {
            $scope.data.permission = e.data.permission;
        });
    };
    var initAction = function () {
        //$scope.showModal = function (config) {
        //    _BocModal.open(config);
        //    $scope.data.showModal = true;
        //};
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
    scroll.load();
}]);

app.factory('MainClassFactory',[function () {
    var CustomScroll;
    (CustomScroll = function(){
        var _this = this;
        //加載
        _this.load = function(){
            $(".scroll").mCustomScrollbar({
                scrollInertia:400,
                theme:'default-thin'
            });
            $(".scroll-x").mCustomScrollbar({
                scrollInertia:400,
                theme:'default-thin',
                axis:'x'
            });
            $(".scroll-xy").mCustomScrollbar({
                scrollInertia:400,
                theme:'default-thin',
                axis:'xy'
            });
        };

        //卸載
        _this.download = function(){
            $(".scroll").mCustomScrollbar("destroy");
            $(".scroll-x").mCustomScrollbar("destroy");
            $(".scroll-xy").mCustomScrollbar("destroy");
        };

        // 刷新滚动条状态
        _this.update = function(){
            $(".scroll").mCustomScrollbar("update");
            $(".scroll-x").mCustomScrollbar("update");
            $(".scroll-xy").mCustomScrollbar("update");
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
        'dashboard' : '/rc/static/index.html#/app/overview',
        'room' : '/rc/static/index.html#/app/room',
        'cabinet' : '/rc/static/index.html#/app/cabinet',
        'host' : '/rc/static/index.html#/app/host',
        'server' : '/rc/static/index.html#/app/server',
        'image' : '/rc/static/index.html#/app/image',
        'keypaire' : '/rc/static/index.html#/app/keypair',
        'aggregate' : '/rc/static/index.html#/app/aggregate',
        'storage' : '/rc/static/index.html#/app/storage',
        'volume_type' : '/rc/static/index.html#/app/volumeType',
        'volume' : '/rc/static/index.html#/app/volume',
        'volume_qos' : '',
        'network' : '/rc/static/index.html#/app/network',
        'router' : '/rc/static/index.html#/app/router',
        'security' : '/rc/static/index.html#/app/security',
        'network_topology' : '/rc/static/index.html#/app/topo',
        'network_qos' : '/rc/static/index.html#/app/network_qos',
        'loadbalancers': '/rc/static/index.html#/app/loadbalancers',
        'floatingip' : '',
        'tag' : '/rc/static/index.html#/app/tag',
        'alarm' : '/rc/static/index.html#/app/alarm',
        'process' : '/rc/static/index.html#/app/process',
        'request' : '/rc/static/index.html#/app/request',
        'user' : '/rc/static/index.html#/app/user',
        'department' : '/rc/static/index.html#/app/department',
        'role' : '/rc/static/index.html#/app/roles',
        'flavor' : '/rc/static/index.html#/app/flavor',
        'bill_overview' : '/rc/static/index.html#/app/bill_overview',
        'bill_rcord' : '/rc/static/index.html#/app/bill_record',
        'bill_policy' : '/rc/static/index.html#/app/bill_policy'

    }
}]);