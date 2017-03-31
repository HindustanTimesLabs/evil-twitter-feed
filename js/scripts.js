d3.json("output.json", (error, data) => {
	if (error) throw error;

  // data.forEach(function(d){

  //   if (
  //     d.tags.sexual.length == 0 &&
  //     d.tags.racial.length == 0 &&
  //     d.tags.general.length == 0 &&
  //     d.tags.political.length == 0 &&
  //     d.tags.violent.length == 0
  //   ) {
  //     d.flag = 0;
  //   } else {
  //     d.flag = 1;
  //   }

  //   return d;

  // });

  // a test
  // var bad = data.filter(function(d){ return d.flag == 1; });
  // console.log(bad);

  var categories = Object.keys(data[0].tags);
  categories.forEach(function(d){
  	$("#categories").append("<div class='cat " + d + "'>" + strings.toStartCase(d) + "</div>")
  })

  data = _.sortBy(data, "seconds");

  count();

  function count() {
    var baseTime = 1;

    // set initial
    var sec = 3600 * 6;
    // var sec = data[0].seconds;
    $("body").attr("data-sec", sec);

    var interval = setInterval(startInterval, baseTime);

    function startInterval() {
      sec = sec + 1 == 86400 ? 0 : sec +1;
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
        return d.seconds == sec;
      });
      if (tweet.length > 0) {        
        var t = tweet[0];
        console.log(t);

        var dd = $("#timer .hour").text().trim() + ":" + $("#timer .minute").text().trim() + " " + $("#timer .ampm").text().trim();
        
        

        t.text_html = t.text_html.replaceAll('<span class="tag tag-<',"<").replaceAll('</span>al">',"</span>").replaceAll('<span class="tag tag-sexual">sex.</span><span class="tag tag-sexual">sex.</span>/span>', '<span class="tag tag-sexual">sex.</span>').replaceAll('<span class="tag tag-<span class="tag tag-sexual">sex.</span>ual">ass</span>','<span class="tag tag-sexual">ass</span>');

        console.log(t.text_html);

        $("#tweets").prepend("<div data-link='" + t.url + "' class='tweet'> \
        	<div class='col left-col'><a class='block-link' target='_blank' href='http://www.twitter.com/" + t.user_handle + "/'><img src='" + t.user_img + "' /></div> \
        	<div class='col right-col'><div class='user'><span class='name'>" + t.user_name + "</span><span class='handle'>@" + t.user_handle + "</span></a>&nbsp;<span style='font-size:.7em;'>&bull;</span>&nbsp;<span class='date-display'><a href='" + t.url + "'>" + dd + "</a></span></div><div class='text'>" + t.text_html + "</div></div> \
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

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};