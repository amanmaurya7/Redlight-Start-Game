import React from "react";
import { Box, Button, Typography, Modal as MuiModal, useMediaQuery, useTheme } from "@mui/material";

interface ModalProps {
  open: boolean;
  reactionTime: number | null;
  onClose: () => void;
  onRetry: () => void;
  onShare: () => void;
  onMap: () => void;
}

const Modal: React.FC<ModalProps> = ({ open, reactionTime, onClose, onRetry, onShare }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isXsScreen = useMediaQuery(theme.breakpoints.down('xs'));

  return (
    <MuiModal 
      open={open} 
      onClose={onClose} 
      sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        padding: isMobile ? 2 : 0 
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
            letterSpacing: 1 
          }}
        >
          START ANALYSIS
        </Typography>
        <Typography 
          sx={{ 
            fontSize: isMobile ? 16 : 20, 
            fontWeight: "bold", 
            color: "#ff6699", 
            textShadow: "0 0 15px #ff6699" 
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
            mb: 2 
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
            fontSize: isXsScreen ? "0.8rem" : "inherit"
          }} 
          onClick={onShare}
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
            fontSize: isXsScreen ? "0.8rem" : "inherit"
          }} 
          onClick={onRetry}
        >
          もう一度遊ぶ
        </Button>
        
      </Box>
    </MuiModal>
  );
};

export default Modal;