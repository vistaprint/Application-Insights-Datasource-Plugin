///<reference path="../typings/tsd.d.ts" />
import moment from 'moment';
import _ from 'lodash';

class AppInsightsDatasource {
  name: string;
  appId: any;
  apiKey: any;
  apiUrl: string;

  /** @ngInject */
  constructor(instanceSettings, private $q, private backendSrv, private templateSrv) {
    this.name = instanceSettings.name;
    this.appId = instanceSettings.jsonData.app_id;
    this.apiKey = instanceSettings.jsonData.api_key;
    this.apiUrl = "https://api.applicationinsights.io/beta/apps/";
    this.backendSrv = backendSrv;
  }

  query(options) {
    var self = this
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
  }

  testDatasource() {
    var url = this.apiUrl + this.appId + '/metrics/metadata';

    return this.makeRequest({ url: url }).then(() => {
      return { status: "success", message: "Data source is working", title: "Success" };
    });
  }

  getAllMetadata() {
    var url = this.apiUrl + this.appId + '/metrics/metadata';
    console.log("fetching metadata");
    return this.makeRequest({ url: url }).then(response => {
      var metricOptionsList = []
      _.forOwn(response.response.metrics, function (value, key) {
        metricOptionsList.push(key);
      });
      return metricOptionsList
    });
  }

  getAggregations(metricName) {
    var url = this.apiUrl + this.appId + '/metrics/metadata';
    console.log("fetching metadata");
    return this.makeRequest({ url: url }).then(response => {
      var aggregationOptionsList = response.response.metrics[metricName].supportedAggregations;
      return aggregationOptionsList
    });
  }

  _parseMetricResults(results) {
    var self = this;
    var segmentList = [];
    var value = results.response.value;
    value.alias = results.alias;
    value.metric = results.metric;
    value.aggregation = results.aggregation;
    segmentList = segmentList.concat(self._parseValue(value));

    return segmentList;
  }

  _parseValue(value) {
    var self = this;
    var segments = value.segments;
    var targetData = [];
    targetData.push({
      target: self._parseTargetAlias(value),
      datapoints: self._getTargetSeries(segments, value.metric, value.aggregation)
    });
    return targetData;
  }

  _getTargetSeries(segments, metric, aggregation) {
    var series = [];
    segments.forEach(function (segment) {
      series.push([segment[metric][aggregation], moment(segment.end).valueOf()]);
    });
    return series;
  }

  _parseTargetAlias(value) {
    if (value.alias) {
      return value.alias
    } else {
      return value.metric
    }
  }

  makeMultipleRequests(requests) {
    var self = this;
    return this.$q(function (resolve, reject) {
      var mergedResults = {
        data: []
      };
      var promises = [];
      requests.forEach(function (request) {
        promises.push(self.makeRequest(request));
      });
      self.$q.all(promises).then((data) => {
        data.forEach(function (result) {
          mergedResults.data = mergedResults.data.concat(self._parseMetricResults(result));
        });
        resolve(mergedResults);
      });
    });
  }

  makeRequest(request) {
    var options: any = {
      method: "get",
      url: request.url,
    };

    options.headers = options.headers || {};
    options.headers["x-api-key"] = this.apiKey;

    return this.backendSrv.datasourceRequest(options).then(result => {
      return { response: result.data, refId: request.refId, alias: request.alias, metric: request.metric, aggregation: request.aggregation };
    }, function (err) {
      if (err.status !== 0 || err.status >= 300) {
        if (err.data && err.data.error) {
          throw { message: 'App Insights Error Response: ' + err.data.error.title, data: err.data, config: err.config };
        } else {
          throw { message: 'App Insights Error: ' + err.message, data: err.data, config: err.config };
        }
      }
    });
  }
}

export { AppInsightsDatasource };
