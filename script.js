document.addEventListener("DOMContentLoaded",()=>{
	console.log("Hi");
	out = document.getElementById("out");
	input = document.getElementById("input");
	link = document.getElementById("link");
	out.innerText +="hi";
	setupRTC();
});
console.log("outer hi");
var rtc;
var dataChannel;
var commObj = {sdp:[],ice:[]};
var updateCommObj;
var out;
var input;
var link;
function setupRTC(){
	rtc = new RTCPeerConnection({
		iceServers:[
			{
				urls:[
					"stun:stun1.l.google.com:19302",
					"stun:stun1.l.google.com:19305",
					"stun:stun2.l.google.com:19302",
					"stun:stun2.l.google.com:19305",
					"stun:stun3.l.google.com:19302",
					"stun:stun3.l.google.com:19305",
					"stun:stun4.l.google.com:19302",
					"stun:stun4.l.google.com:19305",
					"stun:stun.services.mozilla.com",
					"stun:stun.stunprotocol.org:3478"
				]
			}
		]
	});
	rtc.onicecandidate = e =>{
		if(e.candidate)commObj.ice.push(e.candidate);
		updateCommObj();
	}
	if(!document.location.hash){
		dataChannel = rtc.createDataChannel("ch1");
		setupDataChannel();
		updateCommObj = function(){
			link.href = document.location.origin + document.location.pathname + "#" + btoa(JSON.stringify(commObj));
		}
		rtc.createOffer()
			.then(offer=>rtc.setLocalDescription(offer))
			.then(()=>{
				commObj.sdp.push(rtc.localDescription);
				updateCommObj();
			});
		input.addEventListener("change",e=>{
			applyForeignObj(JSON.parse(atob(e.target.value)));
		});
	}else{
		var foreignObj = JSON.parse(atob(document.location.hash.slice(1)));
		applyForeignObj(foreignObj);
		updateCommObj = function(){
			out.innerText+="\n"+btoa(JSON.stringify(commObj))+"\n";
		}
		rtc.createAnswer()
			.then(answer=>rtc.setLocalDescription(answer))
			.then(()=>{
				commObj.sdp.push(rtc.localDescription);
				updateCommObj();
			});
		rtc.ondatachannel = e=>{
			dataChannel = e.channel;
			setupDataChannel();
		};
	}
}
function applyForeignObj(foreignObj){
	foreignObj.sdp.forEach(sdp=>rtc.setRemoteDescription(sdp));
	foreignObj.ice.forEach(ice=>rtc.addIceCandidate(ice));
}
function setupDataChannel(){
	dataChannel.onopen = console.log;
	dataChannel.onclose = console.log;
	dataChannel.onmessage = e =>{
		out.innerText += "\n<<" + e.data + "\n";
	}
	input.addEventListener("change", evt=>{
		dataChannel.send(evt.target.value);
		out.innerText += "\n>>" + evt.target.value + "\n";
		requestAnimationFrame(()=>input.value="");
	});
}