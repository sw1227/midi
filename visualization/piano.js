var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width = 960 - margin.left - margin.right;
var height = 200 - margin.top - margin.bottom;


// piano_util.jsで定義
var piano = new Piano(width, height, vertical=false);

// 鍵盤全体のグループ
var keyboard = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// 鍵盤の数だけrectを生成
var keys = keyboard.selectAll("rect")
    .data(piano.data)
    .enter()

// SVGにz-indexがないので先に白鍵のみ描画
keys.filter(function(d) { return piano.isWhite(d.index); }).append("rect")
    .attr("class", "key key--white")
    .attr("fill", "white")
    .attr("x", function(d) { return piano.keyX(d.index); })
    .attr("y", 0)
    .attr("width", piano.whiteWidth)
    .attr("height", piano.whiteHeight);

// 黒鍵を描画
keys.filter(function(d) { return !piano.isWhite(d.index); }).append("rect")
    .attr("class", "key key--black")
    .attr("fill", "#777")
    .attr("x", function(d) { return piano.keyX(d.index); })
    .attr("y", 0)
    .attr("width", piano.blackWidth)
    .attr("height", piano.blackHeight);
