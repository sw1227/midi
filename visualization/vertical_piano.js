var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width = 100 - margin.left - margin.right;
var height = 560 - margin.top - margin.bottom;

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
var whiteHeight = width;
var blackHeight = whiteHeight * 0.7;

// keyIndex番目(0 - numKeyboards-1)の鍵盤の端のy
function keyY(keyIndex) {
    offset = isWhite(keyIndex) ? 0 : blackWidth/2 - whiteWidth;
    return height - ( whiteWidth * leftWhiteKeys(keyIndex) + offset ) - whiteWidth;
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
    .attr("x", 0)
    .attr("y", function(d) { return keyY(d.index); })
    .attr("width", whiteHeight)
    .attr("height", whiteWidth);

// 黒鍵を描画
keys.filter(function(d) { return !isWhite(d.index); }).append("rect")
    .attr("class", "key key--black")
    .attr("x", 0)
    .attr("y", function(d) { return keyY(d.index); })
    .attr("width", blackHeight)
    .attr("height", blackWidth);
