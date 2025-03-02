import { useEffect, useRef, useState } from "react";

const AudioVisualiser: React.FC = () => {
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        const updateAudioLevel = () => {
          if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            const volume =
              dataArrayRef.current.reduce((a, b) => a + b, 0) / bufferLength;
            setAudioLevel(volume);
          }
          requestAnimationFrame(updateAudioLevel);
        };

        updateAudioLevel();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div>
      <h2>Live Audio Level</h2>
      <div
        style={{
          width: "100%",
          height: "20px",
          background: "gray",
          marginTop: "10px",
        }}
      >
        <div
          style={{
            width: `${audioLevel / 2}%`,
            height: "100%",
            background: "green",
          }}
        />
      </div>
    </div>
  );
};

export default AudioVisualiser;
