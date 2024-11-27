import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './contact.module.css';

// Dynamically import CodeMirror with no SSR
const CodeMirror = dynamic(
    async () => {
        await Promise.all([
            import('codemirror/lib/codemirror.css'),
            import('codemirror/theme/material.css'),
            import('codemirror/mode/python/python')
        ]);
        const { UnControlled } = await import('react-codemirror2');
        return UnControlled;
    },
    { ssr: false }
);

const initialCode = `# Run this code to connect with me!
import webbrowser

def open_link(choice):
    links = {
        1: "mailto:mishravinamra5@gmail.com",
        2: "https://wa.me/+919173255769",
        3: "https://www.linkedin.com/in/vinamra-mishra-10597420a/"
    }
    webbrowser.open(links.get(choice, "Invalid choice"))

print("Choose an option:")
print("1: Open email to mishravinamra5@gmail.com")
print("2: Open WhatsApp to +919173255769")
print("3: Open LinkedIn profile of Vinamra Mishra")

choice = int(input("Enter 1, 2, or 3: "))
open_link(choice)`;

export default function ContactMe() {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState('');
    const [skulptLoaded, setSkulptLoaded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [waitingForInput, setWaitingForInput] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [inputPrompt, setInputPrompt] = useState('');
    const [inputResolve, setInputResolve] = useState(null);
    const inputRef = useRef(null);
    const loadingRef = useRef(false);

    useEffect(() => {
        setMounted(true);

        const loadSkulpt = async () => {
            if (loadingRef.current || window.Sk) return;
            loadingRef.current = true;

            try {
                // Load Skulpt main
                const skulptScript = document.createElement('script');
                skulptScript.src = 'https://skulpt.org/js/skulpt.min.js';
                
                await new Promise((resolve, reject) => {
                    skulptScript.onload = resolve;
                    skulptScript.onerror = reject;
                    document.head.appendChild(skulptScript);
                });

                // Load Skulpt stdlib
                const stdlibScript = document.createElement('script');
                stdlibScript.src = 'https://skulpt.org/js/skulpt-stdlib.js';
                
                await new Promise((resolve, reject) => {
                    stdlibScript.onload = () => {
                        setSkulptLoaded(true);
                        resolve();
                    };
                    stdlibScript.onerror = reject;
                    document.head.appendChild(stdlibScript);
                });

            } catch (error) {
                console.error('Error loading Skulpt:', error);
                setOutput('Failed to load Python runtime. Please refresh and try again.');
            } finally {
                loadingRef.current = false;
            }
        };

        loadSkulpt();

        return () => {
            loadingRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (waitingForInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [waitingForInput]);

    const outf = (text) => {
        setOutput(prev => prev + text);
    };

    const builtinRead = (x) => {
        if (window.Sk.builtinFiles === undefined || 
            window.Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return window.Sk.builtinFiles["files"][x];
    };

    const handleInput = (e) => {
        if (e.key === 'Enter' && waitingForInput && inputResolve) {
            e.preventDefault();
            const value = userInput;
            setOutput(prev => prev + value + '\\n');
            setUserInput('');
            setWaitingForInput(false);
            setInputPrompt('');
            inputResolve(value);
            setInputResolve(null);
        }
    };

    const handleRunCode = async () => {
        setOutput('');
        setWaitingForInput(false);
        setUserInput('');
        setInputPrompt('');
        
        if (!window.Sk) {
            // Try loading Skulpt again if it's not loaded
            try {
                setOutput('Loading Python runtime...');
                await new Promise((resolve) => setTimeout(resolve, 1000));
                if (!window.Sk) {
                    setOutput('Error: Python runtime not loaded. Please refresh the page and try again.');
                    return;
                }
            } catch (error) {
                setOutput('Error: Failed to load Python runtime.');
                return;
            }
        }

        try {
            window.Sk.configure({
                output: outf,
                read: builtinRead,
                __future__: window.Sk.python3,
                inputfun: (prompt) => {
                    return new Promise((resolve) => {
                        setWaitingForInput(true);
                        setInputPrompt(prompt);
                        setInputResolve(() => resolve);
                    });
                }
            });

            const myPromise = window.Sk.misceval.asyncToPromise(() => {
                return window.Sk.importMainWithBody("<stdin>", false, code, true);
            });

            await myPromise;
        } catch (error) {
            setOutput(prev => prev + '\\nError: ' + error.toString());
        }
    };

    if (!mounted) {
        return (
            <div className={styles.container}>
                <div className={styles.editorContainer}>
                    <div className={styles.loadingEditor}>
                        Loading editor...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.editorContainer}>
                <CodeMirror
                    value={code}
                    options={{
                        mode: 'python',
                        theme: 'material',
                        lineNumbers: true,
                        lineWrapping: true,
                        viewportMargin: Infinity,
                    }}
                    onChange={(editor, data, value) => {
                        setCode(value);
                    }}
                />
                <button onClick={handleRunCode} className={styles.runButton}>
                    Run Code
                </button>
            </div>
            <div className={styles.terminal}>
                <pre className={styles.terminalOutput}>{output}</pre>
                {waitingForInput && (
                    <div className={styles.terminalInputContainer}>
                        <span className={styles.terminalPrompt}>{inputPrompt}</span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleInput}
                            className={styles.terminalInput}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
