<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import NikonLogo from "./assets/nikon.png"
import SonyLogo from "./assets/sony.png"
import FujifilmLogo from "./assets/fujifilm.png"
import AppleLogo from "./assets/apple.png"
import exifr from 'exifr'
import PingFangFont from "./assets/fonts/microsportbold-yz1zy.ttf"
import dayjs from "dayjs";
import fonts from "./config/fonts";
const canvasRef = ref<HTMLCanvasElement>()
let ctx:CanvasRenderingContext2D
const canvasConfig = reactive({
    width:3000,
    height:2330
})
const proportion = computed(()=>document.body.offsetWidth * (document.body.offsetWidth / document.body.offsetHeight > 1 ? 0.6 : 0.9) / canvasConfig.width)
// onMounted(()=>{
//     const proportion =  document.body.offsetWidth * 0.4 / canvasConfig.width;
//     (document.querySelector(".canvas canvas") as HTMLElement).style.transform = `scale(${proportion})`;
//     (document.querySelector(".canvas img") as HTMLElement).style.transform = `scale(${(document.querySelector(".canvas") as HTMLElement).offsetWidth / 3000 / 0.65})`;
// })
const logo = {
    nikon:NikonLogo,
    sony:SonyLogo,
    fujifilm:FujifilmLogo,
    apple:AppleLogo,
}
async function render(photo:HTMLImageElement){
    const font = new FontFace("PingFang",`url(${PingFangFont})`)
    document.fonts.add(await font.load())
    ctx = canvasRef.value?.getContext("2d")!
    const standardWidth = canvasConfig.width
    const logoStandardHeight = 140
    const imageHeight = canvasConfig.height - 330
    canvasRef.value.width = standardWidth
    canvasRef.value.height = canvasConfig.height
    const padding = 50
    ctx.fillStyle = "white"
    ctx.fillRect(0,0,canvasRef.value.width,canvasRef.value.height)
    ctx?.drawImage(photo,0,0,standardWidth,imageHeight)
    exifr.parse(photo).then(async output => {
        // 相机型号
        ctx.beginPath()
        ctx.textBaseline = "top"
        ctx.font = `bolder ${standardWidth * 0.02}px PingFangSC-Regular,PingFang,sans-serif`
        ctx.fillStyle = "black"
        ctx.fillText(`${output.Model}`, padding * 2, imageHeight + padding * 2)

        ctx.beginPath()
        ctx.textBaseline = "top"
        ctx.font = ` ${standardWidth * 0.015}px PingFang, sans-serif`
        ctx.fillStyle = "#625f5f"
        ctx.fillText(`${output.Make}`, padding * 2, imageHeight + padding * 2 + standardWidth * 0.03)
        // 相片参数
        const params = `${output.FocalLengthIn35mmFormat}mm f/${output.FNumber} ISO${output.ISO} ${output.ShutterSpeedValue > 0 ? '1/' + (Math.pow(2,output.ShutterSpeedValue) << 0):output.ExposureTime}s ${output.ExposureProgram.charAt(0)}`
        ctx.beginPath()
        ctx.textBaseline = "top"
        ctx.font = `bolder ${standardWidth * 0.02}px PingFang, sans-serif`
        ctx.fillStyle = "black"
        const textWidth = ctx.measureText(params).width
        ctx.fillText(
            params,
            standardWidth - textWidth - padding * 2,
            imageHeight + padding * 2
        )

        // logo
        await renderLogo(textWidth,output.Make)

        ctx.beginPath()
        ctx.textBaseline = "top"
        ctx.font = ` ${standardWidth * 0.015}px PingFang, sans-serif`
        ctx.fillStyle = "#625f5f"
        ctx.fillText(
            `${dayjs(output.DateTimeOriginal).format("YYYY/MM/DD hh:mm")}`,
            standardWidth - textWidth - padding * 2,
            imageHeight + padding * 2 + standardWidth * 0.03
        )
        ;(document.querySelector(".canvas img") as HTMLImageElement).src = canvasRef.value?.toDataURL("image/jpeg")

    })
    function getLogo(make:string){
        make = make.toLowerCase()
        if (make.includes("nikon")){
            return logo.nikon
        }else if (make.includes("sony")){
            return logo.sony
        }else if (make.includes("fujifilm")){
            return logo.fujifilm
        }else if (make.includes("apple")){
            return logo.apple
        }else{
            return logo.nikon
        }
    }
    function renderLogo(textWidth:number,make:string){
        const logoImage = new Image()
        logoImage.src = getLogo(make)

        return new Promise(resolve => {
            logoImage.onload = ()=>{
                const logoWidth = logoImage.width / logoImage.height * logoStandardHeight
                ctx?.drawImage(
                    logoImage,
                    standardWidth - textWidth - logoWidth - padding * 3,
                    imageHeight + padding * 2 - 12,
                    logoWidth,
                    logoStandardHeight
                )
                resolve("")
            }
        })
    }
}
const fileRef = ref<HTMLInputElement>()
function handleSelectImage(){
    fileRef.value?.click()
}
function onFileChange(event:InputEvent){
    const inputFile = event.target as HTMLInputElement
    const fileReader = new FileReader()
    fileReader.onload = (e)=>{
        const image = new Image()
        if (e.target?.result){
            image.src = e.target.result as string
            image.onload = ()=>{
                canvasConfig.height = Math.round(canvasConfig.width / image.width * image.height) + 330
                console.log(canvasConfig.width , image.width , image.height)
                render(image)
            }
        }
    }
    if (inputFile.files && inputFile.files[0]){
        fileReader.readAsDataURL(inputFile.files[0])
    }
}
</script>

<template>
    <div class="canvas">
        <canvas ref="canvasRef" :style="{transform: `scale(${proportion})`}"></canvas>
        <img src="" :style="{transform: `scale(${proportion})`}" alt="" @click="handleSelectImage">
    </div>
    <input ref="fileRef" @change="onFileChange" type="file" name="" id="" style="width: 0;height: 0;opacity: 0">
</template>

<style scoped lang="scss">
.btn-select-image{
    font-size: 24px;
}
.canvas{
    width: 60vw;
    height: 40vw;
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    canvas,img {
        position: absolute;
        width: calc(v-bind('canvasConfig.width') * 1px);
        height: calc(v-bind('canvasConfig.height') * 1px);
        will-change: transform;
        box-shadow: 0 0 15px rgba(0,0,0,.2);
        transform-origin: center center;
    }
    img{
        opacity: 0;
    }
}
</style>
