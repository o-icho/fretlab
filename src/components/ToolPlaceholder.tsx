import { Container } from "./Container";
import { Icon } from "./Icon";
import { Button } from "./Button";
import { ToolCard } from "./ToolCard";
import { tools, type Tool } from "@/lib/content";
export function ToolPlaceholder({ tool }: { tool: Tool }) {
  return (
    <Container>
      <section className="page-intro">
        <p className="eyebrow">LA BOÎTE À OUTILS / {tool.number}</p>
        <h1>{tool.name}</h1>
        <p>{tool.description}</p>
      </section>
      <section
        className={`placeholder ${tool.color}`}
        aria-labelledby="coming-title"
      >
        <span className="tool-icon">
          <Icon name={tool.icon} size={40} />
        </span>
        <span className="status-pill">En préparation</span>
        <h2 id="coming-title">Le bon outil prend forme.</h2>
        <p>
          Notre {tool.name.toLocaleLowerCase("fr")} sera bientôt disponible.
          <br />
          Encore un peu de patience avant votre prochaine session.
        </p>
        <Button href="/#outils" secondary>
          Explorer les outils <Icon name="arrow" size={18} />
        </Button>
        <span className="placeholder-note">
          Gratuit · Sans compte · Directement dans votre navigateur
        </span>
      </section>
      <section className="related-section">
        <h2>À découvrir aussi</h2>
        <div className="tool-grid related-grid">
          {tools
            .filter((t) => t.slug !== tool.slug)
            .map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
        </div>
      </section>
    </Container>
  );
}
