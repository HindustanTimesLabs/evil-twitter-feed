function drawTimeChart(data, selector){

  // $(selector + " .time-chart").empty();

  var svg = d3.select(selector + " .time-chart")
      .append("svg")
      .attr("width", $(selector).width())
      .attr("height", 90);

  var responsive = {};
  var ww = $(window).width();
  if (ww <= 768){
    responsive.margin_right = 0;
    responsive.margin_left = 25;
  } else {
    responsive.margin_right = 0;
    responsive.margin_left = 25;
  }
  var margin = {top: 5, right: responsive.margin_right, bottom: 20, left: responsive.margin_left},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.05)
      .align(0.1);

  var y = d3.scaleLinear()
      .rangeRound([height, 0]);

  // var z = d3.scaleOrdinal()
  //     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var xAxis = d3
      .axisBottom(x)
      .tickSizeOuter(0)
      .tickSizeInner(3);

  var row_name = "time";
  var data_path = "result.csv";

  // d3.json("dutt_buckets.json", function(error, data) {
  //   if (error) throw error;

  var columns = Object.keys(data[0]);
  columns.shift();
  data.columns = columns;
  data.forEach(function(d, i) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
  });

  // console.log(data);
  var max = d3.max(data, function(d){ return d.total; });
  // console.log(max);

  var yAxis = d3
      .axisLeft(y)
      .tickValues([0,max]);

  var keys = columns;
  x.domain(data.map(function(d) { return d[row_name]; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();

  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
      .attr("class", function(d) { return "bar " + (d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("class", function(d){
        var t = d.data.time;
        var l = t.split(" ")[1].split(".")[0];
        var n = t.split(" ")[0].replace(":","")
        return "rect rect-" + n + l;
      })
      .attr("x", function(d) { return x(d.data[row_name]); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth());

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  g.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    // .append("text")
    //   .attr("x", 2)
    //   .attr("y", y(y.ticks().pop()) - 15)
    //   .attr("dy", "0.32em")
    //   .attr("fill", "#000")
    //   .attr("font-weight", "bold")
    //   .attr("text-anchor", "start")
    //   .text("Tweets by category, per half hour");

  $(selector + " .x.axis .tick text").each(function(i,d){
    if (i%2==1){
      $(d).hide();
    } else {
      var t = $(d).text();
      
      t = t.split(":")[0] + t.split(" ")[1]
        .replace(".m.","");
      
      $(d).text(t);
    }
  });

}