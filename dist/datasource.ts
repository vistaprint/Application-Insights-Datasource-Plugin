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
      var request;
      // Get from the metric endpoint
      if (target.type == "Metric") {
        var request_metadata = {
          operand1: {
            metric: target.metric,
            aggregation: target.aggregation
          },
          operator: target.operator,
          operand2type: target.operand2type,
          operand2: {
            metric: target.metricOperand2,
            aggregation: target.aggregationOperand2,
            constant: target.constantOperand2
          }
        }

        request = {
          type: target.type,
          operand1: {
            url: self.apiUrl + self.appId + '/metrics/' + target.metric,
            refId: target.refId,
            alias: target.alias,
            aggregation: target.aggregation,
            metric: target.metric,
            params: {
              timespan: options.range.from.toISOString() + "/" + options.range.to.toISOString(),
              interval: "PT" + options.interval.toUpperCase(),
              aggregation: target.aggregation,
            },
            metadata: request_metadata,
          },
          operand2: null,
        }
        if (target.operator != "" && target.operand2type == 'metric' && target.metricOperand2 != '' && target.aggregationOperand2 != '') {
          request.operand2 = {
            url: self.apiUrl + self.appId + '/metrics/' + target.metricOperand2,
            refId: target.refId,
            alias: target.alias,
            aggregation: target.aggregationOperand2,
            metric: target.metricOperand2,
            params: {
              timespan: options.range.from.toISOString() + "/" + options.range.to.toISOString(),
              interval: "PT" + options.interval.toUpperCase(),
              aggregation: target.aggregationOperand2,
            },
            metadata: request_metadata,
          };
        }

        // Get from the Query endpoint
      } else if (target.type === 'Query' && target.query !== "") {
        var query = target.query
        console.log(options.interval);
        try {
          query = query.replace(/\$INTERVAL/g, options.interval);
        } finally {}
        request = {
          type: target.type,
          refId: target.refId,
          alias: target.alias,
          query: target.query,
          aggregation: target.aggregation,
          url: self.apiUrl + self.appId + '/query?query=' + encodeURIComponent(query),
          params: {
              timespan: options.range.from.toISOString() + "/" + options.range.to.toISOString(),
            },
        };
      }

      requests.push(request);
    });
    return this.makeMultipleRequests(requests);
  }

  makeMultipleRequests(requests) {
    var self = this;
    return this.$q(function (resolve, reject) {
      var mergedResults = {
        data: []
      };

      var promises = [];
      requests.forEach(function (request) {
        if (request.type === "Metric") {
          promises.push(self.makeRequest(request.operand1));
          if (request.operand2 != null) {
            promises.push(self.makeRequest(request.operand2));
          }
        } else if (request.type === "Query") {
          promises.push(self.makeRequest(request));
        }
      }
      );

      self.$q.all(promises).then((results) => {
        var metricsList = []
        results.forEach(result => {
          if (_.has(result.response, 'Tables')) {
          // Parse Query Result
          mergedResults.data = mergedResults.data.concat(self._parseQueryResults(result));
          } else {
            metricsList.push(result)
          }
        });
        mergedResults.data = mergedResults.data.concat(self._evaluateExpression(metricsList));
        resolve(mergedResults);
      });
    });
  }

  _evaluateExpression(metricsList) {
    var self = this;

    // Find expressions for different targets
    var expressions = [];
    metricsList.forEach(function (metric) {
      var value = metric.response.value;
      value.alias = metric.alias;
      value.metric = metric.metric;
      value.aggregation = metric.aggregation;

      var newExpression = true;
      expressions.forEach(function (expression) {
        if (metric.refId == expression.refId && metric.metric == expression.operand1.metric && metric.aggregation == expression.operand1.aggregation) {
          expression.operand1.series = self._parseValue(value)
          newExpression = false;
        }
        if (metric.refId == expression.refId && metric.metric == expression.operand2.metric && metric.aggregation == expression.operand2.aggregation) {
          expression.operand2.series = self._parseValue(value)
          newExpression = false;
        }
      });

      if (newExpression) {
        var expression = metric.metadata
        expression.refId = metric.refId

        if (metric.metric == expression.operand1.metric && metric.aggregation == expression.operand1.aggregation)
          expression.operand1.series = self._parseValue(value)

        if (metric.metric == expression.operand2.metric && metric.aggregation == expression.operand2.aggregation)
          expression.operand2.series = self._parseValue(value)

        expressions.push(expression)
      }
    });

    // Evaluate each expression
    var result = [];
    expressions.forEach(expression => {
      var op1series = { target: {}, datapoints: [] }
      op1series = expression.operand1.series
      var op2series = { target: {}, datapoints: [] }
      if (expression.operand2.series != null)
        op2series = expression.operand2.series
      var op2constant = expression.operand2.constant
      var op2type = expression.operand2type
      var operator = expression.operator
      var resultseries = [];

      // If the operand2 is a constant
      if (op2type == 'constant') {
        op1series.datapoints.forEach(datapoint => {
          var resultVal = self._evalOperator(operator, datapoint[0], op2constant);
          resultseries.push([resultVal, datapoint[1]])
        });
        result.push({
          target: op1series.target,
          datapoints: resultseries,
        });
      } else
        // The datapoints vectors for op1series and op2seris may not be aligned by timestamp... need extra logic to align timestamps.
        if (op1series.datapoints.length == 0 && op2series.datapoints.length == 0) {
          result.push({
            target: op1series.target,
            datapoints: [],
          });
        } else if (op1series.datapoints.length == 0) {
          result.push({
            target: op2series.target,
            datapoints: op2series.datapoints,
          });
        } else if (op2series.datapoints.length == 0) {
          result.push({
            target: op1series.target,
            datapoints: op1series.datapoints,
          });
        } else {
          var op1i = 0;
          var op2i = 0;
          while (op1i < op1series.datapoints.length && op2i < op2series.datapoints.length) {

            var op1timestamp = op1series.datapoints[op1i][1]
            var op2timestamp = op2series.datapoints[op2i][1]

            // the timestamp is the same
            if (op1timestamp == op2timestamp) {
              // eval operator
              var resultVal = self._evalOperator(operator, op1series.datapoints[op1i][0], op2series.datapoints[op2i][0]);
              resultseries.push([resultVal, op1series.datapoints[op1i][1]])
              op1i++;
              op2i++;
            }

            if (op1timestamp < op2timestamp) {
              // take op2 as 0
              var resultVal = self._evalOperator(operator, op1series.datapoints[op1i][0], 0);
              resultseries.push([resultVal, op1series.datapoints[op1i][1]])
              op1i++;
            }

            if (op1timestamp > op2timestamp) {
              // take op1 as 0
              var resultVal = self._evalOperator(operator, 0, op2series.datapoints[op2i][0]);
              resultseries.push([resultVal, op2series.datapoints[op2i][1]])
              op2i++;
            }
          }

          result.push({
            target: op1series.target,
            datapoints: resultseries,
          });
        }
    });

    return result;
  }

  _parseQueryResults(results) {
    var self = this;
    var value = results.response.Tables[0].Rows;
    value.alias = results.alias;
    value.aggregation = results.aggregation;

    return {
      target: self._parseTargetAlias(value),
      datapoints: self._getQueryTargetSeries(value)
    }
  }

  _parseValue(value) {
    var self = this;
    var segments = value.segments;
    return {
      target: self._parseTargetAlias(value),
      datapoints: self._getTargetSeries(segments, value.metric, value.aggregation)
    };
  }

  _getTargetSeries(segments, metric, aggregation) {
    var series = [];
    segments.forEach(function (segment) {
      series.push([segment[metric][aggregation], moment(segment.end).valueOf()]);
    });
    return series;
  }

  _getQueryTargetSeries(segments) {
    var series = [];
    segments.forEach(function (segment) {
      series.push([segment[1], moment(segment[0]).valueOf()]);
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

  _evalOperator(operator, op1, op2) {
    // Evaluate the operator
    switch (operator) {
      case '+':
        return op1 + op2;
      case '-':
        return op1 - op2;
      case '*':
        return op1 * op2;
      case '/':
        if (op2 != 0)
          return op1 / op2;
        else
          return 0;
      default:
        return op1;
    }
  }

  makeRequest(request) {
    console.log(request);
    var options: any = {
      method: "get",
      url: request.url,
      params: request.params,
      data: request.data,
    };

    options.headers = options.headers || {};
    options.headers["x-api-key"] = this.apiKey;
    return this.backendSrv.datasourceRequest(options).then(result => {
      return { response: result.data, refId: request.refId, type: request.type, alias: request.alias, metric: request.metric, aggregation: request.aggregation, metadata: request.metadata };
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

  testDatasource() {
    var url = this.apiUrl + this.appId + '/metrics/metadata';

    return this.makeRequest({ url: url }).then(() => {
      return { status: "success", message: "Data source is working", title: "Success" };
    });
  }

  getAllMetadata() {
    var url = this.apiUrl + this.appId + '/metrics/metadata';
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
    return this.makeRequest({ url: url }).then(response => {
      var aggregationOptionsList = []
      console.log("a");
      if (_.has(response.response.metrics[metricName], 'supportedAggregations')) {
        console.log("b");
       aggregationOptionsList = aggregationOptionsList.concat(response.response.metrics[metricName].supportedAggregations);
      }
      return aggregationOptionsList
    });
  }
}

export { AppInsightsDatasource };
