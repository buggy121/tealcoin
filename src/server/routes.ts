import * as Router from '@koa/router';
import * as serve from 'koa-static';

const router = new Router();

router.get('/', (ctx, next) => {
    serve(`${__dirname}/public`)(Object.assign(ctx, { path: 'index.html' }), next);
});
