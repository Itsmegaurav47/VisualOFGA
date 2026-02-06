import React from 'react';
import { Handle } from '@xyflow/react';

const RelationNode = ({ id, data }) => (
  <div className="relation-node">
    <Handle type="target" position="left" id="target" />
    <Handle type="source" position="right" id="source" />
    {data.label}
  </div>
);

export default RelationNode;