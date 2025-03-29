"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Box, CircularProgress } from "@mui/material"
import Modal from "./Modal"
import BottomNav from "./BottomNav"
import TapHereButton from "../images/start-button.svg"
import Svg7 from "../images/7.svg" // Initial screen background image

// Import all three videos and sound
import Section1Video from "../assets/F1_RTT_movie1.mp4"
import Section2Video from "../assets/F1_RTT_movie_when_button_appear.mp4"
import Section3Video from "../assets/F1_RTT_movie_after_user_tap_movOnly.mp4"
import Section3Sound from "../assets/F1_RTT_movie_after_user_tap_sound.mp3"

// Preload background image to ensure it's cached
const preloadBackgroundImage = () => {
  const img = new Image();
  img.src = Svg7;
  return img;
};

const japaneseFontStyle = {
  fontFamily: "'JapaneseFont', sans-serif",
}

// Add MissionBanner and WhiteBelt components
const MissionBanner = ({ visible, onAnimationComplete }: { visible: boolean; onAnimationComplete: () => void }) => {
  const [opacity, setOpacity] = useState(0) // Start with opacity 0

  useEffect(() => {
    if (visible) {
      setOpacity(1)

      // Animation timing to match original implementation
      const timeoutId = setTimeout(() => {
        setOpacity(0)

        // Wait for fade out animation to complete before calling the callback
        setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete()
          }
        }, 500)
      }, 2000)

      return () => clearTimeout(timeoutId)
    } else {
      // Ensure opacity is 0 when not visible
      setOpacity(0)
    }
  }, [visible, onAnimationComplete])

  // Return null instead of a component if not visible
  if (!visible) return null

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        width: "100%",
        background: "rgba(255, 255, 255, 0.95)",
        padding: "15px 0", // Removed horizontal padding
        zIndex: 10,
        opacity: opacity,
        transition: "opacity 0.5s ease",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        display: opacity === 0 ? "none" : "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center", // Added text-align center to the container
        fontFamily: "'MyCustomFont', sans-serif",
        "@media screen and (max-height: 500px)": {
          padding: "12px 0", // Removed horizontal padding
        },
      }}
    >
      <Box
        component="h2"
        sx={{
          color: "black",
          fontSize: "18px",
          margin: 0, // Simplified margin
          fontWeight: "bold",
          fontFamily: "'MyCustomFont', sans-serif",
          textAlign: "center",
          "@media screen and (max-height: 500px)": {
            fontSize: "16px",
          },
        }}
      >
        MISSION
      </Box>
      <Box
        component="p"
        sx={{
          color: "black",
          fontSize: "12px",
          margin: "8px 0 0",
          ...japaneseFontStyle,
          textAlign: "center",
          maxWidth: "90%", // Added max-width to ensure text doesn't stretch too wide
          "@media screen and (max-height: 500px)": {
            fontSize: "13px",
            marginTop: "6px",
          },
        }}
      >
        ライトが消えたらアクセルを踏んで発進しよう！
      </Box>
    </Box>
  )
}

const RedLight: React.FC = () => {
  // Enhanced game state to handle the three sections
  const [gameState, setGameState] = useState<
    | "init"
    | "loading"
    | "missionIntro"
    | "starting"
    | "section1"
    | "waitingForDelay"
    | "section2"
    | "waitingForTap"
    | "section3"
    | "results"
  >("init")

  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [buttonActive, setButtonActive] = useState(false)
  const [, setVideoReady] = useState<{ [key: string]: boolean }>({
    section1: false,
    section2: false,
    section3: false,
  })
  const [videoError, setVideoError] = useState<string | null>(null)
  const [showMissionBanner, setShowMissionBanner] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Refs for video elements and audio
  const section1VideoRef = useRef<HTMLVideoElement>(null)
  const section2VideoRef = useRef<HTMLVideoElement>(null)
  const section3VideoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Add ref for the start button
  const startButtonRef = useRef<HTMLButtonElement>(null)

  // Refs for timeouts to properly clean them up
  const randomDelayTimeoutRef = useRef<number | null>(null)
  const resultTimeoutRef = useRef<number | null>(null)

  // Add ref for the background image
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const componentMountedRef = useRef(true);

  // Initialize and preload background image when component mounts
  useEffect(() => {
    componentMountedRef.current = true;
    backgroundImageRef.current = preloadBackgroundImage();
    
    // Refresh the background image when entering the screen
    if (gameState === "init") {
      backgroundImageRef.current = preloadBackgroundImage();
    }
    
    return () => {
      componentMountedRef.current = false;
    };
  }, []);

  // Ensure background is reloaded when returning to init state
  useEffect(() => {
    if (gameState === "init") {
      // Reload the background image
      backgroundImageRef.current = preloadBackgroundImage();
    }
  }, [gameState]);

  // Add robust cleanup for all video elements
  useEffect(() => {
    return () => {
      // Cleanup function that runs when component unmounts
      if (section1VideoRef.current) {
        section1VideoRef.current.pause();
        section1VideoRef.current.src = "";
        section1VideoRef.current.load();
      }
      if (section2VideoRef.current) {
        section2VideoRef.current.pause();
        section2VideoRef.current.src = "";
        section2VideoRef.current.load();
      }
      if (section3VideoRef.current) {
        section3VideoRef.current.pause();
        section3VideoRef.current.src = "";
        section3VideoRef.current.load();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
      
      // Clear any pending timeouts
      if (randomDelayTimeoutRef.current !== null) {
        clearTimeout(randomDelayTimeoutRef.current);
      }
      if (resultTimeoutRef.current !== null) {
        clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  // Preload all videos when component mounts or when returning to init state
  useEffect(() => {
    if (gameState === "init") {
      // Reset video elements
      if (section1VideoRef.current) {
        section1VideoRef.current.src = Section1Video;
        section1VideoRef.current.load();
      }
      if (section2VideoRef.current) {
        section2VideoRef.current.src = Section2Video;
        section2VideoRef.current.load();
      }
      if (section3VideoRef.current) {
        section3VideoRef.current.src = Section3Video;
        section3VideoRef.current.load();
      }
      if (audioRef.current) {
        audioRef.current.src = Section3Sound;
        audioRef.current.load();
      }
    }
  }, [gameState]);

  // Setup for Section 1 video - modified to use the gameState as a dependency
  useEffect(() => {
    if (gameState === "init") {
      // Setup for Section 1 video
      const section1Video = section1VideoRef.current
      if (section1Video) {
        section1Video.preload = "auto"
        section1Video.src = Section1Video;

        const handleCanPlayThrough = () => {
          if (componentMountedRef.current) {
            setVideoReady((prev) => ({ ...prev, section1: true }))
          }
        }

        const handleError = () => {
          if (componentMountedRef.current) {
            setVideoError("Failed to load initial video. Please try again.")
          }
        }

        section1Video.addEventListener("canplaythrough", handleCanPlayThrough)
        section1Video.addEventListener("error", handleError)

        // Start loading the video
        section1Video.load()

        return () => {
          section1Video.removeEventListener("canplaythrough", handleCanPlayThrough)
          section1Video.removeEventListener("error", handleError)
        }
      }
    }
  }, [gameState])

  // Preload Section 2 video
  useEffect(() => {
    const section2Video = section2VideoRef.current
    if (section2Video) {
      section2Video.preload = "auto"

      const handleCanPlayThrough = () => {
        setVideoReady((prev) => ({ ...prev, section2: true }))
      }

      const handleError = () => {
        setVideoError("Failed to load button video. Please try again.")
      }

      section2Video.addEventListener("canplaythrough", handleCanPlayThrough)
      section2Video.addEventListener("error", handleError)

      // Start loading the video
      section2Video.load()

      return () => {
        section2Video.removeEventListener("canplaythrough", handleCanPlayThrough)
        section2Video.removeEventListener("error", handleError)
      }
    }
  }, [])

  // Preload Section 3 video
  useEffect(() => {
    const section3Video = section3VideoRef.current
    if (section3Video) {
      section3Video.preload = "auto"

      const handleCanPlayThrough = () => {
        setVideoReady((prev) => ({ ...prev, section3: true }))
      }

      const handleError = () => {
        setVideoError("Failed to load result video. Please try again.")
      }

      section3Video.addEventListener("canplaythrough", handleCanPlayThrough)
      section3Video.addEventListener("error", handleError)

      // Start loading the video
      section3Video.load()

      return () => {
        section3Video.removeEventListener("canplaythrough", handleCanPlayThrough)
        section3Video.removeEventListener("error", handleError)
      }
    }
  }, [])

  // Section 1 video playback handler
  useEffect(() => {
    if (gameState === "section1" && section1VideoRef.current) {
      // Reset video to beginning
      section1VideoRef.current.currentTime = 0

      // Ensure audio is enabled
      section1VideoRef.current.muted = false

      const playPromise = section1VideoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("Section 1 video playing successfully"))
          .catch((error) => {
            // Handle autoplay restrictions
            if (error.name === "NotAllowedError") {
              setVideoError("Video autoplay was blocked. Please try again.")
              setGameState("init")
            }
          })
      }

      // Handler for when Section 1 video ends
      const handleVideoEnded = () => {
        console.log("Section 1 video ended, applying random delay")
        setGameState("waitingForDelay")

        // Random delay between 0 and 1000ms before starting section 2
        const randomDelay = Math.random() * 1000
        randomDelayTimeoutRef.current = window.setTimeout(() => {
          setGameState("section2")
        }, randomDelay)
      }

      section1VideoRef.current.addEventListener("ended", handleVideoEnded)

      return () => {
        if (section1VideoRef.current) {
          section1VideoRef.current.removeEventListener("ended", handleVideoEnded)
        }
      }
    }
  }, [gameState])

  // Section 2 video playback handler
  useEffect(() => {
    if (gameState === "section2" && section2VideoRef.current) {
      // Reset video to beginning
      section2VideoRef.current.currentTime = 0

      // Ensure audio is enabled
      section2VideoRef.current.muted = false

      // Activate button immediately when section 2 starts
      setButtonActive(true)
      setReactionStartTime(Date.now())

      const playPromise = section2VideoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("Section 2 video playing successfully"))
          .catch((error) => {
            console.error("Error playing section 2 video:", error)
            setVideoError("Error playing video. Please try again.")
            setGameState("init")
          })
      }

      // Handler for when Section 2 video ends
      const handleVideoEnded = () => {
        console.log("Section 2 video ended, waiting for tap")
        setGameState("waitingForTap")
      }

      section2VideoRef.current.addEventListener("ended", handleVideoEnded)

      return () => {
        if (section2VideoRef.current) {
          section2VideoRef.current.removeEventListener("ended", handleVideoEnded)
        }
      }
    }
  }, [gameState])

  // Section 3 video and sound playback handler
  useEffect(() => {
    if (gameState === "section3") {
      // Start playing the section 3 video
      if (section3VideoRef.current) {
        // Reset video to beginning
        section3VideoRef.current.currentTime = 0

        // Ensure audio is enabled for the video
        section3VideoRef.current.muted = false

        const playPromise = section3VideoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing section 3 video:", error)
          })
        }

        // Play the sound effect
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch((error) => {
            console.error("Error playing sound:", error)
          })
        }

        // Set timeout to stop video after 1.5 seconds and show results
        resultTimeoutRef.current = window.setTimeout(() => {
          if (section3VideoRef.current) {
            section3VideoRef.current.pause()
          }
          setGameState("results")
          setOpenModal(true)
          // Note: We don't stop the sound here as it should continue playing
        }, 1500)
      }

      return () => {
        // Clear the timeout if the component unmounts or gameState changes
        if (resultTimeoutRef.current !== null) {
          clearTimeout(resultTimeoutRef.current)
          resultTimeoutRef.current = null
        }
      }
    }
  }, [gameState])

  // Cleanup for random delay timeout
  useEffect(() => {
    return () => {
      if (randomDelayTimeoutRef.current !== null) {
        clearTimeout(randomDelayTimeoutRef.current)
        randomDelayTimeoutRef.current = null
      }
    }
  }, [])

  // Stop sound when user leaves the results screen
  useEffect(() => {
    // Function to stop audio when the custom event is fired
    const stopAudioHandler = () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }

    // Add event listener for the custom event
    document.addEventListener("stopGameAudio", stopAudioHandler)

    if (gameState === "init") {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }

    // Clean up the event listener when component unmounts
    return () => {
      document.removeEventListener("stopGameAudio", stopAudioHandler)
    }
  }, [gameState])

  // Modify startGame to show banner on top of a static video frame
  const startGame = () => {
    console.log("Start button clicked")

    // First set transitioning state to true
    setIsTransitioning(true)

    // Add a 2-second delay before showing mission banner
    setTimeout(() => {
      // Change the state to missionIntro
      setGameState("missionIntro")

      // Reset transitioning state
      setIsTransitioning(false)

      // Wait a small amount of time to ensure video is ready and visible but paused
      setTimeout(() => {
        // Make sure video is reset to the beginning and paused
        if (section1VideoRef.current) {
          section1VideoRef.current.currentTime = 0
          section1VideoRef.current.pause()
        }

        // Now show mission banner on top of the static video
        setShowMissionBanner(true)
      }, 50)
    }, 2000)
  }

  // Handle mission banner animation completion
  const handleMissionBannerComplete = () => {
    // First hide the banner
    setShowMissionBanner(false)

    // Now start playing section 1 video
    setGameState("section1")
  }

  // Handle tap button click
  const handleTapClick = () => {
    if ((gameState === "section2" || gameState === "waitingForTap") && buttonActive && reactionStartTime) {
      const timeDiff = Date.now() - reactionStartTime
      setReactionTime(timeDiff)
      setButtonActive(false) // Disable button after click

      // Stop section 2 video if it's still playing
      if (section2VideoRef.current) {
        section2VideoRef.current.pause()
      }

      // Start section 3
      setGameState("section3")
    }
  }

  const handleRestartGame = () => {
    // First close the modal
    setOpenModal(false)

    // Use a small delay before resetting game state to ensure proper transition
    setTimeout(() => {
      setGameState("init")
      setReactionTime(null)
      setReactionStartTime(null)
      setButtonActive(false)
      setVideoError(null)
      setShowMissionBanner(false)
      setIsTransitioning(false) // Ensure transition state is reset

      // Reset visual state of the button to default appearance
      if (startButtonRef.current) {
        startButtonRef.current.blur()
        startButtonRef.current.style.backgroundColor = "#f5f6fa"
        startButtonRef.current.style.transform = "none"
        startButtonRef.current.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
      }

      // Reset and reload all video elements
      if (section1VideoRef.current) {
        section1VideoRef.current.pause()
        section1VideoRef.current.currentTime = 0
        section1VideoRef.current.src = Section1Video
        section1VideoRef.current.load()
      }
      if (section2VideoRef.current) {
        section2VideoRef.current.pause()
        section2VideoRef.current.currentTime = 0
        section2VideoRef.current.src = Section2Video
        section2VideoRef.current.load()
      }
      if (section3VideoRef.current) {
        section3VideoRef.current.pause()
        section3VideoRef.current.currentTime = 0
        section3VideoRef.current.src = Section3Video
        section3VideoRef.current.load()
      }

      // Stop and reload the audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current.src = Section3Sound
        audioRef.current.load()
      }
      
      // Reload background image
      backgroundImageRef.current = preloadBackgroundImage();
    }, 50)
  }

  // Create a handler to prevent default touch actions on the entire app
  const preventDefaultTouchAction = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }

  // Add event listener to prevent pinch zoom and other touch gestures
  useEffect(() => {
    document.addEventListener("touchmove", preventDefaultTouchAction, { passive: false })

    // Ensure the viewport meta tag is set correctly
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no",
      )
    } else {
      // If viewport meta doesn't exist, create it
      const meta = document.createElement("meta")
      meta.name = "viewport"
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
      document.head.appendChild(meta)
    }

    return () => {
      document.removeEventListener("touchmove", preventDefaultTouchAction)
    }
  }, [])

  // Add this new useEffect to reset button state when returning to init
  useEffect(() => {
    if (gameState === "init") {
      // Remove focus and reset visual state of button when returning to init
      if (startButtonRef.current) {
        startButtonRef.current.blur()

        // Add a small delay to ensure any hover/active states are cleared
        setTimeout(() => {
          if (startButtonRef.current) {
            startButtonRef.current.style.backgroundColor = "#f5f6fa"
            startButtonRef.current.style.transform = "none"
            startButtonRef.current.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
          }
        }, 50)
      }
    }
  }, [gameState])

  // Get current active video based on game state

  // Determine which video should be visible
  const getVideoVisibility = (videoType: "section1" | "section2" | "section3") => {
    if (videoType === "section1") {
      return gameState === "missionIntro" || gameState === "section1" || gameState === "waitingForDelay"
    } else if (videoType === "section2") {
      return gameState === "section2" || gameState === "waitingForTap"
    } else if (videoType === "section3") {
      return gameState === "section3" || gameState === "results"
    }
    return false
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "fixed", // Change from relative to fixed to prevent scrolling
        top: 0,
        left: 0,
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#242424",
        fontFamily: "'MyCustomFont', sans-serif",
        touchAction: "none", // Disable browser handling of all touch gestures
      }}
      onTouchMove={(e) => e.preventDefault()} // Additional prevention of touch moves
    >
      {/* Title banner replacing the SVG header */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "white",
          padding: "10px 0",
          borderRadius: "0 0 20px 20px",
          textAlign: "center",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          zIndex: 1000, // Increased to match bottom nav z-index for consistency
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "70px",
          fontFamily: "'MyCustomFont', sans-serif",
          "@media screen and (max-height: 500px)": {
            height: "50px",
            padding: "5px 0",
          },
        }}
      >
        <Box
          component="h1"
          sx={{
            color: "black",
            fontSize: "18px",
            margin: 0,
            letterSpacing: "1px",
            fontWeight: "normal",
            fontFamily: "'MyCustomFont', sans-serif",
            "@media screen and (max-height: 500px)": {
              fontSize: "16px",
            },
            "& .highlight-red": {
              color: "red",
            },
          }}
        >
          <span className="highlight-red">R</span>EACTION TIME <span className="highlight-red">T</span>EST
        </Box>
        <Box
          component="h2"
          sx={{
            color: "black",
            fontSize: "14px",
            margin: "5px 0 0",
            fontWeight: "normal",
            fontFamily: "'JapaneseFont', sans-serif",
            "@media screen and (max-height: 500px)": {
              fontSize: "12px",
              marginTop: "2px",
            },
            "@media screen and (max-height: 400px)": {
              display: "none",
            },
          }}
        >
          リアクションタイムテスト
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
          fontFamily: "'MyCustomFont', sans-serif",
        }}
      >
        {/* Initial screen - with fade-out animation when state changes */}
        {(gameState === "init" || gameState === "starting" || gameState === "loading" || isTransitioning) && (
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
              fontFamily: "'MyCustomFont', sans-serif",
              // Force repaint when transitioning back to init state
              key: `background-${gameState === "init" ? Date.now() : "transitioning"}`,
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
              // Force reload of image when component is remounted
              key={`background-image-${gameState === "init" ? Date.now() : "static"}`}
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
                fontFamily: "'MyCustomFont', sans-serif",
              }}
            >
              {gameState === "loading" ? (
                <>
                  <CircularProgress sx={{ color: "white", mb: 1 }} />
                  <Box sx={{ color: "white", fontSize: "16px", mt: 1, fontFamily: "'MyCustomFont', sans-serif" }}>
                    Loading...
                  </Box>
                </>
              ) : (
                <Box
                  component="button"
                  ref={startButtonRef}
                  onClick={gameState === "init" ? startGame : undefined}
                  disabled={gameState !== "init"}
                  className="start-button"
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
                    cursor: gameState === "init" ? "pointer" : "default",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    fontFamily: "'MyCustomFont', sans-serif",
                    "&:hover": {
                      backgroundColor: gameState === "init" ? "#dcdde1" : "#f5f6fa",
                      transform: gameState === "init" ? "translateY(-2px)" : "none",
                      boxShadow:
                        gameState === "init" ? "0 6px 8px rgba(0, 0, 0, 0.15)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                    "&:active": {
                      transform: gameState === "init" ? "translateY(1px)" : "none",
                      boxShadow: gameState === "init" ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
                    },
                    "&:focus": {
                      outline: "none",
                    },
                    "&:not(:focus-visible)": {
                      backgroundColor: "#f5f6fa !important",
                      transform: "none !important",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1) !important",
                    },
                  }}
                  key={`start-button-${gameState === "init" ? "ready" : "disabled"}-${Date.now()}`}
                >
                  START
                </Box>
              )}

              {/* Error message if video failed to load */}
              {videoError && (
                <Box
                  sx={{
                    color: "white",
                    backgroundColor: "rgba(255, 0, 0, 0.7)",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    marginTop: "10px",
                    fontSize: "14px",
                    fontFamily: "'MyCustomFont', sans-serif",
                  }}
                >
                  {videoError}
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Mission Banner Overlay */}
        {showMissionBanner && <MissionBanner visible={true} onAnimationComplete={handleMissionBannerComplete} />}

        {/* Section 1 Video */}
        <video
          ref={section1VideoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
            opacity: getVideoVisibility("section1") ? 1 : 0,
            display: getVideoVisibility("section1") ? "block" : "none",
            transition: "opacity 0.5s ease-in-out",
          }}
          playsInline
          preload="auto"
        >
          <source src={Section1Video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Tap button shown during Section 1 (inactive) and Section 2 (active) */}
        {(gameState === "section1" ||
          gameState === "waitingForDelay" ||
          gameState === "section2" ||
          gameState === "waitingForTap") && (
          <Box
            component="img"
            src={TapHereButton}
            alt="Tap Here"
            sx={{
              position: "absolute",
              zIndex: 2,
              width: "120px", // Default size
              height: "auto",
              cursor: buttonActive ? "pointer" : "default",
              bottom: "18%",
              left: "50%", // Center the button horizontally
              transform: "translateX(-50%)", // Ensure proper centering
              opacity: buttonActive ? 1 : 0.3, // More transparent when inactive
              transition: "opacity 0.3s ease-in-out",
              filter: buttonActive ? "brightness(1.1)" : "grayscale(0.7)", // Add grayscale filter when inactive
              willChange: "opacity",
              "@media screen and (max-width: 320px)": {
                width: "100px",
                bottom: "15%",
              },
              "@media screen and (max-height: 500px)": {
                width: "100px",
                bottom: "12%",
              },
              "@media screen and (max-height: 400px)": {
                width: "80px",
                bottom: "10%",
              },
            }}
            onClick={buttonActive ? handleTapClick : undefined}
          />
        )}

        {/* Section 2 Video */}
        <video
          ref={section2VideoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
            opacity: getVideoVisibility("section2") ? 1 : 0,
            display: getVideoVisibility("section2") ? "block" : "none",
            transition: "opacity 0.5s ease-in-out",
          }}
          playsInline
          preload="auto"
        >
          <source src={Section2Video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Section 3 Video */}
        <video
          ref={section3VideoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
            opacity: getVideoVisibility("section3") ? 1 : 0,
            display: getVideoVisibility("section3") ? "block" : "none",
            transition: "opacity 0.5s ease-in-out",
          }}
          playsInline
          preload="auto"
        >
          <source src={Section3Video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Audio element for Section 3 sound */}
        <audio ref={audioRef} preload="auto">
          <source src={Section3Sound} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {/* Tap button shown during Section 2 */}
        {(gameState === "section2" || gameState === "waitingForTap") && (
          <Box
            component="img"
            src={TapHereButton}
            alt="Tap Here"
            sx={{
              position: "absolute",
              zIndex: 2,
              width: "120px", // Default size
              height: "auto",
              cursor: buttonActive ? "pointer" : "default",
              bottom: "18%",
              left: "50%", // Center the button horizontally
              transform: "translateX(-50%)", // Ensure proper centering
              opacity: buttonActive ? 1 : 0.5,
              transition: "opacity 0.3s ease-in-out",
              filter: buttonActive ? "brightness(1.1)" : "none",
              willChange: "opacity",
              "@media screen and (max-width: 320px)": {
                width: "100px",
                bottom: "15%",
              },
              "@media screen and (max-height: 500px)": {
                width: "100px",
                bottom: "12%",
              },
              "@media screen and (max-height: 400px)": {
                width: "80px",
                bottom: "10%",
              },
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
  )
}

export default RedLight

