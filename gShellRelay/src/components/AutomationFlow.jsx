import ReactFlow, { Background, Controls, applyNodeChanges } from 'reactflow';
import { useEffect, useState, useMemo } from 'react';

import '../styles/AutomationFlow.css';
import 'reactflow/dist/style.css';

import closeIcon from '../assets/delAuto.png';

import CustomNode from './CustomNode';
import ChangeApp from './changeApp';

export default function AutomationFlow({ 
    apiKey, 
    appName, 
    automations = [], 
    setSelectedNode, 
    setShowAddModal, 
    onDeleteSuccess,
    selectedApp,        // ✅ ADD THIS PROP
    setSelectedApp      // ✅ ADD THIS PROP
}) {
    const flowKey = automations.map(a => a.id).join('-') || 'empty';
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [isSureOpen, setIsSureOpen] = useState(false);
    const [nodeToDelete, setNodeToDelete] = useState(null);
    
    const nodeTypes = useMemo(() => ({
        customNode: CustomNode
    }), []);

    const handleNodeClick = (_, node) => {
        if (node?.data?.rowData) {
            setSelectedNode({
                ...node.data.rowData
            });
            setShowAddModal(true);
        }
    };

    const baseURL = "https://gshell.cloud";



    useEffect(() => {
        console.log('AutomationFlow received automations:', automations);

        const newNodes = [];
        const newEdges = [];

        // ✅ CHANGED: Using automations prop instead of theAutomations state
        automations.forEach((row, i) => {
            if (!row.id) {
                console.warn('Skipping row with missing ID:', row);
                return;
            }
            
            const eventId = `event-${row.id}`;
            const templateId = `template-${row.id}`;
            
            newNodes.push(
                {
                    id: eventId,
                    type: 'customNode',
                    position: { x: 100, y: i * 150 },
                    data: {
                        type: 'event',
                        label: row.trigger || `${row.thing}.${row.action} === ${row.value}`,
                        rowData: row,
                        onDelete: () => setNodeToDelete({ type: 'event', row }),
                    },
                    className: 'flow-node',
                },
                {
                    id: templateId,
                    type: 'customNode',
                    position: { x: 300, y: i * 150 },
                    data: {
                        type: 'template',
                        label: row.response,
                        rowData: row,
                        onDelete: () => setNodeToDelete({ type: 'template', row }),
                    },
                    className: 'flow-node',
                }
            );
            
            newEdges.push({
                id: `edge-${row.id}`,
                source: eventId,
                target: templateId,
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [automations]); // ✅ CHANGED: Dependency changed from theAutomations to automations


    const handleDelete = async () => {
        const id = nodeToDelete?.row?.id;
      
        if (!id || !selectedApp) {
          console.error('❌ Missing automation ID or selected app:', { id, selectedApp });
          return;
        }
      
        try {
          const response = await fetch(`${baseURL}/relay/automations/${selectedApp}/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
      
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
      
          console.log('✅ Deleted automation:', id);
      
          setNodeToDelete(null);
          setIsSureOpen(false);
      
          if (onDeleteSuccess) onDeleteSuccess();
      
        } catch (err) {
          console.error('❌ Delete failed:', err);
          alert(`Failed to delete: ${err.message}`);
        }
      };
      






    return (
        <>
            {nodeToDelete && (
                <div className="sure-box">
                    <p>
                        {nodeToDelete?.type === 'event' ? (
                            <>
                                Are you sure? <br />
                                <strong>{nodeToDelete.row.trigger}</strong> is the trigger of this automation.<br />
                                Deleting it will remove the entire automation.
                            </>
                        ) : (
                            <>
                                Are you sure you want to delete this action? <br />
                                <strong>{nodeToDelete.row.response}</strong>
                            </>
                        )}
                    </p>
                    <button onClick={() => setNodeToDelete(null)}>No</button>
                    <button onClick={handleDelete}>Yes</button>
                </div>
            )}

            <div className="automation-flow-container">
            <ChangeApp selectedApp={selectedApp} setSelectedApp={setSelectedApp} />
                
                <ReactFlow
                    key={flowKey}
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={(event, node) => {
                        const rowData = node.data.rowData;
                        console.log('Clicked node data:', rowData);
                        setSelectedNode(rowData);
                        setShowAddModal(true);
                    }}
                    onNodesChange={(changes) =>
                        setNodes((nds) => applyNodeChanges(changes, nds))
                    }
                    nodeDragHandle=".flow-node"
                    fitView
                    className="automation-flow"
                    nodeTypes={nodeTypes}
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </>
    );
}