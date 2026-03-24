import { t } from 'elysia';
import { InsertSystemOperLog, SelectSystemOperLog } from "@database/schema/system_oper_log";
import { CrudDto } from '@/types/dto';

export const ListDto = CrudDto.list(SelectSystemOperLog);