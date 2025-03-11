"use client"

import type React from "react"
import { useState } from "react"
import { Box, Button, Typography, Modal as MuiModal, useMediaQuery, useTheme } from "@mui/material"
import { Twitter, Instagram, Download } from "lucide-react"

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

  const generateScoreCard = async () => {
    try {
      const scoreCanvas = document.createElement("canvas")
      const scoreCtx = scoreCanvas.getContext("2d")
      if (!scoreCtx) throw new Error("Could not get canvas context")

      scoreCanvas.width = 320
      scoreCanvas.height = 240

      // Background
      scoreCtx.fillStyle = "#333"
      scoreCtx.fillRect(0, 0, scoreCanvas.width, scoreCanvas.height)

      // Grid pattern
      scoreCtx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      scoreCtx.lineWidth = 1
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          scoreCtx.beginPath()
          scoreCtx.rect(i * 70, j * 60, 60, 50)
          scoreCtx.stroke()
        }
      }

      // Title text
      scoreCtx.fillStyle = "white"
      scoreCtx.font = "14px 'Noto Sans', sans-serif"
      scoreCtx.textAlign = "center"
      scoreCtx.fillText("スタートアナリシス", scoreCanvas.width / 2, 40)

      scoreCtx.font = "bold 24px 'Noto Sans', sans-serif"
      scoreCtx.fillText("START ANALYSIS", scoreCanvas.width / 2, 70)

      scoreCtx.font = "14px 'Noto Sans', sans-serif"
      scoreCtx.fillText("TIME", scoreCanvas.width / 2, 100)

      // Score text with glow effect
      scoreCtx.font = "bold 60px 'Noto Sans', sans-serif"
      scoreCtx.fillStyle = "#ff6699"
      scoreCtx.shadowColor = "#ff6699"
      scoreCtx.shadowBlur = 15

      const timeText = reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}` : "--"
      scoreCtx.fillText(timeText, scoreCanvas.width / 2 - 30, 170)

      scoreCtx.font = "bold 24px 'Noto Sans', sans-serif"
      scoreCtx.fillText("s", scoreCanvas.width / 2 + 50, 170)

      scoreCtx.shadowBlur = 0
      scoreCtx.fillStyle = "white"
      scoreCtx.font = "12px 'Noto Sans', sans-serif"
      scoreCtx.fillText("REACTION TIME TEST", scoreCanvas.width / 2, 210)

      const dataUrl = scoreCanvas.toDataURL("image/png")
      return dataUrl
    } catch (error) {
      console.error("Failed to generate score card:", error)
      throw error
    }
  }

  const handleShareClick = async () => {
    try {
      const imageUrl = await generateScoreCard()
      setScoreImageUrl(imageUrl)
      setShareModalOpen(true)
    } catch (error) {
      console.error("Failed to generate score card:", error)
    }
  }

  const shareToSocialMedia = (platform: string) => {
    if (!scoreImageUrl) return

    const shareText = `My reaction time is ${reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}!`

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&hashtags=ReactionTimeTest`,
          "_blank",
        )
        break
      case "instagram":
        // For Instagram, we need to download the image first
        { alert("To share on Instagram: 1. Save the image 2. Open Instagram 3. Create a new post with this image")
        const link = document.createElement("a")
        link.href = scoreImageUrl
        link.download = "reaction-time-score.png"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        break }
      case "line":
        window.open(
          `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`,
          "_blank",
        )
        break
      case "download":
        { const downloadLink = document.createElement("a")
        downloadLink.href = scoreImageUrl
        downloadLink.download = "reaction-time-score.png"
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        break }
      default:
        // Use Web Share API if available
        if (navigator.share) {
          fetch(scoreImageUrl)
            .then((res) => res.blob())
            .then((blob) => {
              const file = new File([blob], "reaction-time-score.png", { type: "image/png" })
              navigator
                .share({
                  title: "My Reaction Time Result",
                  text: shareText,
                  files: [file],
                })
                .catch((error) => {
                  console.error("Error sharing:", error)
                })
            })
        } else {
          alert(
            `My reaction time is ${reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}! Screenshot to share.`,
          )
        }
    }
    setShareModalOpen(false)
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
          <Button
            onClick={() => setShareModalOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              minWidth: "auto",
              p: 0.5,
              color: "#666",
              fontSize: "1.5rem",
              lineHeight: 1,
            }}
          >
            ×
          </Button>

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
              onClick={() => shareToSocialMedia("twitter")}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "#1DA1F2",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Twitter size={24} color="white" />
              </Box>
              <Typography variant="caption">Twitter</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                p: 1,
              }}
              onClick={() => shareToSocialMedia("instagram")}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "#E4405F",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <Instagram size={24} color="white" />
              </Box>
              <Typography variant="caption">Instagram</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                p: 1,
              }}
              onClick={() => shareToSocialMedia("line")}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "#06C755",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 0.5,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M19.365 9.89c.50 0 .907.41.907.91 0 .5-.407.91-.907.91H17.59v1.306h1.775c.5 0 .907.41.907.91 0 .5-.407.91-.907.91H16.59c-.5 0-.908-.41-.908-.91V9.89c0-.5.407-.91.908-.91h2.775zm-5.442 4.036c.5 0 .907.41.907.91 0 .5-.407.91-.907.91h-2.775c-.5 0-.907-.41-.907-.91V9.89c0-.5.407-.91.907-.91.5 0 .908.41.908.91v3.126h1.867zm-4.75-3.126c.5 0 .908.41.908.91 0 .5-.408.91-.908.91H7.407v.406h1.766c.5 0 .908.41.908.91 0 .5-.408.91-.908.91H7.407v.406h1.766c.5 0 .908.41.908.91 0 .5-.408.91-.908.91H6.407c-.5 0-.907-.41-.907-.91V9.89c0-.5.407-.91.907-.91h2.766zm10.256-2.895C20.418 6.33 21 5.19 21 3.994 21 2.893 19.978 2 18.672 2c-1.307 0-2.33.893-2.33 1.994 0 .893.558 1.674 1.388 1.92.168.056.28.224.28.392v.073c0 .112-.056.224-.168.28-.056.056-.112.056-.168.056h-.336c-2.33 0-4.494.955-6.16 2.546-1.667 1.59-2.666 3.746-2.666 6.068 0 4.71 3.972 8.566 8.826 8.566 4.855 0 8.826-3.856 8.826-8.566 0-1.87-.67-3.69-1.89-5.156-.112-.112-.112-.336 0-.448.112-.112.28-.112.392-.056.67.336 1.307.728 1.89 1.19.112.112.28.112.392 0 .112-.112.112-.28 0-.392-2.053-2.21-4.83-3.466-7.77-3.466h-.28c-.112 0-.224-.056-.28-.168-.056-.112-.056-.224 0-.336.112-.224.224-.448.28-.67z" />
                </svg>
              </Box>
              <Typography variant="caption">LINE</Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                p: 1,
              }}
              onClick={() => shareToSocialMedia("download")}
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

