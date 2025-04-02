"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import Modal from "./Modal";
import BottomNav from "./BottomNav";
import Svg7 from "../images/7.svg"; // Initial screen background image
import logo from "../images/grandprix.svg";

// Import all three videos and sound
import Section1Video from "../assets/F1_RTT_movie1.mp4";
import Section2Video from "../assets/F1_RTT_movie_when_button_appear.mp4";
import Section3Video from "../assets/F1_RTT_movie_after_user_tap_movOnly.mp4";
import Section3Sound from "../assets/F1_RTT_movie_after_user_tap_sound.mp3";

const TapButton = ({
  onClick,
  active = true,
}: {
  onClick?: () => void;
  active?: boolean;
}) => (
  <Box
    component="button"
    onClick={active ? onClick : undefined}
    sx={{
      position: "absolute",
      zIndex: 2,
      background: "none",
      border: "none",
      padding: 0,
      width: "120px",
      height: "auto",
      cursor: active ? "pointer" : "default",
      bottom: "18%",
      left: "50%",
      transform: "translateX(-50%)",
      opacity: active ? 1 : 0.3,
      transition: "opacity 0.3s ease-in-out, transform 0.2s ease",
      filter: active ? "brightness(1.1)" : "grayscale(0.7)",
      willChange: "opacity",
      "&:active": {
        transform: active ? "translateX(-50%) scale(0.95)" : "translateX(-50%)",
      },
      "&:focus": {
        outline: "none",
      },
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
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 119.266 129"
    >
      <g
        id="アクセルボタン"
        transform="translate(-253 -663)"
        style={{ isolation: "isolate" }}
      >
        <path
          id="Path_39"
          data-name="Path 39"
          d="M16.853,0h85.56c9.308,0,16.853,5.82,16.853,13V116c0,7.18-7.545,13-16.853,13H16.853c-9.308,0,11.411-16.692,11.411-23.872V80.138L0,13C0,5.82,7.545,0,16.853,0Z"
          transform="translate(253 663)"
          fill="#dd1c1c"
          style={{ mixBlendMode: "multiply", isolation: "isolate" }}
        />
        <text
          id="MISSION"
          transform="translate(320.266 695)"
          fill="#fff"
          fontSize="20"
          fontFamily="MyCustomFont"
          letterSpacing="0.014em"
        >
          <tspan x="-20.419" y="8">
            TAP
          </tspan>
          <tspan x="-30.761" y="32">
            HERE
          </tspan>
        </text>
      </g>
    </svg>
  </Box>
);

// Preload background image to ensure it's cached
const preloadBackgroundImage = () => {
  const timestamp = new Date().getTime();
  const img = new Image();
  img.src = `${Svg7}?t=${timestamp}`;
  return img;
};

const japaneseFontStyle = {
  fontFamily: 'JapaneseFont',
};

const MissionBanner = ({
  visible,
  onAnimationComplete,
}: {
  visible: boolean;
  onAnimationComplete: () => void;
}) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (visible) {
      setOpacity(1);
      const timeoutId = setTimeout(() => {
        setOpacity(0);
        setTimeout(() => {
          if (onAnimationComplete) onAnimationComplete();
        }, 500);
      }, 2000);
      return () => clearTimeout(timeoutId);
    } else {
      setOpacity(0);
    }
  }, [visible, onAnimationComplete]);

  if (!visible) return null;

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
        padding: "15px 0",
        zIndex: 10,
        opacity: opacity,
        transition: "opacity 0.5s ease",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        display: opacity === 0 ? "none" : "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "'MyCustomFont', sans-serif",
        "@media screen and (max-height: 500px)": {
          padding: "12px 0",
        },
      }}
    >
      <Box
        component="h2"
        sx={{
          color: "black",
          fontSize: "18px",
          margin: 0,
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
          fontFamily: "JapaneseFont",
          textAlign: "center",
          maxWidth: "90%",
          "@media screen and (max-height: 500px)": {
            fontSize: "13px",
            marginTop: "6px",
          },
        }}
      >
        ライトが消えたらアクセルを踏んで発進しよう！
      </Box>
    </Box>
  );
};

const RedLight: React.FC = () => {
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
  >("init");
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(
    null
  );
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [, setVideoReady] = useState<{ [key: string]: boolean }>({
    section1: false,
    section2: false,
    section3: false,
  });
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showMissionBanner, setShowMissionBanner] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false); // Add new state for video loading

  const section1VideoRef = useRef<HTMLVideoElement>(null);
  const section2VideoRef = useRef<HTMLVideoElement>(null);
  const section3VideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const randomDelayTimeoutRef = useRef<number | null>(null);
  const resultTimeoutRef = useRef<number | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const componentMountedRef = useRef(true);
  const [isReturnVisit, setIsReturnVisit] = useState(false);
  const cacheBustTimestamp = useRef(Date.now());

  useEffect(() => {
    componentMountedRef.current = true;
    const hasVisitedBefore = sessionStorage.getItem("hasVisitedGame");
    if (hasVisitedBefore === "true") {
      setIsReturnVisit(true);
      cacheBustTimestamp.current = Date.now();
    } else {
      sessionStorage.setItem("hasVisitedGame", "true");
    }
    backgroundImageRef.current = preloadBackgroundImage();

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        cacheBustTimestamp.current = Date.now();
        backgroundImageRef.current = preloadBackgroundImage();
        const container = document.getElementById("game-container");
        if (container) {
          container.style.display = "none";
          setTimeout(() => {
            container.style.display = "flex";
          }, 10);
        }
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      componentMountedRef.current = false;
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  useEffect(() => {
    if (gameState === "init") {
      cacheBustTimestamp.current = Date.now();
      backgroundImageRef.current = preloadBackgroundImage();
      setVideoError(null);
    }
  }, [gameState]);

  useEffect(() => {
    if (isReturnVisit && gameState === "init") {
      cacheBustTimestamp.current = Date.now();
      backgroundImageRef.current = preloadBackgroundImage();
      const gameContainer = document.querySelector(".game-root-container");
      if (gameContainer) {
        const display = (gameContainer as HTMLElement).style.display;
        (gameContainer as HTMLElement).style.display = "none";
        void (gameContainer as HTMLElement).offsetHeight;
        (gameContainer as HTMLElement).style.display = display;
      }
      setIsReturnVisit(false);
    }
  }, [isReturnVisit, gameState]);

  useEffect(() => {
    return () => {
      [section1VideoRef, section2VideoRef, section3VideoRef].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.src = "";
          ref.current.load();
        }
      });
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
      [randomDelayTimeoutRef, resultTimeoutRef].forEach((ref) => {
        if (ref.current !== null) clearTimeout(ref.current);
      });
    };
  }, []);

  useEffect(() => {
    if (gameState === "init") {
      [section1VideoRef, section2VideoRef, section3VideoRef].forEach(
        (ref, index) => {
          if (ref.current) {
            ref.current.src = [Section1Video, Section2Video, Section3Video][
              index
            ];
            ref.current.load();
          }
        }
      );
      if (audioRef.current) {
        audioRef.current.src = Section3Sound;
        audioRef.current.load();
      }
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === "init" && section1VideoRef.current) {
      section1VideoRef.current.preload = "auto";
      section1VideoRef.current.src = Section1Video;
      const handleCanPlayThrough = () =>
        componentMountedRef.current &&
        setVideoReady((prev) => ({ ...prev, section1: true }));
      const handleError = () =>
        componentMountedRef.current &&
        setVideoError("Failed to load initial video. Please try again.");
      section1VideoRef.current.addEventListener(
        "canplaythrough",
        handleCanPlayThrough
      );
      section1VideoRef.current.addEventListener("error", handleError);
      section1VideoRef.current.load();
      return () => {
        section1VideoRef.current?.removeEventListener(
          "canplaythrough",
          handleCanPlayThrough
        );
        section1VideoRef.current?.removeEventListener("error", handleError);
      };
    }
  }, [gameState]);

  useEffect(() => {
    const ref = section2VideoRef.current;
    if (ref) {
      ref.preload = "auto";
      const handleCanPlayThrough = () =>
        setVideoReady((prev) => ({ ...prev, section2: true }));
      const handleError = () =>
        setVideoError("Failed to load button video. Please try again.");
      ref.addEventListener("canplaythrough", handleCanPlayThrough);
      ref.addEventListener("error", handleError);
      ref.load();
      return () => {
        ref.removeEventListener("canplaythrough", handleCanPlayThrough);
        ref.removeEventListener("error", handleError);
      };
    }
  }, []);

  useEffect(() => {
    const ref = section3VideoRef.current;
    if (ref) {
      ref.preload = "auto";
      const handleCanPlayThrough = () =>
        setVideoReady((prev) => ({ ...prev, section3: true }));
      const handleError = () =>
        setVideoError("Failed to load result video. Please try again.");
      ref.addEventListener("canplaythrough", handleCanPlayThrough);
      ref.addEventListener("error", handleError);
      ref.load();
      return () => {
        ref.removeEventListener("canplaythrough", handleCanPlayThrough);
        ref.removeEventListener("error", handleError);
      };
    }
  }, []);

  useEffect(() => {
    if (gameState === "section1" && section1VideoRef.current) {
      section1VideoRef.current.currentTime = 0;
      section1VideoRef.current.muted = false;
      const playPromise = section1VideoRef.current.play();
      if (playPromise) {
        playPromise
          .then(() => console.log("Section 1 video playing successfully"))
          .catch((error) => {
            if (error.name === "NotAllowedError") {
              setVideoError("Video autoplay was blocked. Please try again.");
              setGameState("init");
            }
          });
      }
      const handleVideoEnded = () => {
        console.log("Section 1 video ended, applying random delay");
        setGameState("waitingForDelay");
        const randomDelay = 200 + Math.random() * 2800;
        console.log(
          `Setting random delay of ${randomDelay.toFixed(2)}ms (${(
            randomDelay / 1000
          ).toFixed(2)}s)`
        );
        randomDelayTimeoutRef.current = window.setTimeout(() => {
          console.log("Random delay completed, starting section 2");
          setGameState("section2");
        }, randomDelay);
      };
      section1VideoRef.current.addEventListener("ended", handleVideoEnded);
      return () =>
        section1VideoRef.current?.removeEventListener(
          "ended",
          handleVideoEnded
        );
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === "section2" && section2VideoRef.current) {
      section2VideoRef.current.currentTime = 0;
      section2VideoRef.current.muted = false;
      setButtonActive(true);
      setReactionStartTime(Date.now());
      const playPromise = section2VideoRef.current.play();
      if (playPromise) {
        playPromise
          .then(() => console.log("Section 2 video playing successfully"))
          .catch((error) => {
            console.error("Error playing section 2 video:", error);
            setVideoError("Error playing video. Please try again.");
            setGameState("init");
          });
      }
      const handleVideoEnded = () => {
        console.log("Section 2 video ended, waiting for tap");
        setGameState("waitingForTap");
      };
      section2VideoRef.current.addEventListener("ended", handleVideoEnded);
      return () =>
        section2VideoRef.current?.removeEventListener(
          "ended",
          handleVideoEnded
        );
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === "section3" && section3VideoRef.current) {
      section3VideoRef.current.currentTime = 0;
      section3VideoRef.current.muted = false;
      const playPromise = section3VideoRef.current.play();
      if (playPromise)
        playPromise.catch((error) =>
          console.error("Error playing section 3 video:", error)
        );
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .catch((error) => console.error("Error playing sound:", error));
      }
      resultTimeoutRef.current = window.setTimeout(() => {
        section3VideoRef.current?.pause();
        setGameState("results");
        setOpenModal(true);
      }, 1500);
      return () => {
        if (resultTimeoutRef.current !== null)
          clearTimeout(resultTimeoutRef.current);
      };
    }
  }, [gameState]);

  useEffect(() => {
    return () => {
      if (randomDelayTimeoutRef.current !== null)
        clearTimeout(randomDelayTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const stopAudioHandler = () =>
      audioRef.current?.pause() && (audioRef.current.currentTime = 0);
    document.addEventListener("stopGameAudio", stopAudioHandler);
    if (gameState === "init" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    return () =>
      document.removeEventListener("stopGameAudio", stopAudioHandler);
  }, [gameState]);

  const startGame = () => {
    console.log("Start button clicked");
    
    // Show loading indicator
    setIsVideoLoading(true);
    
    // Reset and ensure video is ready to be played
    if (section1VideoRef.current) {
      section1VideoRef.current.currentTime = 0;
      
      // Add event listener to know when video is ready
      const handleVideoReady = () => {
        console.log("Video is ready to play");
        
        // Remove the event listener
        section1VideoRef.current?.removeEventListener('canplaythrough', handleVideoReady);
        
        // Hide loading indicator
        setIsVideoLoading(false);
        
        // Show the video
        if (section1VideoRef.current) {
          section1VideoRef.current.style.display = "block";
          section1VideoRef.current.style.opacity = "1";
          section1VideoRef.current.pause();
        }
        
        // Switch to mission intro state
        setGameState("missionIntro");
        
        // Show mission banner
        setTimeout(() => {
          setShowMissionBanner(true);
        }, 100);
      };
      
      // Attach event listener for video ready state
      section1VideoRef.current.addEventListener('canplaythrough', handleVideoReady);
      
      // Force reload the video to ensure fresh load
      section1VideoRef.current.load();
      
      // Add a safety timeout in case the video takes too long to load
      setTimeout(() => {
        if (isVideoLoading) {
          console.log("Video load timeout - proceeding anyway");
          setIsVideoLoading(false);
          setGameState("missionIntro");
          
          // Show video and mission banner
          if (section1VideoRef.current) {
            section1VideoRef.current.style.display = "block";
            section1VideoRef.current.style.opacity = "1";
            section1VideoRef.current.pause();
          }
          
          setTimeout(() => {
            setShowMissionBanner(true);
          }, 100);
          
          // Remove the event listener if it's still attached
          section1VideoRef.current?.removeEventListener('canplaythrough', handleVideoReady);
        }
      }, 5000); // 5 second safety timeout
    } else {
      // Fallback if video ref isn't available
      setIsVideoLoading(false);
      setGameState("missionIntro");
      setTimeout(() => {
        setShowMissionBanner(true);
      }, 100);
    }
  };

  const handleMissionBannerComplete = () => {
    setShowMissionBanner(false);
    setGameState("section1");
  };

  const handleTapClick = () => {
    if (
      (gameState === "section2" || gameState === "waitingForTap") &&
      buttonActive &&
      reactionStartTime
    ) {
      const timeDiff = Date.now() - reactionStartTime;
      setReactionTime(timeDiff);
      setButtonActive(false);
      section2VideoRef.current?.pause();
      setGameState("section3");
    }
  };

  const handleRestartGame = () => {
    setOpenModal(false);
    setTimeout(() => {
      setGameState("init");
      setReactionTime(null);
      setReactionStartTime(null);
      setButtonActive(false);
      setVideoError(null);
      setShowMissionBanner(false);
      setIsTransitioning(false);
      if (startButtonRef.current) {
        startButtonRef.current.blur();
        startButtonRef.current.style.backgroundColor = "#f5f6fa";
        startButtonRef.current.style.transform = "none";
        startButtonRef.current.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
      }
      const timestamp = Date.now();
      [section1VideoRef, section2VideoRef, section3VideoRef].forEach(
        (ref, index) => {
          if (ref.current) {
            ref.current.pause();
            ref.current.currentTime = 0;
            ref.current.src =
              [Section1Video, Section2Video, Section3Video][index] +
              `?t=${timestamp}`;
            ref.current.load();
          }
        }
      );
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = `${Section3Sound}?t=${timestamp}`;
        audioRef.current.load();
      }
      cacheBustTimestamp.current = timestamp;
      backgroundImageRef.current = preloadBackgroundImage();
    }, 50);
  };

  const preventDefaultTouchAction = (e: TouchEvent) => {
    if (e.touches.length > 1) e.preventDefault();
  };

  useEffect(() => {
    document.addEventListener("touchmove", preventDefaultTouchAction, {
      passive: false,
    });
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no";
      document.head.appendChild(meta);
    }
    return () =>
      document.removeEventListener("touchmove", preventDefaultTouchAction);
  }, []);

  useEffect(() => {
    if (gameState === "init" && startButtonRef.current) {
      startButtonRef.current.blur();
      setTimeout(() => {
        if (startButtonRef.current) {
          startButtonRef.current.style.backgroundColor = "#f5f6fa";
          startButtonRef.current.style.transform = "none";
          startButtonRef.current.style.boxShadow =
            "0 4px 6px rgba(0, 0, 0, 0.1)";
        }
      }, 50);
    }
  }, [gameState]);

  const getVideoVisibility = (
    videoType: "section1" | "section2" | "section3"
  ) => {
    return (
      {
        section1:
          gameState === "missionIntro" ||
          gameState === "section1" ||
          gameState === "waitingForDelay",
        section2: gameState === "section2" || gameState === "waitingForTap",
        section3: gameState === "section3" || gameState === "results",
      }[videoType] || false
    );
  };

  return (
    <Box
      className="game-root-container"
      id="game-container"
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        paddingBottom: "65px", // Add padding to make space for the footer
        margin: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#242424",
        fontFamily: "'MyCustomFont', sans-serif",
        touchAction: "none",
      }}
      onTouchMove={(e) => e.preventDefault()}
    >
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
          fontFamily: "'MyCustomFont', sans-serif",
          zIndex: 1,
        }}
      >
        {(gameState === "init" ||
          gameState === "starting" ||
          gameState === "loading" ||
          isTransitioning) && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: isTransitioning ? 3 : 1,
              opacity: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'MyCustomFont', sans-serif",
              key: `background-${cacheBustTimestamp.current}`,
            }}
          >
            <Box
              component="img"
              src={`${Svg7}?t=${cacheBustTimestamp.current}`}
              alt="F1 Car"
              sx={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
                objectPosition: "center 40%",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: 2,
                transform: {
                  xs: "scale(1)",
                  sm: "scale(0.95)",
                  md: "scale(0.9)",
                },
              }}
              key={`background-image-${cacheBustTimestamp.current}`}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: { xs: "15%", sm: "18%", md: "20%" },
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 4,
                opacity: 1,
                fontFamily: "'MyCustomFont', sans-serif",
                paddingBottom: { xs: "10px", sm: "10px", md: "10px" },
                marginTop: { xs: "0px", sm: "100px", md: "120px" },
              }}
            >
              {gameState === "loading" || isVideoLoading ? (
                <>
                  <CircularProgress 
                    sx={{ 
                      color: "#E00400", // Red color to match F1 theme
                      mb: 1,
                      '& .MuiCircularProgress-circle': {
                        strokeWidth: 5, // Slightly thicker progress circle
                      }
                    }} 
                    size={50} 
                  />
                  <Box
                    sx={{
                      color: "white",
                      fontSize: "16px",
                      mt: 1,
                      fontFamily: "'MyCustomFont', sans-serif",
                    }}
                  >
                    {isVideoLoading ? "Loading Game..." : "Loading..."}
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    component="button"
                    ref={startButtonRef}
                    onClick={gameState === "init" ? startGame : undefined}
                    disabled={gameState !== "init"}
                    className="start-button"
                    sx={{
                      width: "80%",
                      maxWidth: "300px",
                      height: "auto",
                      padding: "12px 0",
                      borderRadius: "28px",
                      backgroundColor: "#f5f6fa",
                      color: "#2f3640",
                      border: "none",
                      fontSize: "20px",
                      fontWeight: "bold",
                      cursor: gameState === "init" ? "pointer" : "default",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      fontFamily: "'MyCustomFont', sans-serif",
                      "@media screen and (max-width: 768px)": {
                        maxWidth: "280px",
                        fontSize: "20px",
                      },
                      "@media screen and (max-width: 480px)": {
                        maxWidth: "260px",
                        fontSize: "18px",
                        padding: "14px 0",
                      },
                      "@media screen and (max-height: 500px)": {
                        maxWidth: "240px",
                        fontSize: "16px",
                        padding: "10px 0",
                      },
                      "@media screen and (max-height: 400px)": {
                        maxWidth: "200px",
                        fontSize: "15px",
                        padding: "8px 0",
                      },
                      "&:hover": {
                        backgroundColor:
                          gameState === "init" ? "#dcdde1" : "#f5f6fa",
                        transform:
                          gameState === "init" ? "translateY(-2px)" : "none",
                        boxShadow:
                          gameState === "init"
                            ? "0 6px 8px rgba(0, 0, 0, 0.15)"
                            : "0 4px 6px rgba(0, 0, 0, 0.1)",
                      },
                      "&:active": {
                        transform:
                          gameState === "init" ? "translateY(1px)" : "none",
                        boxShadow:
                          gameState === "init"
                            ? "0 2px 4px rgba(0, 0, 0, 0.1)"
                            : "0 4px 6px rgba(0, 0, 0, 0.1)",
                      },
                      "&:focus": { outline: "none" },
                      "&:not(:focus-visible)": {
                        backgroundColor: "#f5f6fa !important",
                        transform: "none !important",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1) !important",
                      },
                    }}
                    key={`start-button-${
                      gameState === "init" ? "ready" : "disabled"
                    }-${Date.now()}`}
                  >
                    START
                  </Box>
                  <Box
                    component="img"
                    src={logo}
                    alt="Grand Prix Logo"
                    sx={{
                      width: "180px",
                      maxWidth: "50%",
                      height: "auto",
                      marginTop: "25px",
                      filter: "brightness(1.2)",
                      "@media screen and (max-width: 768px)": {
                        width: "160px",
                        marginTop: "20px",
                      },
                      "@media screen and (max-width: 480px)": {
                        width: "140px",
                        marginTop: "18px",
                      },
                      "@media screen and (max-height: 600px)": {
                        width: "150px",
                        marginTop: "18px",
                      },
                      "@media screen and (max-height: 500px)": {
                        width: "130px",
                        marginTop: "14px",
                      },
                      "@media screen and (max-height: 400px)": {
                        width: "110px",
                        marginTop: "10px",
                      },
                      "@media screen and (max-height: 450px) and (orientation: landscape)":
                        { width: "120px", marginTop: "12px" },
                      "@media screen and (max-width: 320px), (max-height: 350px)":
                        { width: "100px", marginTop: "8px" },
                    }}
                  />
                </>
              )}
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

        {showMissionBanner && (
          <MissionBanner
            visible={true}
            onAnimationComplete={handleMissionBannerComplete}
          />
        )}

        <video
          ref={section1VideoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 1,
            opacity: getVideoVisibility("section1") ? 1 : 0,
            display: getVideoVisibility("section1") ? "block" : "none",
            transition: "opacity 0.5s ease-in-out",
            backgroundColor: "black",
          }}
          playsInline
          preload="auto"
          key={`video1-${cacheBustTimestamp.current}`}
        >
          <source
            src={`${Section1Video}?t=${cacheBustTimestamp.current}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {(gameState === "section1" ||
          gameState === "waitingForDelay" ||
          gameState === "section2" ||
          gameState === "waitingForTap") && (
          <TapButton
            onClick={buttonActive ? handleTapClick : undefined}
            active={buttonActive}
          />
        )}

        <video
          ref={section2VideoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            objectPosition: "center center",
            maxWidth: "none", // Remove max-width constraint
            maxHeight: "none", // Remove max-height constraint
            zIndex: 1,
            opacity: getVideoVisibility("section2") ? 1 : 0,
            display: getVideoVisibility("section2") ? "block" : "none",
            transition: "opacity 0.5s ease-in-out",
          }}
          playsInline
          preload="auto"
          key={`video2-${cacheBustTimestamp.current}`}
        >
          <source
            src={`${Section2Video}?t=${cacheBustTimestamp.current}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <video
          ref={section3VideoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            objectPosition: "center center",
            maxWidth: "none", // Remove max-width constraint
            maxHeight: "none", // Remove max-height constraint
            zIndex: 1,
            opacity: getVideoVisibility("section3") ? 1 : 0,
            display: getVideoVisibility("section3") ? "block" : "none",
            transition: "opacity 0.5s ease-in-out",
          }}
          playsInline
          preload="auto"
          key={`video3-${cacheBustTimestamp.current}`}
        >
          <source
            src={`${Section3Video}?t=${cacheBustTimestamp.current}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <audio
          ref={audioRef}
          preload="auto"
          key={`audio-${cacheBustTimestamp.current}`}
        >
          <source
            src={`${Section3Sound}?t=${cacheBustTimestamp.current}`}
            type="audio/mpeg"
          />
          Your browser does not support the audio element.
        </audio>
      </Box>

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: "white",
          padding: 0,
          borderRadius: "0 0 24px 24px",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "65px",
          fontFamily: "'MyCustomFont', sans-serif",
          transition: "all 1000ms ease-in-out",
        }}
      >
        <Box
          component="h1"
          sx={{
            color: "black",
            fontSize: "1.6rem",
            margin: 0,
            marginBottom: "6px",
            letterSpacing: "1px",
            fontWeight: "bold",
            fontFamily: "'MyCustomFont', sans-serif",
            "& .highlight-red": { color: "#E00400", fontWeight: 900 },
          }}
        >
          <span className="highlight-red">R</span>EACTION TIME{" "}
          <span className="highlight-red">T</span>EST
        </Box>
        <Box
          component="h2"
          sx={{
            color: "black",
            fontSize: "12px",
            margin: 0,
            marginBottom: "5px",
            fontWeight: "bold",
            fontFamily: "'Hiragino Kaku Gothic Pro Bold'",
          }}
        >
          <span className=" ">リアクションタイムテスト</span>
        </Box>
      </Box>

      <Modal
        open={openModal}
        reactionTime={reactionTime}
        onClose={() => setOpenModal(false)}
        onRetry={handleRestartGame}
        onMap={() => {}}
      />
      <BottomNav />
    </Box>
  );
};

export default RedLight;
