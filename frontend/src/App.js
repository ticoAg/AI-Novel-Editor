import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import { TextField, Button, Typography } from '@mui/material';

// 导入组件
import Header from './components/Header';
import ReactMarkdown from 'react-markdown';
import StoryList from './components/StoryList';
import Editor from './components/Editor';
import AIAssistant from './components/AIAssistant';
import './App.css';
import ReactMarkdown from 'react-markdown';

// 创建主题
const theme = createTheme({
    palette: {
        primary: {
            main: '#6d4c41', // 棕色，适合文学/书籍主题
        },
        secondary: {
            main: '#78909c', // 蓝灰色
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.2rem',
            fontWeight: 500,
        },
        h2: {
            fontSize: '1.8rem',
            fontWeight: 500,
        },
    },
});

function App() {
    const [stories, setStories] = useState([]);
    const [currentStory, setCurrentStory] = useState(null);
    const [loading, setLoading] = useState(false);


    // 新增状态：标签选择、标题、大纲
    const [selectedTags, setSelectedTags] = useState([]);
    const [generatedTitle, setGeneratedTitle] = useState('');
    const [outline, setOutline] = useState('');
    const [isEditing, setIsEditing] = useState(false);


    // 获取所有小说


    // 创建新小说
    const createStory = async (title, content) => {
        try {
            setLoading(true);
            const response = await fetch('/stories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            if (!response.ok) {
                throw new Error('创建小说失败');
            }

            const newStory = await response.json();
            setStories([...stories, newStory]);
            setCurrentStory(newStory);
            return newStory;
        } catch (err) {
            console.error('创建小说错误:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // 更新小说
    const updateStory = async (storyId, title, content) => {
        try {
            setLoading(true);
            const response = await fetch(`/stories/${storyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: storyId, title, content }),
            });

            if (!response.ok) {
                throw new Error('更新小说失败');
            }

            const updatedStory = await response.json();
            setStories(stories.map(story => story.id === storyId ? updatedStory : story));
            setCurrentStory(updatedStory);
            return updatedStory;
        } catch (err) {
            console.error('更新小说错误:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // 删除小说
    const deleteStory = async (storyId) => {
        try {
            setLoading(true);
            const response = await fetch(`/stories/${storyId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('删除小说失败');
            }

            setStories(stories.filter(story => story.id !== storyId));
            if (currentStory && currentStory.id === storyId) {
                setCurrentStory(null);
            }
            return true;
        } catch (err) {
            console.error('删除小说错误:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 获取AI辅助建议
    const getAIAssistance = async (storyContent, requestType, specificRequest = null) => {
        try {
            setLoading(true);
            const response = await fetch('/ai/assist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    story_content: storyContent,
                    request_type: requestType,
                    specific_request: specificRequest,
                }),
            });

            if (!response.ok) {
                throw new Error('获取AI建议失败');
            }

            const data = await response.json();
            return data.suggestion;
        } catch (err) {
            console.error('获取AI建议错误:', err);
            return '获取AI建议时出错，请稍后再试。';
        } finally {
            setLoading(false);
        }
    };

    // 新增：生成标题
    // 生成标题函数中的修改
    const generateTitle = async () => {
        try {
            setLoading(true);
            // 确保selectedTags是一个数组，并且转换为后端期望的JSON字符串格式
            const requestBody = JSON.stringify({
                tags: selectedTags.map(tag => tag.trim()),
                stream: false
            });
            const response = await fetch('/ai/generate-title', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody
            });

            if (!response.ok) {
                throw new Error('生成标题失败');
            }
            const { title } = await response.json();
            setGeneratedTitle(title);
        } catch (err) {
            console.error('生成标题错误:', err);
        } finally {
            setLoading(false);
        }
    };

    // 新增：生成大纲（流式处理）
    const generateOutline = async () => {
        try {
            setLoading(true);
            setOutline("");
            const response = await fetch('/ai/generate-outline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: generatedTitle, tags: selectedTags }),
            });

            if (!response.ok) {
                throw new Error('生成大纲失败');
            }

            // 流式读取响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let result = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                result += decoder.decode(value, { stream: true });
                setOutline(prev => prev + decoder.decode(value, { stream: true }));
            }
        } catch (err) {
            console.error('生成大纲错误:', err);
        } finally {
            setLoading(false);
        }
    }

    // 新增：生成章节梗概
    const generateChapterSummaries = async () => {
        try {
            setLoading(true);
            const response = await fetch('/ai/generate-chapter-summaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ outline }),
            });

            if (!response.ok) {
                throw new Error('生成章节梗概失败');
            }

            const data = await response.json();
            // 这里不再 setChapterSummaries
        } catch (err) {
            console.error('生成章节梗概错误:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <div className="App">
                    <Header
                        currentStory={currentStory}
                        onCreateNew={() => createStory('新小说', '')}
                    />
                    <Container maxWidth="xl" sx={{ mt: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
                        <Box sx={{ mb: 2 }}>
                            {/* 新增：标签选择组件 */}
                            <div style={{ marginBottom: 16, textAlign: 'left' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>选择剧情/分类标签：</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {[
                                        { group: '剧情', tags: ['成长', '复仇', '冒险', '爱情', '悬疑', '励志'] },
                                        { group: '分类', tags: ['玄幻', '都市', '历史', '科幻', '武侠', '言情'] }
                                    ].map((cat, idx) => (
                                        <div key={cat.group} style={{ marginRight: 24 }}>
                                            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{cat.group}</div>
                                            {cat.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    onClick={() => {
                                                        setSelectedTags(selectedTags.includes(tag)
                                                            ? selectedTags.filter(t => t !== tag)
                                                            : [...selectedTags, tag]);
                                                    }}
                                                    style={{
                                                        display: 'inline-block',
                                                        padding: '4px 12px',
                                                        margin: '2px 4px 2px 0',
                                                        borderRadius: 16,
                                                        border: selectedTags.includes(tag) ? '2px solid #1976d2' : '1px solid #bbb',
                                                        background: selectedTags.includes(tag) ? '#e3f2fd' : '#fafafa',
                                                        color: selectedTags.includes(tag) ? '#1976d2' : '#333',
                                                        cursor: 'pointer',
                                                        fontSize: 14,
                                                        transition: 'all 0.2s'
                                                    }}
                                                >{tag}</span>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* 保留原有输入框用于兼容自定义标签输入 */}
                            <TextField
                                label="自定义标签（用逗号分隔）"
                                variant="outlined"
                                fullWidth
                                value={selectedTags.filter(tag => !['成长', '复仇', '冒险', '爱情', '悬疑', '励志', '玄幻', '都市', '历史', '科幻', '武侠', '言情'].includes(tag)).join(', ')}
                                onChange={(e) => {
                                    const customTags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                                    setSelectedTags([
                                        ...selectedTags.filter(tag => ['成长', '复仇', '冒险', '爱情', '悬疑', '励志', '玄幻', '都市', '历史', '科幻', '武侠', '言情'].includes(tag)),
                                        ...customTags
                                    ]);
                                }}
                                sx={{ mt: 1, mb: 2 }}
                            />
                            {generatedTitle ? (
                                <Typography variant="h6" sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                    {generatedTitle}
                                    <span style={{ cursor: 'pointer', marginLeft: 8 }} onClick={() => { setGeneratedTitle(''); setOutline(''); }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><polyline points="16 2 21 7 16 7" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
                                    </span>
                                </Typography>
                            ) : (
                                <Button onClick={generateTitle} disabled={loading} sx={{ mr: 1 }}>
                                    生成标题
                                </Button>
                            )}
                            <Button onClick={generateOutline} disabled={loading} sx={{ mr: 1 }}>
                                生成大纲
                            </Button>
                            <Button onClick={generateChapterSummaries} disabled={loading}>
                                生成章节梗概
                            </Button>
                            {outline && (
                                <div>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>大纲内容：</Typography>
                                    <div style={{ background: '#f6f8fa', borderRadius: 4, padding: 12, minHeight: 120, maxHeight: 400, overflowY: 'auto', border: '1px solid #e0e0e0' }}>
                                        <ReactMarkdown>{outline}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', height: '100%' }}>
                            <StoryList
                                stories={stories}
                                currentStory={currentStory}
                                onSelectStory={setCurrentStory}
                                onDeleteStory={deleteStory}
                                loading={loading}
                            />
                            <Editor
                                story={currentStory}
                                onSave={updateStory}
                                loading={loading}
                            />
                            <AIAssistant
                                story={currentStory}
                                getAIAssistance={getAIAssistance}
                                loading={loading}
                            />
                        </Box>
                    </Container>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;

// 处理编辑状态切换
const handleEditorFocus = () => setIsEditing(true);
const handleEditorBlur = () => setIsEditing(false);

// 添加拖拽处理函数
const handleDragStart = (e) => {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
};

const handleDragMove = (e) => {
    // 实现侧边栏宽度调整逻辑
};

const handleDragEnd = () => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
};

<Box
    sx={{
        flex: 2,
        p: 2,
        overflowY: 'auto',
        borderRight: '1px solid #ddd',
        backgroundColor: '#fff',
    }}
    onFocus={handleEditorFocus}
    onBlur={handleEditorBlur}
>
    {/* 显示标题 */}
    {generatedTitle && (
        <Box sx={{ mb: 2 }}>
            <Typography variant="body1">{generatedTitle}</Typography>
        </Box>
    )}

    {/* 大纲编辑器 */}
    <TextField
        label="大纲编辑器（Markdown格式）"
        multiline
        rows={6}
        fullWidth
        variant="outlined"
        value={outline}
        onChange={(e) => setOutline(e.target.value)}
        disabled={loading}
    />

    {/* 大纲预览 */}
    <Box sx={{ mt: 2, border: '1px solid #ddd', p: 1, borderRadius: 1, backgroundColor: '#fff' }}>
        <Typography variant="subtitle2" gutterBottom>大纲预览（Markdown渲染）:</Typography>
        <Box sx={{ bgcolor: '#f9f9f9', p: 1, borderRadius: 1 }}>
            <ReactMarkdown>{outline}</ReactMarkdown>
        </Box>
    </Box>
</Box>