/**
 * Created by shmily on 2017/3/20.
 */

app.factory('NgTableExtraService',['$q','$filter',function ($q,$filter) {

    /**
     * 当page超范围时，重设page
     * @param params
     * @param orderdData
     */
    var resetPages = function (params,orderdData) {

        if((params.page() - 1) * params.count()>=orderdData.length){
            var _page = Math.ceil(orderdData.length/params.count());
            _page = _page===0?1:_page;
            params.page(_page);
        }
    };

    /**
     * 表格排序
     * @param params
     * @param data
     * @returns {*}
     */
    var orderingData = function(params,data){
        var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
            orderedData = params.sorting() ? $filter('filter')(orderedData, params.filter()) : orderedData;
        return orderedData;
    };

    /**
     * 数据输出
     * @param params
     * @param orderdData
     * @returns {Blob|ArrayBuffer|*|Array.<T>|string}
     */
    var outputOrderedData = function (params,orderdData) {
        return orderdData.slice((params.page() - 1) * params.count(), params.page() * params.count());
    };
    
    var getData = function (params,httpPromise) {
        return httpPromise.then(function (e) {
            var orderedData = orderingData(params, e.data);

            resetPages(params,orderedData);

            return outputOrderedData(params,orderedData);

        })
    };

    return {
        getData : getData
    }
}]);