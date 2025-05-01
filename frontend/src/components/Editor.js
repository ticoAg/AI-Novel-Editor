import React, { useState, useEffect } from 'react';
import { Box, TextField, Paper, Typography, Button, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const Editor = ({ story, onSave, loading }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isEdited, setIsEdited] = useState(false);

    // 当选中的小说改变时，更新编辑器内容
    useEffect(() => {
        if (story) {
            setTitle(story.title || '');
            setContent(story.content || '');
            setIsEdited(false);
        } else {
            setTitle('');
            setContent('');
            setIsEdited(false);
        }
    }, [story]);

    // 处理保存
    const handleSave = () => {
        if (story && onSave) {
            onSave(story.id, title, content);
            setIsEdited(false);
        }
    };

    // 处理标题变化
    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setIsEdited(true);
    };

    // 处理内容变化
    const handleContentChange = (e) => {
        setContent(e.target.value);
        setIsEdited(true);
    };

    return (
        <Paper
            elevation={3}
            sx={{
                flexGrow: 2,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                mr: 2,
                position: 'relative'
            }}
        >
            {!story ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                        请选择一个小说或创建新小说
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <TextField
                            label="标题"
                            variant="outlined"
                            fullWidth
                            value={title}
                            onChange={handleTitleChange}
                            sx={{ mr: 2 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={loading || !isEdited}
                        >
                            保存
                        </Button>
                    </Box>
                    <TextField
                        label="内容"
                        multiline
                        fullWidth
                        variant="outlined"
                        value={content}
                        onChange={handleContentChange}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            sx: { height: '100%', '& .MuiInputBase-inputMultiline': { height: '100%' } }
                        }}
                    />
                </>
            )}
        </Paper>
    );
};

export default Editor;