System.register(['moment', 'lodash'], function(exports_1) {
    var moment_1, lodash_1;
    var AppInsightsDatasource;
    return {
        setters:[
            function (moment_1_1) {
                moment_1 = moment_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            }],
        execute: function() {
            AppInsightsDatasource = (function () {
                /** @ngInject */
                function AppInsightsDatasource(instanceSettings, $q, backendSrv, templateSrv) {
                    this.$q = $q;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.name = instanceSettings.name;
                    this.appId = instanceSettings.jsonData.app_id;
                    this.apiKey = instanceSettings.jsonData.api_key;
                    this.apiUrl = "https://api.applicationinsights.io/beta/apps/";
                    this.backendSrv = backendSrv;
                }
                AppInsightsDatasource.prototype.query = function (options) {
                    var self = this;
                    var requests = [];
                    options.targets.forEach(function (target) {
                        var request = {
                            refId: target.refId,
                            alias: target.alias,
                            metric: target.metric,
                            aggregation: target.aggregation,
                            url: self.apiUrl + self.appId + '/metrics/' + target.metric + "?timespan=" + options.range.from.toISOString() + "/" + options.range.to.toISOString() + "&interval=" + "PT" + options.interval.toUpperCase() + "&aggregation=" + target.aggregation,
                        };
                        requests.push(request);
                    });
                    return this.makeMultipleRequests(requests);
                };
                AppInsightsDatasource.prototype.testDatasource = function () {
                    var url = this.apiUrl + this.appId + '/metrics/metadata';
                    return this.makeRequest({ url: url }).then(function () {
                        return { status: "success", message: "Data source is working", title: "Success" };
                    });
                };
                AppInsightsDatasource.prototype.getAllMetadata = function () {
                    var url = this.apiUrl + this.appId + '/metrics/metadata';
                    console.log("fetching metadata");
                    return this.makeRequest({ url: url }).then(function (response) {
                        var metricOptionsList = [];
                        lodash_1.default.forOwn(response.response.metrics, function (value, key) {
                            metricOptionsList.push(key);
                        });
                        return metricOptionsList;
                    });
                };
                AppInsightsDatasource.prototype.getAggregations = function (metricName) {
                    var url = this.apiUrl + this.appId + '/metrics/metadata';
                    console.log("fetching metadata");
                    return this.makeRequest({ url: url }).then(function (response) {
                        var aggregationOptionsList = response.response.metrics[metricName].supportedAggregations;
                        return aggregationOptionsList;
                    });
                };
                AppInsightsDatasource.prototype._parseMetricResults = function (results) {
                    var self = this;
                    var segmentList = [];
                    var value = results.response.value;
                    value.alias = results.alias;
                    value.metric = results.metric;
                    value.aggregation = results.aggregation;
                    segmentList = segmentList.concat(self._parseValue(value));
                    return segmentList;
                };
                AppInsightsDatasource.prototype._parseValue = function (value) {
                    var self = this;
                    var segments = value.segments;
                    var targetData = [];
                    targetData.push({
                        target: self._parseTargetAlias(value),
                        datapoints: self._getTargetSeries(segments, value.metric, value.aggregation)
                    });
                    return targetData;
                };
                AppInsightsDatasource.prototype._getTargetSeries = function (segments, metric, aggregation) {
                    var series = [];
                    segments.forEach(function (segment) {
                        series.push([segment[metric][aggregation], moment_1.default(segment.end).valueOf()]);
                    });
                    return series;
                };
                AppInsightsDatasource.prototype._parseTargetAlias = function (value) {
                    if (value.alias) {
                        return value.alias;
                    }
                    else {
                        return value.metric;
                    }
                };
                AppInsightsDatasource.prototype.makeMultipleRequests = function (requests) {
                    var self = this;
                    return this.$q(function (resolve, reject) {
                        var mergedResults = {
                            data: []
                        };
                        var promises = [];
                        requests.forEach(function (request) {
                            promises.push(self.makeRequest(request));
                        });
                        self.$q.all(promises).then(function (data) {
                            data.forEach(function (result) {
                                mergedResults.data = mergedResults.data.concat(self._parseMetricResults(result));
                            });
                            resolve(mergedResults);
                        });
                    });
                };
                AppInsightsDatasource.prototype.makeRequest = function (request) {
                    var options = {
                        method: "get",
                        url: request.url,
                    };
                    options.headers = options.headers || {};
                    options.headers["x-api-key"] = this.apiKey;
                    return this.backendSrv.datasourceRequest(options).then(function (result) {
                        return { response: result.data, refId: request.refId, alias: request.alias, metric: request.metric, aggregation: request.aggregation };
                    }, function (err) {
                        if (err.status !== 0 || err.status >= 300) {
                            if (err.data && err.data.error) {
                                throw { message: 'App Insights Error Response: ' + err.data.error.title, data: err.data, config: err.config };
                            }
                            else {
                                throw { message: 'App Insights Error: ' + err.message, data: err.data, config: err.config };
                            }
                        }
                    });
                };
                return AppInsightsDatasource;
            })();
            exports_1("AppInsightsDatasource", AppInsightsDatasource);
        }
    }
});
//# sourceMappingURL=datasource.js.map