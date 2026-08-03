/**
 * Position helpers mapping percentages (0-100) to absolute css styles.
 */
export const getAbsolutePositionStyles = (x, y, width = null, height = null) => {
  const styles = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`
  };
  
  if (width !== null) styles.width = `${width}%`;
  if (height !== null) styles.height = `${height}%`;
  
  return styles;
};

export const getTransformStyles = (direction, scale = 1) => {
  const flip = direction === 'left' ? -1 : 1;
  return {
    transform: `scaleX(${flip}) scale(${scale})`
  };
};

export default {
  getAbsolutePositionStyles,
  getTransformStyles
};
