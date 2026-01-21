import React, { useEffect, useState } from "react";
import FeedbackList from "./FeedbackList";
import FeedbackForm from "./FeedbackForm";

const FeedbackContainer = ({
  complaints,
  selectedComplaint,
  clearSelection,
}) => {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (selectedComplaint) {
      setCurrent(selectedComplaint);
    }
  }, [selectedComplaint]);

  if (current) {
    return (
      <FeedbackForm
        complaint={current}
        onBack={() => {
          setCurrent(null);
          clearSelection();
        }}
      />
    );
  }

  return (
    <FeedbackList
      complaints={complaints}
      onSelectComplaint={setCurrent}
    />
  );
};

export default FeedbackContainer;
