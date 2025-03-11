import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import Modal from "./Modal"; // Import the new modal component
import BottomNav from "./BottomNav"; // Import the Bottom Navigation
import Svg1 from "../images/1.svg";
import Svg2 from "../images/2.svg";
import Svg3 from "../images/3.svg";
import Svg4 from "../images/4.svg";
import Svg5 from "../images/5.svg";
import Svg6 from "../images/6.svg";
import Svg7 from "../images/7.svg";
import StartHereButton from "../images/start-here.svg";
import TapHereButton from "../images/start-button.svg";
import GameName from "../images/GameName.svg";

// Reordered array to start with Svg7 as the initial screen, then 1-6 for the sequence
const initialSvg = Svg7;
const sequenceImages = [Svg1, Svg2, Svg3, Svg4, Svg5, Svg6];

const RedLight: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSvgIndex, setCurrentSvgIndex] = useState<number | null>(null);
  const [sequenceCompleted, setSequenceCompleted] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  
  const startGame = () => {
    setGameStarted(true);
    setCurrentSvgIndex(0);
    setSequenceCompleted(false);
    setReactionStartTime(null);
    setReactionTime(null);
  };

  useEffect(() => {
    if (!gameStarted) return;

    const interval = setInterval(() => {
      setCurrentSvgIndex((prevIndex) => {
        if (prevIndex === null) return 0;
        if (prevIndex >= sequenceImages.length - 1) {
          clearInterval(interval);
          setSequenceCompleted(true);
          setReactionStartTime(Date.now()); // Start reaction time tracking
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [gameStarted]);

  const handleTapClick = () => {
    // Only work if we're at the last SVG (Svg6) and sequence is completed
    if (sequenceCompleted && reactionStartTime && currentSvgIndex === sequenceImages.length - 1) {
      const timeDiff = Date.now() - reactionStartTime;
      setReactionTime(timeDiff);
      setOpenModal(true);
    }
  };

  const handleRestartGame = () => {
    setGameStarted(false);
    setCurrentSvgIndex(null);
    setSequenceCompleted(false);
    setReactionTime(null);
    setReactionStartTime(null);
    setOpenModal(false);
  };

  // Determine which SVG to show
  const currentSvg = gameStarted ? sequenceImages[currentSvgIndex!] : initialSvg;
  
  // Show Start button only on initial screen (Svg7)
  const showStartButton = !gameStarted;
  
  // Show Tap button only when we're at the last SVG (Svg6) and sequence is completed
  const showTapButton = gameStarted && sequenceCompleted && currentSvgIndex === sequenceImages.length - 1;

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

      {/* Light Sequence & Start/Tap Button */}
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
          src={currentSvg}
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
        
        {showStartButton && (
          <Box
            component="img"
            src={StartHereButton}
            alt="Start Here"
            sx={{
              position: "absolute",
              zIndex: 2,
              width: "300px",
              height: "auto",
              cursor: "pointer",
              bottom: "20%",
            }}
            onClick={startGame}
          />
        )}

        {showTapButton && (
          <Box
            component="img"
            src={TapHereButton}
            alt="Tap Here"
            sx={{
              position: "absolute",
              zIndex: 2,
              width: "100px",
              height: "auto",
              cursor: "pointer",
              bottom: "20%",
            }}
            onClick={handleTapClick}
          />
        )}
      </Box>

      {/* Reaction Time Modal */}
      <Modal
        open={openModal}
        reactionTime={reactionTime}
        onClose={() => setOpenModal(false)}
        onRetry={handleRestartGame} onMap={function (): void {
          throw new Error("Function not implemented.");
        } }      />

      {/* Bottom Navigation */}
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 10 }}>
        <BottomNav />
      </Box>
    </Box>
  );
};

export default RedLight;