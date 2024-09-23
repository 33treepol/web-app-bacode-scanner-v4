import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button, Typography, CircularProgress, Box } from "@mui/material";
import Tesseract from "tesseract.js";

const OCRReader: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [videoConstraints, setVideoConstraints] =
    useState<MediaTrackConstraints>({
      facingMode: "environment", // Request rear camera
    });

  // Regular expression to filter words with both letters and numbers, allowing "-" and "/"
  const regex = /\b(?=.*[A-Z])(?=.*\d)[A-Z0-9/-]+\b/g;

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

          // Get extracted text and filter words using the RegEx
          const extractedText = result.data.text;
          const filteredWords = extractedText.match(regex);

          // Set filtered text or show a message if nothing was found
          setText(
            filteredWords ? filteredWords.join(", ") : "No matching text found."
          );
        } catch (error) {
          console.error("Error extracting text:", error);
        } finally {
          setLoading(false); // Stop loading spinner
        }
      }
    }
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
          <Typography variant="body1">
            <strong>Extracted Text:</strong> {text}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OCRReader;
