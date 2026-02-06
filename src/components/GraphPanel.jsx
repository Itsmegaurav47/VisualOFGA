import React from 'react';
import FlowWrapper from "./FlowWrapper.jsx";

export default function GraphPanel({schema}) {
    return (
        <div className="h-full p-4 flex flex-col">
            <div className="text-md font-semibold text-gray-300 mb-2">OpenFGA SCHEMA VISUALIZATION</div>
            <div className="flex-1 bg-gray-200 rounded-lg">
                {schema ? <FlowWrapper schema={schema}/> : <div className="p-4 text-gray-500">No schema loaded.</div>}
            </div>
        </div>
    );
}
