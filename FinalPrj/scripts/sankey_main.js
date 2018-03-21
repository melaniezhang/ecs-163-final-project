// sankey_main.js
// reads in all data in sankey-friendly format
// separates by country, and then by cateogory, and counts all subcategories
// generates actual sankey diagram in function updateGraph

// append svg element
var svg = d3.select("#v3").select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// formatting, color
var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scaleOrdinal(d3.schemeCategory10);

// define sankey
var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 6]]);

var country_categories = {};

var country_graphs = {};

// read in data
d3.csv('data/ks-projects-201801.csv', function(error, data){
	data.forEach(function(d) {
		if (!(d.country in country_categories)) {
			country_categories[d.country] = {};
		}
		if (!(d.main_category in country_categories[d.country])) {
			country_categories[d.country][d.main_category] = {};
			country_categories[d.country][d.main_category][d.category] = 1;
		}
		else {
			if (d.category in country_categories[d.country][d.main_category]) {
				country_categories[d.country][d.main_category][d.category]++;
			}
			else {
				country_categories[d.country][d.main_category][d.category] = 1;
			}
		}
	});

	// debug
	console.log(country_categories);

	// now create a graph object (in sankey-friendly format) for each country & category
	for (var country in country_categories) {
		country_graphs[country] = {};
		for (var cat in country_categories[country]) {
			var ctr = 1;
			country_graphs[country][cat] = {"nodes" : [], "links" : []};
			country_graphs[country][cat].nodes.push({ "node": 0, "name": cat } );
			for (var subcat in country_categories[country][cat]) {
				country_graphs[country][cat].nodes.push({ "node": ctr, "name": subcat } );
				country_graphs[country][cat].links.push({
						"source": 0,
						"target": ctr,
						"value": +country_categories[country][cat][subcat] });
				ctr++;
			}
		}
	}

	// debug
	console.log("COUNTRY GRAPHS")
	console.log(country_graphs);

});

function updateGraph(section, cat_color, country) {

	graph = country_graphs[country][section];

	// sankey-ify!
  	sankey(graph);

	// clear previous graph
	svg.selectAll("*").remove();

	// link groups
	var link = svg.append("g")
	    .attr("class", "links")
	    .attr("fill", "none")
	    .attr("stroke", "#000")
	    .attr("stroke-opacity", 0.2)
	  .selectAll("path");

	// node groups
	var node = svg.append("g")
	    .attr("class", "nodes")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", 10)
	  .selectAll("g");

	// width of links will be values from data (in sankey format)
  	link = link
    	.data(graph.links)
    	.enter().append("path")
      		.attr("d", d3.sankeyLinkHorizontal())
      		.attr("stroke-width", function(d) { return Math.max(1, d.width); });

    // nodes from data
  	node = node
    	.data(graph.nodes)
    	.enter().append("g");

  	// actually generate the nodes, which will be rectangles for each category & subcategory
  	node.append("rect")
      	.attr("x", function(d) { return d.x0; })
      	.attr("y", function(d) { return d.y0; })
      	.attr("height", function(d) { return d.y1 - d.y0; })
      	.attr("width", function(d) { return d.x1 - d.x0; })
      	.attr("fill", function(d) { return cat_color; })
      	.attr("stroke", "#000");

    // labels
  	node.append("text")
      	.attr("x", function(d) { return d.x0 - 6; })
      	.attr("y", function(d) { return (d.y1 + d.y0) / 2; })
      	.attr("dy", "0.35em")
      	.attr("text-anchor", "end")
      	.text(function(d) { return d.name; })
    	.filter(function(d) { return d.x0 < width / 2; })
      	.attr("x", function(d) { return d.x1 + 6; })
      	.attr("text-anchor", "start");
}
