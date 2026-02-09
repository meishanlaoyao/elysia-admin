import { SelectSystemLoginLog } from "database/schema/system_login_log";
import { CrudDto } from '@/types/dto';

export const ListDto = CrudDto.list(SelectSystemLoginLog);