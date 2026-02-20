function SynthesisView({ data }) {
    const totalPapers = data.total_papers || 0
    const datasets = data.common_datasets || {}
    const methods = data.common_methods || {}


    const getTopItems = (obj, limit = 5) => {
        return Object.entries(obj)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
    }

    const topDatasets = getTopItems(datasets)
    const topMethods = getTopItems(methods)

    return (
        <div>
            <h2>📝 Research Synthesis</h2>
            <p className="text-secondary mb-lg">
                Aggregated insights from {totalPapers} analyzed papers
            </p>

            <div className="grid grid-3 mb-lg">
                <div className="card text-center">
                    <h3 style={{ fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                        {totalPapers}
                    </h3>
                    <p className="text-secondary" style={{ margin: 0 }}>Papers Analyzed</p>
                </div>
                <div className="card text-center">
                    <h3 style={{ fontSize: '3rem', color: 'var(--accent-success)', marginBottom: '0.5rem' }}>
                        {Object.keys(datasets).length}
                    </h3>
                    <p className="text-secondary" style={{ margin: 0 }}>Unique Datasets</p>
                </div>
                <div className="card text-center">
                    <h3 style={{ fontSize: '3rem', color: 'var(--accent-warning)', marginBottom: '0.5rem' }}>
                        {Object.keys(methods).length}
                    </h3>
                    <p className="text-secondary" style={{ margin: 0 }}>Unique Methods</p>
                </div>
            </div>

            <div className="grid grid-2">
                <div className="card">
                    <h3>💾 Most Used Datasets</h3>
                    {topDatasets.length > 0 ? (
                        <div className="flex flex-col gap-sm">
                            {topDatasets.map(([name, count], index) => (
                                <div key={index} className="flex flex-between" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                                    <span>{name}</span>
                                    <span className="badge badge-primary">{count} papers</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted">No dataset data available.</p>
                    )}
                </div>

                <div className="card">
                    <h3>⚙️ Dominant Methods</h3>
                    {topMethods.length > 0 ? (
                        <div className="flex flex-col gap-sm">
                            {topMethods.map(([name, count], index) => (
                                <div key={index} className="flex flex-between" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                                    <span>{name}</span>
                                    <span className="badge badge-success">{count} papers</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted">No method data available.</p>
                    )}
                </div>
            </div>

            <div className="card mt-lg">
                <h3>🧠 Analysis Summary</h3>
                <p className="text-secondary">
                    The analysis identified {Object.keys(methods).length} distinct methodological approaches applied across {Object.keys(datasets).length} different benchmarks.
                    {topMethods.length > 0 && `The most prevalent technique is "${topMethods[0][0]}" (used in ${topMethods[0][1]} papers).`}
                    {topDatasets.length > 0 && ` Evaluation frequently relies on "${topDatasets[0][0]}" (cited in ${topDatasets[0][1]} studies).`}
                </p>
            </div>
        </div>
    )
}


export default SynthesisView
