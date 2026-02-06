import React from 'react';
import { Handle } from '@xyflow/react';

const OperatorNode = ({ id, data }) => {
  let handles = [];
  if (data.label === 'and' || data.label === 'or') {
    handles = [
      <Handle key="output" type="source" position="right" id="output" style={{ top: '50%', transform: 'translateY(-50%)' }} />,
      <Handle key="input1" type="target" position="left" id="input1" style={{ top: '30%', background: 'blue' }} />,
      <Handle key="input2" type="target" position="left" id="input2" style={{ top: '70%', background: 'green' }} />,
    ];
  } else if (data.label === 'butnot') {
    handles = [
      <Handle key="output" type="source" position="right" id="output" style={{ top: '50%', transform: 'translateY(-50%)' }} />,
      <Handle key="base" type="target" position="left" id="base" style={{ top: '30%' }} />,
      <Handle key="subtract" type="target" position="left" id="subtract" style={{ top: '70%' }} />,
    ];
  }
  return (
    <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', position: 'relative' }}>
      {handles}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{data.label}</div>
    </div>
  );
};

export default OperatorNode;