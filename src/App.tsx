import { useEffect, useState } from "react";

import { AcceptParams, DirectCall } from "sendbird-calls";
import {
  authenticateUser,
  handleCallEvents,
  makeCall,
  setupIncomingCallListener,
} from "./service";
import AudioVisualiser from "./AudioVisualiser";
// import AudioCheck from "./AudioCheck";
// import AudioVisualiser from "./AudioVisualiser";

function App() {
  const [activeCall, setActiveCall] = useState<DirectCall | null>(null);

  const [userId, setUserId] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [calleeId, setCalleeId] = useState("");
  const [incomingCall, setIncomingCall] = useState<DirectCall | null>(null);

  useEffect(() => {
    setupIncomingCallListener(setIncomingCall);
  }, []);

  const handleLogin = async () => {
    try {
      await authenticateUser(userId);
      setAuthenticated(true);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const handleCall = async (isVideo: boolean) => {
    if (!calleeId) {
      alert("Please enter a Callee ID!");
      return;
    }

    const call = await makeCall(calleeId, isVideo);
    if (call) {
      setActiveCall(call); // Store the active call
      call.onConnected = () => {
        console.log("📞 Call connected: Audio should be streaming");
        console.log("🔊 Local Audio Enabled?", call.isLocalAudioEnabled);
        console.log("🎧 Remote Audio Enabled?", call.isRemoteAudioEnabled);
      };

      // Listen for call end
      handleCallEvents(call, () => {
        console.log("Call ended - UI cleaned up");
        setActiveCall(null);
      });
    }
  };

  const acceptCall = () => {
    if (incomingCall) {
      const acceptParams: AcceptParams = {
        callOption: {
          localMediaView: undefined,
          remoteMediaView: undefined,
          audioEnabled: true, // ✅ Ensure microphone is enabled
          videoEnabled: incomingCall.isVideoCall,
        },
      };

      incomingCall.accept(acceptParams);
      console.log("✅ Call accepted");

      incomingCall.onConnected = () => {
        console.log("🎙️ Ensuring audio is working...");
        console.log(
          "🔊 Local Audio Enabled?",
          incomingCall.isLocalAudioEnabled
        );
        console.log(
          "🎧 Remote Audio Enabled?",
          incomingCall.isRemoteAudioEnabled
        );

        // ✅ Force microphone on if disabled
        if (!incomingCall.isLocalAudioEnabled) {
          incomingCall.unmuteMicrophone();
          console.log("🎤 Microphone was off, re-enabling it!");
        }
      };

      setActiveCall(incomingCall);

      handleCallEvents(incomingCall, () => {
        console.log("📴 Call ended - UI cleaned up");
        setActiveCall(null);
      });

      setIncomingCall(null);
    }
  };

  const declineCall = () => {
    if (incomingCall) {
      incomingCall.end();
      console.log("Call declined");
      setIncomingCall(null);
    }
  };

  const endCall = () => {
    if (activeCall) {
      activeCall.end();
      console.log("Call manually ended");
      setActiveCall(null);
    }
  };

  return (
    // <AudioCheck></AudioCheck>
    <div style={{ padding: "20px" }}>
      <img
        style={{ width: "200px", height: "200px" }}
        src="https://windowseat-assets.s3.ap-south-1.amazonaws.com/default-uploads/loc.webp"
      ></img>
      <AudioVisualiser></AudioVisualiser>
      {!authenticated ? (
        <div>
          <input
            type="text"
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Authenticated as: {userId}</h2>
          <input
            type="text"
            placeholder="Enter Callee ID"
            value={calleeId}
            onChange={(e) => setCalleeId(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <button onClick={() => handleCall(false)}>Voice Call</button>
          <button onClick={() => handleCall(true)}>Video Call</button>

          {incomingCall && (
            <div style={{ marginTop: "20px" }}>
              <h3>Incoming Call from {incomingCall.caller.userId}</h3>
              <button onClick={acceptCall} style={{ marginRight: "10px" }}>
                Accept
              </button>
              <button onClick={declineCall}>Decline</button>
            </div>
          )}
        </div>
      )}
      {activeCall && (
        <div style={{ marginTop: "20px" }}>
          <h3>Call in Progress...</h3>
          <button onClick={endCall}>End Call</button>
        </div>
      )}
    </div>
  );
}

export default App;
