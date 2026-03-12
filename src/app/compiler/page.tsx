import { Container, Card } from "@/components/ui";
import { CompilerClient } from "./CompilerClient";

export default function CompilerPage() {
  return (
    <Container className="py-8 md:py-10">
      <div className="mb-6">
        <div className="text-xs tracking-[0.35em] text-muted uppercase">Compiler</div>
        <h1 className="text-2xl md:text-3xl font-extrabold mt-2 text-text">Online Compiler</h1>
        <p className="text-sm text-muted mt-2 max-w-3xl">
          Write code, provide input, and run instantly. Supports JavaScript, Python, Java, and C++.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <CompilerClient />
      </Card>
    </Container>
  );
}

