import { AppInsightsDatasource } from './datasource';
import { AppInsightsQueryCtrl } from './query_ctrl';

class AppInsightsConfigCtrl {
  static templateUrl = 'partials/config.html';
}

class AppInsightsQueryOptionsCtrl {
  static templateUrl = 'partials/query.options.html';
}

export {
  AppInsightsDatasource as Datasource,
  AppInsightsQueryCtrl as QueryCtrl,
  AppInsightsQueryOptionsCtrl as QueryOptionsCtrl,
  AppInsightsConfigCtrl as ConfigCtrl
};
