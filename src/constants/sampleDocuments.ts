export interface SampleDocument {
  id: string;
  name: string;
  markdown: string;
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: 'product-spec',
    name: 'Software Specification',
    markdown: `# CloudSync Architecture & Technical Specification

> [!NOTE]
> This document describes the v2.4 distributed storage synchronization architecture and client protocol specification.

## 1. Executive Overview

CloudSync delivers resilient real-time file synchronization across distributed desktop and mobile clients with zero-knowledge encryption and delta compression.

### Core Objectives
- **Sub-100ms** latency for metadata propagation
- **99.999%** durability across multi-region object storage
- Zero-downtime rolling protocol migrations

---

## 2. System Architecture

The following key subsystems operate in concert:

1. **Client Daemon**: Local filesystem event watcher and chunk deduplicator
2. **Gateway API**: High-throughput WebSocket/gRPC termination cluster
3. **Storage Engine**: Chunk-addressed block store with Reed-Solomon erasure coding

### Performance Benchmark Comparison

| Component | Target P95 Latency | Throughput (req/sec) | Error Budget |
| :--- | :--- | :--- | :--- |
| Auth Gateway | 14 ms | 45,000 | 0.01% |
| Chunk Hasher (SHA-256) | 32 ms | 120,000 | 0.001% |
| Sync Coordinator | 48 ms | 85,000 | 0.005% |
| Metadata WAL | 18 ms | 60,000 | 0.002% |

---

## 3. Implementation Code Example

Below is the chunk deduplication interface implemented in TypeScript:

\`\`\`typescript
export interface BlockManifest {
  blockId: string;
  checksumSha256: string;
  byteLength: number;
  compressionRatio: number;
}

export async function processFileChunk(buffer: Uint8Array): Promise<BlockManifest> {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  const hashHex = Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return {
    blockId: \`blk_\${hashHex.slice(0, 16)}\`,
    checksumSha256: hashHex,
    byteLength: buffer.byteLength,
    compressionRatio: 0.74,
  };
}
\`\`\`

---

## 4. Operational Checklist & Milestones

- [x] Provision multi-region Kafka ingestion pipeline
- [x] Complete security audit for client-side cryptographic envelope
- [ ] Implement chunk-level differential sync in desktop client
- [ ] Perform load test at 250,000 concurrent WebSocket connections

> [!WARNING]
> Ensure all client keys are derived via Argon2id with at least 64MB memory cost before writing chunks to disk.
`,
  },
  {
    id: 'business-memo',
    name: 'Executive Business Memo',
    markdown: `# Strategic Initiative: Enterprise Expansion Q3/Q4

**Date:** October 7, 2026  
**From:** Corporate Strategy Team  
**To:** Executive Committee  
**Subject:** High-Value Enterprise Modernization Strategy  

---

## Executive Summary

Over the past two quarters, enterprise demand for on-premises and private-cloud compliance workflows has accelerated by **43% year-over-year**. This memorandum outlines our proposed resource reallocation to capture this market segment.

### Key Financial Highlights
- Projected Net Revenue Increase: **$4.8M in FY27**
- Customer Acquisition Cost (CAC) reduction: **-18%**
- Net Revenue Retention (NRR): **118%** target benchmark

---

## Strategic Action Items

| Priority | Initiative | Responsible Owner | Target Timeline | Status |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | SOC-2 Type II Certification | Security / Legal | Q3 Week 4 | In Progress |
| **P0** | SSO / SAML 2.0 Integration | Core Engineering | Q3 Week 6 | Complete |
| **P1** | Dedicated European Data Residency | Infrastructure | Q4 Week 2 | Planned |
| **P2** | Custom SLA Tier & Dedicated TAM | Customer Success | Q4 Week 8 | Review |

---

## Recommendations & Next Steps

> [!IMPORTANT]
> Executive sign-off is required by the end of this sprint to guarantee procurement allocations for the European cluster expansion.

1. **Reallocate 4 senior backend engineers** to the identity federation team.
2. **Authorize procurement** for Frankfurt (eu-central-1) sovereign cloud reserve instances.
3. Schedule investor briefing for the updated annual recurring revenue projection.
`,
  },
  {
    id: 'academic-paper',
    name: 'Academic Research Paper',
    markdown: `# Empirical Evaluation of Transformer Attention Optimization

**Author:** Dr. Elena Vance, Department of Computer Science  
**Institution:** Institute for Advanced Computing  

---

## Abstract

Transformer architectures rely heavily on self-attention mechanisms with quadratic computational complexity relative to sequence length. In this paper, we evaluate modern sparse attention heuristics and kernel fusion optimizations across dense language modeling workloads.

## 1. Introduction

The core computational bottleneck of standard self-attention stems from the materialization of the full $N \\times N$ attention matrix:

$$Attention(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

When sequence lengths exceed 8,192 tokens, GPU high-bandwidth memory (HBM) bandwidth saturates prior to arithmetic intensity saturation.

### 1.1 Hypotheses
- Memory IO-aware tiling yields super-linear wall-clock acceleration.
- Precision quantization to FP8 retains perplexity within 0.05 tolerance.

---

## 2. Experimental Methodology

We evaluated three separate attention kernels across an identical 7B parameter foundation model:

1. **Standard Flash Attention v2** with fused softmax
2. **Sliding-Window Attention** with chunk size 512
3. **Block-Sparse Paged Attention** with dynamic KV-caching

### Quantitative Results

| Sequence Length | Standard Baseline (ms) | Fused Kernel (ms) | Speedup Ratio | Memory Footprint |
| :--- | :--- | :--- | :--- | :--- |
| 2,048 tokens | 8.4 ms | 3.1 ms | 2.71x | 1.8 GB |
| 4,096 tokens | 29.2 ms | 8.9 ms | 3.28x | 3.4 GB |
| 8,192 tokens | 114.5 ms | 24.6 ms | 4.65x | 6.8 GB |
| 16,384 tokens | OOM Exception | 67.2 ms | > 10.0x | 13.5 GB |

---

## 3. Conclusions

Tiling techniques that exploit SRAM registers eliminate superfluous round-trips to HBM, providing scalable memory bounds for extended context windows.
`,
  },
];
