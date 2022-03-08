
import { Button, Divider, Grid, TextField, Typography } from '@mui/material';
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
			<Paper sx={{p: 2}}>
				<Grid container spacing={2}>
					<Grid item xs md={6}>
						<TextField
								sx={{width: 1}}
								id="email"
								label="Email"
								size="small"
								variant="outlined"
								value={email}
								onChange={(event) => {setEmail(event.target.value)}}
						/>
					</Grid>
					<Grid item xs="auto">
						<Button
								type="submit"
								variant="contained"
						>
							Search
						</Button>					
					</Grid>
				</Grid>
			</Paper>
		</form>
	);
}