import {
	Box,
	Button,
	Checkbox,
	Divider,
	Drawer,
	FormControlLabel,
	TextField,
	Typography,
} from "@mui/material";
import { ChangeEventHandler, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useRekorBaseUrl, useRekorV2API } from "../api/context";

export function Settings({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const [baseUrl, setBaseUrl] = useRekorBaseUrl();
	const [localBaseUrl, setLocalBaseUrl] = useState(baseUrl);

	useEffect(() => {
		setLocalBaseUrl(baseUrl);
	}, [baseUrl]);

	const [rekorV2API, setRekorV2API] = useRekorV2API();
	const [localRekorV2API, setLocalRekorV2API] = useState(rekorV2API);

	useEffect(() => {
		setLocalRekorV2API(rekorV2API);
	}, [rekorV2API]);

	const router = useRouter();

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
			process.env.NEXT_PUBLIC_REKOR_DEFAULT_DOMAIN &&
			!localRekorV2API
		) {
			setLocalBaseUrl(process.env.NEXT_PUBLIC_REKOR_DEFAULT_DOMAIN);
		}

		setBaseUrl(localBaseUrl);
		setRekorV2API(localRekorV2API);

		const newQuery = { ...router.query };
		if (localRekorV2API) {
			newQuery["rekorV2"] = "true";
		} else {
			delete newQuery["rekorV2"];
		}
		if (localBaseUrl) {
			newQuery["rekorUrl"] = localBaseUrl;
		} else {
			delete newQuery["rekorUrl"];
		}

		router.push(
			{
				pathname: router.pathname,
				query: newQuery,
			},
			undefined,
			{ shallow: true },
		);

		onClose();
	}, [
		localBaseUrl,
		localRekorV2API,
		setBaseUrl,
		setRekorV2API,
		onClose,
		router,
	]);

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
					<FormControlLabel
						control={
							<Checkbox
								checked={localRekorV2API}
								onChange={e => setLocalRekorV2API(e.target.checked)}
							/>
						}
						label="Rekor v2 API"
					/>
				</Box>
				<Divider />
				<Box sx={{ p: 2 }}>
					<Typography variant="overline">Override rekor endpoint</Typography>
					<TextField
						value={localBaseUrl ?? ""}
						placeholder={
							baseUrl === undefined
								? localRekorV2API
									? "e.g., https://log2025-1.rekor.sigstore.dev/api/v2"
									: "https://rekor.sigstore.dev"
								: baseUrl
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
