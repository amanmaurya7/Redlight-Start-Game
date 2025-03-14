/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useCallback } from "react";
import { Box, Button, Typography, Modal as MuiModal, useMediaQuery, useTheme, IconButton } from "@mui/material";
import { Share2, Download } from "lucide-react";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";

interface ModalProps {
  open: boolean;
  reactionTime: number | null;
  onClose: () => void;
  onRetry: () => void;
  onMap: () => void;
}

const Modal: React.FC<ModalProps> = ({ open, reactionTime, onClose, onRetry, onMap }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isXsScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scoreImageUrl, setScoreImageUrl] = useState<string | null>(null);
  const scoreRef = useRef<HTMLDivElement>(null);

  const generateScoreCard = useCallback(async () => {
    try {
      if (scoreRef.current) {
        const canvas = await html2canvas(scoreRef.current);
        const imageUrl = canvas.toDataURL("image/png");
        setScoreImageUrl(imageUrl);
        return imageUrl;
      }
      return null;
    } catch (error) {
      console.error("Failed to generate score card:", error);
      return null;
    }
  }, []);

  const handleShareClick = async () => {
    const imageUrl = await generateScoreCard();
    if (imageUrl) {
      setShareModalOpen(true);
    }
  };

  const shareScore = async () => {
    if (!scoreImageUrl) return;

    const shareText = `My reaction time is ${reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}!`;

    try {
      if (navigator.share) {
        const res = await fetch(scoreImageUrl);
        const blob = await res.blob();
        const file = new File([blob], "reaction-time-score.png", { type: "image/png" });
        
        await navigator.share({
          title: "My Reaction Time Result",
          text: shareText,
          files: [file],
        });
        setShareModalOpen(false);
      } else {
        downloadImage();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      downloadImage();
    }
  };

  const downloadImage = () => {
    if (!scoreImageUrl) return;
    
    const downloadLink = document.createElement("a");
    downloadLink.href = scoreImageUrl;
    downloadLink.download = "reaction-time-score.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <MuiModal
        open={open}
        onClose={onClose}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
        }}
        BackdropProps={{
          style: { backgroundColor: "transparent" } // Make backdrop transparent to see the background
        }}
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
          }}
        >
          <Box
            sx={{
              width: isMobile ? "100%" : "90%",
              maxWidth: "400px",
              bgcolor: "rgba(0, 0, 0, 0.85)", // Semi-transparent dark background
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box ref={scoreRef} sx={{ width: "100%" }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: "white",
                  fontSize: "14px",
                  mb: 0.5
                }}
              >
                スタートアナリシス
              </Typography>
              
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  letterSpacing: 1,
                  fontWeight: "bold",
                  color: "white",
                  fontSize: "22px"
                }}
              >
                START ANALYSIS
              </Typography>
              
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#ff6699",
                  mb: 0.5
                }}
              >
                TIME
              </Typography>
              
              <Typography
                sx={{
                  fontSize: isMobile ? 50 : 60,
                  fontWeight: "bold",
                  color: "#ff6699",
                  textShadow: "0 0 15px #ff6699",
                  mb: 3,
                  lineHeight: 1
                }}
              >
                {reactionTime !== null ? `${(reactionTime / 1000).toFixed(3)}s` : "--"}
              </Typography>
            </Box>
            
            <Button
              fullWidth
              sx={{
                mb: 1.5,
                bgcolor: "#666",
                color: "white",
                borderRadius: "24px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "normal",
                textTransform: "none",
                width: "90%",
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
                borderRadius: "24px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "normal",
                textTransform: "none",
                width: "90%",
                "&:hover": { bgcolor: "#777" },
              }}
              onClick={onRetry}
            >
              もう一度遊ぶ
            </Button>
            
            <Button
              fullWidth
              sx={{
                bgcolor: "#666",
                color: "white",
                borderRadius: "24px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "normal",
                textTransform: "none",
                width: "90%",
                "&:hover": { bgcolor: "#777" },
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
  );
};

export default Modal;