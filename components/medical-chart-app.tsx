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
import { Mic, NoteAdd, FileCopy, Clear, Settings, FileUpload ,ExitToApp } from '@mui/icons-material';
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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingConfirmOpen, setRecordingConfirmOpen] = useState(false);

  // 追加部分
  const [uploadedAudio, setUploadedAudio] = useState<Blob | null>(null);
  const [isFileSelected, setIsFileSelected] = useState(false);

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

  const handleRecordingClick = () => {
    if (!isRecording) {
      if (audioBlob) {
        setRecordingConfirmOpen(true);
      } else {
        startRecording();
        setSnackbarMessage('録音を開始しました。');
        setSnackbarOpen(true);
      }
    } else {
      stopRecording();
      setSnackbarMessage('録音を完了しました。カルテ作成ボタンを押してください。');
      setSnackbarOpen(true);
    }
  };

  const handleRecordingConfirm = () => {
    setRecordingConfirmOpen(false);
    clearRecording();
    startRecording();
    setSnackbarMessage('録音を開始しました。');
    setSnackbarOpen(true);
  };

  const handleRecordingCancel = () => {
    setRecordingConfirmOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file);
      const allowedExtensions = ['.m4a', '.mp3', '.wav', '.webm', '.mp4'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (allowedExtensions.includes(fileExtension)) {
        setUploadedAudio(file);
        setIsFileSelected(true);
        setSnackbarMessage('ファイルが選択されました。');
      } else {
        setSnackbarMessage('対応していないファイル形式です。');
      }
      setSnackbarOpen(true);
    }
  };

  const createChart = async (type: 'initial' | 'followUp') => {
    let blob: Blob | null = audioBlob;

    if (isFileSelected && uploadedAudio) {
      blob = uploadedAudio;
    }

    if (!blob) {
      setSnackbarMessage('まず録音するか、ファイルをアップロードしてください。');
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
      const { transcript } = await uploadAudio(blob, apiKey);

      if (!transcript) {
        setSnackbarMessage('音声のトランスクリプトが取得できませんでした。');
        setSnackbarOpen(true);
        return;
      }

      const prompt = type === 'initial' ? initialPrompt : followUpPrompt;
      const record = await generateMedicalRecord(transcript, prompt, apiKey);

      setChartContent(record);
      setSnackbarMessage(`${type === 'initial' ? '初診' : '再診'}カルテを作成しました。`);
      setSnackbarOpen(true);

      // ファイル選択をリセット
      setUploadedAudio(null);
      setIsFileSelected(false);
    } catch (error: any) {
      console.error('Error creating chart:', error);
      setSnackbarMessage(`エラーが発生しました: ${error.message}`);
      setSnackbarOpen(true);
    } finally {
      setIsTranscribing(false);
    }
  };

  const copyChart = () => {
    navigator.clipboard.writeText(chartContent);
    setSnackbarMessage('カルテをコピーしました。');
    setSnackbarOpen(true);
  };


  const handleClearFiles = async () => {
    try {
      const response = await fetch('/api/clearFiles', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setChartContent('');
        setSnackbarMessage(data.message || 'ファイルをクリアしました。');
      } else {
        setSnackbarMessage(data.error || 'ファイルのクリアに失敗しました。');
      }
    } catch (error: any) {
      console.error('Error clearing files:', error);
      setSnackbarMessage(`エラーが発生しました: ${error.message}`);
    } finally {
      setSnackbarOpen(true);
      setUploadedAudio(null);
      setIsFileSelected(false);
      clearRecording();
    }
  };

  const handleExit = async () => {
    try {
      const response = await fetch('/api/exit', { method: 'POST' });
      const data = await response.json();
      setSnackbarMessage(data.message || 'サーバーを終了します。');
      setSnackbarOpen(true);
    } catch (error: any) {
      setSnackbarMessage(`エラーが発生しました: ${error.message}`);
      setSnackbarOpen(true);
    }
  };


  const clearAll = handleClearFiles;

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
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {chartContent || 'カルテがここに表示されます。'}
        </Typography>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        {/* 録音ボタン */}
        <Button
          variant="contained"
          color={isRecording ? 'secondary' : 'primary'}
          startIcon={<Mic />}
          onClick={handleRecordingClick}
        >
          {isRecording ? '録音停止' : '録音開始'}
        </Button>

        {/* ファイルアップロードボタン */}
        <Button
          variant="contained"
          component="label"
          color="primary"
          startIcon={<FileUpload />}
          disabled={isRecording || isTranscribing}
        >
          ファイルアップロード
          <input
            type="file"
            hidden
            accept="audio/*"
            onChange={handleFileChange}
          />
        </Button>

        {/* 初診カルテ作成ボタン */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<NoteAdd />}
          onClick={() => createChart('initial')}
          disabled={isRecording || isTranscribing || (!audioBlob && !isFileSelected)}
        >
          初診カルテ作成
        </Button>

        {/* 再診カルテ作成ボタン */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<NoteAdd />}
          onClick={() => createChart('followUp')}
          disabled={isRecording || isTranscribing || (!audioBlob && !isFileSelected)}
        >
          再診カルテ作成
        </Button>

        {/* コピー */}
        <Button
          variant="contained"
          color="primary"
          startIcon={<FileCopy />}
          onClick={copyChart}
        >
          コピー
        </Button>

        {/* クリア */}
        <Button
          variant="contained"
          color="error"
          startIcon={<Clear />}
          onClick={handleClearFiles}
          disabled={isTranscribing}
        >
          クリア
        </Button>

        {/* 設定 */}
        <Button
          variant="contained"
          color="info"
          startIcon={<Settings />}
          onClick={handleOpenSettings}
        >
          設定
        </Button>

        {/* 終了 */}
        <Button
          variant="contained"
          color="error"
          startIcon={<ExitToApp />}
          onClick={handleExit}
        >
          終了
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

      {/* 録音確認ダイアログ */}
      <Dialog
        open={recordingConfirmOpen}
        onClose={handleRecordingCancel}
      >
        <DialogTitle>録音の確認</DialogTitle>
        <DialogContent>
          <Typography>
            前回の音声を削除してから録音を開始しますが、よろしいですか？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRecordingCancel}>キャンセル</Button>
          <Button onClick={handleRecordingConfirm} color="primary">
            録音開始
          </Button>
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
