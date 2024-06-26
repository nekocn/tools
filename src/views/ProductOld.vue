<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import InputNumberUnit from '../components/InputNumberUnit.vue';
import { paintList } from '../data/paint';
import { pcaList } from '../data/pca';
import { IronArtItem, materialList, pipeTypeList, plateList, pipeList } from '../data/material';
import { caculateCartonCost, caculateExpressPrice, caculateLogoPrice, getAreaList, getCityList, getRecomandExpress } from '../helper/calculator';

const showDetail = ref(false);

const form = reactive({
    product: "1",
    count: 1,
    x: 100,
    y: 30,
    z: 60,
    extX: 0,
    extY: 0,
    extZ: 0,
    plateType: "1",
    plateThick: 0.6,
    pipeType: "1",
    pipeSpec: "18",
    paint: "1",
    province: "35",
    city: "",
    area: "",
    carton: "half",
    logoType: "paint",
});

// 铁艺
const plateMaterial = computed(() => findMaterial(form.plateType, plateList));
const plateArea = computed(() => form.x * form.y / 1e4 + form.x * form.z / 1e4 * 2 + form.y * form.z / 1e4 * 2);

const pipeMaterial = computed(() => findMaterial(form.pipeType, pipeTypeList));
const squirePipeSpec = computed(() => pipeList.find((item) => item.id == form.pipeSpec)!);
const pipeLen = computed(() => (form.x + form.y + form.z) * 4 / 100);

const plateWeight = computed(() => plateArea.value * form.plateThick * plateMaterial.value.density);
const pipeWeight = computed(() => squirePipeSpec.value.thick * (squirePipeSpec.value.length - squirePipeSpec.value.thick) * pipeMaterial.value.density * pipeLen.value / 1000 * 4);
const totalWeight = computed(() => plateWeight.value + pipeWeight.value);

const ironArtCost = computed(() => plateWeight.value * plateMaterial.value.price + pipeWeight.value * pipeMaterial.value.price);

function findMaterial(type: string, list: IronArtItem[]) {
    const item = list.find(i => i.id == type)!;
    return materialList.find(i => i.id == item.material)!;
}

// 烤漆
const paintSelected = computed(() => paintList.find((v) => v.id == form.paint)!);
const paintCost = computed(() => paintSelected.value.price * totalWeight.value);


// 快递
const cityList = computed(() => getCityList(form.province));
const areaList = computed(() => getAreaList(form.province, form.city));

const showArea = computed(() => form.city != "");
const express = computed(() => caculateExpressPrice(form, form.province, form.city, form.area));
const recomand = computed(() => getRecomandExpress(express.value));

// 纸箱
const cartonCost = computed(() => caculateCartonCost(form));

// logo
const logoCost = computed(() => caculateLogoPrice(form.logoType, 1));

const totalCost = computed(() => ironArtCost.value + paintCost.value + recomand.value.price + cartonCost.value + logoCost.value);

</script>

<template>
    <el-form class="product-single" label-width="auto">
        <el-form-item label="定制尺寸">
            <InputNumberUnit v-model="form.x" placeholder="长" unit="CM" />
            <InputNumberUnit v-model="form.y" placeholder="宽" unit="CM" />
            <InputNumberUnit v-model="form.z" placeholder="高" unit="CM" />
        </el-form-item>
        <!-- 铁艺 -->
        <el-form-item label="板材类型">
            <el-radio-group v-model="form.plateType">
                <el-radio v-for="item in plateList" :value="item.id">{{ item.name }}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="板材厚度">
            <InputNumberUnit v-model="form.plateThick" placeholder="板厚" unit="MM">
            </InputNumberUnit>
        </el-form-item>
        <el-form-item label="管材类型">
            <el-radio-group v-model="form.pipeType">
                <el-radio v-for="item in pipeTypeList" :value="item.id">{{ item.name }}</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.pipeType == '1'" label="方管规格">
            <el-select v-model="form.pipeSpec" placeholder="请选择规格" style="max-width: 160px;">
                <el-option v-for="item in pipeList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
        </el-form-item>
        <!-- 烤漆 -->
        <el-form-item label="烤漆颜色">
            <el-radio-group v-model="form.paint">
                <el-radio v-for="item in paintList" :value="item.id">{{ item.name }}</el-radio>
            </el-radio-group>
        </el-form-item>
        <!-- Logo -->
        <el-form-item label="Logo">
            <el-radio-group v-model="form.logoType">
                <el-radio value="none">无</el-radio>
                <el-radio value="paint">喷漆</el-radio>
                <el-radio value="silk1">单色丝印</el-radio>
                <el-radio value="silk2">双色丝印</el-radio>
                <el-radio value="silk3">三色丝印</el-radio>
            </el-radio-group>
        </el-form-item>
        <!-- 快递 -->
        <el-form-item label="发货地址">
            <el-select v-model="form.province" placeholder="省份" style="max-width: 160px; margin-right: 10px;">
                <el-option v-for="c in pcaList" :label="c.name" :value="c.code"></el-option>
            </el-select>
            <el-select v-model="form.city" placeholder="请选择" style="max-width: 160px; margin-right: 10px;">
                <el-option v-for="c in cityList" :label="c.name" :value="c.code"></el-option>
            </el-select>
            <el-select v-model="form.area" v-show="showArea" placeholder="请选择"
                style="max-width: 160px; margin-right: 10px;">
                <el-option v-for="c in areaList" :label="c.name" :value="c.code"></el-option>
            </el-select>
        </el-form-item>
        <el-divider />
        <h3 @click="showDetail = !showDetail">建议报价: {{ Math.round(totalCost / 0.6) }}, 最低报价:
            {{ Math.round(totalCost / 0.6 * 0.8) }}, {{ recomand.price > 0 ? '推荐物流：' + recomand.name : '未找到合适的快递' }}
        </h3>
        <div v-show="showDetail">铁艺 ({{ ironArtCost.toFixed(2) }}) + 烤漆({{ paintCost.toFixed(2) }}) +
            快递({{ recomand.name }}: {{ recomand.price }}) + 纸箱({{ cartonCost.toFixed(2) }}) + Logo({{
                logoCost }}) =
            {{ totalCost.toFixed(2) }}</div>
    </el-form>
</template>

<style scoped></style>