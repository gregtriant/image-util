
import { useEffect, useState, forwardRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


export default function MyAlertMessage({ showSnack, setShowSnack, snackMessage, snackSeverity }) {

    useEffect(() => {

    }, [])

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setShowSnack(false);
    };
    
    return (
      
        <Snackbar open={showSnack} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Alert onClose={handleClose} severity={snackSeverity} sx={{ width: '100%' }}>
                {snackMessage}
            </Alert>
        </Snackbar>
      
    );
  }