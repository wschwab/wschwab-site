---
title: Tools & Nodes
role: Perpetual Operator
period: always
tags: [Infrastructure, Tooling]
soft_tags: [Always Learning]
summary: >-
  I run things to understand them: Ethereum nodes and an indexer, IPFS and
  Swarm, Radicle. Lately I've been working on the AI stack: harnesses, skills,
  MCP, local models via ollama and vLLM, libre frontends.
featured: 6
---

I run things to understand them: Ethereum nodes and an indexer, IPFS and Swarm,
Radicle. Lately that means the AI stack: harnesses, skills, MCP, local models
via ollama and vLLM, libre frontends (Open WebUI, LibreChat). If it ships,
and it looks cool, I want to spin it up.

**Case study: this website.** You can reach it on the regular web at
wschwab.xyz, deployed through Cloudflare — but also at wschwab.gwei.domains,
resolved on-chain and served from IPFS (and, once IPNS support lands there,
at wschwab.wei.domains). Every publish runs a custom script in the repo that
pushes the code to GitHub, Radicle, and IPFS, and even emits calldata for
potentially updating the on-chain contenthash. One site, no single point of
failure.
