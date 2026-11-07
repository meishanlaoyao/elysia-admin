import type { IRouteModule } from "@/types/route";
import { getVersionInfo } from './handle';
import { VersionDto } from './dto';

const SystemVersionModule: IRouteModule = {
    tags: '版本信息',
    routes: [
        { url: '/system/version', method: 'get', summary: '查询版本信息', dto: VersionDto, handle: getVersionInfo, meta: { isAuth: true } },
    ]
};

export default SystemVersionModule;