/**
 * Created by shmily on 2017/3/14.
 */

app.factory('SessionInterceptor',['$q',function ($q) {
    var sessionInjector = {
        request: function(config){
            var defer = $q.defer();
            if(config.token){
                config.headers["RC-Token"] =  $.cookie("token_id")
            }
            defer.resolve(config);
            return defer.promise;
        }
    };

    return sessionInjector;
}]);