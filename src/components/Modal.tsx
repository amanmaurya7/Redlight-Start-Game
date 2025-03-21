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

const Modal: React.FC<ModalProps> = ({ open, reactionTime, onClose, onRetry }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [scoreImageUrl, setScoreImageUrl] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  // Add a state to control when to render the SNS background element
  const [shouldRenderScoreElement, setShouldRenderScoreElement] = useState(false)
  const scoreRef = useRef<HTMLDivElement>(null)

  // Don't automatically generate score card when modal opens
  // Only prepare it when user is about to share
  useEffect(() => {
    // Clear the image URL when modal closes to prevent stale images
    if (!open) {
      setScoreImageUrl(null);
      setShouldRenderScoreElement(false);
    }
  }, [open]);

  const prepareShareImage = useCallback(() => {
    // Only render the score element when needed
    setShouldRenderScoreElement(true);
    
    // Use a small timeout to let the component render first
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }, []);

  const generateScoreCard = useCallback(async () => {
    try {
      if (!scoreRef.current) return null;
      
      setIsGeneratingImage(true);
      
      // Get a reference to the score element
      const scoreElement = scoreRef.current;
      
      // Before capturing, make sure it's properly visible to html2canvas
      // but still invisible to user (off-screen)
      const originalTransform = scoreElement.style.transform;
      scoreElement.style.opacity = '1'; // Make it fully opaque for capture
      scoreElement.style.transform = 'none'; // Remove any transforms that might affect capture
      
      // Optimized html2canvas options
      const options = {
        scale: window.devicePixelRatio * 1.5,
        backgroundColor: null,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        removeContainer: true,
        // Add this to prevent scrolling issues
        windowWidth: scoreElement.offsetWidth,
        windowHeight: scoreElement.offsetHeight,
      };
      
      const canvas = await html2canvas(scoreElement, options);
      const imageUrl = canvas.toDataURL("image/png", 0.9);
      setScoreImageUrl(imageUrl);
      
      // Restore the original state
      scoreElement.style.opacity = '0';
      scoreElement.style.transform = originalTransform;
      
      setIsGeneratingImage(false);
      return imageUrl;
    } catch (error) {
      console.error("Failed to generate score card:", error);
      setIsGeneratingImage(false);
      return null;
    }
  }, []);

  const handleShareClick = async () => {
    setIsGeneratingImage(true);
    
    // If image is already generated, open modal right away
    if (scoreImageUrl) {
      setShareModalOpen(true);
      setIsGeneratingImage(false);
      return;
    }
    
    try {
      // First prepare the share element
      await prepareShareImage();
      
      // Then generate the image
      const imageUrl = await generateScoreCard();
      if (imageUrl) {
        setShareModalOpen(true);
      }
    } finally {
      setIsGeneratingImage(false);
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

    try {
      // Always attempt to copy to clipboard first for backup sharing option
      try {
        await navigator.clipboard.writeText(shareText)
        console.log("Share text copied to clipboard")
      } catch (clipError) {
        console.error("Failed to copy to clipboard:", clipError)
      }

      // Determine device capabilities
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isWebShareSupported = typeof navigator.share === 'function';
      const isFileShareSupported = 
        isWebShareSupported && 
        typeof navigator.canShare === 'function';
      
      if (isWebShareSupported) {
        try {
          // Try file sharing first if supported
          if (isFileShareSupported) {
            // Prepare the image file for sharing
            const res = await fetch(scoreImageUrl);
            const blob = await res.blob();
            const file = new File([blob], "reaction-time-score.png", { type: "image/png" });
            
            // Create share data with both text and image
            const shareData = {
              title: "リアクションタイムテスト",
              text: shareText,
              files: [file]
            };
            
            // Check if this specific content can be shared (important for iOS)
            if (navigator.canShare && navigator.canShare(shareData)) {
              await navigator.share(shareData);
              console.log("Shared successfully with image and text");
              setShareModalOpen(false);
              return; // Exit after successful share
            } else {
              console.log("File sharing not supported, trying text-only share");
            }
          }
          
          // Fall back to text-only sharing
          await navigator.share({
            title: "リアクションタイムテスト",
            text: shareText,
            url: window.location.href, // Add URL to improve sharing options
          });
          console.log("Shared text only successfully");
          setShareModalOpen(false);
          return; // Exit after successful share
        } catch (shareError) {
          console.error("Error during Web Share API:", shareError);
          
          // Special handling for user cancellation
          if (shareError && typeof shareError === 'object' && 'name' in shareError && shareError.name === 'AbortError') {
            console.log("User cancelled sharing");
            return; // Don't proceed to fallback if user cancelled
          }
        }
      }
      
      // Enhanced fallback for iOS that doesn't support direct file sharing
      if (isIOS) {
        try {
          // Create a temporary anchor to download the image
          const downloadLink = document.createElement("a");
          downloadLink.href = scoreImageUrl;
          downloadLink.download = "reaction-time-score.png";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          
          setShareModalOpen(false);
          return;
        } catch (iosError) {
          console.error("iOS fallback failed:", iosError);
        }
      }
      
      // Final fallback for all other devices
      downloadImage();
      alert("画像をダウンロードしました。シェアするテキストはクリップボードにコピーされました。");
      setShareModalOpen(false);
      
    } catch (error) {
      console.error("Error in sharing process:", error);
      downloadImage();
      alert("画像をダウンロードしました。シェアするテキストはクリップボードにコピーされました。");
      setShareModalOpen(false);
    }
  }
  
  // Enhance download image function with better error handling
  const downloadImage = async () => {
    if (!scoreImageUrl) return

    try {
      // Create download link
      const downloadLink = document.createElement("a");
      downloadLink.href = scoreImageUrl;
      downloadLink.download = "reaction-time-score.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Try to copy text to clipboard as part of download action
      const shareText = `#リアクションタイムテスト に挑戦！
結果はこちら！あなたの反応速度はどれくらい？🏎️💨
${reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}
"F1 Japanese GP" LINE公式アカウントを友だち追加して、今すぐチャレンジ！👇
https://liff.line.me/2006572406-D3OkWx32?tcode=rCXml0000013431
#F1jp #F1日本グランプリ`;
      
      try {
        await navigator.clipboard.writeText(shareText);
        console.log("Share text copied to clipboard during download");
      } catch (clipError) {
        console.error("Failed to copy share text to clipboard:", clipError);
      }
    } catch (downloadError) {
      console.error("Download failed:", downloadError);
      alert("画像のダウンロードに失敗しました。");
    }
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
            {/* Only render the score card when needed */}
            {shouldRenderScoreElement && (
              <Box 
                ref={scoreRef} 
                sx={{ 
                  width: 320, // Set fixed width for better capture
                  height: 320, // Set fixed height for better capture
                  backgroundImage: `url(${snsBgImage})`,
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "cover",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 4,
                  // Keep this element completely offscreen and hidden from user view
                  position: "fixed",
                  left: "-9999px",
                  top: "-9999px",
                  pointerEvents: "none", // Prevent any interactions
                  opacity: 0, // Hidden initially but will be set to 1 during capture
                  zIndex: -999, // Ensure it's behind everything
                  ...fontStyle,
                }}
              >
                {/* REDLIGHT Game text */}
                <Typography
                  variant="h4"
                  sx={{
                    color: "black", // Ensure text is visible against background
                    marginTop: 20, // Significantly increased from 5 to 10 for much more space at the top
                    textShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: {xs: 28, sm: 28, md: 30},
                    letterSpacing: 1,
                    ...fontStyle,
                  }}
                >
                  REDLIGHT START
                </Typography>
                
                {/* TIME text */}
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ff6699",
                    marginTop: 3, // Increased from 2 to 5 for more space
                    marginBottom: 1,
                    textAlign: "center",
                    fontWeight: "500",
                    fontSize: {xs: 25, sm: 25, md: 28},
                    ...fontStyle,
                  }}
                >
                  TIME
                </Typography>
                
                {/* Score display */}
                <Typography
                  sx={{
                    fontSize: {xs: 84, sm: 90, md: 100},
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
                      <Typography component="span" sx={{ 
                      fontSize: '60%', 
                      verticalAlign: 'baseline',
                      fontFamily: "'MyCustomFont', sans-serif" 
                      }}>
                      s
                      </Typography>
                    </>
                    ) : "--"}
                </Typography>
              </Box>
            )}
            
            {/* Regular visible score display in the modal */}
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
                {reactionTime !== null ? (
                  <>
                  {(reactionTime / 1000).toFixed(3)}
                    <Typography component="span" sx={{ 
                    fontSize: '50%', 
                    verticalAlign: 'super',
                    fontFamily: "'MyCustomFont', sans-serif",
                    position: 'relative',
                    bottom: '-0.6em'
                    }}>
                    s
                    </Typography>
                  </>
                ) : "--"}
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
                // Add a smooth transition for button content
                "& > *": {
                  transition: "opacity 0.2s ease-in-out"
                }
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
              onClick={() => {
              window.location.href = 'https://new-jp-map.vercel.app/';
              }}
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

