const stunListResponse = await fetch("https://raw.githubusercontent.com/pradt2/always-online-stun/master/valid_hosts.txt")

const stunListText = await stunListResponse.text()

const formattedStunList = stunListText.split("\n").map(e => {return "stun:" + e})

const RTC = new RTCPeerConnection({'iceServers': [{'urls': formattedStunList}]})

window.STATE = () => {
    console.log(RTC.iceGatheringState, RTC.connectionState)
}

window.RTC = () => {return RTC}

const mediaStream = await navigator.mediaDevices.getUserMedia({
    "video": true,
    "audio": true
})

document.getElementById("local").srcObject = mediaStream;

document.getElementById("local").play()

RTC.addStream(mediaStream);

const offer = await RTC.createOffer()

await RTC.setLocalDescription(offer);

const iceCanidates = [];

await new Promise((resolve, reject) => {
    RTC.addEventListener("icecandidate", e => {
        console.log("Found Ice Canidate")
        iceCanidates.push(e.candidate)
        if (RTC.iceGatheringState === "complete") {
            resolve()
        }
    })
})

document.querySelector("p").innerText = btoa(JSON.stringify({offer: offer, ice: iceCanidates}))

await new Promise(r => {document.getElementById("u").onclick = r})

const answer = atob(window.prompt("Enter the answer"));

await RTC.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)["answer"]));

JSON.parse(answer)["ice"].forEach(async e => {
    await RTC.addIceCandidate(e)
})

await new Promise((resolve) => {RTC.addEventListener("connectionstatechange", () => {
    if (RTC.connectionState === "connected") {
        resolve()
    }
})})

document.getElementById("remote").srcObject = RTC.getRemoteStreams()[0]
document.getElementById("remote").play()