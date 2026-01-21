import {
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  Button
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AssignOfficerModal({ complaint, onClose, refresh }) {
  const [officers, setOfficers] = useState([]);
  const [officerId, setOfficerId] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8081/api/admin/officers", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then((res) => setOfficers(res.data));
  }, []);

  const assign = async () => {
    await axios.post(
      `http://localhost:8081/api/admin/complaints/${complaint.id}/assign-officer`,
      { officerId },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    refresh();
    onClose();
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Assign Officer</DialogTitle>
      <DialogContent>
        <Select
          fullWidth
          value={officerId}
          onChange={(e) => setOfficerId(e.target.value)}
        >
          {officers.map((o) => (
            <MenuItem key={o.id} value={o.id}>
              {o.name} ({o.department})
            </MenuItem>
          ))}
        </Select>

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={!officerId}
          onClick={assign}
        >
          Assign
        </Button>
      </DialogContent>
    </Dialog>
  );
}
