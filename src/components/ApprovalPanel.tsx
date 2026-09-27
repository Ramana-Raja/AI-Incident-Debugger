import { Surface, Button } from "@cloudflare/kumo";
import { CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react";

export function ApprovalPanel({ instanceId, onApprove, onReject }: { instanceId: string, onApprove: (id: string) => void, onReject: (id: string) => void }) {
  if (!instanceId) return null;

  return (
    <Surface className="p-4 mb-4 rounded-xl ring ring-kumo-warning">
      <h3 className="text-lg font-semibold mb-2 text-kumo-warning">Approval Required</h3>
      <p className="mb-4 text-sm text-kumo-default">The AI has generated a diagnosis and remediation plan. Please approve or reject to continue the workflow simulation.</p>
      <div className="flex space-x-2">
        <Button variant="primary" icon={<CheckCircleIcon size={16} />} onClick={() => onApprove(instanceId)}>Approve</Button>
        <Button variant="secondary" icon={<XCircleIcon size={16} />} onClick={() => onReject(instanceId)}>Reject</Button>
      </div>
    </Surface>
  );
}
