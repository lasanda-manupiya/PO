import app from './app.js';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Purchase Order backend listening on port ${PORT}`);
});
