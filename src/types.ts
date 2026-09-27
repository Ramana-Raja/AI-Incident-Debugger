export interface AgentState {
  incidents: IncidentRecord[];
  currentInvestigation: {
    instanceId: string;
    service: string;
    status: string;
    startedAt: string;
  } | null;
}

export interface IncidentRecord {
  id: string;
  service: string;
  description: string;
  diagnosis: string;
  evidence: string[];
  remediation: string;
  decision: "approved" | "rejected" | "pending";
  remediationResult?: string;
  timestamp: string;
}

export interface InvestigationParams {
  service: string;
  description: string;
  agentId: string;
}

export interface InvestigationResult {
  diagnosis: string;
  evidence: string[];
  remediation: string;
  status: string;
  timeline: any[];
}