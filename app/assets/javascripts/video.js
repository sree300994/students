var stream;
var audio_recorder = null;
var video_recorder = null;
var recording = false;
var playing = false;
var formData = null;

var videoOptions = {
  type: "video",
  video: {
    width: 640,
    height: 480
  },
  canvas: {
    width: 640,
    height: 480
  }
};

var constraints = { audio: true, video: { mandatory: {}, optional: []} }

if (navigator.mediaDevices == undefined) {
  navigator.mediaDevices = {};
}

if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function(constraints) {
    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
}

navigator.mediaDevices.getUserMedia(constraints).then(function(pStream) {

  stream = pStream;
  // setup video
  video = $("video.recorder")[0];

  video.src = window.URL.createObjectURL(stream);
  video.width = 640;
  video.height = 480;
  // init recorders
  audio_recorder = RecordRTC(stream, { type: "audio", bufferSize: 16384 });
  video_recorder = RecordRTC(stream, videoOptions);

  // update UI
  $("#record_button").show();
}).catch(function(err) {
  console.log(err.name + ': ' + err.message);
});

$("#record_button").click(function(){
  if (recording) {
    stopRecording();
  } else {
    pstream = null;
    stream = null;
    startRecording();
  }
});

var startRecording = function() {
  // record the audio and video
  video_recorder.startRecording();
  audio_recorder.startRecording();

  // update the UI
  $("#play_button").hide();
  $("#upload_button").hide();
  $("video.recorder").show();
  $("#video-player").remove();
  $("#audio-player").remove();
  $("#record_button").text("Stop recording");

  // toggle boolean
  recording = true;
}

var stopRecording = function() {
  // stop recorders
  audio_recorder.stopRecording();
  video_recorder.stopRecording();

  // set form data
  formData = new FormData();

  var audio_blob = [];
  var video_blob = [];
  function getAudio() {
    audio_blob = audio_recorder.getBlob();
    formData.append("audio", audio_blob);
  }

  function getVideo() {
    video_blob = video_recorder.getBlob();
    formData.append("video", video_blob);
  }
  var audio_player
  var video_player

  function setPlayers() {
    getAudio();
    getVideo();

    // add players
    video_player = document.createElement("video");
    video_player.id = "video-player";
    video_player.width = $('video.recorder').width();
    video_player.height = $('video.recorder').height();
    setTimeout(function() {
      video_recorder.getDataURL(function(dataURL) {
        video_player.src = dataURL;
      });
    }, 500);

    if ($('#video-player').length) {
      $('#video-player').remove();
    }
    $("#players").append(video_player);

    audio_player = document.createElement("audio");
    audio_player.id = "audio-player";
    setTimeout(function() {
      audio_recorder.getDataURL(function(dataURL) {
        audio_player.src = dataURL;
      });
    }, 500);
    if ($('#audio-player').length) {
      $('#audio-player').remove();
    }
    $("#players").append(audio_player);

  }
  setPlayers()

  // update UI
  $("video.recorder").hide();
  $("#play_button").show();
  $("#upload_button").show();
  $("#record_button").text("Re-Record")

  // toggle boolean
  recording = false;
}

$("#play_button").click(function(){
  if (playing) {
    stopPlayback();
  } else {
    startPlayback();
  }
});

var stopPlayback = function() {
  video = $("#video-player")[0];
  video.pause();
  video.currentTime = 0;
  audio = $("#audio-player")[0];
  audio.pause();
  audio.currentTime = 0;

  $("#play_button").text("Play");

  // toggle boolean
  playing = false;
}

var startPlayback = function() {
  video = $("#video-player")[0];
  video.play();
  audio = $("#audio-player")[0];
  audio.play();
  $("#video-player").bind("ended", stopPlayback);

  $("#play_button").text("Stop");

  // toggle boolean
  playing = true;
}
