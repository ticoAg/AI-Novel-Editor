const AIAssistant = ({ story, getAIAssistance, loading }) => {
    const [assistanceType, setAssistanceType] = useState('plot');
    const [specificRequest, setSpecificRequest] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);

    const handleTypeChange = (e) => {
        setAssistanceType(e.target.value);
    };

    const handleSpecificRequestChange = (e) => {
        setSpecificRequest(e.target.value);
    };

    const handleGetAssistance = async () => {
        if (!story || !story.content) {
            setAiResponse('请先创建或选择一个包含内容的小说');
            return;
        }

        setIsRequesting(true);
        try {
            const response = await getAIAssistance(story.content, assistanceType, specificRequest);
            setAiResponse(response);
        } catch (error) {
            console.error('获取AI建议出错:', error);
            setAiResponse('获取AI建议时出错，请稍后再试');
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <Paper className="ai-assistant">
            <Box sx={{ p: 2 }}>
                <Typography variant="h6">AI助手</Typography>
                <Divider sx={{ mb: 2 }} />
                {!story ? (
                    <Typography variant="body2" color="text.secondary">
                        请选择一个小说以获取AI建议
                    </Typography>
                ) : (
                    <>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="assistance-type-label">建议类型</InputLabel>
                            <Select
                                labelId="assistance-type-label"
                                value={assistanceType}
                                label="建议类型"
                                onChange={handleTypeChange}
                                disabled={isRequesting}
                            >
                                <MenuItem value="plot">情节建议</MenuItem>
                                <MenuItem value="character">角色发展</MenuItem>
                                <MenuItem value="style">文风调整</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="具体需求（可选）"
                            placeholder={`请输入您对${getTypeLabel(assistanceType)}的具体需求...`}
                            multiline
                            rows={2}
                            fullWidth
                            variant="outlined"
                            value={specificRequest}
                            onChange={handleSpecificRequestChange}
                            sx={{ mb: 2 }}
                            disabled={isRequesting}
                        />

                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={isRequesting ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                            onClick={handleGetAssistance}
                            disabled={isRequesting || loading}
                            sx={{ mb: 2 }}
                        >
                            获取{getTypeLabel(assistanceType)}
                        </Button>

                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6">AI回复</Typography>
                            <Box className="ai-response">
                                <Typography variant="body1">{aiResponse}</Typography>
                            </Box>
                        </Box>
                    </>
                )}
            </Box>
        </Paper>
    );
};