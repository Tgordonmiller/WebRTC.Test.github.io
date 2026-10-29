const RTC = new RTCPeerConnection({'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]})

window.STATE = () => {
    console.log(RTC.iceGatheringState, RTC.connectionState)
}

window.RTC = () => {return RTC}

await new Promise(r => {document.getElementById("u").onclick = r})

const offer = atob(window.prompt("Enter the offer"))

await RTC.setRemoteDescription(new RTCSessionDescription(JSON.parse(offer)["offer"]));

const mediaStream = await navigator.mediaDevices.getUserMedia({
    "video": true,
    "audio": true
})

document.getElementById("local").srcObject = mediaStream;

document.getElementById("local").play()

RTC.addStream(mediaStream);

const answer = await RTC.createAnswer()

await RTC.setLocalDescription(answer);

JSON.parse(offer)["ice"].forEach(async e => {
    if (e)
    await RTC.addIceCandidate(e)
})

const iceCanidates = [];

await new Promise((resolve, reject) => {
    RTC.addEventListener("icecandidate", e => {
        iceCanidates.push(e.candidate)
        if (RTC.iceGatheringState === "complete") resolve()
    })
})

document.querySelector("p").innerText = btoa(JSON.stringify({"answer": answer, "ice": iceCanidates}))

await new Promise((resolve) => {RTC.addEventListener("connectionstatechange", () => {
    if (RTC.connectionState === "connected") {
        resolve()
    }
})})

document.getElementById("remote").srcObject = RTC.getRemoteStreams()[0]
document.getElementById("remote").play()