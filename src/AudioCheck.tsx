import { useState, useEffect } from "react";

const AudioCheck = () => {
  const [audioAvailable, setAudioAvailable] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setAudioAvailable(true);
        // Stop the stream to free up resources
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {
        setAudioAvailable(false);
      });
  }, []);

  return (
    <div>
      <h2>Microphone Check</h2>
      {audioAvailable ? (
        <p style={{ color: "green" }}>✅ Audio is detected!</p>
      ) : (
        <p style={{ color: "red" }}>❌ No audio detected!</p>
      )}
    </div>
  );
};

export default AudioCheck;
