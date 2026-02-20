function KeyFindings({ data }) {

    const keyFindingsObj = data.key_findings || {}


    const findings = Object.entries(keyFindingsObj).map(([paper, findingsList]) => ({
        paper,
        findings: Array.isArray(findingsList) ? findingsList : []
    }))

    const categoryColors = {
        'we propose': 'primary',
        'our method': 'success',
        'our approach': 'success',
        'we demonstrate': 'warning',
        'outperforms': 'primary',
        'achieves': 'success',
    }

    const getColor = (finding) => {
        const lower = finding.toLowerCase()
        for (const [key, color] of Object.entries(categoryColors)) {
            if (lower.includes(key)) return color
        }
        return 'primary'
    }

    return (
        <div>
            <h2>💡 Key Findings Across Papers</h2>
            <p className="text-secondary mb-lg">
                Extracted significant findings and claims from all analyzed papers
            </p>

            <div className="grid">
                {findings.map((item, index) => (
                    <div key={index} className="card">
                        <div className="flex flex-between mb-md" style={{ alignItems: 'flex-start' }}>
                            <h3 style={{ fontSize: '1rem', flex: 1 }}>
                                {item.paper || `Paper ${index + 1}`}
                            </h3>
                            <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                                {item.findings.length} findings
                            </span>
                        </div>

                        {item.findings && item.findings.length > 0 ? (
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                {item.findings.map((finding, fIdx) => (
                                    <span
                                        key={fIdx}
                                        className={`badge badge-${getColor(finding)}`}
                                        style={{ fontSize: '0.8rem' }}
                                    >
                                        {finding}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>
                                None found from predefined phrases
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {findings.length === 0 && (
                <div className="card text-center">
                    <p className="text-muted">No key findings extracted yet.</p>
                </div>
            )}
        </div>
    )
}

export default KeyFindings
