import React from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({dsl, setDsl}) {
    return (
        <Editor
            height="100%"
            language="plaintext"
            theme="vs-dark"
            value={dsl}
            onChange={(value) => setDsl(value)}
            options={{
                fontSize: 14,
                minimap: {enabled: false},
                wordWrap: 'on',
                scrollBeyondLastLine: false,
            }}
        />
    );
}
