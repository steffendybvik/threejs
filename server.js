import express from 'express';
import path from 'path';

const app = express();
const port = '3000';

app.use('/', express.static(path.join(__dirname, './public')))
app.use('/three/', express.static(path.join(__dirname, '/node_modules/three/')));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.listen(port, () => {
    console.log(`app listening on port ${port}`);
}); 