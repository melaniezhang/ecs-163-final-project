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
// color shading function: https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors

// Function to generate different shades of category color
function shadeColor1(color, percent) {  // deprecated. See below.
    var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

// Sunburst class
function Sunburst(country, category, cat_color) {

    var i = 0;

// Variables
    var width = 500;
    var height = 500;
    var radius = Math.min(width, height) / 2;
    //var color = d3.scaleOrdinal(d3.schemeCategory20b);
    var color_list = [];
    var color_domain = ["O-25", "26-50", "51-75", "76-100", "101-200", "200+"];

    for(i = 0; i < 6; i++) {
        color_list[i] = shadeColor1(cat_color, (10 + (i * 10)));
    }

    var myColors = d3.scaleOrdinal()
        .domain(color_domain)
        .range(color_list);


// Create svg
    var svg = d3.select('body').append('svg')
        .attr("class", "Sunburst")
        .attr('width', width * 2)
        .attr('height', height);

    this.update = function (country, category, cat_color) {

        var countryCategory = getData(country, category);

        // Remove existing sunBurst
        svg.selectAll('*').remove();

        // append group to svg
        var g = svg.append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        // Initializes partition layout and sets size
        var partition = d3.partition()
            .size([2 * Math.PI, radius]);

        // Format data into hierarchy
        var root = d3.hierarchy(countryCategory)
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

        svg.append('defs')
            .append('pattern')
            .attr('id', 'diagonalHatch')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('height', 4)
        .append('path')
                .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
                .attr('stroke', '#000000')
                .attr('stroke-width', 1);

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
                //c = color((d.children ? d : d.parent).data.name);
                if(d.depth == 2 && d.data.name == "failures") {
                    //return "repeating-linear-gradient(45deg," + c + "," + c + "10px, white 10px, white 20px)";
                    return "lightgray";
                }
                else if(d.depth == 2 && d.data.name == "successes") {
                    //return "repeating-linear-gradient(45deg," + c + "," + c + "10px, white 10px, white 20px)";
                    return "gray";
                }
                else if(d.depth == 1) {
                    return myColors(d.data.name);
                }
                else
                    return null;

            });

        g.selectAll("svg")
            .data(root.descendants())
            .enter()
            .append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("x", 300)
            .attr("y", function(d, i){ return  -100 + (i * 25);})
            .attr("fill", function (d) {
                if(d.depth == 1)
                    return myColors(d.data.name);
                else
                    return "none";
                });

        g.selectAll("svg")
            .data(root.descendants())
            .enter()
            .append("text")
            .attr("x", 340)
            .attr("y", function(d, i){ return  -84 + (i * 25);})
            .text(function (d) {
                if(d.depth == 1)
                    return d.data.name;
                else
                    return;
            });

        svg.append("text")
            .attr("x", 534)
            .attr("y", (height)/3 - 18)
            .text("Percentage of");

        svg.append("text")
            .attr("x", 533)
            .attr("y", (height)/3 - 3)
            .text("Goal Reached");

        svg.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("x", 550)
            .attr("y", 350)
            .attr("fill", "lightgray");

        svg.append("text")
            .attr("x", 585)
            .attr("y", 367)
            .text("Successes");

        svg.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("x", 550)
            .attr("y", 375)
            .attr("fill", "gray");

        svg.append("text")
            .attr("x", 585)
            .attr("y", 391)
            .text("Failures");
    }
    this.update(country, category, cat_color);

}

/*
//alert("Displaying Games");
var USA = "US";
var games = "games";
var blue = "blue";

var sunburst = new Sunburst(USA, games, "#0033cc");

//alert("Displaying Crafts");

//sunburst.update("US", "crafts", "#0033cc");
*/

var sunburst = new Sunburst("US", "games", "#0033cc");

function v4(main_category, color, country) {
    sunburst.update(country, window[main_category], color);
}
