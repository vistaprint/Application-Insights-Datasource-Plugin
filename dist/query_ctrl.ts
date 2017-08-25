///<reference path="../typings/tsd.d.ts" />
import _ from 'lodash';
import { QueryCtrl } from 'app/plugins/sdk';

class AppInsightsQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';
  refresh: any;
  datasource: any;
  metrics_types: any[];
  aggregations: any[];
  aggregationsOperand2: any[];
  type: any;
  apiTypes: any[];
  operators: any;
  operator: any;
  operand2types: any;
  operand2type: any;
  isOperand2Visible: boolean;
  isOperand2metric: boolean;
  isOperand2constant: boolean;

  /** @ngInject **/
  constructor($scope, $injector) {
    super($scope, $injector);
    this.apiTypes = ["Metric","Query"]

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
  };

  getMetricOptions() {
    if (this.metrics_types) {
      return Promise.resolve(this.metrics_types);
    } else {
      return this.datasource.getAllMetadata()
        .then(metrics => {
          this.metrics_types = metrics;
          return metrics;
        });
    }
  }

  resetAggregation(metric) {
    this.aggregations = this.datasource.getAggregations(metric).then(aggregations => {
      this.aggregations = aggregations;
    })
  }

  resetAggregationOperand2(metric) {
    this.aggregationsOperand2 = this.datasource.getAggregations(metric).then(aggregations => {
      this.aggregationsOperand2 = aggregations;
    })
  }

  // Shows the second operand selection if the operator is defined
  toggleType() {
    if (this.target.type != "metric") {
      this.isOperand2Visible = false;
      this.target.metric = "";
      this.target.aggregations = "";
      this.target.operator = "";
      this.target.constantOperand2 = "";
      this.target.metricOperand2 = "";
      this.target.aggregationsOperand2 = "";
    }
  }

  // Shows the second operand selection if the operator is defined
  toggleOperand2() {
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
  }

  // Shows the metric or constant operand 2
  toggleOperand2type() {
    if (!this.isOperand2Visible) {
      this.isOperand2metric = false;
      this.isOperand2constant = false;
    } else if (this.target.operand2type == 'metric') {
      this.isOperand2metric = true;
      this.isOperand2constant = false;
    } else if (this.target.operand2type == 'constant') {
      this.isOperand2metric = false;
      this.isOperand2constant = true;
    }
  }

  onChangeInternal() {
    this.refresh(); // Asks the panel to refresh data.
  }

}

export { AppInsightsQueryCtrl };
