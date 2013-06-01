var audio_context;
var recorder;
var recording_state = false;

function __log(e, data) {
  console.log(e + " " + (data || ''));
}

function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);
  __log('Media stream created.');
  
  var zeroGain = audio_context.createGain();
  zeroGain.gain.value = 0;
  input.connect(zeroGain);
  zeroGain.connect(audio_context.destination);
  __log('Input connected to muted gain node connected to audio context destination.');

  recorder = new Recorder(input);
  __log('Recorder initialised.');

  // input.connect(audio_context.destination);
  // __log('Input connected to audio context destination.');
  
  // recorder = new Recorder(input);
  // __log('Recorder initialised.');
}

function startRecording(button) {
  recorder && recorder.record();
  button.disabled = true;
  button.nextElementSibling.disabled = false;
  __log('Recording...');
}

function stopRecording(button) {
  recorder && recorder.stop();
  button.disabled = true;
  button.previousElementSibling.disabled = false;
  __log('Stopped recording.');
  
  // create WAV download link using audio data blob
  createDownloadLink();
  
  recorder.clear();
}

function createDownloadLink() {
  recorder && recorder.exportWAV(function(blob) {
    var url = URL.createObjectURL(blob);
    var li = document.createElement('li');
    var au = document.createElement('audio');
    var hf = document.createElement('a');
    
    au.controls = true;
    au.src = url;
    hf.href = url;
    hf.download = new Date().toISOString() + '.wav';
    hf.innerHTML = hf.download;
    li.appendChild(au);
    li.appendChild(hf);
    recordingslist.appendChild(li);
  });
}

Template.record.rendered = function () {
  $('#record-btn').click(function () {
    $(this).toggleClass("record-started");
  });

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

Template.record.events({
  'click #record-btn' : function () {
    // template data, if any, is available in 'this'
    if (recorder) {
      if (recording_state !== true) {
        recorder.record();
        recording_state = true;
        console.log("record started");
      } else {
        recorder.stop();
        file = {
          name: ".wav",
          url: document.URL,
          timestamp: (new Date()).getTime()
        }
        console.log(file);
        Meteor.call("addFile", file, function(err, result) {
          if (result) {
              console.log("Successfully added new record with auto_inc id " + result);
          }
        });
        recording_state = false;
        console.log("record stopped");
      } 
    }
  }
});