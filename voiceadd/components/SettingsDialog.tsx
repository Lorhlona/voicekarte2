import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  showMessage: (msg: string) => void;
  initialPrompt: string;
  followUpPrompt: string;
  apiKey: string;
  onSave: (type: string, value: string) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose,
  showMessage,
  initialPrompt,
  followUpPrompt,
  apiKey,
  onSave,
}) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (selectedOption === 'initialPrompt') {
      setPrompt(initialPrompt);
    } else if (selectedOption === 'followUpPrompt') {
      setPrompt(followUpPrompt);
    } else if (selectedOption === 'api') {
      setPrompt(apiKey);
    } else {
      setPrompt('');
    }
  }, [selectedOption, initialPrompt, followUpPrompt, apiKey]);

  const handleOptionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedOption(event.target.value as string);
  };

  const handleRegister = () => {
    if (selectedOption) {
      onSave(selectedOption, prompt);
      showMessage('設定が保存されました');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {selectedOption === 'api'
          ? 'OpenAI APIキー設定'
          : selectedOption === 'initialPrompt'
          ? '初診カルテシステムプロンプト編集'
          : '再診カルテシステムプロンプト編集'}
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1">設定項目を選択してください</Typography>
        <Select
          fullWidth
          value={selectedOption}
          onChange={handleOptionChange}
          displayEmpty
          variant="outlined"
          style={{ marginTop: '16px', marginBottom: '16px' }}
        >
          <MenuItem value="" disabled>
            選択してください
          </MenuItem>
          <MenuItem value="initialPrompt">初診カルテシステムプロンプト編集</MenuItem>
          <MenuItem value="followUpPrompt">再診カルテシステムプロンプト編集</MenuItem>
          <MenuItem value="api">OpenAI APIキー設定</MenuItem>
        </Select>
        {selectedOption === 'api' ? (
          <TextField
            autoFocus
            margin="dense"
            id="apiKey"
            label="OpenAI APIキー"
            type="password"
            fullWidth
            variant="outlined"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        ) : (
          <TextField
            autoFocus
            margin="dense"
            id="systemPrompt"
            label={
              selectedOption === 'initialPrompt'
                ? '初診カルテシステムプロンプト'
                : '再診カルテシステムプロンプト'
            }
            multiline
            rows={10}
            fullWidth
            variant="outlined"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          キャンセル
        </Button>
        <Button onClick={handleRegister} color="primary" variant="contained">
          登録
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;