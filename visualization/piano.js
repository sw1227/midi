var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width = 960 - margin.left - margin.right;
var height = 200 - margin.top - margin.bottom;

var numKeyboards = 88; // 鍵盤の数
var state = new Array(numKeyboards).fill(0); // それぞれの鍵盤が押された(1)か否(0)か

// keyIndex番目(0 - numKeyboards-1)の鍵盤が白鍵か否か
function isWhite(keyIndex) {
    remainder = keyIndex % 12;
    return [1, 4, 6, 9, 11].indexOf(remainder) < 0;
}

data = state.map(function (d, i) {return {index: i, value: d }});

// keyIndex番目(0 - numKeyboards-1)の鍵盤より左に白鍵がいくつあるか
function leftWhiteKeys(keyIndex) {
    count = 0;
    for (var i=0; i<keyIndex; i++) {
	if (isWhite(i)) {
	    count += 1;
	}
    }
    return count;
}

// 白鍵の総数
var numWhiteKeys = leftWhiteKeys(numKeyboards);

// 白鍵と黒鍵のサイズ
var whiteWidth = width / numWhiteKeys;
var blackWidth = whiteWidth * 0.7;
var whiteHeight = height;
var blackHeight = height * 0.7;

// keyIndex番目(0 - numKeyboards-1)の鍵盤の左端のx
function keyX(keyIndex) {
    offset = isWhite(keyIndex) ? 0 : -blackWidth/2;
    return whiteWidth * leftWhiteKeys(keyIndex) + offset;
}

// 鍵盤全体のグループ
var keyboard = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// 鍵盤の数だけrectを生成
var keys = keyboard.selectAll("rect")
    .data(data)
    .enter()

// SVGにz-indexがないので先に白鍵のみ描画
keys.filter(function(d) { return isWhite(d.index); }).append("rect")
    .attr("class", "key key--white")
    .attr("x", function(d) { return keyX(d.index); })
    .attr("y", 0)
    .attr("width", whiteWidth)
    .attr("height", whiteHeight);

// 黒鍵を描画
keys.filter(function(d) { return !isWhite(d.index); }).append("rect")
    .attr("class", "key key--black")
    .attr("x", function(d) { return keyX(d.index); })
    .attr("y", 0)
    .attr("width", blackWidth)
    .attr("height", blackHeight);
