// 各種サイズ
var margin = {top: 30, right: 30, bottom: 30, left: 30};
var width = 600 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var maxRadius = Math.min(width, height) / 2;
var minRadius = 50;
var numDonuts = 7;
var dr = (maxRadius - minRadius) / numDonuts;


// Donut Chart描画用
var arcs = d3.range(numDonuts).map(function(d) {
    return d3.arc().outerRadius((d+1)*dr + minRadius).innerRadius(d * dr + minRadius);
});

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d; });

var data = new Array(12).fill(1);

// 描画領域
var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + (margin.left+width/2) + "," + (margin.top+height/2) + ")");

// オクターブの数だけドーナツを描画
for (var i=0; i<numDonuts; i++) {
    var donut = svg.append("g")
	.attr("class", "donut")

    // 弧を描く
    var g = donut.selectAll(".arc")
	.data(pie(data))
      .enter().append("g")
	.attr("class", "arc");

    g.append("path")
	.attr("d", arcs[i])
	.attr("fill", "#fff");

    // オクターブの番号
    donut.append("text")
	.attr("x", 0)
	.attr("y", -(i+0.5)*dr - minRadius)
	.attr("dx", "0.2em")
	.attr("dominant-baseline", "middle")
	.text(i+1);

    // 音名を外側に描く
    if (i == numDonuts-1) {
	var noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
	g.append("text")
	    .attr("transform", function(d) {
		return "translate(" + arcs[i].centroid(d).map(function(d){return d*1.15;}) + ")";
	    })
	    .attr("text-anchor", "middle")
	    .attr("dominant-baseline", "middle")
	    .text(function(d) { return noteNames[d.index]; });
    }
}

// MIDIのnote番号をもとに色を塗る (noteNum: 24 - 107)
function fillNote(noteNum) {
    d3.selectAll("g.donut")
	.filter(function(d, i){ return i == Math.floor((noteNum-24)/12); })
	.selectAll(".arc")
	.filter(function(d, i){ return i == (noteNum-24) % 12; })
	.select("path")
	.attr("fill", "#fcc");
}

// 色をリセットする
function clearColor() {
    d3.selectAll(".arc path").attr("fill", "#fff");
}

// Test
d3.interval(function() {
    n = Math.floor(Math.random() * 84) + 24; // MIDI note number: 24 - 107
    clearColor();
    fillNote(n);
}, 1000);
