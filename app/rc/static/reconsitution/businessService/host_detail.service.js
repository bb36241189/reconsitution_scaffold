/**
 * Created by shmily on 2017/2/21.
 */

app.factory('host_detailService',['$http',function ($http) {
    var getHostById = function (id) {
        return $http.get(UrlConfig.getHostById + id,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    
    var getServersById = function (id) {
        return $http.get(UrlConfig.getServersById+id,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        });
    };
    
    var getServerPortsById = function (id) {
        return $http.get(UrlConfig.getServerPortsById,{
            headers : {
                "RC-Token": $.cookie("token_id")
            },
            params : {
                'device_id': id
            }
        });
    };
    
    var getHostsTelemetry = function () {
        return $http.get(UrlConfig.getHostsTelemetry,{
            headers : {
                 "RC-Token": $.cookie("token_id")
            }
        })
    };

    return {
        getHostById : getHostById,
        getServersById : getServersById,
        getServerPortsById : getServerPortsById
    }
}]);