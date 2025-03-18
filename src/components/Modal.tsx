"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Box, Button, Typography, Modal as MuiModal, useMediaQuery, useTheme, IconButton, CircularProgress } from "@mui/material"
import { Share2, Download } from "lucide-react"
import CloseIcon from "@mui/icons-material/Close"
import html2canvas from "html2canvas"
import backgroundImage from "../images/7.svg" // Import SVG directly
import snsBgImage from "../images/SNS-bg.png" // Replace with actual path to your SNS-bg image

// Define a consistent font styling to apply throughout the component
const fontStyle = {
  fontFamily: "'MyCustomFont', sans-serif"
};

interface ModalProps {
  open: boolean
  reactionTime: number | null
  onClose: () => void
  onRetry: () => void
  onMap: () => void
}

const Modal: React.FC<ModalProps> = ({ open, reactionTime, onClose, onRetry, onMap }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [scoreImageUrl, setScoreImageUrl] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const scoreRef = useRef<HTMLDivElement>(null)

  // Generate score card when the modal opens or reaction time changes
  useEffect(() => {
    if (open && reactionTime !== null) {
      // Use a small timeout to let the component render fully first
      const timer = setTimeout(() => {
        generateScoreCard();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [open, reactionTime]);

  const generateScoreCard = useCallback(async () => {
    try {
      if (scoreRef.current) {
        setIsGeneratingImage(true);
        
        // Make the score card element visible before capturing
        const scoreElement = scoreRef.current;
        const originalVisibility = scoreElement.style.visibility;
        const originalPosition = scoreElement.style.position;
        const originalZIndex = scoreElement.style.zIndex;
        
        // Show the element while capturing
        scoreElement.style.visibility = 'visible';
        scoreElement.style.position = 'static';
        scoreElement.style.zIndex = '100';
        
        // Optimized html2canvas options
        const options = {
          scale: window.devicePixelRatio * 1.5, // Better handling of device pixel ratio
          backgroundColor: null,
          logging: false, // Disable logging for performance
          useCORS: true,
          allowTaint: true,
          imageTimeout: 0, // No timeout
          removeContainer: true, // Cleanup after rendering
        };
        
        const canvas = await html2canvas(scoreElement, options);
        const imageUrl = canvas.toDataURL("image/png", 0.9); // Slightly compressed for better performance
        setScoreImageUrl(imageUrl);
        
        // Reset element properties
        scoreElement.style.visibility = originalVisibility;
        scoreElement.style.position = originalPosition;
        scoreElement.style.zIndex = originalZIndex;
        
        setIsGeneratingImage(false);
        return imageUrl;
      }
      setIsGeneratingImage(false);
      return null;
    } catch (error) {
      console.error("Failed to generate score card:", error);
      setIsGeneratingImage(false);
      return null;
    }
  }, []);

  const handleShareClick = () => {
    // If image is already generated, open modal right away
    if (scoreImageUrl) {
      setShareModalOpen(true);
    } else {
      // Otherwise generate the image first
      setIsGeneratingImage(true);
      generateScoreCard().then((imageUrl) => {
        if (imageUrl) {
          setShareModalOpen(true);
        }
        setIsGeneratingImage(false);
      });
    }
  }

  const shareScore = async () => {
    if (!scoreImageUrl) return

    const shareText = `My reaction time is ${reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}!`

    try {
      if (navigator.share) {
        const res = await fetch(scoreImageUrl)
        const blob = await res.blob()
        const file = new File([blob], "reaction-time-score.png", { type: "image/png" })

        await navigator.share({
          title: "My Reaction Time Result",
          text: shareText,
          files: [file],
        })
        setShareModalOpen(false)
      } else {
        downloadImage()
      }
    } catch (error) {
      console.error("Error sharing:", error)
      downloadImage()
    }
  }

  const downloadImage = () => {
    if (!scoreImageUrl) return

    const downloadLink = document.createElement("a")
    downloadLink.href = scoreImageUrl
    downloadLink.download = "reaction-time-score.png"
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

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
          height: "calc(100% - 60px)", // Only account for header height, touch the bottom nav
          top: "60px", // Space for header
          position: "absolute",
          backgroundColor: "transparent",
          zIndex: 1, // Very low z-index to stay behind header/footer
          ...fontStyle,
        }}
        BackdropProps={{
          style: { 
            backgroundColor: "transparent",
            position: "absolute",
            top: "60px",
            height: "calc(100% - 60px)", // Match modal height
          }
        }}
        hideBackdrop={true} // Hide default backdrop
        disableAutoFocus
        disableEnforceFocus
        disablePortal // Try rendering in place instead of in a portal
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
            overflow: "auto",
            zIndex: 2, // Keep this still low
            // Add padding at bottom to account for footer nav overlap
            pb: "60px", 
            ...fontStyle,
          }}
        >
          <Box
            sx={{
              width: isMobile ? "100%" : "90%",
              maxWidth: "400px",
              bgcolor: "rgba(0, 0, 0, 0.7)",
              borderRadius: 0,
              p: 3,
              textAlign: "center",
              height: "100%",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              my: 2,
              zIndex: 3, // Higher than background
              ...fontStyle,
            }}
          >
            {/* Score card with SNS background - Updated with full width/height and styling */}
            <Box 
              ref={scoreRef} 
              sx={{ 
                width: "100%",
                height: "100%",
                backgroundImage: `url(${snsBgImage})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 4,
                // Hide this element but keep it in DOM for html2canvas
                position: "fixed",
                left: "-9999px",
                top: 0,
                visibility: "hidden",
                zIndex: -1,
                aspectRatio: "1/1", // Keep square aspect ratio
                ...fontStyle,
              }}
            >
              {/* REDLIGHT Game text - Updated with pink color */}
              <Typography
                variant="h4"
                sx={{
                  color: "black", // Changed to match score color
                  marginTop:20,
                  textShadow: "0 0 10pxrgb(0, 0, 0)", // Added glow like score
                  marginBottom: 2,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: {xs: 34, sm: 32, md: 36}, // Responsive size
                  letterSpacing: 1,
                  ...fontStyle,
                }}
              >
                REDLIGHT GAME
              </Typography>
              
              {/* TIME text - Updated with pink color */}
              <Typography
                variant="h6"
                sx={{
                  color: "#ff6699", // Changed to match score color
                  marginBottom: 2,
                  textAlign: "center",
                  fontWeight: "500",
                  fontSize: {xs: 25, sm: 25, md: 28}, // Responsive size
                  ...fontStyle,
                }}
              >
                TIME
              </Typography>
              
              {/* Score display - Kept the same pink color, enhanced styling */}
              <Typography
                sx={{
                  fontSize: {xs: 84, sm: 90, md: 100}, // Larger responsive size
                  color: "#ff6699",
                  textShadow: "0 0 10px #ff6699",
                  textAlign: "center",
                  lineHeight: 1,
                  ...fontStyle,
                }}
              >
                {reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}
              </Typography>
            </Box>
            
            {/* Regular visible score display in the modal (not for sharing) */}
            <Box sx={{ width: "100%", ...fontStyle }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "white",
                  fontSize: "16px",
                  marginTop: "40px",
                  marginBottom: "70px",
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
                  marginBottom: "60px",
                  fontSize: "33px", // Larger font size to match image
                  ...fontStyle,
                }}
              >
                MISSION CLEAR
              </Typography>

              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: "500",
                  color: "#ff6699",
                  marginBottom: "50px",
                  mb: 0.5,
                  ...fontStyle,
                }}
              >
                SCORE
              </Typography>

              <Typography
                sx={{
                  fontSize: isMobile ? 80 : 80, // Larger font size to match image
                  color: "#ff6699",
                  marginTop: "25px",
                  marginBottom: "150px",
                  textShadow: "0 0 5px #ff6699", // Reduced shadow intensity
                  mb: 3,
                  lineHeight: 1,
                  animation: "subtleGlow 3s infinite", // Using a custom animation name
                  ...fontStyle,
                }}
              >
                {reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}
              </Typography>
            </Box>

            {/* Share on SNS Button - Updated to match image and show loading indicator */}
            <Button
              fullWidth
              sx={{
                mb: 1.5,
                bgcolor: "#3D4658",
                color: "white",
                borderRadius: "24px",
                padding: "12px",
                marginTop: "50px",
                marginBottom: "30px",
                fontSize: "16px",
                fontWeight: "normal",
                textTransform: "none",
                width: "60%",
                "&:hover": { bgcolor: "rgba(120, 120, 120, 0.7)" },
                ...fontStyle,
                position: "relative", // For positioning the loading spinner
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
                  生成中... {/* "Generating..." in Japanese */}
                </>
              ) : (
                "SNSでシェアする"
              )}
            </Button>

            {/* Play Again Button - Updated to match image */}
            <Button
              fullWidth
              sx={{
                mb: 1.5,
                bgcolor: "rgba(100, 100, 100, 0.7)", // Semi-transparent gray to match image
                color: "white",
                borderRadius: "24px",
                marginBottom: "30px",
                padding: "12px",
                fontSize: "16px",
                fontWeight: "normal",
                textTransform: "none",
                width: "60%",
                "&:hover": { bgcolor: "rgba(120, 120, 120, 0.7)" },
                ...fontStyle,
              }}
              onClick={onRetry}
            >
              もう一度遊ぶ
            </Button>

            {/* Back to Map Button - Updated to match image */}
            <Button
              fullWidth
              sx={{
                bgcolor: "white", // White background to match image
                color: "black", // Black text to match image
                borderRadius: "24px",
                padding: "12px",
                fontSize: "16px",
                fontWeight: "normal",
                textTransform: "none",
                width: "90%",
                marginBottom: "60px",
                "&:hover": { bgcolor: "rgba(240, 240, 240, 1)" },
                ...fontStyle,
              }}
              onClick={onMap}
            >
              マップに戻る
            </Button>
          </Box>
        </Box>
      </MuiModal>

      {/* Share Modal - with loading state */}
      <MuiModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? 2 : 0,
          zIndex: 1500, // Highest z-index to be above everything
          ...fontStyle,
        }}
      >
        <Box
          sx={{
            width: isMobile ? "90%" : 350,
            maxWidth: "90vw",
            bgcolor: "white",
            borderRadius: 3,
            p: 3,
            textAlign: "center",
            boxShadow: 24,
            position: "relative",
            ...fontStyle,
          }}
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

          {!scoreImageUrl && isGeneratingImage ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 4 
            }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{...fontStyle}}>
                画像を生成中... {/* "Generating image..." in Japanese */}
              </Typography>
            </Box>
          ) : scoreImageUrl && (
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
              <Typography variant="caption" sx={{...fontStyle}}>Share</Typography>
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
              <Typography variant="caption" sx={{...fontStyle}}>Save</Typography>
            </Box>
          </Box>
        </Box>
      </MuiModal>
    </>
  )
}

export default Modal

