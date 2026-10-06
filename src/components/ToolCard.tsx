import Link from "next/link";
import { toolHref, type Tool } from "@/lib/content";
import { Icon } from "./Icon";
export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={toolHref(tool.slug)} className={`tool-card ${tool.color}`}>
      <div className="tool-card-top">
        <span className="tool-icon">
          <Icon name={tool.icon} size={28} />
        </span>
        <span className="card-number">{tool.number}</span>
      </div>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
      <span className="card-link">
        Découvrir l’outil <Icon name="arrow" size={18} />
      </span>
    </Link>
  );
}
