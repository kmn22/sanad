

export type Status = { emailConfigured: boolean; billingConfigured: boolean; backupEncryptionConfigured: boolean; mfaEnabled: boolean; overduePrivacyRequests: number; openIncidents: number; uptimeSeconds?: number; queuedJobs?: number; failedJobs?: number; lastBackupAt?: string | null }
