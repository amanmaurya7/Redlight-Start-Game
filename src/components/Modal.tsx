"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Box, Button, Typography, Modal as MuiModal, useMediaQuery, useTheme, IconButton } from "@mui/material"
import { Share2, Download } from "lucide-react"
import CloseIcon from "@mui/icons-material/Close"
import html2canvas from "html2canvas"

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
  const isXsScreen = useMediaQuery(theme.breakpoints.down("xs"))
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
      // Try using the Web Share API if available
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
        // Fallback - just download the image
        downloadImage()
      }
    } catch (error) {
      console.error("Error sharing:", error)
      // Fallback to download if sharing fails
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
          padding: isMobile ? 2 : 0,
        }}
      >
        <Box
          sx={{
            width: isMobile ? "90%" : 320,
            maxWidth: "90vw",
            bgcolor: "#333",
            borderRadius: 2,
            p: isMobile ? 2 : 3,
            textAlign: "center",
            color: "white",
            boxShadow: 24,
            position: "relative",
          }}
        >
          <Box ref={scoreRef}>
            <Typography variant={isMobile ? "body2" : "subtitle1"}>スタートアナリシス</Typography>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight="bold"
              sx={{
                mb: 1.5,
                letterSpacing: 1,
              }}
            >
              START ANALYSIS
            </Typography>
            <Typography
              sx={{
                fontSize: isMobile ? 16 : 20,
                fontWeight: "bold",
                color: "#ff6699",
                textShadow: "0 0 15px #ff6699",
              }}
            >
              TIME
            </Typography>
            <Box
              sx={{
                fontSize: isMobile ? 48 : 60,
                fontWeight: "bold",
                color: "#ff6699",
                textShadow: "0 0 15px #ff6699",
                mb: 2,
              }}
            >
              {reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)} s` : "--"}
            </Box>
          </Box>
          
          <Button
            fullWidth
            sx={{
              mb: 1.5,
              bgcolor: "#666",
              color: "white",
              borderRadius: "20px",
              width: isMobile ? "100%" : "200px",
              padding: isMobile ? "8px" : "10px",
              fontSize: isXsScreen ? "0.8rem" : "inherit",
              "&:hover": { bgcolor: "#777" },
            }}
            onClick={handleShareClick}
          >
            SNSでシェアする
          </Button>
          <Button
            fullWidth
            sx={{
              mb: 1.5,
              bgcolor: "#666",
              color: "white",
              borderRadius: "20px",
              width: isMobile ? "100%" : "200px",
              padding: isMobile ? "8px" : "10px",
              fontSize: isXsScreen ? "0.8rem" : "inherit",
              "&:hover": { bgcolor: "#777" },
            }}
            onClick={onRetry}
          >
            もう一度遊ぶ
          </Button>
          
          
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

