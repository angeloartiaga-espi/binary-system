import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`ESPI-Binary System server running on http://localhost:${PORT}`);
});