import { useState } from "react";

type CopyIdButtonProps = {
  id: string;
};

export default function CopyIdButton({ id }: CopyIdButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      title={copied ? "Copiado" : "Copiar ID"}
      aria-label={copied ? "ID copiado al portapapeles" : "Copiar ID al portapapeles"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-base transition hover:bg-neutral-100"
    >
      {copied ? "✓" : "📋"}
    </button>
  );
}
