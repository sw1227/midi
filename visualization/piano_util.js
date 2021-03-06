var Piano = function(width, height, vertical = false) {

    // 鍵盤のサイズ
    this.width = width;
    this.height = height;

    // 鍵盤の数（黒鍵含む）
    this.numKeyboards = 88;

    // 縦か否か（デフォルトでは横: vertical=false ）
    this.vertical = vertical;

    // MIDIのnote_num -> index
    this.index = function(n) {
	return n - 21;
    }
    
    // keyIndex番目(0 - numKeyboards-1)の鍵盤が白鍵か否か
    this.isWhite = function(keyIndex) {
	return [1, 4, 6, 9, 11].indexOf(keyIndex % 12) < 0;
    }

    // keyIndex番目(0 - numKeyboards-1)の鍵盤より低音側に白鍵がいくつあるか
    this.leftWhiteKeys = function(keyIndex) {
	isWhite = this.isWhite
	return [...Array(keyIndex).keys()].reduce(function (p, c) {
	    return p+1*isWhite(c);
	}, 0);
    }

    // 白鍵の総数
    this.numWhiteKeys = this.leftWhiteKeys(this.numKeyboards);
    
    // 白鍵と黒鍵のサイズ
    if(this.vertical) {
	this.whiteWidth = this.height / this.numWhiteKeys;
	this.whiteHeight = this.width;
    }else {
	this.whiteWidth = this.width / this.numWhiteKeys;
	this.whiteHeight = this.height;
    };
    this.blackWidth = this.whiteWidth * 0.7;
    this.blackHeight = this.whiteHeight * 0.7;

    ///////////////////////////////////////////////////////////////////////
    // ピアノを縦と横どちらに表示するかによって以下のkeyYとkeyXを使い分ける
    ///////////////////////////////////////////////////////////////////////

    // keyIndex番目(0 - numKeyboards-1)の鍵盤の端のy
    this.keyY = function(keyIndex) {
	offset = this.isWhite(keyIndex) ? 0 : this.blackWidth/2 - this.whiteWidth;
	return this.height - (this.whiteWidth*this.leftWhiteKeys(keyIndex) + offset)
	    - this.whiteWidth;
    }
    // keyIndex番目(0 - numKeyboards-1)の鍵盤の端のx
    this.keyX = function(keyIndex) {
	offset = this.isWhite(keyIndex) ? 0 : -this.blackWidth/2;
	return this.whiteWidth * this.leftWhiteKeys(keyIndex) + offset;
    }


    // 鍵盤の要素にバインドする用
    var zeros = new Array(this.numKeyboards).fill(0);
    this.data = zeros.map(function (d, i) {
	return {index: i, note_num: i + 21};
    });
}
