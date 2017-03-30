d3.json("output.json", (error, data) => {
	if (error) throw error;

  // a test
  // var bad = data.filter(function(d){ return d.flag == 1; });
  // console.log(bad);

  var categories = Object.keys(data[0].tags);
  categories.forEach(function(d){
  	$("#categories").append("<div class='label " + d + "'>" + strings.toStartCase(d) + "</div>")
  })

  data = _.sortBy(data, "seconds");

  count();

  function count() {
    var baseTime = 1;

    // set initial
    var sec = data[0].seconds;
    $("body").attr("data-sec", sec);

    var interval = setInterval(startInterval, baseTime);

    function startInterval() {
      sec = sec + 1;
      $("body").attr("data-sec", sec);

      var timeObj = calcTime(sec);

      $("#timer .hour").text(
        timeObj.hrs == 0
          ? 12
          : timeObj.hrs > 12 ? timeObj.hrs - 12 : timeObj.hrs
      );
      $("#timer .minute").text(strings.numberPrependZeros(timeObj.min, 2));
      $("#timer .second").text(strings.numberPrependZeros(timeObj.sec, 2));
      $("#timer .ampm").text(timeObj.hrs > 11 ? "p.m." : "a.m.");

      var tweet = data.filter(d => {
        return d.seconds == sec && d.flag == 1 && d.retweet == false;
      });
      if (tweet.length > 0) {        
        var t = tweet[0];
        
        $("#tweets").prepend("<div data-link='" + t.url + "' class='tweet'> \
        	<div class='col left-col'><a class='block-link' target='_blank' href='http://www.twitter.com/" + t.user_handle + "/'><img src='" + t.user_img + "' /></div> \
        	<div class='col right-col'><div class='user'><span class='name'>" + t.user_name + "</span><span class='handle'>@" + t.user_handle + "</span></a></div><div class='text'>" + t.text_html + "</div></div> \
        	</div>");
      }
    }



    $(".stopgo").click(function() {
      if ($(this).hasClass("go")) {
        $(this).removeClass("go").addClass("stop");
        $(this).html("<i class='fa fa-play' aria-hidden='true'></i>");
        clearInterval(interval);
      } else {
      	$(this).removeClass("stop").addClass("go");
      	$(this).html("<i class='fa fa-pause' aria-hidden='true'></i>");
      	interval = setInterval(startInterval, baseTime);
      }
    });

    function calcTime(sec) {
      var obj = {};

      var hrs = sec / 3600;
      var min = hrs % 1 * 60;

      obj.hrs = Math.floor(hrs);
      obj.min = Math.floor(min);
      obj.sec = Math.round(min % 1 * 60);

      return obj;
    }
  }

});


// block link hover
$(document).on("mouseover", "a.block-link", function(){
	
	$(this).closest(".tweet").find(".user .name").css({
		"color": "#4E78A0",
		"text-decoration": "underline"
	});
	
});
$(document).on("mouseout", "a.block-link", function(){
	
	$(this).closest(".tweet").find(".user .name").css({
		"color": "#14171a",
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