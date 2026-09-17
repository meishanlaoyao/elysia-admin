import type { IRouteModule } from '@/types/route';
import { ExecuteSqlDto } from './dto';
import { execute } from './handle';

const DevSqlModule: IRouteModule = {
    tags: 'SQL控制台',
    stages: ['development'],
    routes: [
        {
            url: '/dev/sql/execute',
            method: 'post',
            summary: '执行SQL',
            dto: ExecuteSqlDto,
            handle: execute,
            meta: { isAuth: true, isLog: true },
        },
    ],
};

export default DevSqlModule;