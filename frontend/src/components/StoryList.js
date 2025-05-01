import React from 'react';
import { Box, List, ListItem, ListItemText, ListItemButton, ListItemSecondaryAction, IconButton, Typography, Divider, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const StoryList = ({ stories, currentStory, onSelectStory, onDeleteStory, loading }) => {
    // 格式化日期
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return format(date, 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
        } catch (e) {
            console.error('日期格式化错误:', e);
            return dateString;
        }
    };

    return (
        <Paper elevation={2} sx={{ width: 280, mr: 2, overflow: 'auto' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">我的小说</Typography>
            </Box>
            <Divider />
            {stories.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {loading ? '加载中...' : '没有小说，点击\"新建小说\"开始创作吧！'}
                    </Typography>
                </Box>
            ) : (
                <List>
                    {stories.map((story) => (
                        <ListItem key={story.id} disablePadding selected={currentStory && currentStory.id === story.id}>
                            <ListItemButton onClick={() => onSelectStory && onSelectStory(story)}>
                                <ListItemText
                                    primary={story.title || '未命名小说'}
                                    secondary={formatDate(story.updatedAt) || formatDate(story.createdAt)}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="delete" onClick={() => onDeleteStory && onDeleteStory(story.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default StoryList;