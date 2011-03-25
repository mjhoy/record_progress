/*
 * mjhoy | michael.john.hoy@gmail.com | 2011
 * 
 * Requires underscore.js and protovis.js.
 */

(function (window, _, pv) {

  if (Drupal.jsEnabled) {

    /**
     * Set up the protovis graph in `domElement` for `dataSet`.
     */
    function setupProtovisGraph (domElement, name, dataSet) {
      var min_x, min_y, max_x, max_y;

      // Uses filter `filter` (meant to be either _.min or _.max) 
      // on property `property` for an array of arrays.
      function nestedFilter(filter, property) {
        return filter(_.map(dataSet, function(data) {
          return parseInt(filter(data, function (i) { 
            return parseInt(i[property], 10);} )[property], 10);
        }));
      }

      min_x = nestedFilter(_.min, 'x');
      min_y = nestedFilter(_.min, 'y');
      max_x = nestedFilter(_.max, 'x');
      max_y = nestedFilter(_.max, 'y');
    }

    $(document).ready(function () {

      var graphContainerSelector = 'dd.tracking-data-graph-container',
          placeholderClass = 'graph-placeholder',
          // The JSON url for the data is set by the Drupal module.
          json_url = Drupal.settings.tracking_data.json_url;

      if (json_url) {

        // Add in placeholder text. This replaces "You require JavaScript..."
        $(graphContainerSelector).html('<div class="' + placeholderClass + '">Loading protovis graph...</div>');

        $.getJSON(json_url, function(data) {

          // Each key of the data object points to a dataset for its own graph.
          // The key is also the name of the dataset. E.g., "Lifts", "Metcons".
          var keys = _.keys(data);

          // For each key, set up a graph.
          _.each(keys, function (key) {

            var dataSet = data[key],
                domEl = $(graphContainerSelector + '[data-graph="' + key + '"] .' + placeholderClass)[0];

            setupProtovisGraph(domEl, key, dataSet);
          });
        });

      } 
      // json_url didn't exist: there was some error.
      else {
        $(graphContainerSelector).html('<div class="' + placeholderClass + '">Error loading graph.</div>');
      }

        // Top level taxonomy term that defines the type of data in a graph.
        // See tracking_data.module.
        // var graphType = $(this).attr('data-graph');

        // The HTML element to which Protovis will render a graph
        // var el = $(this).find('.graph-placeholder')[0];

    });

  }

}(this, _, pv));
