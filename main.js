// Fix up prefixing
window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var Deck = function(selectorPrefix, context) {
  this.buffer = null;
  this.source = null;
  this.play = function() {
    this.source = context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);
    this.source.start(0);
  };
  
  this.setRate = function(rate) {
    if (this.source) {
      this.source.playbackRate.value = rate;
    }
  }
 

  this.gainNode = context.createGain();
  this.gainNode.gain.value = 1;
  this.gainNode.connect(context.destination);
  
  var thisDeck = this;
  
  $(selectorPrefix+'Rate').slider({
    orientation:'vertical',
    max:15,
    min:-15,
    slide:function(event, ui){
      thisDeck.setRate(1+(ui.value/100));
    }
  });
};

var deckA = new Deck('#deckA_', context);
var deckB = new Deck('#deckB_', context);


function loadSound(url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, callback, function() { alert('error loading '+url); });
  };
  
  request.send();
}


var loaded = 0;
loadSound('a.mp3', function(buffer) { deckA.buffer = buffer; loaded++; });
loadSound('b.mp3', function(buffer) { deckB.buffer = buffer; loaded++; });

function play() {
	if (loaded == 2) {
		deckA.play();
    deckB.play();
	} else {
		setTimeout(play,1000);
	}
}

setTimeout(play, 1000);

$('#mixer').slider({
  min:-100,
  max:100,
  slide: function(event, ui) {
     var value = ui.value;
     var node = null;
     if (value > 0) {
       node = deckA.gainNode;
     } else {
       deckA.gainNode.gain.value = 1;
     }
     if (value < 0) {
       node = deckB.gainNode;
     } else {
       deckB.gainNode.gain.value = 1;
     }
     if (value != 0) {
       node.gain.value = 1 - (Math.abs(value)/100.0);
     }
  }
});