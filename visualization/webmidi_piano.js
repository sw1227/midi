var margin = {top: 20, right: 20, bottom: 20, left: 20};
var width = 960 - margin.left - margin.right;
var height = 200 - margin.top - margin.bottom;

 /////////////
// 鍵盤の描画
//////////////

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
	}else if (event.data[0] == 128) {
	    //  鍵盤が離された
	    setKeyColor(whiteKeys, "white", noteNum);
	    setKeyColor(blackKeys, "#777", noteNum);
	}

	function setKeyColor(keySelection, color, noteNum) {
	    keySelection.filter(function(d) {
		return d.note_num == noteNum;
	    }).transition().delay(0).duration(0)
		.attr("fill", color);
	}
    }
}
