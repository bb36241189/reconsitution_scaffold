/**
 * Created by shmily on 2017/2/8.
 */

app.factory("commonService", ["$http", "AppConfig", "$cookies", "$rootScope", function($http, AppConfig, $cookies, $rootScope){
    function loadXMLString(txt)
    {
        try //Internet Explorer
          {
              xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
              xmlDoc.async="false";
              xmlDoc.loadXML(txt);
              //alert('IE');
              return(xmlDoc);
          }
        catch(e)
          {
              try //Firefox, Mozilla, Opera, etc.
                {
                    parser=new DOMParser();
                    xmlDoc=parser.parseFromString(txt,"text/xml");
                 //alert('FMO');
                    return(xmlDoc);
                }
              catch(e) {alert(e.message)}
          }
        return(null);
    }　

    return {
        loadXMLString : loadXMLString
    }
}]);