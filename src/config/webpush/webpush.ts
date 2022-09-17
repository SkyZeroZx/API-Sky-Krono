import * as webpush from 'web-push';
import 'dotenv/config';

export default (): void => {
  webpush.setVapidDetails(
    process.env.EMAIL_WEB_PUSH,
    process.env.PUBLIC_KEY,
    process.env.PRIVATE_KEY,
  );
};
