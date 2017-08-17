System.register(['app/plugins/sdk'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var sdk_1;
    var AppInsightsQueryCtrl;
    return {
        setters:[
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            }],
        execute: function() {
            AppInsightsQueryCtrl = (function (_super) {
                __extends(AppInsightsQueryCtrl, _super);
                /** @ngInject **/
                function AppInsightsQueryCtrl($scope, $injector) {
                    _super.call(this, $scope, $injector);
                    this.getMetricOptions();
                    this.resetAggregation(this.target.metric);
                }
                ;
                AppInsightsQueryCtrl.prototype.getMetricOptions = function () {
                    var _this = this;
                    if (this.metrics_types) {
                        return Promise.resolve(this.metrics_types);
                    }
                    else {
                        return this.datasource.getAllMetadata()
                            .then(function (metrics) {
                            _this.metrics_types = metrics;
                            return metrics;
                        });
                    }
                };
                AppInsightsQueryCtrl.prototype.resetAggregation = function (metric) {
                    var _this = this;
                    this.aggregations = this.datasource.getAggregations(metric).then(function (aggregations) {
                        _this.aggregations = aggregations;
                    });
                    this.refresh();
                };
                AppInsightsQueryCtrl.prototype.onChangeInternal = function () {
                    this.refresh(); // Asks the panel to refresh data.
                };
                AppInsightsQueryCtrl.templateUrl = 'partials/query.editor.html';
                return AppInsightsQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("AppInsightsQueryCtrl", AppInsightsQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map