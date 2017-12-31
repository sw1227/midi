var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width = 10840 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

// Scale
var x = d3.scaleLinear()
    .range([0, width]);
var y = d3.scaleBand()
    .range([height, 0])

// Axis
var xAxis = d3.axisBottom(x)
    .ticks(192);
var yAxis = d3.axisLeft(y);

// 楽譜全体のグループ
var score = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// csvファイルの読み込み
d3.csv("csv/aria_0.csv", type, function(error, data) {
    if (error) throw error;

    x.domain([0, d3.max(data, function(d) { return d.end; })]);
    y.domain(data.map(function(d) { return d.note_num; }));

    // Axis
    score.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis.tickSize(-height));
    score.append("g")
	.attr("class", "y axis")
	.call(yAxis.tickSize(-width));

    // 音符の数だけrectを生成
    var notes = score.selectAll("rect")
	.data(data)
	.enter().append("rect")
	.attr("class", "note")
	.attr("x", function(d) { return x(d.start); })
	.attr("y", function(d) { return y(d.note_num); })
	.attr("width", function(d) { return x(d.end) - x(d.start); })
	.attr("height", y.bandwidth());

    notes.on("click", function(d, i) {
	console.log("d.note_num=" + d.note_num + ", i=" + i);
    })
});

function type(d) {
    // coerce to number
    d.note_num = +d.note_num;
    d.start = +d.start;
    d.end = +d.end;
    return d;
}
