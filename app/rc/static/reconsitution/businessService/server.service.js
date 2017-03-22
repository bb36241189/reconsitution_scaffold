/**
 * Created by shmily on 2017/2/21.
 */

app.factory('ServerService',['$http','UtilService',function ($http,UtilService) {
    var postActionServers = function (params) {
        var path = UrlConfig.postActionServers.replace(/(\{)[\w]*(\})/, function (match) {
            return params[match.substr(1,match.length - 2)];
        });
        return $http.post(path,params,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        });
    };

    
    var getFlavors = function () {
        return $http.get(UrlConfig.getFlavors,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    
    var getNetworks = function (params) {
        return $http.get(UrlConfig.getNetworks,{
            headers : {
                 "RC-Token": $.cookie("token_id")
            },
            params : params?params:{
                "router:external": 0
            }
        })
    };

    var postServers = function (params) {
        return $http.post(UrlConfig.postServers,params,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    
    var getPortsByDeviceId = function (id) {
        return $http.get(UrlConfig.getPortsByDeviceId,{
            headers : {
                "RC-Token": $.cookie("token_id")
            },
            params : {
                "device_id" : id
            }
        })
    };
    
    var getFloatingips = function (paramStr) {
        return $http.get(UrlConfig.getFloatingips+paramStr,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        });
    };
    
    var getKeypairs = function () {
        return $http.get(UrlConfig.getKeypairs,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    
    var getAvailabilityZones = function () {
        return $http.get(UrlConfig.getAvailabilityZones,{
            headers : {
                "RC-Token": $.cookie("token_id")
            },
            params : {
                "need_ag" : 0
            }
        })
    };
    
    var postServerClone = function (serverid,params) {
        return $http.post(UrlConfig.postServerClone+serverid,params,{
            headers : {
                 'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            }
        })
    };

    var getServersSnapshotsByInstanceId = function (instanceid) {
        return $http.get(UrlConfig.getServersSnapshotsByInstanceId,{
            headers : {
                "RC-Token": $.cookie("token_id")
            },
            params : {
                "instance_id": instanceid
            }
        })
    };
    
    var putServersSnapshotsByInstanceId = function (instanceId,params) {
        return $http.put(UrlConfig.putServersSnapshotsByInstanceId,params,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    
    var postServersSnapshotsByInstanceId = function (instanceId , params) {
        return $http.post(UrlConfig.postServersSnapshotsByInstanceId,params,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    
    var deleteTagBind = function (data) {
        return $http.delete(UrlConfig.deleteTagBind,{
            headers : {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            params : data
        })
    };
    
    var postTagBind = function (params) {
        return $http.post(UrlConfig.postTagBind,params,{
            'Content-Type': 'application/json',
            "RC-Token": $.cookie("token_id")
        })
    };
    
    var deleteServersById = function (id) {
        return $http.delete(UrlConfig.deleteServersById+id,{
            headers: {
                "RC-Token": $.cookie("token_id")
            }
        })
    };

    var getActivePriceScheme = function () {
        return $http.get(UrlConfig.getActivePriceScheme,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    
    var getServersBySearchName = function (searchName) {
        return $http.get(UrlConfig.getServersBySearchName,{
            headers : {
                "RC-Token": $.cookie("token_id")
            },
            params : {
                'name' : searchName
            }
        });
    };
    
    var getServicesBySnapshotAndServerId = function (params) {
        return $http.get(
            UtilService.getFullUrlByRestfulAndParams(UrlConfig.getServicesBySnapshotWithServerId,params),{
                headers : {
                    "RC-Token": $.cookie("token_id")
                }
            })
    };
    
    var getImages = function () {
        return $http.get(UrlConfig.getImages,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        });
    };
    
    var putServersById = function (serverId,params) {
        return $http.put(UrlConfig.putServersById+serverId,params,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    
    var getServersById = function (serverId) {
        return $http.get(UrlConfig.getServersById+serverId,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        });
    };

    var postInterfaceServersById = function (params) {
        return $http.post(UtilService.getFullUrlByRestfulAndParams(UrlConfig.postInterfaceServersById,params),params,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };

    var deleteInterfaceServersById = function (params) {
        return $http.delete(UtilService.getFullUrlByRestfulAndParams(UrlConfig.postInterfaceServersById,params),{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        });
    };
    
    var deleteSnapshotBySnapshotIdWithServerId = function (params) {
        return $http.delete(UtilService.getFullUrlByRestfulAndParams(UrlConfig.deleteSnapshotBySnapshotIdWithServerId,params),{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        });
    };

    var postSnapshotBySnapsshotIdWithServerId = function (params) {
        return $http.post(UtilService.getFullUrlByRestfulAndParams(UrlConfig.postSnapshotBySnapsshotIdWithServerId,params),{},{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        });
    };

    var getTags = function(){
        return $http.get(UrlConfig.getTags,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    
    var postServerBackups = function (params) {
        return $http.post(UrlConfig.postServerBackups,params,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };

    var getConnectNetworkByPortId = function (portId) {
        return $http.get(UrlConfig.getConnectNetworkByPortId+portId,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };
    
    var putFloatingipById = function (floatingipId,params) {
        return $http.put(UrlConfig.putFloatingipById+floatingipId,params,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        });
    };
    
    var postFloatingips = function (params) {
        return $http.post(UrlConfig.postFloatingips,params,{
            headers : {
                "RC-Token": $.cookie("token_id")
            }
        })
    };

    return {
        getNetworks : getNetworks,
        postActionServers : postActionServers,
        getFlavors : getFlavors,
        getPortsByDeviceId : getPortsByDeviceId,
        getFloatingips : getFloatingips,
        getKeypairs : getKeypairs,
        getAvailabilityZones : getAvailabilityZones,
        postServerClone : postServerClone,
        getServersSnapshotsByInstanceId : getServersSnapshotsByInstanceId,
        putServersSnapshotsByInstanceId : putServersSnapshotsByInstanceId,
        deleteTagBind : deleteTagBind,
        postTagBind : postTagBind,
        getServersById : getServersById,
        deleteServersById : deleteServersById,
        getActivePriceScheme : getActivePriceScheme,
        getServersBySearchName : getServersBySearchName,
        getServicesBySnapshotAndServerId : getServicesBySnapshotAndServerId,
        getImages : getImages,
        postServersSnapshotsByInstanceId : postServersSnapshotsByInstanceId,
        getTags : getTags,
        postServers : postServers,
        putServersById : putServersById,
        postInterfaceServersById : postInterfaceServersById,
        deleteInterfaceServersById : deleteInterfaceServersById,
        deleteSnapshotBySnapshotIdWithServerId : deleteSnapshotBySnapshotIdWithServerId,
        postSnapshotBySnapsshotIdWithServerId : postSnapshotBySnapsshotIdWithServerId,
        postServerBackups : postServerBackups,
        getConnectNetworkByPortId : getConnectNetworkByPortId,
        putFloatingipById : putFloatingipById,
        postFloatingips : postFloatingips
    }
}]);