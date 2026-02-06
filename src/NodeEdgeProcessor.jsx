import {useCallback, useEffect} from 'react';
import {addEdge, MarkerType, useEdgesState, useNodesState} from '@xyflow/react';

const initialNodes = [];
const initialEdges = [];

export default function NodeEdgeProcessor({schema}) {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        if (!schema) return;

        const newNodes = [];
        const newEdges = [];
        let typeYOffset = 50;
        const typeSpacing = 100;
        const relationSpacing = 40;
        const typeWidth = 200;
        const typePad = 20;
        // const operatorBaseX = 450;
        // const operatorXStep = 50;

        schema.type_definitions.forEach((typeDef) => {
            const T = typeDef.type;
            const originalTid = `type:${T}-original`;
            const duplicateTid = `type:${T}-duplicate`;
            const rels = typeDef.relations ? Object.keys(typeDef.relations) : [];
            const height = 50 + rels.length * relationSpacing + typePad;

            newNodes.push({
                id: duplicateTid,
                type: 'typeContainer',
                position: { x: 100, y: typeYOffset },
                data: { label: T, isDuplicate: true },
                style: { zIndex: -1, width: typeWidth, height, backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: 8, padding: `${typePad}px`, boxSizing: 'border-box' },


            });
        
              newNodes.push({
                id: originalTid,
                type: 'typeContainer',
                position: { x: 700, y: typeYOffset },
                data: { label: T, isDuplicate: false },
                style: {zIndex: -1, width: typeWidth, height, backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: 8, padding: `${typePad}px`, boxSizing: 'border-box' },
              });

              rels.forEach((r, i) => {
                const RIdDuplicate = `relation:${T}-duplicate#${r}`;
                newNodes.push({
                  id: RIdDuplicate,
                  type: 'relationNode',
                  position: { x: typePad, y: 50 + i * relationSpacing },
                  data: { label: r, isDuplicate: true },
                  parentId: duplicateTid,
                  extent: 'parent',
                  style: { width: typeWidth - 2 * typePad, height: 30, backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 },
                });
              });
        
              rels.forEach((r, i) => {
                const RIdOriginal = `relation:${T}-original#${r}`;
                newNodes.push({
                  id: RIdOriginal,
                  type: 'relationNode',
                  position: { x: typePad, y: 50 + i * relationSpacing },
                  data: { label: r, isDuplicate: false },
                  parentId: originalTid,
                  extent: 'parent',
                  style: { width: typeWidth - 2 * typePad, height: 30, backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 },
                });
              });
        
              typeYOffset += height + typeSpacing;
            });

            const relationPositions = {};
            schema.type_definitions.forEach(typeDef => {
              const T = typeDef.type;
              const duplicateTid = `type:${T}-duplicate`;
              const originalTid = `type:${T}-original`;
              const typeNodeDuplicate = newNodes.find(n => n.id === duplicateTid);
              const typeNodeOriginal = newNodes.find(n => n.id === originalTid);
              const rels = Object.keys(typeDef.relations || {});
              rels.forEach((r) => {
                const RIdDuplicate = `relation:${T}-duplicate#${r}`;
                const RIdOriginal = `relation:${T}-original#${r}`;
                const relNodeDuplicate = newNodes.find(n => n.id === RIdDuplicate);
                const relNodeOriginal = newNodes.find(n => n.id === RIdOriginal);
                if (relNodeDuplicate && typeNodeDuplicate) {
                  relationPositions[RIdDuplicate] = {
                    x: typeNodeDuplicate.position.x + relNodeDuplicate.position.x,
                    y: typeNodeDuplicate.position.y + relNodeDuplicate.position.y,
                  };
                }
                if (relNodeOriginal && typeNodeOriginal) {
                  relationPositions[RIdOriginal] = {
                    x: typeNodeOriginal.position.x + relNodeOriginal.position.x,
                    y: typeNodeOriginal.position.y + relNodeOriginal.position.y,
                  };
                }
              });
            });
      const operatorInstanceCounters = {}; // Helps stagger vertically per relation

            const processDefinition = (tid, T, R, D, P, targetHandle, level = 0, isSubtract = false) => {
                const edgeStyle = isSubtract
                  ? { stroke: 'red', strokewidth: 1.5, zIndex: 1000, pointerEvents: 'none' }
                  : { stroke: 'black', strokewidth: 1.5, zIndex: 1000, pointerEvents: 'none' };
          
                if (D.this) {
                  const metadata = schema.type_definitions.find(td => td.type === T)?.metadata;
                  const relationMetadata = metadata?.relations[R];
                  if (relationMetadata?.directly_related_user_types) {
                    relationMetadata.directly_related_user_types.forEach((userType, index) => {
                      let sourceId;
                      let label;
                      if (userType.type && !userType.relation) {
                        sourceId = `type:${userType.type}-duplicate`;
                        label = userType.wildcard ? '*' : undefined;
                      } else if (userType.type && userType.relation) {
                        sourceId = `relation:${userType.type}-duplicate#${userType.relation}`;
                        label = undefined;
                      }
                      if (sourceId) {
                        newEdges.push({
                          id: `edge:def-${sourceId}-${P}-${targetHandle}-${index}`,
                          source: sourceId,
                          target: P,
                          sourceHandle: 'source',
                          targetHandle: targetHandle,
                          style: edgeStyle,
                          markerEnd: { type: MarkerType.ArrowClosed, width:20, height:20, color: edgeStyle.stroke },
                          label: label,
                        });
                      }
                    });
                  }
                } else if (D.computedUserset) {
                  const S = D.computedUserset.relation;
                  const sourceId = `relation:${T}-duplicate#${S}`;
                  newEdges.push({
                    id: `edge:def-${sourceId}-${P}-${targetHandle}`,
                    source: sourceId,
                    target: P,
                    sourceHandle: 'source',
                    targetHandle: targetHandle,
                    style: { ...edgeStyle, strokeDasharray: '5,5' },
                    markerEnd: { type: MarkerType.ArrowClosed,width:20, height:20, color: edgeStyle.stroke },
                  });
                } else if (D.tupleToUserset) {
                  const tuplesetRelation = D.tupleToUserset.tupleset.relation;
                  const computedRelation = D.tupleToUserset.computedUserset.relation;
                  const typeDef = schema.type_definitions.find(td => td.type === T);
                  const metadata = typeDef?.metadata;
                  const relatedUserTypes = metadata?.relations[tuplesetRelation]?.directly_related_user_types;
                  if (relatedUserTypes?.length > 0) {
                    const relatedType = relatedUserTypes[0].type;
                    const sourceId = `relation:${relatedType}-duplicate#${computedRelation}`;
                    newEdges.push({
                      id: `edge:def-${sourceId}-${P}-${targetHandle}`,
                      source: sourceId,
                      target: P,
                      sourceHandle: 'source',
                      targetHandle: targetHandle,
                      style: isSubtract ? { stroke: 'red', zIndex: 1000, pointerEvents: 'none' } : { stroke: 'blue', zIndex: 1000, pointerEvents: 'none' },
                      markerEnd: { type: MarkerType.ArrowClosed, width:20, height:20, color: isSubtract ? 'red' : 'blue' },
                      label: `(via ${tuplesetRelation})`,
                    });
                  }
                } else if (D.union || D.intersection) {
                  const operatorType = D.union ? 'union' : 'intersection';
                  const label = D.union ? 'or' : 'and';
                  const operatorId = `operator:${T}#${R}#${operatorType}#${level}`;
                  if (!newNodes.find(n => n.id === operatorId)) {
                    const absoluteY = relationPositions[`relation:${T}-original#${R}`].y;
                    // const x = operatorBaseX - level * operatorXStep;
                    // const y = absoluteY + level * 80;

                    const duplicateTypeNode = newNodes.find(n => n.id === `type:${T}-duplicate`);
                    const originalTypeNode = newNodes.find(n => n.id === `type:${T}-original`);
                    const duplicateX = duplicateTypeNode?.position.x || 100;
                    const originalX = originalTypeNode?.position.x || 500;
                    const x = (duplicateX + originalX + typeWidth) / 2 - 30;

                    const relationKey = `${T}#${R}#${operatorType}`;
                    if (!operatorInstanceCounters[relationKey]) {
                      operatorInstanceCounters[relationKey] = 0;
                    }
                    const operatorIndex = operatorInstanceCounters[relationKey]++;
                    const baseY = absoluteY + level * 100;
                    const y = baseY + operatorIndex * 100;


                    newNodes.push({
                      id: operatorId,
                      type: 'operatorNode',
                      position: { x, y },
                      data: { label },
                      style: { width: 60, height: 60 },
                    });
                    relationPositions[operatorId] = { x, y };
                  }
                  const children = D.union ? D.union.child : D.intersection.child;
                  children.forEach((child, index) => {
                    const inputHandle = index === 0 ? 'input1' : 'input2';
                    processDefinition(tid, T, R, child, operatorId, inputHandle, level + 1);
                  });
                  newEdges.push({
                    id: `edge:def-${operatorId}-${P}-${targetHandle}`,
                    source: operatorId,
                    target: P,
                    sourceHandle: 'output',
                    targetHandle: targetHandle,
                    style: { stroke: 'black', strokewidth:1.5, zIndex: 1000, pointerEvents: 'none' },
                    markerEnd: { type: MarkerType.ArrowClosed,width:20, height:20, color: 'black' },
                  });
                } else if (D.difference) {
                  const operatorType = 'difference';
                  const label = 'butnot';
                  const operatorId = `operator:${T}#${R}#${operatorType}#${level}`;
                  if (!newNodes.find(n => n.id === operatorId)) {
                    const absoluteY = relationPositions[`relation:${T}-original#${R}`].y;
                    // const x = operatorBaseX - level * operatorXStep;
                    // const y = absoluteY + level * 80;

                    const duplicateTypeNode = newNodes.find(n => n.id === `type:${T}-duplicate`);
                    const originalTypeNode = newNodes.find(n => n.id === `type:${T}-original`);
                    const duplicateX = duplicateTypeNode?.position.x || 100;
                    const originalX = originalTypeNode?.position.x || 500;
                    const x = (duplicateX + originalX + typeWidth) / 2 - 30;

                    const relationKey = `${T}#${R}#${operatorType}`;
                    if (!operatorInstanceCounters[relationKey]) {
                      operatorInstanceCounters[relationKey] = 0;
                    }
                    const operatorIndex = operatorInstanceCounters[relationKey]++;
                    const baseY = absoluteY + level * 100;
                    const y = baseY + operatorIndex * 100;





                    newNodes.push({
                      id: operatorId,
                      type: 'operatorNode',
                      position: { x, y },
                      data: { label },
                      style: { width: 60, height: 60 },
                    });
                    relationPositions[operatorId] = { x, y };
                  }
                  processDefinition(tid, T, R, D.difference.base, operatorId, 'base', level + 1, false);
                  processDefinition(tid, T, R, D.difference.subtract, operatorId, 'subtract', level + 1, true);
                  newEdges.push({
                    id: `edge:def-${operatorId}-${P}-${targetHandle}`,
                    source: operatorId,
                    target: P,
                    sourceHandle: 'output',
                    targetHandle: targetHandle,
                    style: { stroke: 'black', strokewidth:1.5, zIndex: 1000, pointerEvents: 'none' },
                    markerEnd: { type: MarkerType.ArrowClosed, width:20, height:20, color: 'black' },
                  });
                }
              };
          
              schema.type_definitions.forEach(typeDef => {
                const T = typeDef.type;
                const originalTid = `type:${T}-original`;
                const rels = Object.keys(typeDef.relations || {});
                rels.forEach(relationName => {
                  const D = typeDef.relations[relationName];
                  const RId = `relation:${T}-original#${relationName}`;
                  processDefinition(originalTid, T, relationName, D, RId, 'target', 0, false);
                });
              });
          
              setNodes(newNodes);
              setEdges(newEdges);
            }, [schema]);
          
            const onConnect = useCallback(params => setEdges(es => addEdge(params, es)), [setEdges]);
          
    return {nodes, edges, onNodesChange, onEdgesChange, onConnect};
}