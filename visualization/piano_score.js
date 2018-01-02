var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width = 10000 - margin.left - margin.right;
var height = 560 - margin.top - margin.bottom;

// 鍵盤と楽譜の領域の幅
var keyboardWidth = 60;
var scoreWidth = width - keyboardWidth;

// piano_util.jsで定義
var piano = new Piano(keyboardWidth, height);


/* ---------- */
// -- 鍵盤 --
/* ---------- */

// 鍵盤全体のグループ
var keyboard = d3.select("svg.keyboard")
    .attr("width", piano.width + margin.left)
    .attr("height", piano.height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 鍵盤の数だけrectを生成
var keys = keyboard.selectAll("rect")
    .data(piano.data)
    .enter()

// SVGにz-indexがないので先に白鍵のみ描画
var whiteKeys = keys.filter(function(d) { return piano.isWhite(d.index); }).append("rect")
    .attr("class", "key key--white")
    .attr("fill", "white")
    .attr("x", 0)
    .attr("y", function(d) { return piano.keyY(d.index); })
    .attr("width", piano.whiteHeight)
    .attr("height", piano.whiteWidth);

// 黒鍵を描画
var blackKeys = keys.filter(function(d) { return !piano.isWhite(d.index); }).append("rect")
    .attr("class", "key key--black")
    .attr("fill", "#777")
    .attr("x", 0)
    .attr("y", function(d) { return piano.keyY(d.index); })
    .attr("width", piano.blackHeight)
    .attr("height", piano.blackWidth);

/* ---------- */
// -- 楽譜 --
/* ---------- */

// 楽譜全体のグループ
var score = d3.select("svg.score")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + (margin.left + piano.width)  + "," + margin.top + ")");

// Scale
var x = d3.scaleLinear()
    .range([0, scoreWidth]);

// Axis
var xAxis = d3.axisBottom(x)
    .ticks(192);

// csvファイルの読み込み
d3.csv("csv/aria_0.csv", type, function(error, data) {
    if (error) throw error;

    x.domain([0, d3.max(data, function(d) { return d.end; })]);

    // Axis
    score.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis.tickSize(-height));

    // 音符の数だけrectを生成
    var note_parents = score.selectAll("g.note")
	.data(data).enter()
      .append("g")
	.attr("class", "note-group");
    var notes = note_parents.append("rect")
	.attr("class", "note")
	.attr("fill", "blue")
	.attr("x", function(d) { return x(d.start); })
	.attr("y", function(d) { return piano.keyY(piano.index(d.note_num)); })
	.attr("width", function(d) { return x(d.end) - x(d.start); })
	.attr("height", function(d) {
	    return piano.isWhite(piano.index(d.note_num)) ? piano.whiteWidth : piano.blackWidth;
	});
    var texts = note_parents.append("text")
	.attr("class", "note-text")
	.attr("x", function(d) { return x(d.end)+4; })
	.attr("y", function(d) {
	    if (piano.isWhite(piano.index(d.note_num))){
		return piano.keyY(piano.index(d.note_num)) + piano.whiteWidth;
	    }else {
		return piano.keyY(piano.index(d.note_num)) + piano.blackWidth;
	    }
	})
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

	// 縦線と重なる音に対応する鍵盤も表示を変更
	for(var i=0; i<filtered_notes.data().length; i++){
	    whiteKeys.filter(function(d) {
		return d.note_num == filtered_notes.data()[i].note_num;
	    }).transition().delay(0).duration(0)
		.attr("fill", "#f88");
	    blackKeys.filter(function(d) {
		return d.note_num == filtered_notes.data()[i].note_num;
	    }).transition().delay(0).duration(0)
		.attr("fill", "#f00");
	}	
    }

    // 音とテキストを未選択状態の表示に戻す
    function refresh() {
	notes.transition().delay(0).duration(0)
	    .attr("fill", "blue");
	texts.style("display", "none");
	whiteKeys.transition().delay(0).duration(0)
	    .attr("fill", "white");
	blackKeys.transition().delay(0).duration(0)
	    .attr("fill", "#777");
    }
});


function type(d) {
    // coerce to number
    d.note_num = +d.note_num;
    d.start = +d.start;
    d.end = +d.end;
    return d;
}
