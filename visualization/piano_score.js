var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width = 10000 - margin.left - margin.right;
var height = 560 - margin.top - margin.bottom;

var keyboardWidth = 60;
var scoreWidth = width - keyboardWidth;

var numKeyboards = 88; // 鍵盤の数
var state = new Array(numKeyboards).fill(0); // それぞれの鍵盤が押された(1)か否(0)か
data = state.map(function (d, i) {return {index: i, value: d }});

// keyIndex番目(0 - numKeyboards-1)の鍵盤が白鍵か否か
function isWhite(keyIndex) {
    return [1, 4, 6, 9, 11].indexOf(keyIndex % 12) < 0;
}

// keyIndex番目(0 - numKeyboards-1)の鍵盤より低音側に白鍵がいくつあるか
function leftWhiteKeys(keyIndex) {
    return [...Array(keyIndex).keys()].reduce(function (p, c) {
	return p+1*isWhite(c);
    }, 0);
}

// 白鍵の総数
var numWhiteKeys = leftWhiteKeys(numKeyboards);

// 白鍵と黒鍵のサイズ
var whiteWidth = height / numWhiteKeys;
var blackWidth = whiteWidth * 0.7;
var whiteHeight = keyboardWidth;
var blackHeight = whiteHeight * 0.7;

// keyIndex番目(0 - numKeyboards-1)の鍵盤の端のy
function keyY(keyIndex) {
    offset = isWhite(keyIndex) ? 0 : blackWidth/2 - whiteWidth;
    return height - ( whiteWidth * leftWhiteKeys(keyIndex) + offset ) - whiteWidth;
}

/* ---------- */
// -- 鍵盤 --
/* ---------- */

// 鍵盤全体のグループ
var keyboard = d3.select("svg.keyboard")
    .attr("width", keyboardWidth + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 鍵盤の数だけrectを生成
var keys = keyboard.selectAll("rect")
    .data(data)
    .enter()

// SVGにz-indexがないので先に白鍵のみ描画
var whiteKeys = keys.filter(function(d) { return isWhite(d.index); }).append("rect")
    .attr("class", "key key--white")// todo remove?
    .attr("fill", "white")
    .attr("x", 0)
    .attr("y", function(d) { return keyY(d.index); })
    .attr("width", whiteHeight)
    .attr("height", whiteWidth);

// 黒鍵を描画
var blackKeys = keys.filter(function(d) { return !isWhite(d.index); }).append("rect")
    .attr("class", "key key--black")// todo remove?
    .attr("fill", "#777")
    .attr("x", 0)
    .attr("y", function(d) { return keyY(d.index); })
    .attr("width", blackHeight)
    .attr("height", blackWidth);

/* ---------- */
// -- 楽譜 --
/* ---------- */

// 楽譜全体のグループ
var score = d3.select("svg.score")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + (margin.left + keyboardWidth)  + "," + margin.top + ")");

// Scale
var x = d3.scaleLinear()
    .range([0, scoreWidth]);
var y = d3.scaleBand()
    .range([height, 0])

// Axis
var xAxis = d3.axisBottom(x)
    .ticks(192);
var yAxis = d3.axisLeft(y);

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
	.call(yAxis.tickSize(-scoreWidth));

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
    // TODO: 鍵盤はテキストよりも奥にする
    // そのためには別のsvg要素を後ろにつける必要がある気がする
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

	// Test
	for(var i=0; i<filtered_notes.data().length; i++){
	    whiteKeys.filter(function(d) {
		return d.index == filtered_notes.data()[i].note_num-21;
	    }).transition().delay(0).duration(0)
		.attr("fill", "red");
	    blackKeys.filter(function(d) {
		return d.index == filtered_notes.data()[i].note_num-21;
	    }).transition().delay(0).duration(0)
		.attr("fill", "blue");
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
