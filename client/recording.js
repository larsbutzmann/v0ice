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

function showFile(data) {
  recorder && recorder.exportWAV(function(blob) {
    console.log(blob);
    var url = String(URL.createObjectURL(blob));
    var recording = $("#recording");
    var au = document.createElement('audio');
    
    au.controls = true;
    au.src = url;

    data.recording = blob;
    data.path = url;
    $("#submit-file")[0].onclick = function() {
      Files.insert(data)
      recording.empty();
      $("#stop-btn").show();
    };

    recording.append(au);
  });
}

Template.record.rendered = function () {
  // $('#record-btn').click(function () {
  //   $(this).toggleClass("record-started");
  // });

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
      }
    }
  },
  'click #stop-btn' : function () {
    if (recorder) {
      if (recording_state === true) {
        recorder.stop();
        meta_data = {
          user_id: 1,
          url: document.URL,
          timestamp: (new Date()).getTime()
        }
        showFile(meta_data);

        recording_state = false;
        console.log("record stopped");
        $("#stop-btn").hide();
      }
    }
  },
  'click #cancel-submit' : function () {
    if (recorder) {
      if (recording_state === true) {
        recorder.stop();
        recording_state = false;
        console.log("record stopped");
      }
      recorder.clear();
      $("#recording").empty();
      $("#stop-btn").show();      
      console.log($("#recording"));
    }
  }
});