import React, { useState, useMemo, createContext, useContext } from 'react';
import { TrendingUp, FileText, FlaskConical, PenSquare, MessageSquare, Copy, Download, Info, Search, ChevronsUpDown, X, Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

//--- GLOBAL STATE & NAVIGATION CONTEXT ---//
const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [activePage, setActivePage] = useState('landing');
    const navigate = (page) => setActivePage(page);

    return (
        <AppContext.Provider value={{ activePage, navigate }}>
            {children}
        </AppContext.Provider>
    );
};

const useNav = () => useContext(AppContext);

//--- UTILITY: CONSENSUS CALCULATOR LOGIC (FINAL CORRECTION) ---//
const calculateConsensus = (C, D) => {
    // Validate inputs
    if (typeof C !== 'number' || typeof D !== 'number' || isNaN(C) || isNaN(D) || C < 1 || C > 5 || D < 0) {
        return { C: null, D: null, E: null, F: null, G: null, H: null, I: null, J: null, K: null, L: null, error: 'Invalid input. Mean (C) must be 1-5, Variance (D) must be non-negative.' };
    }

    // Step 1: Calculate intermediate variables
    const E = C > 3 ? 6 - C : C;
    const F = (E - 1) / 2;
    const G = Math.max(0, E - 2);
    const H = (D + E**2 - 3 * E + 2) / 2;
    const I = 2 * F**3 - G**3;

    // Step 2: Calculate J using the correct original formula
    let J;
    if (I === 0) {
        J = 0;
    } else if (H < F) {
        J = H**3 / 3;
    } else if (H < 2 * F) {
        J = (H**3 / 3) - Math.pow(H - F, 3);
    } else {
        J = 2 * F**3 + (Math.pow(H - 3 * F, 3)) / 3;
    }

    // Step 3: Calculate K using the correct original formula
    let K;
    if (I === 0) {
        K = 0;
    } else if (H < (3 * G) / 2) {
        K = (H**3 / 3) - 2 * Math.pow(H - G, 3);
    } else if (H < 2 * G) {
        K = G**3 + Math.pow(H - 2 * G, 3);
    } else {
        K = G**3;
    }
    
    // Step 4: Calculate the final Index of Disagreement (L)
    const L = I !== 0 ? (J - K) / I : 0;

    // Return all results
    return { C, D, E, F, G, H, I, J, K, L, error: null };
};


//--- UI COMPONENTS ---//

const NavItem = ({ icon: Icon, children, page }) => {
    const { activePage, navigate } = useNav();
    const isActive = activePage === page;
    return (
        <button
            onClick={() => navigate(page)}
            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out w-full text-left ${
                isActive
                    ? 'bg-teal-400/10 text-teal-300'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{children}</span>
        </button>
    );
};

const Header = () => {
    const { navigate } = useNav();
    const [isMenuOpen, setMenuOpen] = useState(false);

    const menuVariants = {
        closed: { opacity: 0, y: -20 },
        open: { opacity: 1, y: 0 },
    };
    
    const NavLinks = () => (
        <>
            <NavItem page="calculator" icon={FlaskConical}>Calculator</NavItem>
            <NavItem page="research" icon={FileText}>Research</NavItem>
            <NavItem page="hub" icon={PenSquare}>Research Hub</NavItem>
            <NavItem page="contact" icon={MessageSquare}>Contact</NavItem>
        </>
    );

    return (
        <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('landing')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wider">ConsCalc</h1>
                </div>

                <div className="hidden md:flex items-center space-x-2">
                    <NavLinks/>
                </div>
                
                <div className="md:hidden">
                    <button onClick={() => setMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-slate-300 hover:bg-slate-700">
                        {isMenuOpen ? <X/> : <Menu />}
                    </button>
                </div>
            </nav>
            <AnimatePresence>
            {isMenuOpen && (
                 <motion.div 
                    className="md:hidden bg-slate-900 border-t border-slate-700/50"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={menuVariants}
                 >
                    <div className="container mx-auto px-6 py-4 flex flex-col space-y-2" onClick={() => setMenuOpen(false)}>
                       <NavLinks/>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </header>
    );
};


const Footer = () => (
    <footer className="bg-slate-900/50 border-t border-slate-700/50 mt-24">
        <div className="container mx-auto px-6 py-8 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} ConsCalc Project. All Rights Reserved.</p>
            <p className="text-sm mt-2">An enhanced conceptual design for advancing consensus research.</p>
        </div>
    </footer>
);

const CustomTooltip = ({ text, children }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            {children}
            <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 w-48 bg-slate-900 border border-slate-600 text-slate-300 text-xs rounded-lg p-2 z-20 shadow-lg">
                    {text}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

/**
 * UPDATED GAUGE CHART COMPONENT
 * This version features a static gradient bar and an animated pointer that slides
 * to the indicated value. It also clamps the input value to a 0-1 range to
 * ensure the pointer never goes off the bar, fixing visual bugs with out-of-range results.
 * The gradient and labels have been reversed per user request.
 */
const GaugeChart = ({ value }) => {
    // Clamp the value to ensure it's always between 0 and 1 for visual representation.
    const clampedValue = Math.max(0, Math.min(1, value || 0));
    const percentage = clampedValue * 100;

    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center py-4">
            {/* Container for the bar and the pointer */}
            <div className="w-full relative">
                {/* Static gradient bar from Red (0, High Disagreement) to Green (1, High Consensus) */}
                <div className="h-2.5 bg-gradient-to-r from-red-500 via-yellow-400 to-green-400 rounded-full w-full shadow-inner"></div>

                {/* Animated pointer that slides along the bar */}
                <motion.div
                    className="absolute top-1/2"
                    initial={{ left: '0%' }}
                    animate={{ left: `${percentage}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                    {/* Pointer visual style: a white circle with a shadow, centered on the value */}
                    <div className="w-5 h-5 bg-white rounded-full shadow-lg border-2 border-slate-300 -translate-x-1/2 -translate-y-1/2 cursor-pointer"></div>
                </motion.div>
            </div>

            {/* Labels below the bar - SWAPPED */}
            <div className="flex justify-between w-full text-xs text-slate-400 mt-3">
                <span>High Disagreement</span>
                <span>High Consensus</span>
            </div>
        </div>
    );
};


//--- PAGE COMPONENTS ---//
const PageWrapper = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
        {children}
    </motion.div>
);

const LandingPage = () => {
    const { navigate } = useNav();
    return (
    <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4">
            <div className="absolute inset-0 bg-grid-slate-700/[0.05] bg-[bottom_1px_center] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]"></div>
            <div className="relative z-10">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-5xl md:text-7xl font-extrabold text-slate-100 tracking-tight"
                >
                    Quantify Agreement. <span className="text-teal-400">Instantly.</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="mt-6 max-w-2xl mx-auto text-lg text-slate-400"
                >
                    Introducing ConsCalc, a new paradigm for measuring consensus in research. Powered by a novel mathematical framework to derive the Index of Disagreement.
                </motion.p>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                    className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
                >
                    <button onClick={() => navigate('calculator')} className="w-full sm:w-auto bg-teal-400 text-slate-900 font-bold px-8 py-3 rounded-lg hover:bg-teal-300 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-teal-500/20">
                        Try the Calculator
                    </button>
                    <button onClick={() => navigate('research')} className="w-full sm:w-auto bg-transparent border-2 border-slate-600 text-slate-300 font-bold px-8 py-3 rounded-lg hover:bg-slate-800 hover:border-slate-500 transition-all duration-300">
                        Read the Research
                    </button>
                </motion.div>
            </div>
        </div>
    </PageWrapper>
    );
}

const CalculatorPage = () => {
    const [inputs, setInputs] = useState({ C: 5, D: 1.5 });
    const [showDetails, setShowDetails] = useState(false);
    const results = useMemo(() => calculateConsensus(inputs.C, inputs.D), [inputs.C, inputs.D]);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = value === '' ? '' : parseFloat(value);
        setInputs(prev => ({ ...prev, [name]: parsedValue }));
    };

    const tooltips = {
        E: "Transformed Mean (E): Normalizes the mean to a standard range (1-3) for consistent calculation.",
        F: "Upper Bound (F): Represents the maximum possible value in the transformed space.",
        G: "Lower Bound (G): Represents the minimum possible value in the transformed space.",
        H: "Transformed Variance (H): Adjusts the variance based on the transformed mean.",
        I: "Normalization Factor (I): A denominator used to scale the final index, based on the range (F, G).",
        J: "Cumulative Disagreement (J): An intermediate value calculating disagreement potential.",
        K: "Consensus Core (K): An intermediate value calculating agreement potential.",
    };

    const ResultCard = ({ label, value, tooltipText }) => (
        <motion.div 
            className="bg-slate-700/50 p-4 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400 font-medium">{label}</p>
                <CustomTooltip text={tooltipText}>
                    <Info className="w-4 h-4 text-slate-500 cursor-help" />
                </CustomTooltip>
            </div>
            <p className="text-2xl font-bold text-slate-200 mt-1">
                {value !== null && typeof value !== 'undefined' ? value.toFixed(4) : 'N/A'}
            </p>
        </motion.div>
    );

    return (
        <PageWrapper>
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-100">Consensus Calculator</h2>
                <p className="mt-4 max-w-2xl mx-auto text-slate-400">Enter the Mean (1-5 Likert) and Variance from your dataset to compute the Index of Disagreement. The result is visualized on the gauge below.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-8 rounded-xl shadow-2xl shadow-slate-900/50 self-start">
                    <h3 className="text-2xl font-bold text-white mb-6">Input Parameters</h3>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="C" className="block text-sm font-medium text-slate-300 mb-2">Mean (C)</label>
                            <input type="number" name="C" id="C" step="0.1" value={inputs.C} min="1" max="5" onChange={handleInputChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition" />
                        </div>
                        <div>
                            <label htmlFor="D" className="block text-sm font-medium text-slate-300 mb-2">Variance (D)</label>
                            <input type="number" name="D" id="D" step="0.1" value={inputs.D} min="0" onChange={handleInputChange} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition" />
                        </div>
                        {results.error && <p className="text-sm text-red-400 animate-pulse">{results.error}</p>}
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4 text-center">Index of Disagreement (L)</h3>
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-xl shadow-2xl shadow-teal-900/20">
                            <GaugeChart value={!results.error ? results.L : 0} />
                            <p className="text-6xl font-extrabold text-white mt-6 text-center">
                                {!results.error && results.L !== null ? results.L.toFixed(6) : '---'}
                            </p>
                        </div>
                    </div>
                    <div>
                        <button onClick={() => setShowDetails(!showDetails)} className="text-slate-300 hover:text-white transition font-medium flex items-center gap-2">
                           {showDetails ? 'Hide' : 'Show'} Detailed Steps 
                           <motion.span animate={{rotate: showDetails ? 90: 0}}> &rarr;</motion.span>
                        </button>
                         <AnimatePresence>
                        {showDetails && !results.error && (
                            <motion.div 
                                className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <ResultCard label="E" value={results.E} tooltipText={tooltips.E} />
                                <ResultCard label="F" value={results.F} tooltipText={tooltips.F} />
                                <ResultCard label="G" value={results.G} tooltipText={tooltips.G} />
                                <ResultCard label="H" value={results.H} tooltipText={tooltips.H} />
                                <ResultCard label="I" value={results.I} tooltipText={tooltips.I} />
                                <ResultCard label="J" value={results.J} tooltipText={tooltips.J} />
                                <ResultCard label="K" value={results.K} tooltipText={tooltips.K} />
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
        </PageWrapper>
    );
};

const ResearchPage = () => {
    const [activeCitation, setActiveCitation] = useState('APA');
    const [copySuccess, setCopySuccess] = useState('');

    const citations = {
        APA: "Researcher, A. (2025). The index of disagreement: A novel framework for consensus measurement. Journal of Advanced Quantitative Methods, 15(2), 123-145. https://doi.org/10.xxxx/j.jaqm.2025.xx.xxx",
        MLA: 'Researcher, Anonymous. "The Index of Disagreement: A Novel Framework for Consensus Measurement." Journal of Advanced Quantitative Methods, vol. 15, no. 2, 2025, pp. 123-45, doi:10.xxxx/j.jaqm.2025.xx.xxx.',
        BibTeX: `@article{researcher2025index,\n  title={The Index of Disagreement: A Novel Framework for Consensus Measurement},\n  author={Researcher, Anonymous},\n  journal={Journal of Advanced Quantitative Methods},\n  volume={15},\n  number={2},\n  pages={123--145},\n  year={2025},\n  publisher={Academic Press},\n  doi={10.xxxx/j.jaqm.2025.xx.xxx}\n}`
    };

    const copyToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopySuccess(activeCitation);
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
        document.body.removeChild(textArea);
    };

    const Section = ({ title, children }) => (
        <section className="mb-8">
            <h4 className="text-xl font-semibold text-teal-300 mb-3 border-b-2 border-teal-400/20 pb-2">{title}</h4>
            <div className="text-slate-300 leading-relaxed space-y-4">{children}</div>
        </section>
    );
    
    const Formula = ({ children }) => <div className="bg-slate-900/70 p-4 rounded-md my-2 text-center font-mono text-teal-300 border border-slate-700">{children}</div>;

    return (
        <PageWrapper>
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-slate-100">The Foundational Research</h2>
                    <p className="mt-4 text-slate-400">The theory and validation behind the ConsCalc model.</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 p-6 sm:p-8 rounded-xl shadow-lg">
                    <h3 className="text-2xl font-bold text-white mb-2">The Index of Disagreement: A Novel Framework for Consensus Measurement</h3>
                    <p className="text-slate-400 mb-8 font-medium">Journal of Advanced Quantitative Methods, 2025</p>
                    
                    <Section title="Abstract">
                        <p>This paper introduces a new mathematical framework for quantifying the level of disagreement within a group, termed the "Index of Disagreement" (L). Traditional measures of central tendency and dispersion, such as mean and variance, often fail to capture the nuances of agreement, particularly in skewed or bimodal distributions common in survey data. Our proposed model chain provides a multi-step, deterministic formula that translates mean (C) and variance (D) into a single, interpretable index.</p>
                    </Section>
                    <Section title="2. The Mathematical Model">
                        <p>The model is a sequential calculation starting from user-provided Mean (C) and Variance (D). The core idea is to transform these inputs into a standardized space to evaluate the distribution of disagreement.</p>
                        <Formula>E = IF(C &gt; 3, 6 - C, C)</Formula>
                        <p>This step normalizes the mean to a 1-3 scale.</p>
                        <Formula>F = (E - 1) / 2  and  G = MAX(0, E - 2)</Formula>
                        <p>These define the upper and lower bounds of the transformed space.</p>
                         <Formula>L = (J - K) / I</Formula>
                        <p>The final Index of Disagreement (L) is a normalized ratio of cumulative disagreement (J) and consensus potential (K), scaled by a normalization factor (I). A value of 0 indicates maximum consensus, while 1 indicates maximum disagreement.</p>
                    </Section>
                    {/* Other sections omitted for brevity but would follow this structure */}
                     <div className="mt-8">
                        <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-teal-400 text-slate-900 font-bold px-6 py-3 rounded-lg hover:bg-teal-300 transition-all shadow-lg shadow-teal-500/20">
                           <Download className="w-5 h-5"/> Download Full Paper (PDF)
                        </a>
                    </div>
                </div>

                 <div className="mt-12">
                    <h3 className="text-2xl font-bold text-white mb-4 text-center">Cite This Work</h3>
                    <div className="max-w-2xl mx-auto bg-slate-800/50 border border-slate-700 rounded-xl p-1">
                        <div className="flex justify-center bg-slate-800 rounded-t-lg">
                            {Object.keys(citations).map(format => (
                                <button key={format} onClick={() => setActiveCitation(format)} className={`px-4 sm:px-6 py-3 font-medium text-sm rounded-t-md transition relative ${activeCitation === format ? 'text-teal-300' : 'text-slate-400 hover:bg-slate-700/40'}`}>
                                    {format}
                                    {activeCitation === format && <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400" layoutId="underline" />}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 bg-slate-900/60 rounded-b-lg relative">
                            <pre className="text-slate-300 text-sm whitespace-pre-wrap break-words font-mono">{citations[activeCitation]}</pre>
                             <button onClick={() => copyToClipboard(citations[activeCitation])} className="absolute top-4 right-4 p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                                 {copySuccess === activeCitation ? <span className="text-teal-400 text-xs px-1">Copied!</span> : <Copy className="w-5 h-5 text-slate-400"/>}
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </PageWrapper>
    );
};


const HubPage = () => {
    const [submitted, setSubmitted] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    
    const publications = useMemo(() => [
        { title: 'A Bayesian Approach to Measuring Group Agreement', authors: 'Smith, J. & Williams, A.', journal: 'Statistics in Society', year: 2024, doi: '10.xxxx/stats.2024.01' },
        { title: 'Entropy-based Consensus Quantification in Multi-Agent Systems', authors: 'Chen, L. et al.', journal: 'IEEE Transactions on Cybernetics', year: 2023, doi: '10.xxxx/cyber.2023.02' },
        { title: 'The Limits of Variance as a Disagreement Proxy', authors: 'Garcia, M.', journal: 'Sociological Methods & Research', year: 2022, doi: '10.xxxx/socmeth.2022.03' },
        { title: 'Polarization and Agreement: A Network Perspective', authors: 'Kim, P.', journal: 'Journal of Social Structures', year: 2024, doi: '10.xxxx/joss.2024.04' },
        { title: 'Measuring Inter-Rater Reliability with Complex Data', authors: 'Davis, R. & Patel, S.', journal: 'Journal of Modern Statistics', year: 2021, doi: '10.xxxx/jmodstat.2021.05' },
        { title: 'A Unified Framework for Agreement Indices', authors: 'Thompson, E.', journal: 'Psychometrika', year: 2022, doi: '10.xxxx/psycho.2022.06' },
    ], []);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            e.target.reset();
        }, 5000);
    };

    const filteredAndSortedPubs = useMemo(() => {
        return publications
            .filter(pub => 
                pub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                pub.authors.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => sortOrder === 'desc' ? b.year - a.year : a.year - b.year);
    }, [publications, searchTerm, sortOrder]);
    
    const pubDataByYear = useMemo(() => {
        const counts = publications.reduce((acc, pub) => {
            acc[pub.year] = (acc[pub.year] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(year => ({ year, count: counts[year] })).sort((a,b) => a.year - b.year);
    }, [publications]);

    return (
        <PageWrapper>
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-100">Research Hub</h2>
                <p className="mt-4 max-w-2xl mx-auto text-slate-400">A community-curated library of publications on consensus and agreement measurement.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                <div className="lg:col-span-3">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                            <input 
                                type="text"
                                placeholder="Search by title or author..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-1 focus:ring-teal-400 outline-none"
                            />
                        </div>
                        <div className="relative">
                            <select 
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="appearance-none w-full sm:w-auto bg-slate-800/80 border border-slate-700 rounded-lg pl-4 pr-10 py-2.5 text-white focus:ring-1 focus:ring-teal-400 outline-none"
                            >
                                <option value="desc">Year: Newest</option>
                                <option value="asc">Year: Oldest</option>
                            </select>
                            <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"/>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <AnimatePresence>
                        {filteredAndSortedPubs.length > 0 ? filteredAndSortedPubs.map((pub, index) => (
                             <motion.div 
                                key={pub.doi}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-slate-800/50 border border-slate-700 p-5 rounded-lg transition-all hover:border-teal-400/50 hover:bg-slate-800"
                            >
                                 <h4 className="font-semibold text-teal-300">{pub.title}</h4>
                                 <p className="text-sm text-slate-300 mt-1">{pub.authors}</p>
                                 <p className="text-xs text-slate-500 mt-1">{pub.journal}, {pub.year}</p>
                             </motion.div>
                        )) : <p className="text-slate-400 text-center py-8">No publications found.</p>}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-xl shadow-lg sticky top-28">
                         <h3 className="text-2xl font-bold text-white mb-6">Publications Per Year</h3>
                         <div className="h-40 mb-8">
                             <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={pubDataByYear} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                     <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} />
                                     <YAxis stroke="#94a3b8" fontSize={12} />
                                     <RechartsTooltip cursor={{fill: 'rgba(14, 165, 233, 0.1)'}} contentStyle={{backgroundColor: '#1e293b', border: '1px solid #334155', color: '#cbd5e1'}}/>
                                     <Bar dataKey="count" name="Publications">
                                         {pubDataByYear.map((entry, index) => (
                                             <Cell key={`cell-${index}`} fill="#2dd4bf" />
                                         ))}
                                     </Bar>
                                 </BarChart>
                             </ResponsiveContainer>
                         </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-6 pt-6 border-t border-slate-700">Submit Your Work</h3>
                        <AnimatePresence mode="wait">
                        {submitted ? (
                            <motion.div
                                key="thank-you"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center p-8 bg-teal-400/10 rounded-lg"
                            >
                                <h4 className="font-bold text-teal-300">Thank you!</h4>
                                <p className="text-slate-300 mt-2 text-sm">Your publication has been submitted for review.</p>
                            </motion.div>
                        ) : (
                            <motion.form key="form" onSubmit={handleSubmit} className="space-y-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div><label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">Title</label><input type="text" id="title" required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-white focus:ring-1 focus:ring-teal-400 outline-none" /></div>
                                <div><label htmlFor="authors" className="block text-sm font-medium text-slate-300 mb-1">Author(s)</label><input type="text" id="authors" required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-white focus:ring-1 focus:ring-teal-400 outline-none" /></div>
                                <div><label htmlFor="doi" className="block text-sm font-medium text-slate-300 mb-1">Link (DOI Preferred)</label><input type="url" id="doi" required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-white focus:ring-1 focus:ring-teal-400 outline-none" /></div>
                                <button type="submit" className="w-full bg-teal-400 text-slate-900 font-bold py-3 rounded-lg hover:bg-teal-300 transition-all">Submit Publication</button>
                            </motion.form>
                        )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
        </PageWrapper>
    );
};

const ContactPage = () => {
    const [status, setStatus] = useState('idle');

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('submitting');
        // Fake delay
        setTimeout(() => {
            setStatus('success');
            e.target.reset();
             setTimeout(() => setStatus('idle'), 5000);
        }, 1500);
    };

    return (
        <PageWrapper>
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-slate-100">Get In Touch</h2>
                <p className="mt-4 max-w-2xl mx-auto text-slate-400">Have questions, feedback, or want to collaborate? Reach out to us.</p>
            </div>
            <div className="max-w-lg mx-auto bg-slate-800/50 border border-slate-700 p-8 rounded-xl shadow-lg">
                <AnimatePresence mode="wait">
                {status === 'success' ? (
                     <motion.div
                        key="thank-you"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center p-8 bg-teal-400/10 rounded-lg">
                        <h4 className="font-bold text-teal-300">Message Sent!</h4>
                        <p className="text-slate-300 mt-2 text-sm">Thanks for contacting us. We'll get back to you shortly.</p>
                    </motion.div>
                ) : (
                    <motion.form 
                        key="contact-form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6">
                        <div><label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Name</label><input type="text" id="name" required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-1 focus:ring-teal-400 outline-none" /></div>
                        <div><label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label><input type="email" id="email" required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-1 focus:ring-teal-400 outline-none" /></div>
                        <div><label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Message</label><textarea id="message" rows="4" required className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white focus:ring-1 focus:ring-teal-400 outline-none"></textarea></div>
                        <button type="submit" disabled={status === 'submitting'} className="w-full bg-teal-400 text-slate-900 font-bold py-3 rounded-lg hover:bg-teal-300 transition-all disabled:bg-slate-500">
                           {status === 'submitting' ? 'Sending...' : 'Send Message'}
                        </button>
                    </motion.form>
                )}
                </AnimatePresence>
            </div>
        </div>
        </PageWrapper>
    );
};


//--- MAIN APP COMPONENT ---//
function AppContent() {
    const { activePage } = useNav();

    const renderPage = () => {
        switch (activePage) {
            case 'landing': return <LandingPage />;
            case 'calculator': return <CalculatorPage />;
            case 'research': return <ResearchPage />;
            case 'hub': return <HubPage />;
            case 'contact': return <ContactPage />;
            default: return <LandingPage />;
        }
    };

    return (
        <div className="bg-slate-900 text-slate-300 min-h-screen font-sans">
            <style>{`
                .bg-grid-slate-700\/\\[0\\.05\\] { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(51 65 85 / 0.2)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e"); }
                body { background-color: #0f172a; } /* Match body bg to prevent flashes */
                #root { height: 100%; }
            `}</style>
            
            <Header />
            
            <main className="min-h-[calc(100vh-150px)]">
                <AnimatePresence mode="wait">
                    {/* By adding a key, AnimatePresence knows it's a new component and can animate the exit/enter */}
                    {React.cloneElement(renderPage(), { key: activePage })}
                </AnimatePresence>
            </main>
            
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}
