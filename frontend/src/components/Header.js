import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

const Header = ({ currentStory, onCreateNew, onSave }) => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    AI小说编辑器
                </Typography>
                <Box>
                    <Button
                        color="inherit"
                        startIcon={<AddIcon />}
                        onClick={onCreateNew}
                    >
                        新建小说
                    </Button>
                    {currentStory && (
                        <Button
                            color="inherit"
                            startIcon={<SaveIcon />}
                            onClick={() => onSave && onSave()}
                        >
                            保存
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;