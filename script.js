document.addEventListener("DOMContentLoaded",()=>{
	console.log("Hi");
	out.innerText +="hi";
	setupRTC();
});
console.log("outer hi");
var rtc;
var dataChannel;
var commObj = {sdp:[];ice:[]};
var updateCommObj;
function setupRTC(){
	rtc = new RTCPeerConnection();
	rtc.onicecandidate = e =>{
		commObj.ice.push(e.candidate);
		updateCommObj();
	}
	if(!document.location.hash){
		dataChannel = rtc.createDataChannel("ch1");
		setupDataChannel();
		updateCommObj = function(){
			link.href = document.location.origin + document.location.path + "#" + btoa(JSON.stringify(commObj));
		}
		rtc.createOffer()
			.then(offer=>rtc.setLocalDescription(offer));
			.then(()=>{
				commObj.sdp.push(rtc.localDescription);
				updateCommObj();
			});
		input.addEventListener("input",e=>{
			applyForeignObj(JSON.parse(btoa(e.target.value)));
		});
	}else{
		var foreignObj = JSON.parse(atob(document.location.hash.slice(1)));
		applyForeignObj(foreignObj);
		updateCommObj = function(){
			out.innerText+="\n"+btoa(JSON.stringify(commObj))+"\n";
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
function applyForeignObj(foreignObj){
	foreignObj.sdp.forEach(sdp=>rtc.setRemoteDescription(sdp));
	foreignObj.ice.forEach(sdp=>rtc.addIceCandidate(ice));
}
function setupDataChannel(){
	dataChannel.onopen = console.log;
	dataChannel.onclose = console.log;
	dataChannel.onmessage = e =>{
		out.innerText += "\n" + evt.data + "\n";
	}
	input.addEventListener("input", evt{
		dataChannel.sendMessage(evt.target.value);
		dataChannel.onmessage({data:evt.target.value});
		requestAnimationFrame(()=>input.value="");
	});
}