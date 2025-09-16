export const MaterialIcon = ({
  icon,
  className = "",
  size = 24,
  color = "inherit",
  filled = false,
  weight = 400,
  ...props
}) => {
  const style = {
    fontSize: `${size}px`,
    color: color,
    fontVariationSettings: `
      'FILL' ${filled ? 1 : 0},
      'wght' ${weight},
      'GRAD' 0,
      'opsz' ${size}
    `,
  };

  return (
    <span className={`material-symbols-outlined ${className}`} style={style} {...props}>
      {icon}
    </span>
  );
};
