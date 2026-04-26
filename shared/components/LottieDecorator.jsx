import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

const LottieDecorator = ({ url, config }) => {
  const [animationData, setAnimationData] = useState(null);
  const lottieRef = useRef(null);

  useEffect(() => {
    if (!url) return;
    
    if (typeof url === 'object') {
      setAnimationData(url);
      return;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Error cargando Lottie:", err));
  }, [url]);

  const {
    x = 50,
    y = 50,
    size = 200,
    rotation = 0,
    opacity = 1,
    zIndex = 10,
    flipX = false,
    speed = 1
  } = config || {};

  // Actualizar velocidad cuando cambie el config
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  if (!animationData) return null;

  const style = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: typeof size === 'number' ? `${size}px` : size,
    zIndex: zIndex,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const LottieComponent = Lottie.default || Lottie;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: opacity, 
        rotate: rotation,
        scaleX: flipX ? -1 : 1,
        scaleY: 1, // Para evitar que scaleX herede el scale:1 del animate inicial
        x: '-50%',
        y: '-50%'
      }}
      transition={{ duration: 0.3 }}
      style={style}
    >
      <LottieComponent 
        lottieRef={lottieRef}
        animationData={animationData} 
        loop={true} 
        style={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  );
};

export default LottieDecorator;
