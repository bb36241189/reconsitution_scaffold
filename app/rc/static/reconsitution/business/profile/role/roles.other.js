/**
 * Created by shmily on 2017/3/14.
 */

app.factory('RolesClassFactory',['TreeNodeUtil',function (TreeNodeUtil) {
     var TreeNode,Tree;
     (TreeNode = function TreeNode(nodeData) {
            angular.extend(this, nodeData);
     }).prototype = {};
     Object.defineProperties(TreeNode.prototype,{
        key : {
            get : function () {
                return this.id;
            }
        },
        title : {
            get : function () {
                return this.description;
            }
        },
         folder : {
             get : function(){
                 return this.child && this.child.length > 0
             }
         },
         children : {
             get : function () {
                 var i,ret=[];
                 if(this.child && !this.__children){
                     for(i = 0;i<this.child.length ;i++){
                         ret.push(n = new TreeNode(this.child[i]));
                     }
                     this.__children = ret;
                     return ret;
                 }else {
                     return this.__children;
                 }
             }
         }
    });


     (Tree = function Tree(treeDatas) {
         this.tree = new TreeNode({child : treeDatas});
         this.firstlevelNodes = this.tree.children;
         this.children = this.firstlevelNodes;
         this.selectedTreeNodes = [];
     }).prototype = {
         selectNodes : function (treeNodes) {
             this.selectedTreeNodes = treeNodes;
         },
         getFirstLevelNodes : function () {
             return this.firstlevelNodes;
         },
         getTreeNodeByName : function (name) {
             var node;
             TreeNodeUtil.traverseNode(this.tree, function (snode) {
                 if(snode.name == name){
                     node = snode;
                 }
             });
             return node;
         },
         line : '------',
         _refreshNodeSelectedStatus : function (treeNode) {
             var exist = false;
             TreeNodeUtil.traverseNodeArray(this.selectedTreeNodes, function (snode) {
                 if(snode.key == treeNode.key){
                     exist = true;
                 }
             });
             if(exist) {
                 treeNode.selected = true;
                 console.log('selected');
             }
         },
         _refreshTreeSelectedStatus : function () {
             var self = this;
             TreeNodeUtil.traverseNode(this.tree, function (node) {
                 self._refreshNodeSelectedStatus(node);
             })
         },
         getTreeWithSeletedStatus : function () {
             return this._treeWithSelectedStatus;
         },
         /**
          * 获取节点简单信息
          * @param funcyNodes funcyTree内置的节点数据
          * @param strict 严格模式需要检查节点选择状态
          * @returns {Array}
          */
         getSelectedNodesSimple : function (fancyNodes,strict) {
             var nodesSimple = [];

             TreeNodeUtil.traverseNodeArray(fancyNodes, function (node) {
                 if(strict && node.selected || !strict){
                     nodesSimple.push({ id : node.key,is_special : node.data.is_special});
                 }
             },true);
             return nodesSimple;
         }
     };

     Object.defineProperties(Tree.prototype,{
         _treeWithSelectedStatus : {
             get : function () {
                 this._refreshTreeSelectedStatus();
                 return this.firstlevelNodes;
             }
         }
     });
     /************************************/

     return {
         TreeNode : TreeNode,
         Tree : Tree
     }
 }]);

app.directive("permenusTree", ['$timeout','TreeNodeUtil',function($timeout,TreeNodeUtil){
    return{
        restrict:"A",
        scope:{
            permenusTree:"=",
            select:"="
        },
        link:function(scope,ele,attrs,ctl){
            var selectMode = $(ele).attr('selectMode');
            scope.$watch("permenusTree",function(nv){
                if(nv){
                     $(ele).html('<div class="permenusInner"></div>');
                    $(ele).find('.permenusInner').fancytree({
                        checkbox: true,
                        selectMode: parseInt(selectMode),
                        source:nv,
                        init:function(event, data){
                            scope.select = TreeNodeUtil.getSelectedNodesContainAncestor(data.tree.getSelectedNodes());
                        },
                        select: function(event, data) {
                            scope.select = TreeNodeUtil.getSelectedNodesContainAncestor(data.tree.getSelectedNodes());
                            scope.$apply();
                        }
                    });
                }
            });

        }
    };
}]);

app.factory('TreeNodeUtil', function () {
     return {
          /**
          * 判断一个节点是否在数组里面
          * @param node
          * @param nodes2
          * @returns {boolean}
          */
         inside : function(node,nodes2){
             var j;ret = false;
             for(j = 0 ;j < nodes2.length ;j ++){
                 if(node.key == nodes2[j].key){
                     ret = true;
                     break
                 }
             }
             return ret;
         },

         /**
          * 合并两个节点列表
          * @param nodes1
          * @param nodes2
          */
         mergeRepeatNodes : function(nodes1,nodes2){
             var i,nodeArray1 = nodes1,nodeArray2 = nodes2;
             for(i = 0 ;i < nodeArray1.length ;i++){
                 if(!this.inside(nodeArray1[i],nodeArray2)){
                     nodeArray2.push(nodeArray1[i])
                 }
             }
             return nodes2;
         },

         /**
          * 获取所有选择节点以及他们的祖先节点
          * @param nodes
          */
         getSelectedNodesContainAncestor : function(nodes){
             var self = this;
             return nodes.reduce(function (prev,n) {
                 return self.mergeRepeatNodes(prev,self.getAncestorsByNode(n));
             },[]);
         },
         /**
          * 获取节点的所有祖先节点
          * @param node
          * @returns {Array.<T>}
          */
         getAncestorsByNode : function(node){
             var self = [node],ancestor = [];
             if(node.parent && node.parent.title != 'root'){
                 ancestor = this.getAncestorsByNode(node.parent);
             }
             return Array.prototype.concat(self,ancestor);
         }
         ,
         /**
          * 遍历节点及节点的子孙节点
          * @param node
          */
         traverseNode : function(node,func){
             var i;
             func(node);
             if(node.children){
                 for(i = 0; i< node.children.length; i++){
                     this.traverseNode(node.children[i],func);
                 }
             }
         },
         /**
          * 遍历节点列表
          * @param nodeArry
          * @param func
          * @param skipChild
          */
         traverseNodeArray : function (nodeArry,func,skipChild) {
             var i;
             for(i = 0; i< nodeArry.length ;i++){
                 if(skipChild){
                     func(nodeArry[i]);
                 }else{
                     this.traverseNode(nodeArry[i],func);
                 }
             }
         }
     };
 });