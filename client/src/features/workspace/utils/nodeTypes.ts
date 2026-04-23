import { SystemNode } from '@/components/canvas/nodes/SystemNode';
import {
    K8sPodIcon, K8sDeployIcon, K8sReplicaSetIcon, K8sStatefulIcon, K8sDaemonIcon,
    K8sServiceIcon, K8sIngressIcon, K8sConfigMapIcon, K8sSecretIcon, K8sPVCIcon,
    K8sJobIcon, K8sCronJobIcon, K8sHPAIcon, K8sNamespaceIcon
} from '@/components/canvas/icons/KubernetesIcons';

import {
    Server,
    Database,
    Cpu,
    Globe,
    MessageSquare,
    HardDrive,
    Zap,
    Box,
    Share2,
    RotateCw,
    PlayCircle,
    GitBranch,
    Settings,
    Shield,
    Lock,
    Key,
    Activity,
    BarChart3,
    PieChart,
    Square,
    Type,
    Circle,
    CreditCard,
    MessageCircle,
    ShoppingCart,
    Search,
    User as UserIcon,
    Layers
} from 'lucide-react';

export const nodeTypes = {
    server: SystemNode,
    database: SystemNode,
    loadBalancer: SystemNode,
    gateway: SystemNode,
    queue: SystemNode,
    storage: SystemNode,
    logic: SystemNode,
    cdn: SystemNode,
    microservice: SystemNode,
    worker: SystemNode,
    cache: SystemNode,
    search: SystemNode,
    bus: SystemNode,
    region: SystemNode,
    vpc: SystemNode,
    user: SystemNode,
    app: SystemNode,
    api: SystemNode,
    note: SystemNode,
    annotation: SystemNode,
    junction: SystemNode,
    // Kubernetes
    'k8s-pod': SystemNode,
    'k8s-deployment': SystemNode,
    'k8s-replicaset': SystemNode,
    'k8s-statefulset': SystemNode,
    'k8s-daemonset': SystemNode,
    'k8s-service': SystemNode,
    'k8s-ingress': SystemNode,
    'k8s-configmap': SystemNode,
    'k8s-secret': SystemNode,
    'k8s-pvc': SystemNode,
    'k8s-job': SystemNode,
    'k8s-cronjob': SystemNode,
    'k8s-hpa': SystemNode,
    'k8s-namespace': SystemNode,
    // Networking
    route53: SystemNode,
    nats: SystemNode,
    socketio: SystemNode,
    // CI/CD
    github_actions: SystemNode,
    jenkins: SystemNode,
    gitlab: SystemNode,
    argocd: SystemNode,
    // Security
    vault: SystemNode,
    auth0: SystemNode,
    waf: SystemNode,
    // Monitoring
    prometheus: SystemNode,
    grafana: SystemNode,
    datadog: SystemNode,
    // Analytics
    influxdb: SystemNode,
    snowflake: SystemNode,
    clickhouse: SystemNode,
    // External
    stripe: SystemNode,
    twilio: SystemNode,
    shopify: SystemNode,
};

// ── Favorites: the 6 most commonly used nodes shown as large tiles ──
export const favoriteNodes = [
    { type: 'server', label: 'Server', icon: Server },
    { type: 'database', label: 'Database', icon: Database },
    { type: 'gateway', label: 'API Gateway', icon: Globe },
    { type: 'microservice', label: 'Docker', icon: Box },
    { type: 'cache', label: 'Redis', icon: Zap },
    { type: 'loadBalancer', label: 'Load Balancer', icon: Cpu },
];

export const nodeTypesList = [
    // ── Compute ──
    { type: 'server', label: 'Server', icon: Server, category: 'Compute' },
    { type: 'microservice', label: 'Docker', icon: Box, category: 'Compute' },
    { type: 'worker', label: 'Worker', icon: Cpu, category: 'Compute' },
    { type: 'logic', label: 'Lambda', icon: Zap, category: 'Compute' },

    // ── Data & Storage ──
    { type: 'database', label: 'Database', icon: Database, category: 'Data & Storage' },
    { type: 'cache', label: 'Redis', icon: Zap, category: 'Data & Storage' },
    { type: 'storage', label: 'Storage (S3)', icon: HardDrive, category: 'Data & Storage' },
    { type: 'search', label: 'Elasticsearch', icon: Search, category: 'Data & Storage' },
    { type: 'influxdb', label: 'InfluxDB', icon: BarChart3, category: 'Data & Storage' },
    { type: 'snowflake', label: 'Snowflake', icon: Layers, category: 'Data & Storage' },
    { type: 'clickhouse', label: 'Clickhouse', icon: Database, category: 'Data & Storage' },

    // ── Networking ──
    { type: 'gateway', label: 'API Gateway', icon: Globe, category: 'Networking' },
    { type: 'loadBalancer', label: 'Load Balancer', icon: Cpu, category: 'Networking' },
    { type: 'cdn', label: 'CDN', icon: Globe, category: 'Networking' },
    { type: 'bus', label: 'Kafka', icon: Share2, category: 'Networking' },
    { type: 'queue', label: 'Queue', icon: MessageSquare, category: 'Networking' },
    { type: 'route53', label: 'Route 53', icon: Globe, category: 'Networking' },
    { type: 'nats', label: 'NATS', icon: Activity, category: 'Networking' },
    { type: 'socketio', label: 'Socket.io', icon: MessageCircle, category: 'Networking' },

    // ── DevOps ──
    { type: 'github_actions', label: 'GitHub Actions', icon: PlayCircle, category: 'DevOps' },
    { type: 'jenkins', label: 'Jenkins', icon: Settings, category: 'DevOps' },
    { type: 'gitlab', label: 'GitLab CI', icon: GitBranch, category: 'DevOps' },
    { type: 'argocd', label: 'Argo CD', icon: PlayCircle, category: 'DevOps' },
    { type: 'vault', label: 'Vault', icon: Lock, category: 'DevOps' },
    { type: 'auth0', label: 'Auth0', icon: Key, category: 'DevOps' },
    { type: 'waf', label: 'WAF', icon: Shield, category: 'DevOps' },
    { type: 'prometheus', label: 'Prometheus', icon: Activity, category: 'DevOps' },
    { type: 'grafana', label: 'Grafana', icon: BarChart3, category: 'DevOps' },
    { type: 'datadog', label: 'Datadog', icon: PieChart, category: 'DevOps' },

    // ── Zones ──
    { type: 'vpc', label: 'VPC', icon: Square, category: 'Zones' },
    { type: 'region', label: 'Region', icon: Globe, category: 'Zones' },

    // ── Integrations ──
    { type: 'user', label: 'User', icon: UserIcon, category: 'Integrations' },
    { type: 'app', label: 'Client App', icon: Box, category: 'Integrations' },
    { type: 'api', label: 'External API', icon: Globe, category: 'Integrations' },
    { type: 'stripe', label: 'Stripe', icon: CreditCard, category: 'Integrations' },
    { type: 'twilio', label: 'Twilio', icon: MessageCircle, category: 'Integrations' },
    { type: 'shopify', label: 'Shopify', icon: ShoppingCart, category: 'Integrations' },

    // ── Kubernetes ──
    { type: 'k8s-pod', label: 'Pod', icon: K8sPodIcon, category: 'Kubernetes' },
    { type: 'k8s-deployment', label: 'Deployment', icon: K8sDeployIcon, category: 'Kubernetes' },
    { type: 'k8s-replicaset', label: 'ReplicaSet', icon: K8sReplicaSetIcon, category: 'Kubernetes' },
    { type: 'k8s-statefulset', label: 'StatefulSet', icon: K8sStatefulIcon, category: 'Kubernetes' },
    { type: 'k8s-daemonset', label: 'DaemonSet', icon: K8sDaemonIcon, category: 'Kubernetes' },
    { type: 'k8s-job', label: 'Job', icon: K8sJobIcon, category: 'Kubernetes' },
    { type: 'k8s-cronjob', label: 'CronJob', icon: K8sCronJobIcon, category: 'Kubernetes' },
    { type: 'k8s-service', label: 'Service', icon: K8sServiceIcon, category: 'Kubernetes' },
    { type: 'k8s-ingress', label: 'Ingress', icon: K8sIngressIcon, category: 'Kubernetes' },
    { type: 'k8s-configmap', label: 'ConfigMap', icon: K8sConfigMapIcon, category: 'Kubernetes' },
    { type: 'k8s-secret', label: 'Secret', icon: K8sSecretIcon, category: 'Kubernetes' },
    { type: 'k8s-pvc', label: 'PVC', icon: K8sPVCIcon, category: 'Kubernetes' },
    { type: 'k8s-hpa', label: 'Autoscaler', icon: K8sHPAIcon, category: 'Kubernetes' },
    { type: 'k8s-namespace', label: 'Namespace', icon: K8sNamespaceIcon, category: 'Kubernetes' },

    // ── Templates ──
    { type: 'template:ecommerce', label: 'E-commerce', icon: ShoppingCart, category: 'Templates' },
    { type: 'template:ai-platform', label: 'AI/ML Platform', icon: Activity, category: 'Templates' },
    { type: 'template:enterprise-k8s', label: 'K8s Cluster', icon: Layers, category: 'Templates' },
    { type: 'template:fintech-saas', label: 'FinTech SaaS', icon: CreditCard, category: 'Templates' },
];
