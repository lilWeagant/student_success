var svg = d3.select(".beeswarm_svg"),
    margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var startTime, endTime;

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var formatValue = d3.format(",d");

var colourScale = d3.scaleSequential(d3.interpolateViridis);

var chartContainer = svg
	.attr('width', (width + margin.right + margin.left))
        .attr('height', (height + margin.top + margin.bottom))
        .append('g')
        .attr('class', 'chartcontainer')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var zoom_toggle = d3.select(".beeswarm_svg")
		.append("g")
		.attr("width", 60)
		.attr("height", 40)
		.attr("transform", "translate(10, 10)");

d3.csv("beeswarm_data.csv", type, function(error, data) {
//d3.csv("./populate_beeswarm.csv", type, function(error, data) {
//	logData(data);
	if (error) throw error;

	var student_id = data[0].id;
	var student_program = data[0].program;
	var student_cgpa = data[0].student_cgpa;

	var courses = []
	courses_json = JSON.parse(data[0].courses);
	var keys = Object.keys(courses_json);

	colourScale.domain(d3.extent(data, function(d) {return d.cumulative_gpa;}));

	var legendScale = d3.scaleLinear().range([h, 0]);
	legendScale.domain(d3.extent(data, function(d) {return d.cumulative_gpa;}));

	legendAxis = d3.axisRight(legendScale).tickValues(legendScale.ticks(2).concat(legendScale.domain()));

	legendSvg.append("g")
		.attr("transform", "translate(30, 0)")
		.call(legendAxis)

	legendSvg.append("text")
			.attr("class", "legendText")
			.attr("transform", "rotate(-90)")
			.attr("y", -30)
			.attr("x", -70)
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.text("Cumulative GPA");

	drawPointsZeroOne();

});

function setScale(){
	var x = d3.scaleLinear().rangeRound([0, width]);
	return x
}

function drawPointsMinMax() {

	d3.select('.draw-area').remove();
	d3.select('.axis--x').remove();
	d3.selectAll('#withdraw-success').remove();
	d3.selectAll('#zoom_in').remove();

	var zoom_out = zoom_toggle.append("image")
		.attr("x", 860)
		.attr("y", 10)
		.attr("width", 60)
		.attr("height", 40)
		.attr("id", "zoom_out")
		.attr("xlink:href", "zoom_out.png")
		.on("click", function(){
			drawPointsZeroOne();
		});

	d3.csv("beeswarm_data.csv", type, function(error, data) {
		x = setScale()
		x.domain(d3.extent(data, function(d) { return d.value; }));
		var simulation = d3.forceSimulation(data)
			.force("x", d3.forceX(function(d) { return x(d.value); }).strength(1))
			.force("y", d3.forceY(height / 2))
			.force("collide", d3.forceCollide(4))
			.stop();

		for (var i = 0; i < 120; ++i) simulation.tick();

		var drawarea = chartContainer.append('g')
			.attr('class', 'draw-area')
			.attr("transform", "translate(0,-50)")
			.attr('width', width)
			.attr('height', height);

		var cell = drawarea.append("g")
			.attr("class", "cells")
//		  	.attr("transform", "translate(0, -75)")
			.selectAll("g").data(d3.voronoi()
				.extent([[-margin.left, -margin.top], [width + margin.right, height + margin.top]])
				.x(function(d) { return d.x; })
				.y(function(d) { return d.y; })
			.polygons(data)).enter().append("g")
			.on("mouseover", function(d){
				div.transition()
					.duration(200)
					.style("opacity", 1);
				div.html(d.data.courses)
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
				dotHandlerIn();
			})
			.on("mouseout", function(d) {
				div.transition()
					.duration(200)
					.style("opacity", 0);
				dotHandlerOut(d);
			})

		cell.append("circle")

			.attr("r", 3)
			.attr("cx", function(d) { return d.data.x; })
			.attr("cy", function(d) { return d.data.y; })
			.style("fill", function(d) {return colourScale(d.data.cumulative_gpa)});

		xAxis = d3.axisBottom(x).tickValues(x.ticks(2).concat(x.domain()));

		var xAxisEl = chartContainer.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + h + ")")
			.call(xAxis);
		var brushFn = d3.brushX()
			.extent([[0, -height], [width, 16]])
			.on("end", function(d,i,j){
				filter(d, i, j);
			});
		xAxisEl.call(brushFn);
	});
}
///////////////////////////////////////////////////////////////
function drawPointsZeroOne() {
	d3.select('.draw-area').remove();
	d3.select('.axis--x').remove();
	d3.selectAll('#withdraw-success').remove();
	d3.selectAll('#zoom_out').remove();

	var zoom_in = zoom_toggle.append("image")
		.attr("x", 860)
		.attr("y", 10)
		.attr("width", 60)
		.attr("height", 40)
		.attr("id", "zoom_in")
		.attr("xlink:href", "zoom_in.png")
		.on("click", function(){
			drawPointsMinMax();
		});


	d3.csv("beeswarm_data.csv", type, function(error, data) {
//	d3.csv("./populate_beeswarm.csv", type, function(error, data) {
		drawBars([0,1]);
		x = setScale(data)
		x.domain([0,1]);
		var simulation = d3.forceSimulation(data)
			.force("x", d3.forceX(function(d) { return x(d.value); }).strength(1))
			.force("y", d3.forceY(height / 2))
			.force("collide", d3.forceCollide(4))
			.stop();

		for (var i = 0; i < 120; ++i) simulation.tick();

		var drawarea = chartContainer.append('g')
			.attr('class', 'draw-area')
			.attr("transform", "translate(0,-50)")
			.attr('width', width)
			.attr('height', height);

		var cell = drawarea.append("g")
			.attr("class", "cells")
			.selectAll("g").data(d3.voronoi()
				.extent([[-margin.left, -margin.top], [width + margin.right, height + margin.top]])
				.x(function(d) { return d.x; })
				.y(function(d) { return d.y; })
			.polygons(data)).enter().append("g")
			.on("mouseover", function(d){
				div.transition()
					.duration(200)
					.style("opacity", 1);
				div.html(d.data.courses)
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
				dotHandlerIn();
			})
			.on("mouseout", function(d) {
				div.transition()
					.duration(200)
					.style("opacity", 0);
				dotHandlerOut(d);
			})


		cell.append("circle")
			.attr("r", 3)
			.attr("cx", function(d) { return d.data.x; })
			.attr("cy", function(d) { return d.data.y; })
			.style("fill", function(d) {return colourScale(d.data.cumulative_gpa)})

		var xAxisEl = chartContainer.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + h + ")")
			.call(d3.axisBottom(x).ticks(0)); //set ticks(0) to remove labels

		chartContainer.append("text")
			.attr("x", -25)
			.attr("y", 175)
			.attr("class", "legendText")
			.attr("id", "withdraw-success")
			.text("Withdraw");

		chartContainer.append("text")
			.attr("x", 850)
			.attr("y", 175)
			.attr("class", "legendText")
			.attr("id", "withdraw-success")
			.text("Success");

		var brushFn = d3.brushX()
			.extent([[0, -height], [width, 16]])
			.on("end", function(d,i,j){
				filter(d, i, j);
			});
		xAxisEl.call(brushFn);

	});
}

function filter(d,i,j) {
	var _sel = d3.brushSelection(j[i])? [x.invert(d3.brushSelection(j[i])[0]),x.invert(d3.brushSelection(j[i])[1])] : [0, 1];
//	var _sel = d3.brushSelection(j[i])? [x.invert(d3.brushSelection(j[i])[0]),x.invert(d3.brushSelection(j[i])[1])] : [];
	drawBars(_sel);
	axisFilterLog(_sel);
	d3.select(".draw-area").selectAll("circle")
		.style("fill", function(d, i) {
			return validCircle(d, _sel) ? colourScale(d.data.cumulative_gpa) : "#efefef";
		})
}

function validCircle(_circle,_selection) {
	return _selection.length === 0 || _selection[0] <= _circle.data.value && _circle.data.value <= _selection[1];
}
/////////////Misc. functions////////////////

function type(d) {
  if (!d.value) return;
  d.value = +d.value;
  return d;
}

function linspace(start, end, n) {
	var out = [];
	var delta = (end - start) / (n - 1);

	var i = 0;
	while (i < (n - 1)) {
		out.push(start + (i * delta));
		i++;
	}
	out.push(end);
	return out;

}


///////////////////colour legend////////////////////
var w = 30, h = 150;

var legendSvg = d3.select(".beeswarm_svg")
	.append("g")
	.attr("width", w)
	.attr("height", h)
	.attr("transform", "translate(990,10)")


colourScale.domain([h, 0])

var bars = legendSvg.selectAll(".bars")
	.data(d3.range(h), function(d) {return d;})
	.enter().append("rect")
	.attr("class", "bars")
	.attr("x", 0)
	.attr("y", function(d, i) {return i;})
	.attr("height", 1)
	.attr("width", w)
	.style("fill", function(d, i) {return colourScale(d);})

//////////////////////////////////////////////////////
