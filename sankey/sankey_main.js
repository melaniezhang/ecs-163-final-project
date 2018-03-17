// main category is category, category is sub category
// goal: split each category into its component sub categories

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scaleOrdinal(d3.schemeCategory10);

var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .extent([[1, 1], [width - 1, height - 6]]);


var categories = {};

var graphs = {};


d3.csv('kickstarter-projects/ks-projects-201801.csv', function(error, data){
	data.forEach(function(d) {
		if (!(d.main_category in categories)) {
			categories[d.main_category] = {};
			categories[d.main_category][d.category] = 1;
		}
		else {
			if (d.category in categories[d.main_category]) {
				categories[d.main_category][d.category]++;
			}
			else {
				categories[d.main_category][d.category] = 1;
			}
		}
	});
	console.log(categories)

	// append all categories as options on dropdown menu
	var cats = Object.keys(categories).sort();
	$('#categories').empty();
	$.each(cats, function(i, p) {
	    $('#categories').append($('<option></option>').val(p).html(p));
	});


	// now create a graph object (in sankey-friendly format) for each category
	for (var cat in categories) {
		var ctr = 1;
		graphs[cat] = {"nodes" : [], "links" : []};
		graphs[cat].nodes.push({ "node": 0, "name": cat } );
		for (var subcat in categories[cat]) {
			graphs[cat].nodes.push({ "node": ctr, "name": subcat } );
			graphs[cat].links.push({
					"source": 0,
					"target": ctr,
					"value": +categories[cat][subcat] });
			ctr++;
		}
	}

	console.log(graphs);

	// our initial screen
	updateGraph("Art", "steelblue");

});

// update the graph each time a new option is chosen
d3.select('#categories')
	.on("change", function () {
		var sect = document.getElementById("categories");
		var section = sect.options[sect.selectedIndex].value;
		updateGraph(section, "steelblue");
	});


function updateGraph(section, cat_color) {
	console.log(section);

	graph = graphs[section]
  	sankey(graph);

	// clear previous graph
	svg.selectAll("*").remove();

	var link = svg.append("g")
	    .attr("class", "links")
	    .attr("fill", "none")
	    .attr("stroke", "#000")
	    .attr("stroke-opacity", 0.2)
	  .selectAll("path");

	var node = svg.append("g")
	    .attr("class", "nodes")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", 10)
	  .selectAll("g");

  	link = link
    	.data(graph.links)
    	.enter().append("path")
      		.attr("d", d3.sankeyLinkHorizontal())
      		.attr("stroke-width", function(d) { return Math.max(1, d.width); });

  	link.append("title")
      	.text(function(d) { return d.source.name + " → " + d.target.name + "\n" + format(d.value); });

  	node = node
    	.data(graph.nodes)
    	.enter().append("g");

  	node.append("rect")
      	.attr("x", function(d) { return d.x0; })
      	.attr("y", function(d) { return d.y0; })
      	.attr("height", function(d) { return d.y1 - d.y0; })
      	.attr("width", function(d) { return d.x1 - d.x0; })
      	.attr("fill", function(d) { if (d.name == section) { return cat_color; }
      								else { return color(d.name.replace(/ .*/, "")); }
      							})
      	.attr("stroke", "#000");

  	node.append("text")
      	.attr("x", function(d) { return d.x0 - 6; })
      	.attr("y", function(d) { return (d.y1 + d.y0) / 2; })
      	.attr("dy", "0.35em")
      	.attr("text-anchor", "end")
      	.text(function(d) { return d.name; })
    	.filter(function(d) { return d.x0 < width / 2; })
      	.attr("x", function(d) { return d.x1 + 6; })
      	.attr("text-anchor", "start");

  	node.append("title")
      	.text(function(d) { return d.name + "\n" + format(d.value); });
}