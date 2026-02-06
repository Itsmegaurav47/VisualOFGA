import React, {useEffect} from 'react';
import {Background, Controls, MiniMap, ReactFlow, useReactFlow,} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeEdgeProcessor from './NodeEdgeProcessor';
import TypeContainer from './components/TypeContainer';
import RelationNode from './components/RelationNode';
import OperatorNode from './components/OperatorNode';
import {generateSchema} from './utils/schemaUtils';

const nodeTypes = {typeContainer: TypeContainer, relationNode: RelationNode, operatorNode: OperatorNode};

export default function Flow({schema}) {
    const {nodes, edges, onNodesChange, onEdgesChange, onConnect} = NodeEdgeProcessor({schema});

    const reactFlowInstance = useReactFlow();

    useEffect(() => {
        const timeout = setTimeout(() => {
            reactFlowInstance.fitView({padding: 0.2});
        }, 0);
        return () => clearTimeout(timeout);
    }, [nodes, edges]);

    // TODO: Kept for future use
    const handleGenerateSchema = () => {
        const generatedSchema = generateSchema(nodes, edges);
        console.log('Generated Schema:', JSON.stringify(generatedSchema, null, 2));
    };

    return (
        <div className="h-full w-full">
          <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{hideAttribution: true}}
            >
                <MiniMap/>
                <Controls/>
                <Background variant="dots" gap={12} size={1}/>
                {/*<Panel position="top-left">OpenFGA Schema Visualization</Panel>*/}
                {/*<Panel position="top-right">*/}
                {/*  <button onClick={handleGenerateSchema}>Generate Schema</button>*/}
                {/*</Panel>*/}
            </ReactFlow>
        </div>
    );
}
