import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Button,
  Typography,
  CircularProgress,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import Tesseract from "tesseract.js";

const OCRReader: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [text, setText] = useState<string>("");
  const [filteredText, setFilteredText] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [videoConstraints, setVideoConstraints] =
    useState<MediaTrackConstraints>({
      facingMode: "environment", // Request rear camera
    });

  const captureAndExtractText = async () => {
    setText("");
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot(); // Capture image

      if (imageSrc) {
        setLoading(true); // Show loading spinner
        try {
          // Process image with Tesseract for OCR
          const result = await Tesseract.recognize(imageSrc, "eng", {
            logger: (info) => console.log(info), // Optionally log progress
          });
          const extractedText = result.data.text; // Get raw text

          // Filter the text using regex to match your desired format
          const matches = extractedText.match(
            /\b(?=.*[A-Z])(?=.*[0-9])[A-Z0-9/-]+\b/g
          );
          if (matches) {
            setFilteredText(matches); // Set the filtered text array
          } else {
            setFilteredText([]); // Clear if no matches
          }
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

      {filteredText.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            <strong>Extracted Text:</strong>
          </Typography>
          {/* <ul>
            {filteredText.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul> */}

          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            onChange={(e) => {
              setText(e.target.value);
            }}
          >
            {filteredText.map((item, index) => (
              <FormControlLabel
                value={item}
                control={<Radio />}
                label={item}
                key={index}
              />
            ))}
          </RadioGroup>
        </Box>
      )}
      <Box>{text}</Box>

      {filteredText.length === 0 && !loading && text && (
        <Typography variant="body1">No matching text found.</Typography>
      )}
    </Box>
  );
};

export default OCRReader;
