import { useMemo, useState } from 'react'
import { reviseDraft } from '../services/api'
import { jsPDF } from 'jspdf'

function DraftPreview({ data, onUpdate }) {
    const [feedback, setFeedback] = useState('')
    const [isRevising, setIsRevising] = useState(false)

    const sections = useMemo(() => {
        if (!data || typeof data !== 'string') {
            return { abstract: '', methods: '', results: '', references: '' }
        }

        const lines = data.split('\n');
        const parsed = { abstract: '', methods: '', results: '', references: '' };


        const headerPattern = /^[#\s\*]*(?:\d\.?\s+)?\s*(abstract|methods|results|references|introduction|methodology|findings|discussion|bibliography)\b/i;
        const mapping = {
            'introduction': 'abstract', 'abstract': 'abstract',
            'methods': 'methods', 'methodology': 'methods',
            'results': 'results', 'findings': 'results', 'discussion': 'results',
            'references': 'references', 'bibliography': 'references'
        };

        let currentKey = 'abstract';
        let foundAnyHeader = false;

        lines.forEach(line => {
            const cleanLine = line.trim();
            if (!cleanLine && !parsed[currentKey]) return;

            const match = cleanLine.match(headerPattern);


            if (match && cleanLine.length < 60) {
                const headWord = match[1].toLowerCase();
                const newKey = mapping[headWord];
                if (newKey) {
                    currentKey = newKey;
                    foundAnyHeader = true;
                    return;
                }
            }

            if (currentKey) {
                parsed[currentKey] += (parsed[currentKey] ? '\n' : '') + line;
            }
        });


        if (!foundAnyHeader) {
            return { abstract: data.trim(), methods: '', results: '', references: '' };
        }


        Object.keys(parsed).forEach(k => {
            parsed[k] = parsed[k].trim();
        });

        return parsed;
    }, [data])

    const handleExportPDF = () => {
        const doc = new jsPDF()
        const margin = 20
        const pageWidth = doc.internal.pageSize.getWidth()
        const contentWidth = pageWidth - (margin * 2)
        let yPos = 30


        const cleanText = (text) => {
            if (!text) return ""
            return text
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/__(.*?)__/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/_(.*?)_/g, '$1')
                .replace(/#+\s+(.*)/g, '$1')
                .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
                .trim()
        }


        const addFooter = () => {
            const pageCount = doc.internal.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFont("times", "italic")
                doc.setFontSize(10)
                doc.setTextColor(150)
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: "center" }
                )
            }
        }


        doc.setFont("times", "bold")
        doc.setFontSize(24)
        doc.setTextColor(0, 0, 0)
        doc.text("Research Paper Draft", pageWidth / 2, yPos, { align: "center" })
        yPos += 12

        doc.setFontSize(12)
        doc.setFont("times", "normal")
        doc.setTextColor(100)
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: "center" })
        yPos += 8
        doc.text("AI Research Agent v1.0", pageWidth / 2, yPos, { align: "center" })
        yPos += 20

        const drawSection = (title, content) => {
            if (!content) return
            const cleanedContent = cleanText(content)


            if (yPos > 250) {
                doc.addPage()
                yPos = 30
            }


            doc.setFont("times", "bold")
            doc.setFontSize(14)
            doc.setTextColor(0, 0, 0)
            doc.text(title.toUpperCase(), margin, yPos)
            yPos += 8


            doc.setDrawColor(200)
            doc.line(margin, yPos - 2, margin + 30, yPos - 2)

            doc.setFont("times", "normal")
            doc.setFontSize(12)
            doc.setTextColor(0, 0, 0)

            const lines = doc.splitTextToSize(cleanedContent, contentWidth)

            lines.forEach(line => {
                if (yPos > 275) {
                    doc.addPage()
                    yPos = 30
                }
                doc.text(line, margin, yPos)
                yPos += 7
            })

            yPos += 12
        }

        drawSection("Abstract", sections.abstract)
        drawSection("Methods", sections.methods)
        drawSection("Results", sections.results)


        if (sections.references) {
            if (yPos > 250) {
                doc.addPage()
                yPos = 30
            }
            doc.setFont("times", "bold")
            doc.setFontSize(14)
            doc.text("REFERENCES", margin, yPos)
            yPos += 10

            doc.setFont("times", "normal")
            doc.setFontSize(10)
            const refLines = doc.splitTextToSize(cleanText(sections.references), contentWidth)
            refLines.forEach(line => {
                if (yPos > 275) {
                    doc.addPage()
                    yPos = 30
                }
                doc.text(line, margin, yPos)
                yPos += 6
            })
        }

        addFooter()
        doc.save('research_paper_academic.pdf')
    }

    const handleExport = () => {
        const fullText = Object.entries(sections)
            .map(([key, value]) => {
                const title = key.charAt(0).toUpperCase() + key.slice(1)
                return `${title.toUpperCase()}\n\n${value}\n\n`
            })
            .join('\n')

        const blob = new Blob([fullText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'research_draft.txt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleCopyAll = () => {
        const fullText = Object.entries(sections)
            .map(([key, value]) => {
                const title = key.charAt(0).toUpperCase() + key.slice(1)
                return `${title.toUpperCase()}\n\n${value}\n\n`
            })
            .join('\n')

        navigator.clipboard.writeText(fullText)
            .then(() => alert('Full draft copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err))
    }

    const handleRevise = async () => {
        if (!feedback.trim()) return

        setIsRevising(true)
        try {
            await reviseDraft(feedback)
            setFeedback('')
            if (onUpdate) onUpdate()
            alert('Draft regenerated successfully!')
        } catch (error) {
            console.error('Error revising draft:', error)
            alert('Failed to regenerate draft. Check console for details.')
        } finally {
            setIsRevising(false)
        }
    }

    const totalWords = Object.values(sections)
        .join(' ')
        .split(' ')
        .filter(w => w).length

    return (
        <div>
            <div className="flex flex-between mb-lg" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <div>
                    <h2>📄 Generated Draft Preview</h2>
                    <p className="text-secondary">
                        Automatically generated research paper draft ({totalWords} words)
                    </p>
                </div>

                <div className="flex gap-sm">
                    <button onClick={handleCopyAll} className="btn btn-secondary">
                        📋 Copy All
                    </button>
                    <button onClick={handleExportPDF} className="btn btn-primary">
                        💾 Export as PDF
                    </button>
                </div>
            </div>

            {Object.values(sections).every(s => !s) ? (
                <div className="card text-center">
                    <p className="text-muted">No draft has been generated yet.</p>
                </div>
            ) : (
                <>
                    <div className="card" style={{ lineHeight: '1.8', marginBottom: 'var(--spacing-xl)' }}>
                        {}
                        {sections.abstract && (
                            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: 'var(--spacing-md)',
                                    color: 'var(--primary)',
                                    borderBottom: '2px solid var(--primary)',
                                    paddingBottom: 'var(--spacing-sm)'
                                }}>
                                    Abstract
                                </h3>
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {sections.abstract}
                                </div>
                            </div>
                        )}

                        {}
                        {sections.methods && (
                            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: 'var(--spacing-md)',
                                    color: 'var(--primary)',
                                    borderBottom: '2px solid var(--primary)',
                                    paddingBottom: 'var(--spacing-sm)'
                                }}>
                                    Methods
                                </h3>
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {sections.methods}
                                </div>
                            </div>
                        )}

                        {}
                        {sections.results && (
                            <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: 'var(--spacing-md)',
                                    color: 'var(--primary)',
                                    borderBottom: '2px solid var(--primary)',
                                    paddingBottom: 'var(--spacing-sm)'
                                }}>
                                    Results
                                </h3>
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {sections.results}
                                </div>
                            </div>
                        )}

                        {}
                        {sections.references && (
                            <div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: 'var(--spacing-md)',
                                    color: 'var(--primary)',
                                    borderBottom: '2px solid var(--primary)',
                                    paddingBottom: 'var(--spacing-sm)'
                                }}>
                                    References
                                </h3>
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem'
                                }}>
                                    {sections.references}
                                </div>
                            </div>
                        )}
                    </div>

                    {}
                    <div className="card" style={{ border: '2px solid var(--primary-light)' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>✨ Revise & Refine Draft</h3>
                        <p className="text-secondary mb-md">
                            Provide suggestions or changes you'd like to make to the draft above.
                        </p>
                        <textarea
                            className="form-input"
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                marginBottom: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--spacing-md)'
                            }}
                            placeholder="Example: 'Make the abstract more technical' or 'Focus more on the performance results'..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            disabled={isRevising}
                        />
                        <div className="flex flex-end">
                            <button
                                className={`btn btn-primary ${isRevising ? 'loading' : ''}`}
                                onClick={handleRevise}
                                disabled={isRevising || !feedback.trim()}
                                style={{ minWidth: '180px' }}
                            >
                                {isRevising ? 'Regenerating...' : '🚀 Regenerate Text'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default DraftPreview
