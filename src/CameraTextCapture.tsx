import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Button,
  Typography,
  CircularProgress,
  Box,
  TextField,
} from "@mui/material";
import Tesseract from "tesseract.js";

const OCRReader: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [selectedText, setSelectedText] = useState<string>(""); // State to hold selected text

  const [videoConstraints, setVideoConstraints] =
    useState<MediaTrackConstraints>({
      facingMode: "environment", // Use rear camera
    });

  // Function to capture image and extract text
  const captureAndExtractText = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot(); // Capture image

      if (imageSrc) {
        setLoading(true); // Show loading spinner
        try {
          // Process image with Tesseract for OCR
          const result = await Tesseract.recognize(imageSrc, "eng", {
            logger: (info) => console.log(info), // Optionally log progress
          });

          // Extract text from OCR result
          const extractedText = result.data.text;

          // Filter text using regex pattern
          const filteredText = extractFilteredText(extractedText);

          setText(filteredText); // Set filtered text
        } catch (error) {
          console.error("Error extracting text:", error);
        } finally {
          setLoading(false); // Stop loading spinner
        }
      }
    }
  };

  // Function to extract and format text based on specific patterns
  const extractFilteredText = (text: string): string => {
    const pattern = /[A-Z0-9\/-]+/g;
    const matches = text.match(pattern);
    return matches ? matches.join(" ") : "";
  };

  // Function to toggle the torch/flashlight
  const toggleTorch = async () => {
    if (videoTrack) {
      // Use a type assertion to inform TypeScript that the torch property exists
      const capabilities = videoTrack.getCapabilities() as any as {
        torch?: boolean;
      };

      if (capabilities.torch) {
        const newTorchState = !torchOn;
        try {
          // Apply the torch constraint using type assertion for advanced constraints
          await videoTrack.applyConstraints({
            advanced: [{ torch: newTorchState }],
          } as any);
          setTorchOn(newTorchState);
        } catch (error) {
          console.error("Error toggling torch:", error);
        }
      } else {
        alert("Torch is not supported on this device.");
      }
    }
  };

  // When the component mounts, get the video stream and the video track
  const handleUserMedia = (stream: MediaStream) => {
    const videoTrack = stream.getVideoTracks()[0]; // Get the first video track
    setVideoTrack(videoTrack);
  };

  // Handle text click to update TextField
  const handleTextClick = (selected: string) => {
    setSelectedText(selected);
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Camera Text Reader (OCR)
      </Typography>

      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMedia={handleUserMedia} // Capture the stream when the webcam starts
        width={350}
      />

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={captureAndExtractText}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            "Capture Image & Extract Text"
          )}
        </Button>
      </Box>

      {text && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body1"
            onClick={() => handleTextClick(text)}
            sx={{ cursor: "pointer" }}
          >
            <strong>Extracted Text:</strong> {text}
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <TextField
          label="Selected Text"
          variant="outlined"
          fullWidth
          value={selectedText}
          onChange={(e) => setSelectedText(e.target.value)} // Allow text editing
        />
      </Box>

      {videoTrack && (
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="secondary" onClick={toggleTorch}>
            {torchOn ? "Turn Off Flashlight" : "Turn On Flashlight"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default OCRReader;
