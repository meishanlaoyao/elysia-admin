<template>
    <view>
        <template v-if="props.total">
            <wd-loadmore :state="props.loading" />
        </template>
        <template v-else>
            <view class="empty-state">
                <image class="empty-icon" :src="GetCosImg('/uni/basic/empty-data.png')" mode="aspectFit" />
                <text class="empty-text">暂无数据</text>
            </view>
        </template>
    </view>
</template>

<script setup lang="ts">
type LoadmoreState = 'loading' | 'finished' | 'error'

const props = defineProps<{
    total: number,
    loading: LoadmoreState,
}>()
</script>

<style scoped lang='scss'>
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;

    .empty-icon {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 30rpx;
        opacity: 0.6;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
    }
}
</style>