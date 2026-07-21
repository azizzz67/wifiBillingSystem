import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose, footer, tone = 'blue' }) {
    if (!open) return null;
    return (
        <div className="modal-backdrop" onMouseDown={onClose} role="presentation">
            <section className={`modal-card modal-${tone}`} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
                <header>
                    <h2>{title}</h2>
                    <button className="icon-button icon-button-dark" onClick={onClose} aria-label="Tutup modal"><X /></button>
                </header>
                <div className="modal-body">{children}</div>
                {footer && <footer>{footer}</footer>}
            </section>
        </div>
    );
}
