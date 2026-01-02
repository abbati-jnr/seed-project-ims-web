# Seed Project – Inventory Management System (IMS)
## Product Requirements Document (PRD)

**Client:** Agricultural Seed Company  
**Product:** Inventory Management System (IMS) – Seed Operations  
**Document Type:** Product Requirements Document (PRD)  
**Version:** 1.0  
**Date:** January 2026  

---

## 1. Product Vision

The Seed Project IMS is a purpose-built digital system to manage the full lifecycle of agricultural seeds — from internal production and grower supply (in-grower & out-grower), through storage, cleaning, grading, and distribution — with strict lot-level traceability, strong warehouse controls, and clear operational accountability.

The system prioritizes **traceability, operational control, and anti-theft**, rather than traditional supplier credit accounting, and reflects real operational practices such as Store Receiving Vouchers (SRV), Store Issuing Vouchers (SIV), and multiple warehouse custodians.

---

## 2. Product Goals & Objectives

### 2.1 Core Goals

- Digitize seed inventory operations end-to-end using **lots** as the primary traceability unit
- Provide full visibility into seed movements across warehouses and processes
- Eliminate manual records (paper SRV/SIV) while preserving their business logic
- Enforce strict warehouse accountability without supplier credit exposure
- Support multiple seed classes (Breeder, Foundation, Certified)
- Enable both **seed-for-seed settlement** and cash-based sales

### 2.2 Success Metrics

- 100% of inventory movements captured via SRV/SIV equivalents
- Zero negative stock across all warehouses
- Lot traceability available within 2 clicks (origin → current status)
- Reduction in unexplained losses by ≥70% within 6 months
- All warehouse users operate within role-restricted permissions

---

## 3. Product Scope

### 3.1 In Scope

- Seed inventory tracking by **Lot**
- Support for Breeder, Foundation, and Certified seed classes
- In-grower and out-grower seed supply intake
- Internal seed production recording
- Storage before cleaning
- Cleaning and grading without supplier payout adjustment
- SRV & SIV workflows
- Multi-warehouse operations (Warehouse A – Sa’adatu, Warehouse B – Hannatu)
- Seed settlement using seeds (no supplier credit)
- Role-based access, approvals, and audit trails
- Reporting and dashboards

### 3.2 Out of Scope (Initial Release)

- Supplier credit or payable balances
- Financial ERP replacement
- Advanced forecasting and AI optimization
- External marketplace integrations

---

## 4. Seed Business Model Representation

### 4.1 Seed Classes

The system shall support the following seed categories:

- **Breeder Seeds** – internal or controlled source
- **Foundation Seeds (Premium)** – high-grade multiplication stock
- **Certified Seeds** – commercial distribution stock

Each lot must always belong to **one and only one seed class**.

### 4.2 Supply Types

- **Internal Seeds** – company-produced seeds
- **In-grower Supply** – controlled growers under close supervision
- **Out-grower Supply** – external growers supplying seeds

> Note: Suppliers do **not** operate on credit. No supplier ledger or balance tracking is required.

---

## 5. Key Product Users & Personas

- **Storekeeper (Warehouse Custodian)** – receives, stores, issues, and transfers seeds
- **Warehouse Manager** – approves movements and oversees stock integrity
- **QA / Seed Officer** – cleaning, grading, and quality decisions
- **Sales / Distribution Officer** – issues seeds to customers or growers
- **Admin** – system configuration, users, permissions
- **Management** – dashboards, reports, audits

---

## 6. Core Concepts & Terminology

| Term | Description |
|-----|-------------|
| Lot | A traceable unit of seeds originating from one source event |
| SRV | Store Receiving Voucher – inbound stock record |
| SIV | Store Issuing Voucher – outbound stock record |
| Cleaning | Seed processing that reduces impurities but does not affect supplier settlement |
| Settlement with Seeds | Issuing seeds instead of cash for obligations |

---

## 7. Functional Product Requirements

### 7.1 Lot-Based Inventory Management

- The system shall use **Lots** as the primary inventory unit
- Each lot shall have:
  - Unique Lot ID
  - Seed class (Breeder / Foundation / Certified)
  - Source type (Internal / In-grower / Out-grower)
  - Source reference (grower, field, or internal batch)
  - Initial quantity
  - Current quantity
  - Warehouse & location
  - Status (Stored, Cleaned, Issued, Exhausted)

- Lot traceability must show:
  - Origin
  - All SRVs, cleanings, transfers, and SIVs

---

### 7.2 Store Receiving Voucher (SRV)

- SRV shall be the **only mechanism** for stock entry
- SRV shall capture:
  - Warehouse (A or B)
  - Seed class
  - Source type (Internal / In-grower / Out-grower)
  - Lot creation
  - Quantity received
  - Date/time
  - Receiving officer
  - Optional photos

- SRV approval may be required based on quantity threshold

---

### 7.3 Storage Before Cleaning

- Seeds must be allowed to exist in a **“Raw / Uncleaned”** state
- Raw lots can be:
  - Stored
  - Transferred
  - Counted
  - Queued for cleaning

---

### 7.4 Cleaning & Quality Processing

- Cleaning shall be recorded as a **lot transformation event**
- Cleaning does **not** impact supplier settlement
- Cleaning record shall include:
  - Input lot
  - Output lot(s)
  - Input quantity
  - Output quantity
  - Waste quantity (informational)
  - Cleaning officer

- Output lot inherits:
  - Original source
  - Seed class
  - New lot ID

---

### 7.5 Store Issuing Voucher (SIV)

- SIV shall be the **only mechanism** for stock exit
- SIV shall support:
  - Sales
  - Seed settlement with seeds
  - Internal transfers
  - Distribution to growers

- SIV shall capture:
  - Warehouse
  - Lot(s) issued
  - Quantity per lot
  - Recipient (customer, grower, internal)
  - Purpose (Sale, Settlement, Transfer)
  - Issuing officer

---

### 7.6 Seed Settlement with Seeds

- The system shall support issuing seeds as settlement
- No monetary valuation is required
- Settlement records must link to:
  - Recipient
  - Lot(s)
  - Quantity
  - Purpose = Settlement

---

### 7.7 Multi-Warehouse Management

- The system shall support multiple warehouses:
  - Warehouse A – Sa’adatu
  - Warehouse B – Hannatu

- Each warehouse shall have:
  - Independent stock levels
  - Assigned storekeeper(s)
  - Transfer capability via SRV/SIV pair

---

### 7.8 Internal Seed Records

- The system shall allow creation of **Internal Seed Lots**
- Internal lots follow the same SRV → Store → Clean → SIV lifecycle

---

### 7.9 Access Control & Approvals

- Role-based permissions for:
  - SRV creation
  - SIV issuance
  - Cleaning
  - Transfers

- Approval required for:
  - High-quantity issues
  - Inter-warehouse transfers

---

## 8. Reporting & Dashboards

### 8.1 Standard Reports

- Stock on hand by warehouse, seed class, lot
- Lot traceability report
- SRV register
- SIV register
- Cleaning & waste summary
- Seed distribution & settlement report

### 8.2 Dashboards

- Warehouse dashboard
- Seed class distribution
- Movement activity timeline
- Loss & waste overview

---

## 9. Non-Functional Product Requirements

- Web-based, responsive UI
- Optimized for low-bandwidth environments
- Audit logs for all inventory actions
- Data retention minimum: 5 years
- Support Nigerian operational context

---

## 10. Assumptions & Constraints

- Suppliers do not operate on credit
- Cleaning losses do not affect supplier compensation
- SRV/SIV are mandatory for all stock movements
- Lots are immutable in origin data

---

## 11. Dependencies & Next Deliverables

- This PRD feeds into:
  - Technical Requirements Document (TRD)
  - UX/UI flows & wireframes
  - System architecture design

---

**End of PRD**

