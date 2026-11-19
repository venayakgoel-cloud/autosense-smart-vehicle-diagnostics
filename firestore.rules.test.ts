/**
 * Firestore Security Rules Adversarial Verification Suite ("Dirty Dozen")
 * Designed for verification against the Firebase Rules Emulator / Red Team Audit.
 */

export const DIRTY_DOZEN_CASES = [
  {
    id: 1,
    name: 'Self-Assigned Admin Role',
    path: '/users/attacker_uid',
    operation: 'create',
    auth: { uid: 'attacker_uid', token: { email: 'attacker@example.com', email_verified: true } },
    payload: { uid: 'attacker_uid', fullName: 'Attacker', email: 'attacker@example.com', role: 'admin' },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Privilege Escalation Update',
    path: '/users/attacker_uid',
    operation: 'update',
    auth: { uid: 'attacker_uid', token: { email: 'attacker@example.com', email_verified: true } },
    payload: { role: 'admin' },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Cross-User PII Read',
    path: '/users/victim_uid',
    operation: 'get',
    auth: { uid: 'attacker_uid', token: { email: 'attacker@example.com', email_verified: true } },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'Shadow Field Injection',
    path: '/vehicles/veh_1',
    operation: 'create',
    auth: { uid: 'user_1', token: { email_verified: true } },
    payload: { ownerId: 'user_1', isFreeTierBypass: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'Owner Spoofing on Vehicle Create',
    path: '/vehicles/veh_2',
    operation: 'create',
    auth: { uid: 'attacker_uid', token: { email_verified: true } },
    payload: { ownerId: 'victim_uid', manufacturer: 'Toyota', model: 'Corolla' },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'Orphaned Diagnostic Scan Creation',
    path: '/diagnosticScans/scan_1',
    operation: 'create',
    auth: { uid: 'attacker_uid', token: { email_verified: true } },
    payload: { ownerId: 'attacker_uid', vehicleId: 'victim_vehicle_id' },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Terminal State Reopen on Maintenance',
    path: '/maintenanceRecords/maint_completed',
    operation: 'update',
    auth: { uid: 'user_1', token: { email_verified: true } },
    payload: { status: 'upcoming' },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'Client Timestamp Forgery',
    path: '/vehicles/veh_3',
    operation: 'create',
    auth: { uid: 'user_1', token: { email_verified: true } },
    payload: { ownerId: 'user_1', createdAt: '1999-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'ID Poisoning (>128 chars or invalid chars)',
    path: `/vehicles/${'a'.repeat(200)}`,
    operation: 'create',
    auth: { uid: 'user_1', token: { email_verified: true } },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Unverified Admin Email Spoof Attack',
    path: '/users/victim_uid',
    operation: 'get',
    auth: { uid: 'spoof_uid', token: { email: 'venayak.0251mba765@dgu.ac.in', email_verified: false } },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Unbounded Array Exhaustion',
    path: '/diagnosticScans/scan_2',
    operation: 'create',
    auth: { uid: 'user_1', token: { email_verified: true } },
    payload: { detectedCodes: new Array(25).fill('P0300') },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Blanket List Scraping',
    path: '/vehicles',
    operation: 'list',
    auth: { uid: 'attacker_uid', token: { email_verified: true } },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 13,
    name: 'Immutable Bypass Audit Log Tampering',
    path: '/bypassLogs/byp_1',
    operation: 'update',
    auth: { uid: 'user_1', token: { email_verified: true } },
    payload: { modifiedSensors: ['P0420'] },
    expected: 'PERMISSION_DENIED'
  }
];
