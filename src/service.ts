import SendBirdCall, { DirectCall, DirectCallOption } from "sendbird-calls";
import { DialParams } from "sendbird-calls";

const APP_ID = "B0B86EB9-306F-4829-BC75-5EAFEFAD6502"; // Replace with your actual App ID

export const initializeSendbird = (): void => {
  SendBirdCall.init(APP_ID);
  console.log("Sendbird Calls Initialized");
};

export const authenticateUser = async (
  userId: string,
  accessToken?: string
) => {
  return new Promise((resolve, reject) => {
    SendBirdCall.authenticate({ userId, accessToken }, (user, error) => {
      if (error) {
        console.error("Authentication failed:", error);
        reject(error);
      } else {
        console.log("User authenticated:", user);

        // Connect WebSocket
        SendBirdCall.connectWebSocket()
          .then(() => {
            console.log("WebSocket connected");
            resolve(user);
          })
          .catch((wsError) => {
            console.error("WebSocket connection failed:", wsError);
            reject(wsError);
          });
      }
    });
  });
};

export const makeCall = (calleeId: string, isVideoCall: boolean = false) => {
  const callOption: DirectCallOption = {
    localMediaView: undefined,
    remoteMediaView: undefined,
    audioEnabled: true, // ✅ This ensures Sendbird enables the mic
    videoEnabled: isVideoCall,
  };

  const params: DialParams = {
    userId: calleeId,
    isVideoCall: isVideoCall,
    callOption: callOption,
  };

  const call = SendBirdCall.dial(params, (call, error) => {
    if (error) {
      console.error("❌ Call failed:", error);
    } else {
      console.log("📞 Calling:", calleeId);
      if (call) {
        call.onConnected = () => {
          console.log("✅ Call connected, ensuring audio...");
          console.log("🔊 Local Audio Enabled?", call.isLocalAudioEnabled);
          console.log("🎧 Remote Audio Enabled?", call.isRemoteAudioEnabled);

          // ✅ Force audio activation if needed
          if (!call.isLocalAudioEnabled) {
            call.unmuteMicrophone();
          }
        };
      }
    }
  });

  return call;
};

export const handleCallEvents = (call: DirectCall, onCallEnded: () => void) => {
  call.onEnded = () => {
    console.log("Call ended");
    onCallEnded();
  };
};

export const setupIncomingCallListener = (
  onIncomingCall: (call: SendBirdCall.DirectCall) => void
) => {
  SendBirdCall.addListener("incomingCallListener", {
    onRinging: (call) => {
      console.log("Incoming call from:", call.caller.userId);
      onIncomingCall(call);
    },
  });
};
