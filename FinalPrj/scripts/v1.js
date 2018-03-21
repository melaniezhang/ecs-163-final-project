function v1(mydata, container1){
	//create svg 
	var svg1 = container1.append("svg")
					   .attr("width", 700)
					   .attr("height", 400);

	//load topo json file for world map
	d3.queue()
	  .defer(d3.json, "data/world-countries.json")
	  .await(ready);

	//create a projection for the map
	var pj = d3.geoMercator()
			   .scale(97);

	var path = d3.geoPath()
				 .projection(pj);

	var countryKeys = [];
	var countryCount = [];
	var countrycount = {};

	mydata.sort(function(a, b) {return a.main_category.localeCompare(b.main_category);});	//added sorting by main_category

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

	//added
	var mainCategories = [];
	mydata.forEach(function(d) {
		if (mainCategories.includes(d.main_category))
			mainCategories.push(d.main_category);
	})
	var colorScale = d3.scaleOrdinal()	//colorScale(main_category)->color
			.domain(mainCategories)
			.range(d3.schemeCategory20);

	//create dropdown manu
	var menu = d3.select("#dropdown")
				 .append("select")
				 .attr("class", "options");

	menu.append("option")
		.attr("value", "a")
		.text("All Projects");

	menu.append("option")
		.attr("value", "p")
		.text("Percentage of SUccessful Projects");

	//drawing world map
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
			.attr("transform", "translate(-180,34)")
			.on("mousemove",function(d){	//added
				d3.select("#tooltip1")
						.style('left', (d3.event.pageX + 10) + 'px')
						.style('top', (d3.event.pageY - 20) + 'px');
			})
			.on("mouseover", function(d){	//added
				if(countryKeys.includes(d.properties["Alpha-2"])){
					d3.select("#tooltip1")
							.style('display', 'block')
							.style('left', (d3.event.pageX + 10) + 'px')
							.style('top', (d3.event.pageY - 20) + 'px')
							.html(d.properties.name);
				}
			})
			.on("mouseleave",function(d){	//added
				d3.select("#tooltip1")
					.style('display', 'none');})
			.on("click", function(d){

				var menu = d3.select(".options");

				//change visibility to "hidden" when another country is clicked
				if (document.getElementById("v4").style.visibility === "visible") {
					document.getElementById("v3").style.visibility = "hidden";
					document.getElementById("v4").style.visibility = "hidden";
				}

				//draw a radar based on selected country at the beginning
				update(d, mydata, colorScale, d3.select("#v2"));

				//update the radar chart based on dropdown selection
				menu.on("change", function(){
					update(d, mydata, colorScale, d3.select("#v2"));
				})

			});
	}
}

//function to draw radar chart(drawing stacking donut)
function drawDo(container, n, m, list, names, colors, country){	//added ", country"
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
				if(j <= list[i]){	//changed from "<" to "<="
					return colors(names[i]);	//changed
				}
				else{
					return "white";
				}
			})
			.attr("d", function(d, i){
				return arc(d);
			})
			.attr("stroke", "green")
			.attr("class", function(d,i){return names[i];})	//added
			.on("mousemove",function(d){	//added
        d3.select("#tooltip2")
            .style('left', (d3.event.pageX + 10) + 'px')
            .style('top', (d3.event.pageY - 20) + 'px');
			})
			.on("mouseover", function(d){	//added
				if (this.className.baseVal !== "") {
					d3.select("#tooltip2")
							.style('display', 'block')
							.style('left', (d3.event.pageX + 10) + 'px')
							.style('top', (d3.event.pageY - 20) + 'px')
							.html(this.className.baseVal);
				}
			})
			.on("mouseleave",function(d){	//added
				d3.select("#tooltip2")
					.style('display', 'none');
			})
			.on("click", function(d){
				if (this.classList !== []) {
					// sankey shows up
					updateGraph(this.className.baseVal, colors(this.className.baseVal), country);
					// sunburst shows up
					v4(this.className.baseVal.toLowerCase().replace(/ /gi, "_").replace(/&/gi, "and"), colors(this.className.baseVal));
					//change visibility to "visible" if <div> were "hidden"
				  if (document.getElementById("v4").style.visibility === "hidden") {
						document.getElementById("v3").style.visibility = "visible";
				   	    document.getElementById("v4").style.visibility = "visible";
					}
				}
			});
	}

	if(list.length === 0){
		return;
	}

	//for(i = 0; i< m; i++){	//omit for loop
	arcs.append("text")
		.text(function(d,i){
			if (i < names.length)	//added if statement
				return " : " +names[i];
		})
		.attr("x",200)
		.attr("y", function(d, i){
			return 13*i - 80;
		});

	arcs.append("rect")
		.attr("fill", function(d, i){
			if (i < names.length)	//added if statement
				return colors(names[i]);	//changed
			else	//added else statement
				return "none";
		})
		.attr("height", 10)
		.attr("width", 20)
		.attr("x",170)
		.attr("y", function(d, i){
			return 13*i - 90;
		});
	//}
	//code added below
	svg.append("text")
		.text(country)
		.attr("x", 30)
		.attr("y", 20)
		.attr("font-size", "18px")
		.attr("font-style", "italic");
}

//update function for radar chart after filted by dropdowm manue
function update(d, mydata, colorScale, container){
				if(d3.select(".options").property("value") === "a"){
					var cate = {};
					var categories = [];
					var names = [];

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
						drawDo(container, 10, 15, categories, names, colorScale, d.properties["Alpha-2"]);
					}
				else{
					var cate = {};
					var suc = {}
					var categories = [];
					var successful = [];
					var names = [];

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

					mydata.forEach(function(dataum){
						if(dataum.country === d.properties["Alpha-2"]){
							if(suc[dataum["main_category"]] === undefined){
								suc[dataum["main_category"]] = 0;
							}
						}
					})

					mydata.forEach(function(dataum){
						if(dataum.country === d.properties["Alpha-2"] && dataum.state === "successful"){
							suc[dataum["main_category"]]++;
						}
					})

					Object.keys(cate).forEach(function(key){
						categories.push(cate[key]);
						successful.push(suc[key]);
						names.push(key);
					})

					for(i = 0; i < successful.length; i++){
						categories[i] = successful[i]/categories[i];
					}

					var scale = d3.scaleLinear()
								  .domain([d3.min(categories), d3.max(categories)])
								  .range([1,10]);

					for(i = 0; i <categories.length; i++){
						categories[i] = scale(categories[i]);
					}
					drawDo(container, 10, 15, categories, names, colorScale, d.properties["Alpha-2"]);
				}
}
//add <div> for tooltip
var newtt1 = document.createElement("div");
newtt1.setAttribute("id", "tooltip1");
newtt1.classList.add("tooltip");
document.body.insertBefore(newtt1, document.getElementById("v1").nextSibling);

var newtt2 = document.createElement("div");
newtt2.setAttribute("id", "tooltip2");
newtt2.classList.add("tooltip");
document.body.insertBefore(newtt2, document.getElementById("v2").nextSibling);
