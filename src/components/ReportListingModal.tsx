import ReportModal from "./ReportModal.tsx";

type ReportListingModalProps = {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comment: string) => Promise<void>;
};

export default function ReportListingModal(props: ReportListingModalProps) {
  return (
    <ReportModal
      {...props}
      title="Reportar publicación"
      description="Indica el motivo y un comentario (mínimo 3 caracteres cada uno)."
    />
  );
}
