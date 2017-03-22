/**
 * Created by shmily on 2017/3/14.
 */

app.factory('HttpInterceptor',['$q','SAlert',function ($q,SAlert) {
    var interceptor = {
        request: function(config){
            var deferred = $q.defer();
            if(config.openConfirm){
                SAlert.confirm(config.title,'', function () {
                    deferred.resolve(config);
                }, function () {
                    deferred.reject(config);
                });
            }else{
                deferred.resolve(config);
            }
            return deferred.promise;
        },
        response: function(response){
            var deferred = $q.defer();
            if(response.config.effective){
                response.data = response.data[response.config.effective];
            }
            deferred.resolve(response);
            if(response.config && response.config.successAlert){
                SAlert.alertSuccess(response.config.title+'成功!');
            }
            return deferred.promise;
        },
        requestError: function(rejection){
            return $q.reject(rejection);
        },
        responseError: function(response){
            if(response.data && response.data.error && response.config.errorAlert){
                SAlert.alertError(response.config.title+'失败',response.data.error.message);
            }else{
                SAlert.alertError(response.config.title+'失败','未知错误!');
            }
            if(response.data && response.data.error && response.data.error.code == 401){
                location.hash = 'login';
                 SAlert.alertSuccess('登录超时');
            }
            return $q.reject(response);
        }
    };
    return interceptor;
}]);