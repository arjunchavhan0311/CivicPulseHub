import { Dialog, DialogContent } from "@mui/material";

export default function ImagePreviewModal({ open, onClose, image }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogContent>
        <img
          src={`http://localhost:8081${image}`}
          alt="Complaint"
          style={{ width: "100%", borderRadius: 8 }}
        />
      </DialogContent>
    </Dialog>
  );
}
