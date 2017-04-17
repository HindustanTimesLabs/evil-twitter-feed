$(".person-container").each(function(i, d){

  doit(d);

});


function doit(container){

  // console.log(container);
  var data_path = "data/" + $(container).attr("data") + ".json";
  var selector = "." + $(container).attr("class").split(" ").join(".");
  // console.log(selector);

  d3.json(data_path, (error, data) => {
    if (error) throw error;

    console.log("Total tweets: " + data.length);

    var categories = Object.keys(data[0].tags);
    categories.forEach(function(d){
      $(selector + " .categories").append("<div class='cat " + d + "'>" + strings.toStartCase(d) + "</div>")
    })

    data = _.sortBy(data, "seconds");

    // get the data in the format we need for a stacked area chart

    // first, we need a bucket for every ten minutes, which is 600 seconds
    var seconds_extent = d3.extent(data, function(d){ return d.seconds; });
    var time_buckets = [];
    for (var i = 0; i <= 3600 * 24; i += 1800){
      time_buckets.push(i);
    }

    // time_buckets.splice(-1,1); // remove the last item
    var bar_data = [];

    time_buckets.forEach(function(bucket, bucket_index){

      // create an object
      var obj = {};
      var time = calcTime(bucket); // the time is the bucket
      obj.time = calcFormattedTime(time);

      var ampm = obj.time.split(" ")[1];

      var li = obj.time.lastIndexOf(":");
      obj.time = obj.time.substr(0,li) + " " + ampm;

      // get the tweets that fall into that bucket
      var tweets = data.filter(function(tweet){
        if (tweet.seconds >= bucket && tweet.seconds <= time_buckets[bucket_index+1]){
          return tweet;
        }
      });

      // make a column for each category
      categories.forEach(function(category){
        obj[category] = 0;
      });

      tweets.forEach(function(tweet){
        
        // so what categories does the tweet have?
        categories.forEach(function(category){

           // console.log("category " + category + ": "+ tweet.tags[category].length);
           obj[category] = obj[category] + tweet.tags[category].length;

        });

      });

      bar_data.push(obj);

    });

    drawTimeChart(bar_data, selector);
    // $(window).smartresize(function(){
    //   drawTimeChart(bar_data, selector);
    // });

    count();

    function count() {
      var baseTime = 1;

      // set initial
      // var sec = 3600 * 6;
      var sec = 0;
      var sec = data[0].seconds;
      // console.log(sec);
      $("body").attr("data-sec", sec);

      var interval = setInterval(startInterval, baseTime);

      function startInterval() {
        sec = sec + 1 == 86400 ? 0 : sec +1;
        $("body").attr("data-sec", sec);

        var timeObj = calcTime(sec);
        var horas = (timeObj.hrs == 0 ? 12 : timeObj.hrs > 12 ? timeObj.hrs - 12 : timeObj.hrs).toString()
        
        // show the bar class
        var rect_class = horas + doubleDig(timeObj.min) + (timeObj.hrs > 11 ? "p" : "a")
        $(selector + " .rect-" + rect_class).css("opacity", 1);

        $(selector + " .timer .hour").text(horas);
        $(selector + " .timer .minute").text(strings.numberPrependZeros(timeObj.min, 2));
        $(selector + " .timer .second").text(strings.numberPrependZeros(timeObj.sec, 2));
        $(selector + " .timer .ampm").text(timeObj.hrs > 11 ? "p.m." : "a.m.");

        var tweet = data.filter(d => {
          return d.seconds == sec;
        });
        if (tweet.length > 0) {        
          var t = tweet[0];
          var dd = $(selector + " .timer .hour").text().trim() + ":" + $(selector + " .timer .minute").text().trim() + " " + $(selector + " .timer .ampm").text().trim();

          $(selector + " .tweets").prepend("<div data-link='" + t.url + "' class='tweet'> \
            <div class='col left-col'><a class='block-link' target='_blank' href='http://www.twitter.com/" + t.user_handle + "/'><img src='" + t.user_img + "' /></div> \
            <div class='col right-col'><div class='user'><span class='name'>" + t.user_name + "</span><span class='handle'>@" + t.user_handle + "</span></a>&nbsp;<span style='font-size:.7em;'>&bull;</span>&nbsp;<span class='date-display'><a href='" + t.url + "'>" + dd + "</a></span></div><div class='text'>" + t.text_html + "</div></div> \
            </div>");
        }
      }

      $(selector + " .stopgo").click(function() {
        if ($(this).hasClass("go")) {
          $(this).removeClass("go").addClass("stop");
          $(this).html("<i class='fa fa-play' aria-hidden='true'></i> Play");
          clearInterval(interval);
        } else {
          $(this).removeClass("stop").addClass("go");
          $(this).html("<i class='fa fa-pause' aria-hidden='true'></i> Pause");
          interval = setInterval(startInterval, baseTime);
        }
      });

    }

  });

  function calcTime(sec) {

    var obj = {};

    var hrs = sec / 3600;
    var min = hrs % 1 * 60;

    obj.hrs = Math.floor(hrs);
    obj.min = Math.floor(min);
    obj.sec = Math.round(min % 1 * 60);
    if (obj.sec == 60) {
      obj.min = obj.min + 1;
      obj.sec = 0;
    }

    return obj;
  }

  function calcFormattedTime(time_object){
    return (time_object.hrs == 0 ? 12 : time_object.hrs > 12 ? time_object.hrs - 12 : time_object.hrs) + ":" + (doubleDig(time_object.min)) + ":" + (doubleDig(time_object.sec)) + " " + (time_object.hrs > 11 ? "p.m." : "a.m.")
  }
  function doubleDig(n){
    return n.toString().length < 2 ? "0" + n : n;
  }


  // block link hover
  $(document).on("mouseover", "a.block-link", function(){
    
    $(this).closest(".tweet").find(".user .name").css({
      "color": ".4E78A0",
      "text-decoration": "underline"
    });
    
  });
  $(document).on("mouseout", "a.block-link", function(){
    
    $(this).closest(".tweet").find(".user .name").css({
      "color": ".14171a",
      "text-decoration": "none"
    });
    
  });

  // tweet click handler
  $(document).on("click", ".tweet", function(e){

    var test = $(e.target).closest("a").length > 0;
    
    if (!test){
      window.open($(this).closest(".tweet").attr("data-link"))
    }

  });

  // scroll only on mouseover so it doesn't get all wonky
  $(".tweets").mouseover(function(){
    $(this).css("overflow","scroll");
  }).mouseout(function(){
    $(this).css("overflow","hidden");
  });
} // end doit()




String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};