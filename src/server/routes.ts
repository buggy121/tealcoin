import * as Router from '@koa/router';
import * as serve from 'koa-static';
import { Blockchain } from './Blockchain';

const router = new Router();

router.get('/', (ctx, next) => {
    serve(`${__dirname}/public`)(Object.assign(ctx, { path: 'index.html' }), next);
});

router.get('/wallet/:address', (ctx) => {
    const tealCoin = new Blockchain();
    const response: WalletResponse = {
        balance: tealCoin.getBalanceOfAddress(ctx.params.address)
    };

    ctx.body = response;
});

export default router;

interface WalletResponse {
    balance: number
}
