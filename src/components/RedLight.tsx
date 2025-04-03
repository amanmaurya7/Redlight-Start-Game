"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Box, CircularProgress } from "@mui/material";
import Modal from "./Modal";
// import BottomNav from "./BottomNav";
import Svg7 from "../images/7.svg";
import logo from "../images/grandprix.svg";

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
      "&:focus": { outline: "none" },
      "@media screen and (max-width: 320px)": { width: "100px", bottom: "15%" },
      "@media screen and (max-height: 500px)": {
        width: "100px",
        bottom: "12%",
      },
      "@media screen and (max-height: 400px)": { width: "80px", bottom: "10%" },
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

const preloadBackgroundImage = () => {
  const timestamp = new Date().getTime();
  const img = new Image();
  img.src = `${Svg7}?t=${timestamp}`;
  return img;
};

const japaneseFontStyle = { fontFamily: "JapaneseFont" };

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
        setTimeout(() => onAnimationComplete(), 500);
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
        opacity,
        transition: "opacity 0.5s ease",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        display: opacity === 0 ? "none" : "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "'MyCustomFont', sans-serif",
        "@media screen and (max-height: 500px)": { padding: "12px 0" },
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
          "@media screen and (max-height: 500px)": { fontSize: "16px" },
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
  const [videoReady, setVideoReady] = useState<{ [key: string]: boolean }>({
    section1: false,
    section2: false,
    section3: false,
  });
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showMissionBanner, setShowMissionBanner] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const section1VideoRef = useRef<HTMLVideoElement>(null);
  const section2VideoRef = useRef<HTMLVideoElement>(null);
  const section3VideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const randomDelayTimeoutRef = useRef<number | null>(null);
  const resultTimeoutRef = useRef<number | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const componentMountedRef = useRef(true);
  const cacheBustTimestamp = useRef(Date.now());

  // Preload all videos on mount
  useEffect(() => {
    componentMountedRef.current = true;
    backgroundImageRef.current = preloadBackgroundImage();

    const preloadVideos = async () => {
      const videos = [Section1Video, Section2Video, Section3Video];
      const refs = [section1VideoRef, section2VideoRef, section3VideoRef];
      const promises = videos.map((src, index) => {
        return new Promise<void>((resolve, reject) => {
          const video = refs[index].current;
          if (video) {
            video.src = `${src}?t=${cacheBustTimestamp.current}`;
            video.preload = "auto";
            video.onloadeddata = () => {
              setVideoReady((prev) => ({
                ...prev,
                [`section${index + 1}`]: true,
              }));
              resolve();
            };
            video.onerror = () => {
              setVideoError(`Failed to load video ${index + 1}.`);
              reject();
            };
            video.load();
          }
        });
      });
      await Promise.all(promises);
    };

    preloadVideos();

    return () => {
      componentMountedRef.current = false;
      if (randomDelayTimeoutRef.current)
        clearTimeout(randomDelayTimeoutRef.current);
      if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
    };
  }, []);

  // Section 1 Logic
  useEffect(() => {
    if (
      gameState === "section1" &&
      section1VideoRef.current &&
      videoReady.section1
    ) {
      section1VideoRef.current.currentTime = 0;
      section1VideoRef.current
        .play()
        .then(() => {
          // Preload Section 2
          if (section2VideoRef.current) {
            section2VideoRef.current.currentTime = 0;
            section2VideoRef.current.load();
          }
        })
        .catch(() => {
          setVideoError("Error playing Section 1 video.");
          setGameState("init");
        });

      const handleEnded = () => {
        // Set the video to the last frame to prevent black screen
        if (section1VideoRef.current) {
          section1VideoRef.current.currentTime =
            section1VideoRef.current.duration - 0.01; // Go to just before the end
          section1VideoRef.current.pause();
        }
        setGameState("waitingForDelay");
        const randomDelay = 200 + Math.random() * 2800;
        randomDelayTimeoutRef.current = window.setTimeout(() => {
          setGameState("section2");
        }, randomDelay);
      };
      const videoElement = section1VideoRef.current;
      videoElement?.addEventListener("ended", handleEnded);
      return () => videoElement?.removeEventListener("ended", handleEnded);
    }
  }, [gameState, videoReady.section1]);

  // Section 2 Logic
  useEffect(() => {
    if (
      gameState === "section2" &&
      section2VideoRef.current &&
      videoReady.section2
    ) {
      section2VideoRef.current.currentTime = 0;
      setButtonActive(true);
      setReactionStartTime(Date.now());
      section2VideoRef.current
        .play()
        .then(() => {
          // Preload Section 3
          if (section3VideoRef.current) {
            section3VideoRef.current.currentTime = 0;
            section3VideoRef.current.load();
          }
        })
        .catch(() => {
          setVideoError("Error playing Section 2 video.");
          setGameState("init");
        });

      const handleEnded = () => setGameState("waitingForTap");
      section2VideoRef.current.addEventListener("ended", handleEnded);
      return () =>
        section2VideoRef.current?.removeEventListener("ended", handleEnded);
    }
  }, [gameState, videoReady.section2]);

  // Section 3 Logic
  useEffect(() => {
    if (
      gameState === "section3" &&
      section3VideoRef.current &&
      videoReady.section3
    ) {
      section3VideoRef.current.currentTime = 0;
      section3VideoRef.current.play();
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      resultTimeoutRef.current = window.setTimeout(() => {
        section3VideoRef.current?.pause();
        setGameState("results");
        setOpenModal(true);
      }, 1500);
      return () => {
        if (resultTimeoutRef.current) clearTimeout(resultTimeoutRef.current);
      };
    }
  }, [gameState, videoReady.section3]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (
        section1VideoRef.current &&
        section1VideoRef.current.currentTime >=
          section1VideoRef.current.duration - 1
      ) {
        // Preload the next video
        if (section2VideoRef.current) {
          section2VideoRef.current.preload = "auto";
          section2VideoRef.current.load();
        }
      }
    };

    const videoElement = section1VideoRef.current;
    if (videoElement) {
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  const startGame = () => {
    if (!videoReady.section1 || !videoReady.section2 || !videoReady.section3) {
      setIsVideoLoading(true);
      return;
    }
    setIsVideoLoading(false);
    setGameState("missionIntro");
    setTimeout(() => setShowMissionBanner(true), 100);
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
      setVideoReady({ section1: false, section2: false, section3: false });
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
        paddingBottom: "65px",
        margin: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000", // Fallback background to mask gaps
        fontFamily: "'MyCustomFont', sans-serif",
        touchAction: "none",
      }}
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
          zIndex: 1,
          backgroundColor: "#000", // Ensure no gaps
        }}
      >
        {(gameState === "init" ||
          gameState === "loading" ||
          isVideoLoading) && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
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
                  sm: "scale(1)",
                  md: "scale(1)",
                },
              }}
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
                paddingBottom: { xs: "10px", sm: "10px", md: "10px" },
                marginTop: { xs: "0px", sm: "100px", md: "120px" },
              }}
            >
              {isVideoLoading ? (
                <>
                  <CircularProgress
                    sx={{
                      color: "#E00400",
                      mb: 1,
                      "& .MuiCircularProgress-circle": { strokeWidth: 5 },
                    }}
                    size={50}
                  />
                  <Box sx={{ color: "white", fontSize: "16px", mt: 1 }}>
                    Loading Game...
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    component="button"
                    ref={startButtonRef}
                    onClick={startGame}
                    disabled={gameState !== "init" || !videoReady.section1}
                    sx={{
                      width: "80%",
                      maxWidth: "300px",
                      padding: "12px 0",
                      borderRadius: "28px",
                      backgroundColor: "#f5f6fa",
                      color: "#2f3640",
                      border: "none",
                      fontSize: "20px",
                      fontWeight: "bold",
                      cursor:
                        gameState === "init" && videoReady.section1
                          ? "pointer"
                          : "default",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        backgroundColor:
                          gameState === "init" && videoReady.section1
                            ? "#dcdde1"
                            : "#f5f6fa",
                        transform:
                          gameState === "init" && videoReady.section1
                            ? "translateY(-2px)"
                            : "none",
                      },
                      "&:active": {
                        transform:
                          gameState === "init" && videoReady.section1
                            ? "translateY(1px)"
                            : "none",
                      },
                      "&:focus": { outline: "none" },
                    }}
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
            display: getVideoVisibility("section1") ? "block" : "none",
            backgroundColor: "#000", // Prevent black flash
          }}
          playsInline
          preload="auto"
        />

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
            objectPosition: "center",
            zIndex: 1,
            display: getVideoVisibility("section2") ? "block" : "none",
            backgroundColor: "#000",
          }}
          playsInline
          preload="auto"
        />

        <video
          ref={section3VideoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 1,
            display: getVideoVisibility("section3") ? "block" : "none",
            backgroundColor: "#000",
          }}
          playsInline
          preload="auto"
        />

        <audio ref={audioRef} preload="auto" />
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
          height: "65px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
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
          リアクションタイムテスト
        </Box>
      </Box>

      <Modal
        open={openModal}
        reactionTime={reactionTime}
        onClose={() => setOpenModal(false)}
        onRetry={handleRestartGame}
        onMap={() => {}}
      />
      {/* Uncomment if you want to include BottomNav */}
      {/* <BottomNav /> */}
    </Box>
  );
};

export default RedLight;
