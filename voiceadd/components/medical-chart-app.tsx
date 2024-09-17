'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Snackbar, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Menu,
  MenuItem
} from '@mui/material';
import { Mic, NoteAdd, FileCopy, Clear, Settings } from '@mui/icons-material';
import useRecorder from '@/hooks/useRecorder';
import { uploadAudio, generateMedicalRecord } from '@/utils/api';
import { getConfigFromAPI } from '@/utils/config';

const initialSystemPrompt = `あなたは医師のアシスタントです。患者の症状や状態を聞き、適切な診断と治療方針を提案してください。`;

export function MedicalChartAppComponent() {
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useRecorder();
  const [chartContent, setChartContent] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'api' | 'initialPrompt' | 'followUpPrompt'>('api');
  const [apiKey, setApiKey] = useState('');
  const [initialPrompt, setInitialPrompt] = useState(initialSystemPrompt);
  const [followUpPrompt, setFollowUpPrompt] = useState(initialSystemPrompt);

  const loadConfig = async () => {
    try {
      const [apiKeyData, initialPromptData, followUpPromptData] = await Promise.all([
        getConfigFromAPI('api_key.txt'),
        getConfigFromAPI('initial_prompt.txt'),
        getConfigFromAPI('follow_up_prompt.txt'),
      ]);
      setApiKey(apiKeyData);
      setInitialPrompt(initialPromptData);
      setFollowUpPrompt(followUpPromptData);
    } catch (error: any) {
      setSnackbarMessage(`設定の読み込みに失敗しました: ${error.message}`);
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleRecording = () => {
    if (!isRecording) {
      startRecording();
      setSnackbarMessage('録音を開始しました。');
    } else {
      stopRecording();
      setSnackbarMessage('録音を完了しました。カルテ作成ボタンを押してください。');
    }
    setSnackbarOpen(true);
  };

  const [isTranscribing, setIsTranscribing] = useState(false);

  const createChart = async (type: 'initial' | 'followUp') => {
    if (!audioBlob) {
      setSnackbarMessage('まず録音を行ってください。');
      setSnackbarOpen(true);
      return;
    }

    if (!apiKey) {
      setSnackbarMessage('APIキーが設定されていません。');
      setSnackbarOpen(true);
      return;
    }
    setIsTranscribing(true);
    try {
      console.log('API Key:', apiKey);

      // トランスクリプトを取得
      const { transcript } = await uploadAudio(audioBlob, apiKey);
      console.log('Transcript:', transcript);

      if (!transcript) {
        setSnackbarMessage('音声のトランスクリプトが取得できませんでした。');
        setSnackbarOpen(true);
        return;
      }

      console.log('initialPrompt:', initialPrompt);
      console.log('followUpPrompt:', followUpPrompt);

      const prompt = type === 'initial' ? initialPrompt : followUpPrompt;
      const record = await generateMedicalRecord(transcript, prompt, apiKey);
      console.log('Generated Medical Record:', record);

      setChartContent(record);
      setSnackbarMessage(`${type === 'initial' ? '初診' : '再診'}カルテを作成しました。`);
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error creating chart:', error);
      setSnackbarMessage(`エラーが発生しました: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      // トランスクリプション処理終了
      setIsTranscribing(false);
    }
  };

  const copyChart = () => {
    navigator.clipboard.writeText(chartContent);
    setSnackbarMessage('カルテをコピーしました。');
    setSnackbarOpen(true);
  };

  const clearAll = () => {
    clearRecording();
    setChartContent('');
    setSnackbarMessage('すべてクリアしました。');
    setSnackbarOpen(true);
  };

  const handleOpenSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleCloseSettings = () => {
    setSettingsAnchorEl(null);
  };

  const handleOpenDialog = (type: 'api' | 'initialPrompt' | 'followUpPrompt') => {
    setDialogType(type);
    setDialogOpen(true);
    handleCloseSettings();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSave = async () => {
    try {
      const filename =
        dialogType === 'api' ? 'api_key.txt' :
        dialogType === 'initialPrompt' ? 'initial_prompt.txt' :
        'follow_up_prompt.txt';
    
      const content =
        dialogType === 'api' ? apiKey :
        dialogType === 'initialPrompt' ? initialPrompt :
        followUpPrompt;
    
      const response = await fetch(`/api/config?filename=${filename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
    
      const result = await response.json();
    
      if (response.ok) {
        setSnackbarMessage('設定を保存しました。');
        await loadConfig();
      } else {
        setSnackbarMessage(`設定の保存に失敗しました: ${result.error}`);
      }
    } catch (error: any) {
      setSnackbarMessage(`エラーが発生しました: ${error.message}`);
    } finally {
      setSnackbarOpen(true);
      setDialogOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 2 }}>
      <Paper elevation={3} sx={{ flex: 1, mb: 2, p: 2, overflowY: 'auto' }}>
        <Typography variant="body1">{chartContent || 'カルテがここに表示されます。'}</Typography>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          color={isRecording ? 'secondary' : 'primary'}
          startIcon={<Mic />}
          onClick={handleRecording}
        >
          {isRecording ? '録音停止' : '録音開始'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<NoteAdd />}
          onClick={() => createChart('initial')}
          disabled={isRecording || isTranscribing}
        >
          初診カルテ作成
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<NoteAdd />}
          onClick={() => createChart('followUp')}
          disabled={isRecording || isTranscribing}
        >
          再診カルテ作成
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileCopy />}
          onClick={copyChart}
        >
          コピー
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<Clear />}
          onClick={clearAll}
        >
          クリア
        </Button>
        <Button
          variant="contained"
          color="info"
          startIcon={<Settings />}
          onClick={handleOpenSettings}
        >
          設定
        </Button>
      </Box>
      <Menu
        anchorEl={settingsAnchorEl}
        open={Boolean(settingsAnchorEl)}
        onClose={handleCloseSettings}
      >
        <MenuItem onClick={() => handleOpenDialog('initialPrompt')}>初診カルテシステムプロンプト編集</MenuItem>
        <MenuItem onClick={() => handleOpenDialog('followUpPrompt')}>再診カルテシステムプロンプト編集</MenuItem>
        <MenuItem onClick={() => handleOpenDialog('api')}>OpenAI APIキー設定</MenuItem>
      </Menu>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {dialogType === 'api' ? 'OpenAI APIキー設定' : 
           dialogType === 'initialPrompt' ? '初診カルテシステムプロンプト編集' : 
           '再診カルテシステムプロンプト編集'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'api' ? (
            <TextField
              autoFocus
              margin="dense"
              id="apiKey"
              label="OpenAI APIキー"
              type="password"
              fullWidth
              variant="outlined"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          ) : (
            <TextField
              autoFocus
              margin="dense"
              id="systemPrompt"
              label={dialogType === 'initialPrompt' ? '初診カルテシステムプロンプト' : '再診カルテシステムプロンプト'}
              multiline
              rows={10}
              fullWidth
              variant="outlined"
              value={dialogType === 'initialPrompt' ? initialPrompt : followUpPrompt}
              onChange={(e) => dialogType === 'initialPrompt' ? setInitialPrompt(e.target.value) : setFollowUpPrompt(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSave}>登録</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
