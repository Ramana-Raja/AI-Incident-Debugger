import { Surface } from "@cloudflare/kumo";
import { CheckCircleIcon, ArrowRightIcon } from "@phosphor-icons/react";

export function InvestigationProgress({ status, instance }: { status: any, instance: any }) {
  if (!instance) return null;

  return (
    <Surface className="p-4 mb-4 rounded-xl ring ring-kumo-line">
      <h3 className="text-lg font-semibold mb-2 text-kumo-default">Investigation Progress</h3>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon size={16} className="text-kumo-success" />
          <span className="text-sm text-kumo-default">Parsed incident</span>
        </div>
        <div className="flex items-center space-x-2">
          {status === "running" ? <ArrowRightIcon size={16} className="text-kumo-brand animate-pulse" /> : <CheckCircleIcon size={16} className="text-kumo-success" />}
          <span className="text-sm text-kumo-default">Searching logs</span>
        </div>
        <div className="flex items-center space-x-2">
          {status === "running" ? <ArrowRightIcon size={16} className="text-kumo-brand animate-pulse" /> : <CheckCircleIcon size={16} className="text-kumo-success" />}
          <span className="text-sm text-kumo-default">Analyzing metrics</span>
        </div>
        <div className="flex items-center space-x-2">
          {status === "running" ? <ArrowRightIcon size={16} className="text-kumo-brand animate-pulse" /> : <CheckCircleIcon size={16} className="text-kumo-success" />}
          <span className="text-sm text-kumo-default">Checking deployments</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-kumo-subtle">Workflow Status: {status || "unknown"}</p>
    </Surface>
  );
}
