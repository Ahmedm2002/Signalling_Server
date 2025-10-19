const socket = io();
const peer = new RTCPeerConnection();

let user = JSON.parse(localStorage.getItem("user"));
let isSender = false;
let channel;

const emailInput = document.getElementById("userEmail");
const userName = document.getElementById("userName");
const onBoardingContainer = document.getElementById("onBoarding");
const message = document.getElementById("message");
const friendConnectCnt = document.getElementById("connectFriend");
const friendEmail = document.getElementById("friendEmail");

if (user) {
  onBoardingContainer.style.display = "none";
  friendConnectCnt.style.display = "block";
  message.innerText = `Hi ${user.name}`;

  socket.emit("save-user", user);
}

function saveEmail() {
  const email = emailInput.value.trim();
  const name = userName.value.trim();
  if (!email || !name) {
    alert("Please enter name and email");
    return;
  }

  socket.emit("save-user", { email, name });
  localStorage.setItem("user", JSON.stringify({ email, name }));
  user = { email, name };
  onBoardingContainer.style.display = "none";
  friendConnectCnt.style.display = "block";
}

socket.on("user-saved", (res) => {
  message.innerText = res.message;
});

async function connectFriend() {
  const friendsEmail = friendEmail.value.trim();
  if (!friendsEmail) {
    alert("Please enter friend's email");
    return;
  }

  isSender = true;

  try {
    channel = peer.createDataChannel("chat");
    channel.onopen = () => alert("Connected via DataChannel");

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("offer", {
      from: user.email,
      to: friendsEmail,
      offer,
    });
  } catch (error) {
    console.error("Error in connecting with friend", error);
    alert("Error in connecting with friend");
  }
}

socket.on("offer", async (data) => {
  const { from, to, offer } = data;
  if (isSender) return;

  const accept = confirm(`${from} wants to connect. Accept?`);
  if (!accept) return;

  try {
    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    peer.ondatachannel = (event) => {
      channel = event.channel;
      channel.onopen = () => alert("Connected via DataChannel");
    };

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer", {
      from: to,
      to: from,
      answer,
    });
  } catch (error) {
    console.error("Error handling offer", error);
  }
});

socket.on("answer", async (data) => {
  const { answer } = data;
  try {
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error("Error setting remote description", error);
  }
});

peer.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("ice-candidates", {
      from: user.email,
      to: friendEmail.value.trim(),
      iceCandidate: event.candidate,
    });
  }
};

socket.on("set-iceCandidates", async (data) => {
  try {
    await peer.addIceCandidate(new RTCIceCandidate(data.iceCandidate));
  } catch (error) {
    console.error("Error adding ICE candidate", error);
  }
});
