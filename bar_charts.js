function drawBars(sel){ // sel -> a 2x1 array containing the min and max of the selected range on the beeswarm chart

	d3.selectAll(".bar_chart").remove();
	d3.selectAll(".bar").remove();

	d3.csv("beeswarm_data.csv", function(csv) {
		data = csv.filter(function(row) {
			return row['value'] >= sel[0] && row['value'] <= sel[1];
		});

		var width = 250,
			height = 150,
			margin = 20;

		var course_names_json = JSON.parse(data[0].courses);
		var course_names = Object.keys(course_names_json)

		var course_data_total = []

		for (var j = 0; j < course_names.length; j++){
			var a = 0;
			var b = 0;
			var c = 0;
			var d = 0;
			var f = 0;
			var course = String(course_names[j])
			var grade_array = []
			for (var k = 0; k < data.length; k++){
				if (JSON.parse(data[k].courses)[course] == "A" || JSON.parse(data[k].courses)[course] == "A-" || JSON.parse(data[k].courses)[course] == "A+"){
					a++;
				}
				else if (JSON.parse(data[k].courses)[course] == "B" || JSON.parse(data[k].courses)[course] == "B-" || JSON.parse(data[k].courses)[course] == "B+"){
					b++;
				}
				else if (JSON.parse(data[k].courses)[course] == "C" || JSON.parse(data[k].courses)[course] == "C+"){
					c++;
				}
				else if (JSON.parse(data[k].courses)[course] == "D") {
					d++;
				}
				else if (JSON.parse(data[k].courses)[course] == "F") {
					f++;
				}
			}

			var course_data = {"course_name": course, "grades": [{"grade": "A", "count": a}, {"grade": "B", "count": b},{"grade": "C", "count": c}, {"grade": "D", "count": d}, {"grade": "F", "count": f}]};

			course_data_total.push(course_data);
		}
//		console.log(course_data_total)

		var bar_area = d3.select("#bar_area");
		var charts = bar_area.selectAll("svg").attr("class", "bar_chart")
			.data(course_data_total)
			.enter()
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("id", function(d) {return String(d.course_name)});

		var g_height = height - margin*2
		var g_width = width - margin*2

		var yScale = d3.scaleBand()
			.range([0, g_height])
			.padding(0.1);
		var xScale = d3.scaleLinear()
			.range([0, g_width]);

		yScale.domain((course_data_total[0].grades).map(function(d) {return d.grade;}));

		minMaxArray = []
		for (var i = 0; i < course_data_total.length; i++){
			var tmp = course_data_total[i].grades
			for (var j = 0; j < tmp.length; j++){
				var num = tmp[j].count
				minMaxArray.push(num);
			}
		}

		xScale.domain([0, d3.max(minMaxArray, function(d){return +d;})]);

		for (var x = 0; x < course_data_total.length; x++){

			course = course_data_total[x].course_name;
			select_string = "#" + String(course);
			d3.select(select_string)
				.append("g")
				.attr("transform", "translate(15, 0)")
				.selectAll(".bar")
				.data(course_data_total[x].grades)
				.enter()
					.append("rect")
					.attr("class", "bar")
					.attr("id", function(d) {
						id_text = String(course) + "_" + d.grade;
						return id_text
					})
					.attr("fill", "rgba(0, 60, 113, 1)")
					.attr("width", function(d) {return xScale(+d.count);})
					.attr("y", function(d) {return yScale(d.grade);})
					.attr("height", yScale.bandwidth())
					.on("mouseover", function(d) {
						barHandlerIn();
					})
					.on("mouseout", function(d){
						barHandlerOut(this);
					});

			d3.selectAll(".bar").append("title")
				.text(function(d) { return d.count});

			d3.select(select_string)
				.append("g")
				.attr("class", "bar_chart")
				.attr("transform", "translate(15," + g_height + ")")
				.call(d3.axisBottom(xScale).ticks(4));
			d3.select(select_string)
				.append("g")
				.attr("class", "bar_chart")
				.attr("transform", "translate(15,0)")
				.call(d3.axisLeft(yScale));

			d3.select(select_string)
				.append("text")
				.attr("transform", "translate(70, 147)")
				.attr("class", "legendText")
				.attr("id", "chart_label")
				.text(course);
		}

	});
}
