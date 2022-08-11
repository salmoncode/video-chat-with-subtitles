const apiKey = "23d763e7-f3dc-403a-81ae-9ce014c4b9d8"

let recognition

let peer
let room

const joinRoom = async () => {
  const localStream = await await navigator.mediaDevices.getUserMedia({audio: true, video: true})

  const localVideoElm = document.querySelector(".local-stream")
  localVideoElm.srcObject = localStream
  localVideoElm.volume = 0
  localVideoElm.play()

  peer = new Peer({key: apiKey})
  peer.on("open", () => {
    room = peer.joinRoom("video-chat-with-subtitles", {
      mode: "sfu",
      stream: localStream,
    })

    room.on("stream", stream => {
      console.log("stream")
      const remoteVideoElm = document.querySelector(".remote-stream")
      remoteVideoElm.srcObject = stream
      remoteVideoElm.play()
    })

    room.on("data", ({ src, data }) => applyRemoteText(data))
  })
}

const startRecognition = () => {
  SpeechRecognition = webkitSpeechRecognition || SpeechRecognition
  recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'ja-JP'
  recognition.maxAlternatives = 1

  recognition.onstart = () => {
    console.log("recognition", "start")
  }

  recognition.onend = () => {
    console.log("recognition", "end")
    restartRecognition()
  }

  recognition.onresult = (event) => {
    const results = event.results
    const text = results[results.length - 1][0].transcript
    applyLocalText(text)
    send(text);
  }

  // なんらかの音が検出できたとき
  recognition.onsoundstart = () => {
    console.log("recognition", "sound start")
  }

  recognition.onsoundend = () => {
    console.log("recognition", "sound end")
  }

  // 音声認識できる音が検出できたとき
  recognition.onspeechstart = () => {
    console.log("recognition", "speech start")
  }

  recognition.onspeechend = () => {
    console.log("recognition", "speech end")
  }

  recognition.onerror = (event) => {
    if(event.error == "no-speech") {
      console.log("recognition", "no-speech")
      return;
    }
    console.error(event.error)
  }

  recognition.start()
}

const restartRecognition = () => {
  recognition.stop()
  recognition.start()
}

const applyLocalText = text => {
  const textElm = document.querySelector(".local-text")
  textElm.textContent = text
}

const applyRemoteText = text => {
  const textElm = document.querySelector(".remote-text")
  textElm.textContent = text
}

const send = text => room.send(text)

const main = async () => {
  startRecognition()
  await joinRoom()
}

window.onload = main