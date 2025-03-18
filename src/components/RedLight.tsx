/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import Modal from "./Modal";
import BottomNav from "./BottomNav";
import TapHereButton from "../images/start-button.svg";
import Svg7 from "../images/7.svg"; // Initial screen background image

import SecondVideo from '../assets/Movie2.mp4';

const RedLight: React.FC = () => {
  const [gameState, setGameState] = useState<'init' | 'loading' | 'starting' | 'playingVideo' | 'waitingForTap' | 'continuingVideo' | 'results'>('init');
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeUpdateHandlerRef = useRef<((e: Event) => void) | null>(null);

  // Preload video when component mounts
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.preload = "auto";
      
      const handleCanPlayThrough = () => {
        setVideoReady(true);
      };
      
      const handleError = (_e: Event) => {
        setVideoError("Failed to load video. Please try again.");
      };
      
      videoElement.addEventListener('canplaythrough', handleCanPlayThrough);
      videoElement.addEventListener('error', handleError);
      
      // Start loading the video
      videoElement.load();
      
      return () => {
        videoElement.removeEventListener('canplaythrough', handleCanPlayThrough);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, []);

  // Video playback and light detection
  useEffect(() => {
    if (gameState === 'playingVideo' && videoRef.current) {
      
      // Reset video to beginning if needed
      videoRef.current.currentTime = 0;
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("Video playing successfully"))
          .catch(error => {
            // Handle autoplay restrictions
            if (error.name === "NotAllowedError") {
              setVideoError("Video autoplay was blocked. Please try again.");
              setGameState('init');
            }
          });
      }

      // Set up timeupdate event to detect when lights turn off
      const timeUpdateHandler = (e: Event) => {
        const video = e.target as HTMLVideoElement;
        // Pause at the specified time when lights turn off
        if (video.currentTime >= 5.13) {
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
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("Video continuing successfully"))
          .catch(_error => {
            // Handle continuing playback error
            setVideoError("Error resuming video. Please try again.");
            setGameState('init');
          });
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
    
    if (!videoReady) {
      setGameState('loading');
      
      // Add a fallback timeout in case video never reaches ready state
      const fallbackTimer = setTimeout(() => {
        if (gameState === 'loading' && videoRef.current) {
          proceedToStartGame();
        }
      }, 3000);
      
      return () => clearTimeout(fallbackTimer);
    } else {
      proceedToStartGame();
    }
  };
  
  const proceedToStartGame = () => {
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
      setGameState('playingVideo');
    }, 1500); // Match this to the duration of the fade animation
  };

  // Video loading ready handler
  useEffect(() => {
    if (videoReady && gameState === 'loading') {
      proceedToStartGame();
    }
  }, [videoReady]);

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
          playPromise.catch(_error => {
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
    setVideoError(null);
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
      {/* Title banner replacing the SVG header */}
      <Box 
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: 'white',
          padding: '10px 0',
          borderRadius: '0 0 20px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70px',
          '@media screen and (max-height: 500px)': {
            height: '50px',
            padding: '5px 0',
          }
        }}
      >
        <Box 
          component="h1"
          sx={{
            color: 'black',
            fontSize: '18px',
            margin: 0,
            letterSpacing: '1px',
            fontWeight: 'normal',
            '@media screen and (max-height: 500px)': {
              fontSize: '16px',
            },
            '& .highlight-red': {
              color: 'red'
            }
          }}
        >
          <span className="highlight-red">R</span>EDLIGHT STA<span className="highlight-red">R</span>T
        </Box>
        <Box
          component="h2"
          sx={{
            color: 'black',
            fontSize: '14px',
            margin: '5px 0 0',
            fontWeight: 'normal',
            '@media screen and (max-height: 500px)': {
              fontSize: '12px',
              marginTop: '2px',
            },
            '@media screen and (max-height: 400px)': {
              display: 'none',
            },
          }}
        >
          レッドライトスタート
        </Box>
      </Box>

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
        {(gameState === 'init' || gameState === 'starting' || gameState === 'loading') && (
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
            
            {/* Start Button or Loading Indicator */}
            <Box
              sx={{
                position: "absolute",
                bottom: "25%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 4,
                opacity: gameState === 'starting' ? 0 : 1,
                transition: "opacity 0.5s ease-in-out",
              }}
            >
              {gameState === 'loading' ? (
                <>
                  <CircularProgress sx={{ color: 'white', mb: 1 }} />
                  <Box sx={{ color: 'white', fontSize: '16px', mt: 1 }}>Loading...</Box>
                </>
              ) : (
                <Box
                  component="button"
                  onClick={gameState === 'init' ? startGame : undefined}
                  disabled={gameState !== 'init'}
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
                    cursor: gameState === 'init' ? "pointer" : "default",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: gameState === 'init' ? "#dcdde1" : "#f5f6fa",
                      transform: gameState === 'init' ? "translateY(-2px)" : "none",
                      boxShadow: gameState === 'init' ? "0 6px 8px rgba(0, 0, 0, 0.15)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                    "&:active": {
                      transform: gameState === 'init' ? "translateY(1px)" : "none",
                      boxShadow: gameState === 'init' ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  START
                </Box>
              )}
              
              {/* Error message if video failed to load */}
              {videoError && (
                <Box sx={{ 
                  color: 'white', 
                  backgroundColor: 'rgba(255, 0, 0, 0.7)',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  marginTop: '10px',
                  fontSize: '14px'
                }}>
                  {videoError}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Video Element */}
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
            display: gameState === 'init' ? "none" : "block", // Only create the video element when needed
          }}
          onEnded={handleVideoEnd}
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={() => setVideoReady(true)}
        >
          <source src={SecondVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
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