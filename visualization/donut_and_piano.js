// 各種サイズ
var margin = {top: 30, right: 30, bottom: 30, left: 30};
var width = 1000 - margin.left - margin.right;
var keyboardHeight = 250 - margin.top - margin.bottom;
var donutHeight = 600 - margin.top - margin.bottom;


/////////////
// 鍵盤の描画
//////////////

// piano_util.jsで定義
var piano = new Piano(width, keyboardHeight, vertical=false);

// 鍵盤全体のグループ
var keyboardSvg = d3.select("svg.keyboard")
    .attr("width", width + margin.left + margin.right)
    .attr("height", keyboardHeight + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 鍵盤の数だけrectを生成
var keys = keyboardSvg.selectAll("rect")
    .data(piano.data)
    .enter()

// SVGにz-indexがないので先に白鍵のみ描画
var whiteKeys = keys.filter(function(d) { return piano.isWhite(d.index); }).append("rect")
    .attr("class", "key key--white")
    .attr("fill", "white")
    .attr("x", function(d) { return piano.keyX(d.index); })
    .attr("y", 0)
    .attr("width", piano.whiteWidth)
    .attr("height", piano.whiteHeight);

// 黒鍵を描画
var blackKeys = keys.filter(function(d) { return !piano.isWhite(d.index); }).append("rect")
    .attr("class", "key key--black")
    .attr("fill", "#777")
    .attr("x", function(d) { return piano.keyX(d.index); })
    .attr("y", 0)
    .attr("width", piano.blackWidth)
    .attr("height", piano.blackHeight);


function setKeyColor(keySelection, color, noteNum) {
    keySelection.filter(function(d) {
	return d.note_num == noteNum;
    }).transition().delay(0).duration(0)
	.attr("fill", color);
}


//////////////////
// ドーナツの描画
//////////////////

var maxRadius = Math.min(width, donutHeight) / 2;
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
var donutSvg = d3.select("svg.donut")
    .attr("width", width + margin.left + margin.right)
    .attr("height", donutHeight + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + (margin.left+width/2) + "," + (margin.top+donutHeight/2) + ")");

// オクターブの数だけドーナツを描画
for (var i=0; i<numDonuts; i++) {
    var donut = donutSvg.append("g")
	.attr("class", "donut")

    // 弧を描く
    var g = donut.selectAll(".arc")
	.data(pie(data))
      .enter().append("g")
	.attr("class", "arc");

    g.append("path")
	.attr("d", arcs[i])
	.attr("fill", function(d, i) {
	    return [1, 3, 6, 8, 10].indexOf(i) < 0 ? "white" : "#bbb";
	});

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
function fillNote(noteNum, color) {
    d3.selectAll("g.donut")
	.filter(function(d, i){ return i == Math.floor((noteNum-24)/12); })
	.selectAll(".arc")
	.filter(function(d, i){ return i == (noteNum-24) % 12; })
	.select("path")
	.attr("fill", color);
}

// 色をリセットする
function clearColor() {
    donutSvg.selectAll("g.donut").selectAll("g.arc").select("path")
	.attr("fill", function(d, i) {
	    return [1, 3, 6, 8, 10].indexOf(i) < 0 ? "white" : "#bbb";
	});
}


///////////////
// WebMIDI API
///////////////

navigator.requestMIDIAccess({sysex:false}).then(onSuccess,
						function(msg){ console.log("ERROR: ",msg); });

function onSuccess(access) {
    var midiDevices = Array.from(access.inputs.values());

    // MIDIデバイスは1つしか接続されていない前提
    if (midiDevices.length > 0) {
	midiDevices[midiDevices.length-1].onmidimessage=onMidiMessage;
	d3.select(".device").text("Device name: " + midiDevices[midiDevices.length-1].name);
    }

    function onMidiMessage(event) {
	noteNum = event.data[1];

	if (event.data[0] == 144) {
	    // 鍵盤が押された
	    setKeyColor(whiteKeys, "#fcc", noteNum);
	    setKeyColor(blackKeys, "#f88", noteNum);
	    fillNote(noteNum, "#fcc");
	}else if (event.data[0] == 128) {
	    //  鍵盤が離された
	    setKeyColor(whiteKeys, "white", noteNum);
	    setKeyColor(blackKeys, "#777", noteNum);
	    fillNote(noteNum, [1, 3, 6, 8, 10].indexOf(noteNum % 12) < 0 ? "white" : "#bbb");
	}
    }
}
