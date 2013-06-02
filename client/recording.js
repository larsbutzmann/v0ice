var audio_context;
var recorder;
var recording_state = false;
var analyserContext = null;
var analyserNode = null;
var user_id = 0;

if (!('webkitSpeechRecognition' in window)) {
  console.log("upgrade");
} else {
  var recognition = new webkitSpeechRecognition();
  var final_transcript = "";
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";
}

recognition.onresult = function(event) {
  if (typeof(event.results) == 'undefined') {
    return;
  }
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      final_transcript = event.results[i][0].transcript;
      console.log("OUTPUT: " + final_transcript);
    }
  }
  file = Files.find({}, {sort: {timestamp: -1}}).fetch()[0];
  file.text = final_transcript;
  console.log(final_transcript);
  Files.update(file._id, file);
};

function __log(e, data) {
  console.log(e + " " + (data || ''));
}

function drawWave( buffer ) {
  var canvas = document.getElementById( "wavedisplay" );
  drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffer );
}

function drawBuffer( width, height, context, data ) {
  var step = Math.ceil( data.length / width );
  var amp = height / 2;
  context.fillStyle = "silver";
  for(var i=0; i < width; i++){
    var min = 1.0;
    var max = -1.0;
    for (j=0; j<step; j++) {
      var datum = data[(i*step)+j]; 
      if (datum < min)
        min = datum;
      if (datum > max)
        max = datum;
    }
    context.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
  }
}

function updateAnalysers(time) {
  if (!analyserContext) {
      var canvas = document.getElementById("analyser");
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
      analyserContext = canvas.getContext('2d');
  }

  // analyzer draw code here
  {
    var SPACING = 3;
    var BAR_WIDTH = 1;
    var numBars = Math.round(canvasWidth / SPACING);
    var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

    analyserNode.getByteFrequencyData(freqByteData); 

    analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    analyserContext.fillStyle = '#F6D565';
    analyserContext.lineCap = 'round';
    var multiplier = analyserNode.frequencyBinCount / numBars;

    // Draw rectangle for each frequency bin.
    for (var i = 0; i < numBars; ++i) {
      var magnitude = 0;
      var offset = Math.floor( i * multiplier );
      // gotta sum/average the block, or we miss narrow-bandwidth spikes
      for (var j = 0; j< multiplier; j++)
        magnitude += freqByteData[offset + j];
      magnitude = magnitude / multiplier;
      var magnitude2 = freqByteData[i * multiplier];
      analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
      analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
    }
  }
  
  rafID = window.webkitRequestAnimationFrame( updateAnalysers );
}

function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);
  __log('Media stream created.');
  
  var zeroGain = audio_context.createGain();
  zeroGain.gain.value = 0;
  input.connect(zeroGain);
  zeroGain.connect(audio_context.destination);

  analyserNode = audio_context.createAnalyser();
  analyserNode.fftSize = 2048;
  input.connect( analyserNode );

  updateAnalysers();

  var config = {
    type: "audio/wav"
  }

  recorder = new Recorder(input, config);
  __log('Recorder initialised.');

  // input.connect(audio_context.destination);
  // __log('Input connected to audio context destination.');
  
  // recorder = new Recorder(input);
  // __log('Recorder initialised.');
}

Template.record.rendered = function () {
  
  try {
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    
    audio_context = new AudioContext;
    __log('Audio context set up.');
    __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
  } catch (e) {
    alert('No web audio support in this browser!');
  }
  
  navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    __log('No live audio input: ' + e);
  });
};

function showFile(data) {
  recorder && recorder.exportWAV(function(blob) {
    var url = String(URL.createObjectURL(blob));
    var au = document.createElement('audio');
    var recording = $("#recording");
    
    au.controls = true;
    au.src = url;

    data.recording = blob;
    data.path = url;
    Files.insert(data);

    $("#submit-file")[0].onclick = function() {
      recording.empty();
      $("#stop-btn").show();
    };
    console.log(recording);
    console.log(au);
    recording.append(au);
  });
}

var startRecording = function () {
  if (recorder) {
    if (recording_state !== true) {
      recorder.clear();
      recognition.start();
      recorder.record();
      recording_state = true;
      $("#recording").empty();
      $('#stop-btn').text('Stop');
      console.log("recording started");
    }
  }
}

var stopRecording = function () {
  if (recorder) {
    if (recording_state === true) {
      recognition.stop();
      recorder.stop();
      recording_state = false;
      console.log("recording stopped");
    }
  }
}

var showRecording = function () {
  meta_data = {
    user_id: user_id++,
    text: "No text detected",
    url: document.URL,
    timestamp: (new Date()).getTime()
  }
  
  showFile(meta_data);
}

var toggleStopBotton = function () {
  if (recording_state) {
    $('#stop-btn').text('Record');
  } else {
    $('#stop-btn').text('Stop');
  }
}

Template.record.events({
  'click #record-btn' : function () {
    // template data, if any, is available in 'this'
    startRecording();
  },
  'click #stop-btn' : function () {
    toggleStopBotton();
    if (recording_state) {
      stopRecording();
      showRecording();
    } else {
      startRecording();  
    }
  },
  'click #cancel-submit' : function () {
    stopRecording();
    $("#recording").empty();
  }
});