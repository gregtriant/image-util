import { useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContentText,
	DialogActions,
	DialogContent,
	Button,
} from "@mui/material";

const AreYouSurePopup = ({
	open,
	title,
	content,
	actionText = "Delete",
	actionColor = "error",
	onDecline,
	onAccept,
}) => {
	useEffect(() => {
		// console.log("Component mounted!");
	}, []);

	return (
		<Dialog
			open={open}
			onClose={() => onDecline()}
		>
			<DialogTitle>
				{title}
			</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{content}
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button variant="text" onClick={() => onDecline()}>Cancel</Button>
				<Button variant="contained" color={actionColor} onClick={() => onAccept()}>{actionText}</Button>
			</DialogActions>
		</Dialog>
	);
};

export default AreYouSurePopup;
