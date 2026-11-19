# AutoSense Firestore Security Specification

## 1. Data Invariants
1. User profiles (`/users/{userId}`) contain PII (`email`, `phone`, `city`) and are readable/writable ONLY by the owning user or a verified Admin. Users cannot self-assign `role: "admin"` on create or update.
2. Vehicles (`/vehicles/{vehicleId}`) belong strictly to `ownerId == request.auth.uid`, which is immutable after creation.
3. Diagnostic scans (`/diagnosticScans/{scanId}`) and Maintenance records (`/maintenanceRecords/{recordId}`) MUST reference an existing `vehicleId` owned by `request.auth.uid` on creation. Once a scan or maintenance record reaches a terminal state (`status == 'resolved'` or `status == 'completed'`), regular users cannot mutate or reopen it (only Admin override is permitted).
4. Notifications (`/notifications/{notificationId}`) are strictly owner-scoped; users can only mark `isRead` or update `updatedAt` via the allowed action branch.
5. Reference catalogs (`/obdCodes`, `/serviceCentres`) are readable by authenticated users and writable ONLY by verified Admins.
6. Service enquiries and feedback (`/serviceEnquiries/{enquiryId}`) can be created by verified users with `status: 'pending'` and empty `adminNote`, read by the owner or Admin, and updated/triaged only by Admin.
7. Bypass Action audit logs (`/bypassLogs/{logId}`) MUST reference both an existing `vehicleId` and `scanId` owned by `request.auth.uid`, enforce `occurredAt == request.time`, and remain strictly immutable (`allow update: if false;`) to preserve a reliable mechanic audit trail.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Self-Assigned Admin Role**: `POST /users/{uid}` with `role: "admin"` by non-admin user -> `PERMISSION_DENIED`.
2. **Privilege Escalation Update**: `PATCH /users/{uid}` changing `role` from `"user"` to `"admin"` -> `PERMISSION_DENIED`.
3. **Cross-User PII Read**: Non-admin user `get /users/{otherUid}` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection**: `POST /vehicles/{id}` adding extra undeclared key `isFreeTierBypass: true` -> `PERMISSION_DENIED`.
5. **Owner Spoofing**: `POST /vehicles/{id}` with `ownerId: "victim-uid"` -> `PERMISSION_DENIED`.
6. **Orphaned Scan Creation**: `POST /diagnosticScans/{id}` referencing nonexistent or other user's `vehicleId` -> `PERMISSION_DENIED`.
7. **Terminal State Reopen**: `PATCH /maintenanceRecords/{id}` changing `status` from `"completed"` back to `"upcoming"` by non-admin -> `PERMISSION_DENIED`.
8. **Timestamp Forgery**: `POST /vehicles/{id}` passing client `createdAt` not equal to `request.time` -> `PERMISSION_DENIED`.
9. **ID Poisoning**: `POST /vehicles/{1500-char-invalid-id}` -> `PERMISSION_DENIED`.
10. **Email Spoofing Attack**: Request with `token.email == adminEmail` and `token.email_verified == false` -> `PERMISSION_DENIED`.
11. **Unbounded Array Exhaustion**: `POST /diagnosticScans/{id}` with 500 elements in `detectedCodes` -> `PERMISSION_DENIED`.
12. **Blanket List Scraping**: `LIST /vehicles` without `where('ownerId', '==', uid)` by non-admin -> `PERMISSION_DENIED`.
13. **Audit Log Tampering**: `PATCH /bypassLogs/{logId}` modifying `modifiedSensors` or `occurredAt` -> `PERMISSION_DENIED`.
