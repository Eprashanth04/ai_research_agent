import { useState } from 'react'

function SimilarityMatrix({ data }) {
    const [sortBy, setSortBy] = useState('score')
    const similarities = data.similarities || []
    const totalPapers = data.total_papers || 0

    const getSimilarityColor = (score) => {
        if (score >= 0.5) return '#10b981' 
        if (score >= 0.3) return '#f59e0b' 
        if (score >= 0.15) return '#6366f1'
        return '#6b7280' 
    }

    const sortedSimilarities = [...similarities].sort((a, b) => {
        if (sortBy === 'score') return (b.score || 0) - (a.score || 0)
        if (sortBy === 'paper1') return (a.paper1 || '').localeCompare(b.paper1 || '')
        if (sortBy === 'paper2') return (a.paper2 || '').localeCompare(b.paper2 || '')
        return 0
    })

    const truncateName = (name, maxLen = 40) => {
        if (!name) return 'Unknown'
        return name.length > maxLen ? name.substring(0, maxLen) + '...' : name
    }

    return (
        <div>
            <h2>🔗 Cross-Paper Similarity Analysis</h2>
            <p className="text-secondary mb-md">
                Pairwise TF-IDF similarity scores between all analyzed papers
            </p>

            <div className="card mb-lg">
                <div className="flex flex-between" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                            {totalPapers} Papers Analyzed
                        </h3>
                        <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
                            {similarities.length} pairwise comparisons
                        </p>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>
                            Sort by:
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ width: 'auto' }}
                        >
                            <option value="score">Similarity Score</option>
                            <option value="paper1">Paper 1</option>
                            <option value="paper2">Paper 2</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="card mb-lg">
                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>
                    Similarity Legend
                </h3>
                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', background: '#10b981', borderRadius: '4px' }}></div>
                        <span style={{ fontSize: '0.875rem' }}>High (≥50%)</span>
                    </div>
                    <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', background: '#f59e0b', borderRadius: '4px' }}></div>
                        <span style={{ fontSize: '0.875rem' }}>Medium (30-49%)</span>
                    </div>
                    <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', background: '#6366f1', borderRadius: '4px' }}></div>
                        <span style={{ fontSize: '0.875rem' }}>Low (15-29%)</span>
                    </div>
                    <div className="flex" style={{ alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '16px', height: '16px', background: '#6b7280', borderRadius: '4px' }}></div>
                        <span style={{ fontSize: '0.875rem' }}>Minimal (&lt;15%)</span>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>#</th>
                            <th>Paper 1</th>
                            <th>Paper 2</th>
                            <th style={{ width: '120px', textAlign: 'center' }}>Score</th>
                            <th style={{ width: '120px', textAlign: 'center' }}>Similarity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSimilarities.map((sim, index) => (
                            <tr key={index}>
                                <td style={{ color: 'var(--text-muted)', fontWeight: '600' }}>{index + 1}</td>
                                <td title={sim.paper1}>{truncateName(sim.paper1, 50)}</td>
                                <td title={sim.paper2}>{truncateName(sim.paper2, 50)}</td>
                                <td style={{ textAlign: 'center', fontFamily: 'monospace', fontWeight: '600' }}>
                                    {(sim.score || 0).toFixed(6)}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <div className="flex flex-center gap-sm">
                                        <div
                                            style={{
                                                width: '60px',
                                                height: '8px',
                                                background: '#1f2937',
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${(sim.score || 0) * 100}%`,
                                                    height: '100%',
                                                    background: getSimilarityColor(sim.score || 0),
                                                    transition: 'width 0.3s ease'
                                                }}
                                            ></div>
                                        </div>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                            {((sim.score || 0) * 100).toFixed(2)}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {similarities.length === 0 && (
                <div className="card text-center">
                    <p className="text-muted">No similarity data available.</p>
                </div>
            )}
        </div>
    )
}

export default SimilarityMatrix
