import { Node, Edge } from '@xyflow/react';

export interface TemplateResult {
    nodes: Node[];
    edges: Edge[];
}

export const generateTemplate = (templateType: string, base: { x: number, y: number }): TemplateResult => {
    let newNodes: Node[] = [];
    let newEdges: Edge[] = [];
    const now = Date.now();

    if (templateType === 'template:ecommerce') {
        const r53 = { id: `r53-${now}`, type: 'route53', position: { x: base.x, y: base.y }, data: { label: 'Global DNS', category: 'Networking' }, style: { width: 192, height: 72 } };
        const waf = { id: `waf-${now}`, type: 'waf', position: { x: base.x + 240, y: base.y }, data: { label: 'Cloudflare WAF', category: 'Security' }, style: { width: 168, height: 72 } };
        const cdn = { id: `cdn-${now}`, type: 'cdn', position: { x: base.x + 240, y: base.y + 120 }, data: { label: 'Static Assets', category: 'Networking' }, style: { width: 192, height: 72 } };
        const alb = { id: `alb-${now}`, type: 'loadBalancer', position: { x: base.x + 480, y: base.y }, data: { label: 'Core ALB', category: 'Networking' }, style: { width: 192, height: 72 } };

        const auth = { id: `auth-${now}`, type: 'auth0', position: { x: base.x + 720, y: base.y - 120 }, data: { label: 'Auth Service', category: 'Security' }, style: { width: 168, height: 72 } };
        const product = { id: `prod-${now}`, type: 'microservice', position: { x: base.x + 720, y: base.y }, data: { label: 'Product API', category: 'Compute' }, style: { width: 168, height: 72 } };
        const order = { id: `order-${now}`, type: 'microservice', position: { x: base.x + 720, y: base.y + 120 }, data: { label: 'Order Service', category: 'Compute' }, style: { width: 168, height: 72 } };

        const redis = { id: `redis-${now}`, type: 'cache', position: { x: base.x + 960, y: base.y - 60 }, data: { label: 'Catalog Cache', category: 'Data' }, style: { width: 144, height: 120 } };
        const pg = { id: `pg-${now}`, type: 'database', position: { x: base.x + 960, y: base.y + 60 }, data: { label: 'Master DB', provider: 'postgresql', category: 'Data' }, style: { width: 144, height: 120 } };
        const stripe = { id: `stripe-${now}`, type: 'stripe', position: { x: base.x + 960, y: base.y + 240 }, data: { label: 'Payments', category: 'External' }, style: { width: 168, height: 72 } };
        const kafka = { id: `kafka-${now}`, type: 'bus', position: { x: base.x + 720, y: base.y + 240 }, data: { label: 'Event Stream', category: 'Networking' }, style: { width: 192, height: 72 } };

        newNodes = [r53, waf, cdn, alb, auth, product, order, redis, pg, stripe, kafka];
        newEdges = [
            { id: `e-${now}-1`, source: r53.id, target: waf.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-2`, source: waf.id, target: alb.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-3`, source: waf.id, target: cdn.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-4`, source: alb.id, target: auth.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-5`, source: alb.id, target: product.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-6`, source: alb.id, target: order.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-7`, source: product.id, target: redis.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-8`, source: order.id, target: pg.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-9`, source: order.id, target: kafka.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-10`, source: order.id, target: stripe.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
        ];
    } else if (templateType === 'template:ai-platform') {
        const app = { id: `app-${now}`, type: 'app', position: { x: base.x, y: base.y }, data: { label: 'AI Client App', category: 'External' }, style: { width: 168, height: 72 } };
        const nats = { id: `nats-${now}`, type: 'nats', position: { x: base.x + 240, y: base.y }, data: { label: 'Real-time Ingress', category: 'Networking' }, style: { width: 192, height: 72 } };
        const influx = { id: `inf-${now}`, type: 'influxdb', position: { x: base.x + 480, y: base.y - 120 }, data: { label: 'Telemetry Store', category: 'Data' }, style: { width: 144, height: 120 } };
        const worker = { id: `worker-${now}`, type: 'worker', position: { x: base.x + 480, y: base.y }, data: { label: 'Inference Engine', category: 'Compute' }, style: { width: 168, height: 72 } };
        const vault = { id: `vault-${now}`, type: 'vault', position: { x: base.x + 480, y: base.y + 120 }, data: { label: 'Secrets Mgmt', category: 'Security' }, style: { width: 168, height: 72 } };

        const snowflake = { id: `snow-${now}`, type: 'snowflake', position: { x: base.x + 720, y: base.y }, data: { label: 'Model Warehouse', category: 'Data' }, style: { width: 144, height: 120 } };
        const clickhouse = { id: `ch-${now}`, type: 'clickhouse', position: { x: base.x + 720, y: base.y + 180 }, data: { label: 'Vector Search', category: 'Data' }, style: { width: 144, height: 120 } };

        const prom = { id: `prom-${now}`, type: 'prometheus', position: { x: base.x + 960, y: base.y - 60 }, data: { label: 'Metrics', category: 'Monitoring' }, style: { width: 168, height: 72 } };
        const grafana = { id: `graf-${now}`, type: 'grafana', position: { x: base.x + 960, y: base.y + 60 }, data: { label: 'AI Dashboard', category: 'Monitoring' }, style: { width: 168, height: 72 } };

        newNodes = [app, nats, influx, worker, vault, snowflake, clickhouse, prom, grafana];
        newEdges = [
            { id: `e-${now}-1`, source: app.id, target: nats.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-2`, source: nats.id, target: influx.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-3`, source: nats.id, target: worker.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-4`, source: worker.id, target: vault.id, type: 'step', style: { stroke: '#444', strokeWidth: 2, strokeDasharray: '5,5' } },
            { id: `e-${now}-5`, source: worker.id, target: snowflake.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-6`, source: worker.id, target: clickhouse.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-7`, source: snowflake.id, target: prom.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-8`, source: prom.id, target: grafana.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
        ];
    } else if (templateType === 'template:enterprise-k8s') {
        const region = { id: `reg-${now}`, type: 'region', position: { x: base.x, y: base.y }, data: { label: 'AWS us-east-1', category: 'Infrastructure' }, style: { width: 1200, height: 600 } };
        const vpc = { id: `vpc-${now}`, type: 'vpc', position: { x: base.x + 50, y: base.y + 50 }, data: { label: 'Prod VPC', category: 'Infrastructure' }, parentId: region.id, style: { width: 1100, height: 500 } };

        const ingress = { id: `ing-${now}`, type: 'k8s-ingress', position: { x: base.x + 100, y: base.y + 150 }, data: { label: 'Public Ingress', category: 'Kubernetes' }, parentId: vpc.id, style: { width: 168, height: 72 } };
        const svc = { id: `svc-${now}`, type: 'k8s-service', position: { x: base.x + 300, y: base.y + 150 }, data: { label: 'Cluster Svc', category: 'Kubernetes' }, parentId: vpc.id, style: { width: 168, height: 72 } };

        const deploy = { id: `dep-${now}`, type: 'k8s-deployment', position: { x: base.x + 500, y: base.y + 150 }, data: { label: 'Web Deploy', category: 'Kubernetes' }, parentId: vpc.id, style: { width: 192, height: 96 } };
        const pod1 = { id: `p1-${now}`, type: 'k8s-pod', position: { x: base.x + 750, y: base.y + 100 }, data: { label: 'Replica A', category: 'Kubernetes' }, parentId: vpc.id, style: { width: 144, height: 96 } };
        const pod2 = { id: `p2-${now}`, type: 'k8s-pod', position: { x: base.x + 750, y: base.y + 220 }, data: { label: 'Replica B', category: 'Kubernetes' }, parentId: vpc.id, style: { width: 144, height: 96 } };

        const argo = { id: `argo-${now}`, type: 'argocd', position: { x: base.x + 1200, y: base.y + 100 }, data: { label: 'GitOps (ArgoCD)', category: 'CI/CD' }, style: { width: 168, height: 72 } };
        const actions = { id: `act-${now}`, type: 'github_actions', position: { x: base.x + 1200, y: base.y + 200 }, data: { label: 'CI Pipeline', category: 'CI/CD' }, style: { width: 168, height: 72 } };

        newNodes = [region, vpc, ingress, svc, deploy, pod1, pod2, argo, actions];
        newEdges = [
            { id: `e-${now}-1`, source: ingress.id, target: svc.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-2`, source: svc.id, target: deploy.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-3`, source: deploy.id, target: pod1.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-4`, source: deploy.id, target: pod2.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-5`, source: actions.id, target: argo.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-6`, source: argo.id, target: deploy.id, type: 'step', style: { stroke: '#444', strokeWidth: 2, strokeDasharray: '5,5' } },
        ];
    } else if (templateType === 'template:fintech-saas') {
        const lb = { id: `lb-${now}`, type: 'loadBalancer', position: { x: base.x, y: base.y }, data: { label: 'Edge Gateway', category: 'Networking' }, style: { width: 192, height: 72 } };
        const auth = { id: `okta-${now}`, type: 'okta', position: { x: base.x + 240, y: base.y - 100 }, data: { label: 'Identity (Okta)', category: 'Security' }, style: { width: 168, height: 72 } };
        const api = { id: `api-${now}`, type: 'microservice', position: { x: base.x + 240, y: base.y + 50 }, data: { label: 'Transaction API', category: 'Compute' }, style: { width: 168, height: 72 } };

        const psql = { id: `psql-${now}`, type: 'database', position: { x: base.x + 480, y: base.y - 50 }, data: { label: 'Ledger DB', provider: 'postgresql', category: 'Data' }, style: { width: 144, height: 120 } };
        const stripe = { id: `stripe-${now}`, type: 'stripe', position: { x: base.x + 480, y: base.y + 150 }, data: { label: 'Processor', category: 'External' }, style: { width: 168, height: 72 } };

        const dd = { id: `dd-${now}`, type: 'datadog', position: { x: base.x + 720, y: base.y }, data: { label: 'Observability', category: 'Monitoring' }, style: { width: 168, height: 72 } };
        const twilio = { id: `tw-${now}`, type: 'twilio', position: { x: base.x + 720, y: base.y + 120 }, data: { label: '2FA (Twilio)', category: 'External' }, style: { width: 168, height: 72 } };

        newNodes = [lb, auth, api, psql, stripe, dd, twilio];
        newEdges = [
            { id: `e-${now}-1`, source: lb.id, target: auth.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-2`, source: lb.id, target: api.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-3`, source: api.id, target: psql.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-4`, source: api.id, target: stripe.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-5`, source: api.id, target: dd.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
            { id: `e-${now}-6`, source: api.id, target: twilio.id, type: 'step', style: { stroke: '#444', strokeWidth: 2 } },
        ];
    }

    return { nodes: newNodes, edges: newEdges };
};
