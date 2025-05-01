import React, { useState } from 'react';
import { Box, Paper, Typography, Button, TextField, CircularProgress, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const AIAssistant = ({ story, getAIAssistance, loading }) => {
    const [assistanceType, setAssistanceType] = useState('plot');
    const [specificRequest, setSpecificRequest] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);


    // 移除未使用的 generateWritingStyle 变量
    // 新增：生成正文
    const generateBodyText = async () => {
        if (!story || !story.content) {
            setAiResponse('请先创建或选择一个包含内容的小说');
            return;
        }

        setIsRequesting(true);
        try {
            const response = await getAIAssistance(story.content, 'body', specificRequest);
            setAiResponse(response);
        } catch (error) {
            console.error('生成正文出错:', error);
            setAiResponse('生成正文时出错，请稍后再试');
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <Paper
            elevation={3}
            sx={{
                width: 320,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                height: '100%',
                overflow: 'auto'
            }}
        >
            <Typography variant="h6" gutterBottom>
                AI写作助手
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!story ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                        请选择一个小说或创建新小说
                    </Typography>
                </Box>
            ) : (
                <>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>请求类型</InputLabel>
                        <Select
                            value={assistanceType}
                            onChange={(e) => setAssistanceType(e.target.value)}
                            label="请求类型"
                        >
                            <MenuItem value="plot">情节建议</MenuItem>
                            <MenuItem value="character">角色发展</MenuItem>
                            <MenuItem value="style">文风调整</MenuItem>
                            <MenuItem value="body">生成正文</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="具体要求"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        value={specificRequest}
                        onChange={(e) => setSpecificRequest(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={assistanceType === 'body' ? generateBodyText : handleGetAssistance}
                        disabled={isRequesting || loading}
                        startIcon={<AutoFixHighIcon />}
                    >
                        获取建议
                    </Button>
                    {isRequesting && <CircularProgress size={24} sx={{ ml: 2 }} />}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="h6">AI回复</Typography>
                        <Box
                            className="ai-response"
                            sx={{
                                whiteSpace: 'pre-wrap',
                                textAlign: 'left',
                                backgroundColor: '#f5f5f5',
                                padding: 2,
                                borderRadius: 1,
                                maxHeight: 300,
                                overflowY: 'auto'
                            }}
                        >
                            {aiResponse}
                        </Box>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default AIAssistant;