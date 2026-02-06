export function generateSchema(nodes, edges) {
    const schema = {
      schema_version: "1.1",
      type_definitions: [],
      conditions: {}
    };
  
    const typeNodes = nodes.filter(n => n.type === 'typeContainer');
  
    // Pre-index nodes and edges for faster lookup
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const incomingEdgesMap = new Map();
    edges.forEach(edge => {
      if (!incomingEdgesMap.has(edge.target)) {
        incomingEdgesMap.set(edge.target, []);
      }
      incomingEdgesMap.get(edge.target).push(edge);
    });
  
    // Helper to get incoming edges for a node
    const getIncomingEdges = (nodeId) => incomingEdgesMap.get(nodeId) || [];
  
    // Core function to build definition from a specific edge
    function buildDefinitionFromEdge(edge) {
      const sourceNode = nodeMap.get(edge.source);
      const edgeData = edge.data || {};
  
      if (sourceNode.type === 'operatorNode') {
        const operatorType = sourceNode.data.operatorType;
        const operatorInputs = getIncomingEdges(sourceNode.id);
  
        if (operatorType === 'union' || operatorType === 'intersection') {
          const children = operatorInputs
            .filter(e => e.targetHandle === 'input')
            .map(e => buildDefinitionFromEdge(e));
          // Consolidate multiple "this" into one
          const thisChildren = children.filter(c => c.this);
          const otherChildren = children.filter(c => !c.this);
          const uniqueChildren = [];
          if (thisChildren.length > 0) {
            uniqueChildren.push({ this: {} });
          }
          uniqueChildren.push(...otherChildren);
          return { [operatorType]: { child: uniqueChildren } };
        } else if (operatorType === 'difference') {
          const baseInputEdge = operatorInputs.find(e => e.targetHandle === 'base');
          const subtractInputEdge = operatorInputs.find(e => e.targetHandle === 'subtract');
          const baseDef = baseInputEdge ? buildDefinitionFromEdge(baseInputEdge) : {};
          const subtractDef = subtractInputEdge ? buildDefinitionFromEdge(subtractInputEdge) : {};
          return { difference: { base: baseDef, subtract: subtractDef } };
        }
      } else {
        switch (edgeData.definitionType) {
          case 'this':
            return { this: {} };
          case 'computedUserset':
            return { computedUserset: { object: "", relation: edgeData.computedRelationName } };
          case 'tupleToUserset':
            return {
              tupleToUserset: {
                tupleset: { object: "", relation: edgeData.tuplesetRelation },
                computedUserset: { object: "", relation: edgeData.computedRelation }
              }
            };
          default:
            console.warn(`Unknown definition type:`, edgeData);
            return { this: {} };
        }
      }
    }
  
    // Function to collect metadata from edges
    function collectMetadata(targetNodeId, targetHandleId) {
      const visitedEdges = new Set();
      const relatedUserTypes = [];
  
      function findSources(edge) {
        if (!edge || visitedEdges.has(edge.id)) return;
        visitedEdges.add(edge.id);
  
        const sourceNode = nodeMap.get(edge.source);
        const edgeData = edge.data || {};
  
        if (sourceNode.type === 'operatorNode') {
          const operatorInputs = getIncomingEdges(sourceNode.id);
          if (sourceNode.data.operatorType === 'difference') {
            const baseInputEdge = operatorInputs.find(e => e.targetHandle === 'base');
            if (baseInputEdge) findSources(baseInputEdge);
          } else {
            operatorInputs.forEach(inputEdge => findSources(inputEdge));
          }
        } else if (edgeData.definitionType === 'this' && edgeData.sourceRelationInfo) {
          const info = edgeData.sourceRelationInfo;
          const userTypeEntry = { type: info.type, condition: "" };
          if (info.relation) userTypeEntry.relation = info.relation;
          else if (info.wildcard) userTypeEntry.wildcard = {};
          if (!relatedUserTypes.some(entry => JSON.stringify(entry) === JSON.stringify(userTypeEntry))) {
            relatedUserTypes.push(userTypeEntry);
          }
        }
      }
  
      const incomingEdges = getIncomingEdges(targetNodeId).filter(e => e.targetHandle === targetHandleId);
      incomingEdges.forEach(edge => findSources(edge));
  
      return relatedUserTypes;
    }
  
    // Build type definitions
    typeNodes.forEach(tNode => {
      const typeName = tNode.data.typeName || tNode.data.label;
      const typeDef = {
        type: typeName,
        relations: {},
        metadata: { relations: {} }
      };
  
      const relationNodes = nodes.filter(n => n.parentId === tNode.id && n.type === 'relationNode');
  
      relationNodes.forEach(rNode => {
        const relationName = rNode.data.relationName || rNode.data.label;
        const incomingEdges = getIncomingEdges(rNode.id).filter(e => e.targetHandle === 'target');
        if (incomingEdges.length > 0) {
          const definition = buildDefinitionFromEdge(incomingEdges[0]);
          typeDef.relations[relationName] = definition;
        } else {
          typeDef.relations[relationName] = { this: {} };
        }
  
        const directlyRelatedUserTypes = collectMetadata(rNode.id, 'target');
        typeDef.metadata.relations[relationName] = {
          directly_related_user_types: directlyRelatedUserTypes,
          module: "",
          source_info: null
        };
      });
  
      if (Object.keys(typeDef.metadata.relations).length > 0) {
        typeDef.metadata.module = "";
        typeDef.metadata.source_info = null;
      } else {
        typeDef.metadata = null;
      }
  
      schema.type_definitions.push(typeDef);
    });
  
    // Include types with no relations
    const allTypes = schema.type_definitions.map(td => td.type);
    const missingTypes = nodes.filter(n => n.type === 'typeContainer' && !allTypes.includes(n.data.typeName));
    missingTypes.forEach(tNode => {
      schema.type_definitions.push({
        type: tNode.data.typeName,
        relations: {},
        metadata: null
      });
    });
  
    return schema;
  }