import {ReactFlowProvider} from '@xyflow/react';
import Flow from "../Flow.jsx";

export default function FlowWrapper({schema}) {
    return (
        <ReactFlowProvider>
            <Flow schema={schema}/>
        </ReactFlowProvider>
    );
}
