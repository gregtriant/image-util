import { useState, useEffect, useRef } from 'react';
import { sendToElectron, removeAllListeners, listenOn } from './helpers/functions';
import {
    Button,
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    List,
    IconButton,
    Backdrop,
    CircularProgress
} from '@mui/material';
import FileItem from "./components/FileItem";
// import AreYouSurePopup from './components/AreYouSurePopup';
import RefreshIcon from '@mui/icons-material/Refresh';
import MySnackbar from './components/MySnackBar';

function App() {
    const initialFiles = {
        images: [],
        videos: []
    }

    const [showSnack, setShowSnack] = useState(false);
    const [snackSeverity, setSnackSeverity] = useState('success');
    const [snackMessage, setSnackMessage] = useState('');

    const success = (message) => {
        setSnackMessage(message);
        setSnackSeverity('success');
        setShowSnack(true);
    };

    const error = (message) => {
        setSnackMessage(message);
        setSnackSeverity('error');
        setShowSnack(true);
    };

    const [openBackdrop, setOpenBackdrop] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [showAreYouSure, setShowAreYouSure] = useState(false);
    const [folder, setFolder] = useState("");
    const [outputFolder, setOutputFolder] = useState("");
    const [files, setFiles] = useState(initialFiles);
    const [compressedFiles, setCompressedFiles] = useState(initialFiles);
    const filesRef = useRef();
    const compressFileRef = useRef();
    const folderRef = useRef();
    const outputFolderRef = useRef();
    const successRef = useRef();
    const errorRef = useRef();

    filesRef.current = files;
    folderRef.current = folder;
    outputFolderRef.current = outputFolder;
    successRef.current = success;
    errorRef.current = error;

    const compressFile = (index) => {
        if (outputFolder === "") {
            console.log("select output folder!")
            return;
        }
        const newFiles = Object.assign({}, files); // deep clone
        newFiles.images[index].status = "compressing";
        setFiles(newFiles);
        const args = {
            dir: folder,
            outputDir: outputFolder,
            file: files.images[index],
            index: index
        }
        setLoading(true);
        sendToElectron("compress-file", args); // we are compressing the files one after the other starting from the first one
    };

    compressFileRef.current = compressFile;

    // const replaceFiles = () => {
    //     setLoading(true);
    //     sendToElectron("replace-originals-with-compressed", folder);
    // };

    const refreshFolders = (type) => {
        if (type === "input") {
            setFolder("");
            setFiles(initialFiles);
        } else if (type === "output") {
            setOutputFolder("");
        }
        setCompressedFiles(initialFiles);
    };

    useEffect(() => {
        setFiles(filesRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filesRef.current]); // This effect will run whenever folderRef.current changes

    useEffect(() => {
        listenOn('folder-selected-result', (_event, _args) => {
            console.log(_args);
            if (_args) {
                setFiles(_args);
            }
        });

        listenOn('compress-files-result', (_event, _args) => {
            console.log(_args);
            setCompressedFiles(_args);
        });

        listenOn('compress-file-result', (_event, _args) => { // we are compressing the files one after the other
            const { success: suc, filename, index } = _args;
			console.log("result:", filename);
            const newFiles = Object.assign({}, filesRef.current); // deep clone
            newFiles.images[index].status = "success";
            filesRef.current = newFiles;
            if (suc) {
                success(`Done compressing ${index+1} / ${filesRef.current.images.length}`);
            }
            if ((parseInt(index) + 1) < filesRef.current.images.length) {
                compressFileRef.current(index + 1);
            } else {
                // finished! get stats of compressed folder
                setLoading(false);
                sendToElectron("folder-selected-compressed", outputFolderRef.current);
                setOpenBackdrop(true);
                const args = {
                    inputDir: folderRef.current,
                    outputDir: outputFolderRef.current,
                }
                sendToElectron("copy-rest-to-output", args);
            }
        });

        listenOn('folder-selected-compressed-result', (_event, _args) => {
            console.log(_args);
            setCompressedFiles(_args);
        });

        // listenOn('replace-originals-with-compressed-result', (_event, _args) => {
        //     console.log(_args);
        //     if (_args) {
        //         setShowAreYouSure(false);
        //         setCompressedFiles(initialFiles);
        //         setFiles(initialFiles);
        //         sendToElectron("folder-selected", folderRef.current);
        //     }
        //     setLoading(false);
        // });

        listenOn('open-select-directory-result', (_event, _args) => {
            console.log(_args);
            const { type, path } = _args;
            if (type === "input" && path) {
                setFolder(path);
                setOutputFolder(path + "__output");
                sendToElectron("folder-selected", path);
            } else if (type === "output" && path) {
                setOutputFolder(path);
            }
        });

        listenOn('copy-rest-to-output-result', (_event, _args) => {
            console.log(_args);
            if (_args) {
                successRef.current("Operation Completed!");
            } else {
                errorRef.current("Something went wrong while copying the rest of the files to the output folder!");
            }
            setOpenBackdrop(false);
        });

        return () => {
            removeAllListeners();
        };
    }, []);

    return (
        <Box sx={{
            py: 5,
            minWidth: "1000px"
        }}>
            {/* <AreYouSurePopup 
                open={showAreYouSure}
                title={"Are you sure?"}
                content={"This action will replace the original photos with the newly compressed ones. Make sure you review them before you continue!"}
                actionText={"Continue"}
                actionColor={"success"}
                onAccept={() => replaceFiles()}
                onDecline={() => setShowAreYouSure(false)}
            /> */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={openBackdrop}
                // onClick={() => setOpenBackdrop(false)}
            >
                <Typography sx={{mr: 2}}>Copying the rest of the files to the output folder...</Typography>
                <CircularProgress color="inherit" />
            </Backdrop>
            <MySnackbar severity={snackSeverity} message={snackMessage} open={showSnack} setOpen={setShowSnack}/>
            <Grid container justifyContent={"center"}>
                <Grid item xs={4} sx={{mx:2}}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            sendToElectron("open-select-directory", "input");
                        }}
                        disabled={loading}
                    >
                        Choose Input Folder
                    </Button>
                    <IconButton
                        variant="contained"
                        color="primary"
                        sx={{mt: 2, ml: 2, mb: 2}}
                        disabled={loading || folder===""}
                        onClick={() => refreshFolders("input")}
                    >
                        <RefreshIcon />
                    </IconButton>
                    <Box sx={{ mt: 2, maxWidth: "500px" }}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" sx={{fontSize: "0.8rem"}}>
                                    {folder ?? ''}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>
                <Grid item xs={4} sx={{mx:2}}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            sendToElectron("open-select-directory", "output");
                        }}
                        disabled={loading}
                    >
                        Choose Output Folder
                    </Button>
                        
                    <IconButton
                        variant="contained"
                        color="primary"
                        sx={{mt: 2, ml: 2, mb: 2}}
                        disabled={loading || outputFolder===""}
                        onClick={() => refreshFolders("output")}
                    >
                        <RefreshIcon />
                    </IconButton>
                    <Box sx={{ mt: 2, maxWidth: "500px" }}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" sx={{fontSize: "0.8rem"}}>
                                    {outputFolder ?? ''}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>
            </Grid>
            
            <Grid container justifyContent={"center"} sx={{mt: 2}}>
                <Button
                    variant="contained"
                    color="success"
                    sx={{mt: 2}}
                    disabled={files.images?.length === 0 && files.videos?.length === 0 || loading}
                    onClick={() => compressFile(0)}
                >
                    Compress {files.images?.length} files
                </Button>
            </Grid>

            <Grid
                container
                justifyContent="center"
                sx={{mt: 4, mb: 4}}
            >
                <Grid
                    item 
                    xs={4}
                    sx={{
                        mx: 2,
                        p: 1,
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid lightgrey",
                        borderRadius: "15px"
                    }}
                >
                    <List dense={true}>
                        {
                            files.images?.map((file, index) => {
                                return <FileItem key={`image_${index}`} file={file} type={"normal"} status={file.status} />
                            })
                        }
                    </List>
                    
                    {/* {
                        files.videos?.map((file, index) => {
                            return <Box key={`video_${index}`}>{file.name} | {file.size.toFixed(3)} Mb</Box>
                        })
                    } */}
                </Grid>
                <Grid 
                    item
                    xs={4}
                    sx={{
                        mx: 2, 
                        p: 1,
                        border: "1px solid lightgrey",
                        borderRadius: "15px"
                    }}
                >
                    <List dense={true}>
                        {
                            compressedFiles.images?.map((file, index) => {
                                return <FileItem key={`image_${index}`} file={file} type={"compressed"} />
                            })
                        }
                    </List>
                    {/* {
                        compressedFiles.videos?.map((file, index) => {
                            return <Box key={`video_${index}`}>{file.name} | {file.size.toFixed(3)} Mb</Box>
                        })
                    } */}
                </Grid>
            </Grid>
            {/* {
                files.images.length === compressedFiles.images.length && files.images.length !== 0?
                <Box
                    sx={{
                        my: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <Button variant="outlined" onClick={() => setShowAreYouSure(true)} disabled={loading}>Replace compressed with original</Button>
                </Box>
                :
                <></>
            } */}
        </Box>
    );
}

export default App;
