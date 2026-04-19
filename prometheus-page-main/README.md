# Prometheus Suite

alright so this is Prometheus Suite – basically my answer to overpriced business software in the Philippines (and honestly anywhere else that's getting gouged)

## why this exists

saw The Prominent charging ₱8k/month for what looks like software from 2015 and thought "yeah that's fucked." small businesses can't afford that shit. sari-sari stores, carinderias, small retail shops – they're stuck using notebooks and calculators because everything else costs more than their rent.

so Prometheus Suite is the affordable alternative. $10/month per product, or $20/month for the entire suite. modern interface, actually works, doesn't cost a kidney.

## the products

starting with **Prometheus POS** because every business needs to sell stuff. then expanding to:
- **Prometheus Inventory** - track stock, know when to reorder, stop guessing
- **Prometheus Accounting** - see if you're actually making money without hiring a bookkeeper
- maybe **Prometheus Employee** later for scheduling and time tracking

each product works standalone but they integrate seamlessly. buy what you need now, add more later, or just get the suite and have everything.

## tech decisions

**Spring Boot** for the backend because this is enterprise-level reliability requirements even if the businesses are small. handling money and inventory means you need rock-solid transaction management and ACID compliance. plus the JVM ecosystem is mature as hell and Spring's tooling is excellent.

**Angular** for the frontend because I want structure and consistency across all the products. it's opinionated which means fewer decisions about which random libraries to use for every feature. steeper learning curve but faster development once you know it.

**PostgreSQL** for the database because MongoDB was a terrible idea for POS systems. you NEED proper ACID transactions when you're doing multi-step operations like recording a sale + updating inventory + logging payment. if anything fails halfway through, the whole thing needs to roll back cleanly. Postgres handles this perfectly and has great Spring Boot support.

## data model basics

keeping it relational because that's what makes sense here. main entities:

**Products** - what you're selling (name, price, sku, category)
**Inventory** - how much you have (quantity, reorder levels, location)
**Transactions** - the actual sales (date, total, employee, customer, payment method)
**Transaction_Items** - line items in each sale (links transactions to products, stores quantity and price at time of sale)
**Customers** - people who buy stuff (contact info, loyalty points)
**Employees** - people who work the register (name, role, pin)

no nested bullshit, just proper foreign keys and joins. each transaction links to transaction_items which link to products. clean, queryable, maintainable.

## why build this

couple reasons:
1. Filipino businesses genuinely need cheaper software and everything available sucks or costs too much
2. building a full suite of integrated products is excellent portfolio work – shows I can ship complete systems, not just tutorial clones
3. each product I build demonstrates different aspects of full-stack development (transaction handling, inventory logic, financial calculations, etc)
4. it's fun and I'm in my Greek mythology phase so the name works lmao

## current status

building the landing page first to gauge interest before writing a single line of backend code. if businesses actually sign up for the waitlist, then I know it's worth building. if nobody cares, I learned that without wasting months.

once there's validation, shipping Prometheus POS as the first product. get it stable and functional, then expand to inventory management since it integrates naturally with every sale.

## what success looks like

short term: functional POS system that a few businesses could actually use
medium term: 2-3 products in the suite working together smoothly
long term: portfolio piece showing I can build production-grade SaaS + maybe actual revenue if this turns into a real business

but honestly even if this never makes money, having a complete functional suite of business tools on my GitHub when I'm 17-18 is gonna make recruiters lose their shit in a good way.

---

built by andréi because someone had to do it