/**
 * Created by shmily on 2017/2/23.
 */

app.factory('UtilService',[function () {
    /**
     * 获取枚举型参数string
     * @param key 参数名
     * @param array 参数值
     */
    var getEnumParams4GetAction = function (key,array) {
        var ret = '?';
        for (var i = 0; i < array.length; i++) {
            if (i == 0) {
                ret = ret + key +'='+ array[i];
            } else {
                ret = ret + "&"+key+"=" + array[i];
            }
        }
    };

    /**
     * 根据参数和url做真实的url
     * @param restful 类似 /servers/{serverId}/snapshot/{snapshotId}
     * @param params 类似 {serverId : 1,snapshotId : 2}
     * @returns {*}
     */
    var getFullUrlByRestfulAndParams = function (restful,params) {
        var fullUrl = restful;
        while(new RegExp(/(\{)[\w]*(\})/).test(fullUrl)){
            fullUrl = fullUrl.replace(/(\{)[\w]*(\})/, function (match) {
                return params[match.substr(1,match.length - 2)];
            });
        }
        return fullUrl;
    };

    /**
     * 将普通对象转化为参数对象，以便发送给后台
     * @param obj
     * @returns {*}
     */
    var obj2Params = function (obj) {
        var prop,params = angular.copy(obj);
        for(prop in obj){
            if(prop.startsWith('_') || prop.startsWith('__')){
                delete params[prop];
            }
        }
        return params;
    };

    return {
        getEnumParams4GetAction : getEnumParams4GetAction,
        getFullUrlByRestfulAndParams : getFullUrlByRestfulAndParams,
        obj2Params : obj2Params
    }
}]);