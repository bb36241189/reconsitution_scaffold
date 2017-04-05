//主列表的控制器
// 其中uibModel来自bootstrap的model,NgTableParams来自ngTable
undefined){
    //局部变量
    var _col_length = 3;
    var _get_url = "/aggregates";


    //默认值
    var self = this;
    $scope.selectedRow = {};                        //已选中的行
    $scope.btn={};                                   //按钮状态
    $scope.btn.edit = false;
    $scope.btn.delete = false;
    $scope.loading = {};
    $scope.loading.span = "正在加载...";            //loading文字
    $scope.loading.cols = _col_length;
    //刷新列表
    //如果传参，则初始化列表，并刷新
    function getlist(init){
        $http({
            method:"GET",
            url:project_url + _get_url,
            headers:{
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(data){
            if(init){
                //初始化
                self.tableParams = new NgTableParams({},{dataset:data.aggregates});
            }
            else{
                //刷新
                self.tableParams.settings().dataset = data.aggregates;
                self.tableParams.reload();
            }
            //刷新后，清除已选中的行
            $scope.selectedRow = {};

            //从cookie读数据，比对默认数据
            var cols = ipCookie("cols");
            if(cols!=undefined){
                for(var i=0;i<self.cols.length;i++){
                    var title = self.cols[i].title();
                    //在cookie有设置的情况下，以设置为准
                    if(cols[title]!=undefined){
                        self.cols[i].show(cols[title]);
                    }
                }
            }

            //如果没有数据，则更新loading显示
            if(data.aggregates.length==0){
                $scope.loading.span = "没有记录";
                $scope.loading.cols = getColsLength();
                $scope.bool_rows = false;
            }
            else{
                $scope.bool_rows = true;
            }
        }).error(function(data){
            SAlert.showError(data);
        });
    }

    function getColsLength(){
        var l = 0;
        for(var i=0;i<self.cols.length;i++){
            if(self.cols[i].show()){
                l++;
            }
        }
        return l;
    }

    //把自定义列的设置情况写入cookie
    $scope.colSet = function(e,title){
        var cols = ipCookie("cols");
        cols = cols==undefined?{}:cols;
        cols[title] = e.currentTarget.checked;
        ipCookie("cols",JSON.stringify(cols));
        $scope.loading.cols = getColsLength();
    }

    $scope.clickTableTr = function(e,row){
        //如果点击已选中的行，则清除选择，否则更新已选中的行
        $scope.selectedRow = $scope.selectedRow.id == row.id ? {} : row;
    }

    //监视已选中的行变化情况
    $scope.$watch("selectedRow",function(){
        if($scope.selectedRow.id){
            $scope.btn.edit = true;
            $scope.btn.delete = $scope.selectedRow.hosts.length==0;
        }
        else{
            $scope.btn.edit = false;
            $scope.btn.delete = false;
        }
    });

    $scope.clickOperateItem = function(url,controller){
        //初始化模态框
        var modalInstance = $uibModal.open({
            //模态框的地址：来自于ng-template模板
            templateUrl: url,
            //为模态框定义控制器
            controller: controller,
            //为控制器设置参数
            resolve: {
                origin_data:$scope.selectedRow,
                callback: function () {
                    return getlist;
                }
            }
        });
    }

    getlist(true);
});

//模态框控制器
// uibModelInstance是模态框的实例对象
//callback为传参
undefined){
    $scope.cancel = function(){
        //注销释放此模态框实例
        $uibModalInstance.dismiss('cancel');
    };

    $scope.submitCreate = function(valid){
        if(!valid){
            return;
        }
        var data = {};
        data.name = $scope.name;
        //data.availability_zone = $scope.availability_zone;
        $http({
            method:"POST",
            url:project_url + "/aggregates",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            data:JSON.stringify(data)
        }).success(function(){
            callback();
            $uibModalInstance.dismiss('cancel');
        }).error(function(e){
            $uibModalInstance.dismiss('cancel');
            SAlert.showError(e);
        });
    }
});

undefined){
    $scope.name = origin_data.name;
    $scope.availability_zone = origin_data.availability_zone;
    $scope.id = origin_data.id;
    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    };
    $scope.submitEdit = function(valid){
        if(!valid){
            return;
        }
        var data = {};
        data.name = $scope.name;
        data.availability_zone = $scope.availability_zone;
        $http({
            method:"PUT",
            url:project_url + "/aggregates/" + $scope.id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            data:JSON.stringify(data)
        }).success(function(){
            $uibModalInstance.dismiss('cancel');
            callback();
        }).error(function(e){
            $uibModalInstance.dismiss('cancel');
            SAlert.showError(e);
        });
    }
});

undefined){
    $scope.id = origin_data.id;
    $scope.clickSubmitDelete = function(valid){
        $http({
            method:"DELETE",
            url:project_url + "/aggregates/" + $scope.id,
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            }
        }).success(function(){
            $uibModalInstance.dismiss('cancel');
            callback();
        }).error(function(e){
            SAlert.showError(e);
            $uibModalInstance.dismiss('cancel');
        });
    }
    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    }
});

undefined){
    $scope.id = origin_data.id;
    $scope.hosts_add = [];
    $scope.hosts_pool = [];
    $http({
        method:"GET",
        url:project_url + "/openstack_host",
        headers: {
            'Content-Type': 'application/json',
            "RC-Token": $.cookie("token_id")
        }
    }).success(function(data){
        for(var i=0;i<data.length;i++){
            var match = false;
            for(var j=0;j<origin_data.hosts.length;j++){
                if(data[i].host_name == origin_data.hosts[j]){
                    match = true;
                    break;
                }
            }
            if(match){
                $scope.hosts_add.push(data[i]);
            }else{
                if(data[i].zone == "nova"){
                    $scope.hosts_pool.push(data[i]);
                }
            }
        }
    }).error(function(e){
        SAlert.showError(e);
    });

    $scope.toRight = function(name){
        for(var i=0;i<$scope.hosts_pool.length;i++){
            if($scope.hosts_pool[i].host_name==name){
                $scope.hosts_pool.splice(i,1);
                $scope.hosts_add.push({host_name:name});
                break;
            }
        }
    };

    $scope.toLeft = function(name){
        for(var i=0;i<$scope.hosts_add.length;i++){
            if($scope.hosts_add[i].host_name==name){
                $scope.hosts_add.splice(i,1);
                $scope.hosts_pool.push({host_name:name});
                break;
            }
        }
    }

    $scope.clickSubmitBind = function(valid){
        var s = {action:"manage_host"};
        var d = [];
        for(var i=0;i<$scope.hosts_add.length;i++){
            d.push($scope.hosts_add[i].host_name);
        }
        s.host = d;
        $http({
            method:"POST",
            url:project_url + "/aggregates/" + $scope.id + "/action",
            headers: {
                'Content-Type': 'application/json',
                "RC-Token": $.cookie("token_id")
            },
            data:JSON.stringify(s)
        }).success(function(){
            $uibModalInstance.dismiss('cancel');
            callback();
        }).error(function(e){
            SAlert.showError(e);
            $uibModalInstance.dismiss('cancel');
        });
    };

    $scope.cancel = function(){
        $uibModalInstance.dismiss('cancel');
    }
});


