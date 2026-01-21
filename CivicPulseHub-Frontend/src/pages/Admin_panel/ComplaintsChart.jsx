import { Card, CardContent, Typography } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

export default function ComplaintsChart({ complaints }) {
  const data = Object.values(
    complaints.reduce((acc, c) => {
      acc[c.category] = acc[c.category] || {
        id: c.category,
        label: c.category,
        value: 0,
      };
      acc[c.category].value += 1;
      return acc;
    }, {})
  );

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Complaints by Category
        </Typography>

        {data.length === 0 ? (
          <Typography>No data available</Typography>
        ) : (
          <PieChart series={[{ data }]} height={250} />
        )}
      </CardContent>
    </Card>
  );
}
