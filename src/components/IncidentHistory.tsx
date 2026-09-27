import { Surface } from "@cloudflare/kumo";
import type { IncidentRecord } from "../types";

export function IncidentHistory({ incidents }: { incidents: IncidentRecord[] }) {
  if (!incidents || incidents.length === 0) {
    return <p className="text-kumo-subtle text-sm">No past incidents.</p>;
  }

  return (
    <div className="space-y-2 mt-4">
      {incidents.map((incident, i) => (
        <Surface key={incident.id || i} className="p-3 rounded-lg ring ring-kumo-line text-sm">
          <div className="font-semibold text-kumo-default">{incident.service}</div>
          <div className="text-kumo-subtle text-xs mt-0.5">{incident.description}</div>
          <div className="mt-2 text-xs text-kumo-inactive">Status: {incident.decision}</div>
        </Surface>
      ))}
    </div>
  );
}
