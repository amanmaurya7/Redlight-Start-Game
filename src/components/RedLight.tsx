import React, { useState, useEffect } from 'react';
import { Container, Box, Modal, Typography } from '@mui/material';

import Svg1 from '../images/1.svg';
import Svg2 from '../images/2.svg';
import Svg3 from '../images/3.svg';
import Svg4 from '../images/4.svg';
import Svg5 from '../images/5.svg';
import Svg6 from '../images/6.svg';
import Svg7 from '../images/7.svg';
import StartButton from '../images/start-button.svg';
import FadedStartButton from '../images/faded-startBtn.svg';

const svgArray = [Svg1, Svg2, Svg3, Svg4, Svg5, Svg6, Svg7];

const RedLight: React.FC = () => {
  const [currentSvgIndex, setCurrentSvgIndex] = useState(0);
  const [sequenceCompleted, setSequenceCompleted] = useState(false);
  const [reactionStartTime, setReactionStartTime] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setSequenceCompleted(false);
    setReactionStartTime(null);
    setReactionTime(null);

    const interval = setInterval(() => {
      setCurrentSvgIndex((prevIndex) => {
        if (prevIndex >= svgArray.length - 1) {
          clearInterval(interval);
          setSequenceCompleted(true);
          setReactionStartTime(Date.now()); // Record time when last light is lit
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleStartClick = () => {
    if (sequenceCompleted && reactionStartTime) {
      const timeDiff = Date.now() - reactionStartTime;
      setReactionTime(timeDiff);
      setOpenModal(true);
      setCurrentSvgIndex(0);
      setSequenceCompleted(false);
    }
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        position: 'relative' 
      }}
    >
      <Box 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}
      >
        <img
          src={svgArray[currentSvgIndex]}
          alt="Red Light"
          width="100%"
          height="100%"
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        />

        <Box
          component="img"
          src={sequenceCompleted ? StartButton : FadedStartButton}
          alt="Start Button"
          sx={{
            position: 'absolute',
            zIndex: 2,
            width: '100px',
            height: 'auto',
            cursor: sequenceCompleted ? 'pointer' : 'default',
            opacity: sequenceCompleted ? 1 : 0.5,
            marginTop: '80%'
          }}
          onClick={handleStartClick}
        />
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            textAlign: 'center'
          }}
        >
          <Typography variant="h6">Reaction Time</Typography>
          <Typography variant="h4" sx={{ mt: 2 }}>{reactionTime} ms</Typography>
        </Box>
      </Modal>
    </Container>
  );
};

export default RedLight;


