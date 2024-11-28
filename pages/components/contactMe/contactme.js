import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './contact.module.css';
import { INITIAL_PYTHON_CODE } from '../../../utils/constants';
import { useSkulpt } from '../../../utils/useSkulpt';

const CodeMirror = dynamic(
    async () => {
        await Promise.all([
            import('codemirror/lib/codemirror.css'),
            import('codemirror/theme/material-ocean.css'),
            import('codemirror/mode/python/python')
        ]);
        const { Controlled } = await import('react-codemirror2');
        return Controlled;
    },
    { ssr: false }
);

const TABS = {
    EDITOR: 'editor',
    TERMINAL: 'terminal'
};

export default function ContactMe() {
    const [code, setCode] = useState(INITIAL_PYTHON_CODE);
    const [output, setOutput] = useState('');
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState(TABS.EDITOR);
    const [inputState, setInputState] = useState({
        waiting: false,
        value: '',
        prompt: '',
        resolve: null
    });
    const inputRef = useRef(null);
    const { skulptLoaded } = useSkulpt();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (inputState.waiting && inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputState.waiting]);

    const handleInput = (e) => {
        if (e.key === 'Enter' && inputState.waiting && inputState.resolve) {
            e.preventDefault();
            const value = inputState.value;
            setOutput(prev => prev + value + '\n');
            setInputState({
                waiting: false,
                value: '',
                prompt: '',
                resolve: null
            });
            inputState.resolve(value);
        }
    };

    const configureSkulpt = () => {
        if (!window.Sk) throw new Error('Python runtime not loaded');

        window.Sk.configure({
            output: text => setOutput(prev => prev + text),
            read: x => {
                if (!window.Sk.builtinFiles?.["files"]?.[x]) {
                    throw new Error(`File not found: '${x}'`);
                }
                return window.Sk.builtinFiles["files"][x];
            },
            __future__: window.Sk.python3,
            inputfun: prompt => {
                return new Promise(resolve => {
                    setInputState({
                        waiting: true,
                        value: '',
                        prompt,
                        resolve
                    });
                });
            }
        });
    };

    const handleRunCode = async () => {
        setOutput('');
        setInputState({
            waiting: false,
            value: '',
            prompt: '',
            resolve: null
        });
        setActiveTab(TABS.TERMINAL);

        try {
            if (!skulptLoaded) {
                throw new Error('Python runtime not loaded. Please refresh the page.');
            }

            configureSkulpt();
            await window.Sk.misceval.asyncToPromise(() => {
                return window.Sk.importMainWithBody("<stdin>", false, code, true);
            });
        } catch (error) {
            setOutput(prev => `${prev}\nError: ${error.message}`);
        }
    };

    if (!mounted) {
        return (
            <div className={styles.container}>
                <div className={styles.codeBox}>
                    <div className={styles.loadingEditor}>Loading editor...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.codeBoxWrapper}>
                <div className={styles.codeBox}>
                    <div className={styles.windowControls}>
                        <div className={`${styles.windowButton} ${styles.closeButton}`}></div>
                        <div className={`${styles.windowButton} ${styles.minimizeButton}`}></div>
                        <div className={`${styles.windowButton} ${styles.maximizeButton}`}></div>
                        <span className={styles.windowTitle}>Connect with Me</span>
                    </div>
                    <div className={styles.tabHeader}>
                        <button
                            className={`${styles.tab} ${activeTab === TABS.EDITOR ? styles.active : ''}`}
                            onClick={() => setActiveTab(TABS.EDITOR)}
                        >
                            Code Editor
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === TABS.TERMINAL ? styles.active : ''}`}
                            onClick={() => setActiveTab(TABS.TERMINAL)}
                        >
                            Terminal
                        </button>
                    </div>
                    <div className={styles.tabContent}>
                        {activeTab === TABS.EDITOR ? (
                            <div className={styles.editorContainer}>
                                <div className={styles.editorWrapper}>
                                    <CodeMirror
                                        value={code}
                                        options={{
                                            mode: 'python',
                                            theme: 'material-ocean',
                                            lineNumbers: false,
                                            lineWrapping: true,
                                            viewportMargin: Infinity,
                                        }}
                                        onBeforeChange={(editor, data, value) => {
                                            setCode(value);
                                        }}
                                        preserveScrollPosition={true}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={styles.terminal}>
                                <pre className={styles.terminalOutput}>{output}</pre>
                                {inputState.waiting && (
                                    <div className={styles.terminalInputContainer}>
                                        <span className={styles.terminalPrompt}>&gt; {inputState.prompt}</span>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={inputState.value}
                                            onChange={(e) => setInputState(prev => ({ ...prev, value: e.target.value }))}
                                            onKeyPress={handleInput}
                                            className={styles.terminalInput}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.buttonWrapper}>
                    <div className={styles.buttonShadow}></div>
                    <button
                        onClick={handleRunCode}
                        className={styles.runButton}
                        disabled={!skulptLoaded}
                    >
                        Run Code
                    </button>
                </div>
            </div>
        </div>
    );
}
