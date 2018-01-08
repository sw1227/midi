var margin = {top: 30, right: 30, bottom: 30, left: 30};
var width = 600 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;


// 描画領域
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// csvファイルの読み込み
d3.csv("csv/14canons_0.csv", type, function(error, data) {
    if (error) throw error;

    // 隣接行列的なものを作成
    matrix = adjacentMatrix(data);

    // 行列をもとにヒートマップをプロット
    drawHeatmap(matrix);
});


function adjacentMatrix(data) {
    // 行列の大きさを計算
    var maxNoteNum = d3.max(data, function(d) { return d.note_num; });
    var minNoteNum = d3.min(data, function(d) { return d.note_num; });
    var noteRange = maxNoteNum - minNoteNum + 1;

    // 行列を0で初期化
    var matrix = new Array(noteRange);
    for (var i=0; i<matrix.length; i++){
	matrix[i] = new Array(noteRange).fill(0);
    }

    // データに基づき行列に値をセット
    // matrix[i][j]: note_num i -> j の数
    var startSet = d3.set(data.map(function(d) { return d.start; }));
    var startTimes = startSet.values().map(function(d){ return +d; }).sort(d3.ascending);

    for (var i=0; i<startTimes.length; i++){
	var to = data.filter(function (d) { return d.start == startTimes[i]; });
	var from = data.filter(function (d) { return d.end == startTimes[i]; });
	for (var t=0; t<to.length; t++){
	    for (var f=0; f<from.length; f++){
		matrix[ from[f].note_num - minNoteNum ][ to[t].note_num - minNoteNum ] += 1;
	    }
	}
    }

    return matrix;
}


function drawHeatmap(matrix){
    rectSize = Math.min(width, height) / matrix.length;
    svg.selectAll(".raw")
	.data(matrix)
      .enter().append("g")
	.attr("class", "raw")
        .attr("transform", function(d, i) { return "translate(0," + i*rectSize + ")"; })
	.selectAll("rect")
	.data(function(d) { return d; })
      .enter().append("rect")
	.attr("x", function(d, i) { return i*rectSize; })
	.attr("width", rectSize)
	.attr("height", rectSize)
	.attr("fill", "red")
	.attr("fill-opacity", function(d) {
	    matMax = d3.max(matrix, function(a) { return d3.max(a); });
	    return d/matMax;
	});
}


function type(d) {
    // coerce to number
    d.note_num = +d.note_num;
    d.start = +d.start;
    d.end = +d.end;
    return d;
}
