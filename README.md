# 龟龟工具

“野路指南”路亚钓鱼指南网站源代码。

一个静态、手机优先的路亚选饵网站，包含条件推荐、拟饵图鉴、常见目标鱼、钓组速查，以及联网天气、潮位趋势和适钓建议。核心内容可离线缓存。

## 发布与使用

将本目录中的文件整体部署到任意支持静态文件的网站托管服务。若要使用离线缓存和安装到主屏幕，网站地址需要使用 HTTPS；首次联网打开后会缓存主要页面资源。也可直接打开 `index.html` 浏览，筛选和图鉴功能无需后端。

- iPhone / iPad：用 Safari 打开网站，选择“分享”→“添加到主屏幕”。
- Android：用 Chrome 打开网站，从菜单选择“安装应用”或“添加到主屏幕”。

## 文件

- `index.html`：页面结构和内容说明
- `style.css`：响应式样式
- `app.js`：推荐逻辑和鱼种、拟饵、钓组资料
- `china-cities.js`、`china-districts.js`：中国市和市辖区的地点选择名单
- `manifest.webmanifest`、`sw.js`、`icon.svg`：渐进式网页应用与离线支持

天气地点仅提供市和市辖区选择，不提供乡镇。点击天气栏的“定位”后，浏览器会请求位置权限，并用当前位置查询原天气服务；定位坐标不会写入本地缓存。

天气预报和海洋趋势由 Open-Meteo 提供，需要网络。潮位使用海洋模式趋势，近岸精度有限，并非验潮站数据，不可用于航行或安全决策。适钓分数是按天气、风浪、水域和常见鱼类习性生成的参考，不代表鱼获概率。拟饵实际泳层和操作方式请以产品说明及现场水情为准；出钓前遵守当地禁渔期、保护区和渔获规定。

## 高德钓点地图接入

地图 JS API 从高德在线加载，不将高德脚本下载或打包到项目中。`fishing-map.js` 内的 Web 端 Key 可公开，但 JsCode 安全密钥和 Web 服务 Key 只能保存在代理服务的密钥设置中：

- `AMAP_JS_CODE`：与 Web 端 JS API Key 同一行的安全密钥。
- `AMAP_WEB_SERVICE_KEY`：用于搜索地名、水库和河流的 Web 服务 Key。

网站继续使用 GitHub Pages 地址。`amap-proxy/worker.js` 是独立的 Cloudflare Worker，只提供 `/_AMapService/*` 代理接口，不托管网站。部署 Worker 后将其地址加上 `/_AMapService`，通过 `window.YeluAmapConfig.serviceHost` 在 `fishing-map.js` 加载前设置。`/_AMapService/health` 返回 `{"ready":true}` 时网页才加载高德地图。GitHub Pages 本身无法运行代理。代理未部署或不可用时，地图自动回退到旧底图。不要把两个服务端凭据写入仓库或 Worker 配置文件。
