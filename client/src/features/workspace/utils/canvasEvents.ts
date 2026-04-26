/**
 * canvasEvents — module-level event bus for canvas actions that need to 
 * cross the ReactFlow node boundary without prop drilling.
 * 
 * Workspace registers handlers, SystemNode fires them.
 */

type EnterNodeHandler = (nodeId: string) => void;

let _enterNodeHandler: EnterNodeHandler | null = null;

export function registerEnterNodeHandler(fn: EnterNodeHandler) {
    _enterNodeHandler = fn;
}

export function unregisterEnterNodeHandler() {
    _enterNodeHandler = null;
}

export function fireEnterNode(nodeId: string) {
    _enterNodeHandler?.(nodeId);
}
