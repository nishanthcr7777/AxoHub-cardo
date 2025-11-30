10-Phase Roadmap for Building the Web3 Package Manager
Project: AxoHub - Decentralized Smart Contract Registry for Cardano
Team: HEXECUTIONERS
Lead: Nishanth B
Date: November 25, 2025

Executive Summary
AxoHub is a Cardano-native smart contract registry and package manager—the "npm for Web3"—enabling developers to publish, verify, discover, and reuse Plutus/Aiken smart contract modules. This implementation plan outlines a 10-phase approach to build a production-ready platform with cross-chain awareness, DID integration, and optional ZK privacy features via Midnight.

Key Differentiators:

First Cardano-native contract registry
Cross-chain mapping (EVM ↔ Cardano)
DID-based developer identity (Atala PRISM)
Private publishing via Midnight ZK contracts
40-60% reduction in development time
Architecture Overview
Based on the provided diagrams, AxoHub consists of:

User Layer
Developer users who publish and discover packages
Frontend Layer
React + TailwindCSS application
Wallet adapters (Nami, Eternl, Lace)
Backend Layer
Node.js orchestrator
Lucid SDK for Cardano interaction
Blockfrost API indexer
Off-chain Services
IPFS storage (metadata + source code)
Blockfrost indexer (on-chain registry data)
Hydra Head (optional, for instant feedback)
Cardano L1
Registry Smart Contract (Plutus/Aiken)
Cardano Preprod testnet
Atala PRISM DIDs
Midnight integration (ZK contracts)
10-Phase Implementation Plan
Phase 1: Foundation & Setup
Duration: 2 weeks
Goal: Establish development environment and core infrastructure

Tasks
1.1 Development Environment
 Set up Cardano node (Preprod testnet)
 Install Lucid SDK and configure
 Set up Blockfrost API account and keys
 Configure IPFS node (Pinata or Infura)
 Install Aiken/Plutus development tools
1.2 Project Structure
 Initialize monorepo structure (frontend + backend + contracts)
 Set up TypeScript configuration
 Configure ESLint, Prettier
 Set up Git repository with CI/CD (GitHub Actions)
1.3 Wallet Integration
 Integrate Nami wallet adapter
 Integrate Eternl wallet adapter
 Integrate Lace wallet adapter
 Create wallet connection UI component
 Implement wallet state management
1.4 Basic UI Framework
 Reuse existing React + TailwindCSS setup
 Create Cardano-specific theme tokens
 Build wallet connection header
 Create navigation sidebar
 Set up routing structure
Deliverables:

✅ Working development environment
✅ Wallet connection functional
✅ Basic UI shell
Phase 2: Smart Contract Development
Duration: 3 weeks
Goal: Build and deploy core registry smart contracts

Tasks
2.1 Registry Contract Design
 Define contract data models (Package, Source, Version)
 Design UTxO structure for registry entries
 Create contract parameter types
 Define redeemer actions (Publish, Update, Verify)
2.2 Package Registry Contract (Aiken)
// Package registry datum structure
type PackageMetadata {
  name: ByteArray,
  version: ByteArray,
  author_did: ByteArray,
  ipfs_cid: ByteArray,
  source_hash: ByteArray,
  license: ByteArray,
  category: PackageCategory,
  audit_status: AuditStatus,
  timestamp: POSIXTime
}
validator package_registry {
  fn publish(datum: PackageMetadata, redeemer: Action, ctx: ScriptContext) -> Bool
  fn update(datum: PackageMetadata, redeemer: Action, ctx: ScriptContext) -> Bool
  fn verify(datum: PackageMetadata, redeemer: Action, ctx: ScriptContext) -> Bool
}
2.3 Source Verification Contract
 Implement hash verification logic
 Create bytecode comparison validator
 Add audit tag mechanism
 Implement version tracking
2.4 Contract Testing
 Write unit tests for all validators
 Create integration tests with Lucid
 Test on Preprod testnet
 Perform security audit (basic)
2.5 Contract Deployment
 Deploy to Cardano Preprod
 Generate contract addresses
 Create deployment documentation
 Set up contract monitoring
Deliverables:

✅ Deployed Package Registry contract
✅ Deployed Source Verification contract
✅ Contract addresses and documentation
✅ Test suite with >80% coverage
Phase 3: IPFS Integration
Duration: 1.5 weeks
Goal: Implement decentralized storage for contract metadata and source code

Tasks
3.1 IPFS Service Layer
 Create IPFS client wrapper (Pinata/Infura)
 Implement file upload functionality
 Add metadata upload (JSON)
 Create CID retrieval methods
 Add pinning service integration
3.2 Content Types
 Support Plutus source code (.hs)
 Support Aiken source code (.ak)
 Support Solidity source code (.sol) for cross-chain
 Support package metadata (JSON)
 Support ABI files
3.3 Storage Utilities
// lib/ipfs-cardano.ts
export interface IPFSService {
  uploadSource(code: string, language: 'plutus' | 'aiken' | 'solidity'): Promise<string>
  uploadMetadata(metadata: PackageMetadata): Promise<string>
  uploadABI(abi: object): Promise<string>
  retrieveContent(cid: string): Promise<string>
  pinContent(cid: string): Promise<void>
}
3.4 Hash Generation
 Implement SHA-256 hashing for source code
 Create CBOR serialization for metadata
 Add hash verification utilities
 Build hash comparison tools
Deliverables:

✅ IPFS service module
✅ Upload/download functionality
✅ Hash generation utilities
✅ Integration tests
Phase 4: Backend API Development
Duration: 2 weeks
Goal: Build Node.js backend for contract interaction and indexing

Tasks
4.1 Lucid SDK Integration
 Initialize Lucid with Blockfrost provider
 Create transaction builder utilities
 Implement UTxO selection logic
 Add transaction signing helpers
4.2 Contract Interaction Layer
// backend/services/registry.service.ts
export class RegistryService {
  async publishPackage(metadata: PackageMetadata, walletAddress: string): Promise<TxHash>
  async updatePackage(packageId: string, updates: Partial<PackageMetadata>): Promise<TxHash>
  async verifySource(packageId: string, sourceHash: string): Promise<TxHash>
  async queryPackages(filters: PackageFilters): Promise<Package[]>
  async getPackageById(id: string): Promise<Package>
}
4.3 Blockfrost Indexer
 Create Blockfrost API client
 Implement registry data indexing
 Build query endpoints (search, filter)
 Add pagination support
 Cache frequently accessed data
4.4 REST API Endpoints
 POST /api/packages/publish - Publish package
 GET /api/packages - List packages
 GET /api/packages/:id - Get package details
 POST /api/packages/:id/verify - Verify source
 GET /api/packages/search - Search packages
 GET /api/sources - List sources
 POST /api/sources/submit - Submit source code
4.5 Error Handling & Validation
 Add Zod schema validation
 Implement error middleware
 Create custom error types
 Add request logging
Deliverables:

✅ Backend API server
✅ Lucid integration
✅ Blockfrost indexer
✅ API documentation (Swagger)
Phase 5: Frontend Development
Duration: 3 weeks
Goal: Build complete user interface for package management

Tasks
5.1 Package Publishing Flow
 Multi-step form component (reuse existing)
 Package metadata input
 Source code upload
 IPFS upload progress indicator
 Transaction signing UI
 Success confirmation modal
5.2 Package Discovery
 Package listing table/cards
 Search and filter UI
 Category filters (NFT, DeFi, Staking, etc.)
 Sort options (date, popularity, audit status)
 Pagination controls
5.3 Package Details Page
 Package metadata display
 Version history
 Source code viewer (syntax highlighting)
 Download buttons (source, ABI)
 Audit status badges
 Developer DID display
5.4 Source Verification UI
 Source upload form
 Hash comparison display
 Verification status indicator
 Transaction confirmation
5.5 Developer Dashboard
 Published packages list
 Package statistics
 Version management
 DID profile display
Deliverables:

✅ Complete publishing workflow
✅ Package discovery interface
✅ Package details pages
✅ Developer dashboard
Phase 6: Atala PRISM DID Integration
Duration: 2 weeks
Goal: Implement developer identity binding with Cardano DIDs

Tasks
6.1 Atala PRISM Setup
 Set up Atala PRISM SDK
 Configure DID resolver
 Create DID generation utilities
 Implement DID verification
6.2 Developer Identity
// types/identity.ts
interface DeveloperIdentity {
  did: string // did:prism:...
  publicKey: string
  credentials: VerifiableCredential[]
  packages: string[] // Package IDs
  reputation: number
}
6.3 DID-Package Binding
 Update registry contract to include DID
 Modify publish transaction to bind DID
 Create DID verification endpoint
 Add DID to package metadata
6.4 Identity UI
 DID creation wizard
 DID profile page
 Credential display
 Package ownership verification
6.5 Reputation System
 Track package downloads
 Count verified packages
 Calculate reputation score
 Display reputation badges
Deliverables:

✅ DID integration
✅ Developer profiles
✅ Package-DID binding
✅ Reputation system
Phase 7: Cross-Chain Mapping
Duration: 2 weeks
Goal: Enable EVM ↔ Cardano contract equivalence mapping

Tasks
7.1 Cross-Chain Data Model
interface CrossChainMapping {
  cardanoPackageId: string
  evmContractAddress: string
  evmChainId: number // 1 (Mainnet), 11155111 (Sepolia)
  equivalenceType: 'identical' | 'similar' | 'ported'
  verificationProof: string
  mappedBy: string // DID
  timestamp: number
}
7.2 EVM Contract Registry
 Create EVM contract address storage
 Add chain ID tracking
 Implement equivalence verification
 Build mapping submission form
7.3 Cross-Chain Search
 Add EVM address search
 Display Cardano equivalents
 Show mapping history
 Add reverse lookup (Cardano → EVM)
7.4 Migration Tools
 Create EVM → Cardano migration guide
 Build contract comparison tool
 Add automated equivalence suggestions
 Generate migration reports
Deliverables:

✅ Cross-chain mapping system
✅ EVM address tracking
✅ Migration tools
✅ Cross-chain search
Phase 8: Midnight ZK Integration (Optional)
Duration: 2 weeks
Goal: Enable private contract publishing via Midnight

Tasks
8.1 Midnight Setup
 Set up Midnight development environment
 Configure ZK contract compiler
 Create Midnight wallet integration
 Test on Midnight testnet
8.2 Private Publishing
 Create ZK proof generation for private metadata
 Implement confidential package registry
 Add privacy level selection UI
 Build encrypted metadata storage
8.3 Confidential Audits
 Implement ZK audit proofs
 Create audit verification without revealing code
 Add audit status to private packages
 Build auditor interface
8.4 Privacy Controls
 Public/private toggle
 Access control lists
 Selective disclosure
 Privacy policy settings
Deliverables:

✅ Midnight integration
✅ Private publishing
✅ ZK audit proofs
✅ Privacy controls
Phase 9: Hydra Off-Chain Layer (Optional)
Duration: 1.5 weeks
Goal: Implement instant package actions with Hydra

Tasks
9.1 Hydra Head Setup
 Set up Hydra node
 Configure Hydra Head parameters
 Create Head opening/closing logic
 Implement Head state management
9.2 Off-Chain Package Actions
 Instant package search (Hydra state)
 Fast package updates
 Real-time version tracking
 Immediate feedback for developers
9.3 L1 Settlement
 Periodic Head snapshots
 Final settlement on Cardano L1
 Conflict resolution
 State synchronization
9.4 Hydra UI
 Head status indicator
 Instant action feedback
 Settlement progress
 L1/L2 state comparison
Deliverables:

✅ Hydra Head integration
✅ Instant package actions
✅ L1 settlement mechanism
✅ Hydra UI components
Phase 10: Testing, Security & Launch
Duration: 3 weeks
Goal: Comprehensive testing, security audit, and production deployment

Tasks
10.1 Testing
 End-to-end testing (Playwright/Cypress)
 Load testing (k6)
 Security testing (OWASP)
 Smart contract audit (external)
 Penetration testing
10.2 Security Hardening
 Input sanitization
 Rate limiting
 DDoS protection
 Wallet security best practices
 IPFS content validation
10.3 Performance Optimization
 Frontend bundle optimization
 API response caching
 Database query optimization
 IPFS pinning strategy
 CDN setup
10.4 Documentation
 Developer documentation
 API reference
 Smart contract documentation
 User guides
 Video tutorials
10.5 Deployment
 Deploy contracts to Cardano Mainnet
 Deploy backend to production
 Deploy frontend to Vercel
 Configure monitoring (Sentry, Datadog)
 Set up analytics
10.6 Launch Preparation
 Beta testing program
 Community feedback
 Marketing materials
 Press release
 Launch event
Deliverables:

✅ Production-ready platform
✅ Security audit report
✅ Complete documentation
✅ Monitoring dashboard
✅ Public launch
Technical Stack Summary
Frontend
React 18 + TypeScript
TailwindCSS 4
Framer Motion
Radix UI components
Cardano wallet adapters (Nami, Eternl, Lace)
Backend
Node.js + Express
Lucid SDK (Cardano interaction)
Blockfrost API
IPFS (Pinata/Infura)
PostgreSQL (metadata cache)
Blockchain
Cardano Preprod → Mainnet
Aiken smart contracts
Atala PRISM (DIDs)
Midnight (ZK contracts, optional)
Hydra (off-chain layer, optional)
DevOps
GitHub Actions (CI/CD)
Vercel (frontend hosting)
AWS/DigitalOcean (backend)
Docker containers
Sentry (error tracking)
Success Metrics
Phase 1-3 (Foundation)
✅ Wallet connection success rate >95%
✅ Smart contracts deployed and verified
✅ IPFS upload success rate >99%
Phase 4-6 (Core Features)
✅ API response time <200ms (p95)
✅ 100+ packages published (beta)
✅ 50+ developers with DIDs
Phase 7-9 (Advanced Features)
✅ 20+ cross-chain mappings
✅ 10+ private packages (Midnight)
✅ Hydra Head uptime >99%
Phase 10 (Launch)
✅ 500+ packages in first month
✅ 200+ active developers
✅ 40-60% reduction in development time (user survey)
✅ Zero critical security vulnerabilities
Risk Mitigation
Risk	Impact	Mitigation
Smart contract bugs	High	External audit, extensive testing, bug bounty
IPFS availability	Medium	Multiple pinning services, redundancy
Wallet integration issues	Medium	Support multiple wallets, fallback options
Scalability bottlenecks	Medium	Hydra integration, caching, CDN
Low adoption	High	Developer outreach, documentation, incentives
Security vulnerabilities	High	Penetration testing, security audit, monitoring
Budget Estimate
Phase	Duration	Estimated Cost
Phase 1	2 weeks	$5,000
Phase 2	3 weeks	$10,000
Phase 3	1.5 weeks	$4,000
Phase 4	2 weeks	$6,000
Phase 5	3 weeks	$8,000
Phase 6	2 weeks	$7,000
Phase 7	2 weeks	$6,000
Phase 8	2 weeks	$8,000 (optional)
Phase 9	1.5 weeks	$6,000 (optional)
Phase 10	3 weeks	$12,000
Total	22 weeks	$72,000
Note: Costs include development, testing, audits, and infrastructure

Timeline
Month 1: Phases 1-2 (Foundation + Smart Contracts)
Month 2: Phases 3-4 (IPFS + Backend)
Month 3: Phase 5 (Frontend)
Month 4: Phases 6-7 (DID + Cross-chain)
Month 5: Phases 8-9 (Midnight + Hydra, optional)
Month 6: Phase 10 (Testing + Launch)
Total Duration: 6 months to production launch

Next Steps
Immediate (Week 1):

Set up development environment
Initialize project repositories
Begin smart contract design
Short-term (Month 1):

Complete Phase 1 and Phase 2
Deploy contracts to Preprod
Begin backend development
Medium-term (Months 2-4):

Build core features (Phases 3-7)
Beta testing with early adopters
Gather feedback and iterate
Long-term (Months 5-6):

Add advanced features (Phases 8-9)
Security audit and hardening
Production launch
Conclusion
AxoHub represents a critical infrastructure piece for the Cardano ecosystem, addressing the package management gap that currently slows down smart contract development. By following this 10-phase implementation plan, the HEXECUTIONERS team can build a production-ready, secure, and scalable platform that will accelerate Cardano adoption and reduce development friction by 40-60%.

The phased approach allows for iterative development, early feedback, and risk mitigation while maintaining focus on delivering core value first (Phases 1-7) before adding advanced features (Phases 8-9).

Status: Ready to begin Phase 1 implementation.