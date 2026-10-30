import { loadEnv } from './config/env';
import { createApp } from './app';

const env = loadEnv();
const app = createApp({ env });

app.listen(env.PORT, () => {
  console.log(`Aaroh server listening on http://localhost:${env.PORT}`);
});
