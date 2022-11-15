import Box from "@mui/material/Box";
import {Alert, Fab, TextField} from "@mui/material";
import {Done, ArrowBack} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import moment from "moment";
import {Link, useParams} from "react-router-dom";

const fabStyle = {
    marginLeft: 2
};

const fabStyle2 = {
    marginLeft: 3
}

const txtFieldStyle = {
    marginRight: 2,
    width: 300
}

const alertStyle = {
    marginBottom: 2,
    marginRight: 1,
}

const AddEditPersonPage = () => {
    const params = useParams();
    const personId = params['id'];
    const [cpf, setCpf] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [birthdate, setBirthdate] = useState<string>('');
    const [formError, setFormError] = useState<boolean>(false);
    const [alertSuccess, setAlertSuccess] = useState<string>('');
    const [alertError, setAlertError] = useState<string>('');
    const cpfError = () => formError && cpf.length !== 11;
    const nameError = () => formError && name.length === 0;
    const birthdateError = () => formError && !moment(birthdate, 'DD/MM/YYYY', true).isValid();
    useEffect(() => {
        if (personId) {
            (async () => {
                const res = await fetch('http://localhost:8080/api/person/' + personId);
                const data = await res.json();
                if (res.status === 400) {
                    if (data['name'] === 'CastError' && data['kind'] === 'ObjectId') {
                        setAlertError('ID informado na URL não é válido.');
                    }
                    else if (data['name'] === 'DocumentNotFoundError') {
                        setAlertError('ID informado na URL não existe no sistema.')
                    }
                }
                else if (res.status === 200) {
                    setCpf(data.cpf);
                    setName(data.name);
                    const s1 = data.birthdate.split('T');
                    const s2 = s1[0].split('-');
                    setBirthdate(s2[2] + '/' + s2[1] + '/' + s2[0]);
                }
            })();
        }
    }, [personId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const momnt = moment(birthdate, 'DD/MM/YYYY', true);
        if (cpf.length !== 11
            || name.length === 0
            || !momnt.isValid()) {
            setFormError(true);
            return;
        }
        const bodyForPost: any = {
            'cpf': cpf,
            'name': name,
            'birthdate': momnt.toDate()
        }
        if (personId !== undefined) bodyForPost['_id'] = personId;
        const newOrUpdate = personId !== undefined ? 'update' : 'new';
        const res = await fetch('http://localhost:8080/api/person/' + newOrUpdate, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(bodyForPost)
        });
        if (res.status === 400) {
            const data = await res.json();
            if (data['cpf'] &&  data['cpf']['name'] === 'ValidatorError') {
                setAlertError('CPF inserido não é um valor válido segundo ' +
                    'as regras brasileiras.')
            }
            else if (data['code'] === 11000) {
                setAlertError('CPF inserido já está cadastrado no ' +
                    'sistema, cadastro duplicado não é permitido.');
            }
        }
        else if (res.status === 200) {
            setAlertSuccess('Operação realizada com sucesso.');
            setFormError(false);
            if (personId === undefined) {
                setCpf('');
                setName('');
                setBirthdate('');
            }
        }
    };

    return (
        <Box sx={{margin: 2}} component='form' autoComplete='off' onSubmit={e => handleSubmit(e)} >
            {alertError !== '' &&
                <Alert severity="error" sx={alertStyle} onClose={() => setAlertError('')}>
                    {alertError}
                </Alert>
            }
            {alertSuccess !== '' &&
                <Alert severity="success" sx={alertStyle} onClose={() => setAlertSuccess('')}>
                    {alertSuccess}
                </Alert>
            }
            <TextField
                id="outlined-basic" label="CPF" variant="outlined" sx={txtFieldStyle}
                disabled={personId !== undefined}
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                error={cpfError()}
                helperText={cpfError() && 'insira um valor com 11 dígitos, sem pontos ou hífens'}
            />
            <TextField
                id="outlined-basic" label="Nome" variant="outlined" sx={txtFieldStyle}
                value={name}
                onChange={e => setName(e.target.value)}
                error={nameError()}
                helperText={nameError() && 'insira o nome, campo não estar vazio'}
            />
            <TextField
                id="outlined-basic" label="Data de nascimento" variant="outlined" sx={txtFieldStyle}
                value={birthdate}
                onChange={e => setBirthdate(e.target.value)}
                error={birthdateError()}
                helperText={birthdateError() && 'insira uma data no formato exato dd/mm/aaaa'}
            />
            <Fab color="success" aria-label="OK" sx={fabStyle} type='submit'>
                <Done />
            </Fab>
            <Fab color="default" aria-label="Voltar" sx={fabStyle2}
                component={Link} to={'/person/list'}>
                <ArrowBack />
            </Fab>
        </Box>
    );
}

export default AddEditPersonPage;