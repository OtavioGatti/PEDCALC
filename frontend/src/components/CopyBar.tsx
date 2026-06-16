import { Clipboard, Check } from "lucide-react";

type CopyBarProps = {
  disabled: boolean;
  copied: boolean;
  onCopy: () => void;
};

export function CopyBar({ disabled, copied, onCopy }: CopyBarProps) {
  return (
    <div className="copy-bar">
      <button type="button" disabled={disabled} onClick={onCopy} className={copied ? "copied" : ""}>
        {copied ? <Check size={25} /> : <Clipboard size={25} />}
        {copied ? "Prescrição Copiada" : "Copiar Prescrição"}
      </button>
    </div>
  );
}
