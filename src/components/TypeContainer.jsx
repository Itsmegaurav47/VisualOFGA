import React from 'react';
import {Handle} from '@xyflow/react';

const TypeContainer = ({ id, data, children }) => (
    <div>
      <Handle type="target" position="left" id="target" />
      <Handle type="source" position="right" id="source" />
      <div className="font-bold">{data.label}</div>
      {children}
    </div>
  );

export default TypeContainer;
