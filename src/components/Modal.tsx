"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */
import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Box, Button, Typography, Modal as MuiModal, useMediaQuery, useTheme, IconButton } from "@mui/material"
import { Share2, Download } from "lucide-react"
import CloseIcon from "@mui/icons-material/Close"
import html2canvas from "html2canvas"
import backgroundImage from "../images/7.svg" // Import SVG directly

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
  const scoreRef = useRef<HTMLDivElement>(null)

  const generateScoreCard = useCallback(async () => {
    try {
      if (scoreRef.current) {
        const canvas = await html2canvas(scoreRef.current)
        const imageUrl = canvas.toDataURL("image/png")
        setScoreImageUrl(imageUrl)
        return imageUrl
      }
      return null
    } catch (error) {
      console.error("Failed to generate score card:", error)
      return null
    }
  }, [])

  const handleShareClick = async () => {
    const imageUrl = await generateScoreCard()
    if (imageUrl) {
      setShareModalOpen(true)
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
            }}
          >
            <Box ref={scoreRef} sx={{ width: "100%" }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "white",
                  fontSize: "16px",
                  marginTop: "40px",
                  marginBottom: "70px",
                  mb: 0.5,
                }}
              >
                スタート アナリシス
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  letterSpacing: 1,
                  color: "white",
                  marginBottom: "60px",
                  fontSize: "30px", // Larger font size to match image
                }}
              >
                START ANALYSIS
              </Typography>

              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: "500",
                  color: "#ff6699",
                  marginBottom: "50px",
                  mb: 0.5,
                }}
              >
                TIME
              </Typography>

              <Typography
                sx={{
                  fontSize: isMobile ? 80 : 80, // Larger font size to match image
                  color: "#ff6699",
                  marginTop: "25px",
                  marginBottom: "150px",
                  textShadow: "0 0 20px #ff6699", // Enhanced glowing effect to match image
                  mb: 3,
                  lineHeight: 1,
                }}
              >
                {reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}
              </Typography>
            </Box>

            {/* Share on SNS Button - Updated to match image */}
            <Button
              fullWidth
              sx={{
                mb: 1.5,
                bgcolor: "#3D4658", // Semi-transparent gray to match image
                color: "white",
                borderRadius: "24px", // Rounded corners
                padding: "12px",
                marginTop: "50px",
                marginBottom: "30px",
                fontSize: "16px",
                fontWeight: "normal",
                textTransform: "none",
                width: "60%",
                "&:hover": { bgcolor: "rgba(120, 120, 120, 0.7)" }, // Hover effect
              }}
              onClick={handleShareClick}
            >
              SNSでシェアする
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
              }}
              onClick={onMap}
            >
              マップに戻る
            </Button>
          </Box>
        </Box>
      </MuiModal>

      {/* Share Modal */}
      <MuiModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? 2 : 0,
          zIndex: 1500, // Highest z-index to be above everything
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

          <Typography variant="h6" sx={{ mb: 2 }}>
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
              <Typography variant="caption">Share</Typography>
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
              <Typography variant="caption">Save</Typography>
            </Box>
          </Box>
        </Box>
      </MuiModal>
    </>
  )
}

export default Modal

