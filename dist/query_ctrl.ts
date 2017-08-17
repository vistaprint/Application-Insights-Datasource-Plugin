///<reference path="../typings/tsd.d.ts" />
import _ from 'lodash';
import { QueryCtrl } from 'app/plugins/sdk';

class AppInsightsQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';
  refresh: any;
  datasource: any;
  metrics_types: any[];
  aggregations: any[];
  type: any;

  /** @ngInject **/
  constructor($scope, $injector) {
    super($scope, $injector);
    this.getMetricOptions();
    this.resetAggregation(this.target.metric);
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
    this.refresh();
  }

  onChangeInternal() {
    this.refresh(); // Asks the panel to refresh data.
  }

}

export { AppInsightsQueryCtrl };
