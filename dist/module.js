System.register(['./datasource', './query_ctrl'], function(exports_1) {
    var datasource_1, query_ctrl_1;
    var AppInsightsConfigCtrl;
    return {
        setters:[
            function (datasource_1_1) {
                datasource_1 = datasource_1_1;
            },
            function (query_ctrl_1_1) {
                query_ctrl_1 = query_ctrl_1_1;
            }],
        execute: function() {
            AppInsightsConfigCtrl = (function () {
                function AppInsightsConfigCtrl() {
                }
                AppInsightsConfigCtrl.templateUrl = 'partials/config.html';
                return AppInsightsConfigCtrl;
            })();
            exports_1("Datasource", datasource_1.AppInsightsDatasource);
            exports_1("QueryCtrl", query_ctrl_1.AppInsightsQueryCtrl);
            exports_1("ConfigCtrl", AppInsightsConfigCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map