/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import Modal from "./Modal";
import BottomNav from "./BottomNav";
import TapHereButton from "../images/start-button.svg";
import Svg7 from "../images/7.svg"; // Initial screen background image
import HeaderSvg from "../images/header.svg"; // Header SVG

import SecondVideo from '../assets/Movie2.mp4';

const RedLight: React.FC = () => {
  const [gameState, setGameState] = useState<'init' | 'starting' | 'playingVideo' | 'waitingForTap' | 'continuingVideo' | 'results'>('init');
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeUpdateHandlerRef = useRef<((e: Event) => void) | null>(null);

  // Video playback and light detection
  useEffect(() => {
    if (gameState === 'playingVideo' && videoRef.current) {
      console.log("Starting to play video after transition");
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("Video playing successfully"))
          .catch(error => console.error("Error playing video:", error));
      }

      // Set up timeupdate event to detect when lights turn off
      const timeUpdateHandler = (e: Event) => {
        const video = e.target as HTMLVideoElement;
        // Pause at the specified time when lights turn off
        if (video.currentTime >= 5.13) {
          console.log("Lights off detected, pausing video and activating tap button");
          video.pause();
          setGameState('waitingForTap');
          setButtonActive(true);
          setReactionStartTime(Date.now());
          
          // Remove the event listener once triggered
          video.removeEventListener('timeupdate', timeUpdateHandler);
          timeUpdateHandlerRef.current = null;
        }
      };
      
      // Store the handler and add it to the video element
      timeUpdateHandlerRef.current = timeUpdateHandler;
      videoRef.current.addEventListener('timeupdate', timeUpdateHandler);
    } else if (gameState === 'continuingVideo' && videoRef.current) {
      console.log("Continuing video playback");
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("Video continuing successfully"))
          .catch(error => console.error("Error continuing video:", error));
      }
    }

    // Clean up event listeners when component unmounts or video changes
    return () => {
      if (videoRef.current && timeUpdateHandlerRef.current) {
        videoRef.current.removeEventListener('timeupdate', timeUpdateHandlerRef.current);
      }
    };
  }, [gameState]);

  const startGame = () => {
    console.log("Starting game - transition sequence");
    
    // First set state to starting to begin transition
    setGameState('starting');
    setButtonActive(false); // Make button inactive initially
    
    // Prepare video but don't play it yet
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause(); // Ensure video is paused during transition
    }
    
    // After the fade effect completes, set to playing video state
    setTimeout(() => {
      console.log("Transition complete, starting video");
      setGameState('playingVideo');
    }, 1500); // Match this to the duration of the fade animation
  };

  // Handle tap button click
  const handleTapClick = () => {
    if (gameState === 'waitingForTap' && buttonActive && reactionStartTime) {
      const timeDiff = Date.now() - reactionStartTime;
      setReactionTime(timeDiff);
      setGameState('continuingVideo');
      
      if (videoRef.current) {
        // Continue from the current position
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Video continuation failed:", error);
          });
        }
      }
    }
  };

  // Video ended handler
  const handleVideoEnd = () => {
    setGameState('results');
    setOpenModal(true);
  };

  const handleRestartGame = () => {
    setGameState('init');
    setReactionTime(null);
    setReactionStartTime(null);
    setOpenModal(false);
    setButtonActive(false);
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
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#242424', // Match the dark background from the design
      }}
    >
      {/* Header - Using the provided HeaderSVG */}
      <Box
        component="img"
        src={HeaderSvg}
        alt="Header"
        sx={{
          width: "105%",
          position: "absolute",
          top: -7,
          left: -11,
          zIndex: 100,
        }}
      />

      {/* Game Content Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        {/* Initial screen - with fade-out animation when state changes */}
        {(gameState === 'init' || gameState === 'starting') && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: gameState === 'starting' ? 3 : 1,
              opacity: gameState === 'starting' ? 0 : 1,
              transition: "opacity 1s ease-in-out",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(to bottom, #ff6b6b 0%, #c23616 50%, #192a56 100%)",
            }}
          >
            <Box
              component="img"
              src={Svg7}
              alt="F1 Car"
              sx={{
                height: "100%",
                width: "110%",
                maxWidth: "450px",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
            />
            
            {/* Start Button */}
            <Box
              sx={{
                position: "absolute",
                bottom: "25%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                zIndex: 4,
                opacity: gameState === 'starting' ? 0 : 1,
                transition: "opacity 0.5s ease-in-out",
              }}
            >
              <Box
                component="button"
                onClick={gameState === 'init' ? startGame : undefined}
                sx={{
                  width: "80%",
                  maxWidth: "280px",
                  height: "48px",
                  borderRadius: "24px",
                  backgroundColor: "#f5f6fa",
                  color: "#2f3640",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#dcdde1",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
                  },
                  "&:active": {
                    transform: "translateY(1px)",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                START
              </Box>
            </Box>
           
          </Box>
        )}

        {/* Video Element */}
        {(gameState !== 'init') && (
          <video 
            ref={videoRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 1,
              opacity: gameState === 'starting' ? 0 : 1,
              transition: "opacity 0.5s ease-in-out",
            }}
            onEnded={handleVideoEnd}
            muted
            playsInline
            preload="auto"
          >
            <source src={SecondVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
        
        {/* Tap button shown during video playback */}
        {(gameState === 'playingVideo' || gameState === 'waitingForTap' || gameState === 'continuingVideo') && (
          <Box
            component="img"
            src={TapHereButton}
            alt="Tap Here"
            sx={{
              position: "absolute",
              zIndex: 2,
              width: "120px",
              height: "auto",
              cursor: buttonActive ? "pointer" : "default",
              bottom: "18%",
              left: "35%",
             
              opacity: buttonActive ? 1 : 0.5,
              animation: buttonActive ? "pulse 1.5s infinite" : "none",
              transition: "opacity 0.3s ease-in-out",
            }}
            onClick={buttonActive ? handleTapClick : undefined}
          />
        )}
      </Box>

      {/* Reaction Time Modal */}
      <Modal
        open={openModal}
        reactionTime={reactionTime}
        onClose={() => setOpenModal(false)}
        onRetry={handleRestartGame}
        onMap={() => {}}
      />

      {/* Bottom Navigation */}
        <BottomNav />
      </Box>
  );
};

export default RedLight;