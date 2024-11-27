import React, { useState, useEffect } from 'react';
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
def connect_with_me():
    choice = input("How would you like to connect with me?\\nOptions: 'linkedin', 'email', 'github'\\nEnter your choice: ")
    
    if choice.lower() == 'linkedin':
        print("Opening LinkedIn profile...")
        import webbrowser
        webbrowser.open('https://www.linkedin.com/in/YOUR_LINKEDIN_USERNAME')
    elif choice.lower() == 'email':
        print("Opening email client...")
        import webbrowser
        webbrowser.open('mailto:YOUR_EMAIL@example.com')
    elif choice.lower() == 'github':
        print("Opening GitHub profile...")
        import webbrowser
        webbrowser.open('https://github.com/YOUR_GITHUB_USERNAME')
    else:
        print("Invalid choice! Please try again.")

connect_with_me()`;

export default function ContactMe() {
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState('');
    const [skulptLoaded, setSkulptLoaded] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load Skulpt
        const loadSkulpt = async () => {
            const skulptScript = document.createElement('script');
            const skulptStdlibScript = document.createElement('script');
            
            skulptScript.src = 'https://skulpt.org/js/skulpt.min.js';
            skulptStdlibScript.src = 'https://skulpt.org/js/skulpt-stdlib.js';
            
            document.head.appendChild(skulptScript);
            document.head.appendChild(skulptStdlibScript);

            skulptScript.onload = () => {
                skulptStdlibScript.onload = () => {
                    setSkulptLoaded(true);
                };
            };
        };

        loadSkulpt();
    }, []);

    const outf = (text) => {
        setOutput(prev => prev + text);
    };

    const builtinRead = (x) => {
        if (window.Sk.builtinFiles === undefined || 
            window.Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return window.Sk.builtinFiles["files"][x];
    };

    const handleRunCode = () => {
        setOutput('');
        
        if (!skulptLoaded) {
            setOutput('Please wait while Python is loading...');
            return;
        }

        window.Sk.configure({
            output: outf,
            read: builtinRead,
            __future__: window.Sk.python3,
            inputfun: (prompt) => {
                return new Promise((resolve) => {
                    setOutput(prev => prev + prompt);
                    const userInput = window.prompt(prompt);
                    resolve(userInput || '');
                });
            }
        });

        const myPromise = window.Sk.misceval.asyncToPromise(() => {
            return window.Sk.importMainWithBody("<stdin>", false, code, true);
        });

        myPromise.then(
            () => {
                // Code execution completed
            },
            (err) => {
                setOutput(prev => prev + '\\nError: ' + err.toString());
            }
        );
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
            </div>
        </div>
    );
}
