import json

def create_template(id_name, title, description, category, nodes, edges):
    return {
        "id": id_name,
        "title": title,
        "description": description,
        "category": category,
        "nodes": nodes,
        "edges": edges
    }

templates = []

# FEATURED
t1_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": -200, "y": 0}, "data": {"label": "## Modern SaaS Architecture\nComplete setup with Next.js frontend, FastAPI backend, caching, and a database cluster."}},
    {"id": "n2", "type": "user", "position": {"x": -200, "y": 200}, "data": {"label": "Web Client"}},
    {"id": "n3", "type": "user", "position": {"x": -200, "y": 400}, "data": {"label": "Mobile App"}},
    
    {"id": "n4", "type": "cdn", "position": {"x": 50, "y": 200}, "data": {"label": "Cloudflare CDN"}},
    
    {"id": "n_app_group", "type": "app", "position": {"x": 300, "y": 100}, "width": 250, "height": 400, "data": {"label": "Frontend (Vercel)"}},
    {"id": "n5", "parentId": "n_app_group", "type": "app", "position": {"x": 20, "y": 50}, "data": {"label": "Next.js SSR"}},
    {"id": "n6", "parentId": "n_app_group", "type": "api", "position": {"x": 20, "y": 200}, "data": {"label": "Next.js API Routes"}},
    
    {"id": "n_backend_group", "type": "server", "position": {"x": 650, "y": 100}, "width": 300, "height": 400, "data": {"label": "Backend Services (AWS)"}},
    {"id": "n7", "parentId": "n_backend_group", "type": "gateway", "position": {"x": 20, "y": 150}, "data": {"label": "API Gateway"}},
    {"id": "n8", "parentId": "n_backend_group", "type": "microservice", "position": {"x": 150, "y": 50}, "data": {"label": "FastAPI Core"}},
    {"id": "n9", "parentId": "n_backend_group", "type": "worker", "position": {"x": 150, "y": 250}, "data": {"label": "Celery Worker"}},
    
    {"id": "n_data_group", "type": "region", "position": {"x": 1050, "y": 100}, "width": 300, "height": 400, "data": {"label": "Data Layer"}},
    {"id": "n10", "parentId": "n_data_group", "type": "database", "position": {"x": 20, "y": 50}, "data": {"label": "PostgreSQL Primary"}},
    {"id": "n11", "parentId": "n_data_group", "type": "database", "position": {"x": 20, "y": 250}, "data": {"label": "PostgreSQL Replica"}},
    {"id": "n12", "parentId": "n_data_group", "type": "cache", "position": {"x": 150, "y": 150}, "data": {"label": "Redis Cluster"}},
    
    {"id": "n13", "type": "note", "position": {"x": 650, "y": -50}, "data": {"label": "All backend services are deployed in an auto-scaling group across 3 availability zones."}},
]
t1_edges = [
    {"id": "e1", "source": "n2", "target": "n4", "animated": True},
    {"id": "e2", "source": "n3", "target": "n4", "animated": True},
    {"id": "e3", "source": "n4", "target": "n5", "animated": True},
    {"id": "e4", "source": "n5", "target": "n6"},
    {"id": "e5", "source": "n6", "target": "n7", "animated": True},
    {"id": "e6", "source": "n7", "target": "n8"},
    {"id": "e7", "source": "n8", "target": "n10"},
    {"id": "e8", "source": "n8", "target": "n12"},
    {"id": "e9", "source": "n8", "target": "n9", "animated": True},
    {"id": "e10", "source": "n9", "target": "n10"},
    {"id": "e11", "source": "n10", "target": "n11", "animated": True, "style": {"strokeDasharray": "5,5"}},
]
templates.append(create_template("modern-saas-stack", "Modern SaaS", "Full-stack template with Next.js frontend, FastAPI backend, Postgres, and Redis caching.", "Featured", t1_nodes, t1_edges))


t2_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": -100, "y": 0}, "data": {"label": "## Kubernetes Microservices\nHigh-scale event-driven architecture."}},
    {"id": "ns_ingress", "type": "k8s-namespace", "position": {"x": -100, "y": 150}, "width": 250, "height": 300, "data": {"label": "ingress-nginx"}},
    {"id": "n2", "parentId": "ns_ingress", "type": "loadBalancer", "position": {"x": 50, "y": 100}, "data": {"label": "External LB"}},
    
    {"id": "ns_apps", "type": "k8s-namespace", "position": {"x": 250, "y": 100}, "width": 400, "height": 500, "data": {"label": "apps"}},
    {"id": "n3", "parentId": "ns_apps", "type": "k8s-service", "position": {"x": 50, "y": 50}, "data": {"label": "API Gateway svc"}},
    {"id": "n4", "parentId": "ns_apps", "type": "microservice", "position": {"x": 200, "y": 50}, "data": {"label": "Auth Service"}},
    {"id": "n5", "parentId": "ns_apps", "type": "microservice", "position": {"x": 200, "y": 200}, "data": {"label": "Order Service"}},
    {"id": "n6", "parentId": "ns_apps", "type": "microservice", "position": {"x": 200, "y": 350}, "data": {"label": "Inventory Service"}},
    
    {"id": "ns_data", "type": "k8s-namespace", "position": {"x": 750, "y": 100}, "width": 450, "height": 500, "data": {"label": "data-infra"}},
    {"id": "n7", "parentId": "ns_data", "type": "bus", "position": {"x": 50, "y": 200}, "data": {"label": "Kafka Cluster"}},
    {"id": "n8", "parentId": "ns_data", "type": "cache", "position": {"x": 250, "y": 50}, "data": {"label": "Redis Cache"}},
    {"id": "n9", "parentId": "ns_data", "type": "database", "position": {"x": 250, "y": 350}, "data": {"label": "PostgreSQL DB"}},
    
    {"id": "n10", "type": "note", "position": {"x": 250, "y": 650}, "data": {"label": "Services communicate asynchronously via Kafka topics."}},
]
t2_edges = [
    {"id": "e1", "source": "n2", "target": "n3", "animated": True},
    {"id": "e2", "source": "n3", "target": "n4"},
    {"id": "e3", "source": "n3", "target": "n5"},
    {"id": "e4", "source": "n3", "target": "n6"},
    {"id": "e5", "source": "n4", "target": "n8"},
    {"id": "e6", "source": "n5", "target": "n7", "animated": True},
    {"id": "e7", "source": "n6", "target": "n7", "animated": True},
    {"id": "e8", "source": "n7", "target": "n5", "animated": True},
    {"id": "e9", "source": "n5", "target": "n9"},
    {"id": "e10", "source": "n6", "target": "n9"},
]
templates.append(create_template("microservices-k8s", "K8s Microservice", "Highly scalable Kubernetes architecture with event streaming.", "Featured", t2_nodes, t2_edges))

t3_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": 0, "y": 0}, "data": {"label": "## Data Lake & Analytics\nModern data stack extracting data from external sources."}},
    {"id": "n2", "type": "api", "position": {"x": 0, "y": 150}, "data": {"label": "Salesforce API"}},
    {"id": "n3", "type": "api", "position": {"x": 0, "y": 300}, "data": {"label": "Stripe API"}},
    {"id": "n4", "type": "database", "position": {"x": 0, "y": 450}, "data": {"label": "Production DB"}},
    
    {"id": "n_elt", "type": "region", "position": {"x": 250, "y": 100}, "width": 250, "height": 450, "data": {"label": "Data Engineering"}},
    {"id": "n5", "parentId": "n_elt", "type": "worker", "position": {"x": 50, "y": 50}, "data": {"label": "Airflow Scheduler"}},
    {"id": "n6", "parentId": "n_elt", "type": "worker", "position": {"x": 50, "y": 200}, "data": {"label": "Fivetran Connectors"}},
    {"id": "n7", "parentId": "n_elt", "type": "worker", "position": {"x": 50, "y": 350}, "data": {"label": "dbt Transformations"}},
    
    {"id": "n_warehouse", "type": "region", "position": {"x": 600, "y": 100}, "width": 300, "height": 450, "data": {"label": "Data Warehouse"}},
    {"id": "n8", "parentId": "n_warehouse", "type": "storage", "position": {"x": 50, "y": 50}, "data": {"label": "S3 Raw Data Lake"}},
    {"id": "n9", "parentId": "n_warehouse", "type": "snowflake", "position": {"x": 50, "y": 250}, "data": {"label": "Snowflake DWH"}},
    
    {"id": "n10", "type": "grafana", "position": {"x": 1000, "y": 250}, "data": {"label": "Looker / BI"}},
    {"id": "n11", "type": "note", "position": {"x": 600, "y": 600}, "data": {"label": "dbt models run inside Snowflake for high performance ELT."}},
]
t3_edges = [
    {"id": "e1", "source": "n2", "target": "n6", "animated": True},
    {"id": "e2", "source": "n3", "target": "n6", "animated": True},
    {"id": "e3", "source": "n4", "target": "n6", "animated": True},
    {"id": "e4", "source": "n5", "target": "n6"},
    {"id": "e5", "source": "n5", "target": "n7"},
    {"id": "e6", "source": "n6", "target": "n8", "animated": True},
    {"id": "e7", "source": "n8", "target": "n9"},
    {"id": "e8", "source": "n7", "target": "n9"},
    {"id": "e9", "source": "n9", "target": "n10"},
]
templates.append(create_template("data-lake-analytics", "Data Analytics", "Modern data stack using S3, Snowflake, and business intelligence tools.", "Featured", t3_nodes, t3_edges))

# CLOUD ARCHITECTURES
t4_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": -200, "y": 0}, "data": {"label": "## Multi-Region High Availability\nActive-Active regional failover with global load balancing."}},
    {"id": "n2", "type": "user", "position": {"x": -200, "y": 300}, "data": {"label": "Internet Users"}},
    {"id": "n3", "type": "route53", "position": {"x": 0, "y": 300}, "data": {"label": "AWS Route 53"}},
    
    {"id": "r1", "type": "region", "position": {"x": 300, "y": 50}, "width": 400, "height": 300, "data": {"label": "us-east-1 (Primary)"}},
    {"id": "n4", "parentId": "r1", "type": "loadBalancer", "position": {"x": 20, "y": 100}, "data": {"label": "ALB"}},
    {"id": "n5", "parentId": "r1", "type": "server", "position": {"x": 150, "y": 20}, "data": {"label": "Web Tier (EC2 ASG)"}},
    {"id": "n6", "parentId": "r1", "type": "server", "position": {"x": 150, "y": 180}, "data": {"label": "App Tier (EC2 ASG)"}},
    {"id": "n7", "parentId": "r1", "type": "database", "position": {"x": 280, "y": 100}, "data": {"label": "RDS Master"}},
    
    {"id": "r2", "type": "region", "position": {"x": 300, "y": 450}, "width": 400, "height": 300, "data": {"label": "eu-west-1 (Secondary)"}},
    {"id": "n8", "parentId": "r2", "type": "loadBalancer", "position": {"x": 20, "y": 100}, "data": {"label": "ALB"}},
    {"id": "n9", "parentId": "r2", "type": "server", "position": {"x": 150, "y": 20}, "data": {"label": "Web Tier (EC2 ASG)"}},
    {"id": "n10", "parentId": "r2", "type": "server", "position": {"x": 150, "y": 180}, "data": {"label": "App Tier (EC2 ASG)"}},
    {"id": "n11", "parentId": "r2", "type": "database", "position": {"x": 280, "y": 100}, "data": {"label": "RDS Read Replica"}},
    
    {"id": "n12", "type": "note", "position": {"x": 800, "y": 350}, "data": {"label": "Cross-region DB replication keeps the secondary region in sync."}},
]
t4_edges = [
    {"id": "e1", "source": "n2", "target": "n3", "animated": True},
    {"id": "e2", "source": "n3", "target": "n4", "animated": True},
    {"id": "e3", "source": "n3", "target": "n8", "animated": True, "style": {"strokeDasharray": "5,5"}},
    {"id": "e4", "source": "n4", "target": "n5"},
    {"id": "e5", "source": "n4", "target": "n6"},
    {"id": "e6", "source": "n5", "target": "n6"},
    {"id": "e7", "source": "n6", "target": "n7"},
    {"id": "e8", "source": "n8", "target": "n9"},
    {"id": "e9", "source": "n8", "target": "n10"},
    {"id": "e10", "source": "n9", "target": "n10"},
    {"id": "e11", "source": "n10", "target": "n11"},
    {"id": "e12", "source": "n7", "target": "n11", "animated": True, "style": {"strokeDasharray": "5,5"}},
]
templates.append(create_template("multi-region-ha", "Multi-Region HA", "Deploy a highly available architecture across multiple regions with automatic failover.", "Cloud Architectures", t4_nodes, t4_edges))

t5_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": 0, "y": 0}, "data": {"label": "## Serverless API\nFully managed API utilizing AWS Lambda and DynamoDB."}},
    {"id": "n2", "type": "user", "position": {"x": 0, "y": 200}, "data": {"label": "SPA App"}},
    {"id": "n3", "type": "cdn", "position": {"x": 200, "y": 100}, "data": {"label": "CloudFront"}},
    {"id": "n4", "type": "storage", "position": {"x": 400, "y": 0}, "data": {"label": "S3 (Frontend)"}},
    
    {"id": "n5", "type": "gateway", "position": {"x": 400, "y": 200}, "data": {"label": "API Gateway"}},
    {"id": "n6", "type": "auth0", "position": {"x": 400, "y": 400}, "data": {"label": "Cognito Auth"}},
    
    {"id": "r1", "type": "region", "position": {"x": 650, "y": 50}, "width": 300, "height": 450, "data": {"label": "Compute & Data"}},
    {"id": "n7", "parentId": "r1", "type": "logic", "position": {"x": 50, "y": 50}, "data": {"label": "GetUsers Lambda"}},
    {"id": "n8", "parentId": "r1", "type": "logic", "position": {"x": 50, "y": 150}, "data": {"label": "CreateUser Lambda"}},
    {"id": "n9", "parentId": "r1", "type": "logic", "position": {"x": 50, "y": 250}, "data": {"label": "Billing Lambda"}},
    {"id": "n10", "parentId": "r1", "type": "database", "position": {"x": 180, "y": 150}, "data": {"label": "DynamoDB Table"}},
]
t5_edges = [
    {"id": "e1", "source": "n2", "target": "n3"},
    {"id": "e2", "source": "n3", "target": "n4"},
    {"id": "e3", "source": "n2", "target": "n5", "animated": True},
    {"id": "e4", "source": "n5", "target": "n6", "style": {"strokeDasharray": "5,5"}},
    {"id": "e5", "source": "n5", "target": "n7", "animated": True},
    {"id": "e6", "source": "n5", "target": "n8", "animated": True},
    {"id": "e7", "source": "n5", "target": "n9", "animated": True},
    {"id": "e8", "source": "n7", "target": "n10"},
    {"id": "e9", "source": "n8", "target": "n10"},
    {"id": "e10", "source": "n9", "target": "n10"},
]
templates.append(create_template("serverless-api", "Serverless API", "Fully managed serverless API with Lambda functions and DynamoDB.", "Cloud Architectures", t5_nodes, t5_edges))

t6_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": 0, "y": 0}, "data": {"label": "## Event-Driven Pipeline\nAsynchronous processing workflow using SQS, EventBridge, and Lambda."}},
    {"id": "n2", "type": "app", "position": {"x": 0, "y": 250}, "data": {"label": "Order Service"}},
    {"id": "n3", "type": "bus", "position": {"x": 250, "y": 250}, "data": {"label": "EventBridge"}},
    
    {"id": "r1", "type": "region", "position": {"x": 500, "y": 50}, "width": 450, "height": 450, "data": {"label": "Event Consumers"}},
    {"id": "n4", "parentId": "r1", "type": "queue", "position": {"x": 20, "y": 50}, "data": {"label": "Fulfillment SQS"}},
    {"id": "n5", "parentId": "r1", "type": "logic", "position": {"x": 180, "y": 50}, "data": {"label": "Fulfillment Lambda"}},
    {"id": "n6", "parentId": "r1", "type": "api", "position": {"x": 330, "y": 50}, "data": {"label": "3PL API"}},
    
    {"id": "n7", "parentId": "r1", "type": "queue", "position": {"x": 20, "y": 200}, "data": {"label": "Email SQS"}},
    {"id": "n8", "parentId": "r1", "type": "logic", "position": {"x": 180, "y": 200}, "data": {"label": "Email Lambda"}},
    {"id": "n9", "parentId": "r1", "type": "api", "position": {"x": 330, "y": 200}, "data": {"label": "SendGrid"}},
    
    {"id": "n10", "parentId": "r1", "type": "queue", "position": {"x": 20, "y": 350}, "data": {"label": "Analytics SQS"}},
    {"id": "n11", "parentId": "r1", "type": "logic", "position": {"x": 180, "y": 350}, "data": {"label": "Analytics Lambda"}},
    {"id": "n12", "parentId": "r1", "type": "storage", "position": {"x": 330, "y": 350}, "data": {"label": "S3 Data Lake"}},
]
t6_edges = [
    {"id": "e1", "source": "n2", "target": "n3", "animated": True},
    {"id": "e2", "source": "n3", "target": "n4", "animated": True},
    {"id": "e3", "source": "n3", "target": "n7", "animated": True},
    {"id": "e4", "source": "n3", "target": "n10", "animated": True},
    {"id": "e5", "source": "n4", "target": "n5", "animated": True},
    {"id": "e6", "source": "n5", "target": "n6"},
    {"id": "e7", "source": "n7", "target": "n8", "animated": True},
    {"id": "e8", "source": "n8", "target": "n9"},
    {"id": "e9", "source": "n10", "target": "n11", "animated": True},
    {"id": "e10", "source": "n11", "target": "n12"},
]
templates.append(create_template("event-driven", "Event Pipeline", "Serverless data pipeline using SQS, Lambda, and S3 with built-in monitoring.", "Cloud Architectures", t6_nodes, t6_edges))


# FULL-STACK
t7_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": -200, "y": 0}, "data": {"label": "## MERN Stack Architecture\nThe classic Mongo, Express, React, Node application."}},
    {"id": "n2", "type": "user", "position": {"x": -200, "y": 250}, "data": {"label": "Client"}},
    
    {"id": "r1", "type": "region", "position": {"x": 50, "y": 100}, "width": 800, "height": 350, "data": {"label": "Production Environment"}},
    {"id": "n3", "parentId": "r1", "type": "app", "position": {"x": 50, "y": 150}, "data": {"label": "React SPA"}},
    {"id": "n4", "parentId": "r1", "type": "loadBalancer", "position": {"x": 250, "y": 150}, "data": {"label": "Nginx Proxy"}},
    {"id": "n5", "parentId": "r1", "type": "server", "position": {"x": 450, "y": 50}, "data": {"label": "Express API (Node)"}},
    {"id": "n6", "parentId": "r1", "type": "server", "position": {"x": 450, "y": 250}, "data": {"label": "Express API (Node)"}},
    {"id": "n7", "parentId": "r1", "type": "database", "position": {"x": 650, "y": 150}, "data": {"label": "MongoDB Replica Set"}},
    
    {"id": "n8", "type": "github_actions", "position": {"x": 450, "y": -100}, "data": {"label": "CI/CD Pipeline"}},
]
t7_edges = [
    {"id": "e1", "source": "n2", "target": "n3"},
    {"id": "e2", "source": "n3", "target": "n4", "animated": True},
    {"id": "e3", "source": "n4", "target": "n5", "animated": True},
    {"id": "e4", "source": "n4", "target": "n6", "animated": True},
    {"id": "e5", "source": "n5", "target": "n7"},
    {"id": "e6", "source": "n6", "target": "n7"},
    {"id": "e7", "source": "n8", "target": "n5", "style": {"strokeDasharray": "5,5"}},
    {"id": "e8", "source": "n8", "target": "n6", "style": {"strokeDasharray": "5,5"}},
    {"id": "e9", "source": "n8", "target": "n3", "style": {"strokeDasharray": "5,5"}},
]
templates.append(create_template("mern-stack", "MERN Stack", "Classic MongoDB, Express, React, Node.js full-stack application.", "Full-Stack", t7_nodes, t7_edges))

t8_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": 0, "y": 0}, "data": {"label": "## Jamstack with Headless CMS\nGlobal edge delivery for static sites."}},
    {"id": "n2", "type": "user", "position": {"x": 0, "y": 200}, "data": {"label": "Global Users"}},
    {"id": "n3", "type": "cdn", "position": {"x": 250, "y": 200}, "data": {"label": "Edge Network (CDN)"}},
    
    {"id": "r1", "type": "region", "position": {"x": 500, "y": 50}, "width": 400, "height": 300, "data": {"label": "Content Management"}},
    {"id": "n4", "parentId": "r1", "type": "api", "position": {"x": 50, "y": 50}, "data": {"label": "Headless CMS"}},
    {"id": "n5", "parentId": "r1", "type": "database", "position": {"x": 250, "y": 50}, "data": {"label": "Content DB"}},
    {"id": "n6", "parentId": "r1", "type": "github_actions", "position": {"x": 50, "y": 200}, "data": {"label": "Static Builder"}},
    {"id": "n7", "parentId": "r1", "type": "storage", "position": {"x": 250, "y": 200}, "data": {"label": "Object Storage"}},
]
t8_edges = [
    {"id": "e1", "source": "n2", "target": "n3"},
    {"id": "e2", "source": "n4", "target": "n5"},
    {"id": "e3", "source": "n4", "target": "n6", "animated": True, "style": {"strokeDasharray": "5,5"}},
    {"id": "e4", "source": "n6", "target": "n7", "animated": True},
    {"id": "e5", "source": "n7", "target": "n3"},
]
templates.append(create_template("jamstack-cms", "Jamstack CMS", "Modern static site generation paired with a headless CMS via CDN.", "Full-Stack", t8_nodes, t8_edges))

t9_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": 0, "y": 0}, "data": {"label": "## Next.js + Auth0 + PlanetScale\nModern enterprise-grade React stack."}},
    {"id": "n2", "type": "user", "position": {"x": 0, "y": 250}, "data": {"label": "Web Client"}},
    
    {"id": "r1", "type": "region", "position": {"x": 250, "y": 50}, "width": 550, "height": 450, "data": {"label": "Vercel Infrastructure"}},
    {"id": "n3", "parentId": "r1", "type": "cdn", "position": {"x": 50, "y": 200}, "data": {"label": "Edge CDN"}},
    {"id": "n4", "parentId": "r1", "type": "app", "position": {"x": 250, "y": 50}, "data": {"label": "Next.js App Router"}},
    {"id": "n5", "parentId": "r1", "type": "logic", "position": {"x": 250, "y": 200}, "data": {"label": "Server Actions"}},
    {"id": "n6", "parentId": "r1", "type": "api", "position": {"x": 250, "y": 350}, "data": {"label": "API Routes"}},
    {"id": "n7", "parentId": "r1", "type": "cache", "position": {"x": 400, "y": 200}, "data": {"label": "KV Cache"}},
    
    {"id": "n8", "type": "auth0", "position": {"x": 900, "y": 100}, "data": {"label": "Auth0 Identity"}},
    {"id": "n9", "type": "database", "position": {"x": 900, "y": 400}, "data": {"label": "PlanetScale DB"}},
]
t9_edges = [
    {"id": "e1", "source": "n2", "target": "n3", "animated": True},
    {"id": "e2", "source": "n3", "target": "n4"},
    {"id": "e3", "source": "n3", "target": "n5", "animated": True},
    {"id": "e4", "source": "n3", "target": "n6", "animated": True},
    {"id": "e5", "source": "n5", "target": "n7"},
    {"id": "e6", "source": "n6", "target": "n7"},
    {"id": "e7", "source": "n5", "target": "n8", "style": {"strokeDasharray": "5,5"}},
    {"id": "e8", "source": "n6", "target": "n8", "style": {"strokeDasharray": "5,5"}},
    {"id": "e9", "source": "n5", "target": "n9", "animated": True},
    {"id": "e10", "source": "n6", "target": "n9", "animated": True},
]
templates.append(create_template("nextjs-app-router", "NextJS Auth0", "Next.js App Router with PostgreSQL database and Auth0 identity.", "Full-Stack", t9_nodes, t9_edges))

# DATA PIPELINES
t10_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": 0, "y": 0}, "data": {"label": "## Real-time Telemetry Streaming\nHigh-throughput streaming pipeline using Kafka, Clickhouse, and Grafana."}},
    {"id": "n2", "type": "app", "position": {"x": 0, "y": 250}, "data": {"label": "IoT Devices"}},
    {"id": "n3", "type": "gateway", "position": {"x": 200, "y": 250}, "data": {"label": "Telemetry Ingestion"}},
    
    {"id": "r1", "type": "region", "position": {"x": 450, "y": 50}, "width": 550, "height": 450, "data": {"label": "Data Platform"}},
    {"id": "n4", "parentId": "r1", "type": "bus", "position": {"x": 50, "y": 200}, "data": {"label": "Kafka Cluster"}},
    {"id": "n5", "parentId": "r1", "type": "worker", "position": {"x": 250, "y": 50}, "data": {"label": "Flink Streaming"}},
    {"id": "n6", "parentId": "r1", "type": "worker", "position": {"x": 250, "y": 350}, "data": {"label": "Kafka Connect"}},
    {"id": "n7", "parentId": "r1", "type": "clickhouse", "position": {"x": 400, "y": 200}, "data": {"label": "Clickhouse OLAP"}},
    
    {"id": "n8", "type": "grafana", "position": {"x": 1100, "y": 250}, "data": {"label": "Grafana Dashboards"}},
]
t10_edges = [
    {"id": "e1", "source": "n2", "target": "n3", "animated": True},
    {"id": "e2", "source": "n3", "target": "n4", "animated": True},
    {"id": "e3", "source": "n4", "target": "n5", "animated": True},
    {"id": "e4", "source": "n5", "target": "n4", "animated": True},
    {"id": "e5", "source": "n4", "target": "n6", "animated": True},
    {"id": "e6", "source": "n6", "target": "n7", "animated": True},
    {"id": "e7", "source": "n5", "target": "n7", "animated": True},
    {"id": "e8", "source": "n7", "target": "n8"},
]
templates.append(create_template("real-time-streaming", "Streaming Pipe", "High-throughput streaming pipeline using Kafka, Clickhouse, and Grafana.", "Data Pipelines", t10_nodes, t10_edges))

t11_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": 0, "y": 0}, "data": {"label": "## Nightly Batch Processing\nExtract, Transform, Load (ETL) pipeline with Spark and S3."}},
    {"id": "n2", "type": "database", "position": {"x": 0, "y": 250}, "data": {"label": "App DB (MySQL)"}},
    {"id": "n3", "type": "api", "position": {"x": 0, "y": 400}, "data": {"label": "Sales API"}},
    
    {"id": "r1", "type": "region", "position": {"x": 250, "y": 50}, "width": 600, "height": 550, "data": {"label": "AWS Big Data Setup"}},
    {"id": "n4", "parentId": "r1", "type": "logic", "position": {"x": 50, "y": 50}, "data": {"label": "AWS Step Functions"}},
    {"id": "n5", "parentId": "r1", "type": "storage", "position": {"x": 50, "y": 200}, "data": {"label": "S3 Raw Zone"}},
    {"id": "n6", "parentId": "r1", "type": "worker", "position": {"x": 250, "y": 200}, "data": {"label": "EMR Spark Cluster"}},
    {"id": "n7", "parentId": "r1", "type": "storage", "position": {"x": 450, "y": 200}, "data": {"label": "S3 Curated Zone"}},
    {"id": "n8", "parentId": "r1", "type": "database", "position": {"x": 450, "y": 400}, "data": {"label": "Redshift DWH"}},
    
    {"id": "n9", "type": "note", "position": {"x": 900, "y": 250}, "data": {"label": "Spark jobs process the data and write Parquet files to the Curated Zone."}},
]
t11_edges = [
    {"id": "e1", "source": "n2", "target": "n5"},
    {"id": "e2", "source": "n3", "target": "n5"},
    {"id": "e3", "source": "n4", "target": "n6", "style": {"strokeDasharray": "5,5"}},
    {"id": "e4", "source": "n5", "target": "n6", "animated": True},
    {"id": "e5", "source": "n6", "target": "n7", "animated": True},
    {"id": "e6", "source": "n7", "target": "n8"},
]
templates.append(create_template("batch-processing", "Batch Processing", "Daily batch processing pipeline pulling from S3 into Snowflake.", "Data Pipelines", t11_nodes, t11_edges))

t12_nodes = [
    {"id": "n1", "type": "annotation", "position": {"x": 0, "y": 0}, "data": {"label": "## ELK Log Analytics Stack\nCentralized logging and operational metrics."}},
    {"id": "r1", "type": "region", "position": {"x": 0, "y": 100}, "width": 300, "height": 400, "data": {"label": "Application Cluster"}},
    {"id": "n2", "parentId": "r1", "type": "microservice", "position": {"x": 50, "y": 50}, "data": {"label": "Frontend Pods"}},
    {"id": "n3", "parentId": "r1", "type": "microservice", "position": {"x": 50, "y": 200}, "data": {"label": "Backend Pods"}},
    
    {"id": "r2", "type": "region", "position": {"x": 400, "y": 100}, "width": 600, "height": 400, "data": {"label": "Monitoring & Logging"}},
    {"id": "n4", "parentId": "r2", "type": "worker", "position": {"x": 50, "y": 120}, "data": {"label": "Fluentd/Logstash"}},
    {"id": "n5", "parentId": "r2", "type": "search", "position": {"x": 250, "y": 120}, "data": {"label": "Elasticsearch Cluster"}},
    {"id": "n6", "parentId": "r2", "type": "grafana", "position": {"x": 450, "y": 50}, "data": {"label": "Kibana Dashboard"}},
    {"id": "n7", "parentId": "r2", "type": "prometheus", "position": {"x": 250, "y": 250}, "data": {"label": "Prometheus Metrics"}},
    {"id": "n8", "parentId": "r2", "type": "grafana", "position": {"x": 450, "y": 250}, "data": {"label": "Grafana"}},
]
t12_edges = [
    {"id": "e1", "source": "n2", "target": "n4", "animated": True},
    {"id": "e2", "source": "n3", "target": "n4", "animated": True},
    {"id": "e3", "source": "n2", "target": "n7", "animated": True, "style": {"strokeDasharray": "5,5"}},
    {"id": "e4", "source": "n3", "target": "n7", "animated": True, "style": {"strokeDasharray": "5,5"}},
    {"id": "e5", "source": "n4", "target": "n5", "animated": True},
    {"id": "e6", "source": "n5", "target": "n6"},
    {"id": "e7", "source": "n7", "target": "n8"},
]
templates.append(create_template("log-analytics", "Log Analytics", "Centralized logging with Elasticsearch and Kibana for fast operational insights.", "Data Pipelines", t12_nodes, t12_edges))

# Generate TS code
ts_code = 'import { TemplateDefinition } from "./types";\n\n' # I'll need to define the type or just use the inline interface
ts_code = '''export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  category: "Featured" | "Cloud Architectures" | "Full-Stack" | "Data Pipelines";
  nodes: any[];
  edges: any[];
}

export const PRELOADED_TEMPLATES: TemplateDefinition[] = ''' + json.dumps(templates, indent=2) + ';'

with open("client/src/lib/templates.ts", "w") as f:
    f.write(ts_code)

print("done")
