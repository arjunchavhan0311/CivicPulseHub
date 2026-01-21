import React, { useState } from "react";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  CardActions,
  Button,
  Modal,
  LinearProgress,
} from "@mui/material";
import { statusColor, priorityColor } from "./helpers";

/* STATUS → PROGRESS MAPPING */
const getProgressByStatus = (status) => {
  switch (status) {
    case "PENDING":
      return 0;
    case "ASSIGNED":
      return 10;
    case "IN_PROGRESS":
      return 50;
    case "ESCALATED":
      return 75;
    case "RESOLVED":
      return 100;
    default:
      return 0;
  }
};

const AllComplaintsCards = ({ complaints, handleViewDetails }) => {
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageClick = (url) => setPreviewImage(url);
  const handleClose = () => setPreviewImage(null);

  return (
    <>
      <Grid container spacing={3} className="complaints-grid">
        {complaints.length === 0 && (
          <Typography sx={{ mt: 3, mx: 2, fontStyle: "italic" }}>
            No complaints yet
          </Typography>
        )}

        {complaints.map((c) => {
          const isResolved = c.status === "RESOLVED";
          const progress = getProgressByStatus(c.status);

          return (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 6,
                  transition: "0.3s",
                  "&:hover": { boxShadow: 12, transform: "translateY(-3px)" },
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 440,
                  backgroundColor: isResolved ? "#e6f4ea" : "white",
                  position: "relative",
                }}
                className="complaint-card"
              >
                {/* HIGH PRIORITY RIBBON */}
                {c.priority === "HIGH" && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 22,
                      right: -55,
                      transform: "rotate(45deg)",
                      bgcolor: "error.main",
                      color: "white",
                      px: 4,
                      py: 1.5,
                      fontWeight: "bold",
                      fontSize: 14,
                      zIndex: 2,
                      boxShadow: "2px 2px 8px rgba(0,0,0,0.5)",
                      borderRadius: 1,
                    }}
                  >
                    HIGH PRIORITY
                  </Box>
                )}

                {/* IMAGE */}
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    c.imageUrl
                      ? `http://localhost:8081${c.imageUrl}`
                      : "https://via.placeholder.com/400x200"
                  }
                  onError={(e) =>
                    (e.target.src = "https://via.placeholder.com/400x200")
                  }
                  sx={{
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    c.imageUrl &&
                    handleImageClick(`http://localhost:8081${c.imageUrl}`)
                  }
                  className="complaint-image"
                />

                {/* CONTENT */}
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* CHIPS */}
                  <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                    <Chip label={c.category} size="small" color="primary" />
                    <Chip
                      label={c.status}
                      size="small"
                      color={statusColor(c.status)}
                    />
                    <Chip
                      label={c.priority}
                      size="small"
                      color={priorityColor(c.priority)}
                    />
                  </Box>

                  {/* TITLE */}
                  <Typography fontWeight="bold" variant="h6" gutterBottom>
                    #{c.id} {c.title}
                  </Typography>

                  {/* RESOLUTION */}
                  <Typography variant="body2" color="gray">
                    {isResolved
                      ? `Resolved on ${
                          c.resolutionDate
                            ? new Date(c.resolutionDate).toLocaleDateString()
                            : "-"
                        }`
                      : "Pending Resolution"}
                  </Typography>

                  {/* PROGRESS BAR */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progress: {progress}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        mt: 0.5,
                        backgroundColor: "#eee",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            c.status === "RESOLVED"
                              ? "#2e7d32"
                              : c.status === "ESCALATED"
                              ? "#ed6c02"
                              : "#1976d2",
                        },
                      }}
                    />
                  </Box>
                </CardContent>

                {/* BUTTON */}
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: isResolved ? "gray" : "#1976d2",
                      "&:hover": {
                        bgcolor: isResolved ? "gray" : "#115293",
                      },
                      fontWeight: "bold",
                    }}
                    onClick={() => !isResolved && handleViewDetails(c)}
                    disabled={isResolved}
                    size="small"
                    color="primary"
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* IMAGE PREVIEW MODAL */}
      <Modal
        open={!!previewImage}
        onClose={handleClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Box
          component="img"
          src={previewImage}
          alt="Preview"
          sx={{
            maxHeight: "60%",
            maxWidth: "60%",
            borderRadius: 2,
            boxShadow: 12,
          }}
        />
      </Modal>
    </>
  );
};

export default AllComplaintsCards;
