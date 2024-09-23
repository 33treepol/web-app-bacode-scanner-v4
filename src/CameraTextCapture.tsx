import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Button, Typography, CircularProgress, Box } from "@mui/material";
import Tesseract from "tesseract.js";

const OCRReader: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [videoConstraints, setVideoConstraints] =
    useState<MediaTrackConstraints>({
      facingMode: "environment", // Request rear camera
    });

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
    }
  };

  const extractText = async () => {
    if (image) {
      setLoading(true);
      try {
        const result = await Tesseract.recognize(image, "eng", {
          logger: (info) => console.log(info), // Optionally log progress
        });
        setText(result.data.text);
      } catch (error) {
        console.error("Error extracting text:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Check if the device supports the rear camera and adjust video constraints
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const rearCamera = videoDevices.find((device) =>
        device.label.toLowerCase().includes("back")
      );
      if (rearCamera) {
        setVideoConstraints({ deviceId: rearCamera.deviceId });
      }
    });
  }, []);

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
        width={350}
      />

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={capture}>
          Capture Image
        </Button>
      </Box>

      {image && (
        <>
          <Box sx={{ mt: 2 }}>
            <img src={image} alt="captured" style={{ maxWidth: "100%" }} />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={extractText}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Extract Text"}
            </Button>
          </Box>
        </>
      )}

      {text && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            <strong>Extracted Text:</strong> {text}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OCRReader;
