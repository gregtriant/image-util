/* eslint-disable @typescript-eslint/no-explicit-any */
import { Snackbar, IconButton } from '@mui/material';

function MySnackbar({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    severity = '',
    message = '',
    open = false,
    setOpen = (value) => {
        console.log(value);
    },
}) {
    const action = (
        <>
            <IconButton size="small" aria-label="close" color="inherit" onClick={() => setOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
            </IconButton>
        </>
    );

    const handleClose = (_event, reason) => {
        // console.log("close")
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose} message={message} action={action} />
        </>
    );
}

export default MySnackbar;
