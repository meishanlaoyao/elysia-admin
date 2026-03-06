import { Context } from 'elysia';
import { BaseResultData } from '@/core/result';
import { wxmpUserSchema } from 'database/schema/wxmp_user';
import {
    InsertOne,
    FindOneByKey,
    UpdateByKey,
    SoftDeleteByKeys,
    CreateQueryBuilder,
    FindPage,
} from '@/core/database/repository';

export async function findList(ctx: Context) {
    try {
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function findbBasic(ctx: Context) {
    try {
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function updateBasic(ctx: Context) {
    try {
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function update(ctx: Context) {
    try {
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};

export async function remove(ctx: Context) {
    try {
        return BaseResultData.ok();
    } catch (error) {
        return BaseResultData.fail(500, error);
    }
};