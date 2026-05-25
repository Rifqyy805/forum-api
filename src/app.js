import 'dotenv/config';
import containerInstance from './Infrastructures/container.js';
import createServer from './Infrastructures/http/createServer.js';

const start = async () => {
  // Kita pastikan mengirim containerInstance ke createServer
  const app = await createServer(containerInstance);

  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
};

start();
