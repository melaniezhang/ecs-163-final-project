// sunburst.js
// Author: Sarah Quick
// ECS163 Final Project

// Resources:
// Max's Interactivity Example
// Sunburst Tutorial: https://gist.github.com/denjn5/e1cdbbe586ac31747b4a304f8f86efa5
// Sunburst Example: https://bl.ocks.org/mbostock/4063423
// Color Scheme Colors: https://stackoverflow.com/questions/17569205/d3-scale-category20b-always-returning-first-color
// D3 API: https://github.com/d3/d3/blob/master/API.md
// d3 Hierarchy API: https://github.com/d3/d3-hierarchy/blob/master/README.md#treemap

// JSON data
var nodeData = {
    "name": "TOPICS", "children": [{
        "name": "Topic A",
        "children": [{"name": "Sub A1", "size": 10}, {"name": "Sub A2", "size": 40}]
    }, {
        "name": "Topic B",
        "children": [{"name": "Sub B1", "size": 30}, {"name": "Sub B2", "size": 30}, {
            "name": "Sub B3", "size": 30}]
    }, {
        "name": "Topic C",
        "children": [{"name": "Sub A1", "size": 40}, {"name": "Sub A2", "size": 50}]
    }]
};

function computeTextRotation(d) {
    var angle = (d.x0 + d.x1) / Math.PI * 90;
    // Avoid upside-down labels
    return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
    //return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
}


function Sunburst(category) {

// Variables
    var width = 300;
    var height = 300;
    var radius = Math.min(width, height) / 2;
    var color = d3.scaleOrdinal(d3.schemeCategory20b);

// Create svg
    var svg = d3.select('#v4').append('svg')  //changed from 'body' to '#v4'
        .attr("class", "Sunburst")
        .attr('width', width * 2)
        .attr('height', height);
/*
    // Create svg
    var svg2 = d3.select('body').append('svg')
        .attr("class", "Sunburst")
        .attr('width', width)
        .attr('height', height);
*/
    this.update = function (category, cateColor) {

        // Remove existing sunBurst
        svg.selectAll('*').remove();

        // append group to svg
        var g = svg.append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        // Initializes partition layout and sets size
        var partition = d3.partition()
            .size([2 * Math.PI, radius]);

        // Format data into hierarchy
        var root = d3.hierarchy(category)
        // Sums up all sizes to get the size of the sunburst diagram
            .sum(function (d) {
                return d.size
            });

        // Lays out hierarchy of root
        partition(root);

        // Calculates size of each arc from data
        var arc = d3.arc()
            .startAngle(function (d) {
                return d.x0
            })
            .endAngle(function (d) {
                return d.x1
            })
            .innerRadius(function (d) {
                return d.y0
            })
            .outerRadius(function (d) {
                return d.y1
            });

        // Uses children of root in data to draw correct path,
        g.selectAll('path')
            .data(root.descendants()) // Get's data from children of root
            .enter().append('g')
            .append('path') // Create path
            .attr("display", function (d) {
                return d.depth ? null : "none";
            }) // Get depth of  node, if no depth, don't display
            .attr("d", arc) // fills in "d" with arc info
            .style("fill", function (d) {
                return color((d.children ? d : d.parent).data.name);
            }) // Chooses arc color based on parent color

        .on('mouseover', function(datum, index, nodes) {
            // select our tooltip
            var tooltip = d3.select('#hoverText');

            // make sure our tooltip is going to be displayed
            tooltip.style('display', 'block');

            // set the initial position of the tooltip
            tooltip.style('left', d3.event.pageX);
            tooltip.style('top', d3.event.pageY);

            tooltip.html(function(d) { return d.parent; });
        })
        .on('mouseleave', function(datum, index, nodes) {
            var tooltip = d3.select('#hoverText');
            tooltip.style('display', 'none');
        })

        //Make Legend
        var yMult = 25;
        var yPos = ((height)/3);
        var xBoxPos = 600;
        var xTextPos = xBoxPos + 40;
        var xTextOffset = 15;
        /*
        // Main Box
        var legend = svg2.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 2 * width)
            .attr("y", (height/ 2))
            .style("stroke", "black")
            .attr("fill", "white");
        */
        svg.append("text")
            .attr("x", 600)
            .attr("y", (height)/3 - 33)
            .attr("font-size", "small")
            .attr("font-weight", "bold")
            .text("Percentage");

        svg.append("text")
            .attr("x", 600)
            .attr("y", (height)/3 - 20)
            .attr("font-size", "small")
            .attr("font-weight", "bold")
            .text("of Goal");

        svg.append("text")
            .attr("x", 600)
            .attr("y", (height)/3 - 7)
            .attr("font-size", "small")
            .attr("font-weight", "bold")
            .text("Reached");

        // First Box
        svg.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("x", xBoxPos)
            .attr("y", yPos + (yMult * 0))
            .attr("fill", "#5254a3");

        svg.append("text")
            .attr("x", xTextPos)
            .attr("y", yPos + (yMult * 0) + xTextOffset)
            .attr("font-size", "small")
            .text("0-25");

        // Second Box
        svg.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("x", xBoxPos)
            .attr("y", yPos + (yMult * 1))
            .attr("fill", "#6b6ecf");

        svg.append("text")
            .attr("x", xTextPos)
            .attr("y", yPos + (yMult * 1) + xTextOffset)
            .attr("font-size", "small")
            .text("26-50");

        // Third Box
        svg.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("x", xBoxPos)
            .attr("y", yPos + (yMult * 2))
            .attr("fill", "#9c9ede");

        svg.append("text")
            .attr("x", xTextPos)
            .attr("y", yPos + (yMult * 2) + xTextOffset)
            .attr("font-size", "small")
            .text("51-75");

        // Fourth Box
        svg.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("x", xBoxPos)
            .attr("y", yPos + (yMult * 3))
            .attr("fill", "#637939");

        svg.append("text")
            .attr("x", xTextPos)
            .attr("y", yPos + (yMult * 3) + xTextOffset)
            .attr("font-size", "small")
            .text("76-100");

        // Fifth Box
        svg.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("x", xBoxPos)
            .attr("y", yPos + (yMult * 4))
            .attr("fill", "#b5cf6b");

        svg.append("text")
            .attr("x", xTextPos)
            .attr("y", yPos + (yMult * 4) + xTextOffset)
            .attr("font-size", "small")
            .text("101-200");

        // Sixth Box
        svg.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("x", xBoxPos)
            .attr("y", yPos + (yMult * 5))
            .attr("fill", "#8ca252");

        svg.append("text")
            .attr("x", xTextPos)
            .attr("y", yPos + (yMult * 5) + xTextOffset)
            .attr("font-size", "small")
            .text("200+");

    }

    this.update(category);


}

//alert("Displaying Games");


  var sunburst = new Sunburst(games);

//alert("Displaying Crafts");
function v4(main_category, color) { //added
  sunburst.update(window[main_category], color);
}
