/**
 * Created by shmily on 2017/2/21.
 */
var project_url = "http://localhost:8000/rc";
var UrlConfig = {
    getHostById : project_url + "/host/",
    getServersById : project_url + '/servers/',
    postServers : project_url + '/servers',
    putServersById : project_url + '/servers/',
    postInterfaceServersById : project_url + '/servers/{serverId}/interface',
    deleteInterfaceServersById : project_url + '/servers/{serverId}/interface',
    deleteSnapshotBySnapshotIdWithServerId : project_url + '/servers/{serverId}/snapshot/{snapshotId}',
    getHostsTelemetry : project_url+'/hosts-telemetry',
    postActionServers : "/servers/{id}/action",
    getFlavors : project_url + "/flavors",
    getNetworks : project_url + '/networks',
    getPortsByDeviceId : project_url + '/ports',
    getFloatingips : project_url + '/floatingips',
    postFloatingips : project_url + '/floatingips',
    putFloatingipById : project_url + '/floatingip/',
    getKeypairs : project_url + '/keypairs',
    getAvailabilityZones : project_url + '/availability-zones',
    postServerClone : project_url + '/server_clone/',
    getServersSnapshotsByInstanceId : project_url + '/servers/snapshots',
    putServersSnapshotsByInstanceId : project_url + '/servers/snapshots',
    postServersSnapshotsByInstanceId : project_url + '/servers/snapshots',
    deleteTagBind : project_url + '/tag_bind',
    postTagBind : project_url + '/tag_bind',
    deleteServersById : project_url + '/servers',
    getActivePriceScheme : project_url + '/active_price_scheme',
    getServersBySearchName : project_url + '/servers',
    getServicesBySnapshotWithServerId :  project_url + "/servers/{serverId}/snapshot/{snapshotId}",
    postSnapshotBySnapsshotIdWithServerId : project_url + '/servers/{serverId}/snapshot/{snapshotId}',
    getImages : project_url + "/images",
    getTags : project_url  + '/tags',
    postServerBackups : project_url + '/server_backups',
    getConnectNetworkByPortId : project_url + '/connect-network/'
};