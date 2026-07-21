export default function StatCard({ label, value, helper, color = 'white', icon: Icon }) {
    return (
        <article className={`stat-card stat-${color}`}>
            <div className="stat-card__top">
                <span>{label}</span>
                {Icon && <Icon size={26} strokeWidth={2.5} />}
            </div>
            <strong>{value}</strong>
            {helper && <div className="stat-card__helper">{helper}</div>}
        </article>
    );
}
