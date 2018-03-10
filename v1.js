function v1(mydata, container1){
	var svg1 = container1.append("svg")
					   .attr("width", 800)
					   .attr("height", 500);

	d3.queue()
	  .defer(d3.json, "data/world-countries.json")
	  .await(ready);

	var pj = d3.geoMercator()
			   .scale(100);

	var path = d3.geoPath()
				 .projection(pj);

	function ready(error, data){
		var countries = topojson.feature(data, data.objects.countries1).features;

		svg1.selectAll(".country")
			.data(countries)
			.enter()
			.append("path")
			.attr("class", "country")
			.attr("d", path)
			.attr("fill", "lightgrey")
			.attr("stroke", "black")
			.attr("transform", "translate(-100,110)")
			.on("mousemove",function(d){})
			.on("mouseover", function(d){})
			.on("mouseleave",function(d){})
			.on("click", function(d){

			});
	}
}