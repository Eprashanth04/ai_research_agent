import { useState } from 'react'
import { startResearch } from '../services/api'

function QueryForm({ onComplete, onProgress }) {
    const [topic, setTopic] = useState('')
    const [numPapers, setNumPapers] = useState(5)
    const [downloadPdfs, setDownloadPdfs] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!topic.trim()) {
            setError('Please enter a research topic')
            return
        }

        setLoading(true)
        setError(null)

        try {
            onProgress?.({ stage: 'Fetching papers from Semantic Scholar...', percent: 10 })


            const result = await startResearch(topic, numPapers, downloadPdfs)

            onProgress?.({ stage: 'Analyzing papers...', percent: 40 })
            await new Promise(resolve => setTimeout(resolve, 800))

            onProgress?.({ stage: 'Extracting entities and findings...', percent: 60 })
            await new Promise(resolve => setTimeout(resolve, 800))

            onProgress?.({ stage: 'Generating synthesis and draft...', percent: 80 })
            await new Promise(resolve => setTimeout(resolve, 800))

            onProgress?.({ stage: 'Complete!', percent: 100 })

            console.log('Research complete:', result)


            onComplete?.(result.report)


            setTopic('')
            setNumPapers(5)
            setDownloadPdfs(false)
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to fetch papers')
            console.error('Research error:', err)
        } finally {
            setLoading(false)
            setTimeout(() => onProgress?.(null), 1000)
        }
    }

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>🔍 Start New Research</h2>
            <p className="text-secondary mb-lg">
                Enter your research topic to fetch and analyze academic papers
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="topic">Research Topic</label>
                    <input
                        id="topic"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., machine learning in healthcare"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="numPapers">Number of Papers</label>
                    <input
                        id="numPapers"
                        type="number"
                        min="1"
                        max="20"
                        value={numPapers}
                        onChange={(e) => setNumPapers(parseInt(e.target.value))}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={downloadPdfs}
                            onChange={(e) => setDownloadPdfs(e.target.checked)}
                            disabled={loading}
                            style={{ width: 'auto' }}
                        />
                        <span>Download PDFs for offline analysis</span>
                    </label>
                </div>

                {error && (
                    <div className="glass mb-md" style={{ padding: 'var(--spacing-md)', border: '1px solid var(--accent-error)' }}>
                        <p className="text-error" style={{ margin: 0 }}>⚠️ {error}</p>
                    </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                    {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span className="spinner"></span>
                            Processing...
                        </span>
                    ) : (
                        '🚀 Start Research'
                    )}
                </button>
            </form>

            <div className="mt-lg glass" style={{ padding: 'var(--spacing-md)' }}>
                <h4 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>What happens next?</h4>
                <ul style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>
                    <li>Papers are fetched from Semantic Scholar API</li>
                    <li>Cross-paper similarity analysis is performed</li>
                    <li>Common datasets and methods are extracted</li>
                    <li>Findings are synthesized across papers</li>
                    <li>An automated draft summary is generated</li>
                </ul>
            </div>
        </div>
    )
}

export default QueryForm
