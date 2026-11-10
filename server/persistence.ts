import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AgencyBillingState,
  createDefaultAgencyBilling,
} from './creditLedger';
import { computeAuditHash, hashPassword } from './security';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', '.data');
const STORE_FILE = path.join(DATA_DIR, 'agentos_store.json');

export interface StoredAuthAccount {
  userId: string;
  agencyId: string;
  email: string;
  role: 'admin' | 'agent';
  passwordHash: string;
  salt: string;
}

export interface ChainedAuditLog {
  id: string;
  agencyId: string;
  timestamp: string;
  actorName: string;
  action: string;
  targetName: string;
  details: string;
  prevHash: string;
  entryHash: string;
}

export interface ServerStoreSchema {
  version: number;
  accounts: StoredAuthAccount[];
  billingByAgency: Record<string, AgencyBillingState>;
  collections: Record<string, unknown[]>;
  auditChain: ChainedAuditLog[];
}

function buildDefaultAccounts(): StoredAuthAccount[] {
  const agentCreds = hashPassword('password123', 'agentos_salt_user_1');
  const adminCreds = hashPassword('password123', 'agentos_salt_user_2');
  return [
    {
      userId: 'user_1',
      agencyId: 'agency_1',
      email: 'moniaros@gmail.com',
      role: 'agent',
      passwordHash: agentCreds.hash,
      salt: agentCreds.salt,
    },
    {
      userId: 'user_2',
      agencyId: 'agency_1',
      email: 'admin@agency1.com',
      role: 'admin',
      passwordHash: adminCreds.hash,
      salt: adminCreds.salt,
    },
  ];
}

function createInitialStore(): ServerStoreSchema {
  const genesisPayload = {
    id: 'log_genesis',
    agencyId: 'agency_1',
    timestamp: '2026-11-01T08:00:00.000Z',
    actorName: 'System Security Kernel',
    action: 'ledger_initialized',
    targetName: 'Agency 1 Tenant Vault',
    details: 'Initialized cryptographic SHA-256 audit chain and multi-tenant store.',
  };
  const entryHash = computeAuditHash('GENESIS', genesisPayload);

  return {
    version: 1,
    accounts: buildDefaultAccounts(),
    billingByAgency: {
      agency_1: createDefaultAgencyBilling('agency_1'),
      agency_2: createDefaultAgencyBilling('agency_2'),
    },
    collections: {},
    auditChain: [
      {
        ...genesisPayload,
        prevHash: 'GENESIS',
        entryHash,
      },
    ],
  };
}

let memoryStore: ServerStoreSchema | null = null;

export function getServerStore(): ServerStoreSchema {
  if (memoryStore) return memoryStore;
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw) as ServerStoreSchema;
      if (parsed && parsed.version === 1) {
        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch (err) {
    console.warn('Could not read .data/agentos_store.json, initializing clean store:', err);
  }
  memoryStore = createInitialStore();
  persistServerStore(memoryStore);
  return memoryStore;
}

export function persistServerStore(store: ServerStoreSchema): void {
  memoryStore = store;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpFile = `${STORE_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), 'utf8');
    fs.renameSync(tmpFile, STORE_FILE);
  } catch (err) {
    console.warn('Non-fatal warning writing store to disk:', err);
  }
}

export function getAgencyBilling(agencyId: string): AgencyBillingState {
  const store = getServerStore();
  if (!store.billingByAgency[agencyId]) {
    store.billingByAgency[agencyId] = createDefaultAgencyBilling(agencyId);
    persistServerStore(store);
  }
  return store.billingByAgency[agencyId];
}

export function saveAgencyBilling(agencyId: string, state: AgencyBillingState): AgencyBillingState {
  const store = getServerStore();
  store.billingByAgency[agencyId] = state;
  persistServerStore(store);
  return state;
}

export function appendChainedAuditLog(entry: {
  agencyId: string;
  actorName: string;
  action: string;
  targetName: string;
  details: string;
}): ChainedAuditLog {
  const store = getServerStore();
  const prevHash =
    store.auditChain.length > 0 ? store.auditChain[0].entryHash : 'GENESIS';
  const basePayload = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    agencyId: entry.agencyId,
    timestamp: new Date().toISOString(),
    actorName: entry.actorName,
    action: entry.action,
    targetName: entry.targetName,
    details: entry.details,
  };
  const entryHash = computeAuditHash(prevHash, basePayload);
  const fullRecord: ChainedAuditLog = {
    ...basePayload,
    prevHash,
    entryHash,
  };
  store.auditChain.unshift(fullRecord);
  persistServerStore(store);
  return fullRecord;
}

export function getCollectionData<T = unknown>(collectionName: string): T[] | null {
  const store = getServerStore();
  if (!Array.isArray(store.collections[collectionName])) {
    return null;
  }
  return store.collections[collectionName] as T[];
}

export function setCollectionData<T = unknown>(collectionName: string, items: T[]): T[] {
  const store = getServerStore();
  store.collections[collectionName] = items as unknown[];
  persistServerStore(store);
  return items;
}
