import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button
} from "@mui/material";
import { useState } from "react";
import axios from "axios";

export default function EditResolutionModal({ complaint, onClose, refresh }) {
  const [date, setDate] = useState(complaint.resolutionDate || "");

  const updateDate = async () => {
    await axios.put(
      `http://localhost:8081/api/admin/complaints/${complaint.id}/resolution-date`,
      { resolutionDate: date },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    refresh();
    onClose();
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Edit Resolution Date</DialogTitle>
      <DialogContent>
        <TextField
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{ mt: 1 }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={updateDate}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
