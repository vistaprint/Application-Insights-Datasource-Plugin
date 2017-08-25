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
                    this.apiTypes = ["Metric", "Query"];
                    this.operators = [
                        { value: '', label: 'none' },
                        { value: '+', label: '+' },
                        { value: '-', label: '-' },
                        { value: '*', label: '*' },
                        { value: '/', label: '/' },
                    ];
                    this.operand2types = [
                        { value: 'metric', label: 'metric' },
                        { value: 'constant', label: 'constant' },
                    ];
                    this.getMetricOptions();
                    this.resetAggregation(this.target.metric);
                    this.toggleOperand2();
                    this.toggleOperand2type();
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
                };
                AppInsightsQueryCtrl.prototype.resetAggregationOperand2 = function (metric) {
                    var _this = this;
                    this.aggregationsOperand2 = this.datasource.getAggregations(metric).then(function (aggregations) {
                        _this.aggregationsOperand2 = aggregations;
                    });
                };
                // Shows the second operand selection if the operator is defined
                AppInsightsQueryCtrl.prototype.toggleType = function () {
                    if (this.target.type != "metric") {
                        this.isOperand2Visible = false;
                        this.target.metric = "";
                        this.target.aggregations = "";
                        this.target.operator = "";
                        this.target.constantOperand2 = "";
                        this.target.metricOperand2 = "";
                        this.target.aggregationsOperand2 = "";
                    }
                };
                // Shows the second operand selection if the operator is defined
                AppInsightsQueryCtrl.prototype.toggleOperand2 = function () {
                    if (this.target.operator != "") {
                        this.isOperand2Visible = true;
                    }
                    else {
                        this.isOperand2Visible = false;
                        this.target.constantOperand2 = "";
                        this.target.metricOperand2 = "";
                        this.target.aggregationsOperand2 = "";
                        this.refresh();
                    }
                };
                // Shows the metric or constant operand 2
                AppInsightsQueryCtrl.prototype.toggleOperand2type = function () {
                    if (!this.isOperand2Visible) {
                        this.isOperand2metric = false;
                        this.isOperand2constant = false;
                    }
                    else if (this.target.operand2type == 'metric') {
                        this.isOperand2metric = true;
                        this.isOperand2constant = false;
                    }
                    else if (this.target.operand2type == 'constant') {
                        this.isOperand2metric = false;
                        this.isOperand2constant = true;
                    }
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