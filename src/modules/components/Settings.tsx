import {
	Box,
	Button,
	Divider,
	Drawer,
	TextField,
	Typography,
} from "@mui/material";
import { ChangeEventHandler, useCallback, useState } from "react";
import { useRekorBaseUrl } from "../api/context";

export function Settings({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const [baseUrl, setBaseUrl] = useRekorBaseUrl();
	const [localBaseUrl, setLocalBaseUrl] = useState(baseUrl);

	const handleChangeBaseUrl: ChangeEventHandler<
		HTMLTextAreaElement | HTMLInputElement
	> = useCallback(e => {
		if (e.target.value.length === 0) {
			setLocalBaseUrl(undefined);
		} else {
			setLocalBaseUrl(e.target.value);
		}
	}, []);

	const onSave = useCallback(() => {
		if (
			localBaseUrl === undefined &&
			process.env.NEXT_PUBLIC_REKOR_DEFAULT_DOMAIN
		) {
			setLocalBaseUrl(process.env.NEXT_PUBLIC_REKOR_DEFAULT_DOMAIN);
		}

		setBaseUrl(localBaseUrl);
		onClose();
	}, [localBaseUrl, setBaseUrl, onClose]);

	return (
		<Drawer
			anchor={"right"}
			open={open}
			onClose={onClose}
		>
			<Box sx={{ width: 320 }}>
				<Box sx={{ p: 2 }}>
					<Typography>Settings</Typography>
				</Box>
				<Divider />
				<Box sx={{ p: 2 }}>
					<Typography variant="overline">Override rekor endpoint</Typography>
					<TextField
						value={localBaseUrl ?? ""}
						placeholder={
							baseUrl === undefined ? "https://rekor.sigstore.dev" : baseUrl
						}
						onChange={handleChangeBaseUrl}
						fullWidth
					/>
				</Box>
				<Divider sx={{ mt: 2 }} />
				<Box sx={{ p: 2, display: "flex", gap: 2 }}>
					<Button
						onClick={onSave}
						variant="contained"
					>
						Save
					</Button>
					<Button onClick={onClose}>Cancel</Button>
				</Box>
			</Box>
		</Drawer>
	);
}
