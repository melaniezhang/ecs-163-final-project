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

	var countryKeys = [];
	var countryCount = [];
	var countrycount = {};

	mydata.forEach(function(dataum){
		if(countrycount[dataum.country] === undefined){
			countrycount[dataum.country] = 0;
		}
	})

	mydata.forEach(function(dataum){
		if(countrycount[dataum.country] === undefined){
			countrycount[dataum.country]++;
		}
	})
	Object.keys(countrycount).forEach(function(key){
		countryCount.push(countrycount[key]);
		countryKeys.push(key);
	})

	function ready(error, data){
		var countries = topojson.feature(data, data.objects.countries1).features;
		svg1.selectAll(".country")
			.data(countries)
			.enter()
			.append("path")
			.attr("class", "country")
			.attr("d", path)
			.attr("fill", function(d){
				if(countryKeys.includes(d.properties["Alpha-2"])){
					return "grey";
				}
				return "lightgrey";
			})
			.attr("stroke", "black")
			.attr("transform", "translate(-100,110)")
			.on("mousemove",function(d){})
			.on("mouseover", function(d){})
			.on("mouseleave",function(d){})
			.on("click", function(d){
				var cate = {};
				var categories = [];
				var names = [];
				var colors = ["lightblue","lightblue","lightblue","lightblue","lightblue","lightblue","lightblue","lightblue","lightblue","lightblue","lightblue","lightblue","lightblue","lightblue","lightblue"];

				mydata.forEach(function(dataum){
					if(dataum.country === d.properties["Alpha-2"]){
						if(cate[dataum["main_category"]] === undefined){
							cate[dataum["main_category"]] = 0;
						}
					}
				}) 

				mydata.forEach(function(dataum){
					if(dataum.country === d.properties["Alpha-2"]){
						cate[dataum["main_category"]]++;
					}
				})

				Object.keys(cate).forEach(function(key){
					categories.push(cate[key]);
					names.push(key);
				})
				
				var scale = d3.scaleLinear()
							  .domain([d3.min(categories), d3.max(categories)])
							  .range([1,10]);

				for(i = 0; i <categories.length; i++){
					categories[i] = scale(categories[i]);
				}

				drawDo(d3.select("#v2"), 10, 15, categories, names, colors);
			});
	}
}

function drawDo(container, n, m, list, names, colors){
	container.selectAll("svg").remove();
	var svg = container.append('svg')
	 					.attr("width", 600)
	 					.attr("height", 600);

	var l = [];

	for(i = 0; i < m; i++){
		l.push(1);
	}

	var pie = d3.pie();
	var piedata = pie(l);


	var arcs = svg.selectAll(".do")
				  .data(piedata)
				  .enter()
				  .append("g")
				  .attr("class","do")
				  .attr("transform", "translate(150,150)");

	for(j = 1; j<=n; j++){
		var arc = d3.arc()
					.innerRadius(j*10)
					.outerRadius(j*10+10);	
		
		arcs.append("path")
			.attr("fill",function(d, i){
				if(j < list[i]){
					return colors[i];
				}
				else{
					return "white";
				}
			})
			.attr("d", function(d, i){
				return arc(d);
			})
			.attr("stroke", "green");
	}

	if(list.length === 0){
		return;
	}

	for(i = 0; i< m; i++){
		arcs.append("text")
			.text(function(d,i){
				return " : " +names[i];
			})
			.attr("x",200)
			.attr("y", function(d, i){
				return 13*i - 80;
			});

		arcs.append("rect")
			.attr("fill", function(d, i){
				return colors[i];
			})
			.attr("height", 10)
			.attr("width", 20)
			.attr("x",170)
			.attr("y", function(d, i){
				return 13*i - 90;
			});
	}
}