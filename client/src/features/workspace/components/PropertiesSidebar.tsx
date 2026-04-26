import React from 'react';
import { Node } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Box, X } from 'lucide-react';
import { nodeTypesList } from '@/features/workspace/utils/nodeTypes';

interface PropertiesSidebarProps {
    selectedNode: Node | null;
    updateNodeData: (id: string, data: any) => void;
    updateNodeStyle: (id: string, style: any) => void;
    deleteNode: (id: string) => void;
    onClose?: () => void;
}

export const PropertiesSidebar: React.FC<PropertiesSidebarProps> = ({
    selectedNode,
    updateNodeData,
    updateNodeStyle,
    deleteNode,
    onClose
}) => {
    if (!selectedNode) {
        return null;
    }

    const nodeInfo = nodeTypesList.find(n => n.type === selectedNode.type);
    const NodeIcon = nodeInfo?.icon || Box;

    return (
        <div className="p-4 space-y-5">
            {/* ── Node Type Header ── */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <NodeIcon className="w-4.5 h-4.5 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white/90 truncate">{(selectedNode.data?.label as string) || 'Untitled'}</div>
                    <div className="text-[10px] uppercase tracking-[0.1em] font-bold text-white/25">{nodeInfo?.category || 'Node'}</div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.05] transition-all flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <div className="h-px bg-white/[0.04]" />
            <section className="space-y-4">
                {selectedNode.type === 'note' ? (
                    <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Note Contents</Label>
                        <Textarea
                            data-property-input="true"
                            value={(selectedNode.data?.label as string) || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                            className="min-h-[200px] rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 text-[12px] resize-none"
                            placeholder="Type your note here..."
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Display Name</Label>
                            <Input
                                data-property-input="true"
                                value={(selectedNode.data?.label as string) || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                                className="h-8 rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 text-[12px]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Description</Label>
                            <Textarea
                                value={(selectedNode.data?.description as string) || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                                className="min-h-[60px] rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 text-[11px] resize-none"
                                placeholder="Add architectural details..."
                            />
                        </div>
                    </div>
                )}
            </section>

            <div className="h-px bg-white/5" />

            <section className="space-y-4">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Dimensions</Label>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <div className="text-[9px] text-white/20 uppercase font-bold">Width (PX)</div>
                        <Input
                            type="number"
                            min={24}
                            value={Math.round(Number(selectedNode.style?.width ?? (selectedNode as any).measured?.width ?? 0))}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                    updateNodeStyle(selectedNode.id, { width: val });
                                }
                            }}
                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="text-[9px] text-white/20 uppercase font-bold">Height (PX)</div>
                        <Input
                            type="number"
                            min={24}
                            value={Math.round(Number(selectedNode.style?.height ?? (selectedNode as any).measured?.height ?? 0))}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                    updateNodeStyle(selectedNode.id, { height: val });
                                }
                            }}
                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                        />
                    </div>
                </div>
            </section>

            <div className="h-px bg-white/5" />

            <section className="space-y-4">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Technical Configuration</Label>

                <div className="space-y-3">
                    {selectedNode.type === 'database' && (
                        <div className="space-y-1.5">
                            <div className="text-[9px] text-white/20 uppercase font-bold">Provider</div>
                            <select
                                value={(selectedNode.data?.provider as string) || 'postgresql'}
                                onChange={(e) => updateNodeData(selectedNode.id, { provider: e.target.value })}
                                className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                            >
                                <option value="postgresql" className="bg-[#1a1a1a]">PostgreSQL</option>
                                <option value="mongodb" className="bg-[#1a1a1a]">MongoDB</option>
                                <option value="mysql" className="bg-[#1a1a1a]">MySQL</option>
                                <option value="redis" className="bg-[#1a1a1a]">Redis</option>
                                <option value="oracle" className="bg-[#1a1a1a]">Oracle</option>
                                <option value="dynamodb" className="bg-[#1a1a1a]">DynamoDB</option>
                            </select>
                        </div>
                    )}

                    {['gateway', 'loadBalancer', 'api', 'cdn'].includes(selectedNode.type!) && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">Protocol</div>
                                <Input
                                    value={(selectedNode.data?.protocol as string) || 'HTTPS'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { protocol: e.target.value })}
                                    className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">Port</div>
                                <Input
                                    value={(selectedNode.data?.port as string) || '443'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { port: e.target.value })}
                                    className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                />
                            </div>
                        </div>
                    )}

                    {['server', 'microservice', 'worker'].includes(selectedNode.type!) && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">CPU</div>
                                <Input
                                    value={(selectedNode.data?.cpu as string) || '2 vCPU'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { cpu: e.target.value })}
                                    className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">RAM</div>
                                <Input
                                    value={(selectedNode.data?.ram as string) || '4GB'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { ram: e.target.value })}
                                    className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <div className="text-[9px] text-white/20 uppercase font-bold">Environment</div>
                        <select
                            value={(selectedNode.data?.env as string) || 'production'}
                            onChange={(e) => updateNodeData(selectedNode.id, { env: e.target.value })}
                            className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                        >
                            <option value="production" className="bg-[#1a1a1a]">Production</option>
                            <option value="staging" className="bg-[#1a1a1a]">Staging</option>
                            <option value="development" className="bg-[#1a1a1a]">Development</option>
                        </select>
                    </div>

                    {['user', 'app', 'api'].includes(selectedNode.type!) && (
                        <div className="space-y-1.5">
                            <div className="text-[9px] text-white/20 uppercase font-bold">Endpoint / URL</div>
                            <Input
                                value={(selectedNode.data?.url as string) || ''}
                                onChange={(e) => updateNodeData(selectedNode.id, { url: e.target.value })}
                                placeholder="https://api.example.com"
                                className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                            />
                        </div>
                    )}

                    {selectedNode.type === 'storage' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">Capacity</div>
                                <Input
                                    value={(selectedNode.data?.capacity as string) || '500GB'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { capacity: e.target.value })}
                                    className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">Type</div>
                                <select
                                    value={(selectedNode.data?.storageType as string) || 'object'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { storageType: e.target.value })}
                                    className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                >
                                    <option value="object" className="bg-[#1a1a1a]">Object (S3)</option>
                                    <option value="block" className="bg-[#1a1a1a]">Block (EBS)</option>
                                    <option value="file" className="bg-[#1a1a1a]">File (EFS)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {selectedNode.type === 'queue' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">Queue Type</div>
                                <select
                                    value={(selectedNode.data?.queueType as string) || 'standard'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { queueType: e.target.value })}
                                    className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                >
                                    <option value="standard" className="bg-[#1a1a1a]">Standard</option>
                                    <option value="fifo" className="bg-[#1a1a1a]">FIFO</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">Retention</div>
                                <Input
                                    value={(selectedNode.data?.retention as string) || '4 days'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { retention: e.target.value })}
                                    className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                />
                            </div>
                        </div>
                    )}

                    {selectedNode.type === 'cache' && (
                        <div className="space-y-1.5">
                            <div className="text-[9px] text-white/20 uppercase font-bold">Eviction Policy</div>
                            <select
                                value={(selectedNode.data?.eviction as string) || 'lru'}
                                onChange={(e) => updateNodeData(selectedNode.id, { eviction: e.target.value })}
                                className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                            >
                                <option value="lru" className="bg-[#1a1a1a]">LRU (Least Recently Used)</option>
                                <option value="lfu" className="bg-[#1a1a1a]">LFU (Least Frequently Used)</option>
                                <option value="ttl" className="bg-[#1a1a1a]">TTL (Time To Live)</option>
                            </select>
                        </div>
                    )}

                    {selectedNode.type === 'bus' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">Partitions</div>
                                <Input
                                    type="number"
                                    value={(selectedNode.data?.partitions as number) || 3}
                                    onChange={(e) => updateNodeData(selectedNode.id, { partitions: parseInt(e.target.value) })}
                                    className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">Replication</div>
                                <Input
                                    type="number"
                                    value={(selectedNode.data?.replication as number) || 2}
                                    onChange={(e) => updateNodeData(selectedNode.id, { replication: parseInt(e.target.value) })}
                                    className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                />
                            </div>
                        </div>
                    )}

                    {selectedNode.type === 'database' && (
                        <div className="space-y-1.5">
                            <Label className="text-[9px] uppercase tracking-widest font-bold text-white/20">Collections / Tables</Label>
                            <Textarea
                                placeholder="users&#10;orders&#10;products"
                                value={(selectedNode.data?.collections as string[] || []).join('\n')}
                                onChange={(e) => {
                                    const colls = e.target.value.split('\n').filter(s => s.trim() !== '');
                                    updateNodeData(selectedNode.id, { collections: colls });
                                }}
                                className="min-h-[80px] rounded-md focus:ring-0 bg-white/5 border-white/10 text-white focus:border-white/20 resize-none text-[11px] font-mono"
                            />
                        </div>
                    )}

                    {selectedNode.type?.startsWith('k8s-') && (
                        <>
                            <div className="h-px bg-white/5 my-2" />
                            <div className="text-[9px] text-blue-400/60 uppercase font-bold tracking-widest flex items-center gap-1.5 mb-2">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
                                </svg>
                                Kubernetes
                            </div>

                            <div className="space-y-1.5">
                                <div className="text-[9px] text-white/20 uppercase font-bold">Status</div>
                                <select
                                    value={(selectedNode.data?.status as string) || ''}
                                    onChange={(e) => updateNodeData(selectedNode.id, { status: e.target.value || undefined })}
                                    className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                >
                                    <option value="" className="bg-[#1a1a1a]">Default (K8s Blue)</option>
                                    <option value="healthy" className="bg-[#1a1a1a]">✅ Healthy</option>
                                    <option value="error" className="bg-[#1a1a1a]">❌ Error</option>
                                    <option value="pending" className="bg-[#1a1a1a]">⏳ Pending</option>
                                </select>
                            </div>

                            {['k8s-deployment', 'k8s-replicaset', 'k8s-statefulset', 'k8s-daemonset'].includes(selectedNode.type!) && (
                                <div className="space-y-1.5">
                                    <div className="text-[9px] text-white/20 uppercase font-bold">Replicas</div>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={(selectedNode.data?.replicas as number) || 1}
                                        onChange={(e) => updateNodeData(selectedNode.id, { replicas: parseInt(e.target.value) || 1 })}
                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                    />
                                </div>
                            )}

                            {['k8s-pod', 'k8s-deployment', 'k8s-statefulset', 'k8s-daemonset', 'k8s-job', 'k8s-cronjob'].includes(selectedNode.type!) && (
                                <div className="space-y-1.5">
                                    <div className="text-[9px] text-white/20 uppercase font-bold">Container Image</div>
                                    <Input
                                        value={(selectedNode.data?.image as string) || ''}
                                        onChange={(e) => updateNodeData(selectedNode.id, { image: e.target.value })}
                                        placeholder="nginx:latest"
                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] font-mono"
                                    />
                                </div>
                            )}

                            {selectedNode.type === 'k8s-service' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <div className="text-[9px] text-white/20 uppercase font-bold">Service Type</div>
                                        <select
                                            value={(selectedNode.data?.serviceType as string) || 'ClusterIP'}
                                            onChange={(e) => updateNodeData(selectedNode.id, { serviceType: e.target.value })}
                                            className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                        >
                                            <option value="ClusterIP" className="bg-[#1a1a1a]">ClusterIP</option>
                                            <option value="NodePort" className="bg-[#1a1a1a]">NodePort</option>
                                            <option value="LoadBalancer" className="bg-[#1a1a1a]">LoadBalancer</option>
                                            <option value="ExternalName" className="bg-[#1a1a1a]">ExternalName</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-[9px] text-white/20 uppercase font-bold">Port</div>
                                        <Input
                                            value={(selectedNode.data?.port as string) || '80'}
                                            onChange={(e) => updateNodeData(selectedNode.id, { port: e.target.value })}
                                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedNode.type === 'k8s-ingress' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <div className="text-[9px] text-white/20 uppercase font-bold">Host</div>
                                        <Input
                                            value={(selectedNode.data?.host as string) || ''}
                                            onChange={(e) => updateNodeData(selectedNode.id, { host: e.target.value })}
                                            placeholder="app.example.com"
                                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-[9px] text-white/20 uppercase font-bold">Path</div>
                                        <Input
                                            value={(selectedNode.data?.path as string) || '/'}
                                            onChange={(e) => updateNodeData(selectedNode.id, { path: e.target.value })}
                                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedNode.type === 'k8s-pvc' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <div className="text-[9px] text-white/20 uppercase font-bold">Storage Size</div>
                                        <Input
                                            value={(selectedNode.data?.storageSize as string) || '10Gi'}
                                            onChange={(e) => updateNodeData(selectedNode.id, { storageSize: e.target.value })}
                                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-[9px] text-white/20 uppercase font-bold">Access Mode</div>
                                        <select
                                            value={(selectedNode.data?.accessMode as string) || 'ReadWriteOnce'}
                                            onChange={(e) => updateNodeData(selectedNode.id, { accessMode: e.target.value })}
                                            className="w-full h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] focus:ring-0 px-2 outline-none"
                                        >
                                            <option value="ReadWriteOnce" className="bg-[#1a1a1a]">ReadWriteOnce</option>
                                            <option value="ReadOnlyMany" className="bg-[#1a1a1a]">ReadOnlyMany</option>
                                            <option value="ReadWriteMany" className="bg-[#1a1a1a]">ReadWriteMany</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {selectedNode.type === 'k8s-cronjob' && (
                                <div className="space-y-1.5">
                                    <div className="text-[9px] text-white/20 uppercase font-bold">Schedule (Cron)</div>
                                    <Input
                                        value={(selectedNode.data?.schedule as string) || '*/5 * * * *'}
                                        onChange={(e) => updateNodeData(selectedNode.id, { schedule: e.target.value })}
                                        placeholder="*/5 * * * *"
                                        className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px] font-mono"
                                    />
                                </div>
                            )}

                            {selectedNode.type === 'k8s-hpa' && (
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1.5">
                                        <div className="text-[9px] text-white/20 uppercase font-bold">Min</div>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={(selectedNode.data?.minReplicas as number) || 1}
                                            onChange={(e) => updateNodeData(selectedNode.id, { minReplicas: parseInt(e.target.value) || 1 })}
                                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-[9px] text-white/20 uppercase font-bold">Max</div>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={(selectedNode.data?.maxReplicas as number) || 10}
                                            onChange={(e) => updateNodeData(selectedNode.id, { maxReplicas: parseInt(e.target.value) || 10 })}
                                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="text-[9px] text-white/20 uppercase font-bold">CPU %</div>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={(selectedNode.data?.targetCpu as number) || 80}
                                            onChange={(e) => updateNodeData(selectedNode.id, { targetCpu: parseInt(e.target.value) || 80 })}
                                            className="h-8 rounded-md bg-white/5 border-white/10 text-white text-[11px]"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            <div className="h-px bg-white/5" />

            <section className="space-y-4 pb-12">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-white/30">Node Appearance</Label>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${selectedNode?.data?.category === 'Data' ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-500'}`}>
                        {(selectedNode?.data?.category as string) || 'Node'}
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-2 pb-4">
                    {['#4F46E5', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4', '#222222', '#FFFFFF'].map(color => (
                        <button
                            key={color}
                            onClick={() => selectedNode && updateNodeStyle(selectedNode.id, `2px solid ${color}`)}
                            className="w-full aspect-square rounded-lg border relative transition-all hover:scale-110 border-white/5"
                            style={{ backgroundColor: color }}
                        >
                            {(selectedNode?.style?.border as string)?.toLowerCase().includes(color.toLowerCase()) && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference shadow-sm" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => deleteNode(selectedNode.id)}
                    className="w-full h-10 flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all font-bold text-[10px] uppercase tracking-widest mt-6"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Component
                </button>
            </section>
        </div>
    );
};
