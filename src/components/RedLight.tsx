/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import Modal from "./Modal";
import BottomNav from "./BottomNav";
import TapHereButton from "../images/start-button.svg";
import StartHereButton from "../images/start-here.svg";
import Svg7 from "../images/7.svg"; // Keep the initial screen image
import HeaderSvg from "../images/header.svg"; // Import the header SVG

// Now we only need Movie2 since Movie1 is not used
import SecondVideo from '../assets/Movie2.mp4';

const RedLight: React.FC = () => {
  const [gameState, setGameState] = useState<'init' | 'starting' | 'playingVideo' | 'waitingForTap' | 'continuingVideo' | 'results'>('init');
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  
  // We only need one video reference now
  const videoRef = useRef<HTMLVideoElement>(null);
  // Add a timeupdate handler reference to avoid multiple listeners
  const timeUpdateHandlerRef = useRef<((e: Event) => void) | null>(null);

  // Video playback and light detection - only trigger on actual playingVideo state, not during transition
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
        if (video.currentTime >= 5.12) {
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
    // This will trigger the useEffect to start playing the video
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
      }}
    >
      {/* Header SVG */}
      <Box
        component="img"
        src={HeaderSvg}
        alt="Header"
        sx={{
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 100, // Make sure it's above everything
        }}
      />

      {/* Game Name Header - Adjusted positioning to account for the header SVG */}
      

      {/* Video/Image Container */}
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
        {/* Initial screen - with fade-out animation when state changes */}
        {(gameState === 'init' || gameState === 'starting') && (
          <img
            src={Svg7}
            alt="Initial Screen"
            style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              width: "100%", 
              height: "100%", 
              objectFit: "cover",
              zIndex: gameState === 'starting' ? 3 : 1, // Put above video during transition
              opacity: gameState === 'starting' ? 0 : 1, // Fade out on transition
              transition: "opacity 1s ease-in-out",
            }}
          />
        )}

        {/* Video (load during transition but don't play yet) */}
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
              opacity: gameState === 'starting' ? 0 : 1, // Fade in after transition
              transition: "opacity 0.1s ease-in-out",
              transitionDelay: gameState === 'starting' ? "0s" : "0.1s", // Delay video appearance slightly
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
        
        {/* Start button on initial screen - with fade animation */}
        {(gameState === 'init' || gameState === 'starting') && (
          <Box
            component="img"
            src={StartHereButton}
            alt="Start Here"
            sx={{
              position: "absolute",
              zIndex: 4, // Above everything during transition
              width: "300px",
              height: "auto",
              cursor: gameState === 'starting' ? "default" : "pointer",
              bottom: "20%",
              opacity: gameState === 'starting' ? 0 : 1, // Fade out on transition
              transition: "opacity 0.1s ease-in-out", // Fade out faster than background
              pointerEvents: gameState === 'starting' ? "none" : "auto", // Disable click during transition
            }}
            onClick={gameState === 'init' ? startGame : undefined}
          />
        )}

        {/* Tap button shown throughout video but with different opacity */}
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
              bottom: "15%",
              opacity: buttonActive ? 1 : 0.5, // Transparent when inactive
              animation: buttonActive ? "pulse 1.5s infinite" : "none", // Only pulse when active
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
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', zIndex: 10 }}>
        <BottomNav />
      </Box>
    </Box>
  );
};

export default RedLight;