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
    pusher: SystemNode,
    // CI/CD
    github_actions: SystemNode,
    jenkins: SystemNode,
    circleci: SystemNode,
    gitlab: SystemNode,
    argocd: SystemNode,
    // Security
    vault: SystemNode,
    auth0: SystemNode,
    okta: SystemNode,
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
    sendgrid: SystemNode,
    shopify: SystemNode,
    paypal: SystemNode,
};

export const nodeTypesList = [
    { type: 'server', label: 'Bare Metal Server', icon: Server, category: 'Compute' },
    { type: 'microservice', label: 'Microservice', icon: Box, category: 'Compute' },
    { type: 'worker', label: 'Background Worker', icon: Cpu, category: 'Compute' },
    { type: 'logic', label: 'Lambda/Logic', icon: Zap, category: 'Compute' },

    { type: 'database', label: 'Database (SQL/NoSQL)', icon: Database, category: 'Data' },
    { type: 'cache', label: 'Redis Cache', icon: Zap, category: 'Data' },
    { type: 'storage', label: 'Object Storage (S3)', icon: HardDrive, category: 'Data' },
    { type: 'search', label: 'Search Index', icon: Search, category: 'Data' },
    { type: 'influxdb', label: 'InfluxDB', icon: BarChart3, category: 'Data' },
    { type: 'snowflake', label: 'Snowflake', icon: Layers, category: 'Data' },
    { type: 'clickhouse', label: 'Clickhouse', icon: Database, category: 'Data' },

    { type: 'gateway', label: 'API Gateway', icon: Globe, category: 'Networking' },
    { type: 'loadBalancer', label: 'Load Balancer', icon: Cpu, category: 'Networking' },
    { type: 'cdn', label: 'CDN / Edge', icon: Globe, category: 'Networking' },
    { type: 'bus', label: 'Event Bus (Kafka)', icon: Share2, category: 'Networking' },
    { type: 'queue', label: 'Message Queue', icon: MessageSquare, category: 'Networking' },
    { type: 'route53', label: 'Route 53', icon: Globe, category: 'Networking' },
    { type: 'nats', label: 'NATS', icon: Activity, category: 'Networking' },
    { type: 'socketio', label: 'Socket.io', icon: MessageCircle, category: 'Networking' },
    { type: 'pusher', label: 'Pusher', icon: Zap, category: 'Networking' },

    { type: 'github_actions', label: 'GitHub Actions', icon: PlayCircle, category: 'CI/CD' },
    { type: 'jenkins', label: 'Jenkins', icon: Settings, category: 'CI/CD' },
    { type: 'circleci', label: 'CircleCI', icon: RotateCw, category: 'CI/CD' },
    { type: 'gitlab', label: 'GitLab', icon: GitBranch, category: 'CI/CD' },
    { type: 'argocd', label: 'Argo CD', icon: PlayCircle, category: 'CI/CD' },

    { type: 'vault', label: 'HashiCorp Vault', icon: Lock, category: 'Security' },
    { type: 'auth0', label: 'Auth0', icon: Key, category: 'Security' },
    { type: 'okta', label: 'Okta', icon: Shield, category: 'Security' },
    { type: 'waf', label: 'Cloudflare WAF', icon: Shield, category: 'Security' },

    { type: 'prometheus', label: 'Prometheus', icon: Activity, category: 'Monitoring' },
    { type: 'grafana', label: 'Grafana', icon: BarChart3, category: 'Monitoring' },
    { type: 'datadog', label: 'Datadog', icon: PieChart, category: 'Monitoring' },

    { type: 'vpc', label: 'VPC / Subnet', icon: Square, category: 'Infrastructure' },
    { type: 'region', label: 'Region / Zone', icon: Globe, category: 'Infrastructure' },

    { type: 'user', label: 'End User', icon: UserIcon, category: 'External' },
    { type: 'app', label: 'Mobile/Web App', icon: Box, category: 'External' },
    { type: 'api', label: 'Third Party API', icon: Globe, category: 'External' },
    { type: 'stripe', label: 'Stripe', icon: CreditCard, category: 'External' },
    { type: 'twilio', label: 'Twilio', icon: MessageCircle, category: 'External' },
    { type: 'sendgrid', label: 'SendGrid', icon: MessageCircle, category: 'External' },
    { type: 'shopify', label: 'Shopify', icon: ShoppingCart, category: 'External' },
    { type: 'paypal', label: 'PayPal', icon: CreditCard, category: 'External' },

    { type: 'note', label: 'Sticky Note', icon: Type, category: 'Documentation' },

    { type: 'junction', label: 'Junction Point', icon: Circle, category: 'Utilities' },

    // Kubernetes — Workloads
    { type: 'k8s-pod', label: 'Pod', icon: K8sPodIcon, category: 'Kubernetes' },
    { type: 'k8s-deployment', label: 'Deployment', icon: K8sDeployIcon, category: 'Kubernetes' },
    { type: 'k8s-replicaset', label: 'ReplicaSet', icon: K8sReplicaSetIcon, category: 'Kubernetes' },
    { type: 'k8s-statefulset', label: 'StatefulSet', icon: K8sStatefulIcon, category: 'Kubernetes' },
    { type: 'k8s-daemonset', label: 'DaemonSet', icon: K8sDaemonIcon, category: 'Kubernetes' },
    { type: 'k8s-job', label: 'Job', icon: K8sJobIcon, category: 'Kubernetes' },
    { type: 'k8s-cronjob', label: 'CronJob', icon: K8sCronJobIcon, category: 'Kubernetes' },
    // Kubernetes — Networking
    { type: 'k8s-service', label: 'Service', icon: K8sServiceIcon, category: 'Kubernetes' },
    { type: 'k8s-ingress', label: 'Ingress', icon: K8sIngressIcon, category: 'Kubernetes' },
    // Kubernetes — Config & Storage
    { type: 'k8s-configmap', label: 'ConfigMap', icon: K8sConfigMapIcon, category: 'Kubernetes' },
    { type: 'k8s-secret', label: 'Secret', icon: K8sSecretIcon, category: 'Kubernetes' },
    { type: 'k8s-pvc', label: 'PersistentVolumeClaim', icon: K8sPVCIcon, category: 'Kubernetes' },
    // Kubernetes — Scaling & Grouping
    { type: 'k8s-hpa', label: 'HPA (Autoscaler)', icon: K8sHPAIcon, category: 'Kubernetes' },
    { type: 'k8s-namespace', label: 'Namespace', icon: K8sNamespaceIcon, category: 'Kubernetes' },

    // Complex Distributed Systems Templates
    { type: 'template:ecommerce', label: 'E-commerce Microservices', icon: ShoppingCart, category: 'Templates' },
    { type: 'template:ai-platform', label: 'AI/ML Data Platform', icon: Activity, category: 'Templates' },
    { type: 'template:enterprise-k8s', label: 'Enterprise K8s Cluster', icon: Layers, category: 'Templates' },
    { type: 'template:fintech-saas', label: 'FinTech SaaS Stack', icon: CreditCard, category: 'Templates' },
];
