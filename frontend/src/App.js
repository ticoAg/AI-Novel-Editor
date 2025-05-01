import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';
import { TextField, Button } from '@mui/material';

// 导入组件
import Header from './components/Header';
import StoryList from './components/StoryList';
import Editor from './components/Editor';
import AIAssistant from './components/AIAssistant';
import './App.css';

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
    const [error, setError] = useState(null);

    // 新增状态：标签选择、标题、大纲、章节梗概
    const [selectedTags, setSelectedTags] = useState([]);
    const [generatedTitle, setGeneratedTitle] = useState('');
    const [outline, setOutline] = useState('');
    const [chapterSummaries, setChapterSummaries] = useState([]);

    // 获取所有小说
    const fetchStories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/stories');
            if (!response.ok) {
                throw new Error('获取小说列表失败');
            }
            const data = await response.json();
            setStories(data);
        } catch (err) {
            setError(err.message);
            console.error('获取小说列表错误:', err);
        } finally {
            setLoading(false);
        }
    };

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
            setError(err.message);
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
            setError(err.message);
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
            setError(err.message);
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
            setError(err.message);
            console.error('获取AI建议错误:', err);
            return '获取AI建议时出错，请稍后再试。';
        } finally {
            setLoading(false);
        }
    };

    // 新增：生成标题
    const generateTitle = async () => {
        try {
            setLoading(true);
            const response = await fetch('/ai/generate-title', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tags: selectedTags }),
            });

            if (!response.ok) {
                throw new Error('生成标题失败');
            }

            const data = await response.json();
            setGeneratedTitle(data.title);
        } catch (err) {
            setError(err.message);
            console.error('生成标题错误:', err);
        } finally {
            setLoading(false);
        }
    };

    // 新增：生成大纲
    const generateOutline = async () => {
        try {
            setLoading(true);
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

            const data = await response.json();
            setOutline(data.outline);
        } catch (err) {
            setError(err.message);
            console.error('生成大纲错误:', err);
        } finally {
            setLoading(false);
        }
    };

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
            setChapterSummaries(data.summaries);
        } catch (err) {
            setError(err.message);
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
                            <TextField
                                label="选择类型标签"
                                variant="outlined"
                                fullWidth
                                value={selectedTags.join(', ')}
                                onChange={(e) => setSelectedTags(e.target.value.split(',').map(tag => tag.trim()))}
                            />
                            <Button onClick={generateTitle} disabled={loading}>
                                生成标题
                            </Button>
                            <Button onClick={generateOutline} disabled={loading}>
                                生成大纲
                            </Button>
                            <Button onClick={generateChapterSummaries} disabled={loading}>
                                生成章节梗概
                            </Button>
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