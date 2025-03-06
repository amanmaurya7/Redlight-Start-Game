import React, { useState, useEffect } from "react";
import { Container, Box } from "@mui/material";
import Modal from "./Modal"; // Import the new modal component
import BottomNav from "./BottomNav"; // Import the Bottom Navigation
import Svg1 from "../images/1.svg";
import Svg2 from "../images/2.svg";
import Svg3 from "../images/3.svg";
import Svg4 from "../images/4.svg";
import Svg5 from "../images/5.svg";
import Svg6 from "../images/6.svg";
import Svg7 from "../images/7.svg";
import StartButton from "../images/start-button.svg";
import FadedStartButton from "../images/faded-startBtn.svg";
import GameName from "../images/GameName.svg";

const svgArray = [Svg1, Svg2, Svg3, Svg4, Svg5, Svg6, Svg7];

const RedLight: React.FC = () => {
  const [currentSvgIndex, setCurrentSvgIndex] = useState(0);
  const [sequenceCompleted, setSequenceCompleted] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setSequenceCompleted(false);
    setReactionStartTime(null);
    setReactionTime(null);
    const interval = setInterval(() => {
      setCurrentSvgIndex((prevIndex) => {
        if (prevIndex >= svgArray.length - 1) {
          clearInterval(interval);
          setSequenceCompleted(true);
          setReactionStartTime(Date.now()); // Start reaction time tracking
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStartClick = () => {
    if (sequenceCompleted && reactionStartTime) {
      const timeDiff = Date.now() - reactionStartTime;
      setReactionTime(timeDiff);
      setOpenModal(true);
      setCurrentSvgIndex(0);
      setSequenceCompleted(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        padding: 0,
        margin: 0,
      }}
    >
      {/* Game Name Header */}
      <Box
        component="img"
        src={GameName}
        alt="Game Name"
        sx={{
          width: "78.7%",
          position: "absolute",
          top: -7,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      />

      {/* Light Sequence & Start Button */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src={svgArray[currentSvgIndex]}
          alt="Red Light"
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            width: "100%", 
            height: "100%", 
            objectFit: "cover",
            zIndex: 1 
          }}
        />
        <Box
          component="img"
          src={sequenceCompleted ? StartButton : FadedStartButton}
          alt="Start Button"
          sx={{
            position: "absolute",
            zIndex: 2,
            width: "100px",
            height: "auto",
            cursor: sequenceCompleted ? "pointer" : "default",
            opacity: sequenceCompleted ? 1 : 0.5,
            bottom: "20%",
          }}
          onClick={handleStartClick}
        />
      </Box>

      {/* Reaction Time Modal */}
      <Modal
        open={openModal}
        reactionTime={reactionTime}
        onClose={() => setOpenModal(false)}
        onRetry={() => {
          setOpenModal(false);
          setReactionTime(null);
          setSequenceCompleted(false);
          setCurrentSvgIndex(0);
        }}
        onShare={() => alert("Share functionality coming soon!")}
        onMap={() => alert("Returning to game...")}
      />

      {/* Bottom Navigation */}
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 10 }}>
        <BottomNav />
      </Box>
    </Box>
  );
};

export default RedLight;