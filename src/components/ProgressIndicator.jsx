function ProgressIndicator({ progress }) {
    if (!progress) return null

    const { stage, percent } = progress

    return (
        <div className="card mb-lg" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex flex-between mb-md">
                <h3 style={{ fontSize: '1rem', marginBottom: 0 }}>
                    {stage || 'Processing...'}
                </h3>
                <span className="badge badge-primary">
                    {percent || 0}%
                </span>
            </div>

            <div
                style={{
                    width: '100%',
                    height: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <div
                    style={{
                        width: `${percent || 0}%`,
                        height: '100%',
                        background: 'var(--accent-gradient)',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            animation: 'shimmer 2s infinite'
                        }}
                    />
                </div>
            </div>

            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    )
}

export default ProgressIndicator
