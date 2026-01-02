# Seed Project IMS - API Documentation

**Version:** 1.0.0
**Base URL:** `http://localhost:8000/api`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Patterns](#common-patterns)
4. [Data Types & Enums](#data-types--enums)
5. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#users)
   - [Warehouses](#warehouses)
   - [Locations](#locations)
   - [Seed Classes](#seed-classes)
   - [Seed Products](#seed-products)
   - [Lots](#lots)
   - [SRV (Store Receiving Voucher)](#srv-store-receiving-voucher)
   - [SIV (Store Issuing Voucher)](#siv-store-issuing-voucher)
   - [Cleaning Events](#cleaning-events)
   - [Audit Logs](#audit-logs)
   - [Approval Requests](#approval-requests)
   - [Reports](#reports)
6. [Workflow Diagrams](#workflow-diagrams)
7. [Error Handling](#error-handling)

---

## Overview

The Seed Project IMS API is a RESTful API for managing agricultural seed inventory operations. It provides:

- **Lot-based traceability** - Track seeds from receipt through cleaning and distribution
- **SRV/SIV workflows** - Controlled stock entry and exit with approval flows
- **Multi-warehouse support** - Manage inventory across multiple locations
- **Role-based access control** - Five user roles with different permissions
- **Comprehensive reporting** - Dashboard and analytical endpoints

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Lot** | The atomic unit of inventory tracking. Each lot has immutable origin data and full movement history. |
| **SRV** | Store Receiving Voucher - the only mechanism for stock entry. Creates new lots when approved. |
| **SIV** | Store Issuing Voucher - the only mechanism for stock exit. Reduces lot quantities when approved. |
| **Cleaning** | Transforms input lots into cleaned output lots with full traceability. |

---

## Authentication

The API uses **Token Authentication**. Include the token in the `Authorization` header:

```
Authorization: Token <your-token>
```

### Obtaining a Token

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "storekeeper",
    "full_name": "John Doe"
  }
}
```

### Logging Out

```http
POST /api/auth/logout/
Authorization: Token <your-token>
```

---

## Common Patterns

### Pagination

All list endpoints support pagination:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `page_size` | integer | 20 | Items per page (max: 100) |

**Response Format:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/lots/?page=2",
  "previous": null,
  "results": [...]
}
```

### Filtering

Most list endpoints support filtering via query parameters:

```http
GET /api/lots/?warehouse=<uuid>&status=stored&seed_class=<uuid>
```

### Ordering

Use the `ordering` parameter to sort results:

```http
GET /api/lots/?ordering=-created_at
GET /api/lots/?ordering=current_quantity
```

Prefix with `-` for descending order.

### Searching

Use the `search` parameter for text search:

```http
GET /api/users/?search=john
```

---

## Data Types & Enums

### UUID Format

All primary keys use UUID format:
```
"id": "550e8400-e29b-41d4-a716-446655440000"
```

### Decimal Format

All quantities are returned as strings to preserve precision:
```json
"current_quantity": "1500.500"
```

### DateTime Format

All timestamps use ISO 8601 format:
```
"created_at": "2024-01-15T10:30:00.000000Z"
```

### Enums

#### User Roles
| Value | Display | Description |
|-------|---------|-------------|
| `admin` | Admin | Full system access |
| `manager` | Warehouse Manager | Approve SRVs/SIVs, manage warehouses |
| `storekeeper` | Storekeeper | Create SRVs/SIVs, manage lots |
| `qa` | QA Officer | Quality assurance tasks |
| `sales` | Sales Officer | View inventory, sales tasks |

#### Source Types (Lot Origin)
| Value | Display | Description |
|-------|---------|-------------|
| `internal` | Internal | Internal production |
| `in_grower` | In-Grower | Seeds from in-house growers |
| `out_grower` | Out-Grower | Seeds from external growers |

#### Lot Status
| Value | Display | Description |
|-------|---------|-------------|
| `stored` | Stored | Active inventory |
| `cleaned` | Cleaned | Has been through cleaning |
| `issued` | Issued | Partially or fully issued |
| `exhausted` | Exhausted | No remaining quantity |

#### Document Status (SRV/SIV)
| Value | Display | Description |
|-------|---------|-------------|
| `draft` | Draft | Being prepared, editable |
| `pending` | Pending Approval | Submitted, awaiting approval |
| `approved` | Approved | Approved and executed |
| `rejected` | Rejected | Rejected by approver |
| `cancelled` | Cancelled | Cancelled by creator |

#### Cleaning Status
| Value | Display | Description |
|-------|---------|-------------|
| `draft` | Draft | Being prepared |
| `in_progress` | In Progress | Cleaning underway |
| `completed` | Completed | Cleaning finished |
| `cancelled` | Cancelled | Cleaning cancelled |

#### Recipient Types (SIV)
| Value | Display | Description |
|-------|---------|-------------|
| `customer` | Customer | External customer |
| `grower` | Grower | Seed grower |
| `internal` | Internal | Internal transfer |

#### Issue Purpose (SIV)
| Value | Display | Description |
|-------|---------|-------------|
| `sale` | Sale | Commercial sale |
| `settlement` | Settlement | Grower settlement |
| `transfer` | Transfer | Internal warehouse transfer |

#### Seed Class Types
| Value | Display | Description |
|-------|---------|-------------|
| `breeder` | Breeder Seeds | Highest quality breeding stock |
| `foundation` | Foundation Seeds | Premium multiplication stock |
| `certified` | Certified Seeds | Commercial certified seeds |

---

## API Endpoints

### Authentication Endpoints

#### Login
```http
POST /api/auth/login/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "storekeeper",
    "full_name": "John Doe",
    "phone": "+234123456789",
    "is_active": true
  }
}
```

#### Logout
```http
POST /api/auth/logout/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "detail": "Successfully logged out."
}
```

#### Get Current User Profile
```http
GET /api/auth/me/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "storekeeper",
  "full_name": "John Doe",
  "phone": "+234123456789",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update Current User Profile
```http
PUT /api/auth/me/
Authorization: Token <token>
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+234987654321"
}
```

#### Change Password
```http
POST /api/auth/change-password/
Authorization: Token <token>
```

**Request Body:**
```json
{
  "old_password": "currentpassword",
  "new_password": "newpassword123"
}
```

---

### Users

> **Permissions:** Admin only for create/update/delete. All authenticated users can list.

#### List Users
```http
GET /api/users/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | Filter by role |
| `is_active` | boolean | Filter by active status |
| `search` | string | Search by name or email |

**Response:** `200 OK`
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "admin",
      "full_name": "Admin User",
      "phone": "",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create User
```http
POST /api/users/
Authorization: Token <admin-token>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "first_name": "New",
  "last_name": "User",
  "role": "storekeeper",
  "phone": "+234123456789"
}
```

**Response:** `201 Created`

#### Get User Detail
```http
GET /api/users/{id}/
Authorization: Token <token>
```

#### Update User
```http
PUT /api/users/{id}/
Authorization: Token <admin-token>
```

#### Deactivate User
```http
POST /api/users/{id}/deactivate/
Authorization: Token <admin-token>
```

#### Activate User
```http
POST /api/users/{id}/activate/
Authorization: Token <admin-token>
```

---

### Warehouses

#### List Warehouses
```http
GET /api/warehouses/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `is_active` | boolean | Filter by active status |
| `search` | string | Search by code or name |

**Response:** `200 OK`
```json
{
  "count": 2,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "A",
      "name": "Sa'adatu",
      "address": "123 Main Street",
      "is_active": true,
      "location_count": 5,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Warehouse
```http
POST /api/warehouses/
Authorization: Token <admin-token>
```

**Request Body:**
```json
{
  "code": "C",
  "name": "New Warehouse",
  "address": "456 Industrial Area"
}
```

#### Get Warehouse Detail
```http
GET /api/warehouses/{id}/
Authorization: Token <token>
```

#### Update Warehouse
```http
PUT /api/warehouses/{id}/
Authorization: Token <admin-token>
```

---

### Locations

#### List Locations
```http
GET /api/locations/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `warehouse` | uuid | Filter by warehouse |
| `is_active` | boolean | Filter by active status |

**Response:** `200 OK`
```json
{
  "count": 5,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "warehouse": "550e8400-e29b-41d4-a716-446655440000",
      "warehouse_code": "A",
      "code": "A1",
      "name": "Zone A Row 1",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Location
```http
POST /api/locations/
Authorization: Token <admin-token>
```

**Request Body:**
```json
{
  "warehouse": "550e8400-e29b-41d4-a716-446655440000",
  "code": "B1",
  "name": "Zone B Row 1"
}
```

---

### Seed Classes

#### List Seed Classes
```http
GET /api/seed-classes/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "count": 3,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "breeder",
      "name_display": "Breeder Seeds",
      "description": "Highest quality breeding stock",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Seed Class
```http
POST /api/seed-classes/
Authorization: Token <admin-token>
```

**Request Body:**
```json
{
  "name": "breeder",
  "description": "Highest quality breeding stock"
}
```

---

### Seed Products

#### List Seed Products
```http
GET /api/seed-products/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `crop` | string | Filter by crop type |
| `is_active` | boolean | Filter by active status |
| `search` | string | Search by code, crop, or variety |

**Response:** `200 OK`
```json
{
  "count": 10,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "code": "MZ-001",
      "crop": "Maize",
      "variety": "SAMMAZ 15",
      "display_name": "Maize - SAMMAZ 15",
      "description": "High-yield drought-resistant variety",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Seed Product
```http
POST /api/seed-products/
Authorization: Token <admin-token>
```

**Request Body:**
```json
{
  "code": "MZ-002",
  "crop": "Maize",
  "variety": "SAMMAZ 20",
  "description": "Early maturing variety"
}
```

---

### Lots

> **Note:** Lots are created through SRV approval or Cleaning completion. Direct lot creation is not supported.

#### List Lots
```http
GET /api/lots/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `warehouse` | uuid | Filter by warehouse |
| `seed_product` | uuid | Filter by seed product |
| `seed_class` | uuid | Filter by seed class |
| `status` | string | Filter by status |
| `source_type` | string | Filter by source type |
| `search` | string | Search by lot number or source reference |

**Response:** `200 OK`
```json
{
  "count": 50,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "lot_number": "LOT-550E8400",
      "seed_product": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "code": "MZ-001",
        "crop": "Maize",
        "variety": "SAMMAZ 15",
        "display_name": "Maize - SAMMAZ 15"
      },
      "seed_class": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "certified",
        "name_display": "Certified Seeds"
      },
      "warehouse": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "code": "A",
        "name": "Sa'adatu"
      },
      "source_type": "in_grower",
      "source_reference": "Farmer John - Field 5",
      "initial_quantity": "1000.000",
      "current_quantity": "850.500",
      "status": "stored",
      "parent_lot": null,
      "parent_lot_number": null,
      "notes": "",
      "created_by": {
        "id": 1,
        "email": "admin@example.com",
        "full_name": "Admin User"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-20T14:00:00Z"
    }
  ]
}
```

#### Get Lot Detail
```http
GET /api/lots/{id}/
Authorization: Token <token>
```

#### Get Lot Trace (Full History)
```http
GET /api/lots/{id}/trace/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "lot_number": "LOT-550E8400",
  "seed_product_name": "Maize - SAMMAZ 15",
  "source_type": "in_grower",
  "source_reference": "Farmer John - Field 5",
  "initial_quantity": "1000.000",
  "current_quantity": "850.500",
  "status": "stored",
  "srv_info": {
    "srv_number": "SRV-202401-0001",
    "receiving_officer": "Store Keeper",
    "approved_at": "2024-01-15T10:30:00Z"
  },
  "siv_items": [
    {
      "siv_number": "SIV-202401-0005",
      "quantity": "100.000",
      "recipient_name": "ABC Farm",
      "purpose": "sale",
      "approved_at": "2024-01-18T09:00:00Z"
    }
  ],
  "cleaning_input": [
    {
      "cleaning_id": "550e8400-e29b-41d4-a716-446655440010",
      "input_quantity": "50.000",
      "completed_at": "2024-01-20T14:00:00Z"
    }
  ],
  "cleaning_output": null,
  "parent_lot_info": null,
  "child_lots": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "lot_number": "LOT-550E8401",
      "current_quantity": "45.000"
    }
  ],
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Get Lot Movements
```http
GET /api/lots/{id}/movements/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "lot_number": "LOT-550E8400",
  "movements": [
    {
      "type": "received",
      "document_number": "SRV-202401-0001",
      "quantity": "1000.000",
      "balance_after": "1000.000",
      "date": "2024-01-15T10:30:00Z",
      "notes": "Initial receipt from grower"
    },
    {
      "type": "issued",
      "document_number": "SIV-202401-0005",
      "quantity": "-100.000",
      "balance_after": "900.000",
      "date": "2024-01-18T09:00:00Z",
      "notes": "Sale to ABC Farm"
    },
    {
      "type": "cleaning",
      "document_number": "CLEAN-550E8400",
      "quantity": "-50.000",
      "balance_after": "850.000",
      "date": "2024-01-20T14:00:00Z",
      "notes": "Used as input for cleaning"
    }
  ]
}
```

---

### SRV (Store Receiving Voucher)

> **Workflow:** Draft → Pending → Approved/Rejected

#### List SRVs
```http
GET /api/srv/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `warehouse` | uuid | Filter by warehouse |
| `status` | string | Filter by status |
| `receiving_officer` | integer | Filter by receiving officer |
| `search` | string | Search by SRV number |

**Response:** `200 OK`
```json
{
  "count": 25,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "srv_number": "SRV-202401-0001",
      "warehouse": "550e8400-e29b-41d4-a716-446655440000",
      "warehouse_code": "A",
      "receiving_officer": 2,
      "receiving_officer_name": "Store Keeper",
      "status": "approved",
      "item_count": 3,
      "total_quantity": "1500.000",
      "approved_by": 1,
      "approved_by_name": "Admin User",
      "approved_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T09:00:00Z"
    }
  ]
}
```

#### Create SRV
```http
POST /api/srv/
Authorization: Token <token>
```

**Request Body:**
```json
{
  "warehouse": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "Monthly delivery from growers"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "srv_number": "SRV-202401-0002",
  "warehouse": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "A",
    "name": "Sa'adatu"
  },
  "receiving_officer": {
    "id": 2,
    "email": "storekeeper@example.com",
    "full_name": "Store Keeper"
  },
  "status": "draft",
  "items": [],
  "notes": "Monthly delivery from growers",
  "created_at": "2024-01-16T09:00:00Z"
}
```

#### Get SRV Detail
```http
GET /api/srv/{id}/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "srv_number": "SRV-202401-0001",
  "warehouse": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "A",
    "name": "Sa'adatu"
  },
  "receiving_officer": {
    "id": 2,
    "email": "storekeeper@example.com",
    "full_name": "Store Keeper"
  },
  "status": "approved",
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440007",
      "seed_product": {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "code": "MZ-001",
        "crop": "Maize",
        "variety": "SAMMAZ 15"
      },
      "seed_class": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "certified"
      },
      "source_type": "in_grower",
      "source_reference": "Farmer John - Field 5",
      "quantity": "500.000",
      "lot": "550e8400-e29b-41d4-a716-446655440004"
    }
  ],
  "total_quantity": "500.000",
  "approved_by": {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "Admin User"
  },
  "approved_at": "2024-01-15T10:30:00Z",
  "notes": "Delivery received",
  "created_at": "2024-01-15T09:00:00Z"
}
```

#### Update SRV (Draft Only)
```http
PUT /api/srv/{id}/
Authorization: Token <token>
```

**Request Body:**
```json
{
  "notes": "Updated notes"
}
```

#### Add Item to SRV
```http
POST /api/srv/{id}/add_item/
Authorization: Token <token>
```

**Request Body:**
```json
{
  "seed_product": "550e8400-e29b-41d4-a716-446655440003",
  "seed_class": "550e8400-e29b-41d4-a716-446655440002",
  "source_type": "in_grower",
  "source_reference": "Farmer John - Field 5",
  "quantity": "500.000"
}
```

#### Remove Item from SRV
```http
DELETE /api/srv/{id}/remove_item/{item_id}/
Authorization: Token <token>
```

#### Submit SRV for Approval
```http
POST /api/srv/{id}/submit/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "detail": "SRV submitted for approval.",
  "status": "pending"
}
```

#### Approve SRV
```http
POST /api/srv/{id}/approve/
Authorization: Token <admin-or-manager-token>
```

**Request Body (optional):**
```json
{
  "notes": "Approved after verification"
}
```

**Response:** `200 OK`
```json
{
  "detail": "SRV approved. 3 lot(s) created.",
  "status": "approved",
  "lots_created": [
    "550e8400-e29b-41d4-a716-446655440004",
    "550e8400-e29b-41d4-a716-446655440008",
    "550e8400-e29b-41d4-a716-446655440009"
  ]
}
```

#### Reject SRV
```http
POST /api/srv/{id}/reject/
Authorization: Token <admin-or-manager-token>
```

**Request Body:**
```json
{
  "reason": "Quantities do not match delivery note"
}
```

#### Get Pending SRVs
```http
GET /api/srv/pending/
Authorization: Token <token>
```

#### Get SRV Summary
```http
GET /api/srv/summary/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "total": 25,
  "by_status": {
    "draft": 5,
    "pending": 3,
    "approved": 15,
    "rejected": 2
  },
  "total_quantity_received": "15000.000"
}
```

---

### SIV (Store Issuing Voucher)

> **Workflow:** Draft → Pending → Approved/Rejected

#### List SIVs
```http
GET /api/siv/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `warehouse` | uuid | Filter by warehouse |
| `status` | string | Filter by status |
| `purpose` | string | Filter by purpose |
| `recipient_type` | string | Filter by recipient type |
| `issuing_officer` | integer | Filter by issuing officer |
| `search` | string | Search by SIV number or recipient name |

**Response:** `200 OK`
```json
{
  "count": 20,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "siv_number": "SIV-202401-0001",
      "warehouse": "550e8400-e29b-41d4-a716-446655440000",
      "warehouse_code": "A",
      "issuing_officer": 2,
      "issuing_officer_name": "Store Keeper",
      "recipient_type": "customer",
      "recipient_name": "ABC Farm",
      "purpose": "sale",
      "status": "approved",
      "item_count": 2,
      "total_quantity": "200.000",
      "approved_by": 1,
      "approved_by_name": "Admin User",
      "approved_at": "2024-01-18T09:00:00Z",
      "created_at": "2024-01-17T14:00:00Z"
    }
  ]
}
```

#### Create SIV
```http
POST /api/siv/
Authorization: Token <token>
```

**Request Body:**
```json
{
  "warehouse": "550e8400-e29b-41d4-a716-446655440000",
  "recipient_type": "customer",
  "recipient_name": "XYZ Agro Ltd",
  "purpose": "sale",
  "notes": "Order #12345"
}
```

#### Get SIV Detail
```http
GET /api/siv/{id}/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "siv_number": "SIV-202401-0001",
  "warehouse": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "A",
    "name": "Sa'adatu"
  },
  "issuing_officer": {
    "id": 2,
    "email": "storekeeper@example.com",
    "full_name": "Store Keeper"
  },
  "recipient_type": "customer",
  "recipient_name": "ABC Farm",
  "purpose": "sale",
  "status": "approved",
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "lot": {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "lot_number": "LOT-550E8400",
        "seed_product_name": "Maize - SAMMAZ 15",
        "current_quantity": "850.000"
      },
      "quantity": "100.000"
    }
  ],
  "total_quantity": "100.000",
  "approved_by": {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "Admin User"
  },
  "approved_at": "2024-01-18T09:00:00Z",
  "notes": "Regular sale",
  "created_at": "2024-01-17T14:00:00Z"
}
```

#### Add Item to SIV
```http
POST /api/siv/{id}/add_item/
Authorization: Token <token>
```

**Request Body:**
```json
{
  "lot": "550e8400-e29b-41d4-a716-446655440004",
  "quantity": "100.000"
}
```

**Validation:**
- Lot must belong to the same warehouse as the SIV
- Quantity cannot exceed lot's current_quantity
- Lot must have status `stored` or `cleaned`

#### Remove Item from SIV
```http
DELETE /api/siv/{id}/remove_item/{item_id}/
Authorization: Token <token>
```

#### Submit SIV for Approval
```http
POST /api/siv/{id}/submit/
Authorization: Token <token>
```

#### Approve SIV
```http
POST /api/siv/{id}/approve/
Authorization: Token <admin-or-manager-token>
```

**Note:** Approval reduces the `current_quantity` of each lot by the item quantity. If quantity reaches 0, lot status changes to `exhausted`.

#### Reject SIV
```http
POST /api/siv/{id}/reject/
Authorization: Token <admin-or-manager-token>
```

**Request Body:**
```json
{
  "reason": "Insufficient documentation"
}
```

#### Get Pending SIVs
```http
GET /api/siv/pending/
Authorization: Token <token>
```

#### Get SIV Summary
```http
GET /api/siv/summary/
Authorization: Token <token>
```

---

### Cleaning Events

> **Workflow:** Draft → In Progress → Completed/Cancelled

#### List Cleaning Events
```http
GET /api/cleaning/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `input_lot` | uuid | Filter by input lot |
| `status` | string | Filter by status |
| `cleaning_officer` | integer | Filter by cleaning officer |

**Response:** `200 OK`
```json
{
  "count": 10,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440012",
      "input_lot": "550e8400-e29b-41d4-a716-446655440004",
      "input_lot_number": "LOT-550E8400",
      "input_quantity": "200.000",
      "waste_quantity": "20.000",
      "total_output": "180.000",
      "cleaning_officer": 3,
      "cleaning_officer_name": "QA Officer",
      "status": "completed",
      "output_count": 1,
      "completed_at": "2024-01-20T16:00:00Z",
      "created_at": "2024-01-20T09:00:00Z"
    }
  ]
}
```

#### Create Cleaning Event
```http
POST /api/cleaning/
Authorization: Token <token>
```

**Request Body:**
```json
{
  "input_lot": "550e8400-e29b-41d4-a716-446655440004",
  "input_quantity": "200.000",
  "notes": "Standard cleaning process"
}
```

**Validation:**
- `input_quantity` cannot exceed lot's `current_quantity`
- Lot must have status `stored`

#### Get Cleaning Event Detail
```http
GET /api/cleaning/{id}/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440012",
  "input_lot": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "lot_number": "LOT-550E8400",
    "seed_product_name": "Maize - SAMMAZ 15",
    "seed_class_name": "Certified Seeds",
    "current_quantity": "600.000"
  },
  "input_quantity": "200.000",
  "waste_quantity": "20.000",
  "cleaning_officer": {
    "id": 3,
    "email": "qa@example.com",
    "full_name": "QA Officer"
  },
  "status": "completed",
  "output_lots": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440013",
      "output_lot": {
        "id": "550e8400-e29b-41d4-a716-446655440014",
        "lot_number": "LOT-550E8401"
      },
      "output_quantity": "180.000"
    }
  ],
  "total_output": "180.000",
  "completed_at": "2024-01-20T16:00:00Z",
  "notes": "Standard cleaning process",
  "created_at": "2024-01-20T09:00:00Z"
}
```

#### Update Cleaning Event (Draft/In Progress Only)
```http
PUT /api/cleaning/{id}/
Authorization: Token <token>
```

**Request Body:**
```json
{
  "waste_quantity": "25.000",
  "notes": "Updated waste measurement"
}
```

#### Start Cleaning
```http
POST /api/cleaning/{id}/start/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "detail": "Cleaning event started.",
  "status": "in_progress"
}
```

#### Add Output Lot
```http
POST /api/cleaning/{id}/add_output/
Authorization: Token <token>
```

**Request Body:**
```json
{
  "output_quantity": "180.000"
}
```

**Validation:**
- Total outputs + waste cannot exceed input quantity

#### Remove Output Lot
```http
DELETE /api/cleaning/{id}/remove_output/{output_id}/
Authorization: Token <token>
```

#### Complete Cleaning
```http
POST /api/cleaning/{id}/complete/
Authorization: Token <token>
```

**Note:** Completion:
1. Reduces input lot's `current_quantity` by `input_quantity`
2. Creates new lot(s) for each output with:
   - Same `seed_product` and `seed_class` as input
   - Same `warehouse` as input
   - Same `source_type` and `source_reference` as input
   - `parent_lot` set to input lot
   - Status `cleaned`

**Response:** `200 OK`
```json
{
  "detail": "Cleaning event completed. 1 output lot(s) created.",
  "status": "completed",
  "lots_created": [
    "550e8400-e29b-41d4-a716-446655440014"
  ]
}
```

#### Cancel Cleaning
```http
POST /api/cleaning/{id}/cancel/
Authorization: Token <token>
```

#### Get Cleaning Summary
```http
GET /api/cleaning/summary/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "total_events": 10,
  "by_status": {
    "draft": 1,
    "in_progress": 2,
    "completed": 6,
    "cancelled": 1
  },
  "total_input": "2000.000",
  "total_output": "1800.000",
  "total_waste": "200.000",
  "efficiency_percentage": 90.0
}
```

---

### Audit Logs

> **Permissions:** Admin only for full list. Users can see their own activity.

#### List Audit Logs
```http
GET /api/audit-logs/
Authorization: Token <admin-token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | string | Filter by action type |
| `content_type` | integer | Filter by model type |
| `user` | integer | Filter by user |

**Response:** `200 OK`
```json
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "action": "approve",
      "model_name": "SRV",
      "object_id": "550e8400-e29b-41d4-a716-446655440005",
      "user": 1,
      "user_name": "Admin User",
      "timestamp": "2024-01-15T10:30:00Z",
      "notes": ""
    }
  ]
}
```

#### Get Audit Log Detail
```http
GET /api/audit-logs/{id}/
Authorization: Token <admin-token>
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "action": "approve",
  "model_name": "SRV",
  "object_id": "550e8400-e29b-41d4-a716-446655440005",
  "user": 1,
  "user_name": "Admin User",
  "before_data": {
    "status": "pending"
  },
  "after_data": {
    "status": "approved",
    "approved_by": 1,
    "approved_at": "2024-01-15T10:30:00Z"
  },
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2024-01-15T10:30:00Z",
  "notes": ""
}
```

#### Get My Activity
```http
GET /api/audit-logs/my_activity/
Authorization: Token <token>
```

#### Get Audit Summary
```http
GET /api/audit-logs/summary/
Authorization: Token <admin-token>
```

---

### Approval Requests

#### List Approval Requests
```http
GET /api/approvals/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `requested_by` | integer | Filter by requester |
| `approved_by` | integer | Filter by approver |

**Response:** `200 OK`
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "model_name": "SRV",
      "object_id": "550e8400-e29b-41d4-a716-446655440005",
      "requested_by": 2,
      "requested_by_name": "Store Keeper",
      "status": "pending",
      "threshold_exceeded": "Quantity exceeds 1000 kg",
      "requested_at": "2024-01-15T09:30:00Z"
    }
  ]
}
```

#### Get Approval Request Detail
```http
GET /api/approvals/{id}/
Authorization: Token <token>
```

#### Approve Request
```http
POST /api/approvals/{id}/approve/
Authorization: Token <admin-or-manager-token>
```

**Request Body:**
```json
{
  "notes": "Verified documentation"
}
```

#### Reject Request
```http
POST /api/approvals/{id}/reject/
Authorization: Token <admin-or-manager-token>
```

**Request Body:**
```json
{
  "notes": "Missing delivery note"
}
```

#### Get Pending Approvals
```http
GET /api/approvals/pending/
Authorization: Token <token>
```

#### Get Approval Summary
```http
GET /api/approvals/summary/
Authorization: Token <token>
```

---

### Reports

#### Dashboard
```http
GET /api/reports/dashboard/
Authorization: Token <token>
```

**Response:** `200 OK`
```json
{
  "stock": {
    "total_lots": 50,
    "total_quantity": "25000.500",
    "low_stock_alerts": 3
  },
  "recent_activity": {
    "srvs_created": 5,
    "sivs_created": 8,
    "cleaning_events": 2
  },
  "pending_approvals": {
    "srvs": 2,
    "sivs": 3,
    "total": 5
  },
  "stock_by_warehouse": [
    {
      "warehouse_code": "A",
      "warehouse_name": "Sa'adatu",
      "total_quantity": "15000.000"
    },
    {
      "warehouse_code": "B",
      "warehouse_name": "Hannatu",
      "total_quantity": "10000.500"
    }
  ]
}
```

#### Stock Summary
```http
GET /api/reports/stock-summary/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `warehouse` | uuid | Filter by warehouse |
| `seed_class` | uuid | Filter by seed class |
| `seed_product` | uuid | Filter by seed product |

**Response:** `200 OK`
```json
{
  "totals": {
    "lot_count": 50,
    "total_quantity": "25000.500"
  },
  "by_warehouse": [
    {
      "warehouse_code": "A",
      "warehouse_name": "Sa'adatu",
      "lot_count": 30,
      "total_quantity": "15000.000"
    }
  ],
  "by_seed_class": [
    {
      "seed_class": "certified",
      "lot_count": 35,
      "total_quantity": "18000.000"
    }
  ],
  "by_seed_product": [
    {
      "crop": "Maize",
      "variety": "SAMMAZ 15",
      "lot_count": 20,
      "total_quantity": "12000.000"
    }
  ]
}
```

#### SRV Register
```http
GET /api/reports/srv-register/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `warehouse` | uuid | Filter by warehouse |
| `status` | string | Filter by status |
| `start_date` | date | Filter by start date (YYYY-MM-DD) |
| `end_date` | date | Filter by end date (YYYY-MM-DD) |

**Response:** `200 OK`
```json
{
  "summary": {
    "total_srvs": 25,
    "total_quantity": "15000.000"
  },
  "register": [
    {
      "srv_number": "SRV-202401-0001",
      "warehouse": "A",
      "receiving_officer": "Store Keeper",
      "status": "approved",
      "item_count": 3,
      "total_quantity": "1500.000",
      "created_at": "2024-01-15T09:00:00Z",
      "approved_by": "Admin User",
      "approved_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### SIV Register
```http
GET /api/reports/siv-register/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `warehouse` | uuid | Filter by warehouse |
| `status` | string | Filter by status |
| `purpose` | string | Filter by purpose |
| `start_date` | date | Filter by start date (YYYY-MM-DD) |
| `end_date` | date | Filter by end date (YYYY-MM-DD) |

**Response:** `200 OK`
```json
{
  "summary": {
    "total_sivs": 20,
    "total_quantity": "8000.000",
    "by_purpose": [
      {"purpose": "sale", "count": 15},
      {"purpose": "settlement", "count": 3},
      {"purpose": "transfer", "count": 2}
    ]
  },
  "register": [
    {
      "siv_number": "SIV-202401-0001",
      "warehouse": "A",
      "issuing_officer": "Store Keeper",
      "recipient_type": "customer",
      "recipient_name": "ABC Farm",
      "purpose": "sale",
      "status": "approved",
      "item_count": 2,
      "total_quantity": "200.000",
      "created_at": "2024-01-17T14:00:00Z",
      "approved_by": "Admin User",
      "approved_at": "2024-01-18T09:00:00Z"
    }
  ]
}
```

#### Cleaning Summary
```http
GET /api/reports/cleaning-summary/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | date | Filter by start date (YYYY-MM-DD) |
| `end_date` | date | Filter by end date (YYYY-MM-DD) |

**Response:** `200 OK`
```json
{
  "summary": {
    "total_events": 10,
    "total_input": "2000.000",
    "total_waste": "200.000",
    "total_output": "1800.000",
    "efficiency_percentage": 90.0
  },
  "by_month": [
    {
      "month": "2024-01",
      "event_count": 6,
      "input_total": "1200.000",
      "waste_total": "120.000"
    },
    {
      "month": "2023-12",
      "event_count": 4,
      "input_total": "800.000",
      "waste_total": "80.000"
    }
  ]
}
```

#### Seed Distribution
```http
GET /api/reports/seed-distribution/
Authorization: Token <token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | date | Filter by start date (YYYY-MM-DD) |
| `end_date` | date | Filter by end date (YYYY-MM-DD) |
| `purpose` | string | Filter by purpose |

**Response:** `200 OK`
```json
{
  "summary": {
    "total_sivs": 20,
    "total_quantity": "8000.000"
  },
  "by_recipient_type": [
    {
      "recipient_type": "customer",
      "siv_count": 15,
      "total_quantity": "6000.000"
    },
    {
      "recipient_type": "grower",
      "siv_count": 3,
      "total_quantity": "1500.000"
    }
  ],
  "by_purpose": [
    {
      "purpose": "sale",
      "siv_count": 15,
      "total_quantity": "6000.000"
    },
    {
      "purpose": "settlement",
      "siv_count": 3,
      "total_quantity": "1500.000"
    }
  ],
  "top_recipients": [
    {
      "recipient_name": "ABC Farm",
      "siv_count": 5,
      "total_quantity": "2000.000"
    },
    {
      "recipient_name": "XYZ Agro Ltd",
      "siv_count": 3,
      "total_quantity": "1200.000"
    }
  ]
}
```

---

## Workflow Diagrams

### SRV Workflow

```
┌─────────┐     Submit      ┌─────────┐    Approve    ┌──────────┐
│  DRAFT  │ ───────────────►│ PENDING │ ─────────────►│ APPROVED │
└─────────┘                 └─────────┘               └──────────┘
     │                           │                         │
     │                           │ Reject                  │
     │                           ▼                         ▼
     │                      ┌──────────┐             Creates Lots
     └─────────────────────►│ REJECTED │
        Cancel              └──────────┘
```

**Business Rules:**
- Only DRAFT SRVs can be edited or have items added/removed
- Submit requires at least one item
- Approval creates one Lot per SRVItem
- Only Admin/Manager can approve/reject

### SIV Workflow

```
┌─────────┐     Submit      ┌─────────┐    Approve    ┌──────────┐
│  DRAFT  │ ───────────────►│ PENDING │ ─────────────►│ APPROVED │
└─────────┘                 └─────────┘               └──────────┘
     │                           │                         │
     │                           │ Reject                  │
     │                           ▼                         ▼
     │                      ┌──────────┐           Reduces Lot Quantities
     └─────────────────────►│ REJECTED │
        Cancel              └──────────┘
```

**Business Rules:**
- Only DRAFT SIVs can be edited or have items added/removed
- Item quantity cannot exceed lot's current_quantity
- Approval reduces lot quantities
- Lot status changes to EXHAUSTED when quantity reaches 0

### Cleaning Workflow

```
┌─────────┐     Start      ┌─────────────┐   Complete   ┌───────────┐
│  DRAFT  │ ──────────────►│ IN_PROGRESS │ ────────────►│ COMPLETED │
└─────────┘                └─────────────┘              └───────────┘
     │                           │                            │
     │                           │                            ▼
     │                           │                    Creates Output Lots
     ▼                           ▼                    Reduces Input Lot
┌───────────┐              ┌───────────┐
│ CANCELLED │◄─────────────│ CANCELLED │
└───────────┘    Cancel    └───────────┘
```

**Business Rules:**
- Input quantity cannot exceed lot's current_quantity
- Total outputs + waste cannot exceed input quantity
- Completion creates new lots with parent_lot reference
- Output lots inherit source_type, source_reference, seed_product, seed_class

---

## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 409 | Conflict (business rule violation) |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "detail": "Error message describing the problem"
}
```

Or for validation errors:

```json
{
  "field_name": [
    "Error message for this field"
  ],
  "another_field": [
    "Error message"
  ]
}
```

### Common Errors

#### Authentication Errors

```json
// 401 Unauthorized
{
  "detail": "Authentication credentials were not provided."
}

// 401 Unauthorized
{
  "detail": "Invalid token."
}
```

#### Permission Errors

```json
// 403 Forbidden
{
  "detail": "You do not have permission to perform this action."
}
```

#### Validation Errors

```json
// 400 Bad Request
{
  "quantity": [
    "Quantity cannot exceed available lot quantity of 500.000 kg"
  ]
}

// 400 Bad Request
{
  "lot": [
    "Lot must belong to the same warehouse as the SIV"
  ]
}
```

#### Business Rule Violations

```json
// 400 Bad Request
{
  "detail": "Cannot modify SRV in 'approved' status"
}

// 400 Bad Request
{
  "detail": "SRV must have at least one item to submit"
}

// 400 Bad Request
{
  "detail": "Total output + waste cannot exceed input quantity"
}
```

---

## API Documentation URLs

Interactive API documentation is available at:

- **Swagger UI:** `http://localhost:8000/api/docs/`
- **ReDoc:** `http://localhost:8000/api/redoc/`
- **OpenAPI Schema:** `http://localhost:8000/api/schema/`

---

## TypeScript Type Definitions

For frontend development, here are TypeScript interfaces for the main entities:

```typescript
// Enums
type UserRole = 'admin' | 'manager' | 'storekeeper' | 'qa' | 'sales';
type SourceType = 'internal' | 'in_grower' | 'out_grower';
type LotStatus = 'stored' | 'cleaned' | 'issued' | 'exhausted';
type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';
type CleaningStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';
type RecipientType = 'customer' | 'grower' | 'internal';
type IssuePurpose = 'sale' | 'settlement' | 'transfer';
type SeedClassType = 'breeder' | 'foundation' | 'certified';

// Base Types
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  full_name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

interface Warehouse {
  id: string; // UUID
  code: string;
  name: string;
  address: string;
  is_active: boolean;
  location_count: number;
  created_at: string;
}

interface Location {
  id: string;
  warehouse: string;
  warehouse_code: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface SeedClass {
  id: string;
  name: SeedClassType;
  name_display: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface SeedProduct {
  id: string;
  code: string;
  crop: string;
  variety: string;
  display_name: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface Lot {
  id: string;
  lot_number: string;
  seed_product: SeedProduct;
  seed_class: SeedClass;
  warehouse: Warehouse;
  source_type: SourceType;
  source_reference: string;
  initial_quantity: string; // Decimal as string
  current_quantity: string;
  status: LotStatus;
  parent_lot: string | null;
  parent_lot_number: string | null;
  notes: string;
  created_by: User;
  created_at: string;
  updated_at: string;
}

interface SRVItem {
  id: string;
  seed_product: SeedProduct;
  seed_class: SeedClass;
  source_type: SourceType;
  source_reference: string;
  quantity: string;
  lot: string | null; // Created on approval
}

interface SRV {
  id: string;
  srv_number: string;
  warehouse: Warehouse;
  receiving_officer: User;
  status: DocumentStatus;
  items: SRVItem[];
  total_quantity: string;
  approved_by: User | null;
  approved_at: string | null;
  notes: string;
  created_at: string;
}

interface SIVItem {
  id: string;
  lot: Lot;
  quantity: string;
}

interface SIV {
  id: string;
  siv_number: string;
  warehouse: Warehouse;
  issuing_officer: User;
  recipient_type: RecipientType;
  recipient_name: string;
  purpose: IssuePurpose;
  status: DocumentStatus;
  items: SIVItem[];
  total_quantity: string;
  approved_by: User | null;
  approved_at: string | null;
  notes: string;
  created_at: string;
}

interface CleaningOutputLot {
  id: string;
  output_lot: Lot | null;
  output_quantity: string;
}

interface CleaningEvent {
  id: string;
  input_lot: Lot;
  input_quantity: string;
  waste_quantity: string;
  cleaning_officer: User;
  status: CleaningStatus;
  output_lots: CleaningOutputLot[];
  total_output: string;
  completed_at: string | null;
  notes: string;
  created_at: string;
}

// Dashboard Response
interface DashboardResponse {
  stock: {
    total_lots: number;
    total_quantity: string;
    low_stock_alerts: number;
  };
  recent_activity: {
    srvs_created: number;
    sivs_created: number;
    cleaning_events: number;
  };
  pending_approvals: {
    srvs: number;
    sivs: number;
    total: number;
  };
  stock_by_warehouse: {
    warehouse_code: string;
    warehouse_name: string;
    total_quantity: string;
  }[];
}
```

---

## Quick Reference Card

### Authentication
| Action | Method | Endpoint |
|--------|--------|----------|
| Login | POST | `/api/auth/login/` |
| Logout | POST | `/api/auth/logout/` |
| Profile | GET | `/api/auth/me/` |

### Core Resources
| Resource | List | Detail | Create | Update |
|----------|------|--------|--------|--------|
| Users | GET `/api/users/` | GET `/api/users/{id}/` | POST `/api/users/` | PUT `/api/users/{id}/` |
| Warehouses | GET `/api/warehouses/` | GET `/api/warehouses/{id}/` | POST `/api/warehouses/` | PUT `/api/warehouses/{id}/` |
| Seed Classes | GET `/api/seed-classes/` | GET `/api/seed-classes/{id}/` | POST `/api/seed-classes/` | PUT `/api/seed-classes/{id}/` |
| Seed Products | GET `/api/seed-products/` | GET `/api/seed-products/{id}/` | POST `/api/seed-products/` | PUT `/api/seed-products/{id}/` |
| Lots | GET `/api/lots/` | GET `/api/lots/{id}/` | - | - |

### Workflow Actions
| Resource | Submit | Approve | Reject |
|----------|--------|---------|--------|
| SRV | POST `/api/srv/{id}/submit/` | POST `/api/srv/{id}/approve/` | POST `/api/srv/{id}/reject/` |
| SIV | POST `/api/siv/{id}/submit/` | POST `/api/siv/{id}/approve/` | POST `/api/siv/{id}/reject/` |
| Cleaning | POST `/api/cleaning/{id}/start/` | POST `/api/cleaning/{id}/complete/` | POST `/api/cleaning/{id}/cancel/` |

### Reports
| Report | Endpoint |
|--------|----------|
| Dashboard | GET `/api/reports/dashboard/` |
| Stock Summary | GET `/api/reports/stock-summary/` |
| SRV Register | GET `/api/reports/srv-register/` |
| SIV Register | GET `/api/reports/siv-register/` |
| Cleaning Summary | GET `/api/reports/cleaning-summary/` |
| Seed Distribution | GET `/api/reports/seed-distribution/` |
