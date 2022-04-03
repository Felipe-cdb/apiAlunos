const express = require('express');
require('dotenv').config()
const app = express();
app.use(express.json())
const conect = require('./model/conexao')
const jwt = require('jsonwebtoken');


// Listar todos os alunos da base de dados
app.get('/alunos', async (req, res) => {
    const resultado = await conect.query('select * from alunos');
    return res.json(resultado.rows)
});

// Pesquisar aluno de acordo com seu codigo/id
app.get('/alunos/:id', async (req, res) => {
    const num = req.params.id
    const resultado = await conect.query('select * from alunos where id=' + num );
    return res.json(resultado.rows) 
});

// Rota para login
app.post('/login',async (req, res) => {
    const resultEmail = await conect.query('select * from alunos where email=' + `'${req.body.email}'`);
    if(resultEmail.rows.length>0){
        const id = 1;
        let token = jwt.sign({id}, process.env.TOKEN_KEY, {expiresIn: 300})
        res.set("x-access-token", token);
        return res.json({auth: true, token: token});
    }else {
        return res.json({mensagem: 'Usuário não encontrado'});
    }
});

function verifyJWT (req, res, next) {
    let token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).json({auth: false, mensagem: 'Sem token de verificação'});
    }

    jwt.verify(token, process.env.TOKEN_KEY, function (error, decoded) {
        if (error) {
            return res.status(500).json({mensagem: 'Token inválido'});
        }
        next();
    });
}

// Cadastrar aluno
app.post('/cadastrar', verifyJWT , async (req, res) => {
    const { nome, curso, email, senha } = req.body;
    const resultEmail = await conect.query('select * from alunos where email=' + `'${req.body.email}'`);
    console.log(resultEmail)
    if(!resultEmail.rows.length>0){
        const resultado = await conect.query(`insert into alunos(nome,curso,email,senha) values('${nome}', '${curso}','${email}', '${senha}')`);
        return res.json(({mensagem: 'Usuário Cadastrado com sucesso!!!'}))
    }else {
        return res.json({mensagem: 'Email já Cadastrado'});
    }
});

// Editar aluno
app.put('/editar/:id', verifyJWT , async (req, res) => {
    const num = req.params.id
    const { nome, curso, email, senha } = req.body;
    const resultado = await conect.query(`update alunos set nome='${nome}', curso='${curso}', email='${email}', senha='${senha}' where id =${num};`);
    return res.json(({mensagem: 'Usuário Atualizado com sucesso!!!'}))
});

// Deletar aluno
app.delete('/deletar/:id', verifyJWT , async (req, res) => {
    const num = req.params.id
    const resultado = await conect.query(`delete from alunos where id =${num};`);
    return res.json(({mensagem: 'Usuário Deletado com sucesso!!!'}))
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor Rodando')
});