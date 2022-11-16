import Box from '@mui/material/Box';
import {
    DataGrid,
    GridColDef,
    GridRowId
} from '@mui/x-data-grid';
import {Fab} from "@mui/material";
import {Link} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Add, Delete, Edit} from '@mui/icons-material';

interface IPerson {
    _id: string;
    cpf: string;
    name: string;
    birthdate: Date;
}

const columns: GridColDef[] = [
    { field: 'cpf', headerName: 'CPF', flex: 1 },
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'birthdate', headerName: 'Data de nascimento', flex: 1 },
];

const fabStyle = {
    position: 'fixed',
    bottom: 80,
    right: 60
};

const fabStyle2 = {
    position: 'fixed',
    bottom: 160,
    right: 60
};

const ListPersonPage = () => {
    const [selected, setSelected] = useState<GridRowId[]>([]);
    const [people, setPeople] = useState<IPerson[]>([]);
    useEffect(() => {
        fetch('http://localhost:8080/api/person/list')
            .then(res => res.json())
            .then(data => setPeople(data));
    }, []);

    const handleDelete = async (_: any) => {
        const fetches = selected.map(id => fetch('http://localhost:8080/api/person/delete', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({_id: id})
        }));
        const results = await Promise.all(fetches);
        const deleted = results.filter(r => r.status === 200);
        const bodies = await Promise.all(deleted.map(r => r.json()));
        setPeople(people.filter(p => bodies.every(b => p._id !== b._id)));
    }

    return (
        <Box sx={{height: window.innerHeight}}>
            <DataGrid
                rows={people}
                getRowId={(p) => p._id}
                columns={columns}
                autoPageSize
                disableSelectionOnClick
                checkboxSelection
                experimentalFeatures={{ newEditingApi: true }}
                onSelectionModelChange={(sm, _) => {
                    setSelected(sm);
                }}
            />
            {selected.length === 0 &&
                <Fab color="primary" aria-label="add" sx={fabStyle}
                     component={Link} to={'/person/new'}>
                    <Add />
                </Fab>
            } {selected.length >= 1 &&
                <Fab color="error" aria-label="delete" sx={fabStyle} onClick={handleDelete}>
                    <Delete />
                </Fab>
            } {selected.length === 1 &&
                <Fab color="default" aria-label="edit" sx={fabStyle2}
                     component={Link} to={'/person/edit/' + selected.at(0)}>
                    <Edit />
                </Fab>
            }
        </Box>
    );
}

export default ListPersonPage;