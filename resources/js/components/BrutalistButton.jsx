export default function BrutalistButton({ children, color = 'yellow', className = '', type = 'button', ...props }) {
    return (
        <button type={type} className={`brutal-button button-${color} ${className}`} {...props}>
            {children}
        </button>
    );
}
