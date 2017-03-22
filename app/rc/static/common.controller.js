/**
 * Created by shmily on 2017/1/12.
 */

app.controller('CommonController',['$scope',function ($scope) {
    $scope.static_url = function (str) {
        return '/rc/static/'+str;
    }
}]);