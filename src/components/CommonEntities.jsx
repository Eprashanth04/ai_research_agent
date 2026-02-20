function CommonEntities({ data }) {
    const datasets = data.common_datasets || []
    const methods = data.common_methods || []

    const maxCount = Math.max(
        ...datasets.map(d => d.count || 0),
        ...methods.map(m => m.count || 0),
        1
    )

    const BarChart = ({ items, title, color }) => (
        <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-lg)' }}>
                {title}
            </h3>

            {items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {items.map((item, index) => {
                        const percentage = ((item.count || 0) / maxCount) * 100

                        return (
                            <div key={index}>
                                <div className="flex flex-between mb-sm">
                                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                        {item.name || 'Unknown'}
                                    </span>
                                    <span className="badge badge-primary">
                                        {item.count || 0} paper{(item.count || 0) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '5px',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            background: color,
                                            borderRadius: '5px',
                                            transition: 'width 0.5s ease'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    No {title.toLowerCase()} found.
                </p>
            )}
        </div>
    )

    return (
        <div>
            <h2>🧩 Common Datasets & Methods</h2>
            <p className="text-secondary mb-lg">
                Frequently mentioned datasets and methodologies across all papers
            </p>

            <div className="grid grid-2">
                <BarChart
                    items={datasets}
                    title="📊 Common Datasets"
                    color="linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)"
                />

                <BarChart
                    items={methods}
                    title="⚙️ Common Methods/Algorithms"
                    color="linear-gradient(90deg, #10b981 0%, #059669 100%)"
                />
            </div>

            {datasets.length === 0 && methods.length === 0 && (
                <div className="card text-center mt-lg">
                    <p className="text-muted">No common entities extracted yet.</p>
                </div>
            )}
        </div>
    )
}

export default CommonEntities
