import { useCallback, useState, useEffect, useRef } from "react";
import { useAgent } from "agents/react";
import { useAgentChat } from "@cloudflare/ai-chat/react";
import { Button, Text, Empty } from "@cloudflare/kumo";
import { useKumoToastManager } from "@cloudflare/kumo/components/toast";
import { ChatCircleDotsIcon, CircleIcon } from "@phosphor-icons/react";

import type { IncidentAgent } from "./server";
import type { AgentState } from "./types";
import { ChatMessage } from "./components/ChatMessage";
import { InvestigationProgress } from "./components/InvestigationProgress";
import { ApprovalPanel } from "./components/ApprovalPanel";
import { IncidentHistory } from "./components/IncidentHistory";

export function App() {
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const toasts = useKumoToastManager();
  
  const [workflowStatus, setWorkflowStatus] = useState<any>(null);

  const agent = useAgent<IncidentAgent, AgentState>({
    agent: "IncidentAgent",
    onOpen: useCallback(() => setConnected(true), []),
    onClose: useCallback(() => setConnected(false), []),
    onError: useCallback((error: Event) => console.error("WebSocket error:", error), []),
  });

  const { messages, sendMessage, status } = useAgentChat({
    agent,
    experimental_throttle: 100,
  });

  const isStreaming = status === "streaming" || status === "submitted";

  const state = agent.state;
  const currentInvestigation = state?.currentInvestigation;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentInvestigation && currentInvestigation.status === "running") {
       interval = setInterval(async () => {
          try {
             const stat = await agent.stub.getInvestigationStatus(currentInvestigation.instanceId);
             setWorkflowStatus(stat);
          } catch(e) {}
       }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentInvestigation, agent.stub]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage({ role: "user", parts: [{ type: "text", text }] });
    
    if (text.toLowerCase().includes("investigate")) {
       const serviceMatch = text.match(/([a-zA-Z0-9\-]+-service)/);
       if (serviceMatch) {
         agent.stub.startInvestigation(serviceMatch[1], text).catch(console.error);
       }
    }
  };

  const handleApprove = (id: string) => {
    agent.stub.approveRemediation(id).then(() => {
      toasts.add({ title: "Approved", description: "Remediation approved." });
    });
  };

  const handleReject = (id: string) => {
    agent.stub.rejectRemediation(id).then(() => {
      toasts.add({ title: "Rejected", description: "Remediation rejected.", variant: "error" });
    });
  };

  return (
    <div className="flex flex-col h-screen bg-kumo-elevated relative">
      <div className="w-full bg-kumo-warning text-kumo-warning-fg py-1 text-center text-sm font-semibold">
        ⚠️ All infrastructure data is simulated. No real production systems are connected.
      </div>

      <header className="px-5 py-4 bg-kumo-base border-b border-kumo-line flex items-center justify-between">
        <h1 className="text-lg font-semibold text-kumo-default">AI Incident Debugger</h1>
        <div className="flex items-center gap-1.5">
          <CircleIcon size={8} weight="fill" className={connected ? "text-kumo-success" : "text-kumo-danger"} />
          <Text size="xs" variant="secondary">{connected ? "Connected" : "Disconnected"}</Text>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-kumo-line p-5 overflow-y-auto bg-kumo-base">
           <h2 className="text-xl font-bold text-kumo-default mb-4">Investigation</h2>
           {currentInvestigation ? (
             <>
               <InvestigationProgress status={workflowStatus?.status || currentInvestigation.status} instance={currentInvestigation} />
               
               {workflowStatus?.status === "waiting" && currentInvestigation.status !== "approved" && currentInvestigation.status !== "rejected" && (
                 <ApprovalPanel instanceId={currentInvestigation.instanceId} onApprove={handleApprove} onReject={handleReject} />
               )}
             </>
           ) : (
             <p className="text-kumo-subtle text-sm">No active investigation. Ask the AI to investigate a service.</p>
           )}

           <div className="mt-8 border-t border-kumo-line pt-4">
             <h3 className="text-lg font-semibold text-kumo-default mb-2">Incident History</h3>
             <IncidentHistory incidents={state?.incidents || []} />
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col p-5 overflow-y-auto">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <Empty
                icon={<ChatCircleDotsIcon size={32} />}
                title="Start debugging"
                contents={
                  <Button variant="outline" size="sm" onClick={() => {
                    sendMessage({ role: "user", parts: [{ type: "text", text: "checkout-service is returning 500 errors. Investigate." }] });
                    agent.stub.startInvestigation("checkout-service", "checkout-service is returning 500 errors").catch(console.error);
                  }}>
                    "checkout-service is returning 500 errors. Investigate."
                  </Button>
                }
              />
            ) : (
              messages.map((m) => <ChatMessage key={m.id} message={m as any} isStreaming={isStreaming} />)
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="bg-kumo-base p-2 border border-kumo-line rounded-lg flex items-center">
             <input
               ref={textareaRef}
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
               placeholder="Describe the incident..."
               className="flex-1 bg-transparent outline-none px-2 text-sm text-kumo-default"
               disabled={isStreaming}
             />
             <Button variant="primary" size="sm" onClick={handleSend} disabled={isStreaming || !input.trim()}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
