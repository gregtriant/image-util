import { useState } from "react"
import { 
    Box,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    CircularProgress,
} from "@mui/material"

import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import LandscapeIcon from '@mui/icons-material/Landscape';
import DeleteIcon from '@mui/icons-material/Delete';
const FileItem = ({
    file,
    status="initial", // initial | compressing | success | error
    type // normal | compressed
}) => {



    return (
        <ListItem 
            sx={{ py: "4px" }}
            secondaryAction={
                <Box edge="end" aria-label="delete">
                    {
                        type!=="normal"?
                            <></>
                        :status==="initial"?
                            <></>
                        :status==="compressing"?
                            <CircularProgress />
                        :status==="success"?
                            <CheckCircleIcon color="success" />
                        :status==="error"?
                            <ErrorIcon color="error" />
                        :
                            <></>
                    }
                </Box>
            }
        >
            <ListItemAvatar>
            <Avatar>
                {
                    type === "normal"? 
                    <ImageIcon />
                    :
                    <LandscapeIcon />
                }
            </Avatar>
            </ListItemAvatar>
            <ListItemText primary={file.name} secondary={file.size.toFixed(3) + " Mb"} />
        </ListItem>
    )
}

export default FileItem;