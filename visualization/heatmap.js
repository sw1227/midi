var margin = {top: 30, right: 30, bottom: 30, left: 30};
var width = 500 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// 描画領域
var svg = d3.select("body").append("svg")
    .attr("class", "adjacent")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var svg2 = d3.select("body").append("svg")
    .attr("class", "cooccurence")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var svg3 = d3.select("body").append("svg")
    .attr("class", "adjacent-small")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var svg4 = d3.select("body").append("svg")
    .attr("class", "cooccurence-small")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// csvファイルの読み込み
d3.csv("csv/aria_0.csv", type, function(error, data) {
    if (error) throw error;

    // 隣接行列的なもの
    matrix1 = adjacentMatrix(data);
    // 共起行列的なもの
    matrix2 = cooccurenceMatrix(data);
    // 隣接行列の小さい版
    matrix3 = adjacentSmall(data);
    // 共起行列の小さい版
    matrix4 = cooccurenceSmall(data);

    // 行列をもとにヒートマップをプロット
    drawHeatmap(matrix1, svg);
    drawHeatmap(matrix2, svg2);
    drawHeatmap(matrix3, svg3);
    drawHeatmap(matrix4, svg4);

    // 共起行列は対角成分0・対称なので間引き
    d3.select("svg.cooccurence").selectAll("g.raw").each(function(g, j) {
	d3.select(this).selectAll("rect")
	    .filter(function(d, i) { return i >= j; })
	    .remove();
    });
    // 共起行列の小さい版は対角成分が0とは限らない（オクターブ）
    d3.select("svg.cooccurence-small").selectAll("g.raw").each(function(g, j) {
	d3.select(this).selectAll("rect")
	    .filter(function(d, i) { return i > j; })
	    .remove();
    });
});


function cooccurenceMatrix(data) {
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
    var startSet = d3.set(data.map(function(d) { return d.start; }));
    var startTimes = startSet.values().map(function(d){ return +d; }).sort(d3.ascending);

    startTimes.forEach(function(time) {
	var starting = data.filter(function(d) { return d.start == time; });
	var playing = data.filter(function(d) { return d.start <= time && time < d.end; });
	starting.forEach(function(s) {
	    playing.forEach(function(p) {
		if (s.note_num != p.note_num) {
		    // 対称にする
		    matrix[s.note_num - minNoteNum][p.note_num - minNoteNum] += 1;
		    matrix[p.note_num - minNoteNum][s.note_num - minNoteNum] += 1;
		}
	    });
	});
    });

    return matrix;
}


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
	var to = data.filter(function(d) { return d.start == startTimes[i]; });
	var from = data.filter(function(d) { return d.end == startTimes[i]; });
	for (var t=0; t<to.length; t++){
	    for (var f=0; f<from.length; f++){
		matrix[ from[f].note_num - minNoteNum ][ to[t].note_num - minNoteNum ] += 1;
	    }
	}
    }

    return matrix;
}


function cooccurenceSmall(data) {
    // 行列を0で初期化
    var matrix = new Array(noteNames.length);
    for (var i=0; i<matrix.length; i++){
	matrix[i] = new Array(noteNames.length).fill(0);
    }

    // データに基づき行列に値をセット
    var startSet = d3.set(data.map(function(d) { return d.start; }));
    var startTimes = startSet.values().map(function(d){ return +d; }).sort(d3.ascending);

    startTimes.forEach(function(time) {
	var starting = data.filter(function(d) { return d.start == time; });
	var playing = data.filter(function(d) { return d.start <= time && time < d.end; });
	starting.forEach(function(s) {
	    playing.forEach(function(p) {
		if (s.note_num != p.note_num) {
		    if ( noteNames.indexOf(s.name)>=0 && noteNames.indexOf(p.name)>=0 ) {
			// 対称にする
			matrix[noteNames.indexOf(s.name)][noteNames.indexOf(p.name)] += 1;
			matrix[noteNames.indexOf(p.name)][noteNames.indexOf(s.name)] += 1;
		    }else {
			console.log("error");
		    }
		}
	    });
	});
    });

    return matrix;
}


function adjacentSmall(data) {
    // 行列を0で初期化
    var matrix = new Array(noteNames.length);
    for (var i=0; i<matrix.length; i++){
	matrix[i] = new Array(noteNames.length).fill(0);
    }

    // データに基づき行列に値をセット
    // matrix[i][j]: note_num i -> j の数
    var startSet = d3.set(data.map(function(d) { return d.start; }));
    var startTimes = startSet.values().map(function(d){ return +d; }).sort(d3.ascending);

    for (var i=0; i<startTimes.length; i++){
	var to = data.filter(function(d) { return d.start == startTimes[i]; });
	var from = data.filter(function(d) { return d.end == startTimes[i]; });
	for (var t=0; t<to.length; t++){
	    for (var f=0; f<from.length; f++){
		if ( noteNames.indexOf(from[f].name)>=0 && noteNames.indexOf(to[t].name)>=0 ) {
		    matrix[noteNames.indexOf(from[f].name)][noteNames.indexOf(to[t].name)] += 1;
		}else {
		    console.log("error");
		}
	    }
	}
    }

    return matrix;
}


function drawHeatmap(matrix, svg){
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
