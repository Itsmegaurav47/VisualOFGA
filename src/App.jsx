import React, {useState} from 'react';
import './App.css';
import EditorPanel from "./components/EditorPanel.jsx";
import GraphPanel from "./components/GraphPanel.jsx";
import {parseDslToJson} from "./utils/parseDsltoJson.js";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";

export default function App() {
    const [dsl, setDsl] = useState('');
    const [schema, setSchema] = useState(null);
    const [error, setError] = useState(null);

    const handleSave = () => {
        try {
            const json = parseDslToJson(dsl);
            setSchema(json);
            setError(null);
        } catch (err) {
            setSchema(null);
            setError("Invalid DSL: " + err.message);
        }
    };

    return (
        <div className="h-screen bg-gray-950">
            <PanelGroup direction="horizontal">

                {/* Left Panel: Editor */}
                <Panel defaultSize={40} minSize={20}>
                    <EditorPanel dsl={dsl} setDsl={setDsl} onSave={handleSave} error={error}/>
                </Panel>

                {/* Draggable Resizer */}
                <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-gray-500 cursor-col-resize"/>

                {/* Right Panel: Graph */}
                <Panel defaultSize={70} minSize={20}>
                    <GraphPanel schema={schema}/>
                </Panel>

            </PanelGroup>
        </div>
    );


}