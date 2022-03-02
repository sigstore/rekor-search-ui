
import { Divider, IconButton, InputBase, TextField } from '@mui/material';
import { useState } from 'react';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';

export interface FormProps {
  onSubmit: (email: string) => void,
}

export function RekorSearchForm({onSubmit}: FormProps) {
	const [email, setEmail] = useState('');

	return (
		<>
			<form onSubmit={e => {e.preventDefault(); onSubmit(email)}}>
				<TextField
						sx={{width: 300}}
						id="query"
						label="Email"
						size="small"
						variant="outlined"
						value={email}
						onChange={(event) => {setEmail(event.target.value)}}
				/>
			</form>
		</>
	);
}