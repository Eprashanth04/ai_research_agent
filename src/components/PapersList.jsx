import { useState } from 'react'

function PapersList({ papers, pdfs }) {
    const [sortBy, setSortBy] = useState('year')
    const [filterText, setFilterText] = useState('')

    const getPdfFilename = (title) => {
        return pdfs.find(pdf => pdf.toLowerCase().includes(title.toLowerCase().substring(0, 20)))
    }

    const filteredPapers = papers
        .filter(paper => {
            if (!filterText) return true
            const searchStr = filterText.toLowerCase()
            return (
                paper.title?.toLowerCase().includes(searchStr) ||
                paper.abstract?.toLowerCase().includes(searchStr) ||
                paper.authors?.some(a => a.name.toLowerCase().includes(searchStr))
            )
        })
        .sort((a, b) => {
            if (sortBy === 'year') return (b.year || 0) - (a.year || 0)
            if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '')
            return 0
        })

    return (
        <div>
            <div className="flex flex-between mb-lg" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <h2>📚 Fetched Papers ({filteredPapers.length})</h2>

                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="🔍 Filter papers..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={{ width: '250px' }}
                    />

                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: 'auto' }}>
                        <option value="year">Sort by Year</option>
                        <option value="title">Sort by Title</option>
                    </select>
                </div>
            </div>

            {filteredPapers.length === 0 ? (
                <div className="card text-center">
                    <p className="text-muted">No papers found. Try adjusting your filter.</p>
                </div>
            ) : (
                <div className="grid" style={{ gap: 'var(--spacing-lg)' }}>
                    {filteredPapers.map((paper, index) => {
                        const pdfFile = getPdfFilename(paper.title)
                        const hasOpenAccess = paper.isOpenAccess || paper.openAccessPdf

                        return (
                            <div key={index} className="card">
                                <div className="flex flex-between mb-sm" style={{ alignItems: 'flex-start' }}>
                                    <h3 style={{ fontSize: '1.25rem', flex: 1, marginBottom: '0.5rem' }}>
                                        {paper.title}
                                    </h3>
                                    {hasOpenAccess && (
                                        <span className="badge badge-success" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                            Open Access
                                        </span>
                                    )}
                                </div>

                                <div className="mb-md">
                                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                                        <strong>Authors:</strong> {paper.authors?.map(a => a.name).join(', ') || 'Unknown'}
                                    </p>
                                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0' }}>
                                        <strong>Year:</strong> {paper.year || 'N/A'} • <strong>Paper ID:</strong> {paper.paperId?.substring(0, 8) || 'N/A'}
                                    </p>
                                </div>

                                {paper.abstract && (
                                    <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: 'var(--spacing-md)' }}>
                                        {paper.abstract.length > 300
                                            ? `${paper.abstract.substring(0, 300)}...`
                                            : paper.abstract
                                        }
                                    </p>
                                )}

                                <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                    {paper.url && (
                                        <a
                                            href={paper.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                        >
                                            📄 View Paper
                                        </a>
                                    )}

                                    {pdfFile && (
                                        <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center' }}>
                                            ✓ PDF Downloaded
                                        </span>
                                    )}

                                    {paper.openAccessPdf?.url && (
                                        <a
                                            href={paper.openAccessPdf.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                                        >
                                            📥 Download PDF
                                        </a>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default PapersList
