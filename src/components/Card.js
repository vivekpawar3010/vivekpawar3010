export default function Card({ children, style = {}, className = "", ...props }) {
  return (
    <div
      className={`glass-card ${className}`}
      style={{
        padding: "1.5rem",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
