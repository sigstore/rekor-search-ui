
import { Button, TextField } from '@mui/material';
import { useState } from 'react';
import Paper from '@mui/material/Paper';

export interface FormProps {
  onSubmit: (email: string) => void,
}

export function RekorSearchForm({onSubmit}: FormProps) {
	const [email, setEmail] = useState('');

	return (
		<form onSubmit={e => {e.preventDefault(); onSubmit(email)}}>
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
						sx={{width: '40%'}}
						id="query"
						label="Email"
						size="small"
						variant="outlined"
						value={email}
						onChange={(event) => {setEmail(event.target.value)}}
				/>
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