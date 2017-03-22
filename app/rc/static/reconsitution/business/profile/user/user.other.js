/**
 * Created by shmily on 2017/3/15.
 */

app.directive("isUserUniqueWithField", ["$q", "$http",'UserService', function($q, $http,UserService){
    return{
        restrict:"A",
        require:"ngModel",
        link:function(scope,ele,attrs,ctl){
            var extraConstraintCtrl = scope.$eval((attrs['isUserUniqueWithField']));
            ctl.$asyncValidators.checkasync = function(modelValue,viewValue){
                var defer = $q.defer(),selfName = ctl.$name,extraName = extraConstraintCtrl.$name;
                var params = {};
                params[selfName] = ctl.$viewValue;
                params[extraName] = extraConstraintCtrl.$viewValue;
                UserService.getUserIsUnique(params).then(function (e) {
                    if(!e.data.exist){
                        defer.resolve();
                    }else{
                        defer.reject();
                    }
                }, function (error) {
                    defer.resolve();
                });
                return defer.promise;
            };
            extraConstraintCtrl.$asyncValidators.checkasync2 = ctl.$asyncValidators.checkasync;
        }
    };
}]);

app.directive('myPwdMatch', [function(){
     return {
         restrict: "A",
         require: 'ngModel',
         link: function(scope,element,attrs,ctrl){
             var tageCtrl = scope.$eval(attrs.myPwdMatch);
             tageCtrl.$parsers.push(function(viewValue){
                 ctrl.$setValidity('pwdmatch', viewValue == ctrl.$viewValue);
                 return viewValue;
             });
             ctrl.$parsers.push(function(viewValue){
                 if(viewValue == tageCtrl.$viewValue){
                     ctrl.$setValidity('pwdmatch', true);
                     return viewValue;
                 } else{
                     ctrl.$setValidity('pwdmatch', false);
                     return undefined;
                 }
             });
         }
     };
 }]);

app.directive("helpBlock",[function(){
    return{
        restrict: "E",
        template: function(element,attrs){
            var _html = "";
            _html += '<span style="color:red;" class="error text-small block" ng-if="' + attrs.target + '.$error.checkasync">邮箱已经存在了</span>';
            _html += '<span style="color:red;" class="error text-small block" ng-if="' + attrs.target + '.$error.checkasync2">用户名已经存在了</span>';
            _html += '<span style="color:red;" class="error text-small block" ng-if="' + attrs.target + '.$error.pwdmatch">两次密码输入不一致</span>';
            _html += '<span style="color:red;" class="error text-small block" ng-if="' + attrs.target + '.$error.minlength">内容太短</span>';
            _html += '<span style="color:red;" class="error text-small block" ng-if="' + attrs.target + '.$dirty &&' + attrs.target + '.$error.required">不能为空</span>';
            _html += '<span style="color:red;" class="error text-small block" ng-if="' + attrs.target + '.$error.pattern">' + attrs.patternText + '</span>';
            _html += '<span style="color:red;" class="error text-small block" ng-if="' + attrs.target + '.$invalid &&'+ attrs.target + '.$dirty &&'+!!attrs.text+'">' + attrs.text + '</span>';
            return _html;
        }
    };
}]);