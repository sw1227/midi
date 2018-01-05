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


 //////////////
// WebMIDI API
///////////////

var midi={"inputs":[]};
var inputSelIdx=null;
navigator.requestMIDIAccess({sysex:false}).then(onSuccess, onError);

function onSuccess(access) {
    // MIDI Inputデバイスの配列を作成
    var inputIterator = access.inputs.values();
    for (var o=inputIterator.next(); !o.done; o=inputIterator.next()){
        midi.inputs.push(o.value);
    }
    // MIDI Inputデバイスのリスト表示と選択時の処理
    var isel=document.querySelector("#midi-input");
    for(var i=0; i<midi.inputs.length; i++){
        isel.appendChild(new Option(midi.inputs[i]["name"], i));
    }
    isel.addEventListener("change", function(event){
        if(parseInt(inputSelIdx)>=0) {
            midi.inputs[inputSelIdx].onmidimessage=null;
        }
        inputSelIdx=event.target.value;
        midi.inputs[event.target.value].onmidimessage=eventOut;
    });

    function eventOut(event) {
	noteNum = event.data[1];
	
	if (event.data[0] == 144) {
	    // 鍵盤が押された
	    whiteKeys.filter(function(d) {
		return d.note_num == noteNum;
	    }).transition().delay(0).duration(0)
		.attr("fill", "#f88");
	    
	    blackKeys.filter(function(d) {
		return d.note_num == noteNum;
	    }).transition().delay(0).duration(0)
		.attr("fill", "#f00");
	}else if (event.data[0] == 128) {
	    //  鍵盤が離された
	    whiteKeys.filter(function(d) {
		return d.note_num == noteNum;
	    }).transition().delay(0).duration(0)
		.attr("fill", "white");
	    
	    blackKeys.filter(function(d) {
		return d.note_num == noteNum;
	    }).transition().delay(0).duration(0)
		.attr("fill", "#777");
	}
    }
}

function onError(msg) {
    console.log("[ERROR] ", msg);
}
