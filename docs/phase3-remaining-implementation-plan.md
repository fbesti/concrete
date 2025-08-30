# Phase 3 Remaining Implementation Plan

## Overview

This document outlines the detailed implementation plan for the remaining Phase 3 features of the House Association MVP. The HA management system is complete, and we now need to implement document management, communication features, and comprehensive testing.

## Current Status

✅ **Completed:**

- HA management routes, controllers, and services
- HA member management with kennitala validation
- App.ts route registration

🔄 **Remaining Tasks:**

## 1. Azure Blob Storage Service for Document Management

### 1.1 Environment Configuration

**Files to modify:**

- `apps/api/src/config/env.ts` - Add Azure Storage environment variables

**Environment variables to add:**

```env
# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
AZURE_STORAGE_CONTAINER_NAME="ha-documents"
AZURE_STORAGE_ACCOUNT_NAME="hastorageaccount"
```

### 1.2 Azure Storage Service Implementation

**Features:**

- File upload to Azure Blob Storage
- File download from Azure Blob Storage
- File deletion from Azure Blob Storage
- Generate secure signed URLs for file access
- File metadata management
- Storage error handling

**Methods to implement:**

```typescript
class AzureStorageService {
  static async uploadFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string>;
  static async downloadFile(blobName: string): Promise<Buffer>;
  static async deleteFile(blobName: string): Promise<void>;
  static async generateDownloadUrl(
    blobName: string,
    expiresInMinutes: number
  ): Promise<string>;
  static async getFileMetadata(blobName: string): Promise<BlobMetadata>;
}
```

### 1.3 Dependencies to Install

```bash
pnpm --filter api add @azure/storage-blob
pnpm --filter api add -D @types/multer
```

## 2. Document Upload/Download Endpoints with File Validation

### 2.1 File Upload Middleware

**Files to create:**

- `apps/api/src/middleware/file-upload.middleware.ts`

**Features:**

- Multer configuration for file uploads
- File type validation (PDF, DOC, DOCX, XLS, XLSX, images)
- File size limits (max 10MB per file)
- Virus scanning integration (placeholder for future)
- File naming conventions

### 2.2 Document Schemas

**Files to create:**

- `apps/api/src/schemas/documents.schemas.ts`

**Validation schemas:**

```typescript
- uploadDocumentSchema - File upload validation
- getDocumentSchema - Document retrieval validation
- listDocumentsSchema - Document listing with filters
- updateDocumentSchema - Document metadata updates
- deleteDocumentSchema - Document deletion validation
```

### 2.3 Document Service

**Files to create:**

- `apps/api/src/services/documents.service.ts`

**Features:**

- Document CRUD operations
- File processing and storage
- Access control validation
- Document categorization (Insurance, Regulations, Maintenance)
- Search and filtering functionality
- File metadata management

### 2.4 Document Controller

**Files to create:**

- `apps/api/src/controllers/documents.controller.ts`

**Endpoints:**

```typescript
POST   /api/v1/ha/:haId/documents     - Upload document
GET    /api/v1/ha/:haId/documents     - List HA documents
GET    /api/v1/documents/:id          - Get document metadata
GET    /api/v1/documents/:id/download - Download document
PUT    /api/v1/documents/:id          - Update document metadata
DELETE /api/v1/documents/:id          - Delete document
```

### 2.5 Document Routes

**Files to create:**

- `apps/api/src/routes/documents.routes.ts`

**Features:**

- File upload route with multer middleware
- Role-based access control
- Input validation
- Error handling

## 3. Announcements System for HA Communication

### 3.1 Announcements Schemas

**Files to create:**

- `apps/api/src/schemas/announcements.schemas.ts`

**Validation schemas:**

```typescript
- createAnnouncementSchema - Announcement creation
- updateAnnouncementSchema - Announcement updates
- getAnnouncementSchema - Single announcement retrieval
- listAnnouncementsSchema - Announcement listing with pagination
```

### 3.2 Announcements Service

**Files to create:**

- `apps/api/src/services/announcements.service.ts`

**Features:**

- CRUD operations for announcements
- Access control (managers can create/edit, members can read)
- Pagination and filtering
- Rich text content support
- Announcement categories/tags

### 3.3 Announcements Controller

**Files to create:**

- `apps/api/src/controllers/announcements.controller.ts`

**Endpoints:**

```typescript
POST   /api/v1/ha/:haId/announcements - Create announcement (manager only)
GET    /api/v1/ha/:haId/announcements - List HA announcements
GET    /api/v1/announcements/:id      - Get announcement details
PUT    /api/v1/announcements/:id      - Update announcement (manager only)
DELETE /api/v1/announcements/:id      - Delete announcement (manager only)
```

### 3.4 Announcements Routes

**Files to create:**

- `apps/api/src/routes/announcements.routes.ts`

## 4. Basic Messaging Functionality

### 4.1 Messages Schemas

**Files to create:**

- `apps/api/src/schemas/messages.schemas.ts`

**Validation schemas:**

```typescript
- sendMessageSchema - Message sending validation
- listMessagesSchema - Message listing with pagination
- markReadSchema - Mark message as read
```

### 4.2 Messages Service

**Files to create:**

- `apps/api/src/services/messages.service.ts`

**Features:**

- Send messages to HA managers
- List user messages
- Mark messages as read/unread
- Message threading (future enhancement)
- Basic message filtering

### 4.3 Messages Controller

**Files to create:**

- `apps/api/src/controllers/messages.controller.ts`

**Endpoints:**

```typescript
POST /api/v1/messages           - Send message to HA manager
GET  /api/v1/messages           - Get user's messages
PUT  /api/v1/messages/:id/read  - Mark message as read
GET  /api/v1/messages/:id       - Get message details
```

### 4.4 Messages Routes

**Files to create:**

- `apps/api/src/routes/messages.routes.ts`

## 5. Meeting Management Endpoints

### 5.1 Meetings Schemas

**Files to create:**

- `apps/api/src/schemas/meetings.schemas.ts`

**Validation schemas:**

```typescript
- createMeetingSchema - Meeting creation validation
- updateMeetingSchema - Meeting updates
- getMeetingSchema - Single meeting retrieval
- listMeetingsSchema - Meeting listing with date filters
```

### 5.2 Meetings Service

**Files to create:**

- `apps/api/src/services/meetings.service.ts`

**Features:**

- CRUD operations for meetings
- Date/time validation
- Meeting status management (Scheduled, Completed, Cancelled)
- Agenda item management
- Meeting history tracking

### 5.3 Meetings Controller

**Files to create:**

- `apps/api/src/controllers/meetings.controller.ts`

**Endpoints:**

```typescript
POST   /api/v1/ha/:haId/meetings - Create meeting (manager only)
GET    /api/v1/ha/:haId/meetings - List HA meetings
GET    /api/v1/meetings/:id      - Get meeting details
PUT    /api/v1/meetings/:id      - Update meeting (manager only)
DELETE /api/v1/meetings/:id      - Delete meeting (manager only)
```

### 5.4 Meetings Routes

**Files to create:**

- `apps/api/src/routes/meetings.routes.ts`

## 6. Comprehensive Testing Implementation

### 6.1 Unit Tests for New Services

**Files to create:**

- `apps/api/tests/unit/services/ha.service.test.ts`
- `apps/api/tests/unit/services/documents.service.test.ts`
- `apps/api/tests/unit/services/announcements.service.test.ts`
- `apps/api/tests/unit/services/messages.service.test.ts`
- `apps/api/tests/unit/services/meetings.service.test.ts`
- `apps/api/tests/unit/services/azure-storage.service.test.ts`

**Test Coverage:**

- Service method functionality
- Error handling scenarios
- Access control validation
- Data validation
- Database operations

### 6.2 Integration Tests for New Endpoints

**Files to create:**

- `apps/api/tests/integration/ha.test.ts`
- `apps/api/tests/integration/documents.test.ts`
- `apps/api/tests/integration/announcements.test.ts`
- `apps/api/tests/integration/messages.test.ts`
- `apps/api/tests/integration/meetings.test.ts`

**Test Scenarios:**

- CRUD operations for each entity
- Authentication and authorization
- File upload/download workflows
- Error responses
- Pagination and filtering

### 6.3 Test Fixtures and Utilities

**Files to create:**

- `apps/api/tests/fixtures/ha-test-data.ts`
- `apps/api/tests/fixtures/documents-test-data.ts`
- `apps/api/tests/fixtures/test-files/` (sample PDFs, images)
- `apps/api/tests/utils/azure-storage-mock.ts`
- `apps/api/tests/utils/file-upload-helpers.ts`

## 7. Route Registration and App Integration

### 7.1 Update Main App File

**Files to modify:**

- `apps/api/src/app.ts`

**Changes:**

```typescript
// Import new routes
import documentsRoutes from './routes/documents.routes';
import announcementsRoutes from './routes/announcements.routes';
import messagesRoutes from './routes/messages.routes';
import meetingsRoutes from './routes/meetings.routes';

// Register new routes
app.use(`${env.API_PREFIX}/documents`, documentsRoutes);
app.use(`${env.API_PREFIX}/announcements`, announcementsRoutes);
app.use(`${env.API_PREFIX}/messages`, messagesRoutes);
app.use(`${env.API_PREFIX}/meetings`, meetingsRoutes);
```

## Implementation Priority Order

### Phase 3.1: Document Management (High Priority)

1. Azure Blob Storage service setup
2. File upload middleware
3. Document schemas, service, controller, routes
4. Document upload/download testing

### Phase 3.2: Communication Features (Medium Priority)

1. Announcements system implementation
2. Basic messaging functionality
3. Communication features testing

### Phase 3.3: Meeting Management (Medium Priority)

1. Meeting schemas, service, controller, routes
2. Meeting management testing

### Phase 3.4: Comprehensive Testing (High Priority)

1. Unit tests for all new services
2. Integration tests for all new endpoints
3. Test fixtures and utilities
4. Performance and security testing

## Success Criteria

### Technical Criteria

- [ ] All new endpoints follow existing patterns
- [ ] TypeScript strict mode compliance
- [ ] ESLint compliance maintained
- [ ] 80%+ test coverage on new features
- [ ] All tests passing (unit + integration)
- [ ] Azure Blob Storage integration working
- [ ] File upload/download functionality working
- [ ] Role-based access control implemented

### Functional Criteria

- [ ] HA managers can upload and manage documents
- [ ] Members can view and download shared documents
- [ ] Announcement system allows manager-to-member communication
- [ ] Basic messaging enables member-to-manager communication
- [ ] Meeting management provides scheduling capabilities
- [ ] All features respect user permissions and HA membership

### Performance Criteria

- [ ] File uploads handle up to 10MB efficiently
- [ ] Document listing supports pagination
- [ ] API responses under 200ms for non-file operations
- [ ] Proper error handling and user feedback
- [ ] Secure file access with signed URLs

## Estimated Implementation Time

- **Document Management**: 8-10 hours
- **Communication Features**: 6-8 hours
- **Meeting Management**: 4-6 hours
- **Comprehensive Testing**: 10-12 hours
- **Total**: 28-36 hours

## Next Steps

1. Start with Azure Blob Storage service implementation
2. Implement document management endpoints
3. Add communication features (announcements + messaging)
4. Implement meeting management
5. Create comprehensive test suite
6. Integration testing and bug fixes
7. Code review and optimization

This plan provides a clear roadmap for completing Phase 3 of the MVP, ensuring all features are properly implemented with appropriate testing and following established code patterns.
