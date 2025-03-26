"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import {
  Box,
  Button,
  Typography,
  Modal as MuiModal,
  useMediaQuery,
  useTheme,
  IconButton,
  CircularProgress,
} from "@mui/material"
import { Share2, Download } from "lucide-react"
import CloseIcon from "@mui/icons-material/Close"
import html2canvas from "html2canvas"
import liff from "@line/liff" // Import LIFF SDK
import backgroundImage from "../images/7.svg"
import snsBgImage from "../images/SNS-bg.png"

const fontStyle = {
  fontFamily: "'MyCustomFont', sans-serif",
}

interface ModalProps {
  open: boolean
  reactionTime: number | null
  onClose: () => void
  onRetry: () => void
  onMap: () => void
}

const Modal: React.FC<ModalProps> = ({ open, reactionTime, onClose, onRetry }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isVerySmallScreen = useMediaQuery('(max-height: 600px)')
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [scoreImageUrl, setScoreImageUrl] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [shouldRenderScoreElement, setShouldRenderScoreElement] = useState(false)
  const [isInLiff, setIsInLiff] = useState(false)
  const scoreRef = useRef<HTMLDivElement>(null)

  // Initialize LIFF and detect environment
  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId: "2006841295-jw19DpzR" }) // Replace with your LIFF ID
        setIsInLiff(liff.isInClient())
      } catch (error) {
        console.error("LIFF initialization failed:", error)
        setIsInLiff(false)
      }
    }
    initializeLiff()
  }, [])

  useEffect(() => {
    if (!open) {
      setScoreImageUrl(null)
      setShouldRenderScoreElement(false)
    }
  }, [open])

  const prepareShareImage = useCallback(() => {
    setShouldRenderScoreElement(true)
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 100)
    })
  }, [])

  const generateScoreCard = useCallback(async () => {
    try {
      if (!scoreRef.current) return null
      setIsGeneratingImage(true)
      const scoreElement = scoreRef.current
      const originalTransform = scoreElement.style.transform
      scoreElement.style.opacity = "1"
      scoreElement.style.transform = "none"

      const options = {
        scale: window.devicePixelRatio * 1.5,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        removeContainer: true,
        windowWidth: scoreElement.offsetWidth,
        windowHeight: scoreElement.offsetHeight,
      }

      const canvas = await html2canvas(scoreElement, options)
      const imageUrl = canvas.toDataURL("image/png", 0.9)
      setScoreImageUrl(imageUrl)
      scoreElement.style.opacity = "0"
      scoreElement.style.transform = originalTransform
      setIsGeneratingImage(false)
      return imageUrl
    } catch (error) {
      console.error("Failed to generate score card:", error)
      setIsGeneratingImage(false)
      return null
    }
  }, [])

  const handleShareClick = async () => {
    setIsGeneratingImage(true)
    if (scoreImageUrl) {
      setShareModalOpen(true)
      setIsGeneratingImage(false)
      return
    }
    try {
      await prepareShareImage()
      const imageUrl = await generateScoreCard()
      if (imageUrl) {
        setShareModalOpen(true)
      }
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const shareScore = async () => {
    if (!scoreImageUrl) return

    const shareText = `#リアクションタイムテスト に挑戦！
結果はこちら！あなたの反応速度はどれくらい？🏎️💨
${reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}
"F1 Japanese GP" LINE公式アカウントを友だち追加して、今すぐチャレンジ！👇
https://liff.line.me/2006572406-D3OkWx32?tcode=rCXml0000013431
#F1jp #F1日本グランプリ`

    const shortTitle = `私のリアクションタイム: ${reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}`

    try {
      // Copy text to clipboard as a universal fallback
      await navigator.clipboard.writeText(shareText)
      console.log("Share text copied to clipboard")

      if (isInLiff && liff.isApiAvailable("shareTargetPicker")) {
        // LIFF environment: Share image directly
        await liff.shareTargetPicker([
          {
            type: "image",
            originalContentUrl: scoreImageUrl,
            previewImageUrl: scoreImageUrl,
          },
        ])
        console.log("Shared image directly via LIFF shareTargetPicker")
        setShareModalOpen(false)
      } else {
        // Non-LIFF environment: Use Web Share API
        const isWebShareSupported = typeof navigator.share === "function"
        const isAndroid = /Android/.test(navigator.userAgent)

        if (isWebShareSupported) {
          const res = await fetch(scoreImageUrl)
          const blob = await res.blob()
          const file = new File([blob], "reaction-time-score.png", { type: "image/png" })

          const shareData = {
            title: shortTitle,
            text: shareText,
            files: [file],
          }

          if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData)
            console.log("Shared successfully with image and text via Web Share API")
           
            setShareModalOpen(false)
            return
          }
        }

        // Fallback for non-Web Share API or Android LINE deep link
        if (isAndroid) {
          const encodedText = encodeURIComponent(shareText)
          const lineUrl = `line://msg/text/${encodedText}`
          window.location.href = lineUrl
          setTimeout(() => {
            if (document.hasFocus()) {
              downloadImage()
            }
            setShareModalOpen(false)
          }, 1500)
          return
        }

        downloadImage()
        alert("画像をダウンロードしました。シェアするテキストはクリップボードにコピーされています。")
        setShareModalOpen(false)
      }
    } catch (error) {
      console.error("Error in sharing process:", error)
      downloadImage()
      setShareModalOpen(false)
    }
  }

  const downloadImage = async () => {
    if (!scoreImageUrl) return
    try {
      const downloadLink = document.createElement("a")
      downloadLink.href = scoreImageUrl
      downloadLink.download = "reaction-time-score.png"
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (downloadError) {
      console.error("Download failed:", downloadError)
      alert("画像のダウンロードに失敗しました。")
    }
  }

  // Add a new function to handle navigation away from result screen
  const handleCircuitJourneyClick = () => {
    // Custom event to signal audio should be stopped
    const stopAudioEvent = new CustomEvent('stopGameAudio');
    document.dispatchEvent(stopAudioEvent);
    
    // Navigate to the circuit journey page
    window.location.href = "https://new-jp-map.vercel.app/";
  };

  // Rest of the component (UI) remains unchanged
  return (
    <>
      <MuiModal
        open={open}
        onClose={onClose}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "calc(100% - 60px)",
          top: "60px",
          position: "absolute",
          backgroundColor: "transparent",
          zIndex: 1,
          ...fontStyle,
          touchAction: "none",
          userSelect: "none",
          overflow: "auto",
          pointerEvents: "auto", // Ensure pointer events are enabled for the modal itself
        }}
        BackdropProps={{
          style: {
            backgroundColor: "transparent",
            position: "absolute",
            top: "60px",
            height: "calc(100% - 60px)",
            touchAction: "none",
            pointerEvents: "none", // Disable pointer events on backdrop to prevent dragging
          },
        }}
        disableScrollLock={false}
        hideBackdrop={true}
        disableAutoFocus
        disableEnforceFocus
        disablePortal
        disableRestoreFocus
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            bgcolor: "transparent",
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            overflow: "hidden", // Change from auto to hidden to prevent scrolling
            zIndex: 2,
            pb: isVerySmallScreen ? "10px" : "60px",
            touchAction: "none", // Disable all touch actions
            userSelect: "none",
            pointerEvents: "auto", // Enable pointer events for content
            ...fontStyle,
          }}
          onTouchMove={(e) => {
            e.preventDefault(); // Prevent touch movement
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation(); // Prevent mousedown from bubbling
          }}
        >
          <Box
            sx={{
              width: isMobile ? "100%" : "90%",
              maxWidth: "400px",
              bgcolor: "rgba(0, 0, 0, 0.7)",
              borderRadius: 0,
              p: isVerySmallScreen ? 2 : 3,
              textAlign: "center",
              height: "auto",
              minHeight: isVerySmallScreen ? "80%" : "100%",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              my: isVerySmallScreen ? 1 : 2,
              zIndex: 3,
              overflow: "auto",
              touchAction: "none", // Disable touch actions here too
              ...fontStyle,
            }}
            onTouchMove={(e) => {
              e.preventDefault(); // Prevent touch movement
              e.stopPropagation();
            }}
          >
            {shouldRenderScoreElement && (
              <Box
                ref={scoreRef}
                sx={{
                  width: 320,
                  height: 320,
                  backgroundImage: `url(${snsBgImage})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 4,
                  position: "fixed",
                  left: "-9999px",
                  top: "-9999px",
                  pointerEvents: "none",
                  opacity: 0,
                  zIndex: -999,
                  ...fontStyle,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: "black",
                    marginTop: 20,
                    textShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: { xs: 24, sm: 24, md: 36 },
                    letterSpacing: 1,
                    ...fontStyle,
                  }}
                >
                  REACTION TIME TEST
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ff6699",
                    marginTop: 3,
                    marginBottom: 1,
                    textAlign: "center",
                    fontWeight: "500",
                    fontSize: { xs: 25, sm: 25, md: 28 },
                    ...fontStyle,
                  }}
                >
                  TIME
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 84, sm: 90, md: 100 },
                    color: "#ff6699",
                    textShadow: "0 0 10px #ff6699",
                    textAlign: "center",
                    lineHeight: 1,
                    ...fontStyle,
                  }}
                >
                  {reactionTime !== null ? (
                    <>
                      {(reactionTime / 1000).toFixed(3)}
                      <Typography
                        component="span"
                        sx={{
                          fontSize: "60%",
                          verticalAlign: "baseline",
                          fontFamily: "'MyCustomFont', sans-serif",
                        }}
                      >
                        s
                      </Typography>
                    </>
                  ) : (
                    "--"
                  )}
                </Typography>
              </Box>
            )}

            <Box sx={{ width: "100%", ...fontStyle }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "white",
                  fontSize: isVerySmallScreen ? "14px" : "16px",
                  marginTop: isVerySmallScreen ? "10px" : "100px",
                  marginBottom: isVerySmallScreen ? "20px" : "70px",
                  mb: 0.5,
                  ...fontStyle,
                }}
              >
                ミッションクリア
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  letterSpacing: 1,
                  color: "white",
                  marginBottom: isVerySmallScreen ? "20px" : "60px",
                  fontSize: isVerySmallScreen ? "26px" : "33px",
                  ...fontStyle,
                }}
              >
                MISSION CLEAR
              </Typography>
              <Typography
                sx={{
                  fontSize: isVerySmallScreen ? 18 : 20,
                  fontWeight: "500",
                  color: "#ff6699",
                  marginBottom: isVerySmallScreen ? "15px" : "50px",
                  mb: 0.5,
                  ...fontStyle,
                }}
              >
                SCORE
              </Typography>
              <Typography
                sx={{
                  fontSize: isVerySmallScreen ? 60 : 80,
                  color: "#ff6699",
                  marginTop: isVerySmallScreen ? "10px" : "25px",
                  marginBottom: isVerySmallScreen ? "40px" : "70px",
                  textShadow: "0 0 5px #ff6699",
                  mb: isVerySmallScreen ? 1 : 3,
                  lineHeight: 1,
                  animation: "subtleGlow 3s infinite",
                  ...fontStyle,
                }}
              >
                {reactionTime !== null ? (
                  <>
                    {(reactionTime / 1000).toFixed(3)}
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "50%",
                        verticalAlign: "super",
                        fontFamily: "'MyCustomFont', sans-serif",
                        position: "relative",
                        bottom: "-0.6em",
                      }}
                    >
                      s
                    </Typography>
                  </>
                ) : (
                  "--"
                )}
              </Typography>
            </Box>

            <Box sx={{ 
              width: "100%", 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              mt: isVerySmallScreen ? 1 : "auto",
              mb: isVerySmallScreen ? 1 : 0
            }}>
              <Button
                fullWidth
                sx={{
                  mb: 1.5,
                  bgcolor: "#3D4658",
                  color: "white",
                  borderRadius: "24px",
                  padding: isVerySmallScreen ? "8px" : "12px",
                  marginTop: isVerySmallScreen ? "10px" : "30px",
                  marginBottom: isVerySmallScreen ? "10px" : "30px",
                  fontSize: isVerySmallScreen ? "14px" : "16px",
                  fontWeight: "normal",
                  textTransform: "none",
                  width: isVerySmallScreen ? "80%" : "60%",
                  "&:hover": { bgcolor: "rgba(120, 120, 120, 0.7)" },
                  ...fontStyle,
                  position: "relative",
                  "& > *": {
                    transition: "opacity 0.2s ease-in-out",
                  },
                }}
                onClick={handleShareClick}
                disabled={isGeneratingImage}
              >
                {isGeneratingImage ? (
                  <>
                    <CircularProgress
                      size={16}
                      sx={{
                        color: "white",
                        position: "absolute",
                        left: "20%",
                      }}
                    />
                    生成中...
                  </>
                ) : (
                  "SNSでシェアする"
                )}
              </Button>

              <Button
                fullWidth
                sx={{
                  mb: 1.5,
                  bgcolor: "rgba(100, 100, 100, 0.7)",
                  color: "white",
                  borderRadius: "24px",
                  marginBottom: isVerySmallScreen ? "10px" : "30px",
                  padding: isVerySmallScreen ? "8px" : "12px",
                  fontSize: isVerySmallScreen ? "14px" : "16px",
                  fontWeight: "normal",
                  textTransform: "none",
                  width: isVerySmallScreen ? "80%" : "60%",
                  "&:hover": { bgcolor: "rgba(120, 120, 120, 0.7)" },
                  ...fontStyle,
                }}
                onClick={onRetry}
              >
                もう一度遊ぶ
              </Button>

              <button
                onClick={handleCircuitJourneyClick}
                style={{
                  marginBottom: isVerySmallScreen ? "10px" : "150px",
                  padding: isVerySmallScreen ? "8px" : "12px",
                  width: isVerySmallScreen ? "80%" : "90%",
                  borderRadius: "24px",
                  backgroundColor: "white",
                  color: "black",
                  fontSize: isVerySmallScreen ? "14px" : "16px",
                  textAlign: "center",
                  ...fontStyle,
                }}
              >
                <strong className="font-normal">
                  CI<span style={{ color: "#ff0000" }}>R</span>CUIT JOURN
                  <span style={{ color: "#ff0000" }}>E</span>Y
                </strong>
              </button>
            </Box>
          </Box>
        </Box>
      </MuiModal>

      <MuiModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? 2 : 0,
          zIndex: 1500,
          ...fontStyle,
          touchAction: "none",
          userSelect: "none",
          pointerEvents: "auto", // Enable pointer events for this modal
        }}
        disableScrollLock={false}
        BackdropProps={{
          style: {
            touchAction: "none",
            pointerEvents: "auto", // Keep backdrop interactive but prevent actions
          },
        }}
        disableRestoreFocus
      >
        <Box
          sx={{
            width: 350,
            maxWidth: "90vw",
            bgcolor: "white",
            borderRadius: 3,
            p: 3,
            textAlign: "center",
            boxShadow: 24,
            position: "relative",
            touchAction: "none",
            userSelect: "none",
            ...fontStyle,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            onClick={() => setShareModalOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#666",
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ mb: 2, ...fontStyle }}>
            スコアをシェアする
          </Typography>

          {scoreImageUrl && (
            <Box
              component="img"
              src={scoreImageUrl}
              alt="Your score"
              sx={{
                width: "100%",
                maxWidth: 300,
                borderRadius: 2,
                mb: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          )}

          <Box sx={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                p: 1,
              }}
              onClick={shareScore}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "#333",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Share2 size={24} color="white" />
              </Box>
              <Typography variant="caption" sx={{ ...fontStyle }}>
                Share
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                p: 1,
              }}
              onClick={downloadImage}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "#333",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Download size={24} color="white" />
              </Box>
              <Typography variant="caption" sx={{ ...fontStyle }}>
                Save
              </Typography>
            </Box>
          </Box>
        </Box>
      </MuiModal>
    </>
  )
}

export default Modal