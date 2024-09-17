import React from 'react';
import { Paper, Typography } from '@mui/material';

interface AIChatHistoryProps {
  medicalRecord: string;
}

const AIChatHistory: React.FC<AIChatHistoryProps> = ({ medicalRecord }) => {
  return (
    <Paper elevation={3} style={{ padding: '16px', minHeight: '200px' }}>
      <Typography variant="h6">カルテ内容</Typography>
      <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
        {medicalRecord || 'カルテがここに表示されます。'}
      </Typography>
    </Paper>
  );
};

export default AIChatHistory;