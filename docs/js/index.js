const apiKey = "23d763e7-f3dc-403a-81ae-9ce014c4b9d8"

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
  const recognition = new SpeechRecognition()
  recognition.interimResults = true
  recognition.continuous = true

  recognition.onresult = (event) => {
    const results = event.results
    const text = results[results.length - 1][0].transcript
    applyLocalText(text)
    send(text);
  }

  recognition.onsoundend = () => recognition.start()
  recognition.onerror = (event) => recognition.start()
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