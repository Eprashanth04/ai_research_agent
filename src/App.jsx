import { useState, useEffect } from 'react'
import QueryForm from './components/QueryForm'
import PapersList from './components/PapersList'
import KeyFindings from './components/KeyFindings'
import SimilarityMatrix from './components/SimilarityMatrix'
import CommonEntities from './components/CommonEntities'
import SynthesisView from './components/SynthesisView'
import DraftPreview from './components/DraftPreview'
import ProgressIndicator from './components/ProgressIndicator'
import ProcessReport from './components/ProcessReport'
import { getPapers, getEntities, getSynthesis, getSimilarity, getDraft, getPDFs } from './services/api'

function App() {
    const [activeTab, setActiveTab] = useState('query')
    const [loading, setLoading] = useState(false)
    const [papers, setPapers] = useState([])
    const [entities, setEntities] = useState(null)
    const [synthesis, setSynthesis] = useState(null)
    const [similarity, setSimilarity] = useState(null)
    const [draft, setDraft] = useState(null)
    const [pdfs, setPdfs] = useState([])
    const [progress, setProgress] = useState(null)
    const [latestReport, setLatestReport] = useState(null)


    useEffect(() => {
        loadExistingData()
    }, [])

    const loadExistingData = async () => {
        setLoading(true)
        console.log('Loading existing data...')
        try {
            const [papersData, entitiesData, synthesisData, similarityData, draftData, pdfsData] = await Promise.all([
                getPapers(),
                getEntities(),
                getSynthesis(),
                getSimilarity(),
                getDraft(),
                getPDFs()
            ])

            setPapers(papersData || [])
            setEntities(entitiesData)
            setSynthesis(synthesisData)
            setSimilarity(similarityData)
            setDraft(draftData)
            setPdfs(pdfsData || [])


            if (papersData && papersData.length > 0 && activeTab === 'query') {
                setActiveTab('papers')
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleResearchComplete = (reportData) => {
        console.log('Report received in App:', reportData)
        if (reportData) setLatestReport(reportData)
        loadExistingData()
    }

    return (
        <div className="app">
            <header className="app-header">
                <h1>🔬 AI Research Agent</h1>
                <p className="text-secondary">Automated Research Paper Discovery & Analysis</p>
                {latestReport && (
                    <button
                        className="btn btn-secondary"
                        style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                        onClick={() => setLatestReport(null)}
                    >
                        🗑️ Clear Process Log
                    </button>
                )}
            </header>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'query' ? 'active' : ''}`}
                    onClick={() => setActiveTab('query')}
                >
                    New Query
                </button>
                <button
                    className={`tab ${activeTab === 'papers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('papers')}
                    disabled={papers.length === 0}
                >
                    Papers ({papers.length})
                </button>
                <button
                    className={`tab ${activeTab === 'findings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('findings')}
                    disabled={!similarity}
                >
                    Key Findings
                </button>
                <button
                    className={`tab ${activeTab === 'similarity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('similarity')}
                    disabled={!similarity}
                >
                    Similarity Analysis
                </button>
                <button
                    className={`tab ${activeTab === 'entities' ? 'active' : ''}`}
                    onClick={() => setActiveTab('entities')}
                    disabled={!entities}
                >
                    Common Entities
                </button>
                <button
                    className={`tab ${activeTab === 'synthesis' ? 'active' : ''}`}
                    onClick={() => setActiveTab('synthesis')}
                    disabled={!synthesis}
                >
                    Synthesis
                </button>
                <button
                    className={`tab ${activeTab === 'draft' ? 'active' : ''}`}
                    onClick={() => setActiveTab('draft')}
                    disabled={!draft}
                >
                    Draft Preview
                </button>
            </div>

            <main className="app-main fade-in">
                {progress && <ProgressIndicator progress={progress} />}

                {latestReport && activeTab !== 'query' && (
                    <ProcessReport report={latestReport} />
                )}

                {loading && (
                    <div className="card text-center">
                        <div className="spinner" style={{ margin: '0 auto', marginBottom: '1rem' }}></div>
                        <p className="text-secondary">Loading research data...</p>
                    </div>
                )}

                {!loading && activeTab === 'query' && (
                    <QueryForm
                        onComplete={handleResearchComplete}
                        onProgress={setProgress}
                    />
                )}

                {!loading && activeTab === 'papers' && (
                    <PapersList papers={papers} pdfs={pdfs} />
                )}

                {!loading && activeTab === 'findings' && similarity && (
                    <KeyFindings data={similarity} />
                )}

                {!loading && activeTab === 'similarity' && similarity && (
                    <SimilarityMatrix data={similarity} />
                )}

                {!loading && activeTab === 'entities' && entities && (
                    <CommonEntities data={entities} />
                )}

                {!loading && activeTab === 'synthesis' && synthesis && (
                    <SynthesisView data={synthesis} />
                )}

                {!loading && activeTab === 'draft' && draft && (
                    <DraftPreview data={draft} onUpdate={() => handleResearchComplete(null)} />
                )}
            </main>
        </div>
    )
}

export default App
