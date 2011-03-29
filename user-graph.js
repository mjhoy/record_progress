/*
 * mjhoy | michael.john.hoy@gmail.com | 2011
 * 
 * Requires underscore.js and protovis.js.
 */

(function (window, _, pv) {

  if (Drupal.jsEnabled) {

    // TODO: make this an attribute on the taxonomy terms? not sure
    // how to do this.
    //
    // these colors come from http://colorapi.com/ searching "gym",
    // "workout", "weight lifting"...
    var colorCycle = [
      "#A75625",
      "#592409",
      "#474D53",
      "#587399",
      "#493E2A"
    ];

    var colorIndex = 0;

    // Uses filter `filter` (meant to be either _.min or _.max) 
    // on property `property` for an array of arrays.
    function nestedFilter(dataSet, filter, property) {
      return filter(_.map(dataSet, function(data) {
        return parseInt(filter(data, function (i) { 
          return parseInt(i[property], 10);} )[property], 10);
        }));
      }

    /**
     * Set up the protovis graph in `domElement` for `dataSet`.
     */
    function setupProtovisGraph (domEl, name, dataSet) {
      var vis,
          min_x = nestedFilter(dataSet, _.min, 'x'),
          min_y = nestedFilter(dataSet, _.min, 'y'),
          max_x = nestedFilter(dataSet, _.max, 'x'),
          max_y = nestedFilter(dataSet, _.max, 'y'),
          w = 555,
          h = 200,
          x = pv.Scale.linear((min_x - 40), (max_x + 40)).range(0, w),
          y = pv.Scale.linear((min_y - 50), (max_y + 50)).range(0, h),
          paddingRight = 100;

      vis = new pv.Panel()
        .width(w + paddingRight)
        .height(h)
        .canvas(domEl);

      graph = vis.add(pv.Panel)
        .width(w)
        .height(h);

      /* Y-axis rule */
      graph.add(pv.Rule)
        .data(pv.range(0, (max_y + 50), 50))
        .bottom(function(d) { if (y(d) > 10) {return  y(d);} })
        .strokeStyle("#aaa")
        .add(pv.Label);

      var months = [
        { n: 1, month: "Jan"},
        { n: 32, month: "Feb"},
        { n: 60, month: "Mar"},
        { n: 91, month: "Apr"},
        { n: 121, month: "May"},
        { n: 152, month: "Jun"},
        { n: 182, month: "Jul"},
        { n: 213, month: "Aug"},
        { n: 244, month: "Sep"},
        { n: 274, month: "Oct"},
        { n: 305, month: "Nov"},
        { n: 335, month: "Dec"}
      ];

      /* X-axis rule */
      graph.add(pv.Rule)
        .data(months)
        .left(function(d) { if (x(d['n']) > 15) { return x(d['n']); } else { return -20; } })
        .strokeStyle("#ccc")
        .add(pv.Label)
        .bottom(5)
        .text(function(d) { return d['month']; });

      _.map(dataSet, function(data, index) {
        graph.add(pv.Dot)
          .data(data)
          .bottom(function(d) { return y(d['y']); })
          .left(function(d) { return x(d['x']); })
          .strokeStyle(function (d) { return (dataSet[index]['color'] || "#aaa"); })
          .add(pv.Line);
      });

      /* Legend */
      console.log(dataSet, name);
      var legendY = 0;

      _.map(dataSet, function(data, key) {
        legendY = legendY + 20;
        vis.add(pv.Dot)
          .data([key])
          .top(legendY)
          .right(80)
          .fillStyle(function (d) { return (dataSet[key]['color'] || "#aaa"); })
          .strokeStyle(function (d) { return (dataSet[key]['color'] || "#aaa"); })
          .anchor("right").add(pv.Label);
      });

      vis.render();
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

            // Apply colors from the color cycle
            _.each(dataSet, function (d) {
              if (!d.color) {
                d.color = colorCycle[colorIndex];
                colorIndex = (colorIndex + 1) % colorCycle.length;
              }
            });

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
