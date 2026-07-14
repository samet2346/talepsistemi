import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Onayla", 
  cancelText = "İptal", 
  isDestructive = false // Silme/İptal gibi tehlikeli işlemler için kırmızı buton yapar
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-slate-300 mb-6 leading-relaxed">{message}</p>
      
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button 
          variant={isDestructive ? "danger" : "primary"} // Eğer Button bileşeninde 'danger' yoksa bg-red-600 sınıfı eklemelisin
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}