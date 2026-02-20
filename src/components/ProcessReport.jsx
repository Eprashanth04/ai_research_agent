import React from 'react';

function ProcessReport({ report }) {
    if (!report) return null;

    return (
        <div className="card fade-in" style={{
            border: '1px solid var(--primary-light)',
            background: 'rgba(51, 102, 204, 0.05)',
            marginBottom: 'var(--spacing-xl)'
        }}>
            <div className="flex flex-between mb-md">
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📊 Process Summary
                </h3>
                <span className="badge badge-success">Completed</span>
            </div>

            <p className="text-secondary mb-md" style={{ fontSize: '0.9rem' }}>
                The following automated steps were executed successfully:
            </p>

            <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 var(--spacing-lg) 0',
                display: 'grid',
                gap: 'var(--spacing-sm)'
            }}>
                {report.steps.map((step, index) => (
                    <li key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.95rem'
                    }}>
                        <span style={{ color: 'var(--primary)' }}>✔</span>
                        {step}
                    </li>
                ))}
            </ul>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-md)',
                paddingTop: 'var(--spacing-md)',
                borderTop: '1px solid rgba(0,0,0,0.1)'
            }}>
                <div className="text-center">
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{report.metrics.total_papers}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Papers Fetched</div>
                </div>
                <div className="text-center">
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{report.metrics.entities_extracted}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Entities Found</div>
                </div>
                <div className="text-center">
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{report.metrics.similarity_comparisons}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Comparisons</div>
                </div>
                <div className="text-center">
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{report.metrics.draft_generated ? 'Yes' : 'No'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Draft Created</div>
                </div>
            </div>
        </div>
    );
}

export default ProcessReport;
