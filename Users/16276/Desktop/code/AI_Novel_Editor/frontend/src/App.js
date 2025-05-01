import { TextField, Button } from '@mui/material'; // 新增: 导入 TextField 和 Button

function App() {
    /***/
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
                    </Container>
                </div>
            </Router>
        </ThemeProvider>
    );
}