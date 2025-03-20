/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import Modal from "./Modal";
import BottomNav from "./BottomNav";
import TapHereButton from "../images/start-button.svg";
import Svg7 from "../images/7.svg"; // Initial screen background image

import SecondVideo from '../assets/Movie2.mp4';

// Add MissionBanner and WhiteBelt components
const MissionBanner = ({ visible, onAnimationComplete }: { visible: boolean; onAnimationComplete: () => void }) => {
  const [opacity, setOpacity] = useState(0); // Start with opacity 0

  useEffect(() => {
    if (visible) {
      setOpacity(1);
      
      // Animation timing to match original implementation
      const timeoutId = setTimeout(() => {
        setOpacity(0);
        
        // Wait for fade out animation to complete before calling the callback
        setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, 500);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    } else {
      // Ensure opacity is 0 when not visible
      setOpacity(0);
    }
  }, [visible, onAnimationComplete]);

  // Return null instead of a component if not visible
  if (!visible) return null;

  return (
    <Box 
      sx={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        marginTop: "50px",
        width: "80%",
        maxWidth: "400px",
        background: "rgba(255, 255, 255, 0.95)",
        padding: "15px 20px",
        textAlign: "center",
        zIndex: 10,
        opacity: opacity,
        transition: "opacity 0.5s ease",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        display: opacity === 0 ? 'none' : 'block',
        '@media screen and (max-height: 500px)': {
          padding: '12px 18px',
        }
      }}
    >
      <Box 
        component="h2" 
        sx={{
          color: "black",
          fontSize: "18px",
          margin: 0,
          fontWeight: "bold",
          '@media screen and (max-height: 500px)': {
            fontSize: '16px',
          }
        }}
      >
        MISSION
      </Box>
      <Box 
        component="p"
        sx={{
          color: "black",
          fontSize: "14px",
          margin: "8px 0 0",
          '@media screen and (max-height: 500px)': {
            fontSize: '13px',
            marginTop: '6px',
          }
        }}
      >
        赤信号が消えたらすぐにタップしよう！
      </Box>
    </Box>
  );
};

const WhiteBelt = ({ visible }: { visible: boolean }) => {
  // Return null if not visible instead of relying only on CSS
  if (!visible) return null;
  
  return (
    <Box 
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 9,
        display: visible ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
        backgroundColor: "#ffffff"
      }}
    />
  );
};

const RedLight: React.FC = () => {
  const [gameState, setGameState] = useState<'init' | 'loading' | 'missionIntro' | 'starting' | 'playingVideo' | 'waitingForTap' | 'continuingVideo' | 'results'>('init');
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // We only need showMissionBanner now - no need for white belt
  const [showMissionBanner, setShowMissionBanner] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeUpdateHandlerRef = useRef<((e: Event) => void) | null>(null);

  // Add a transitioning state to track the transition period
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Modify startGame to add a 2-second transition delay
  const startGame = () => {
    console.log("Start button clicked");
    
    // First set transitioning state to true
    setIsTransitioning(true);
    
    // Add a 2-second delay before starting the video and showing mission banner
    setTimeout(() => {
      // Set game state to playingVideo after the delay
      setGameState('playingVideo');
      
      // Show mission banner on top of the playing video
      setShowMissionBanner(true);
      
      // Reset transitioning state
      setIsTransitioning(false);
    }, 2000); // Changed to 2 seconds delay
  };
  
  // Handle mission banner animation completion
  const handleMissionBannerComplete = () => {
    // Just hide the banner, video is already playing
    setShowMissionBanner(false);
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
    setShowMissionBanner(false);
  };

  // Add debugging to see when these states change
  useEffect(() => {
    console.log("Mission Banner State:", showMissionBanner);
  }, [showMissionBanner]);

  // Ensure initial state is set correctly
  useEffect(() => {
    // Make absolutely sure these are false on mount
    setShowMissionBanner(false);
  }, []);

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
        {(gameState === 'init' || gameState === 'starting' || gameState === 'loading' || isTransitioning) && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: isTransitioning ? 3 : 1, // Higher z-index during transition
              opacity: isTransitioning ? 0 : 1, // Fade out during transition
              transition: "opacity 2s ease-in-out", // Update to 2 seconds to match
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
                opacity: isTransitioning ? 0 : 1, // Fade out during transition
                transition: "opacity 2s ease-in-out", // Update to 2 seconds to match
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

        {/* Mission Banner and White Belt Overlay - Only include in the DOM when they should be visible */}
        {showMissionBanner && <MissionBanner 
          visible={true} 
          onAnimationComplete={handleMissionBannerComplete} 
        />}

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
            opacity: 1, // Always fully visible
            transition: "opacity 0.5s ease-in-out",
            display: gameState === 'init' ? "none" : "block", // Show in all states except init
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