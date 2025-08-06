// components/CustomNode.jsx
import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import closeIcon from '../assets/delAuto.png';

function CustomNode({ id, data }) {
  return (
    <div className={`node-box ${data.type === 'event' ? 'node-event' : 'node-template'}`}>
      <div className="node-inner">
        <span className="node-tag">{data.type === 'event' ? 'IF' : 'THEN'}</span>
        <span className="node-label">{data.label}</span>
        <span
  className="close-x"
  onClick={(e) => {
    e.stopPropagation(); // don't trigger node dragging
    console.log('❌ clicked:', data.label); // debug log
    data.onDelete(); // fire delete modal
  }}
>
  <img src={closeIcon} alt="x" />
</span>

      </div>
      <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#ccc', width: 8, height: 8 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#ccc', width: 8, height: 8 }}
        />
    </div>
  );
}

export default memo(CustomNode);
