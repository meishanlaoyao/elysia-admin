import { SelectSystemLoginLog } from "@/schema/system_login_log";
import { CrudDto } from '@/common/dto';

export const ListDto = CrudDto.list(
    SelectSystemLoginLog,
);