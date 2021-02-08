import { useState, useEffect } from 'react';

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export default (mobile, tablet) => {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return mobile ? (
    windowDimensions.width <= mobile ? (
      'mobile'
    ) : (
      tablet ? (
        windowDimensions.width <= tablet ? (
          'tablet'
        ) : (
          'pc'
        )
      ) : ('pc')
    )
  ) : (
    windowDimensions
  )
}