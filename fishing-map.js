/*!
 * 野路指南 · 钓点地图模块  fishing-map.js  v1.0.4
 * ---------------------------------------------------------------
 * 零依赖（不需要 Leaflet / 不需要 npm / 不需要 Key），单个文件即可运行。
 * 内置瓦片引擎 + 高德 GCJ-02 与 OSM WGS-84 双坐标系自动纠偏（国内地图最容易错的坑）。
 * 底图：中文标准（高德公共瓦片）/ OSM 标准 / 卫星影像（Esri）/ 地形水系（OpenTopoMap）
 * 功能：钓点筛选、聚合、搜索、详情、定位、添加我的钓点、导入导出、坐标复制。
 * 接入方式见《接入指南-GPT.md》。作者：为「野路指南」定制。
 */
(function () {
  'use strict';

  var VERSION = '1.0.4';
  var TILE = 256;
  var MAXLAT = 85.05112878;
  /* 用固定屏幕像素比例拖图，缩放等级不改变手感；低于 1 可减少过冲。 */
  var DRAG_SENSITIVITY = 0.75;

  /* =========================================================
     1. 坐标系：WGS-84 ⇄ GCJ-02（国内底图必备）
     ========================================================= */
  function outOfChina(lat, lng) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }
  function tLat(x, y) {
    var r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
    r += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
    return r;
  }
  function tLng(x, y) {
    var r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
    r += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
    return r;
  }
  var A_EARTH = 6378245.0, EE = 0.00669342162296594323;
  function wgs2gcj(lat, lng) {
    if (outOfChina(lat, lng)) return [lat, lng];
    var dLat = tLat(lng - 105, lat - 35);
    var dLng = tLng(lng - 105, lat - 35);
    var rad = lat / 180 * Math.PI;
    var magic = 1 - EE * Math.sin(rad) * Math.sin(rad);
    var sq = Math.sqrt(magic);
    dLat = (dLat * 180) / ((A_EARTH * (1 - EE)) / (magic * sq) * Math.PI);
    dLng = (dLng * 180) / (A_EARTH / sq * Math.cos(rad) * Math.PI);
    return [lat + dLat, lng + dLng];
  }
  /* GCJ-02 → WGS-84：按目标 GCJ 坐标的残差迭代逼近，避免高倍缩放时拖动抖跳。 */
  function gcj2wgs(lat, lng) {
    if (outOfChina(lat, lng)) return [lat, lng];
    var wlat = lat, wlng = lng;
    for (var i = 0; i < 3; i++) {
      var g = wgs2gcj(wlat, wlng);
      wlat -= (g[0] - lat);
      wlng -= (g[1] - lng);
    }
    return [wlat, wlng];
  }

  /* 墨卡托投影（256 瓦片） */
  function project(lat, lng, z) {
    var s = TILE * Math.pow(2, z);
    var sin = Math.sin(lat * Math.PI / 180);
    if (sin > 0.9999999) sin = 0.9999999;
    if (sin < -0.9999999) sin = -0.9999999;
    return [
      (lng + 180) / 360 * s,
      (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * s
    ];
  }
  function unproject(x, y, z) {
    var s = TILE * Math.pow(2, z);
    var lng = x / s * 360 - 180;
    var n = Math.PI - 2 * Math.PI * y / s;
    var lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return [lat, lng];
  }

  /* =========================================================
     2. 底图源
     ========================================================= */
  var BASEMAPS = [
    {
      id: 'amap', name: '中文标准', hint: '高德', crs: 'gcj02',
      url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      subs: ['1', '2', '3', '4'], min: 3, max: 18,
      attr: '底图 &copy; 高德地图（公共瓦片）'
    },
    {
      id: 'osm', name: 'OSM 标准', hint: '开源', crs: 'wgs84',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      min: 2, max: 19,
      attr: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> 贡献者'
    },
    {
      id: 'sat', name: '卫星影像', hint: '看结构', crs: 'wgs84',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      min: 2, max: 18,
      attr: '影像 &copy; Esri, Maxar, Earthstar Geographics'
    },
    {
      id: 'topo', name: '地形水系', hint: '等高线', crs: 'wgs84',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      subs: ['a', 'b', 'c'], min: 3, max: 17,
      attr: '&copy; <a href="https://opentopomap.org" target="_blank" rel="noreferrer">OpenTopoMap</a> (CC-BY-SA)'
    }
  ];

  /* =========================================================
     3. 水域类型 / 目标鱼（与站点 app.js 的鱼种名保持一致，便于联动选饵）
     ========================================================= */
  var TYPES = {
    lake: { label: '湖库野钓', short: '湖库', water: 'lake', color: '#4f7f4a' },
    river: { label: '河流野钓', short: '河流', water: 'river', color: '#6f9c52' },
    stream: { label: '溪流山涧', short: '溪流', water: 'stream', color: '#2c6b63' },
    pond: { label: '管理塘 / 黑坑', short: '管理塘', water: 'pond', color: '#df7647' },
    coast: { label: '海钓岸抛', short: '海钓', water: 'coast', color: '#2f5f7a' }
  };
  var TYPE_ORDER = ['lake', 'river', 'stream', 'pond', 'coast'];

  var FISH_NAMES = [
    '翘嘴鲌', '大口黑鲈（加州鲈）', '鳜鱼', '乌鳢（黑鱼）', '马口鱼', '宽鳍鱲（溪哥）',
    '红鳍原鲌（青梢）', '蒙古鲌', '赤眼鳟（红眼）', '鲶鱼', '黄颡鱼', '鳡鱼', '白条（䱗）',
    '罗非鱼', '月鳢（七星鱼）', '狗鱼', '白斑狗鱼（新疆）', '梭鲈（狗鱼鲈）', '河鲈',
    '虹鳟', '鳟鱼（褐鳟等）', '鲈鱼（海鲈）', '黑鲷', '石斑鱼', '鲹类（竹荚鱼等）',
    '鲣鱼', '马鲛（鲅鱼）', '带鱼', '黄鳍鲷', '鲻鱼', '鲷类（真鲷等）', '六线鱼（黄鱼）'
  ];

  /* =========================================================
     4. 内置示例钓点（示例数据：坐标为水域大致位置，请以实地为准）
     ========================================================= */
  var SEED = [
    {
      id: 'qiandao', name: '千岛湖 · 界首湖区', type: 'lake', region: '浙江 · 淳安',
      lat: 29.585, lng: 118.985, fish: ['翘嘴鲌', '鳜鱼', '鳡鱼'], demo: true,
      structure: '开阔库湾 + 岛尖落差，岸线多乱石与旧堤，深浅交界约 3–8 m。',
      access: '环湖公路可停车，部分点位需步行 10 分钟左右。',
      best: '日出前 1 小时至上午；起风后湾口更活跃。',
      note: '湖面风浪大时留意船只与救生；部分岸段为水源保护区禁止垂钓。'
    },
    {
      id: 'taihu', name: '太湖 · 东山湾', type: 'lake', region: '江苏 · 苏州',
      lat: 31.073, lng: 120.404, fish: ['翘嘴鲌', '红鳍原鲌（青梢）', '鳜鱼'], demo: true,
      structure: '浅滩芦苇带与围网遗迹混合，湾内有连续浅坎。',
      access: '沿湖公路多个观景台可停车，注意不要压占农道。',
      best: '傍晚至入夜，风向稳定的天气。',
      note: '春季有禁渔期，出发前确认当年公告。'
    },
    {
      id: 'danjiangkou', name: '丹江口水库 · 太极湖', type: 'lake', region: '湖北 · 十堰',
      lat: 32.545, lng: 111.512, fish: ['翘嘴鲌', '鳡鱼', '鲶鱼'], demo: true,
      structure: '大水面深库，岸线陡坎多，回水湾有饵鱼聚集。',
      access: '环库路况较好，库区部分区域管护严格。',
      best: '清晨与黄昏的表层追食窗口。',
      note: '属重要水源地，进入库区请遵守当地管理规定。'
    },
    {
      id: 'fuxian', name: '抚仙湖 · 孤山岸段', type: 'lake', region: '云南 · 澄江',
      lat: 24.452, lng: 102.878, fish: ['翘嘴鲌', '鲶鱼'], demo: true,
      structure: '水质极清、岸坡陡，能见度高，鱼警惕性强。',
      access: '环湖公路有停车场，入水口多为景区范围。',
      best: '清晨无风、光线柔和时。',
      note: '高原湖泊天气变化快，注意防晒与大风。'
    },
    {
      id: 'xingkai', name: '兴凯湖 · 小湖湾', type: 'lake', region: '黑龙江 · 密山',
      lat: 45.32, lng: 132.4, fish: ['狗鱼', '翘嘴鲌', '河鲈'], demo: true,
      structure: '大浅滩与芦苇荡，水下多沉木，适合长距离搜索。',
      access: '湖岗公路可到，部分湿地需换乘当地车辆。',
      best: '夏季清晨；水温起来后浅湾活跃。',
      note: '界湖区域有边境管理规定，勿越界下水。'
    },
    {
      id: 'anji', name: '西苕溪支流 · 安吉段', type: 'stream', region: '浙江 · 湖州',
      lat: 30.638, lng: 119.68, fish: ['马口鱼', '宽鳍鱲（溪哥）', '赤眼鳟（红眼）'], demo: true,
      structure: '山涧清流，卵石底、连续浅滩与深潭交替。',
      access: '县道旁临时停车，注意不要挡住村道。',
      best: '雨停后水色微浑的 1–2 天。',
      note: '溪流小型鱼多，尽量用单钩无倒刺，减少伤害。'
    },
    {
      id: 'duliu', name: '都柳江支流 · 榕江段', type: 'stream', region: '贵州 · 榕江',
      lat: 25.93, lng: 108.52, fish: ['马口鱼', '宽鳍鱲（溪哥）', '鲶鱼'], demo: true,
      structure: '峡谷溪流，落差段多，潭尾与石缝是重点。',
      access: '乡道可达，雨季山路需谨慎。',
      best: '水位稳定、雨后回清的时段。',
      note: '山区暴雨易突发涨水，注意上游天气。'
    },
    {
      id: 'zhujiajian', name: '朱家尖 · 东沙外沿', type: 'coast', region: '浙江 · 舟山',
      lat: 29.905, lng: 122.39, fish: ['鲈鱼（海鲈）', '鲹类（竹荚鱼等）', '黑鲷'], demo: true,
      structure: '沙滩与礁石交汇，外侧有暗礁带，潮流通道明显。',
      access: '景区停车场步行至岸边，涨潮时部分通道被淹。',
      best: '涨半潮至满潮，日出前与日落前。',
      note: '礁石区湿滑且涌浪大，务必穿救生衣、结伴。'
    },
    {
      id: 'shipu', name: '石浦港 · 外礁岸抛', type: 'coast', region: '浙江 · 宁波',
      lat: 29.203, lng: 121.946, fish: ['鲈鱼（海鲈）', '石斑鱼', '黑鲷'], demo: true,
      structure: '港外乱礁与堤头，水深落差大，流线贴礁。',
      access: '堤头可停车，航道内禁止垂钓。',
      best: '转流后 1 小时，夜钓亦有机会。',
      note: '注意航道船只与涌浪，禁止进入港区作业水域。'
    },
    {
      id: 'qingdao', name: '青岛 · 小麦岛礁区', type: 'coast', region: '山东 · 青岛',
      lat: 36.058, lng: 120.428, fish: ['黑鲷', '六线鱼（黄鱼）', '鲈鱼（海鲈）'], demo: true,
      structure: '矶岩岸线，潮间带礁盘，退潮露出大量结构。',
      access: '市区可达，步行 10–15 分钟。',
      best: '涨潮中段；大潮期结构更明显。',
      note: '礁石区注意滑倒与涨潮回撤路线。'
    },
    {
      id: 'dalian', name: '大连 · 付家庄礁石', type: 'coast', region: '辽宁 · 大连',
      lat: 38.857, lng: 121.648, fish: ['黑鲷', '六线鱼（黄鱼）', '鲈鱼（海鲈）'], demo: true,
      structure: '岸礁与砂底过渡，近岸有海藻床。',
      access: '景区周边停车，步行至礁石区。',
      best: '清晨与傍晚，风浪小于 1 m 时。',
      note: '北方海况多风，出钓前查看风浪预报。'
    },
    {
      id: 'wuyuanwan', name: '五缘湾 · 湾口', type: 'coast', region: '福建 · 厦门',
      lat: 24.535, lng: 118.183, fish: ['鲈鱼（海鲈）', '黄鳍鲷', '鲻鱼'], demo: true,
      structure: '湾内咸淡水交汇，桥墩、护岸与沙泥底混合。',
      access: '湾区步道可到，停车方便。',
      best: '涨潮中后段；湾口流水明显时更好。',
      note: '湾内游艇航道较多，抛投注意人身安全。'
    },
    {
      id: 'guanhu', name: '大鹏湾 · 官湖岸线', type: 'coast', region: '广东 · 深圳',
      lat: 22.596, lng: 114.52, fish: ['鲈鱼（海鲈）', '石斑鱼', '鲹类（竹荚鱼等）'], demo: true,
      structure: '沙岸与岩礁交替，水下有养殖设施遗存。',
      access: '村道停车后步行至岸线。',
      best: '夜间与清晨；西南风小浪时。',
      note: '部分岸段属保护区，确认可垂钓区域后再下竿。'
    },
    {
      id: 'zhapo', name: '海陵岛 · 闸坡防波堤', type: 'coast', region: '广东 · 阳江',
      lat: 21.583, lng: 111.83, fish: ['马鲛（鲅鱼）', '鲈鱼（海鲈）', '鲷类（真鲷等）'], demo: true,
      structure: '长堤外海侧，水深深、流急，堤根有抛石。',
      access: '堤头可停车，涨潮时堤面部分被淹。',
      best: '转流与夜间，风浪小于 1.2 m。',
      note: '堤面湿滑、涌浪越堤风险高，务必穿救生衣。'
    },
    {
      id: 'example-pond', name: '示例：城市周边管理塘', type: 'pond', region: '请替换为你常去的塘',
      lat: 30.3, lng: 120.15, fish: ['大口黑鲈（加州鲈）', '罗非鱼'], demo: true,
      structure: '（示例占位）塘型水域，岸边有增氧机与投饵区。',
      access: '（示例占位）填写收费、开塘时间与联系方式。',
      best: '（示例占位）开塘后 1 小时内、投饵点附近。',
      note: '这是一条示例数据：请点「标记」自己添加常去的管理塘，本示例可删除。'
    }
  ];

  /* =========================================================
     5. 小工具
     ========================================================= */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fmt(deg) { return (Math.round(deg * 1e6) / 1e6).toFixed(5); }
  function nowStr() {
    var d = new Date();
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  }
  function byId(id) { return document.getElementById(id); }

  /* =========================================================
     6. 地图主体
     ========================================================= */
  function FishingMap(el, options) {
    if (!el) throw new Error('FishingMap：找不到挂载容器');
    if (el.__fishingMap) return el.__fishingMap;

    var self = this;
    var o = options || {};
    this.el = el;
    this.opts = o;
    this.bmId = o.basemap || 'amap';
    this.zoom = Number(o.zoom) || 4;
    this.center = { lat: 34.6, lng: 108.9 };
    if (typeof o.center === 'string') {
      var c = String(o.center).split(',');
      if (c.length === 2 && isFinite(+c[0]) && isFinite(+c[1])) {
        this.center = { lat: +c[0], lng: +c[1] };
        if (!o.zoom) this.zoom = 6;
      }
    } else if (Array.isArray(o.center) && o.center.length === 2) {
      this.center = { lat: +o.center[0], lng: +o.center[1] };
      if (!o.zoom) this.zoom = 6;
    }
    this.filter = 'all';
    this.selectedId = null;
    this.mine = [];
    this.tileEls = new Map();
    this.marks = [];
    this.tileFails = 0;
    this.lastHintAt = 0;
    this.storageKey = o.storageKey || 'lureGuideSpots';
    this.viewKey = (o.storageKey || 'lureGuideSpots') + ':view';
    this._raf = 0;
    this._destroyed = false;

    this.spots = (Array.isArray(o.spots) && o.spots.length ? o.spots : SEED).map(normalize);
    this.readMine();
    this.build();
    this.bind();
    this.measure();
    this.renderChips();
    /* 挂在隐藏的标签页里时宽度为 0，等它显示出来再定视野 */
    if (this.vw < 200) this._deferred = true;
    else { this.restoreView(); this.renderMarks(true); }
    this.render();
    this.loadExternal();
    this.loadGeolocationOnStart();

    el.__fishingMap = this;
    this._ro = null;
    var onResize = function () {
      if (self._destroyed) return;
      self.measure();
      if (self._deferred && self.vw >= 200) {
        self._deferred = false;
        self.restoreView();
        self.renderMarks(true);
      }
      self.render();
    };
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(onResize);
      this._ro.observe(el);
    } else {
      window.addEventListener('resize', onResize);
    }
  }

  function normalize(s) {
    s = s || {};
    var lat = Number(s.lat != null ? s.lat : s.latitude);
    var lng = Number(s.lng != null ? s.lng : s.lon != null ? s.lon : s.longitude);
    return {
      id: String(s.id || ('s' + Math.random().toString(36).slice(2, 8))),
      name: String(s.name || '未命名钓点'),
      type: TYPES[s.type] ? s.type : 'lake',
      region: s.region || '',
      lat: lat, lng: lng,
      fish: Array.isArray(s.fish) ? s.fish.slice(0, 6) : (s.fish ? String(s.fish).split(/[,，/ ]+/) : []),
      structure: s.structure || s.spot || '',
      access: s.access || '',
      best: s.best || '',
      note: s.note || '',
      mine: !!s.mine, demo: !!s.demo, updated: s.updated || ''
    };
  }

  FishingMap.prototype = {

    /* ---------- 6.1 构建 DOM ---------- */
    build: function () {
      var el = this.el;
      el.classList.add('fm-root');
      el.innerHTML =
        '<div class="fm-bar">' +
          '<div class="fm-search">' +
            '<input class="fm-input" type="search" autocomplete="off" spellcheck="false" ' +
              'placeholder="搜索城市、湖库或钓点名" aria-label="搜索地点或钓点">' +
          '</div>' +
          '<button class="fm-btn ghost" data-act="locate" title="定位到我"><i>⌖</i><span class="lbl">定位</span></button>' +
          '<button class="fm-btn ghost" data-act="layers" title="切换底图"><i>▤</i><span class="lbl">底图</span></button>' +
          '<button class="fm-btn green" data-act="add" title="添加我的钓点"><i>＋</i><span class="lbl">标记</span></button>' +
        '</div>' +
        '<div class="fm-chips"></div>' +
        '<div class="fm-stage">' +
          '<div class="fm-tiles"></div>' +
          '<div class="fm-marks"></div>' +
          '<div class="fm-loading">正在载入底图…</div>' +
          '<div class="fm-zoom"><button data-act="zin" aria-label="放大">+</button>' +
            '<button data-act="zout" aria-label="缩小">−</button></div>' +
          '<div class="fm-scale"><i></i><b>—</b></div>' +
          '<div class="fm-coord"></div>' +
          '<div class="fm-attrib"></div>' +
          '<div class="fm-hint"></div>' +
        '</div>' +
        '<div class="fm-foot"><span><b class="cnt">0</b> 个钓点 · <span class="lv">z4</span> · <span class="src">示例数据</span></span>' +
          '<span>底图 <b class="bmname">—</b></span></div>' +
        '<div class="fm-panel" hidden></div>' +
        '<div class="fm-sheet"></div>' +
        '<div class="fm-toast"></div>' +
        '<div class="fm-modal"><div class="fm-form" role="dialog" aria-label="添加钓点">' +
          '<div class="fm-form-head"><h3>添加我的钓点</h3>' +
            '<button class="fm-btn ghost" data-act="closeForm" style="height:26px;padding:0 8px;font-size:10px">关闭</button></div>' +
          '<form class="fm-form-body" novalidate>' +
            '<div class="fm-coordline">坐标 <b class="f-coord">—</b><button type="button" class="fm-btn ghost" ' +
              'data-act="pickAgain" style="height:24px;padding:0 7px;font-size:10px;margin-left:auto">重新点选</button></div>' +
            '<label><span>钓点名称 *</span><input name="name" maxlength="40" placeholder="例如：老桥墩 / 三号塘东岸"></label>' +
            '<div class="fm-form-grid">' +
              '<label><span>水域类型</span><select name="type">' +
                TYPE_ORDER.map(function (k) { return '<option value="' + k + '">' + TYPES[k].label + '</option>'; }).join('') +
              '</select></label>' +
              '<label><span>主目标鱼</span><select name="fish"><option value="">暂不填写</option>' +
                FISH_NAMES.map(function (f) { return '<option>' + esc(f) + '</option>'; }).join('') +
              '</select></label>' +
            '</div>' +
            '<label><span>结构 / 水深</span><input name="structure" maxlength="80" placeholder="例如：桥墩背流面，深浅交界 2–4 m"></label>' +
            '<label><span>最佳时段</span><input name="best" maxlength="60" placeholder="例如：涨半潮、清晨 6–8 点"></label>' +
            '<label><span>交通 / 注意</span><input name="access" maxlength="80" placeholder="例如：堤头可停车，涨潮勿上堤"></label>' +
            '<label><span>备注</span><textarea name="note" maxlength="200" placeholder="饵型、渔获、收费、联系方式…"></textarea></label>' +
            '<div class="fm-form-foot" style="padding:11px 0 0;border:0">' +
              '<button type="submit" class="fm-btn green" style="height:38px;justify-content:center">保存到我的钓点</button>' +
              '<button type="button" class="fm-btn ghost" data-act="closeForm" style="height:38px;justify-content:center">取消</button>' +
            '</div>' +
          '</form>' +
        '</div></div>';

      this.stage = el.querySelector('.fm-stage');
      this.tilesEl = el.querySelector('.fm-tiles');
      this.marksEl = el.querySelector('.fm-marks');
      this.loadingEl = el.querySelector('.fm-loading');
      this.coordEl = el.querySelector('.fm-coord');
      this.scaleEl = el.querySelector('.fm-scale');
      this.attribEl = el.querySelector('.fm-attrib');
      this.hintEl = el.querySelector('.fm-hint');
      this.chipsEl = el.querySelector('.fm-chips');
      this.panelEl = el.querySelector('.fm-panel');
      this.sheetEl = el.querySelector('.fm-sheet');
      this.toastEl = el.querySelector('.fm-toast');
      this.modalEl = el.querySelector('.fm-modal');
      this.formEl = el.querySelector('form.fm-form-body');
      this.formBox = el.querySelector('.fm-form');
      this.inputEl = el.querySelector('.fm-input');
      this.listEl = null;
      this.pointers = new Map();
      this.drag = null;
      this.pinch = null;
      this.anim = null;
    },

    /* ---------- 6.2 尺寸 ---------- */
    measure: function () {
      var r = this.stage.getBoundingClientRect();
      this.vw = Math.max(120, Math.round(r.width));
      this.vh = Math.max(120, Math.round(r.height));
    },

    /* ---------- 6.3 底图 / 坐标系 ---------- */
    bm: function () {
      for (var i = 0; i < BASEMAPS.length; i++) if (BASEMAPS[i].id === this.bmId) return BASEMAPS[i];
      return BASEMAPS[0];
    },
    disp: function (lat, lng) {
      return this.bm().crs === 'gcj02' ? wgs2gcj(lat, lng) : [lat, lng];
    },
    undisp: function (lat, lng) {
      return this.bm().crs === 'gcj02' ? gcj2wgs(lat, lng) : [lat, lng];
    },
    minZoom: function () { return this.bm().min || 3; },
    maxZoom: function () { return this.bm().max || 18; },

    /* ---------- 6.4 视图控制 ---------- */
    setView: function (lat, lng, zoom, animate) {
      var z = clamp(zoom == null ? this.zoom : zoom, this.minZoom(), this.maxZoom());
      var la = clamp(lat, -MAXLAT, MAXLAT);
      if (!animate) { this.center = { lat: la, lng: lng }; this.zoom = z; this.render(); return; }
      this.flyTo(la, lng, z);
    },
    flyTo: function (lat, lng, zoom, ms) {
      var self = this;
      this.cancelAnim();
      var from = { lat: this.center.lat, lng: this.center.lng, z: this.zoom };
      var to = { lat: clamp(lat, -MAXLAT, MAXLAT), lng: lng, z: clamp(zoom, this.minZoom(), this.maxZoom()) };
      var d = ms || 420, t0 = performance.now();
      this._lockTileZ = true;
      function step(t) {
        var k = clamp((t - t0) / d, 0, 1);
        var e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        self.center = { lat: from.lat + (to.lat - from.lat) * e, lng: from.lng + (to.lng - from.lng) * e };
        self.zoom = from.z + (to.z - from.z) * e;
        self.render();
        if (k < 1) self._raf = requestAnimationFrame(step);
        else {
          self._raf = 0;
          self._lockTileZ = false;
          self.render();
          self.saveView();
        }
      }
      this._raf = requestAnimationFrame(step);
    },
    cancelAnim: function () {
      if (this._raf) {
        cancelAnimationFrame(this._raf);
        this._raf = 0;
        this._lockTileZ = false;
        this.render();
      }
    },
    zoomBy: function (delta, anchor) {
      var z = clamp(this.zoom + delta, this.minZoom(), this.maxZoom());
      if (z === this.zoom) return;
      if (anchor) this.setViewAnchored(anchor.lat, anchor.lng, anchor.x, anchor.y, z);
      else this.setView(this.center.lat, this.center.lng, z, false);
    },
    /* 让某个经纬度始终停在屏幕的 (sx,sy) 位置，同时改变缩放 */
    setViewAnchored: function (lat, lng, sx, sy, zoom) {
      var z = clamp(zoom, this.minZoom(), this.maxZoom());
      var d = this.disp(lat, lng);
      var w = project(d[0], d[1], z);
      var cx = w[0] - (sx - this.vw / 2);
      var cy = w[1] - (sy - this.vh / 2);
      var u = unproject(cx, cy, z);
      var c = this.undisp(u[0], u[1]);
      this.center = { lat: clamp(c[0], -MAXLAT, MAXLAT), lng: c[1] };
      this.zoom = z;
      this.render();
    },
    panBy: function (dx, dy) {
      /* dx / dy 是视口 CSS 像素；投影直接使用当前缩放级别，保持各级别一致。 */
      var d = this.disp(this.center.lat, this.center.lng);
      var w = project(d[0], d[1], this.zoom);
      var u = unproject(w[0] - dx, w[1] - dy, this.zoom);
      var c = this.undisp(u[0], u[1]);
      this.center = { lat: clamp(c[0], -MAXLAT, MAXLAT), lng: c[1] };
      this.render();
    },
    screenToLatLng: function (sx, sy) {
      var d = this.disp(this.center.lat, this.center.lng);
      var w = project(d[0], d[1], this.zoom);
      var u = unproject(w[0] + (sx - this.vw / 2), w[1] + (sy - this.vh / 2), this.zoom);
      var c = this.undisp(u[0], u[1]);
      return { lat: c[0], lng: c[1] };
    },
    fitSpots: function (list) {
      var self = this;
      var arr = (list || this.visibleSpots());
      if (!arr.length) return;
      if (arr.length === 1) { this.flyTo(arr[0].lat, arr[0].lng, 13); return; }
      var minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      arr.forEach(function (s) {
        var d = self.disp(s.lat, s.lng);
        minLat = Math.min(minLat, d[0]); maxLat = Math.max(maxLat, d[0]);
        minLng = Math.min(minLng, d[1]); maxLng = Math.max(maxLng, d[1]);
      });
      var z = this.maxZoom();
      for (; z > this.minZoom(); z--) {
        var p1 = project(maxLat, minLng, z), p2 = project(minLat, maxLng, z);
        if (Math.abs(p2[0] - p1[0]) <= this.vw - 90 && Math.abs(p2[1] - p1[1]) <= this.vh - 90) break;
      }
      this.setView((minLat + maxLat) / 2, (minLng + maxLng) / 2, z, false);
    },

    /* ---------- 6.5 渲染 ---------- */
    render: function () {
      if (this._destroyed) return;
      this.renderTiles();
      this.renderMarks();
      this.positionMarks();
      this.updateScale();
      this.updateFoot();
    },

    renderTiles: function () {
      var bm = this.bm();
      /* 视角飞行过程中锁定瓦片层级，只用 CSS 缩放，避免每帧请求一屏新瓦片 */
      var z = this._lockTileZ && this.tileZ ? this.tileZ
        : clamp(Math.round(this.zoom), this.minZoom(), this.maxZoom());
      this.tileZ = z;
      var d = this.disp(this.center.lat, this.center.lng);
      var w = project(d[0], d[1], z);
      var s = Math.pow(2, this.zoom - z);
      var halfW = this.vw / (2 * s), halfH = this.vh / (2 * s);
      var x0 = Math.floor((w[0] - halfW) / TILE) - 1, x1 = Math.floor((w[0] + halfW) / TILE) + 1;
      var y0 = Math.floor((w[1] - halfH) / TILE) - 1, y1 = Math.floor((w[1] + halfH) / TILE) + 1;
      var n = Math.pow(2, z);
      var need = Object.create(null), self = this, i, j, k;

      for (i = x0; i <= x1; i++) {
        if (i < 0 || i >= n) continue;
        for (j = y0; j <= y1; j++) {
          if (j < 0 || j >= n) continue;
          need[z + '/' + i + '/' + j] = [i, j];
        }
      }
      /* 移除多余 */
      this.tileEls.forEach(function (el, key) { if (!need[key]) { el.remove(); self.tileEls.delete(key); } });
      /* 补齐缺失 */
      Object.keys(need).forEach(function (key) {
        if (self.tileEls.has(key)) return;
        var ij = need[key];
        var img = document.createElement('img');
        img.className = 'fm-tile';
        img.alt = '';
        img.draggable = false;
        img.decoding = 'async';
        img.style.left = (ij[0] * TILE) + 'px';
        img.style.top = (ij[1] * TILE) + 'px';
        img.onload = function () {
          img.classList.add('ready');
          if (img.parentNode === self.tilesEl) self.loadingEl.classList.add('off');
        };
        img.onerror = function () {
          self.tileFails++;
          if (self.tileFails === 6) self.hint('底图瓦片加载异常：可能是网络受限，试试切换「底图」到 OSM 或卫星影像', 5200);
        };
        img.src = tileUrl(bm, ij[0], ij[1], z);
        self.tilesEl.appendChild(img);
        self.tileEls.set(key, img);
      });
      this.tilesEl.style.transform =
        'translate(' + (this.vw / 2 - w[0] * s).toFixed(2) + 'px,' +
        (this.vh / 2 - w[1] * s).toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
      this.tileScale = s;
      this.attribEl.innerHTML = bm.attr;
    },

    /* 可见钓点 */
    visibleSpots: function () {
      var f = this.filter;
      return this.spots.filter(function (s) {
        if (!isFinite(s.lat) || !isFinite(s.lng)) return false;
        if (f === 'all') return true;
        if (f === 'mine') return s.mine;
        return s.type === f;
      });
    },

    /* 生成标记（缩放/筛选变化时重建） */
    renderMarks: function (force) {
      var list = this.visibleSpots();
      var key = Math.round(this.zoom * 2) + '|' + this.filter + '|' + list.length + '|' +
        this.marksVer + '|' + this.selectedId;
      if (!force && this._markKey === key) return;
      this._markKey = key;
      this.marksEl.innerHTML = '';
      this.marks = [];
      var zoom = this.zoom, clusters = zoom < 9, buckets = {};
      var self = this;

      function screenOf(s) {
        var d = self.disp(s.lat, s.lng);
        var w = project(d[0], d[1], self.zoom);
        var c = self.disp(self.center.lat, self.center.lng);
        var cw = project(c[0], c[1], self.zoom);
        return { x: w[0] - cw[0] + self.vw / 2, y: w[1] - cw[1] + self.vh / 2 };
      }

      if (clusters) {
        list.forEach(function (s) {
          var p = screenOf(s);
          /* 选中的钓点始终单独显示，避免被聚合气泡吞掉 */
          if (s.id === self.selectedId) { addPin(s, p); return; }
          var k = Math.floor(p.x / 76) + ':' + Math.floor(p.y / 76);
          (buckets[k] = buckets[k] || []).push({ s: s, p: p });
        });
        Object.keys(buckets).forEach(function (k) {
          var g = buckets[k];
          if (g.length > 1) {
            var mx = 0, my = 0, lat = 0, lng = 0;
            g.forEach(function (it) { mx += it.p.x; my += it.p.y; lat += it.s.lat; lng += it.s.lng; });
            var n = g.length;
            var el = document.createElement('button');
            el.type = 'button';
            el.className = 'fm-cluster';
            el.textContent = String(n);
            el.title = '放大查看 ' + n + ' 个钓点';
            el.addEventListener('click', function () {
              self.flyTo(lat / n, lng / n, Math.min(self.zoom + 2, 13));
            });
            self.marksEl.appendChild(el);
            self.marks.push({ el: el, x: mx / n, y: my / n, cluster: true });
          } else {
            addPin(g[0].s, g[0].p);
          }
        });
      } else {
        list.forEach(function (s) { addPin(s, screenOf(s)); });
      }

      function addPin(s, p) {
        var t = TYPES[s.type] || TYPES.lake;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'fm-pin' + (s.mine ? ' mine' : '') + (s.id === self.selectedId ? ' active' : '');
        b.dataset.id = s.id;
        b.setAttribute('aria-label', s.name);
        b.style.setProperty('--c', t.color);
        b.innerHTML = '<span class="fm-pin-body"></span><span class="fm-pin-dot"></span>' +
          '<span class="fm-pin-label">' + esc(s.name) + '</span>';
        self.marksEl.appendChild(b);
        self.marks.push({ el: b, lat: s.lat, lng: s.lng, id: s.id, x: p.x, y: p.y });
      }
      this.el.classList.toggle('labels', this.zoom >= 10);
    },

    /* 只更新标记位置（拖动/缩放时高频调用） */
    positionMarks: function () {
      var self = this;
      var c = this.disp(this.center.lat, this.center.lng);
      var cw = project(c[0], c[1], this.zoom);
      this.marks.forEach(function (m) {
        var x, y;
        if (m.cluster) { x = m.x; y = m.y; }
        else {
          var d = self.disp(m.lat, m.lng);
          var w = project(d[0], d[1], self.zoom);
          x = w[0] - cw[0] + self.vw / 2;
          y = w[1] - cw[1] + self.vh / 2;
        }
        if (x < -160 || x > self.vw + 160 || y < -160 || y > self.vh + 160) {
          m.el.style.display = 'none';
        } else {
          m.el.style.display = '';
          m.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)' +
            (m.cluster ? ' translate(-50%,-50%)' : '');
        }
      });
      this.el.classList.toggle('labels', this.zoom >= 10);
      /* 我的位置标记跟随 */
      if (this._me && isFinite(this._meLat)) {
        var md = this.disp(this._meLat, this._meLng);
        var mw = project(md[0], md[1], this.zoom);
        this._me.style.transform = 'translate3d(' + (mw[0] - cw[0] + this.vw / 2).toFixed(1) +
          'px,' + (mw[1] - cw[1] + this.vh / 2).toFixed(1) + 'px,0) translate(-50%,-50%)';
      }
    },

    updateScale: function () {
      var lat = this.center.lat;
      var mpp = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, this.zoom);
      var steps = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000,
        100000, 200000, 500000, 1000000, 2000000];
      var pick = steps[0];
      for (var i = 0; i < steps.length; i++) if (steps[i] / mpp <= 110) pick = steps[i];
      var px = Math.max(24, Math.round(pick / mpp));
      this.scaleEl.querySelector('i').style.width = px + 'px';
      this.scaleEl.querySelector('b').textContent =
        pick >= 1000 ? (pick / 1000) + ' km' : pick + ' m';
    },

    updateFoot: function () {
      var n = this.visibleSpots().length;
      this.el.querySelector('.fm-foot .cnt').textContent = n;
      this.el.querySelector('.fm-foot .lv').textContent = 'z' + this.zoom.toFixed(1);
      this.el.querySelector('.fm-foot .bmname').textContent = this.bm().name;
      var src = this.el.querySelector('.fm-foot .src');
      if (src) src.textContent = this.hasDemo() ? '示例数据 · 请核对' : '我的数据';
    },

    hasDemo: function () {
      return this.spots.some(function (s) { return s.demo; });
    },

    /* ---------- 6.6 筛选 chips ---------- */
    renderChips: function () {
      var self = this, counts = { all: this.spots.length, mine: 0 };
      this.spots.forEach(function (s) {
        counts[s.type] = (counts[s.type] || 0) + 1;
        if (s.mine) counts.mine++;
      });
      var html = '<button class="fm-chip' + (this.filter === 'all' ? ' on' : '') +
        '" data-filter="all">全部 <b>' + counts.all + '</b></button>';
      TYPE_ORDER.forEach(function (k) {
        html += '<button class="fm-chip' + (self.filter === k ? ' on' : '') + '" data-filter="' + k + '">' +
          '<span class="dot" style="--c:' + TYPES[k].color + '"></span>' + TYPES[k].short +
          ' <b>' + (counts[k] || 0) + '</b></button>';
      });
      html += '<button class="fm-chip' + (this.filter === 'mine' ? ' on' : '') +
        '" data-filter="mine">我的钓点 <b>' + counts.mine + '</b></button>';
      this.chipsEl.innerHTML = html;
    },

    setFilter: function (f) {
      this.filter = f;
      this.renderChips();
      this.marksVer = (this.marksVer || 0) + 1;
      this.renderMarks(true);
      this.positionMarks();
      var list = this.visibleSpots();
      if (!list.length) {
        this.toast(f === 'mine' ? '「我的钓点」还是空的，点「＋ 标记」在地图上添加' : '这个分类下还没有钓点');
        return;
      }
      /* 当前视野里一个都看不到时，才自动把视野移到这些钓点 */
      if (!this.anyVisible(list)) {
        if (list.length === 1) this.flyTo(list[0].lat, list[0].lng, 13);
        else this.fitSpots(list);
      }
    },

    anyVisible: function (list) {
      var c = this.disp(this.center.lat, this.center.lng);
      var cw = project(c[0], c[1], this.zoom);
      for (var i = 0; i < list.length; i++) {
        var d = this.disp(list[i].lat, list[i].lng);
        var w = project(d[0], d[1], this.zoom);
        var x = w[0] - cw[0] + this.vw / 2, y = w[1] - cw[1] + this.vh / 2;
        if (x > 24 && x < this.vw - 24 && y > 24 && y < this.vh - 24) return true;
      }
      return false;
    },

    /* ---------- 6.7 交互 ---------- */
    bind: function () {
      var self = this, el = this.el;

      el.addEventListener('click', function (e) {
        var actEl = e.target.closest('[data-act]');
        var chip = e.target.closest('.fm-chip');
        var layer = e.target.closest('.fm-layer');
        var pin = e.target.closest('.fm-pin');

        if (chip) { self.setFilter(chip.dataset.filter); return; }
        if (layer) { self.setBasemap(layer.dataset.bm); return; }
        if (pin) { if (self._lastDragMoved < 6) self.selectSpot(pin.dataset.id); return; }
        if (!actEl) {
          if (self.picking) self.applyPick(e);
          return;
        }
        var act = actEl.dataset.act;
        if (act === 'zin') self.zoomBy(1);
        else if (act === 'zout') self.zoomBy(-1);
        else if (act === 'locate') self.locate();
        else if (act === 'layers') self.togglePanel();
        else if (act === 'add') self.startPick();
        else if (act === 'closeSheet') self.closeSheet();
        else if (act === 'closeForm') self.closeForm();
        else if (act === 'pickAgain') { self.closeForm(); self.startPick(); }
        else if (act === 'spotWeather') self.spotWeather();
        else if (act === 'spotLure') self.spotLure();
        else if (act === 'delSpot') self.deleteSpot();
        else if (act === 'copyCoord') { e.preventDefault(); self.copyCoord(); }
        else if (act === 'fitAll') { self.fitSpots(self.spots); self.closePanel(); }
        else if (act === 'export') self.exportMine();
        else if (act === 'import') { self.fileInput && self.fileInput.click(); }
      });

      /* 搜索 */
      this.inputEl.addEventListener('input', function () { self.search(this.value); });
      this.inputEl.addEventListener('focus', function () { if (this.value.trim()) self.search(this.value); });
      this.inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (self.listEl) {
            var first = self.listEl.querySelector('.fm-list-item');
            if (first) first.click();
          }
        } else if (e.key === 'Escape') self.closeList();
      });
      document.addEventListener('click', function (e) {
        if (!self.el.contains(e.target)) self.closeList();
      });

      /* 表单 */
      this.formEl.addEventListener('submit', function (e) { e.preventDefault(); self.saveSpot(); });

      /* 指针：拖动 / 双指 / 点击 */
      var st = this.stage;
      st.addEventListener('pointerdown', function (e) { self.onDown(e); });
      st.addEventListener('pointermove', function (e) { self.onMove(e); });
      st.addEventListener('pointerup', function (e) { self.onUp(e); });
      st.addEventListener('pointercancel', function (e) { self.onUp(e, true); });
      st.addEventListener('lostpointercapture', function (e) { self.onUp(e, true); });
      st.addEventListener('wheel', function (e) {
        e.preventDefault();
        var r = st.getBoundingClientRect();
        var p = { x: e.clientX - r.left, y: e.clientY - r.top };
        var ll = self.screenToLatLng(p.x, p.y);
        self.cancelAnim();
        var stepZ = self.zoom >= 10 ? 0.25 : 0.5;
        self.zoomBy(e.deltaY < 0 ? stepZ : -stepZ, { lat: ll.lat, lng: ll.lng, x: p.x, y: p.y });
      }, { passive: false });
      st.addEventListener('dblclick', function (e) {
        var r = st.getBoundingClientRect();
        var p = { x: e.clientX - r.left, y: e.clientY - r.top };
        var ll = self.screenToLatLng(p.x, p.y);
        self.zoomBy(1, { lat: ll.lat, lng: ll.lng, x: p.x, y: p.y });
      });
      st.addEventListener('contextmenu', function (e) {
        if (self.picking) e.preventDefault();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { self.closeSheet(); self.closePanel(); self.closeList(); self.cancelPick(); }
      });
    },

    onDown: function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      this.cancelAnim();
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.pointers.size === 1) {
        this.drag = {
          id: e.pointerId, x0: e.clientX, y0: e.clientY,
          x: e.clientX, y: e.clientY, moved: 0, t: performance.now(),
          vx: 0, vy: 0, samples: []
        };
        this.stage.classList.add('dragging');
        try { this.stage.setPointerCapture(e.pointerId); } catch (err) {}
      } else if (this.pointers.size === 2) {
        var r = this.stage.getBoundingClientRect();
        var pts = Array.from(this.pointers.values());
        var mid = { x: (pts[0].x + pts[1].x) / 2 - r.left, y: (pts[0].y + pts[1].y) / 2 - r.top };
        var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        var anchor = this.screenToLatLng(mid.x, mid.y);
        this.pinch = { d0: Math.max(24, d), z0: this.zoom, anchor: anchor };
        this.drag = null;
      }
    },

    onMove: function (e) {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      var r = this.stage.getBoundingClientRect();
      this.coordEl.textContent = '';

      if (this.pinch && this.pointers.size >= 2) {
        var pts = Array.from(this.pointers.values());
        var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        var mid = { x: (pts[0].x + pts[1].x) / 2 - r.left, y: (pts[0].y + pts[1].y) / 2 - r.top };
        var z = clamp(this.pinch.z0 + Math.log(Math.max(24, d) / this.pinch.d0) / Math.LN2,
          this.minZoom(), this.maxZoom());
        this.setViewAnchored(this.pinch.anchor.lat, this.pinch.anchor.lng, mid.x, mid.y, z);
        this.renderMarks();
        return;
      }
      if (!this.drag || this.drag.id !== e.pointerId) {
        /* 鼠标悬停显示坐标 */
        var ll = this.screenToLatLng(e.clientX - r.left, e.clientY - r.top);
        this.coordEl.textContent = fmt(ll.lat) + ' , ' + fmt(ll.lng);
        return;
      }
      var dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      this.drag.moved += Math.abs(dx) + Math.abs(dy);
      this.drag.x = e.clientX; this.drag.y = e.clientY;
      this.drag.samples.push({ t: performance.now(), x: e.clientX, y: e.clientY });
      if (this.drag.samples.length > 6) this.drag.samples.shift();
      if (this.drag.moved > 3) this.panBy(dx * DRAG_SENSITIVITY, dy * DRAG_SENSITIVITY);
    },

    onUp: function (e, cancelled) {
      if (!this.pointers.has(e.pointerId)) return;
      var wasDrag = this.drag, moved = wasDrag ? wasDrag.moved : 0;
      this._lastDragMoved = moved;
      this.pointers.delete(e.pointerId);
      if (this.pointers.size === 0) {
        this.stage.classList.remove('dragging');
        this.drag = null;
        this.pinch = null;
        if (wasDrag && moved < 6) {
          /* 视为点击 */
          var pin = e.target.closest && e.target.closest('.fm-pin');
          if (!pin && this.picking) this.applyPick(e);
        } else if (!cancelled && wasDrag && moved >= 6) {
          this.saveView();
        }
      } else if (this.pointers.size === 1) {
        this.pinch = null;
        this.drag = null;
      }
    },

    /* ---------- 6.8 底图面板 ---------- */
    togglePanel: function () {
      if (this.panelEl.hidden) this.openPanel(); else this.closePanel();
    },
    openPanel: function () {
      var self = this;
      var html = '<h4>底图</h4>' + BASEMAPS.map(function (b) {
        return '<button class="fm-layer' + (b.id === self.bmId ? ' on' : '') + '" data-bm="' + b.id + '">' +
          '<i></i>' + b.name + '<small>' + b.hint + '</small></button>';
      }).join('') +
        '<p class="fm-note">中文标准图用高德公共瓦片（GCJ-02）；其余为 WGS-84，切换时钓点位置已自动纠偏。卫星图最适合找草区、堤坝与深浅交界。</p>' +
        '<hr><h4>数据</h4><div class="fm-mini">' +
        '<button data-act="fitAll">看全部钓点</button>' +
        '<button data-act="export">导出我的</button>' +
        '<button data-act="import">导入</button></div>';
      this.panelEl.innerHTML = html;
      this.panelEl.hidden = false;

      if (!this.fileInput) {
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'application/json,.json';
        this.fileInput.style.display = 'none';
        this.fileInput.addEventListener('change', function () { self.importMine(this.files[0]); });
        this.el.appendChild(this.fileInput);
      }
      this._outside = function (e) {
        if (!self.panelEl.contains(e.target) && !e.target.closest('[data-act="layers"]')) self.closePanel();
      };
      setTimeout(function () { document.addEventListener('click', self._outside); }, 0);
    },
    closePanel: function () {
      this.panelEl.hidden = true;
      if (this._outside) { document.removeEventListener('click', this._outside); this._outside = null; }
    },
    setBasemap: function (id) {
      if (id === this.bmId) { this.closePanel(); return; }
      /* 换坐标系前，先把当前视野中心换算成 WGS-84（内部统一用 WGS-84 存储） */
      this.bmId = id;
      this.tileEls.forEach(function (el) { el.remove(); });
      this.tileEls.clear();
      this.tileFails = 0;
      this.loadingEl.classList.remove('off');
      this.zoom = clamp(this.zoom, this.minZoom(), this.maxZoom());
      this.saveView();
      this.renderMarks(true);
      this.render();
      this.closePanel();
      this.toast('已切换：' + this.bm().name);
    },

    /* ---------- 6.9 搜索 ---------- */
    search: function (q) {
      var self = this;
      q = String(q || '').trim();
      if (!q) { this.closeList(); return; }
      var lower = q.toLowerCase();
      var local = this.spots.filter(function (s) {
        return (s.name + ' ' + s.region + ' ' + (s.fish || []).join(' ') + ' ' + s.structure)
          .toLowerCase().indexOf(lower) >= 0;
      }).slice(0, 5);

      var rows = local.map(function (s) {
        var t = TYPES[s.type] || TYPES.lake;
        return '<button class="fm-list-item" data-spot="' + esc(s.id) + '">' +
          '<span class="k">' + esc(t.short) + '</span>' +
          '<span class="t">' + esc(s.name) + '</span>' +
          '<span class="s">' + esc(s.region || (fmt(s.lat) + ',' + fmt(s.lng))) + '</span></button>';
      }).join('');

      this.showList(rows + '<div class="fm-list-empty">正在搜索城市与水域…</div>');

      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(function () {
        var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(q) +
          '&count=8&language=zh&format=json&countryCode=CN';
        fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
          var res = (data && data.results) || [];
          var city = res.map(function (p) {
            return '<button class="fm-list-item" data-lat="' + p.latitude + '" data-lng="' + p.longitude +
              '" data-name="' + esc(p.name) + '">' +
              '<span class="k">城市</span><span class="t">' + esc(p.name) + '</span>' +
              '<span class="s">' + esc([p.admin1, p.country].filter(Boolean).join(' · ')) + '</span></button>';
          }).join('');
          if (!rows && !city) {
            self.showList('<div class="fm-list-empty">没有找到「' + esc(q) + '」，试试其它写法或直接在地图上点选。</div>');
          } else {
            self.showList(rows + (rows && city ? '<div class="fm-list-empty" style="padding:6px 11px">城市与水域</div>' : '') + city);
          }
        }).catch(function () {
          if (!rows) self.showList('<div class="fm-list-empty">搜索服务暂时连不上；可以先拖动地图或点「定位」。</div>');
        });
      }, 320);
    },

    showList: function (html) {
      var self = this;
      if (!this.listEl) {
        this.listEl = document.createElement('div');
        this.listEl.className = 'fm-list';
        this.inputEl.parentNode.appendChild(this.listEl);
      }
      this.listEl.innerHTML = html;
      this.listEl.querySelectorAll('.fm-list-item').forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.dataset.spot) {
            var s = self.spotById(b.dataset.spot);
            if (s) {
              self.closeList();
              self.inputEl.value = '';
              self.flyTo(s.lat, s.lng, Math.max(self.zoom, 13));
              setTimeout(function () { self.selectSpot(s.id); }, 430);
            }
          } else {
            var lat = +b.dataset.lat, lng = +b.dataset.lng;
            self.closeList();
            self.inputEl.value = b.dataset.name;
            self.flyTo(lat, lng, 11);
          }
        });
      });
    },
    closeList: function () {
      if (this.listEl) { this.listEl.remove(); this.listEl = null; }
      clearTimeout(this._searchTimer);
    },

    /* ---------- 6.10 详情卡 ---------- */
    spotById: function (id) {
      for (var i = 0; i < this.spots.length; i++) if (this.spots[i].id === id) return this.spots[i];
      return null;
    },
    selectSpot: function (id) {
      var s = this.spotById(id);
      if (!s) return;
      this.selectedId = id;
      this.marks.forEach(function (m) { if (m.el.classList) m.el.classList.toggle('active', m.id === id); });
      var t = TYPES[s.type] || TYPES.lake;
      var rows = [];
      if (s.structure) rows.push(['结构', s.structure]);
      if (s.access) rows.push(['交通', s.access]);
      if (s.best) rows.push(['时段', s.best]);
      if (s.note) rows.push(['提示', s.note]);
      rows.push(['坐标', fmt(s.lat) + ' , ' + fmt(s.lng)]);

      this.sheetEl.innerHTML =
        '<div class="fm-sheet-head"><div class="tt"><div class="kind">' + esc(t.label) +
          (s.mine ? ' · 我的钓点' : '') + '</div><h3>' + esc(s.name) + '</h3></div>' +
          '<button class="close" data-act="closeSheet" aria-label="关闭">✕</button></div>' +
        '<div class="fm-tags">' +
          (s.fish || []).slice(0, 4).map(function (f) { return '<span class="fm-tag k">' + esc(f) + '</span>'; }).join('') +
          (s.region ? '<span class="fm-tag">' + esc(s.region) + '</span>' : '') +
        '</div>' +
        '<dl class="fm-rows">' + rows.map(function (r) {
          return '<div class="fm-row"><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>';
        }).join('') + '</dl>' +
        '<div class="fm-links">' +
          '<a href="https://uri.amap.com/marker?position=' + s.lng + ',' + s.lat +
            '&name=' + encodeURIComponent(s.name) + '&coordinate=wgs84&callnative=0" target="_blank" rel="noreferrer">高德导航 ↗</a>' +
          '<a href="https://api.map.baidu.com/marker?location=' + s.lat + ',' + s.lng +
            '&title=' + encodeURIComponent(s.name) + '&content=' + encodeURIComponent(s.name) +
            '&output=html&coord_type=wgs84&zoom=15" target="_blank" rel="noreferrer">百度地图 ↗</a>' +
          '<a href="#" data-act="copyCoord">复制坐标</a>' +
        '</div>' +
        '<div class="fm-sheet-foot">' +
          '<button data-act="spotWeather">查此地天气</button>' +
          '<button class="alt" data-act="spotLure">按此点选饵</button>' +
          (s.mine ? '<button class="danger" data-act="delSpot">删除</button>' : '') +
        '</div>' +
        (s.demo ? '<p class="fm-demo-note">示例数据：坐标为水域大致位置（±1–3 km）。出钓前请核对实际岸线、是否允许垂钓及当地禁渔期规定。</p>' : '');

      this.sheetEl.classList.add('on');
      this.currentSpot = s;
      /* 钓点被详情卡挡住时，把地图向左轻推，让图钉露出来 */
      if (this.vw > 760) {
        var d = this.disp(s.lat, s.lng);
        var w = project(d[0], d[1], this.zoom);
        var c = this.disp(this.center.lat, this.center.lng);
        var cw = project(c[0], c[1], this.zoom);
        var x = w[0] - cw[0] + this.vw / 2;
        var y = w[1] - cw[1] + this.vh / 2;
        if (x > this.vw - 400) this.panBy(-(x - (this.vw - 430)), 0);
        else if (x < 40) this.panBy(40 - x, 0);
        if (y > this.vh - 60) this.panBy(0, -(y - (this.vh - 90)));
      }
      this.renderMarks();
    },
    closeSheet: function () {
      this.sheetEl.classList.remove('on');
      this.selectedId = null;
      this.currentSpot = null;
      this.marks.forEach(function (m) { if (m.el.classList) m.el.classList.remove('active'); });
      this.marksVer = (this.marksVer || 0) + 1;
      this.renderMarks(true);
      this.positionMarks();
    },

    /* ---------- 6.11 与站点联动 ---------- */
    hooks: function () {
      return (typeof window !== 'undefined' && window.LureSiteHooks) ? window.LureSiteHooks : null;
    },
    spotWeather: function () {
      var s = this.currentSpot;
      if (!s) return;
      var detail = {
        lat: s.lat, lng: s.lng, name: s.name,
        type: s.type, water: (TYPES[s.type] || TYPES.lake).water
      };
      var h = this.hooks();
      if (h && typeof h.showSpotWeather === 'function') {
        h.showSpotWeather(detail);
        this.toast('已切换到天气面板：' + s.name);
        return;
      }
      var ev = new CustomEvent('fishingmap:weather', { detail: detail, cancelable: true });
      document.dispatchEvent(ev);
      if (ev.defaultPrevented) this.toast('已切换到天气面板');
      else this.toast('站点还没接入联动：在 app.js 末尾加入 LureSiteHooks（见接入指南）');
    },
    spotLure: function () {
      var s = this.currentSpot;
      if (!s) return;
      var detail = {
        fishName: (s.fish || [])[0] || '',
        water: (TYPES[s.type] || TYPES.lake).water,
        spotName: s.name, lat: s.lat, lng: s.lng
      };
      var h = this.hooks();
      if (h && typeof h.showSpotLure === 'function') {
        h.showSpotLure(detail);
        this.toast('已带入选饵建议：' + ((s.fish || [])[0] || '按水域'));
        return;
      }
      var ev = new CustomEvent('fishingmap:lure', { detail: detail, cancelable: true });
      document.dispatchEvent(ev);
      if (ev.defaultPrevented) this.toast('已带入选饵建议');
      else this.toast('站点还没接入联动：在 app.js 末尾加入 LureSiteHooks（见接入指南）');
    },
    copyCoord: function () {
      var s = this.currentSpot;
      if (!s) return;
      var text = fmt(s.lat) + ',' + fmt(s.lng);
      var done = function () { this.toast('已复制坐标 ' + text); }.bind(this);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        ta.remove(); done();
      }
    },

    /* ---------- 6.12 添加 / 删除 / 导入导出 ---------- */
    startPick: function () {
      this.picking = true;
      this.stage.style.cursor = 'crosshair';
      this.hint('在地图上点一下，放你的钓点（Esc 取消）', 0);
    },
    cancelPick: function () {
      if (!this.picking) return;
      this.picking = false;
      this.stage.style.cursor = '';
      this.hintEl.classList.remove('on');
    },
    applyPick: function (e) {
      if (!this.picking) return;
      var r = this.stage.getBoundingClientRect();
      var ll = this.screenToLatLng(e.clientX - r.left, e.clientY - r.top);
      this.cancelPick();
      this.openForm(ll);
    },
    openForm: function (ll) {
      this.formEl.querySelector('.f-coord').textContent = fmt(ll.lat) + ' , ' + fmt(ll.lng);
      this.formEl.dataset.lat = ll.lat;
      this.formEl.dataset.lng = ll.lng;
      this.formEl.reset();
      this.modalEl.classList.add('on');
      var n = this.formEl.querySelector('[name=name]');
      if (n) setTimeout(function () { n.focus(); }, 60);
    },
    closeForm: function () {
      this.modalEl.classList.remove('on');
      this.cancelPick();
    },
    saveSpot: function () {
      var f = this.formEl;
      var name = (f.querySelector('[name=name]').value || '').trim();
      if (!name) { this.toast('先给钓点起个名字'); f.querySelector('[name=name]').focus(); return; }
      var lat = +f.dataset.lat, lng = +f.dataset.lng;
      if (!isFinite(lat) || !isFinite(lng)) { this.toast('坐标无效，请重新点选'); return; }
      var fishVal = f.querySelector('[name=fish]').value;
      var spot = normalize({
        id: 'u' + Date.now().toString(36),
        name: name,
        type: f.querySelector('[name=type]').value,
        lat: lat, lng: lng,
        fish: fishVal ? [fishVal] : [],
        structure: f.querySelector('[name=structure]').value,
        best: f.querySelector('[name=best]').value,
        access: f.querySelector('[name=access]').value,
        note: f.querySelector('[name=note]').value,
        region: '我的标记',
        mine: true,
        updated: nowStr()
      });
      this.mine.push(spot);
      this.writeMine();
      this.spots.push(spot);
      this.marksVer = (this.marksVer || 0) + 1;
      this.closeForm();
      this.renderChips();
      this.setFilter(this.filter === 'all' ? 'mine' : this.filter);
      this.flyTo(spot.lat, spot.lng, Math.max(this.zoom, 13));
      setTimeout(this.selectSpot.bind(this, spot.id), 460);
      this.toast('已保存：' + name);
    },
    deleteSpot: function () {
      var s = this.currentSpot;
      if (!s || !s.mine) return;
      if (!window.confirm('删除钓点「' + s.name + '」？')) return;
      this.spots = this.spots.filter(function (x) { return x.id !== s.id; });
      this.mine = this.mine.filter(function (x) { return x.id !== s.id; });
      this.writeMine();
      this.marksVer = (this.marksVer || 0) + 1;
      this.closeSheet();
      this.renderChips();
      this.renderMarks(true);
      this.toast('已删除');
    },

    readMine: function () {
      try {
        var raw = localStorage.getItem(this.storageKey);
        if (!raw) return;
        var arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          this.mine = arr.map(normalize).map(function (s) { s.mine = true; return s; });
          this.spots = this.spots.concat(this.mine);
        }
      } catch (e) {}
    },
    writeMine: function () {
      try { localStorage.setItem(this.storageKey, JSON.stringify(this.mine)); } catch (e) {}
    },
    exportMine: function () {
      if (!this.mine.length) { this.toast('「我的钓点」还是空的'); return; }
      var blob = new Blob([JSON.stringify(this.mine, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = '我的钓点-' + nowStr() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
      this.toast('已导出 ' + this.mine.length + ' 个钓点');
    },
    importMine: function (file) {
      if (!file) return;
      var self = this;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var arr = JSON.parse(String(fr.result));
          if (!Array.isArray(arr)) throw new Error('格式不对');
          var added = 0;
          arr.forEach(function (s) {
            var n = normalize(s);
            if (!isFinite(n.lat) || !isFinite(n.lng)) return;
            n.mine = true;
            if (self.mine.some(function (x) { return x.id === n.id; })) return;
            self.mine.push(n); self.spots.push(n); added++;
          });
          self.writeMine();
          self.marksVer = (self.marksVer || 0) + 1;
          self.renderChips();
          self.renderMarks(true);
          self.toast(added ? ('已导入 ' + added + ' 个钓点') : '没有新钓点可导入');
        } catch (e) { self.toast('导入失败：文件不是本模块导出的 JSON'); }
      };
      fr.readAsText(file);
    },

    /* ---------- 6.13 定位 ---------- */
    locate: function () {
      var self = this;
      if (this._me) { this._me.remove(); this._me = null; }
      if (!navigator.geolocation) { this.toast('此浏览器不支持定位'); return; }
      this.toast('正在获取位置…');
      navigator.geolocation.getCurrentPosition(function (pos) {
        var lat = pos.coords.latitude, lng = pos.coords.longitude;
        var me = document.createElement('div');
        me.className = 'fm-me';
        self.stage.appendChild(me);
        self._me = me;
        self._meLat = lat; self._meLng = lng;
        self.flyTo(lat, lng, 13);
        self.positionMarks();
        self.toast('已定位到当前位置（约 ' + fmt(lat) + ',' + fmt(lng) + '）');
      }, function (err) {
        self.toast(err && err.code === 1 ? '未获得定位权限，可直接拖动地图或搜索城市' : '定位失败，可搜索城市名字');
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 });
    },

    /* ---------- 6.14 视野记忆 ---------- */
    saveView: function () {
      var self = this;
      clearTimeout(this._sv);
      this._sv = setTimeout(function () {
        try {
          localStorage.setItem(self.viewKey, JSON.stringify({
            lat: self.center.lat, lng: self.center.lng, zoom: self.zoom, bm: self.bmId
          }));
        } catch (e) {}
      }, 600);
    },
    restoreView: function () {
      try {
        var v = JSON.parse(localStorage.getItem(this.viewKey) || 'null');
        if (v && isFinite(v.lat) && isFinite(v.lng) && isFinite(v.zoom)) {
          if (v.bm) this.bmId = v.bm;
          this.center = { lat: v.lat, lng: v.lng };
          this.zoom = clamp(v.zoom, this.minZoom(), this.maxZoom());
          return;
        }
      } catch (e) {}
      var spots = this.visibleSpots();
      if (spots.length) {
        this.fitSpots(spots);
        /* 全国撒点时不要一上来缩到亚洲范围，给一个舒服的起步比例 */
        if (this.zoom < 4.2) this.zoom = 4.2;
      }
    },
    loadGeolocationOnStart: function () {
      /* 首次进入不弹权限；仅当 URL 带 ?locate=1 时自动定位 */
      if (/[?&]locate=1/.test(location.search)) this.locate();
    },

    /* ---------- 6.15 外部数据 ---------- */
    loadExternal: function () {
      var url = this.opts.spotsUrl || this.el.getAttribute('data-spots');
      if (!url) return;
      var self = this;
      fetch(url, { cache: 'no-cache' }).then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (arr) {
        if (!Array.isArray(arr) || !arr.length) return;
        var keep = self.mine.slice();
        self.spots = arr.map(normalize).filter(function (s) { return isFinite(s.lat) && isFinite(s.lng); })
          .concat(keep);
        self.marksVer = (self.marksVer || 0) + 1;
        self.renderChips();
        self.renderMarks(true);
      }).catch(function () { /* file:// 下会失败，忽略即可 */ });
    },

    /* ---------- 6.16 杂项 ---------- */
    hint: function (text, ms) {
      var self = this;
      this.hintEl.textContent = text;
      this.hintEl.classList.add('on');
      clearTimeout(this._hintT);
      if (ms) this._hintT = setTimeout(function () { self.hintEl.classList.remove('on'); }, ms);
    },
    toast: function (text) {
      var self = this;
      this.toastEl.textContent = text;
      this.toastEl.classList.add('on');
      clearTimeout(this._toastT);
      this._toastT = setTimeout(function () { self.toastEl.classList.remove('on'); }, 2600);
    },
    destroy: function () {
      this._destroyed = true;
      this.cancelAnim();
      if (this._ro) this._ro.disconnect();
      this.el.innerHTML = '';
      this.el.__fishingMap = null;
    }
  };

  function tileUrl(bm, x, y, z) {
    var url = bm.url;
    if (bm.subs && bm.subs.length) url = url.replace('{s}', bm.subs[(x + y) % bm.subs.length]);
    else url = url.replace('{s}', '');
    return url.replace('{z}', z).replace('{x}', x).replace('{y}', y);
  }

  function boundsOf(map, list) {
    if (!list.length) return null;
    var minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    list.forEach(function (s) {
      var d = map.disp(s.lat, s.lng);
      minLat = Math.min(minLat, d[0]); maxLat = Math.max(maxLat, d[0]);
      minLng = Math.min(minLng, d[1]); maxLng = Math.max(maxLng, d[1]);
    });
    return { minLat: minLat, maxLat: maxLat, minLng: minLng, maxLng: maxLng };
  }

  /* =========================================================
     7. 对外接口
     ========================================================= */
  function mount(target, options) {
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) { console.warn('[FishingMap] 找不到容器：' + target); return null; }
    if (el.__fishingMap) return el.__fishingMap;
    return new FishingMap(el, options || readDataAttrs(el));
  }

  function readDataAttrs(el) {
    var o = {};
    ['basemap', 'spots', 'center', 'zoom'].forEach(function (k) {
      if (el.getAttribute('data-' + k)) o[k] = el.getAttribute('data-' + k);
    });
    if (o.spots) { o.spotsUrl = o.spots; delete o.spots; }
    return o;
  }

  function autoMount() {
    var nodes = document.querySelectorAll('[data-fishing-map], #fishingMap');
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  window.FishingMap = {
    version: VERSION,
    mount: mount,
    SEED: SEED,
    TYPES: TYPES,
    FISH_NAMES: FISH_NAMES,
    basemaps: BASEMAPS,
    wgs2gcj: wgs2gcj,
    gcj2wgs: gcj2wgs
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }
})();
