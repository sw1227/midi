// Margin convention
var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width = 10840 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

// Scale
var x = d3.scaleLinear()
    .range([0, width]);
var y = d3.scaleBand()
    .range([height, 0])
// TODO: 音符がない音にもスペースがいる気がする
// というか左に鍵盤をいて連動させたい
//    .domain([...Array(88).keys()].map(function(x) {return x+21}))

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
    var note_parents = score.selectAll("g.note")
	.data(data).enter()
      .append("g")
	.attr("class", "note-group");
    var notes = note_parents.append("rect")
	.attr("class", "note")
	.attr("fill", "blue")
	.attr("x", function(d) { return x(d.start); })
	.attr("y", function(d) { return y(d.note_num); })
	.attr("width", function(d) { return x(d.end) - x(d.start); })
	.attr("height", y.bandwidth());
    var texts = note_parents.append("text")
	.attr("class", "note-text")
	.attr("x", function(d) { return x(d.start)-4; })
	.attr("y", function(d) { return y(d.note_num)+y.bandwidth()-2; })
	.style("display", "none")
	.text(function(d) { return d.name; });

    // マウスの位置の縦線
    var verticalLine = score.append("line")
	.attr("class", "vertical")
	.attr("x1", 0)
	.attr("y1", 0)
	.attr("x2", 0)
	.attr("y2", height);

    // マウスをトラック : rectを一番上にoverlayしないとうまくいかない
    score.append("rect")
	.attr("class", "overlay")
	.attr("width", width)
	.attr("height", height)
	.on("mouseover", function() { verticalLine.style("display", null); })
	.on("mouseout", onMouseOut)
	.on("mousemove", onMouseMove);

    // マウスが楽譜から外れた時のコールバック
    function onMouseOut() {
	verticalLine.style("display", "none");
	refresh();
    }

    // 楽譜上でマウスを動かした時のコールバック
    function onMouseMove() {
	refresh();

	var mouseX = d3.mouse(this)[0];
	verticalLine.transition().delay(0).duration(0)
	    .attr("x1", mouseX)
	    .attr("x2", mouseX);

	// 縦線と重なる音は表示を変更
	var filtered_notes = note_parents.filter(function(d) {
	    return ( x(d.start) < mouseX ) && ( mouseX < x(d.end) );
	})
	filtered_notes.select("text")
	    .style("display", null);
	filtered_notes.select("rect")
	    .transition().delay(0).duration(0)
	    .attr("fill", "red");
    }

    // 音とテキストを未選択状態の表示に戻す
    function refresh() {
	notes.transition().delay(0).duration(0)
	    .attr("fill", "blue");
	texts.style("display", "none");
    }
});


function type(d) {
    // coerce to number
    d.note_num = +d.note_num;
    d.start = +d.start;
    d.end = +d.end;
    return d;
}
