var server_name= "http://127.0.0.1:3000/";
var socket=io.connect(server_name);

console.log('Connecting to Server' + server_name);

jQuery(function($){   //input to the JQuery Element
	var loveTweet = $('ul.loveTweets'); //Element for Love Tweet
	var hateTweet = $('ul.hateTweets'); //Element for Hate Tweet
	var lovePercent = $('li.lovePercent'); //Element for Love Tweet Percent
	var hatePercent = $('li.hatePercent'); //Element for Hate Tweet Percent
	var loveCount = $('li.love'); 	       // Element for Love Count
	var hateCount = $('li.hate'); 	       // Elemnt for Hate Count
	var totalCount = $('li.total');	       //Element for Total Count of Tweets
	//Property Setting for CanvasJS for displaying Pie Chart
	var chart = new CanvasJS.Chart("chartContainer", { 
		theme: "theme1",
		legend: {
			verticalAlign: "bottom",
			horizontalAlign: "center"
		},
		animationEnabled: true
	});

	//Event Handler for 'tweet' event sent by Node server
	socket.on('tweet', function(data){
	var tweetData = data.text.toLowerCase();
	
	//Adding the Love Tweet to the list and limit the tweet list to 10 on display
	if(tweetData.indexOf("love") != -1){   
		loveTweet.prepend('<li>' + data.user + ': ' + tweetData + '</li>');
		if( $('ul.loveTweets li').size() > 10 ) {
			$('ul.loveTweets li:gt(10)').remove();
		}
		
	}
	
	//Adding the Hate Tweet to the list and limit the tweet list to 10 on display
	if(tweetData.indexOf("hate") != -1){
		hateTweet.prepend('<li>' + data.user + ': ' + tweetData + '</li>');
		if( $('ul.hateTweets li').size() > 10 ) {
			$('ul.hateTweets li:gt(10)').remove();
		}
	}

	//Setting the Love and Hate Percent and Count Display
	loveCount.text('Love Tweet Count: ' + data.love);
	hateCount.text('Hate Tweet Count: ' + data.hate);
	lovePercent.text('Love Percent: ' + data.lovePercent.toFixed(2) + '%');
	hatePercent.text('Hate Percent: ' + data.hatePercent.toFixed(2) + '%');
	totalCount.text('Total Count: ' + data.totalCount);

	// Configuration of the CanvasJS Pie Chart	
	var config = {
		type: "pie",
		indexLabelFontFamily: "Garamond",       
		indexLabelFontSize: 20,
		indexLabelFontWeight: "bold",
		startAngle:0,
		indexLabelFontColor: "MistyRose",       
		indexLabelLineColor: "darkgrey", 
		indexLabelPlacement: "inside", 
		showInLegend: true,
		indexLabel: "#percent%",
		dataPoints: [	//Setting Data Points as Love and Hate Percentage
			{label: "Love", name: "Love Tweets", y:data.lovePercent},
			{label:"Hate", name:"Hate Tweets", y:data.hatePercent}
		]
	};

	chart.options.data = [];
	chart.options.data.push(config);
	chart.render();
	});
});
