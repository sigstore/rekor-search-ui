
import { Button, Divider, TextField, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useState } from 'react';

export interface FormProps {
  onSubmit: (query: {email: string, artifact: string}) => void,
}

export function RekorSearchForm({onSubmit}: FormProps) {
	const [email, setEmail] = useState('');
	const [artifact, setArtifact] = useState('');

	return (
		<form onSubmit={e => {e.preventDefault(); onSubmit({email, artifact})}}>
			<Paper
					sx={{
						p: 2,
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: 2
					}}
				>
				<TextField
						sx={{flexGrow: 1}}
						id="email"
						label="Email"
						size="small"
						variant="outlined"
						value={email}
						onChange={(event) => {setEmail(event.target.value)}}
				/>
				<Typography>or</Typography>
				<TextField
						sx={{flexGrow: 1}}
						id="artifact"
						label="Artifact"
						size="small"
						variant="outlined"
						value={artifact}
						onChange={(event) => {setArtifact(event.target.value)}}
				/>
				<Divider orientation="vertical" flexItem />
				<Button
						type="submit"
						variant="contained"
				>
					Search
				</Button>
			</Paper>
		</form>
	);
}