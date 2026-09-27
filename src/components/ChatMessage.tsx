import { Text, Surface, Badge } from "@cloudflare/kumo";
import { GearIcon } from "@phosphor-icons/react";
import { getToolName, isToolUIPart, type UIMessage } from "ai";

export function ChatMessage({ message, isStreaming }: { message: UIMessage, isStreaming: boolean }) {
  const isUser = message.role === "user";
  
  return (
    <div className={`flex flex-col space-y-2 mb-4 ${isUser ? "items-end" : "items-start"}`}>
      {message.parts.map((part, i) => {
        const key = `${message.id}-${i}`;
        
        if (part.type === "text") {
          return (
            <Surface key={key} className={`max-w-[85%] px-4 py-2.5 rounded-xl ${isUser ? "bg-kumo-brand text-white" : "bg-kumo-control"}`}>
              <Text>{part.text}</Text>
            </Surface>
          );
        }

        if (isToolUIPart(part)) {
          const toolName = getToolName(part);
          if (part.state === "output-available") {
            return (
              <Surface key={key} className="max-w-[85%] px-4 py-2.5 rounded-xl ring ring-kumo-line mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <GearIcon size={14} className="text-kumo-inactive" />
                  <Text size="xs" variant="secondary" bold>{toolName}</Text>
                  <Badge variant="secondary">Done</Badge>
                </div>
              </Surface>
            );
          }
          if (part.state === "input-available" || part.state === "input-streaming") {
             return (
               <Surface key={key} className="max-w-[85%] px-4 py-2.5 rounded-xl ring ring-kumo-line mt-2">
                 <div className="flex items-center gap-2">
                   <GearIcon size={14} className="text-kumo-inactive animate-spin" />
                   <Text size="xs" variant="secondary">Running {toolName}...</Text>
                 </div>
               </Surface>
             );
          }
        }
        
        return null;
      })}
    </div>
  );
}
